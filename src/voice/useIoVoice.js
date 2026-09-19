/* The talk-mode state machine (brief Phase 2; docs/io-voice-plan.md §5.1,
   §5.2). Owns exactly one VoiceSession, maps its events to what IoHost
   needs (emotion, gesture, listening cue, the mouth level ref, the sine
   fallback flag) and to the store the dock and transcript render from.
   Nothing here touches the DOM except the keyboard listeners. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createStore } from './store.js'
import { emptyTranscript, applyCaption, markInterrupted, dropEmptyUser } from './transcript.js'
import { selectSession } from './session/select.js'
import { createPlayer } from './audio/player.js'
import { forgetProfile } from './tutor/memory.js'

/* the face for each state: speaking needs a mouth-responsive face */
const FACE = {
  connecting: 'thinking',
  idle: 'happy',
  listening: 'thinking',
  thinking: 'thinking',
  speaking: 'happy',
  interrupted: 'surprised',
  ended: 'happy',
  error: 'sad',
}
const SURPRISE_MS = 400
const THINKING_TIMEOUT_MS = 20000
const PULSE_MS = 180 // a word-boundary pulse decays from 0.9 to 0.05 over this
const STORAGE_PREFIX = 'io.voice.'

const isEditable = (el) => Boolean(el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)))

