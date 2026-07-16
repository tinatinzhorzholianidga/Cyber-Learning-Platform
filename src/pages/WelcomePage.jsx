import { Link } from 'react-router-dom'
import Arrow from '../components/Arrow.jsx'
import { PARENTS_TIER, TIERS } from '../content/tiers.js'
import { useI18n } from '../i18n/I18nContext.jsx'

function TierCard({ tier, wide = false }) {
  const { t, tx } = useI18n()
  const to = tier.active ? tier.route : `/track/${tier.id}`
  const classes = ['tier-card', tier.active ? '' : 'is-soon', wide ? 'is-wide' : '']
    .filter(Boolean)
    .join(' ')

  const inner = wide ? (
    <>
      <span className="emoji" aria-hidden="true">
        {tier.emoji}
      </span>
      <span className="wide-body">
        <span className="tag">{tx(tier.tag)}</span>
        <h3>{tx(tier.name)}</h3>
        <span className="desc">{tx(tier.desc)}</span>
      </span>
      <span className="go">
        {t('welcome.open')} <Arrow />
      </span>
    </>
  ) : (
    <>
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
    </>
  )

  return (
    <Link to={to} className={classes} style={{ '--c': tier.color }}>
      {inner}
    </Link>
  )
}

export default function WelcomePage() {
  const { t } = useI18n()
  return (
    <div className="fade-in">
      <section className="hero">
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
        {TIERS.map((tier) => (
          <TierCard key={tier.id} tier={tier} />
        ))}
      </div>

      <h2 className="section-label">{t('welcome.adults')}</h2>
      <div className="tier-grid">
        <TierCard tier={PARENTS_TIER} wide />
      </div>
    </div>
  )
}
