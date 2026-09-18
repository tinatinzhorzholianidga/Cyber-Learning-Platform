import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// self-hosted web fonts (shipped with the site - no Google Fonts request)
import '@fontsource/noto-sans-georgian/400.css'
import '@fontsource/noto-sans-georgian/600.css'
import '@fontsource/noto-sans-georgian/700.css'
import '@fontsource/noto-sans-georgian/800.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
