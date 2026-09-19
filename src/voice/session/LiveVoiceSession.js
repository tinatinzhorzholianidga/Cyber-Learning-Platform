/* LiveVoiceSession (docs/io-voice-plan.md §5.7, §2.3, §2.4): Gemini's Live
   API over a WebSocket from the browser. Track D authenticates with the
   dev key only (localhost, `npm run dev`; the SDK puts the key in the
   socket URL); Track P swaps the auth for an ephemeral token.

   The microphone streams 16 kHz PCM16 chunks to the model, whose audio
   answers play through the player (the amplitude mouth). Automatic VAD
   handles barge-in: the server sends `interrupted`, we flush. Input and
   output transcriptions feed the captions. A hidden `session_started`
   turn makes IO greet; 90 s of silence make him say goodbye and end; a
   tab hidden for 30 s pauses the microphone; `goAway` or an unexpected
   close reconnects with the resumption handle; a failed connection asks
   the hook to fall back to the browser session.

   The SDK is imported on demand (its own chunk). `connect` is injectable
   for tests. */
import { createEmitter, createTimers } from './VoiceSession.js'
import { openMic, micSupported, micErrorKey } from '../audio/mic.js'
import { buildSystemInstruction } from '../tutor/persona.js'
import { devKey, isDevServe } from '../auth/devKey.js'
import { errorKeyOf } from './pipeline.js'
import { geminiTools, runTool, LIVE_SCHEDULING } from '../tutor/tools.js'
import { lookup } from '../tutor/lookup.js'
import { touchProfile, summarise, isReturning, recordSkill, addSession, loadProfile } from '../tutor/memory.js'

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {}
export const CONNECT_TIMEOUT_MS = 10000
export const IDLE_GOODBYE_MS = 90000
export const HIDDEN_PAUSE_MS = 30000
const MAX_RECONNECTS = 2
const SURPRISE_MS = 400
const MIC_MIME = 'audio/pcm;rate=16000'

export function bytesToBase64(buf) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  return btoa(s)
}

