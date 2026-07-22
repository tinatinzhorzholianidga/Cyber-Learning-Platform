import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import { buildSystemPrompt, IO_MODELS } from '../mascot/ioBrain.js'
import RobotCanvas from '../mascot/RobotCanvas.jsx'

/* IO Chat (demo): Qwen2.5 running fully in the visitor's browser via
   WebLLM/WebGPU - no server, no API keys, nothing leaves the device.
   Each question is grounded on the platform's own bilingual content
   (see ioBrain.js). Hidden test page - not linked from the site. */

const STARTERS = [
  { en: 'What is phishing?', ka: 'რა არის ფიშინგი?' },
  { en: 'How do I make a strong password?', ka: 'როგორ შევქმნა ძლიერი პაროლი?' },
  { en: 'A stranger keeps messaging me. What should I do?', ka: 'უცნობი მწერს და მწერს. რა ვქნა?' },
  { en: 'My friend is being teased in a group chat.', ka: 'ჩემს მეგობარს ჯგუფურ ჩატში დასცინიან.' },
]

export default function IoChatPage() {
  const { t, tx, lang } = useI18n()
  const [webgpu, setWebgpu] = useState(null) // null = checking
  const [modelId, setModelId] = useState(IO_MODELS[0].id)
  const [loadState, setLoadState] = useState('idle') // idle | loading | ready | error
  const [progress, setProgress] = useState('')
  const [messages, setMessages] = useState([]) // {role:'user'|'assistant', content, sources?}
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const engineRef = useRef(null)
  const threadRef = useRef(null)
  const generationRef = useRef(0)

  useEffect(() => {
    setWebgpu(Boolean(navigator.gpu))
  }, [])

  // auto-scroll the thread
  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy])

  useEffect(
    () => () => {
      engineRef.current?.unload?.()
    },
    [],
  )

  const loadModel = async () => {
    setLoadState('loading')
    setProgress('')
    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
      const eng = await CreateMLCEngine(modelId, {
        initProgressCallback: (p) => setProgress(p.text || ''),
      })
      engineRef.current = eng
      setLoadState('ready')
    } catch (err) {
      console.error(err)
      setProgress(String(err?.message || err))
      setLoadState('error')
    }
  }

  const send = async (rawText) => {
    const text = (rawText ?? input).trim()
    if (!text || !engineRef.current || busy) return
    setInput('')
    setBusy(true)
    const gen = ++generationRef.current

    const { prompt, sources } = buildSystemPrompt(text)
    const history = [...messages, { role: 'user', content: text }]
    setMessages([...history, { role: 'assistant', content: '', sources }])

    try {
      const stream = await engineRef.current.chat.completions.create({
        stream: true,
        messages: [
          { role: 'system', content: prompt },
          // short rolling window keeps small models focused
          ...history.slice(-8).map(({ role, content }) => ({ role, content })),
        ],
        temperature: 0.6,
        max_tokens: 320,
      })
      let acc = ''
      for await (const part of stream) {
        if (generationRef.current !== gen) return // thread was reset
        acc += part.choices?.[0]?.delta?.content || ''
        setMessages([...history, { role: 'assistant', content: acc, sources }])
      }
    } catch (err) {
      console.error(err)
      if (generationRef.current === gen) {
        setMessages([...history, { role: 'assistant', content: t('mascot.chat.genError'), sources: [] }])
      }
    } finally {
      if (generationRef.current === gen) setBusy(false)
    }
  }

  const reset = () => {
    generationRef.current += 1
    setMessages([])
    setBusy(false)
    engineRef.current?.resetChat?.()
  }

  const lastAssistant = messages[messages.length - 1]
  const ioTalking = busy && Boolean(lastAssistant?.content)
  const ioEmotion = busy && !lastAssistant?.content ? 'thinking' : 'happy'
  const model = IO_MODELS.find((m) => m.id === modelId)

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

      {webgpu === false && <div className="io-warn">⚠️ {t('mascot.chat.needsWebgpu')}</div>}

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
              {IO_MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`chip-btn ${modelId === m.id ? 'active' : ''}`}
                  aria-pressed={modelId === m.id}
                  disabled={loadState === 'loading'}
                  onClick={() => setModelId(m.id)}
                >
                  {m.label} · {m.size}
                </button>
              ))}
            </div>
            <p className="mascot-ctrl-note">{model?.note}</p>
            {loadState !== 'ready' ? (
              <button type="button" className="btn-solid" disabled={loadState === 'loading' || webgpu === false} onClick={loadModel}>
                {loadState === 'loading' ? '⏳ ' + t('mascot.chat.loading') : '⬇️ ' + t('mascot.chat.load')}
              </button>
            ) : (
              <p className="io-ready">✅ {t('mascot.chat.ready')}</p>
            )}
            {loadState === 'loading' && <p className="io-progress">{progress}</p>}
            {loadState === 'error' && <p className="io-warn">⚠️ {t('mascot.chat.loadError')} {progress}</p>}
            <p className="mascot-ctrl-note">{t('mascot.chat.privacy')}</p>
          </div>
        </aside>

        <section className="io-thread-wrap" aria-label="IO chat">
          <div className="io-thread" ref={threadRef}>
            {messages.length === 0 && (
              <div className="io-msg io-msg-bot">
                <p>{t('mascot.chat.hello')}</p>
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

          {messages.length === 0 && (
            <div className="chip-row io-starters">
              {STARTERS.map((s, i) => (
                <button key={i} type="button" className="chip-btn" disabled={loadState !== 'ready'} onClick={() => send(tx(s))}>
                  {tx(s)}
                </button>
              ))}
            </div>
          )}

          <form
            className="io-input-row"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={loadState === 'ready' ? t('mascot.chat.placeholder') : t('mascot.chat.placeholderIdle')}
              disabled={loadState !== 'ready' || busy}
              aria-label={t('mascot.chat.placeholder')}
            />
            <button type="submit" className="btn-solid" disabled={loadState !== 'ready' || busy || !input.trim()}>
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
        IO Chat α1 · {lang === 'ka' ? 'ქართული/English' : 'English/ქართული'} · Qwen2.5 + WebLLM + RAG
      </p>
    </div>
  )
}
