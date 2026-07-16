import { useI18n } from '../i18n/I18nContext.jsx'

export default function Footer() {
  const { t } = useI18n()
  return (
    <footer className="site-footer">
      <p>{t('footer.line')}</p>
      <p>{t('footer.disclaimer')}</p>
    </footer>
  )
}
