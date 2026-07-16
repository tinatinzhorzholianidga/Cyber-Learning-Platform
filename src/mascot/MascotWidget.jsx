import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { MASCOT_TIPS } from '../content/mascot.js'
import RobotCanvas, { useReducedMotion } from './RobotCanvas.jsx'

/* The floating helper, as he would appear on the real site:
   the mascot in the corner + a clay speech bubble with rotating tips.
   Tapping the character (or the button) shows the next tip. */
export default function MascotWidget({ character = 'robot' }) {
  const { t, tx } = useI18n()
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(true)
  const [tipIdx, setTipIdx] = useState(-1) // -1 = greeting
  const [gesture, setGesture] = useState(null)
  const gestureId = useRef(0)

  const isHero = character === 'hero'
  const greeting = isHero ? t('mascot.widget.greetingHero') : t('mascot.widget.greeting')
  const fullText = tipIdx < 0 ? greeting : tx(MASCOT_TIPS[tipIdx])
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
    setTipIdx((i) => (i + 1) % MASCOT_TIPS.length)
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
      <div className="mascot-bubble" role="status" aria-live="polite">
        <p>{shown}</p>
        <div className="mascot-bubble-actions">
          <button type="button" className="mascot-tip-btn" onClick={nextTip}>
            💡 {t('mascot.widget.nextTip')}
          </button>
        </div>
      </div>
      <div className="mascot-widget-bot">
        <button type="button" className="mascot-close" onClick={() => setOpen(false)} aria-label={t('mascot.widget.close')}>
          ✕
        </button>
        <RobotCanvas
          size={150}
          character={character}
          label={isHero ? t('mascot.widget.labelHero') : t('mascot.widget.label')}
          emotion="happy"
          gesture={gesture}
          talking={!reduced && shown.length < fullText.length}
          follow
          idle
          onTap={nextTip}
        />
      </div>
    </div>
  )
}
