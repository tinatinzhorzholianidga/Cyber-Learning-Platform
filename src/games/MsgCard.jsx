import { useI18n } from '../i18n/I18nContext.jsx'

// A message/document card shown inside game rounds (email, DM, SMS, post).
export default function MsgCard({ card }) {
  const { tx } = useI18n()
  if (!card) return null
  return (
    <div className="msg-card">
      {card.from && <div className="m-from">{tx(card.from)}</div>}
      {card.meta && <div className="m-meta">{tx(card.meta)}</div>}
      <div className="m-body">{tx(card.body)}</div>
    </div>
  )
}
