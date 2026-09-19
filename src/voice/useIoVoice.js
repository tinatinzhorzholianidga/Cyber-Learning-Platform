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

export function useIoVoice({ lang, kind, audioContext, page, reduced = false }) {
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
      }),
    [],
  )
  const ctrl = useRef(null)
  const mouthLevel = useRef(null) // read by RobotModel every frame
  const mouth = useRef({ mode: null, pulseAt: 0, raf: 0 })
  const gestureN = useRef(0)
  const timers = useRef({ overlay: 0, thinking: 0 })
  const [restartN, setRestartN] = useState(0)
  // page context is read at start; a new object identity must not restart the session
  const pageRef = useRef(page)
  pageRef.current = page

  const setFace = useCallback((patch) => store.set((s) => ({ ...s, face: { ...s.face, ...patch } })), [store])

  useEffect(() => {
    let alive = true
    const c = { session: null, player: null, unsubs: [], waved: false }
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
      if (state === 'interrupted') {
        setFace({ emotion: 'surprised', listening: false, talking: false })
        timers.current.overlay = setTimeout(() => {
          if (alive) setFace({ emotion: FACE[store.get().state] || 'happy' })
        }, SURPRISE_MS)
      } else {
        setFace({ emotion: FACE[state] || 'happy', listening: state === 'listening', talking: state === 'speaking' && m.mode === 'sine' })
      }
      if (!c.waved && (state === 'speaking' || state === 'listening' || state === 'idle')) {
        c.waved = true
        if (!reduced) fireGesture('wave')
      }
      if (state === 'speaking') startMouth()
      else stopMouth()
      clearTimeout(timers.current.thinking)
      if (state === 'thinking') {
        timers.current.thinking = setTimeout(() => {
          if (!alive) return
          c.session?.interrupt()
          store.set({ error: 'errTimeout' })
        }, THINKING_TIMEOUT_MS)
      }
    }

    const choice = selectSession({ requested: kind, lang })
    store.set((s) => ({
      ...s,
      kind: choice.kind,
      wanted: choice.wanted,
      reason: choice.reason,
      needsKey: choice.needsKey,
      state: choice.kind ? 'connecting' : 'error',
      error: choice.kind ? null : 'errNoSession',
      micOpen: false,
      face: { emotion: choice.kind ? 'thinking' : 'sad', gesture: null, listening: false, talking: false },
      transcript: emptyTranscript(),
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
          session.on('error', (e) => {
            if (!alive) return
            if (e.fatal) fail(e.key)
            else store.set({ error: e.key })
          }),
        )
        try {
          await session.start({ lang, page: pageRef.current })
        } catch (err) {
          console.error('voice: session failed to start', err)
          if (alive) fail(err?.key || 'errSocket')
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
  }, [lang, kind, audioContext, reduced, restartN, store, setFace])

  const api = useMemo(
    () => ({
      store,
      mouthLevel,
      listen: () => ctrl.current?.session?.listen?.(),
      stopListening: () => ctrl.current?.session?.stopListening?.(),
      /* the ring button: start / stop listening, or cut IO off and listen */
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
      /* Delete my data: everything talk mode keeps in this browser */
      forget: () => {
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
        store.set({ transcript: emptyTranscript() })
      },
      /* re-run session selection (after a key was pasted or forgotten) */
      restart: () => setRestartN((n) => n + 1),
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
