import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useMascot } from '../mascot/MascotProvider.jsx'

export const branchMax = (round) => round.max

// Branching scenario: chat messages + a situation, choices lead to other
// nodes. Every path reaches an end node - wrong turns show consequences,
// never a dead end. Round data declares `max` (points on the best path).
export default function BranchRound({ round, onDone }) {
  const { t, tx } = useI18n()
  const { react: mascotReact, companionActive } = useMascot()
  const [nodeId, setNodeId] = useState(round.start)
  const [earned, setEarned] = useState(0)
  const [feedback, setFeedback] = useState(null) // { text, points, next }

  const node = round.nodes[nodeId]

  const pick = (choice) => {
    const points = choice.points || 0
    setEarned((p) => p + points)
    if (choice.feedback) {
      // strong choices earn a celebration; weak ones get IO's explanation
      if (points >= 8) mascotReact('correct')
      else mascotReact('wrong', { text: choice.feedback })
      setFeedback({ text: choice.feedback, points, next: choice.next })
    } else {
      setNodeId(choice.next)
    }
  }

  const advance = () => {
    setNodeId(feedback.next)
    setFeedback(null)
  }

  return (
    <div className="play-card">
      {node.chat?.map((msg, i) => (
        <div className="msg-card" key={`${nodeId}-${i}`}>
          {msg.name && <div className="m-from">{tx(msg.name)}</div>}
          <div className="m-body">{tx(msg.text)}</div>
        </div>
      ))}
      {node.scene && <p className="q-text">{tx(node.scene)}</p>}

      {feedback ? (
        <div className={`feedback ${feedback.points > 0 ? 'ok' : 'bad'}`} role="status">
          <div className="f-title">
            <span aria-hidden="true">{feedback.points > 0 ? '✅' : '💡'}</span>
            {feedback.points > 0 ? t('guardians.correct') : t('guardians.notQuite')}
          </div>
          {(feedback.points >= 8 || !companionActive) && <p>{tx(feedback.text)}</p>}
          <div className="actions">
            <button type="button" className="btn-solid" onClick={advance}>
              {t('guardians.continue')} →
            </button>
          </div>
        </div>
      ) : node.end ? (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button type="button" className="btn-solid" onClick={() => onDone(Math.min(earned, round.max))}>
            {t('guardians.continue')} →
          </button>
        </div>
      ) : (
        <div className="choice-list">
          {node.choices.map((choice, i) => (
            <button key={i} type="button" className="choice-btn" onClick={() => pick(choice)}>
              {tx(choice.label)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
