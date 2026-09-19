import { lazy, Suspense, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { UI, LANGS, initialLang } from './i18n/ui.js'
import IoHost from './mascot/IoHost.jsx'

/* Dev-only pages. `__IO_DEV_SERVE__` comes from vite.config.js: true under
   `npm run dev`, false in every build - there the import below is dead
   code and no chunk is emitted (scripts/check-dist.mjs verifies). */
const DEV_SERVE = typeof __IO_DEV_SERVE__ !== 'undefined' && __IO_DEV_SERVE__ === true
const BakeoffPanel = DEV_SERVE ? lazy(() => import('./voice/dev/BakeoffPanel.jsx')) : null

/* Talk mode (docs/io-voice-plan.md §5.3). The voice layer is one lazy
   chunk: nothing of it loads until the visitor presses the button or T. */
const VOICE_KINDS = ['browser', 'live', 'turn', 'stub']
const loadVoice = () => import('./voice/index.js')

/* Can this browser listen or speak in `lang`? Decides the entry button's
   label (A8): "Talk to IO", or "Type a question" when it has neither
   speech recognition nor a voice for the page language. */
function speechAvailable(lang) {
  try {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) return true
    const voices = window.speechSynthesis?.getVoices?.() || []
    return voices.some((v) => String(v.lang || '').toLowerCase().startsWith(lang))
  } catch {
    return false
  }
}
const isEditable = (el) => Boolean(el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)))

/* The welcome page for elearning.gov.ge with IO as the host.

   ?lang=ka|en   pick the language (also remembered)
   ?embed=1      render only IO + his bubble, transparent - for an
                 <iframe> inside the real Moodle page
   ?skin=metal   the metal-droid IO instead of the original
   ?voice=…      talk mode: browser | live | turn | stub picks the voice
                 session (stub = the audio test harness); in embed mode
                 any value (e.g. voice=1) shows the Talk button at all
   ?bakeoff=1    dev server only: the browser-voice bake-off page
                 (docs/io-voice-plan.md §6.2) */
