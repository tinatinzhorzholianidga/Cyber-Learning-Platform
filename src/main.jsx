import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource-variable/noto-sans-georgian'
import './styles/global.css'
import { I18nProvider } from './i18n/I18nContext.jsx'
import { ProgressProvider } from './store/progress.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <I18nProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </I18nProvider>
    </HashRouter>
  </React.StrictMode>,
)
