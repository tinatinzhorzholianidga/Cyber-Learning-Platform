/* Gemini API called straight from the browser (Track D) or from Node
   scripts. The key travels in the `x-goog-api-key` header, never in the
   URL. Where the key comes from is decided elsewhere (src/voice/auth):
   this module only makes requests.

   Track P swaps this module for llm/workerProxy.js; the event shape is
   the same (see geminiSse.js). */
import { parseGeminiSse, eventsFromChunk } from './geminiSse.js'

export const GEMINI_API = 'https://generativelanguage.googleapis.com'

export class GeminiError extends Error {
  constructor(code, message, extra = {}) {
    super(message || code)
    this.name = 'GeminiError'
    this.code = code // BAD_KEY | FORBIDDEN | MODEL_NOT_FOUND | RATE_LIMITED | UPSTREAM | HTTP_<n> | NETWORK | ABORTED
    Object.assign(this, extra)
  }
}

/* Map an error response to a stable code. `body` is the parsed JSON error
   (or null). 429 bodies carry the quota metric and a retry delay that the
   smoke script prints and the sessions honour. */
export function mapGeminiError(status, body) {
  const message = body?.error?.message || ''
  const details = body?.error?.details || []
  const retry = details.find((d) => d.retryDelay)?.retryDelay
  const retryAfterMs = retry ? Math.round(parseFloat(retry) * 1000) : undefined
  const quota = details.find((d) => Array.isArray(d.violations))?.violations?.map((v) => v.quotaId || v.quotaMetric).filter(Boolean)
  if (status === 400 && /API key/i.test(message)) return { code: 'BAD_KEY', message }
  if (status === 401) return { code: 'BAD_KEY', message }
  if (status === 403) return { code: 'FORBIDDEN', message }
  if (status === 404) return { code: 'MODEL_NOT_FOUND', message }
  if (status === 429) return { code: 'RATE_LIMITED', message, retryAfterMs, quota }
  if (status >= 500) return { code: 'UPSTREAM', message }
  return { code: `HTTP_${status}`, message }
}

async function readError(res) {
  let body = null
  try {
    body = await res.json()
  } catch {
    /* not JSON */
  }
  const m = mapGeminiError(res.status, body)
  return new GeminiError(m.code, m.message ? `${m.code}: ${m.message}` : m.code, { status: res.status, ...m })
}

async function post({ apiKey, apiBase = GEMINI_API, apiVersion = 'v1beta', path, body, signal }) {
  if (!apiKey) throw new GeminiError('BAD_KEY', 'no API key')
  let res
  try {
    res = await fetch(`${apiBase}/${apiVersion}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw new GeminiError('ABORTED', 'aborted')
    throw new GeminiError('NETWORK', String(err?.message || err))
  }
  if (!res.ok) throw await readError(res)
  return res
}

/* Chat history items are either { role: 'user'|'assistant', content } (the
   useIoChat shape) or { role: 'user'|'model', parts } (function-call turns). */
export function toContents(history) {
  return (history || []).map((m) =>
    m.parts ? { role: m.role === 'assistant' ? 'model' : m.role, parts: m.parts }
      : { role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] },
  )
}

function buildBody({ system, history, tools, safetySettings, temperature = 0.6, maxOutputTokens = 400, generationConfig }) {
  const body = {
    contents: toContents(history),
    generationConfig: { temperature, maxOutputTokens, ...(generationConfig || {}) },
  }
  if (system) body.systemInstruction = { parts: [{ text: system }] }
  if (tools?.length) body.tools = tools
  if (safetySettings?.length) body.safetySettings = safetySettings
  return body
}

/* Streamed chat: an async iterator of geminiSse events. */
export async function* streamChat({ apiKey, model, apiBase, apiVersion, signal, ...rest }) {
  const res = await post({
    apiKey, apiBase, apiVersion, signal,
    path: `models/${model}:streamGenerateContent?alt=sse`,
    body: buildBody(rest),
  })
  yield* parseGeminiSse(res.body)
}

/* One non-streamed request (smoke tests, short utility calls). */
export async function generateOnce({ apiKey, model, apiBase, apiVersion, signal, ...rest }) {
  const res = await post({ apiKey, apiBase, apiVersion, signal, path: `models/${model}:generateContent`, body: buildBody(rest) })
  const data = await res.json()
  const out = { text: '', functionCalls: [], finish: null, blocked: null, usage: null, raw: data }
  for (const e of eventsFromChunk(data)) {
    if (e.type === 'text') out.text += e.text
    else if (e.type === 'functionCall') out.functionCalls.push(e)
    else if (e.type === 'finish') out.finish = e.reason
    else if (e.type === 'blocked') out.blocked = e.reason
    else if (e.type === 'usage') out.usage = e.usage
  }
  return out
}

/* Streamed text-to-speech: yields { mimeType, bytes } chunks of raw PCM16
   (24 kHz mono) for the turn session and the bake-off. */
export async function* streamSpeech({ apiKey, model, text, voiceName, apiBase, apiVersion, signal }) {
  const res = await post({
    apiKey, apiBase, apiVersion, signal,
    path: `models/${model}:streamGenerateContent?alt=sse`,
    body: {
      contents: [{ role: 'user', parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
    },
  })
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  const chunksFrom = function* (line) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) return
    let data
    try {
      data = JSON.parse(trimmed.slice(5))
    } catch {
      return
    }
    if (data?.promptFeedback?.blockReason) throw new GeminiError('BLOCKED', data.promptFeedback.blockReason)
    for (const part of data?.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) yield { mimeType: part.inlineData.mimeType || '', bytes: base64ToBytes(part.inlineData.data) }
    }
  }
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) yield* chunksFrom(line)
  }
  buffer += decoder.decode()
  if (buffer.trim()) yield* chunksFrom(buffer)
}

/* Model metadata (`GET models/<id>`), used by the smoke script. */
export async function getModel({ apiKey, model, apiBase = GEMINI_API, apiVersion = 'v1beta', signal }) {
  const res = await fetch(`${apiBase}/${apiVersion}/models/${model}`, { headers: { 'x-goog-api-key': apiKey }, signal })
  if (!res.ok) throw await readError(res)
  return res.json()
}

export function base64ToBytes(b64) {
  if (typeof Buffer !== 'undefined' && typeof atob === 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'))
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

/* The sample rate of a Gemini audio part: "audio/l16; rate=24000; channels=1" → 24000. */
export function sampleRateOf(mimeType) {
  const m = /rate=(\d+)/.exec(mimeType || '')
  return m ? Number(m[1]) : 24000
}
