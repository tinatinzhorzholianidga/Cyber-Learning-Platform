import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'

export default function Header() {
  const { t, lang, setLang } = useI18n()
  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <span className="brand-logo" aria-hidden="true">
          🛡️
        </span>
        <span>
          {t('brand.name')}
          <small>{t('brand.tag')}</small>
        </span>
      </Link>
      <div className="lang-toggle" role="group" aria-label={t('nav.languageLabel')}>
        <button
          type="button"
          className={lang === 'en' ? 'active' : ''}
          aria-pressed={lang === 'en'}
          onClick={() => setLang('en')}
        >
          EN
        </button>
        <button
          type="button"
          className={lang === 'ka' ? 'active' : ''}
          aria-pressed={lang === 'ka'}
          onClick={() => setLang('ka')}
        >
          ქარ
        </button>
      </div>
    </header>
  )
}
