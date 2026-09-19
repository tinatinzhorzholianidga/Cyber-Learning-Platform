/* The push-to-talk session shared by BrowserVoiceSession and
   TurnVoiceSession (docs/io-voice-plan.md §5.5, §5.6, §5.8): speech
   recognition in the browser → the chat pipeline (streamed, with the
   tutor's tools) → a speaker that reads the answer sentence by sentence
   while the rest is still arriving.

   States: connecting → idle ⇄ listening → thinking → speaking → idle.
   The visitor presses the ring to talk (V15); recognition ends by itself
   at the end of the utterance. A click on IO, Esc or a new question
   interrupts. Typed questions take the same path without recognition.

   `makeSpeaker({ callbacks })` returns the speaker (browser voices or
   Gemini TTS through the player) or null when no voice exists: then IO
   answers in captions only. Tool effects reach the UI as 'tool' events;
   an end_session or navigate_to_path effect takes hold after the answer. */
import { createEmitter, createTimers } from './VoiceSession.js'
import { createChat, errorKeyOf, chatConfig } from './pipeline.js'
import { createRecognizer, recognitionSupported } from '../stt/webSpeech.js'
import { openMic, micSupported } from '../audio/mic.js'
import { splitSentences, stripForSpeech } from '../tts/speechSynthesis.js'
import { buildSystemInstruction } from '../tutor/persona.js'
import { STRINGS } from '../tutor/strings.js'
import { geminiTools, runTool } from '../tutor/tools.js'
import { lookup } from '../tutor/lookup.js'
import { touchProfile, summarise, isReturning, lastTopic, recordSkill, addSession, loadProfile } from '../tutor/memory.js'
import { isDevServe } from '../auth/devKey.js'

const NO_VOICE_MS_PER_CHAR = 45 // captions-only pace, so the answer reads like speech

export function createPushToTalkSession({ ctx, player, lang = 'ka', kind, makeSpeaker, chatOptions = {}, reduced = false, page = null, lookupImpl = lookup }) {
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
  let utteranceEndAt = 0
  let exchanges = 0
  let firstQuestion = ''
  let touchedSkills = []
  let sessionSaved = false
  let afterAnswer = null // { type: 'end' } | { type: 'navigate', … } taken after the answer is spoken
  let quiz = null // the open quiz: { options, correctIndex, skill }

  const setState = (s) => {
    if (state === 'ended' || state === s) return
    state = s
    em.emit('state', s)
  }
  const log = (...args) => {
    if (isDevServe()) console.info('[io-voice]', ...args)
  }

  /* ---- the speaker: created once, reset by cancel() ---- */
  let speakingDone = null
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

  /* ---- tools ---- */
  const toolCtx = {
    lang,
    page,
    lookup: (q, l) => lookupImpl(q, l || lang),
    memory: { recordSkill, addSession },
  }
  async function onToolCall(name, args) {
    const { response, effect } = await runTool(name, args, toolCtx)
    if (effect) {
      if (effect.type === 'quiz') quiz = effect.quiz
      if (effect.type === 'skill' && !touchedSkills.includes(effect.skill)) touchedSkills.push(effect.skill)
      if (effect.type === 'end') {
        sessionSaved = true
        afterAnswer = { type: 'end' }
      } else if (effect.type === 'navigate') afterAnswer = effect
      em.emit('tool', { name, args, effect })
    }
    log('tool', name, args)
    return response
  }

  /* ---- one answer ---- */
  async function answer(question, { display = null } = {}) {
    const my = ++gen
    em.emit('userCaption', { text: display || question, final: true })
    setState('thinking')
    utteranceEndAt = performance.now()
    exchanges += 1
    if (!firstQuestion && !question.startsWith('quiz_answer')) firstQuestion = question
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
      // the local backend has no lookup tool: ground the question up front
      let extraSystem = ''
      if (chat.config.backend === 'openai') {
        try {
          const r = await lookupImpl(question, lang)
          if (r?.chunks?.length) extraSystem = `PLATFORM MATERIAL THAT MAY HELP\n${r.text}`
        } catch {
          /* no index: answer without grounding */
        }
        if (my !== gen) return
      }
      const result = await chat.ask(question, {
        extraSystem,
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
      } else if (voiceless && captionAny && !reduced) {
        await new Promise((r) => timers.later(r, Math.min(6000, result.text.length * NO_VOICE_MS_PER_CHAR)))
      }
      if (my !== gen) return
      if (afterAnswer) {
        const next = afterAnswer
        afterAnswer = null
        if (next.type === 'end') {
          await session.end()
          return
        }
        em.emit('navigate', next)
        await session.end()
        return
      }
      setState('idle')
    } catch (err) {
      if (my !== gen) return
      const key = errorKeyOf(err)
      if (key) {
        log('chat error', err?.code || err?.message || err)
        em.emit('error', { key, fatal: false })
      }
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
    afterAnswer = null
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
      const profile = touchProfile(lang)
      const config = chatOptions.config || chatConfig()
      const textTools = config.backend === 'openai'
      chat = createChat({
        system: buildSystemInstruction({ lang, learner: summarise(lang, profile), mode: kind, textTools }),
        tools: textTools ? null : geminiTools(),
        onToolCall,
        ...chatOptions,
      })
      speaker = await makeSpeaker({ callbacks: speakerCallbacks })
      voiceless = !speaker
      if (state === 'ended') return
      if (voiceless) em.emit('error', { key: 'noVoice', fatal: false })
      // the scripted greeting: no model call, so the free tier is spent on answers
      const my = ++gen
      setState('speaking')
      const topic = isReturning(profile) ? lastTopic(profile, lang, 'on') : null
      const greeting = topic ? strings.returning.replace('{topic}', topic) : isReturning(profile) ? strings.returningPlain : strings.greeting
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

    sendText(text, { display = null } = {}) {
      const clean = String(text || '').trim()
      if (!clean || state === 'ended' || state === 'connecting') return
      if (state === 'listening') {
        gen += 1
        stopRecognition(true)
        em.emit('mic', { open: false })
        closeMic()
      } else if (state === 'speaking' || state === 'thinking') session.interrupt()
      answer(clean, { display })
    },

    /* the learner clicked a quiz option: the model reacts to it */
    answerQuiz(index) {
      const q = quiz
      if (!q || !Number.isInteger(index) || !q.options[index]) return
      quiz = null
      const text = q.options[index]
      const correct = index === q.correctIndex
      em.emit('tool', { name: 'quiz_answer', args: { index, correct }, effect: { type: 'quizAnswered', index, correct, skill: q.skill } })
      session.sendText(`quiz_answer ${index + 1}: ${text} (${correct ? 'correct' : 'not correct'}; the right option was ${q.correctIndex + 1})`, { display: text })
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
      if (state === 'ended') return { summary: '' }
      cancelAnswer()
      stopRecognition(true)
      await closeMic()
      em.emit('mic', { open: false })
      // a session with real exchanges leaves a short record even without end_session
      if (!sessionSaved && exchanges > 0 && firstQuestion) {
        const summary = firstQuestion.slice(0, 120)
        addSession({ summary_ka: summary, summary_en: summary, skills: touchedSkills })
        sessionSaved = true
      }
      setState('ended')
      em.clear()
      return { summary: loadProfile()?.sessions?.at(-1)?.[lang === 'ka' ? 'summary_ka' : 'summary_en'] || '' }
    },

    on: em.on,
    get state() {
      return state
    },
  }
  return session
}
