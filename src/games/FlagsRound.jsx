import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'

export const flagsMax = (round) => round.items.filter((i) => i.flag).length * 5

// "Tap every red flag" — multi-select over a list of messages/posts,
// then a reveal with per-item explanations.
export default function FlagsRound({ round, onDone }) {
  const { t, tx } = useI18n()
  const [selected, setSelected] = useState(() => new Set())
  const [checked, setChecked] = useState(false)

  const toggle = (i) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const hits = round.items.filter((item, i) => item.flag && selected.has(i)).length
  const wrong = round.items.filter((item, i) => !item.flag && selected.has(i)).length
  const totalFlags = round.items.filter((i) => i.flag).length
  const max = flagsMax(round)
  const earned = Math.max(0, Math.min(max, hits * 5 - wrong * 2))
  const perfect = hits === totalFlags && wrong === 0

  return (
    <div className="play-card">
      <p className="q-text">{tx(round.prompt)}</p>
      <div role="group" aria-label={tx(round.prompt)}>
        {round.items.map((item, i) => {
          let cls = 'flag-item'
          if (!checked && selected.has(i)) cls += ' selected'
          if (checked) {
            if (item.flag && selected.has(i)) cls += ' result-hit'
            else if (item.flag) cls += ' result-miss'
            else if (selected.has(i)) cls += ' result-wrong'
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={checked}
              aria-pressed={selected.has(i)}
              onClick={() => toggle(i)}
            >
              <span className="f-check" aria-hidden="true">
                {selected.has(i) ? '✓' : ''}
              </span>
              <span>
                {item.from && <strong>{tx(item.from)}: </strong>}
                {tx(item.text)}
                {checked && (item.flag || selected.has(i)) && (
                  <span className="flag-explain">
                    {item.flag ? '🚩 ' : '✅ '}
                    {tx(item.explain)}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
      {!checked ? (
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            type="button"
            className="btn-solid"
            disabled={selected.size === 0}
            style={selected.size === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            onClick={() => setChecked(true)}
          >
            {t('guardians.check')}
          </button>
        </div>
      ) : (
        <div className={`feedback ${perfect ? 'ok' : 'bad'}`} role="status">
          <div className="f-title">
            <span aria-hidden="true">{perfect ? '✅' : '💡'}</span>
            {perfect ? t('guardians.correct') : t('guardians.notQuite')} · {hits}/{totalFlags} 🚩
          </div>
          <p>{tx(round.explain)}</p>
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