export function useIoVoice({ lang, kind, audioContext, page, reduced = false, onNavigate = null, onEnded = null }) {
  const store = useMemo(
    () =>
      createStore({
        kind: null,
        wanted: null,
        reason: '',
        needsKey: false,
        state: 'connecting',
        micOpen: false,
        muted: false,
        error: null,
        face: { emotion: 'thinking', gesture: null, listening: false, talking: false },
        transcript: emptyTranscript(),
        board: { card: null, quiz: null, answered: null },
      }),
    [],
  )
  const navigateRef = useRef(onNavigate)
  navigateRef.current = onNavigate
  const endedRef = useRef(onEnded)
  endedRef.current = onEnded
  const pendingNav = useRef(null)
  const ctrl = useRef(null)
  const mouthLevel = useRef(null) // read by RobotModel every frame
  const mouth = useRef({ mode: null, pulseAt: 0, raf: 0 })
  const gestureN = useRef(0)
  const timers = useRef({ overlay: 0, thinking: 0 })
  const [restartN, setRestartN] = useState(0)
  // a session that cannot run (Live without quota or connection) names its fallback
  const [fallbackKind, setFallbackKind] = useState(null)
  // page context is read at start; a new object identity must not restart the session
  const pageRef = useRef(page)
  pageRef.current = page

  const setFace = useCallback((patch) => store.set((s) => ({ ...s, face: { ...s.face, ...patch } })), [store])

  useEffect(() => {
    let alive = true
    // `mood`: a set_mood call holds IO's face through the rest of that answer
    const c = { session: null, player: null, unsubs: [], waved: false, mood: null }
    ctrl.current = c
    const m = mouth.current

    const fireGesture = (type) => {
      gestureN.current += 1
      setFace({ gesture: { id: `v${gestureN.current}`, type } })
    }
    const tick = () => {
      if (m.mode === 'level') mouthLevel.current = c.player?.level() ?? 0
      else if (m.mode === 'pulse') {
        const age = performance.now() - m.pulseAt
        mouthLevel.current = age < PULSE_MS ? 0.9 - 0.85 * (age / PULSE_MS) : 0.05
      } else mouthLevel.current = null
      m.raf = requestAnimationFrame(tick)
    }
    const startMouth = () => {
      if (m.raf || reduced) return
      m.raf = requestAnimationFrame(tick)
    }
    const stopMouth = () => {
      if (m.raf) cancelAnimationFrame(m.raf)
      m.raf = 0
      mouthLevel.current = null
    }
    const fail = (key) => {
      store.set((s) => ({ ...s, state: 'error', error: key, face: { ...s.face, emotion: FACE.error, listening: false, talking: false } }))
      stopMouth()
    }
    /* a fatal failure with a named fallback restarts on that kind (once) */
    const failOrFallback = (key, fallback) => {
      if (fallback && fallback !== choice.kind && !fallbackKind) {
        store.set({ error: 'fellBack' })
        setFallbackKind(fallback)
        return
      }
      fail(key)
    }

    const onState = (state) => {
      if (!alive) return
      store.set((s) => ({
        ...s,
        state,
        // a fresh turn clears a stale message
        error: state === 'listening' || state === 'speaking' ? null : s.error,
        transcript: state === 'listening' ? s.transcript : dropEmptyUser(s.transcript),
      }))
      clearTimeout(timers.current.overlay)
      if (state !== 'thinking' && state !== 'speaking') c.mood = null
      if (state === 'interrupted') {
        setFace({ emotion: 'surprised', listening: false, talking: false })
        timers.current.overlay = setTimeout(() => {
          if (alive) setFace({ emotion: FACE[store.get().state] || 'happy' })
        }, SURPRISE_MS)
      } else {
        setFace({ emotion: c.mood || FACE[state] || 'happy', listening: state === 'listening', talking: state === 'speaking' && m.mode === 'sine' })
      }
      if (!c.waved && (state === 'speaking' || state === 'listening' || state === 'idle')) {
        c.waved = true
        if (!reduced) fireGesture('wave')
      }
      if (state === 'speaking') startMouth()
      else stopMouth()
      if (state === 'ended') {
        const nav = pendingNav.current
        pendingNav.current = null
        if (nav) navigateRef.current?.(nav)
        else endedRef.current?.()
      }
      clearTimeout(timers.current.thinking)
      if (state === 'thinking') {
        timers.current.thinking = setTimeout(() => {
          if (!alive) return
          c.session?.interrupt()
          store.set({ error: 'errTimeout' })
        }, THINKING_TIMEOUT_MS)
      }
    }

    const choice = selectSession({ requested: fallbackKind || kind, lang })
    if (fallbackKind && choice.kind) choice.reason = `fallback from ${kind || 'default'}: ${choice.reason}`
    store.set((s) => ({
      ...s,
      kind: choice.kind,
      wanted: choice.wanted,
      reason: choice.reason,
      needsKey: choice.needsKey,
      state: choice.kind ? 'connecting' : 'error',
      // after a fallback the message that explains it stays until the next turn
      error: choice.kind ? (fallbackKind ? 'fellBack' : null) : 'errNoSession',
      micOpen: false,
      face: { emotion: choice.kind ? 'thinking' : 'sad', gesture: null, listening: false, talking: false },
      transcript: emptyTranscript(),
      board: { card: null, quiz: null, answered: null },
    }))
    m.mode = null

    if (choice.kind) {
      ;(async () => {
        let mod
        try {
          mod = await choice.load()
        } catch (err) {
          console.error('voice: session module failed to load', err)
          if (alive) fail('errSocket')
          return
        }
        if (!alive) return
        c.player = audioContext ? createPlayer(audioContext) : null
        const session = mod.create({ ctx: audioContext, player: c.player, lang, page: pageRef.current, reduced })
        c.session = session
        c.unsubs.push(
          session.on('state', onState),
          session.on('userCaption', (e) => store.set((s) => ({ ...s, transcript: applyCaption(s.transcript, { role: 'user', ...e }) }))),
          session.on('ioCaption', (e) =>
            store.set((s) => ({
              ...s,
              transcript: e.interrupted ? markInterrupted(s.transcript) : applyCaption(s.transcript, { role: 'io', ...e }),
            })),
          ),
          session.on('mouth', (e) => {
            m.mode = e.mode
            setFace({ talking: e.mode === 'sine' && store.get().state === 'speaking' })
          }),
          session.on('boundary', () => {
            m.pulseAt = performance.now()
          }),
          session.on('mic', (e) => store.set({ micOpen: Boolean(e.open) })),
          /* the tutor's tools → the face and the board (docs/io-voice-plan.md §5.8) */
          session.on('tool', ({ effect }) => {
            if (!alive || !effect) return
            if (effect.type === 'mood') {
              c.mood = effect.mood
              setFace({ emotion: effect.mood })
            } else if (effect.type === 'card') store.set({ board: { card: effect.card, quiz: null, answered: null } })
            else if (effect.type === 'quiz') store.set({ board: { card: null, quiz: effect.quiz, answered: null } })
            else if (effect.type === 'quizAnswered') {
              store.set((s) => ({ ...s, board: { ...s.board, answered: { index: effect.index, correct: effect.correct } } }))
              if (!reduced) fireGesture(effect.correct ? 'bounce' : 'wave')
            }
          }),
          session.on('navigate', (e) => {
            pendingNav.current = e
          }),
          session.on('error', (e) => {
            if (!alive) return
            if (e.fatal) failOrFallback(e.key, e.fallback)
            else store.set({ error: e.key })
            // a rejected key brings the key field back (A2)
            if (e.key === 'errKey') store.set({ needsKey: true })
          }),
        )
        try {
          await session.start({ lang, page: pageRef.current })
        } catch (err) {
          console.error('voice: session failed to start', err)
          if (alive) failOrFallback(err?.key || 'errSocket', err?.fallback)
        }
      })()
    }

    return () => {
      alive = false
      clearTimeout(timers.current.overlay)
      clearTimeout(timers.current.thinking)
      c.unsubs.forEach((off) => off())
      stopMouth()
      c.session?.end?.().catch?.(() => {})
      c.player?.close()
      ctrl.current = null
    }
  }, [lang, kind, fallbackKind, audioContext, reduced, restartN, store, setFace])

  const api = useMemo(
    () => ({
      store,
      mouthLevel,
      listen: () => ctrl.current?.session?.listen?.(),
      stopListening: () => ctrl.current?.session?.stopListening?.(),
      /* the ring button: start / stop listening, or cut IO off and listen;
         on Live (which listens by itself) it mutes / unmutes the microphone */
      toggleListening: () => {
        const session = ctrl.current?.session
        if (!session) return
        const s = store.get().state
        if (s === 'listening') session.stopListening?.()
        else if (s === 'idle' || s === 'interrupted') session.listen?.()
        else if (s === 'speaking' || s === 'thinking') {
          session.interrupt()
          if (session.pushToTalk) session.listen?.()
        }
      },
      interrupt: () => ctrl.current?.session?.interrupt(),
      sendText: (text) => {
        const clean = String(text || '').trim()
        if (clean) ctrl.current?.session?.sendText(clean)
      },
      setMuted: (muted) => {
        ctrl.current?.session?.setMuted?.(muted)
        store.set({ muted })
      },
      micLevel: () => ctrl.current?.session?.micLevel?.() ?? 0,
      end: async () => {
        const c = ctrl.current
        if (!c) return
        try {
          await c.session?.end?.()
        } catch {
          /* already closed */
        }
      },
      /* the learner clicked a quiz option */
      answerQuiz: (index) => ctrl.current?.session?.answerQuiz?.(index),
      clearBoard: () => store.set({ board: { card: null, quiz: null, answered: null } }),
      /* Delete my data: everything talk mode keeps in this browser */
      forget: () => {
        forgetProfile()
        try {
          const keys = []
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i)
            if (k && k.startsWith(STORAGE_PREFIX)) keys.push(k)
          }
          keys.forEach((k) => localStorage.removeItem(k))
        } catch {
          /* storage blocked */
        }
        ctrl.current?.session?.forget?.()
        store.set({ transcript: emptyTranscript(), board: { card: null, quiz: null, answered: null } })
      },
      /* re-run session selection (after a key was pasted or forgotten) */
      restart: () => {
        setFallbackKind(null)
        setRestartN((n) => n + 1)
      },
    }),
    [store],
  )

  // Esc interrupts; T starts / stops listening (never inside a text field)
  useEffect(() => {
    const onKey = (e) => {
      if (e.isComposing) return
      if (e.key === 'Escape') {
        api.interrupt()
        return
      }
      if (e.code === 'KeyT' && !e.altKey && !e.ctrlKey && !e.metaKey && !e.repeat && !isEditable(e.target)) {
        e.preventDefault()
        api.toggleListening()
      }
    }
    const onHide = () => api.interrupt()
    window.addEventListener('keydown', onKey)
    window.addEventListener('pagehide', onHide)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pagehide', onHide)
    }
  }, [api])

  return api
}
