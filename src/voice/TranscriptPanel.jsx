/* The talk-mode transcript (docs/io-voice-plan.md §5.1): the last two
   turns plus the live one, the learner's words in a second style, IO's
   caption growing as it arrives, and its own polite live region that
   announces completed sentences only.

   variant 'bubble'   inside IO's bubble at a fixed height (desktop)
           'sheet'    inside the bottom sheet (narrow viewports)
           'compact'  one aria-hidden line in the bubble while the sheet
                      carries the live region */
import { useEffect, useRef } from 'react'
import { useStore } from './store.js'
import { lastTurns } from './transcript.js'
import { VOICE } from './i18n.js'

export default function TranscriptPanel({ store, lang, variant = 'bubble' }) {
  const transcript = useStore(store, (s) => s.transcript)
  const state = useStore(store, (s) => s.state)
  const t = VOICE[lang] || VOICE.ka
  const box = useRef(null)

  useEffect(() => {
    const el = box.current
    if (el) el.scrollTop = el.scrollHeight
  }, [transcript, state])

  if (variant === 'compact') {
    const lastIo = [...transcript.turns].reverse().find((turn) => turn.role === 'io')
    return (
      <p className="voice-compact" aria-hidden="true" lang={lang}>
        {lastIo?.text || ' '}
      </p>
    )
  }

  const turns = lastTurns(transcript, 3)
  return (
    <div className={`voice-transcript voice-transcript--${variant}`} ref={box} lang={lang}>
      {turns.map((turn) => (
        <div key={turn.id} className="voice-turn" data-role={turn.role} data-open={!turn.final || undefined}>
          <span className="voice-turn-role">{turn.role === 'user' ? t.you : t.io}</span>
          <span className="voice-turn-text">
            {turn.text || (turn.role === 'user' ? '…' : '')}
            {turn.interrupted ? <span className="voice-turn-mark"> {t.interruptedMark}</span> : null}
          </span>
        </div>
      ))}
      {state === 'thinking' ? (
        <div className="voice-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ) : null}
      {/* completed sentences, one node each, so assistive tech reads additions */}
      <div className="sr-only" aria-live="polite" aria-atomic="false">
        {transcript.announced.map((s, i) => (
          <span key={`${i}-${s.length}`}>{s} </span>
        ))}
      </div>
    </div>
  )
}