export function base64ToBytes(b64) {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

const rateOf = (mime) => Number((/rate=(\d+)/.exec(mime || '') || [])[1]) || 24000

/* The default connector: the SDK's web build, loaded when first needed. */
async function sdkConnect({ apiKey, model, config, callbacks }) {
  const { GoogleGenAI } = await import('@google/genai')
  const ai = new GoogleGenAI({ apiKey })
  return ai.live.connect({ model, config, callbacks })
}

/* What the session asks of the Live model (§2.3). `handle` resumes. */
export function liveConfig({ lang, voiceName, handle = null, systemInstruction, tools = geminiTools({ live: true }) }) {
  return {
    responseModalities: ['AUDIO'],
    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    systemInstruction,
    tools,
    inputAudioTranscription: { languageCodes: [lang] }, // a BCP-47 hint (B11: 'ka' first)
    outputAudioTranscription: {},
    realtimeInputConfig: { automaticActivityDetection: {}, turnCoverage: 'TURN_INCLUDES_ONLY_ACTIVITY' },
    contextWindowCompression: { slidingWindow: {}, triggerTokens: '25600' },
    sessionResumption: handle ? { handle } : {},
    temperature: 0.6,
  }
}

export function create({
  ctx,
  player,
  lang = 'ka',
  reduced = false,
  connect = sdkConnect,
  apiKey = devKey(),
  model = ENV.VITE_IO_LIVE_MODEL || 'gemini-3.8-live',
  voiceName = ENV.VITE_IO_GEMINI_VOICE || 'Charon',
  connectTimeoutMs = CONNECT_TIMEOUT_MS,
  idleMs = IDLE_GOODBYE_MS,
  hiddenMs = HIDDEN_PAUSE_MS,
  page = null,
  lookupImpl = lookup,
} = {}) {
  const em = createEmitter()
  const timers = createTimers()
  let state = 'connecting'
  let live = null
  let mic = null
  let muted = false
  let handle = null
  let reconnects = 0
  let reconnecting = false
  let socketId = 0 // events from a socket we have already left are ignored
  let discardAudio = false // after a manual interrupt, until the model's turn completes (B7)
  let modelSpeaking = false
  let ioTurnOpen = false
  let userText = ''
  let pendingGoodbye = false
  let idleTimer = 0
  let hiddenTimer = 0
  let pausedByHidden = false
  let gen = 0
  let learner = ''
  let exchanges = 0
  let firstQuestion = ''
  let touchedSkills = []
  let sessionSaved = false
  let afterTurn = null // { type: 'end' } | { type: 'navigate', … } taken when the model's turn completes
  let quiz = null // { id, options, correctIndex, skill } while a quiz card is open
  const toolCtx = { lang, page, lookup: (q, l) => lookupImpl(q, l || lang), memory: { recordSkill, addSession } }

  const log = (...args) => {
    if (isDevServe()) console.info('[io-voice live]', ...args)
  }
  const setState = (s) => {
    if (state === 'ended' || state === s) return
    state = s
    em.emit('state', s)
  }
  const restState = () => (muted ? 'idle' : 'listening')

  /* ---- idle goodbye ---- */
  const touch = () => {
    clearTimeout(idleTimer)
    if (state === 'ended') return
    idleTimer = setTimeout(sayGoodbye, idleMs)
  }
  function sayGoodbye() {
    if (state === 'ended' || pendingGoodbye) return
    pendingGoodbye = true
    send((l) => l.sendClientContent({ turns: [{ role: 'user', parts: [{ text: `session_idle ${JSON.stringify({ lang, silentSeconds: Math.round(idleMs / 1000) })}` }] }], turnComplete: true }))
    setState('thinking')
  }

  function send(fn) {
    if (!live) return
    try {
      fn(live)
    } catch (err) {
      log('send failed', err?.message || err)
    }
  }

  /* ---- server messages ---- */
  function finalizeUserTurn() {
    if (!userText) return
    em.emit('userCaption', { text: userText, final: true })
    userText = ''
  }

  function onInterrupted() {
    player?.flush()
    modelSpeaking = false
    if (ioTurnOpen) {
      em.emit('ioCaption', { text: '', final: true, interrupted: true })
      ioTurnOpen = false
    }
    setState('interrupted')
    timers.later(() => {
      if (state === 'interrupted') setState(restState())
    }, SURPRISE_MS)
  }

  async function onTurnComplete() {
    const my = gen
    const discarded = discardAudio
    discardAudio = false
    if (ioTurnOpen) {
      em.emit('ioCaption', { text: '', final: true })
      ioTurnOpen = false
    }
    if (modelSpeaking && !discarded && player) await player.drained()
    if (my !== gen || state === 'ended') return
    modelSpeaking = false
    if (pendingGoodbye || afterTurn?.type === 'end') {
      afterTurn = null
      await session.end()
      return
    }
    if (afterTurn?.type === 'navigate') {
      const next = afterTurn
      afterTurn = null
      em.emit('navigate', next)
      await session.end()
      return
    }
    if (state === 'speaking' || state === 'thinking' || state === 'interrupted') setState(restState())
  }

  /* the model's function calls: run the handlers, answer at once (§5.7) */
  async function handleToolCall(toolCall) {
    const responses = []
    for (const fc of toolCall.functionCalls || []) {
      const { response, effect } = await runTool(fc.name, fc.args, toolCtx)
      const entry = { id: fc.id, name: fc.name, response, scheduling: LIVE_SCHEDULING[fc.name] || undefined }
      if (effect) {
        if (effect.type === 'quiz') {
          quiz = { id: fc.id, ...effect.quiz }
          entry.willContinue = true
        }
        if (effect.type === 'skill' && !touchedSkills.includes(effect.skill)) touchedSkills.push(effect.skill)
        if (effect.type === 'end') {
          sessionSaved = true
          afterTurn = { type: 'end' }
        } else if (effect.type === 'navigate') afterTurn = effect
        em.emit('tool', { name: fc.name, args: fc.args, effect })
      }
      log('tool', fc.name, fc.args)
      responses.push(entry)
    }
    if (responses.length) send((l) => l.sendToolResponse({ functionResponses: responses }))
  }

  function handleMessage(msg) {
    if (!msg || state === 'ended') return
    if (msg.sessionResumptionUpdate) {
      const u = msg.sessionResumptionUpdate
      if (u.resumable && u.newHandle) handle = u.newHandle
    }
    if (msg.goAway) {
      log('goAway', msg.goAway.timeLeft)
      reconnect()
      return
    }
    if (msg.toolCall) {
      handleToolCall(msg.toolCall)
      return
    }
    if (msg.toolCallCancellation) {
      quiz = null
      return
    }
    const sc = msg.serverContent
    if (!sc) return
    if (sc.interrupted) onInterrupted()
    const inT = sc.inputTranscription
    if (inT?.text) {
      userText += inT.text
      em.emit('userCaption', { text: userText, final: Boolean(inT.finished), heard: true })
      if (inT.finished) {
        exchanges += 1
        if (!firstQuestion) firstQuestion = userText
        userText = ''
        if (state === 'listening' || state === 'idle') setState('thinking')
      }
      touch()
    }
    const outT = sc.outputTranscription
    if (outT?.text && !discardAudio) {
      if (!ioTurnOpen) {
        ioTurnOpen = true
        finalizeUserTurn()
      }
      em.emit('ioCaption', { text: outT.text, final: false })
      touch()
    }
    for (const part of sc.modelTurn?.parts || []) {
      const data = part.inlineData?.data
      if (!data || discardAudio || !player) continue
      player.enqueue(base64ToBytes(data), rateOf(part.inlineData.mimeType))
      if (!modelSpeaking) {
        modelSpeaking = true
        finalizeUserTurn()
        setState('speaking')
        em.emit('mouth', { mode: 'level' })
      }
      touch()
    }
    if (sc.turnComplete) onTurnComplete()
  }

  /* ---- the socket ---- */
  async function connectOnce() {
    setState('connecting')
    const myId = ++socketId
    const mine = () => myId === socketId
    const callbacks = {
      onopen: () => log('socket open'),
      onmessage: (m) => {
        if (mine()) handleMessage(m)
      },
      onerror: (e) => log('socket error', e?.message || e),
      onclose: (e) => {
        if (mine()) onClose(e)
      },
    }
    let timer
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(Object.assign(new Error(`Live did not connect within ${connectTimeoutMs} ms`), { code: 'TIMEOUT' })), connectTimeoutMs)
    })
    try {
      live = await Promise.race([
        connect({ apiKey, model, config: liveConfig({ lang, voiceName, handle, systemInstruction: buildSystemInstruction({ lang, live: true, mode: 'live', learner }) }), callbacks }),
        timeout,
      ])
    } finally {
      clearTimeout(timer)
    }
  }

  function closeSocket() {
    socketId += 1 // whatever this socket still reports is history
    const l = live
    live = null
    try {
      l?.close?.()
    } catch {
      /* already closed */
    }
  }

  function fail(key) {
    if (state === 'ended') return
    teardown()
    state = 'error'
    em.emit('state', 'error')
    em.emit('error', { key, fatal: true, fallback: 'browser' })
  }

  function onClose(e) {
    if (state === 'ended' || state === 'error') return
    log('socket closed', e?.code, e?.reason)
    if (/API key/i.test(e?.reason || '')) return fail('errKey')
    if (handle && reconnects < MAX_RECONNECTS) return reconnect()
    fail(e?.code === 1008 || /quota|resource/i.test(e?.reason || '') ? 'errRateLimit' : 'errSocket')
  }

  async function reconnect() {
    if (reconnecting || state === 'ended' || state === 'error') return
    if (reconnects >= MAX_RECONNECTS) return fail('errSocket')
    reconnecting = true
    reconnects += 1
    gen += 1
    player?.flush()
    modelSpeaking = false
    discardAudio = false
    closeSocket()
    try {
      await connectOnce()
      if (state !== 'ended') setState(restState())
      log(`reconnected (${reconnects}) with handle ${handle ? 'yes' : 'no'}`)
    } catch (err) {
      fail(err?.code === 'TIMEOUT' ? 'errSocket' : errorKeyOf(err) || 'errSocket')
    } finally {
      reconnecting = false
    }
  }

  /* ---- the tab ---- */
  const onVisibility = () => {
    if (typeof document === 'undefined') return
    if (document.visibilityState === 'hidden') {
      clearTimeout(hiddenTimer)
      hiddenTimer = setTimeout(() => {
        if (state === 'ended' || muted) return
        pausedByHidden = true
        session.setMuted(true)
        log('tab hidden: microphone paused')
      }, hiddenMs)
    } else {
      clearTimeout(hiddenTimer)
      if (pausedByHidden) {
        pausedByHidden = false
        session.setMuted(false)
      }
    }
  }

  function teardown() {
    gen += 1
    clearTimeout(idleTimer)
    clearTimeout(hiddenTimer)
    timers.clear()
    if (typeof document !== 'undefined') document.removeEventListener?.('visibilitychange', onVisibility)
    player?.flush()
    closeSocket()
    const m = mic
    mic = null
    m?.close()
    em.emit('mic', { open: false })
  }

  const session = {
    pushToTalk: false,
    kind: 'live',

    async start() {
      if (!apiKey) throw Object.assign(new Error('no dev key for Live'), { key: 'errNoSession', fallback: 'browser' })
      const profile = touchProfile(lang)
      learner = summarise(lang, profile)
      try {
        await connectOnce()
      } catch (err) {
        closeSocket()
        throw Object.assign(err, { key: err?.code === 'TIMEOUT' ? 'errSocket' : errorKeyOf(err) || 'errSocket', fallback: 'browser' })
      }
      if (state === 'ended') return
      if (ctx && micSupported()) {
        try {
          const opened = await openMic(ctx, {
            onChunk: (buf) => {
              if (muted || !live || state === 'ended') return
              send((l) => l.sendRealtimeInput({ audio: { data: bytesToBase64(buf), mimeType: MIC_MIME } }))
            },
          })
          if (state === 'ended') return opened.close()
          mic = opened
          em.emit('mic', { open: true })
        } catch (err) {
          em.emit('error', { key: micErrorKey(err), fatal: false })
        }
      }
      if (typeof document !== 'undefined') document.addEventListener?.('visibilitychange', onVisibility)
      // the hidden nudge: IO greets in the session language (§5.7)
      send((l) => l.sendClientContent({ turns: [{ role: 'user', parts: [{ text: `session_started ${JSON.stringify({ lang, page: 'welcome', returning: isReturning(profile), learner })}` }] }], turnComplete: true }))
      setState('thinking')
      touch()
    },

    /* Live listens by itself; the ring toggles the microphone */
    listen() {
      if (state === 'ended') return
      if (muted) session.setMuted(false)
      else if (state === 'idle') setState('listening')
    },
    stopListening() {
      if (state === 'listening') session.setMuted(true)
    },

    sendText(text, { display = null } = {}) {
      const clean = String(text || '').trim()
      if (!clean || !live || state === 'ended' || state === 'connecting') return
      if (state === 'speaking' || state === 'thinking') session.interrupt()
      finalizeUserTurn()
      exchanges += 1
      if (!firstQuestion && !clean.startsWith('quiz_answer')) firstQuestion = clean
      em.emit('userCaption', { text: display || clean, final: true })
      send((l) => l.sendRealtimeInput({ text: clean }))
      setState('thinking')
      touch()
    },

    /* the learner clicked a quiz option: a second tool response that interrupts (§5.7) */
    answerQuiz(index) {
      const q = quiz
      if (!q || !Number.isInteger(index) || !q.options[index] || state === 'ended') return
      quiz = null
      const text = q.options[index]
      const correct = index === q.correctIndex
      em.emit('tool', { name: 'quiz_answer', args: { index, correct }, effect: { type: 'quizAnswered', index, correct, skill: q.skill } })
      if (state === 'speaking' || state === 'thinking') session.interrupt()
      finalizeUserTurn()
      em.emit('userCaption', { text, final: true })
      if (q.id && live) {
        send((l) => l.sendToolResponse({ functionResponses: [{ id: q.id, name: 'ask_quiz', response: { quiz_answer: index + 1, text, correct, correctIndex: q.correctIndex + 1 }, scheduling: 'INTERRUPT' }] }))
      } else send((l) => l.sendRealtimeInput({ text: `quiz_answer ${index + 1}: ${text} (${correct ? 'correct' : 'not correct'})` }))
      setState('thinking')
      touch()
    },

    /* a click on IO or Esc: flush locally and ignore the rest of this turn (B7) */
    interrupt() {
      if (state !== 'speaking' && state !== 'thinking') return
      discardAudio = true
      player?.flush()
      modelSpeaking = false
      if (ioTurnOpen) {
        em.emit('ioCaption', { text: '', final: true, interrupted: true })
        ioTurnOpen = false
      }
      setState('interrupted')
      timers.later(() => {
        if (state === 'interrupted') setState(restState())
      }, SURPRISE_MS)
    },

    setMuted(m) {
      if (state === 'ended') return
      muted = m
      mic?.setMuted(m)
      if (m) send((l) => l.sendRealtimeInput({ audioStreamEnd: true }))
      em.emit('mic', { open: Boolean(mic?.isOpen()) && !m })
      if (state === 'listening' && m) setState('idle')
      else if (state === 'idle' && !m) setState('listening')
    },

    micLevel: () => (muted ? 0 : mic?.level() ?? 0),

    async end() {
      if (state === 'ended') return { summary: '' }
      teardown()
      if (!sessionSaved && exchanges > 0 && firstQuestion) {
        const summary = firstQuestion.slice(0, 120)
        addSession({ summary_ka: summary, summary_en: summary, skills: touchedSkills })
        sessionSaved = true
      }
      state = 'ended'
      em.emit('state', 'ended')
      em.clear()
      return { summary: loadProfile()?.sessions?.at(-1)?.[lang === 'ka' ? 'summary_ka' : 'summary_en'] || '' }
    },

    on: em.on,
    get state() {
      return state
    },
    get resumptionHandle() {
      return handle
    },
  }
  return session
}
