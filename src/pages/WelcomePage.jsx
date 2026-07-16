import { Link } from 'react-router-dom'
import Arrow from '../components/Arrow.jsx'
import { PARENTS_TIER, TIERS } from '../content/tiers.js'
import { useI18n } from '../i18n/I18nContext.jsx'

// Bento layout (3-col): Guardians is the 2×2 featured tile, the five
// coming-soon tracks fill around it, Teachers & Parents spans the full row.
function TierCard({ tier, variant = '' }) {
  const { t, tx } = useI18n()
  const to = tier.active ? tier.route : `/track/${tier.id}`
  const classes = ['tier-card', tier.active ? '' : 'is-soon', variant].filter(Boolean).join(' ')

  const inner =
    variant === 'is-wide' ? (
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
        {variant === 'featured' && (
          <span className="tile-chips">
            <span>🎯 {t('welcome.chipMissions')}</span>
            <span>🏆 {t('welcome.chipCert')}</span>
            <span>⚡ {t('welcome.chipTone')}</span>
          </span>
        )}
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
  const byId = Object.fromEntries(TIERS.map((tier) => [tier.id, tier]))
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
        <TierCard tier={byId.guardians} variant="featured" />
        <TierCard tier={byId.kids} />
        <TierCard tier={byId.cadets} />
        <TierCard tier={byId.campus} />
        <TierCard tier={byId.work} />
        <TierCard tier={byId.seniors} variant="span-sm" />
        <TierCard tier={PARENTS_TIER} variant="is-wide" />
      </div>
    </div>
  )
}
