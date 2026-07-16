import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useProgress } from '../store/progress.jsx'
import { getMascotContext, MASCOT_REACTIONS } from '../content/mascot.js'
import RobotCanvas, { useReducedMotion } from './RobotCanvas.jsx'

/* The floating helper, as he appears on the real site.
   - flies in from the corner on mount, then waves hello
   - tips match the page: mission topics, certificate congratulations,
     parent guidance in the Parents hub
   - watches mission progress and celebrates completions */
export default function MascotWidget({ character = 'robot' }) {
  const { t, tx } = useI18n()
  const { pathname } = useLocation()
  const { progress } = useProgress()
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(true)
  const [arrived, setArrived] = useState(reduced)
  const [tipIdx, setTipIdx] = useState(-1) // -1 = greeting / context opener
  const [gesture, setGesture] = useState(null)
  const [reaction, setReaction] = useState(null) // {en,ka} node while celebrating
  const gestureId = useRef(0)
  const reactionTimer = useRef(null)

  const isHero = character === 'hero'
  const context = useMemo(() => getMascotContext(pathname), [pathname])
  const pool = context.tips

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
  }, [pathname])

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
      setGesture({ id: gestureId.current, type: passedExamNow ? 'fly' : 'bounce' })
      clearTimeout(reactionTimer.current)
      reactionTimer.current = setTimeout(() => setReaction(null), 6000)
    }
    prevDone.current = doneCount
    prevExam.current = examDone
  }, [doneCount, examDone])
  useEffect(() => () => clearTimeout(reactionTimer.current), [])

  const greeting = isHero ? t('mascot.widget.greetingHero') : t('mascot.widget.greeting')
  const fullText = reaction
    ? tx(reaction)
    : tipIdx < 0
      ? context.opener
        ? tx(context.opener)
        : greeting
      : tx(pool[tipIdx % pool.length])
  const [shown, setShown] = useState(fullText)

  // typewriter effect (instant when reduced motion is on)
  useEffect(() => {
    if (reduced) {
      setShown(fullText)
      return undefined
    }
    setShown('')
    let i = 0
    const iv = setInterval(() => {
      i += 2
      setShown(fullText.slice(0, i))
      if (i >= fullText.length) clearInterval(iv)
    }, 26)
    return () => clearInterval(iv)
  }, [fullText, reduced])

  const nextTip = () => {
    setReaction(null)
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

  return (
    <div className="mascot-widget">
      {arrived && (
        <div className="mascot-bubble" role="status" aria-live="polite">
          <p>{shown}</p>
          <div className="mascot-bubble-actions">
            <button type="button" className="mascot-tip-btn" onClick={nextTip}>
              💡 {t('mascot.widget.nextTip')}
            </button>
          </div>
        </div>
      )}
      <div className="mascot-widget-bot">
        <button type="button" className="mascot-close" onClick={() => setOpen(false)} aria-label={t('mascot.widget.close')}>
          ✕
        </button>
        <RobotCanvas
          size={150}
          character={character}
          label={isHero ? t('mascot.widget.labelHero') : t('mascot.widget.label')}
          emotion={reaction ? 'celebrate' : 'happy'}
          gesture={gesture}
          talking={!reduced && arrived && shown.length < fullText.length}
          follow
          idle
          onTap={nextTip}
        />
      </div>
    </div>
  )
}
