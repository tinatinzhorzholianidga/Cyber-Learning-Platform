import { Link, Navigate } from 'react-router-dom'
import { MISSIONS, missionMax } from '../../content/guardians/index.js'
import { useI18n } from '../../i18n/I18nContext.jsx'
import { useProgress } from '../../store/progress.jsx'

export default function CertificatePage() {
  const { t, lang } = useI18n()
  const { progress, setCertName } = useProgress()
  const missions = progress.guardians.missions

  const allDone = MISSIONS.every((m) => missions[m.id]?.done)
  if (!allDone) return <Navigate to="/guardians" replace />

  const totalPoints = MISSIONS.reduce((sum, m) => sum + (missions[m.id]?.best ?? 0), 0)
  const totalMax = MISSIONS.reduce((sum, m) => sum + missionMax(m), 0)
  // Format Georgian dates by hand — not every browser ships the ka locale,
  // and the silent fallback would print an English date on the certificate.
  const MONTHS_KA = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი']
  const now = new Date()
  const date =
    lang === 'ka'
      ? `${now.getDate()} ${MONTHS_KA[now.getMonth()]}, ${now.getFullYear()}`
      : now.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <Link to="/guardians" className="back-btn">
        ← {t('guardians.backToMap')}
      </Link>

      <p style={{ textAlign: 'center', color: '#c2c8ee', marginBottom: 18 }}>
        🎉 {t('guardians.certUnlocked')}
      </p>

      <div className="no-print" style={{ textAlign: 'center', marginBottom: 18 }}>
        <label htmlFor="cert-name" style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
          {t('guardians.certNameLabel')}
        </label>
        <input
          id="cert-name"
          className="cert-input"
          type="text"
          maxLength={60}
          value={progress.guardians.certName}
          placeholder={t('guardians.certNamePlaceholder')}
          onChange={(e) => setCertName(e.target.value)}
        />
      </div>

      <div className="cert-sheet">
        <div className="medal" aria-hidden="true">
          🛡️🏆🛡️
        </div>
        <h1>{t('guardians.certTitle')}</h1>
        <div className="c-sub">CyberHero · კიბერგმირი</div>
        <div>{t('guardians.certifies')}</div>
        <div className="c-name">{progress.guardians.certName || ' '}</div>
        <p className="c-body">{t('guardians.certBody')}</p>
        <div className="c-score">
          ⚡ {t('guardians.points')}: {totalPoints} / {totalMax}
        </div>
        <div className="c-date">{date}</div>
      </div>

      <div className="article-actions no-print" style={{ justifyContent: 'center', marginTop: 20 }}>
        <button type="button" className="btn-solid" onClick={() => window.print()}>
          🖨️ {t('guardians.print')}
        </button>
      </div>
    </div>
  )
}
