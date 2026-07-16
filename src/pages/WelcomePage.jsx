import { Link } from 'react-router-dom'
import Arrow from '../components/Arrow.jsx'
import { PARENTS_TIER, TIERS } from '../content/tiers.js'
import { useI18n } from '../i18n/I18nContext.jsx'

// One uniform grid: every card the same size. The two active sections
// (Cyber Guardians, Teachers & Parents) come first so they are seen.
function TierCard({ tier }) {
  const { t, tx } = useI18n()
  const to = tier.active ? tier.route : `/track/${tier.id}`
  const classes = ['tier-card', tier.active ? '' : 'is-soon'].filter(Boolean).join(' ')

  return (
    <Link to={to} className={classes} style={{ '--c': tier.color }}>
      {tier.active && <span className="live-chip">{t('welcome.activeBadge')}</span>}
      <span className="emoji" aria-hidden="true">
        {tier.emoji}
      </span>
      <span className="tag">{tx(tier.tag)}</span>
      <h3>{tx(tier.name)}</h3>
      <span className="desc">{tx(tier.desc)}</span>
      {tier.active ? (
        <span className="go">
          {t('welcome.start')} <Arrow />
        </span>
      ) : (
        <span className="soon-chip">🚧 {t('welcome.comingSoon')}</span>
      )}
    </Link>
  )
}

export default function WelcomePage() {
  const { t } = useI18n()
  const byId = Object.fromEntries(TIERS.map((tier) => [tier.id, tier]))
  const ordered = [byId.guardians, PARENTS_TIER, byId.kids, byId.cadets, byId.campus, byId.work, byId.seniors]
  return (
    <div className="fade-in">
      <section className="hero">
        <span className="sticker s1" aria-hidden="true">
          🛡️
        </span>
        <span className="sticker s2" aria-hidden="true">
          🔒
        </span>
        <span className="sticker s3" aria-hidden="true">
          ⭐
        </span>
        <span className="sticker s4" aria-hidden="true">
          📱
        </span>
        <span className="badge">✦ {t('welcome.badge')}</span>
        <h1>
          {t('welcome.title1')}
          <br />
          <span className="grad">{t('welcome.title2')}</span>
        </h1>
        <p>{t('welcome.sub')}</p>
      </section>

      <h2 className="section-label">{t('welcome.pick')}</h2>
      <div className="tier-grid">
        {ordered.map((tier) => (
          <TierCard key={tier.id} tier={tier} />
        ))}
      </div>
    </div>
  )
}
