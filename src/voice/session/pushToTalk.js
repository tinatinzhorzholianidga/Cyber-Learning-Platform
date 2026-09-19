/* The push-to-talk session shared by BrowserVoiceSession and
   TurnVoiceSession (docs/io-voice-plan.md §5.5, §5.6): speech recognition
   in the browser → the chat pipeline (streamed) → a speaker that reads
   the answer sentence by sentence while the rest is still arriving.

   States: connecting → idle ⇄ listening → thinking → speaking → idle.
   The visitor presses the ring to talk (V15); recognition ends by itself
   at the end of the utterance. A click on IO, Esc or a new question
   interrupts. Typed questions take the same path without recognition.

   `makeSpeaker({ callbacks })` returns the speaker (browser voices or
   Gemini TTS through the player) or null when no voice exists: then IO
   answers in captions only. */
import { createEmitter, createTimers } from './VoiceSession.js'
import { createChat, errorKeyOf } from './pipeline.js'
import { createRecognizer, recognitionSupported } from '../stt/webSpeech.js'
import { openMic, micSupported } from '../audio/mic.js'
import { splitSentences, stripForSpeech } from '../tts/speechSynthesis.js'
import { buildSystemInstruction } from '../tutor/persona.js'
import { STRINGS } from '../tutor/strings.js'
import { isDevServe } from '../auth/devKey.js'

const NO_VOICE_MS_PER_CHAR = 45 // captions-only pace, so the answer reads like speech

