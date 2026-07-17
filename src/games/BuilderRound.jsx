import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useMascot } from '../mascot/MascotProvider.jsx'

export const BUILDER_MAX = 15

// Toggle options to build up a defense/plan; a live meter shows the effect.
// Submit unlocks when the meter reaches the target.
export default function BuilderRound({ round, onDone }) {
  const { t, tx } = useI18n()
  const { react: mascotReact, companionActive } = useMascot()
  const [selected, setSelected] = useState(() => new Set())
  const [submitted, setSubmitted] = useState(false)

  const toggle = (i) => {
    if (submitted) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const value = [...selected].reduce((sum, i) => sum + round.options[i].value, 0)
  const meter = Math.max(0, Math.min(100, Math.round((value / round.target) * 100)))
  const ready = value >= round.target
  const pickedNegative = [...selected].some((i) => round.options[i].value < 0)
  const earned = pickedNegative ? Math.round(BUILDER_MAX * 0.6) : BUILDER_MAX

  return (
    <div className="play-card">
      <p className="q-text">{tx(round.prompt)}</p>
      <div className="meter-label">
        <span>{tx(round.meterLow)}</span>
        <span>{tx(round.meterHigh)}</span>
      </div>
      <div className="meter" role="progressbar" aria-valuenow={meter} aria-valuemin={0} aria-valuemax={100}>
        <div className="fill" style={{ width: `${meter}%` }} />
      </div>
      {round.options.map((option, i) => {
        const on = selected.has(i)
        let cls = 'builder-opt'
        if (on) cls += option.value < 0 ? ' on negative' : ' on'
        return (
          <button key={i} type="button" className={cls} aria-pressed={on} onClick={() => toggle(i)} disabled={submitted}>
            <span>
              {tx(option.label)}
              {option.note && <span className="b-note">{tx(option.note)}</span>}
            </span>
            <span aria-hidden="true">{option.value > 0 ? `+${option.value}` : option.value}</span>
          </button>
        )
      })}
      {!submitted ? (
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            type="button"
            className="btn-solid"
            disabled={!ready}
            style={!ready ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            onClick={() => {
              setSubmitted(true)
              if (pickedNegative) mascotReact('wrong', { text: round.explainNegative || round.explain })
              else mascotReact('correct')
            }}
          >
            {t('guardians.submit')}
          </button>
        </div>
      ) : (
        <div className={`feedback ${pickedNegative ? 'bad' : 'ok'}`} role="status">
          <div className="f-title">
            <span aria-hidden="true">{pickedNegative ? '💡' : '✅'}</span>
            {pickedNegative ? t('guardians.notQuite') : t('guardians.correct')}
          </div>
          {(!pickedNegative || !companionActive) && (
            <p>{tx(pickedNegative && round.explainNegative ? round.explainNegative : round.explain)}</p>
          )}
          <div className="actions">
            <button type="button" className="btn-solid" onClick={() => onDone(earned)}>
              {t('guardians.continue')} →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