export default function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const embed = params.get('embed') === '1'
  const bakeoff = DEV_SERVE && params.get('bakeoff') === '1'
  const skin = params.get('skin') === 'metal' ? 'metal' : 'classic'
  const voiceParam = params.get('voice')
  const voiceKind = VOICE_KINDS.includes(voiceParam) ? voiceParam : null
  const voiceEnabled = !embed || Boolean(voiceParam)
  const [lang, setLang] = useState(initialLang)
  const t = UI[lang]
  const io = useRef(null)

  // talk mode: 'host' until the visitor asks for IO's voice
  const [mode, setMode] = useState('host')
  const modeRef = useRef(mode)
  modeRef.current = mode
  const [Voice, setVoice] = useState(null) // the lazy layer's component, once loaded
  const [talk, setTalk] = useState(null) // what the voice layer wants IO to do
  const [highlight, setHighlight] = useState(null) // the path card navigate_to_path chose
  const audioCtx = useRef(null)
  const heroIo = useRef(null)
  const [speechOk, setSpeechOk] = useState(() => speechAvailable(lang))

  useEffect(() => {
    document.documentElement.lang = t.htmlLang
    document.title = t.pageTitle
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.metaDescription)
    try {
      window.localStorage.setItem('io.lang', lang)
    } catch {
      /* ignore */
    }
  }, [lang, t])

  useEffect(() => {
    document.body.classList.toggle('is-embed', embed)
  }, [embed])

  // voices arrive asynchronously in Chromium - re-check the entry label
  useEffect(() => {
    if (!voiceEnabled) return undefined
    setSpeechOk(speechAvailable(lang))
    const synth = window.speechSynthesis
    if (!synth?.addEventListener) return undefined
    const onVoices = () => setSpeechOk(speechAvailable(lang))
    synth.addEventListener('voiceschanged', onVoices)
    return () => synth.removeEventListener('voiceschanged', onVoices)
  }, [lang, voiceEnabled])

  const openTalk = useCallback(async () => {
    if (modeRef.current === 'talk') return
    // both unlocks happen inside the user's gesture, before any await
    // (iOS Safari): one AudioContext for the whole visit, and an empty
    // utterance so browser voices may speak later
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (AC && !audioCtx.current) audioCtx.current = new AC()
      audioCtx.current?.resume?.()
    } catch {
      /* no Web Audio: captions still work */
    }
    try {
      window.speechSynthesis?.speak(new SpeechSynthesisUtterance(''))
    } catch {
      /* ignore */
    }
    const mod = await loadVoice()
    setVoice(() => mod.IoVoice)
    setMode('talk')
  }, [])

  const exitTalk = useCallback(() => {
    setTalk(null)
    setMode('host')
  }, [])

  // navigate_to_path (docs/io-voice-plan.md §5.3): back to host mode, the
  // chosen card lights up, IO waves goodbye, then the page follows the link
  const navigate = useCallback(
    ({ path, url, newTab }) => {
      exitTalk()
      setHighlight(path)
      io.current?.farewell()
      if (!url || embed) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.setTimeout(() => {
        if (newTab) {
          // a tool call is not a user gesture, so the popup may be blocked;
          // the highlighted card then stays for the learner to click
          window.open(url, '_blank', 'noopener')
        } else window.location.assign(url)
      }, reduced ? 1000 : 1900)
    },
    [exitTalk, embed],
  )

  // on a narrow viewport the dock is a bottom sheet: bring IO to the top of
  // the screen when talk mode opens, so he stays visible above it (D6)
  useEffect(() => {
    if (mode !== 'talk' || embed || !heroIo.current) return
    if (!window.matchMedia('(max-width: 900px)').matches) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const top = heroIo.current.getBoundingClientRect().top + window.scrollY - 8
    window.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' })
  }, [mode, embed])

  // T opens talk mode from host mode (e.code: a Georgian layout reports ტ)
  useEffect(() => {
    if (!voiceEnabled) return undefined
    const onKey = (e) => {
      if (e.code !== 'KeyT' || e.altKey || e.ctrlKey || e.metaKey || e.isComposing || e.repeat) return
      if (modeRef.current !== 'host' || isEditable(e.target)) return
      e.preventDefault()
      openTalk()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [voiceEnabled, openTalk])

  const entryButton =
    voiceEnabled && mode === 'host' ? (
      <button type="button" className="io-talk" onClick={openTalk} onPointerEnter={loadVoice} onFocus={loadVoice}>
        {speechOk ? t.voice.talk : t.voice.typeInstead}
      </button>
    ) : null

  // what the tutor may point to (D5); one object per language, so the
  // voice layer never restarts its session on a page re-render. In an
  // embed navigate_to_path shows a link card instead of leaving the frame.
  const page = useMemo(
    () => ({
      paths: { basic: { url: t.basic.url, title: t.basic.title }, kids: { url: t.kids.url, title: t.kids.title, newTab: true } },
      loginUrl: t.loginUrl,
      embed,
    }),
    [t, embed],
  )

  const voiceLayer =
    mode === 'talk' && Voice ? (
      <Voice
        lang={lang}
        kind={voiceKind}
        audioContext={audioCtx.current}
        embed={embed}
        typedOnly={!speechOk}
        page={page}
        onTalk={setTalk}
        onExit={exitTalk}
        onNavigate={navigate}
      />
    ) : null

  if (bakeoff && BakeoffPanel) {
    return (
      <Suspense fallback={null}>
        <BakeoffPanel />
      </Suspense>
    )
  }

  if (embed) {
    return (
      <main className="embed-stage">
        <IoHost ref={io} lang={lang} size={Number(params.get('size')) || 260} skin={skin} hintLabel={t.ioLabel} mode={mode} talk={talk} />
        {entryButton}
        {voiceLayer}
      </main>
    )
  }

  return (
    <>
      <a href="#main" className="skip-link">
        {t.skipToContent}
      </a>

      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <span />
            </span>
            <span className="brand-name">{t.agency}</span>
          </div>
          <div className="topbar-actions">
            <div className="lang-switch" role="group" aria-label={t.langLabel}>
              {LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`lang-btn ${lang === l ? 'active' : ''}`}
                  aria-pressed={lang === l}
                  onClick={() => setLang(l)}
                >
                  {l === 'ka' ? 'ქართული' : 'English'}
                </button>
              ))}
            </div>
            <a className="btn-login" href="https://elearning.gov.ge/login/index.php">
              {t.login}
            </a>
          </div>
        </div>
      </header>

      <div className="band">
        <div className="band-inner">{t.platform}</div>
      </div>

      <main id="main" className="page">
        <section className="hero">
          <div className="hero-io" ref={heroIo}>
            <IoHost ref={io} lang={lang} size={360} skin={skin} hintLabel={t.ioLabel} mode={mode} talk={talk} />
            {mode === 'talk' ? null : <p className="io-hint">{t.ioHint}</p>}
            {entryButton}
            {voiceLayer}
          </div>

          <div className="hero-copy">
            <span className="kicker">{t.heroKicker}</span>
            <h1>
              {t.heroTitle} <span className="grad">{t.heroTitleGrad}</span>
            </h1>
            <p className="lead">{t.heroSub}</p>

            <h2 className="paths-title">{t.pathsTitle}</h2>
            <div className="paths">
              <PathCard kind="basic" data={t.basic} io={io} highlight={highlight === 'basic'} />
              <PathCard kind="kids" data={t.kids} io={io} external newTab={t.newTab} highlight={highlight === 'kids'} />
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>{t.footer}</p>
        <p className="footer-note">{t.footerNote}</p>
      </footer>
    </>
  )
}

/* One of the two doors. Hover / focus makes IO react; choosing it makes
   him wave goodbye (the link itself navigates normally). The card's
   accessible name is title + call to action, not the whole card text. */
function PathCard({ kind, data, io, external = false, newTab = '', highlight = false }) {
  const id = useId()
  return (
    <a
      className={`path-card path-${kind}`}
      data-io-highlight={highlight || undefined}
      href={data.url}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-labelledby={`${id}-title ${id}-cta`}
      onMouseEnter={() => io.current?.hover(kind, 'mouse')}
      onMouseLeave={() => io.current?.unhover('mouse')}
      onFocus={() => io.current?.hover(kind, 'focus')}
      onBlur={() => io.current?.unhover('focus')}
      onClick={() => io.current?.farewell()}
    >
      <span className="path-badge">{data.badge}</span>
      <span className="path-title" id={`${id}-title`}>
        {data.title}
      </span>
      <span className="path-desc">{data.desc}</span>
      <span className="path-chips">
        {data.chips.map((c) => (
          <span key={c} className="chip">
            {c}
          </span>
        ))}
      </span>
      <span className="path-cta" id={`${id}-cta`}>
        {data.cta} <span aria-hidden="true">→</span>
        {external && newTab ? <span className="sr-only"> ({newTab})</span> : null}
      </span>
    </a>
  )
}
