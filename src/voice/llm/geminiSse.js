/* Parser for Gemini's `streamGenerateContent?alt=sse` responses.

   Ported from the io-chat-gemini branch's llmClient.js and extended:
   - the leftover buffer after the stream ends is parsed too
   - function-call parts are surfaced (the tutor's tools travel this way)
   - finishReason and prompt blocks are events, not thrown errors, so text
     that already streamed is never discarded

   Runs in the browser and in Node (plain ESM, no globals at import time).

   Events yielded:
     { type: 'text', text }
     { type: 'functionCall', id, name, args }
     { type: 'finish', reason }          STOP | MAX_TOKENS | SAFETY | RECITATION | OTHER | …
     { type: 'blocked', reason }         promptFeedback.blockReason
     { type: 'usage', usage }            usageMetadata, when present */

export async function* parseGeminiSse(body) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() // keep the (possibly partial) last line
      for (const line of lines) yield* eventsFromLine(line)
    }
    buffer += decoder.decode() // flush any trailing multibyte sequence
    if (buffer.trim()) yield* eventsFromLine(buffer)
  } finally {
    reader.releaseLock?.()
  }
}

/* One SSE line → zero or more events. Lines that are not `data:` (event
   names, comments, blanks) carry nothing for this API. */
export function* eventsFromLine(line) {
  const trimmed = line.trim()
  if (!trimmed.startsWith('data:')) return
  const payload = trimmed.slice(5).trim()
  if (!payload || payload === '[DONE]') return
  let data
  try {
    data = JSON.parse(payload)
  } catch {
    return // a malformed line is dropped; the next line starts clean
  }
  yield* eventsFromChunk(data)
}

/* One parsed JSON chunk → events (also used by the non-streaming call). */
export function* eventsFromChunk(data) {
  if (data?.promptFeedback?.blockReason) yield { type: 'blocked', reason: data.promptFeedback.blockReason }
  const cand = data?.candidates?.[0]
  for (const part of cand?.content?.parts || []) {
    if (typeof part.text === 'string' && part.text) yield { type: 'text', text: part.text }
    if (part.functionCall) {
      yield {
        type: 'functionCall',
        id: part.functionCall.id,
        name: part.functionCall.name,
        args: part.functionCall.args || {},
      }
    }
  }
  if (cand?.finishReason) yield { type: 'finish', reason: cand.finishReason }
  if (data?.usageMetadata) yield { type: 'usage', usage: data.usageMetadata }
}

/* Convenience: collect a whole stream into { text, functionCalls, finish, blocked, usage }. */
export async function collectEvents(events) {
  const out = { text: '', functionCalls: [], finish: null, blocked: null, usage: null }
  for await (const e of events) {
    if (e.type === 'text') out.text += e.text
    else if (e.type === 'functionCall') out.functionCalls.push(e)
    else if (e.type === 'finish') out.finish = e.reason
    else if (e.type === 'blocked') out.blocked = e.reason
    else if (e.type === 'usage') out.usage = e.usage
  }
  return out
}