export function createPushToTalkSession({ ctx, player, lang = 'ka', kind, makeSpeaker, chatOptions = {}, reduced = false }) {
  const em = createEmitter()
  const timers = createTimers()
  const strings = STRINGS[lang] || STRINGS.ka
  let state = 'connecting'
  let speaker = null
  let voiceless = false
  let chat = null
  let rec = null
  let mic = null
  let muted = false
  let gen = 0
  let speakingSince = 0
  let utteranceEndAt = 0

  const setState = (s) => {
    if (state === 'ended' || state === s) return
    state = s
    em.emit('state', s)
  }
  const log = (...args) => {
    if (isDevServe()) console.info('[io-voice]', ...args)
  }

  /* ---- the speaker: created once, reset by cancel() ---- */
  let speakingDone = null // resolve when the speaker finishes the current answer
  const speakerCallbacks = {
    onMouth: (mode) => em.emit('mouth', { mode }),
    onBoundary: (e) => em.emit('boundary', e),
    onSentence: () => {
      if (state === 'thinking') setState('speaking')
    },
    onFirstAudio: (ms) =>
      log(
        `first audio ${Math.round(ms)} ms after the first sentence` +
          (utteranceEndAt ? `, ${Math.round(performance.now() - utteranceEndAt)} ms after the question` : ' (greeting)'),
      ),
    onDone: () => speakingDone?.(),
    onError: (err) => {
      log('speaker error', err?.message || err)
      em.emit('error', { key: 'noVoice', fatal: false })
    },
  }

  async function closeMic() {
    const m = mic
    mic = null
    m?.close()
  }

  /* ---- one answer ---- */
  async function answer(question) {
    const my = ++gen
    em.emit('userCaption', { text: question, final: true })
    setState('thinking')
    utteranceEndAt = performance.now()
    let pendingText = ''
    let spokenAny = false
    let captionAny = false
    const speakChunk = (sentence) => {
      const clean = stripForSpeech(sentence)
      if (!clean) return
      if (speaker) {
        speaker.speak(clean)
        spokenAny = true
      }
    }
    const done = new Promise((resolve) => (speakingDone = resolve))
    try {
      const result = await chat.ask(question, {
        onText: (delta) => {
          if (my !== gen) return
          if (!captionAny) {
            captionAny = true
            if (voiceless) {
              setState('speaking')
              em.emit('mouth', { mode: 'sine' })
            }
          }
          em.emit('ioCaption', { text: delta, final: false })
          pendingText += delta
          const { sentences, rest } = splitSentences(pendingText)
          pendingText = rest
          sentences.forEach(speakChunk)
        },
      })
      if (my !== gen || result.aborted) return
      if (pendingText.trim()) speakChunk(pendingText)
      pendingText = ''
      em.emit('ioCaption', { text: '', final: true })
      if (spokenAny) {
        if (state === 'thinking') setState('speaking')
        await done
      } else if (voiceless && !reduced) {
        await new Promise((r) => timers.later(r, Math.min(6000, result.text.length * NO_VOICE_MS_PER_CHAR)))
      }
      if (my !== gen) return
      speakingSince = 0
      setState('idle')
    } catch (err) {
      if (my !== gen) return
      const key = errorKeyOf(err)
      if (key) {
        log('chat error', err?.code || err?.message || err)
        em.emit('error', { key, fatal: false })
      }
      em.emit('userCaption', { text: question, final: true })
      em.emit('ioCaption', { text: '', final: true })
      setState('idle')
    }
  }

  function cancelAnswer() {
    gen += 1
    timers.clear()
    chat?.abort()
    speaker?.cancel()
    player?.flush()
    speakingDone?.()
    speakingDone = null
  }

  /* ---- listening ---- */
  function stopRecognition(abort) {
    const r = rec
    rec = null
    if (!r) return
    if (abort) r.abort()
    else r.stop()
  }

  const session = {
    pushToTalk: true,
    kind,

    async start() {
      setState('connecting')
      chat = createChat({ system: buildSystemInstruction({ lang }), ...chatOptions })
      speaker = await makeSpeaker({ callbacks: speakerCallbacks })
      voiceless = !speaker
      if (state === 'ended') return
      if (voiceless) em.emit('error', { key: 'noVoice', fatal: false })
      // the scripted greeting: no model call, so the free tier is spent on answers
      const my = ++gen
      setState('speaking')
      const greeting = strings.greeting
      if (speaker) {
        const done = new Promise((resolve) => (speakingDone = resolve))
        em.emit('ioCaption', { text: greeting, final: true })
        speaker.speak(stripForSpeech(greeting))
        await done
      } else {
        em.emit('mouth', { mode: 'sine' })
        em.emit('ioCaption', { text: greeting, final: true })
        if (!reduced) await new Promise((r) => timers.later(r, 1800))
      }
      if (my !== gen || state === 'ended') return
      setState('idle')
    },

    listen() {
      if (state === 'ended' || state === 'listening') return
      if (state === 'speaking' || state === 'thinking') session.interrupt()
      if (!recognitionSupported()) {
        em.emit('error', { key: 'errSpeech', fatal: false })
        return
      }
      const my = ++gen
      let finalText = ''
      rec = createRecognizer({
        lang,
        onStart: () => {
          if (my !== gen) return
          em.emit('mic', { open: true })
          // the worklet only feeds the listening ring here (recognition captures on its own)
          if (ctx && micSupported() && !mic) {
            openMic(ctx)
              .then((m) => {
                if (my !== gen || state !== 'listening') m.close()
                else {
                  mic = m
                  if (muted) m.setMuted(true)
                }
              })
              .catch(() => {})
          }
        },
        onInterim: (text) => {
          if (my === gen) em.emit('userCaption', { text, final: false })
        },
        onFinal: (text) => {
          if (my === gen) finalText = text
        },
        onError: (key) => {
          if (my !== gen) return
          if (key === 'errEmpty') return // reported by onEnd as "nothing heard"
          em.emit('error', { key, fatal: false })
        },
        onEnd: ({ heard }) => {
          if (my !== gen) return
          em.emit('mic', { open: false })
          closeMic()
          if (finalText) answer(finalText)
          else {
            if (!heard) em.emit('error', { key: 'errEmpty', fatal: false })
            em.emit('userCaption', { text: '', final: true })
            setState('idle')
          }
        },
      })
      setState('listening')
      em.emit('userCaption', { text: '', final: false })
      rec.start()
    },

    stopListening() {
      if (state !== 'listening') return
      stopRecognition(false)
    },

    sendText(text) {
      const clean = String(text || '').trim()
      if (!clean || state === 'ended' || state === 'connecting') return
      if (state === 'listening') {
        gen += 1
        stopRecognition(true)
        em.emit('mic', { open: false })
        closeMic()
      } else if (state === 'speaking' || state === 'thinking') session.interrupt()
      answer(clean)
    },

    interrupt() {
      if (state === 'ended' || state === 'connecting') return
      const was = state
      cancelAnswer()
      if (was === 'listening') {
        stopRecognition(true)
        em.emit('mic', { open: false })
        closeMic()
        em.emit('userCaption', { text: '', final: true })
        setState('idle')
        return
      }
      if (was === 'speaking' || was === 'thinking') {
        em.emit('ioCaption', { text: '', final: true, interrupted: true })
        setState('interrupted')
        timers.later(() => {
          if (state === 'interrupted') setState('idle')
        }, 400)
      }
    },

    setMuted(m) {
      muted = m
      mic?.setMuted(m)
      if (m && state === 'listening') {
        // a muted recogniser makes no sense: stop the utterance
        stopRecognition(true)
      }
      em.emit('mic', { open: Boolean(rec?.isActive()) && !m })
    },

    micLevel: () => (muted ? 0 : mic?.level() ?? 0),

    async end() {
      cancelAnswer()
      stopRecognition(true)
      await closeMic()
      em.emit('mic', { open: false })
      setState('ended')
      em.clear()
      return { summary: '' }
    },

    on: em.on,
    get state() {
      return state
    },
    get speakingSince() {
      return speakingSince
    },
  }
  return session
}
