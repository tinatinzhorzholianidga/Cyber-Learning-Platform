/* The turn pipeline shared by the browser and turn sessions (ported from
   the chat branch's useIoChat.js, docs/io-voice-plan.md §4.2, §5.5):
   a rolling window of recent turns, a generation counter so a superseded
   answer never touches the history, an AbortController per answer, and
   one place that maps transport errors to voice.* strings. The backend is
   Gemini (llm/geminiDirect.js) or a local OpenAI-compatible endpoint
   (llm/openaiCompatible.js), chosen by VITE_IO_LLM (§5.4). */
import * as gemini from '../llm/geminiDirect.js'
import * as local from '../llm/openaiCompatible.js'
import { resolveKey } from '../auth/devKey.js'

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {}

/* Explicit safety settings for Gemini (Q1 in the plan): the usual
   categories at medium, dangerous content at high only, because the
   lessons talk about attacks in order to defend against them. */
export const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
]

export function chatConfig(env = ENV) {
  if (env.VITE_IO_LLM === 'openai') {
    return { backend: 'openai', base: env.VITE_IO_LLM_BASE || local.DEFAULT_BASE, model: env.VITE_IO_LLM_MODEL || local.DEFAULT_MODEL }
  }
  return { backend: 'gemini', model: env.VITE_IO_CHAT_MODEL || 'gemini-3.8-flash' }
}

/* Transport error → voice.* key (null = nothing to show). */
export function errorKeyOf(err) {
  const code = err?.code || ''
  if (code === 'ABORTED' || err?.name === 'AbortError') return null
  if (code === 'BAD_KEY' || code === 'FORBIDDEN') return 'errKey'
  if (code === 'RATE_LIMITED') return 'errRateLimit'
  if (code === 'LOCAL_UNREACHABLE') return 'errBackend'
  if (code === 'BLOCKED') return 'errSafety'
  if (code === 'EMPTY') return 'errEmpty'
  return 'errSocket'
}

/* A per-minute 429 is worth one wait; a daily quota is not. */
export function retryDelayFor(err, capMs = 12000) {
  if (err?.code !== 'RATE_LIMITED') return 0
  const quota = (err.quota || []).join(' ')
  if (/PerDay|Daily/i.test(quota)) return 0
  const ms = err.retryAfterMs || 5000
  return ms <= capMs ? ms : 0
}

/* History must start with a user turn and alternate roles. */
export function normalise(turns) {
  const out = []
  for (const t of turns) {
    const role = t.role === 'model' || t.role === 'assistant' ? 'assistant' : 'user'
    const content = String(t.content ?? '').trim()
    if (!content) continue
    if (!out.length && role !== 'user') continue
    const last = out[out.length - 1]
    if (last && last.role === role) last.content = `${last.content}\n${content}`
    else out.push({ role, content })
  }
  return out
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* createChat({ system, config?, apiKey?, maxTurns? })
     ask(text, { onText }) → { text, finish, aborted }   streams one answer
     abort()                                           stops the current answer
     reset()                                           forgets the history
   A new ask() supersedes a running one. An answer cut off by abort()
   stays in the history with a marker, so IO knows what was heard. */
export function createChat({ system, config = chatConfig(), apiKey = null, maxTurns = 8, tools = null, retry = true } = {}) {
  let history = []
  let gen = 0
  let asks = 0
  let controller = null

  const stream = (window, signal) => {
    if (config.backend === 'openai') {
      return local.streamChat({ base: config.base, model: config.model, system, history: window, signal })
    }
    return gemini.streamChat({
      apiKey: apiKey || resolveKey(),
      model: config.model,
      system,
      history: window,
      safetySettings: SAFETY_SETTINGS,
      tools: tools || undefined,
      maxOutputTokens: 400,
      signal,
    })
  }

  async function run(window, my, onText) {
    let acc = ''
    let finish = null
    let blocked = null
    for await (const ev of stream(window, controller.signal)) {
      if (gen !== my) break
      if (ev.type === 'text') {
        acc += ev.text
        onText?.(ev.text, acc)
      } else if (ev.type === 'finish') finish = ev.reason
      else if (ev.type === 'blocked') blocked = ev.reason
      // functionCall events arrive with the tools in D5
    }
    return { acc, finish, blocked }
  }

  async function ask(text, { onText } = {}) {
    const my = ++gen
    const askId = ++asks
    controller?.abort()
    controller = new AbortController()
    const userTurn = { role: 'user', content: String(text || '').trim() }
    const window = normalise([...history, userTurn]).slice(-maxTurns)
    let acc = ''
    try {
      let result
      try {
        result = await run(window, my, (delta, all) => {
          acc = all
          onText?.(delta, all)
        })
      } catch (err) {
        const wait = retry ? retryDelayFor(err) : 0
        if (!wait || gen !== my || acc) throw err
        await sleep(wait)
        if (gen !== my) return { text: '', aborted: true }
        result = await run(window, my, (delta, all) => {
          acc = all
          onText?.(delta, all)
        })
      }
      if (gen !== my) return { text: acc, aborted: true }
      if (result.blocked || result.finish === 'SAFETY') throw Object.assign(new Error('blocked'), { code: 'BLOCKED' })
      if (!result.acc.trim()) throw Object.assign(new Error('empty answer'), { code: 'EMPTY' })
      history = [...history, userTurn, { role: 'assistant', content: result.acc }].slice(-2 * maxTurns)
      return { text: result.acc, finish: result.finish, aborted: false }
    } catch (err) {
      const aborted = gen !== my || err?.code === 'ABORTED' || err?.name === 'AbortError'
      if (aborted) {
        // keep what was said when this answer was interrupted (not replaced by a newer question)
        if (acc.trim() && asks === askId) history = [...history, userTurn, { role: 'assistant', content: `${acc.trim()} …` }].slice(-2 * maxTurns)
        return { text: acc, aborted: true }
      }
      throw err
    }
  }

  return {
    ask,
    abort() {
      gen += 1
      controller?.abort()
    },
    reset() {
      this.abort()
      history = []
    },
    get history() {
      return history
    },
    config,
  }
}
