/* Which voice session to run (docs/io-voice-plan.md §5.4):
   ?voice= → VITE_IO_VOICE_DEFAULT (one kind, or per language
   "ka=browser,en=live") → capability fallback. Returns the kind, the
   reason (for the dev badge), whether a pasted key would unlock the
   wanted kind, and a loader for the session module.

   The registry: the stub harness (D2), the browser and turn sessions (D3)
   and live (D4). A kind that is not built falls through like an
   unavailable one. */
import { devKey, resolveKey } from '../auth/devKey.js'

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {}
export const KINDS = ['browser', 'live', 'turn', 'stub']

const REGISTRY = {
  browser: () => import('./BrowserVoiceSession.js'),
  turn: () => import('./TurnVoiceSession.js'),
  live: () => import('./LiveVoiceSession.js'),
  stub: () => import('./StubVoiceSession.js'),
}

/* "browser" or "ka=browser,en=live" → the kind for `lang`. */
export function defaultKind(lang, value = ENV.VITE_IO_VOICE_DEFAULT) {
  const v = String(value || '').trim()
  if (!v) return 'browser'
  if (!v.includes('=')) return KINDS.includes(v) ? v : 'browser'
  const map = Object.fromEntries(
    v.split(',').map((pair) => pair.split('=').map((s) => s.trim())).filter(([k, kind]) => k && KINDS.includes(kind)),
  )
  return map[lang] || map.ka || 'browser'
}

export function detectCaps() {
  const g = globalThis
  return {
    recognition: typeof g.SpeechRecognition !== 'undefined' || typeof g.webkitSpeechRecognition !== 'undefined',
    synthesis: typeof g.speechSynthesis !== 'undefined',
    audio: typeof g.AudioContext !== 'undefined' || typeof g.webkitAudioContext !== 'undefined',
  }
}

/* Per kind: can it run right now, and why not. */
export function checkKind(kind, { env = ENV, caps = detectCaps() } = {}) {
  switch (kind) {
    case 'live': {
      if (!devKey()) return { ok: false, reason: 'no dev key', needsKey: false }
      if (env.VITE_IO_LIVE_OK !== '1') return { ok: false, reason: 'VITE_IO_LIVE_OK is not 1', needsKey: false }
      if (!caps.audio) return { ok: false, reason: 'no Web Audio', needsKey: false }
      return { ok: true, reason: 'dev key', needsKey: false }
    }
    case 'turn': {
      if (!resolveKey()) return { ok: false, reason: 'no key', needsKey: true }
      if (!caps.audio) return { ok: false, reason: 'no Web Audio', needsKey: false }
      return { ok: true, reason: 'key', needsKey: false }
    }
    case 'browser': {
      const local = env.VITE_IO_LLM === 'openai'
      if (!local && !resolveKey()) return { ok: false, reason: 'no key for the chat backend', needsKey: true }
      const speech = caps.recognition || caps.synthesis
      return { ok: true, reason: `${local ? 'local model' : 'gemini'}${speech ? '' : ', typed only'}`, needsKey: false }
    }
    case 'stub':
      return { ok: true, reason: 'test harness', needsKey: false }
    default:
      return { ok: false, reason: 'unknown kind', needsKey: false }
  }
}

/* The decision. `requested` is the ?voice= value (or null). */
export function selectSession({ requested = null, lang = 'ka', env = ENV, caps = detectCaps(), registry = REGISTRY } = {}) {
  const wanted = requested && KINDS.includes(requested) ? requested : defaultKind(lang, env.VITE_IO_VOICE_DEFAULT)
  // the stub is never a fallback: it plays a test signal, not IO
  const chain = wanted === 'stub' ? ['stub'] : [...new Set([wanted, 'browser', 'turn'])]
  const reasons = []
  let needsKey = false
  for (const kind of chain) {
    const check = checkKind(kind, { env, caps })
    const built = Boolean(registry[kind])
    if (check.ok && built) {
      const reason = kind === wanted ? check.reason : `${wanted} unavailable (${reasons.join('; ')}) → ${kind}: ${check.reason}`
      return { kind, wanted, reason, needsKey: false, load: registry[kind] }
    }
    needsKey = needsKey || check.needsKey
    reasons.push(`${kind}: ${built ? check.reason : 'not built yet'}`)
  }
  return { kind: null, wanted, reason: reasons.join('; '), needsKey, load: null }
}
