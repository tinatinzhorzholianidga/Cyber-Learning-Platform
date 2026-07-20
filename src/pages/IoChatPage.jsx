import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import { GEMINI_MODELS, getApiKey, hasEnvKey, setRuntimeKey } from '../chat/llmClient.js'
import { useIoChat } from '../chat/useIoChat.js'
import RobotCanvas from '../mascot/RobotCanvas.jsx'

/* IO Chat (demo): IO powered by Google's Gemini API, grounded on the
   platform's own bilingual content (see mascot/ioBrain.js).
   Hidden test page - not linked from the site. */

const STARTERS = [
  { en: 'What is phishing?', ka: 'რა არის ფიშინგი?' },
  { en: 'How do I make a strong password?', ka: 'როგორ შევქმნა ძლიერი პაროლი?' },
  { en: 'A stranger keeps messaging me. What should I do?', ka: 'უცნობი მწერს და მწერს. რა ვქნა?' },
  { en: 'My friend is being teased in a group chat.', ka: 'ჩემს მეგობარს ჯგუფურ ჩატში დასცინიან.' },
]

function friendlyError(t, err) {
  if (!err) return null
  if (err === 'NO_KEY' || err === 'BAD_KEY') return t('mascot.chat.errKey')
  if (err === 'SAFETY_BLOCK') return t('mascot.chat.errSafety')
  if (err === 'EMPTY') return t('mascot.chat.errEmpty')
  if (err.startsWith('MODEL_NOT_FOUND')) return t('mascot.chat.errModel')
  return t('mascot.chat.genError') + ' ' + err
}

export default function IoChatPage() {
  const { t, tx, lang } = useI18n()
  const [modelId, setModelId] = useState(GEMINI_MODELS[0].id)
  const [keyReady, setKeyReady] = useState(() => Boolean(getApiKey()))
  const [keyInput, setKeyInput] = useState('')
  const [input, setInput] = useState('')
  const threadRef = useRef(null)
  const { messages, busy, error, send, reset } = useIoChat(modelId)

  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy])

  const saveKey = (e) => {
    e.preventDefault()
    const k = keyInput.trim()
    if (!k) return
    setRuntimeKey(k)
    setKeyInput('')
    setKeyReady(true)
  }

  const clearKey = () => {
    setRuntimeKey('')
    setKeyReady(false)
    reset()
  }

  const submit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    send(input)
    setInput('')
  }

  const lastAssistant = messages[messages.length - 1]
  const ioTalking = busy && Boolean(lastAssistant?.content)
  const ioEmotion = busy && !lastAssistant?.content ? 'thinking' : 'happy'
  const model = GEMINI_MODELS.find((m) => m.id === modelId)

  return (
    <div className="fade-in io-chat">
      <Link to="/mascot-demo" className="back-btn">
        ← {t('nav.back')}
      </Link>

      <header className="hero mascot-hero">
        <span className="badge">🧪 {t('mascot.chat.badge')}</span>
        <h1>
          IO <span className="grad">Chat</span>
        </h1>
        <p>{t('mascot.chat.sub')}</p>
      </header>

      <div className="io-chat-layout">
        <aside className="io-side">
          <RobotCanvas
            size={190}
            character="robot"
            label={t('mascot.widget.label')}
            emotion={ioEmotion}
            talking={ioTalking}
            follow
            idle
          />

          <div className="ctrl-group">
            <h2>{t('mascot.chat.model')}</h2>
            <div className="chip-row">
              {GEMINI_MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`chip-btn ${modelId === m.id ? 'active' : ''}`}
                  aria-pressed={modelId === m.id}
                  onClick={() => setModelId(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="mascot-ctrl-note">{model?.note}</p>
          </div>

          <div className="ctrl-group">
            <h2>{t('mascot.chat.key')}</h2>
            {hasEnvKey() ? (
              <p className="io-ready">✅ {t('mascot.chat.keyEnv')}</p>
            ) : keyReady ? (
              <>
                <p className="io-ready">✅ {t('mascot.chat.keySaved')}</p>
                <button type="button" className="btn-ghost" onClick={clearKey}>
                  {t('mascot.chat.keyClear')}
                </button>
              </>
            ) : (
              <form onSubmit={saveKey} className="io-key-form">
                <p className="mascot-ctrl-note">{t('mascot.chat.keyHelp')}</p>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIza…"
                  aria-label={t('mascot.chat.key')}
                  autoComplete="off"
                />
                <button type="submit" className="btn-solid" disabled={!keyInput.trim()}>
                  {t('mascot.chat.keySave')}
                </button>
              </form>
            )}
            <p className="mascot-ctrl-note">{t('mascot.chat.privacy')}</p>
          </div>
        </aside>

        <section className="io-thread-wrap" aria-label="IO chat">
          <div className="io-thread" ref={threadRef}>
            {messages.length === 0 && (
              <div className="io-msg io-msg-bot">
                <p>{keyReady ? t('mascot.chat.hello') : t('mascot.chat.helloNoKey')}</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`io-msg ${m.role === 'user' ? 'io-msg-user' : 'io-msg-bot'}`}>
                <p>{m.content || '…'}</p>
                {m.role === 'assistant' && m.sources?.length > 0 && m.content && (
                  <span className="io-sources">
                    📚 {[...new Set(m.sources.map((s) => tx(s.title)))].slice(0, 3).join(' · ')}
                  </span>
                )}
              </div>
            ))}
          </div>

          {error && <p className="io-warn">⚠️ {friendlyError(t, error)}</p>}

          {messages.length === 0 && keyReady && (
            <div className="chip-row io-starters">
              {STARTERS.map((s, i) => (
                <button key={i} type="button" className="chip-btn" disabled={busy} onClick={() => send(tx(s))}>
                  {tx(s)}
                </button>
              ))}
            </div>
          )}

          <form className="io-input-row" onSubmit={submit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={keyReady ? t('mascot.chat.placeholder') : t('mascot.chat.placeholderNoKey')}
              disabled={!keyReady || busy}
              aria-label={t('mascot.chat.placeholder')}
            />
            <button type="submit" className="btn-solid" disabled={!keyReady || busy || !input.trim()}>
              {t('mascot.chat.send')}
            </button>
            <button type="button" className="btn-ghost" onClick={reset} disabled={messages.length === 0}>
              {t('mascot.chat.reset')}
            </button>
          </form>
          <p className="io-disclaimer">{t('mascot.chat.disclaimer')}</p>
        </section>
      </div>

      <p className="mascot-fps" style={{ textAlign: 'center', marginTop: 14 }}>
        IO Chat β1 · {lang === 'ka' ? 'ქართული/English' : 'English/ქართული'} · Gemini + RAG
      </p>
    </div>
  )
}
