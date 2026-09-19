/* The D2 acceptance harness (docs/io-voice-plan.md §4.3, §7.1): a voice
   session with no network and no key. It opens the microphone (so the
   listening ring follows the visitor's voice), "speaks" a speech-like
   test signal or a WAV through the player (so the mouth follows real
   audio), streams captions timed to that audio, listens until the mic
   goes quiet, thinks for a moment and answers. Interrupt and end behave
   exactly like the real sessions.

   ?voice=stub                       the synthetic signal, the amplitude mouth
   ?voice=stub&wav=<url>             a WAV (e.g. a bake-off file served by
                                     the dev server: /IO-for-main-page/bakeoff/gemini-Charon-1.wav)
   ?voice=stub&mouth=pulse           word-boundary pulses instead of the
                                     amplitude (what a browser voice sends)
   ?voice=stub&mouth=sine            no level at all: the model's sine mouth
                                     (a browser voice without boundary events) */
import { createEmitter, createTimers } from './VoiceSession.js'
import { openMic, micSupported, micErrorKey } from '../audio/mic.js'
import { synthSpeech, parseWav } from '../audio/pcm.js'
import { STRINGS } from '../tutor/strings.js'

const SPEECH_LEVEL = 0.12
const SILENCE_MS = 700
const MAX_LISTEN_MS = 6000
const THINK_MS = 800
const WORD_MS = 260 // synthetic boundary events in pulse mode

export function create({ ctx, player, lang = 'ka', wavUrl = null, reduced = false }) {
  const em = createEmitter()
  const timers = createTimers()
  const strings = STRINGS[lang] || STRINGS.ka
  let state = 'connecting'
  let mic = null
  let gen = 0 // bumps on every interrupt / end: stale async work checks it
  let clips = null
  let muted = false

  const setState = (s) => {
    if (state === 'ended') return
    state = s
    em.emit('state', s)
  }

  const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams()
  const url = wavUrl ?? params.get('wav')
  const mouthMode = ['pulse', 'sine'].includes(params.get('mouth')) ? params.get('mouth') : 'level'

  async function loadClips() {
    if (clips) return clips
    if (url) {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`WAV ${res.status}`)
      const wav = parseWav(await res.arrayBuffer())
      clips = { greeting: wav.samples, reply: wav.samples, rate: wav.sampleRate }
    } else {
      clips = { greeting: synthSpeech({ seconds: 2.6, seed: 11 }), reply: synthSpeech({ seconds: 4, seed: 23 }), rate: 24000 }
    }
    return clips
  }

  /* Play `samples` as a stream of 100 ms chunks and caption `text` word by
     word across its duration. Resolves true when it played to the end. */
  async function speak(samples, rate, text) {
    const my = ++gen
    setState('speaking')
    em.emit('mouth', { mode: player ? mouthMode : 'sine' })
    const durationMs = (samples.length / rate) * 1000
    if (reduced) {
      // no typewriter under reduced motion: the whole line at once
      em.emit('ioCaption', { text, final: true })
    } else {
      const words = text.split(' ')
      words.forEach((w, i) => {
        timers.later(
          () => {
            if (gen !== my) return
            em.emit('ioCaption', { text: (i ? ' ' : '') + w, final: i === words.length - 1 })
          },
          Math.round((durationMs * (i + 0.6)) / words.length),
        )
      })
    }
    if (mouthMode === 'pulse') {
      // what tts/speechSynthesis.js sends per spoken word (D3)
      for (let at = 0; at < durationMs; at += WORD_MS) {
        timers.later(() => {
          if (gen === my) em.emit('boundary', { charIndex: at })
        }, at)
      }
    }
    if (player) {
      const chunk = Math.round(rate / 10)
      for (let i = 0; i < samples.length; i += chunk) player.enqueue(samples.subarray(i, i + chunk), rate)
      await player.drained()
    } else {
      await new Promise((r) => timers.later(r, durationMs))
    }
    return gen === my
  }

  async function reply(userText) {
    const my = ++gen
    em.emit('userCaption', { text: userText, final: true })
    setState('thinking')
    await new Promise((r) => timers.later(r, THINK_MS))
    if (gen !== my) return
    const c = await loadClips()
    if (gen !== my) return
    const done = await speak(c.reply, c.rate, strings.stubReply)
    if (done) setState('idle')
  }

  function stopListeningWith(heard) {
    if (state !== 'listening') return
    if (heard) reply(strings.stubHeard)
    else {
      gen += 1
      em.emit('userCaption', { text: '', final: true })
      em.emit('error', { key: 'errEmpty', fatal: false })
      setState('idle')
    }
  }

  const session = {
    pushToTalk: true,

    async start() {
      setState('connecting')
      if (ctx && micSupported()) {
        try {
          const opened = await openMic(ctx)
          if (state === 'ended') {
            opened.close() // ended while the permission prompt was up
            return
          }
          mic = opened
          em.emit('mic', { open: true })
        } catch (err) {
          if (state === 'ended') return
          em.emit('error', { key: micErrorKey(err), fatal: false })
        }
      }
      if (state === 'ended') return
      const c = await loadClips()
      if (state === 'ended') return
      const done = await speak(c.greeting, c.rate, strings.greeting)
      if (done) setState('idle')
    },

    /* push-to-talk: listen until the mic goes quiet after speech, or 6 s */
    listen() {
      if (state === 'speaking' || state === 'thinking') session.interrupt()
      if (state === 'ended' || state === 'listening') return
      const my = ++gen
      setState('listening')
      em.emit('userCaption', { text: '', final: false })
      const start = performance.now()
      let heard = false
      let lastLoud = start
      const tick = () => {
        if (gen !== my || state !== 'listening') return
        const level = mic?.level() ?? 0
        const now = performance.now()
        if (level > SPEECH_LEVEL) {
          heard = true
          lastLoud = now
        }
        if ((heard && now - lastLoud > SILENCE_MS) || now - start > MAX_LISTEN_MS) {
          stopListeningWith(heard)
          return
        }
        timers.later(tick, 50)
      }
      tick()
    },

    stopListening() {
      if (state !== 'listening') return
      const level = mic?.level() ?? 0
      stopListeningWith(level > SPEECH_LEVEL / 2)
    },

    sendText(text) {
      const clean = String(text || '').trim()
      if (!clean || state === 'ended') return
      if (state === 'speaking' || state === 'thinking' || state === 'listening') session.interrupt()
      reply(clean)
    },

    interrupt() {
      if (state === 'ended') return
      const was = state
      gen += 1
      timers.clear()
      player?.flush()
      if (was === 'speaking' || was === 'thinking') {
        em.emit('ioCaption', { text: '', final: true, interrupted: true })
        setState('interrupted')
        timers.later(() => {
          if (state === 'interrupted') setState('idle')
        }, 400)
      } else if (was === 'listening') {
        em.emit('userCaption', { text: '', final: true })
        setState('idle')
      }
    },

    setMuted(m) {
      muted = m
      mic?.setMuted(m)
      em.emit('mic', { open: Boolean(mic?.isOpen()) })
    },

    micLevel: () => (muted ? 0 : mic?.level() ?? 0),

    async end() {
      gen += 1
      timers.clear()
      player?.flush()
      mic?.close()
      mic = null
      em.emit('mic', { open: false })
      setState('ended')
      em.clear()
      return { summary: '' }
    },

    on: em.on,
    get state() {
      return state
    },
  }
  return session
}
