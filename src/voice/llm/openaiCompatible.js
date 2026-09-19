/* A local OpenAI-compatible chat endpoint (Ollama by default) behind the
   same event shape as geminiDirect.js. Used when the Gemini free tier is
   unavailable (docs/io-voice-plan.md §5.4). Tool calls on this path use a
   text convention handled by the session, not by this transport. */

export const DEFAULT_BASE = 'http://localhost:11434/v1'
export const DEFAULT_MODEL = 'gemma3'

export class LocalLlmError extends Error {
  constructor(code, message) {
    super(message || code)
    this.name = 'LocalLlmError'
    this.code = code // LOCAL_UNREACHABLE | HTTP_<n> | ABORTED
  }
}

function toMessages(system, history) {
  const messages = []
  if (system) messages.push({ role: 'system', content: system })
  for (const m of history || []) {
    if (m.parts) {
      const text = m.parts.map((p) => p.text || '').join('')
      if (text) messages.push({ role: m.role === 'model' ? 'assistant' : 'user', content: text })
    } else {
      messages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })
    }
  }
  return messages
}

/* Streamed chat → events { type: 'text' | 'finish' }. */
export async function* streamChat({
  base = DEFAULT_BASE, model = DEFAULT_MODEL, apiKey, system, history, temperature = 0.6, maxTokens = 400, signal,
}) {
  let res
  try {
    res = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
      body: JSON.stringify({ model, stream: true, messages: toMessages(system, history), temperature, max_tokens: maxTokens }),
      signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw new LocalLlmError('ABORTED', 'aborted')
    throw new LocalLlmError('LOCAL_UNREACHABLE', `cannot reach ${base}: ${err?.message || err}`)
  }
  if (!res.ok) throw new LocalLlmError(`HTTP_${res.status}`, await res.text().catch(() => ''))

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  const eventsFrom = function* (line) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) return
    const payload = trimmed.slice(5).trim()
    if (!payload) return
    if (payload === '[DONE]') {
      yield { type: 'finish', reason: 'STOP' }
      return
    }
    let data
    try {
      data = JSON.parse(payload)
    } catch {
      return
    }
    const choice = data?.choices?.[0]
    const text = choice?.delta?.content
    if (text) yield { type: 'text', text }
    if (choice?.finish_reason) yield { type: 'finish', reason: choice.finish_reason === 'length' ? 'MAX_TOKENS' : 'STOP' }
  }
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) yield* eventsFrom(line)
  }
  buffer += decoder.decode()
  if (buffer.trim()) yield* eventsFrom(buffer)
}

/* Is the local endpoint up? Resolves to the model list or throws. */
export async function ping({ base = DEFAULT_BASE, signal } = {}) {
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/models`, { signal })
    if (!res.ok) throw new LocalLlmError(`HTTP_${res.status}`)
    const data = await res.json()
    return (data?.data || []).map((m) => m.id)
  } catch (err) {
    if (err instanceof LocalLlmError) throw err
    throw new LocalLlmError('LOCAL_UNREACHABLE', `cannot reach ${base}: ${err?.message || err}`)
  }
}
