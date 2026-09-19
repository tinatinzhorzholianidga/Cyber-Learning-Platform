/* The turn pipeline shared by the browser and turn sessions (ported from
   the chat branch's useIoChat.js, docs/io-voice-plan.md §4.2, §5.5, §5.6):
   a rolling window of recent turns, a generation counter so a superseded
   answer never touches the history, an AbortController per answer, the
   tool loop (a function-call part ends the text stream, the handler
   runs, a second call continues), and one place that maps transport
   errors to voice.* strings. The backend is Gemini (llm/geminiDirect.js,
   native function calling) or a local OpenAI-compatible endpoint
   (llm/openaiCompatible.js, the @@tool text convention), chosen by
   VITE_IO_LLM (§5.4). */
import * as gemini from '../llm/geminiDirect.js'
import * as local from '../llm/openaiCompatible.js'
import { resolveKey } from '../auth/devKey.js'
import { splitToolTags } from '../tutor/tools.js'

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {}
const MAX_TOOL_ROUNDS = 3

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

/* History must start with a user turn and alternate roles. Items with
   `parts` (function calls and responses) pass through unchanged. */
export function normalise(turns) {
  const out = []
  for (const t of turns) {
    const role = t.role === 'model' || t.role === 'assistant' ? 'assistant' : 'user'
    if (t.parts) {
      if (!out.length && role !== 'user') continue
      out.push({ role, parts: t.parts })
      continue
    }
    const content = String(t.content ?? '').trim()
    if (!content) continue
    if (!out.length && role !== 'user') continue
    const last = out[out.length - 1]
    if (last && last.role === role && !last.parts) last.content = `${last.content}\n${content}`
    else out.push({ role, content })
  }
  return out
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* createChat({ system, config?, apiKey?, maxTurns?, tools?, onToolCall?, retry? })
     ask(text, { onText, extraSystem }) → { text, finish, aborted, calls }
     abort()                               stops the current answer
     reset()                               forgets the history
   A new ask() supersedes a running one. An answer cut off by abort()
   stays in the history with a marker, so IO knows what was heard.
   onToolCall(name, args) → response object; with Gemini the model gets
   it in a second call, with the local backend the tag line is consumed. */
export function createChat({ system, config = chatConfig(), apiKey = null, maxTurns = 8, tools = null, onToolCall = null, retry = true } = {}) {
  let history = []
  let gen = 0
  let asks = 0
  let controller = null
  const useTags = config.backend === 'openai'

  const stream = (window, signal, extraSystem) => {
    const sys = extraSystem ? `${system}\n\n${extraSystem}` : system
    if (config.backend === 'openai') {
      return local.streamChat({ base: config.base, model: config.model, system: sys, history: window, signal })
    }
    return gemini.streamChat({
      apiKey: apiKey || resolveKey(),
      model: config.model,
      system: sys,
      history: window,
      safetySettings: SAFETY_SETTINGS,
      tools: tools || undefined,
      maxOutputTokens: 400,
      signal,
    })
  }

  /* one model call: streams text, collects function calls */
  async function run(window, my, onText, extraSystem, tagState) {
    let acc = ''
    let finish = null
    let blocked = null
    const calls = []
    for await (const ev of stream(window, controller.signal, extraSystem)) {
      if (gen !== my) break
      if (ev.type === 'text') {
        if (useTags) {
          tagState.buffer += ev.text
          const { text, calls: tagCalls, rest } = splitToolTags(tagState.buffer)
          tagState.buffer = rest
          for (const c of tagCalls) calls.push({ name: c.name, args: c.args, viaTag: true })
          // a held line (a tag in progress) waits for its newline
          const visible = text + (rest.trimStart().startsWith('@@') ? '' : rest)
          if (!rest.trimStart().startsWith('@@')) tagState.buffer = ''
          if (visible) {
            acc += visible
            onText?.(visible, acc)
          }
        } else {
          acc += ev.text
          onText?.(ev.text, acc)
        }
      } else if (ev.type === 'functionCall') calls.push({ id: ev.id, name: ev.name, args: ev.args })
      else if (ev.type === 'finish') finish = ev.reason
      else if (ev.type === 'blocked') blocked = ev.reason
    }
    if (useTags && tagState.buffer && gen === my) {
      const { calls: tagCalls, rest } = splitToolTags(`${tagState.buffer}\n`)
      for (const c of tagCalls) calls.push({ name: c.name, args: c.args, viaTag: true })
      if (rest.trim() && !rest.trimStart().startsWith('@@')) {
        acc += rest
        onText?.(rest, acc)
      }
      tagState.buffer = ''
    }
    return { acc, finish, blocked, calls }
  }

  async function ask(text, { onText, extraSystem = '' } = {}) {
    const my = ++gen
    const askId = ++asks
    controller?.abort()
    controller = new AbortController()
    const userTurn = { role: 'user', content: String(text || '').trim() }
    let window = normalise([...history, userTurn]).slice(-maxTurns)
    let acc = ''
    const allCalls = []
    const tagState = { buffer: '' }
    const emit = (delta, all) => {
      acc = all
      onText?.(delta, all)
    }
    try {
      let result
      try {
        result = await run(window, my, emit, extraSystem, tagState)
      } catch (err) {
        const wait = retry ? retryDelayFor(err) : 0
        if (!wait || gen !== my || acc) throw err
        await sleep(wait)
        if (gen !== my) return { text: '', aborted: true, calls: [] }
        result = await run(window, my, emit, extraSystem, tagState)
      }
      if (gen !== my) return { text: acc, aborted: true, calls: allCalls }
      if (result.blocked || result.finish === 'SAFETY') throw Object.assign(new Error('blocked'), { code: 'BLOCKED' })

      // the tool loop (Gemini): answer the calls, let the model continue
      let rounds = 0
      let text = result.acc
      const turns = [userTurn]
      while (result.calls.length && rounds < MAX_TOOL_ROUNDS) {
        rounds += 1
        const responses = []
        for (const call of result.calls) {
          allCalls.push(call)
          let response = { ok: true }
          try {
            response = (await onToolCall?.(call.name, call.args)) ?? { ok: true }
          } catch (err) {
            response = { error: String(err?.message || err) }
          }
          responses.push({ call, response })
        }
        if (gen !== my) return { text: acc, aborted: true, calls: allCalls }
        if (useTags) break // the text convention has no second call
        const modelParts = [...(text.trim() ? [{ text: text.trim() }] : []), ...result.calls.map((c) => ({ functionCall: { ...(c.id ? { id: c.id } : {}), name: c.name, args: c.args || {} } }))]
        const responseParts = responses.map(({ call, response }) => ({ functionResponse: { ...(call.id ? { id: call.id } : {}), name: call.name, response } }))
        turns.push({ role: 'model', parts: modelParts }, { role: 'user', parts: responseParts })
        window = normalise([...history, ...turns]).slice(-(maxTurns + 2 * rounds))
        const before = acc
        result = await run(window, my, (delta, all) => emit(delta, before + all), extraSystem, tagState)
        if (gen !== my) return { text: acc, aborted: true, calls: allCalls }
        text = result.acc
      }
      const full = acc.trim()
      if (!full && !allCalls.length) throw Object.assign(new Error('empty answer'), { code: 'EMPTY' })
      history = [...history, userTurn, { role: 'assistant', content: full || '…' }].slice(-2 * maxTurns)
      return { text: full, finish: result.finish, aborted: false, calls: allCalls }
    } catch (err) {
      const aborted = gen !== my || err?.code === 'ABORTED' || err?.name === 'AbortError'
      if (aborted) {
        // keep what was said when this answer was interrupted (not replaced by a newer question)
        if (acc.trim() && asks === askId) history = [...history, userTurn, { role: 'assistant', content: `${acc.trim()} …` }].slice(-2 * maxTurns)
        return { text: acc, aborted: true, calls: allCalls }
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
