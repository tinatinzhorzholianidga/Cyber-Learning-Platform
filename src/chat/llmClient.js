/* IO Chat LLM client - Google Gemini API.
   The model runs on Google's servers (not in the browser), which gives
   IO much stronger Georgian than the in-browser option.

   API key resolution, in order:
     1. import.meta.env.VITE_GEMINI_API_KEY  - from .env.local, for local
        `npm run dev`. NEVER commit this file (it is gitignored).
     2. localStorage 'cyberhero.gemini.key'  - a key the tester pastes
        into the page at runtime. Lets the DEPLOYED demo work without
        baking a key into the public bundle.
   Prefer the env var; fall back to the runtime key. */

const RUNTIME_KEY = 'cyberhero.gemini.key'

export function hasEnvKey() {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY)
}

export function getApiKey() {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY
  if (envKey) return envKey
  try {
    return localStorage.getItem(RUNTIME_KEY) || ''
  } catch {
    return ''
  }
}

export function setRuntimeKey(key) {
  try {
    if (key) localStorage.setItem(RUNTIME_KEY, key.trim())
    else localStorage.removeItem(RUNTIME_KEY)
  } catch {
    /* private mode - key just won't persist */
  }
}

/* Gemini models to offer. Flash is fast, cheap and multilingual (good
   Georgian) - the right default for a chat helper. */
export const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', note: 'fast · strong Georgian' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', note: 'newer · higher quality' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', note: 'fallback' },
]

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'

/* Async generator that yields text chunks as Gemini streams them.
   `history` is our message list ({role:'user'|'assistant', content}). */
export async function* streamGemini({ model, system, history, signal, temperature = 0.6 }) {
  const key = getApiKey()
  if (!key) throw new Error('NO_KEY')

  const url = `${ENDPOINT}/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: { temperature, maxOutputTokens: 600 },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) {
    let detail = ''
    try {
      const j = await res.json()
      detail = j?.error?.message || ''
    } catch {
      /* ignore */
    }
    if (res.status === 400 && /API key/i.test(detail)) throw new Error('BAD_KEY')
    if (res.status === 404) throw new Error(`MODEL_NOT_FOUND: ${model}`)
    throw new Error(`HTTP ${res.status}${detail ? ` - ${detail}` : ''}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let blocked = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() // keep the (possibly partial) last line
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (!payload || payload === '[DONE]') continue
      let data
      try {
        data = JSON.parse(payload)
      } catch {
        continue // rare split JSON - stays buffered next round
      }
      const cand = data?.candidates?.[0]
      if (cand?.finishReason === 'SAFETY' || data?.promptFeedback?.blockReason) blocked = true
      const text = cand?.content?.parts?.map((p) => p.text || '').join('') || ''
      if (text) yield text
    }
  }

  if (blocked) throw new Error('SAFETY_BLOCK')
}
