import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useProgress } from '../store/progress.jsx'
import { getMascotContext, MASCOT_REACTIONS } from '../content/mascot.js'
import RobotCanvas, { useReducedMotion } from './RobotCanvas.jsx'
import { useMascot } from './MascotProvider.jsx'

// bigger IO on monitors, compact on phones
function useWidgetSize() {
  const [size, setSize] = useState(() =>
    typeof window === 'undefined' ? 150 : window.innerWidth >= 1100 ? 230 : window.innerWidth >= 720 ? 185 : 150,
  )
  useEffect(() => {
    const onResize = () => setSize(window.innerWidth >= 1100 ? 230 : window.innerWidth >= 720 ? 185 : 150)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

/* The floating helper, as he appears on the real site.
   - flies in from the corner on mount, then waves hello
   - tips match the page: mission topics, certificate congratulations,
     parent guidance in the Parents hub
   - during missions he is the coach: wrong answers become his
     explanations (thinking face), right answers get a move + praise,
     finished missions get a celebration (fireworks render separately) */
export default function MascotWidget({ character = 'robot' }) {
  const { t, tx } = useI18n()
  const { pathname } = useLocation()
  const { progress } = useProgress()
  const reduced = useReducedMotion()
  const { companion, react: mascotReact, setDockMounted, setDockOpen } = useMascot()
  const [open, setOpen] = useState(true)
  const [arrived, setArrived] = useState(reduced)
  const [tipIdx, setTipIdx] = useState(-1) // -1 = greeting / context opener
  const [gesture, setGesture] = useState(null)
  const [reaction, setReaction] = useState(null) // {en,ka} node while celebrating
  const gestureId = useRef(0)
  const reactionTimer = useRef(null)

  const isHero = character === 'hero'
  const size = useWidgetSize()
  const context = useMemo(() => getMascotContext(pathname), [pathname])
  const pool = context.tips

  // tell the provider whether the bubble can carry mission explanations
  useEffect(() => {
    setDockMounted(true)
    return () => setDockMounted(false)
  }, [setDockMounted])
  useEffect(() => {
    setDockOpen(open)
  }, [open, setDockOpen])

  // entrance: let the fly-in play, then greet with a wave
  useEffect(() => {
    if (reduced) return undefined
    const timer = setTimeout(() => {
      setArrived(true)
      gestureId.current += 1
      setGesture({ id: gestureId.current, type: 'wave' })
    }, 900)
    return () => clearTimeout(timer)
  }, [reduced])

  // when the user navigates, come back to the context opener
  useEffect(() => {
    setTipIdx(-1)
    mascotReact('clear')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // companion gestures (correct answers, celebrations)
  useEffect(() => {
    if (companion?.gesture) setGesture(companion.gesture)
  }, [companion])

  // celebrate mission completions while he is on screen
  const doneCount = Object.values(progress.guardians.missions).filter((m) => m.done).length
  const examDone = Boolean(progress.guardians.missions.g10?.done)
  const prevDone = useRef(null)
  const prevExam = useRef(examDone)
  useEffect(() => {
    if (prevDone.current != null && doneCount > prevDone.current) {
      const passedExamNow = examDone && !prevExam.current
      setReaction(passedExamNow ? MASCOT_REACTIONS.exam : MASCOT_REACTIONS.mission[doneCount % MASCOT_REACTIONS.mission.length])
      gestureId.current += 1
      setGesture({ id: gestureId.current, type: 'bounce' })
      clearTimeout(reactionTimer.current)
      reactionTimer.current = setTimeout(() => setReaction(null), 6000)
    }
    prevDone.current = doneCount
    prevExam.current = examDone
  }, [doneCount, examDone])
  useEffect(() => () => clearTimeout(reactionTimer.current), [])

  const greeting = isHero ? t('mascot.widget.greetingHero') : t('mascot.widget.greeting')
  const praisePool = t('mascot.companion.praise')
  let fullText
  if (companion?.mode === 'wrong' && companion.text) {
    fullText = tx(companion.text)
  } else if (companion?.mode === 'correct') {
    fullText = praisePool[companion.id % praisePool.length]
  } else if (companion?.mode === 'celebrate') {
    fullText = t('mascot.companion.missionDone')
  } else if (reaction) {
    fullText = tx(reaction)
  } else if (tipIdx < 0) {
    fullText = context.opener ? tx(context.opener) : greeting
  } else {
    fullText = tx(pool[tipIdx % pool.length])
  }
  const [shown, setShown] = useState(fullText)

  // typewriter effect (instant when reduced motion is on)
  useEffect(() => {
    if (reduced) {
      setShown(fullText)
      return undefined
    }
    setShown('')
    // time-based typing: every message finishes in ~1.3s even when the
    // 3D canvas is eating the timer budget on slow machines
    const start = performance.now()
    const duration = Math.min(1300, 350 + fullText.length * 8)
    const iv = setInterval(() => {
      const f = Math.min(1, (performance.now() - start) / duration)
      setShown(fullText.slice(0, Math.ceil(fullText.length * f)))
      if (f >= 1) clearInterval(iv)
    }, 30)
    return () => clearInterval(iv)
  }, [fullText, reduced])

  const nextTip = () => {
    setReaction(null)
    mascotReact('clear')
    setTipIdx((i) => (i + 1) % pool.length)
    gestureId.current += 1
    setGesture({ id: gestureId.current, type: gestureId.current % 4 === 0 ? 'bounce' : 'wave' })
  }

  if (!open) {
    return (
      <button type="button" className="mascot-widget-chip" onClick={() => setOpen(true)} aria-label={t('mascot.widget.open')}>
        {isHero ? '🦸' : '🤖'}
      </button>
    )
  }

  const emotion = companion?.mood || (reaction ? 'celebrate' : 'happy')
  const bubbleMood = companion?.mode === 'wrong' ? ' is-wrong' : companion?.mode ? ' is-correct' : ''

  return (
    <div className="mascot-widget">
      {arrived && (
        <div className={`mascot-bubble${bubbleMood}`} role="status" aria-live="polite">
          <p>{shown}</p>
          {!companion && (
            <div className="mascot-bubble-actions">
              <button type="button" className="mascot-tip-btn" onClick={nextTip}>
                💡 {t('mascot.widget.nextTip')}
              </button>
            </div>
          )}
        </div>
      )}
      <div className="mascot-widget-bot">
        <button type="button" className="mascot-close" onClick={() => setOpen(false)} aria-label={t('mascot.widget.close')}>
          ✕
        </button>
        <RobotCanvas
          size={size}
          character={character}
          label={isHero ? t('mascot.widget.labelHero') : t('mascot.widget.label')}
          emotion={emotion}
          gesture={gesture}
          talking={!reduced && arrived && shown.length < fullText.length}
          follow
          idle
          onTap={companion ? undefined : nextTip}
        />
      </div>
    </div>
  )
}
