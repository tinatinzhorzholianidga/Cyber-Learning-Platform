import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import en from './en.js'
import ka from './ka.js'

const dicts = { en, ka }
const STORAGE_KEY = 'cyberhero.lang'

const I18nContext = createContext(null)

function detectLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'ka') return saved
  } catch {
    /* storage unavailable - fall through to browser language */
  }
  return (navigator.language || '').toLowerCase().startsWith('ka') ? 'ka' : 'en'
}

function lookup(dict, key) {
  return key.split('.').reduce((node, part) => (node == null ? node : node[part]), dict)
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(detectLang)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* private mode - language just won't persist */
    }
    document.documentElement.lang = lang
  }, [lang])

  // t(): UI strings from the en/ka dictionaries, addressed by dot path
  const t = useCallback(
    (key) => {
      const value = lookup(dicts[lang], key) ?? lookup(dicts.en, key)
      return value ?? key
    },
    [lang],
  )

  // tx(): content leaves shaped as { en: ..., ka: ... }
  const tx = useCallback((node) => (node == null ? '' : (node[lang] ?? node.en ?? '')), [lang])

  return <I18nContext.Provider value={{ lang, setLang, t, tx }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
