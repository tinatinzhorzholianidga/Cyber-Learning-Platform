/* The session interface every voice backend implements (brief §3,
   docs/io-voice-plan.md §3.3) and the helpers they share. useIoVoice
   owns exactly one session at a time and is the only module that touches
   React state.

   @typedef {'connecting'|'idle'|'listening'|'thinking'|'speaking'|'interrupted'|'ended'|'error'} VoiceState
     idle: a push-to-talk session between turns (the ring says "click and speak")

   @typedef {object} VoiceSession
   @property {(opts: { lang: 'ka'|'en', learner?: object, page?: object }) => Promise<void>} start
   @property {(text: string) => void} sendText        typed question (or the hidden session_started nudge)
   @property {() => void} interrupt                   stop IO mid-sentence (click on IO, Esc, VAD)
   @property {() => Promise<{ summary?: string }>} end
   @property {(event: string, cb: Function) => () => void} on
   @property {() => void} [listen]                    push-to-talk sessions: start listening
   @property {() => void} [stopListening]             push-to-talk sessions: stop early
   @property {(muted: boolean) => void} [setMuted]
   @property {() => number} [micLevel]                0..1 for the listening ring
   @property {boolean} pushToTalk                     the ring starts/stops listening (browser, turn, stub); Live listens by itself

   Events:
     'state'        VoiceState
     'userCaption'  { text, final }              the whole current utterance (interim results replace)
     'ioCaption'    { text, final, replace?, interrupted? }   text is appended unless replace
     'mouth'        { mode: 'level'|'pulse'|'sine'|null }     how the mouth should move while speaking
     'boundary'     { charIndex }                 one word spoken (browser voices) → a mouth pulse
     'mic'          { open: boolean }
     'tool'         { name, args }               (D5)
     'error'        { key, fatal }               key names a voice.* string */

export const STATES = ['connecting', 'idle', 'listening', 'thinking', 'speaking', 'interrupted', 'ended', 'error']

/* A minimal event emitter; on() returns the unsubscribe function. */
export function createEmitter() {
  const map = new Map()
  return {
    on(event, cb) {
      if (!map.has(event)) map.set(event, new Set())
      map.get(event).add(cb)
      return () => map.get(event)?.delete(cb)
    },
    emit(event, payload) {
      const set = map.get(event)
      if (!set) return
      for (const cb of [...set]) {
        try {
          cb(payload)
        } catch (err) {
          console.error(`voice: ${event} handler failed`, err)
        }
      }
    },
    clear() {
      map.clear()
    },
  }
}

/* Timers that a session can cancel in one call. */
export function createTimers() {
  let ids = []
  return {
    later(fn, ms) {
      const id = setTimeout(() => {
        ids = ids.filter((x) => x !== id)
        fn()
      }, ms)
      ids.push(id)
      return id
    },
    clear() {
      ids.forEach(clearTimeout)
      ids = []
    },
  }
}
