import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useMascot } from '../mascot/MascotProvider.jsx'
import MsgCard from './MsgCard.jsx'

export const CHOICE_MAX = 10

// One question, several options, one correct. Optional message card above,
// optional countdown timer (used by the final exam).
export default function ChoiceRound({ round, timer = 0, onDone }) {
  const { t, tx } = useI18n()
  const { react: mascotReact, companionActive } = useMascot()
  const [picked, setPicked] = useState(null) // option index
  const [timedOut, setTimedOut] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timer)
  const answered = picked !== null || timedOut
  const intervalRef = useRef(null)

  const pick = (i) => {
    setPicked(i)
    if (round.options[i].correct) mascotReact('correct')
    else mascotReact('wrong', { text: round.explain })
  }

  useEffect(() => {
    if (timedOut) mascotReact('wrong', { text: round.explain })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedOut])

  useEffect(() => {
    if (!timer) return undefined
    intervalRef.current = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setTimedOut(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [timer])

  useEffect(() => {
    if (answered && intervalRef.current) clearInterval(intervalRef.current)
  }, [answered])

  const correct = picked !== null && round.options[picked].correct

  return (
    <div>
      {timer > 0 && !answered && (
        <div className={`timer-pill ${timeLeft <= 5 ? 'low' : ''}`} role="timer">
          ⏱ {t('guardians.timeLeft')}: {timeLeft}
        </div>
      )}
      <div className="play-card">
        <MsgCard card={round.card} />
        <p className="q-text">{tx(round.q)}</p>
        <div className="choice-list">
          {round.options.map((option, i) => {
            let cls = 'choice-btn'
            if (answered) {
              if (i === picked) cls += option.correct ? ' picked-ok' : ' picked-bad'
              else if (option.correct) cls += ' reveal-ok'
            }
            return (
              <button key={i} type="button" className={cls} disabled={answered} onClick={() => pick(i)}>
                {tx(option.label)}
              </button>
            )
          })}
        </div>
        {answered && (
          <div className={`feedback ${correct ? 'ok' : 'bad'}`} role="status">
            <div className="f-title">
              <span aria-hidden="true">{correct ? '✅' : '💡'}</span>
              {correct ? t('guardians.correct') : t('guardians.notQuite')}
            </div>
            {timedOut && <p>{t('guardians.timeUp')}</p>}
            {/* wrong answers are explained by IO in his bubble; the text
                stays inline only when the helper is closed or unavailable */}
            {(correct || !companionActive) && <p>{tx(round.explain)}</p>}
            <div className="actions">
              <button
                type="button"
                className="btn-solid"
                onClick={() => onDone(correct ? CHOICE_MAX : 0)}
              >
                {t('guardians.continue')} →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
