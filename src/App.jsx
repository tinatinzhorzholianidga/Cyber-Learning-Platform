import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { useI18n } from './i18n/I18nContext.jsx'
import { MascotProvider } from './mascot/MascotProvider.jsx'
import Fireworks from './mascot/Fireworks.jsx'
import WelcomePage from './pages/WelcomePage.jsx'
import TrackPage from './pages/TrackPage.jsx'
import ParentsHubPage from './pages/parents/ParentsHubPage.jsx'
import ArticlePage from './pages/parents/ArticlePage.jsx'
import AgreementPage from './pages/parents/AgreementPage.jsx'
import GuardiansMapPage from './pages/guardians/GuardiansMapPage.jsx'
import MissionPage from './pages/guardians/MissionPage.jsx'
import CertificatePage from './pages/guardians/CertificatePage.jsx'

// IO lives on every page, but three.js loads lazily after first paint so
// the site itself stays light on slow school machines.
const MascotDemoPage = lazy(() => import('./pages/MascotDemoPage.jsx'))
const IoChatPage = lazy(() => import('./pages/IoChatPage.jsx'))
const MascotWidget = lazy(() => import('./mascot/MascotWidget.jsx'))

function DeferredMascot() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 900)
    return () => clearTimeout(timer)
  }, [])
  if (!ready) return null
  return (
    <Suspense fallback={null}>
      <MascotWidget />
    </Suspense>
  )
}

export default function App() {
  const { t } = useI18n()
  return (
    <MascotProvider>
      <a className="skip-link" href="#content">
        {t('nav.skipToContent')}
      </a>
      <ScrollToTop />
      <Header />
      <main id="content">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/track/:tierId" element={<TrackPage />} />
          <Route path="/parents" element={<ParentsHubPage />} />
          <Route path="/parents/agreement" element={<AgreementPage />} />
          <Route path="/parents/:articleId" element={<ArticlePage />} />
          <Route path="/guardians" element={<GuardiansMapPage />} />
          <Route path="/guardians/mission/:missionId" element={<MissionPage />} />
          <Route path="/guardians/certificate" element={<CertificatePage />} />
          <Route
            path="/io-chat"
            element={
              <Suspense fallback={null}>
                <IoChatPage />
              </Suspense>
            }
          />
          <Route
            path="/mascot-demo"
            element={
              <Suspense fallback={null}>
                <MascotDemoPage />
              </Suspense>
            }
          />
          <Route path="*" element={<WelcomePage />} />
        </Routes>
      </main>
      <Footer />
      <DeferredMascot />
      <Fireworks />
    </MascotProvider>
  )
}
