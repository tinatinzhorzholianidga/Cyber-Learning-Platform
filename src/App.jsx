import { Route, Routes } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { useI18n } from './i18n/I18nContext.jsx'
import WelcomePage from './pages/WelcomePage.jsx'
import TrackPage from './pages/TrackPage.jsx'

export default function App() {
  const { t } = useI18n()
  return (
    <>
      <a className="skip-link" href="#content">
        {t('nav.skipToContent')}
      </a>
      <ScrollToTop />
      <Header />
      <main id="content">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/track/:tierId" element={<TrackPage />} />
          <Route path="*" element={<WelcomePage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
