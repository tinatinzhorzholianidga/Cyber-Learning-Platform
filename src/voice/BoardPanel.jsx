/* IO's board (brief Phase 5; docs/io-voice-plan.md §4.3): what show_card
   and ask_quiz put beside him - numbered steps, a checklist, one of the
   shipped inline diagrams, a link, or a three-option quiz the learner
   answers by click (or by voice). Results carry an icon and text, never
   colour alone. */
import { useStore } from './store.js'
import { VOICE } from './i18n.js'
import PhishingEmail from './diagrams/phishing_email.jsx'
import PasswordStrength from './diagrams/password_strength.jsx'
import TwoFactorFlow from './diagrams/two_factor_flow.jsx'

const DIAGRAMS = { phishing_email: PhishingEmail, password_strength: PasswordStrength, two_factor_flow: TwoFactorFlow }

export default function BoardPanel({ store, lang, onAnswer, onClose }) {
  const board = useStore(store, (s) => s.board)
  const t = VOICE[lang] || VOICE.ka
  if (!board?.card && !board?.quiz) return null

  return (
    <section className="voice-board" aria-label={t.boardLabel} lang={lang}>
      {board.card ? <Card card={board.card} lang={lang} t={t} /> : null}
      {board.quiz ? <Quiz quiz={board.quiz} answered={board.answered} t={t} onAnswer={onAnswer} /> : null}
      <button type="button" className="voice-btn voice-board-close" onClick={onClose}>
        {t.boardClose}
      </button>
    </section>
  )
}

function Card({ card, lang, t }) {
  const Diagram = card.kind === 'diagram' ? DIAGRAMS[card.diagram] : null
  return (
    <div className="voice-card" data-kind={card.kind}>
      <h3 className="voice-card-title">{card.title}</h3>
      {card.kind === 'steps' ? (
        <ol className="voice-card-list">
          {card.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : null}
      {card.kind === 'checklist' ? (
        <ul className="voice-card-list voice-card-check">
          {card.items.map((item, i) => (
            <li key={i}>
              <span aria-hidden="true">☐</span> {item}
            </li>
          ))}
        </ul>
      ) : null}
      {Diagram ? <Diagram lang={lang} /> : null}
      {card.kind === 'link' && card.url ? (
        <a className="voice-card-link" href={card.url} target="_blank" rel="noopener noreferrer">
          {t.openLink} <span aria-hidden="true">→</span>
        </a>
      ) : null}
    </div>
  )
}

function Quiz({ quiz, answered, t, onAnswer }) {
  return (
    <div className="voice-quiz" role="group" aria-label={t.quizTitle}>
      <h3 className="voice-card-title">{t.quizTitle}</h3>
      <p className="voice-quiz-scenario">{quiz.scenario}</p>
      <div className="voice-quiz-options">
        {quiz.options.map((option, i) => {
          const picked = answered?.index === i
          const state = answered ? (i === quiz.correctIndex ? 'correct' : picked ? 'wrong' : 'other') : 'open'
          return (
            <button key={i} type="button" className="voice-quiz-option" data-state={state} disabled={Boolean(answered)} onClick={() => onAnswer(i)} aria-pressed={picked}>
              <span className="voice-quiz-index" aria-hidden="true">
                {i + 1}
              </span>
              {option}
            </button>
          )
        })}
      </div>
      {answered ? (
        <p className="voice-quiz-result" role="status" data-correct={answered.correct || undefined}>
          <span aria-hidden="true">{answered.correct ? '✓' : '✗'}</span> {answered.correct ? t.quizCorrect : t.quizWrong}
        </p>
      ) : null}
    </div>
  )
}
