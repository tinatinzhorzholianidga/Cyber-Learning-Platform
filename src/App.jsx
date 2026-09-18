import { useEffect, useMemo, useRef, useState } from 'react'
import { UI, LANGS, initialLang } from './i18n/ui.js'
import IoHost from './mascot/IoHost.jsx'

/* The welcome page for elearning.gov.ge with IO as the host.

   ?lang=ka|en   pick the language (also remembered)
   ?embed=1      render only IO + his bubble, transparent - for an
                 <iframe> inside the real Moodle page
   ?skin=metal   the metal-droid IO instead of the original */
export default function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const embed = params.get('embed') === '1'
  const skin = params.get('skin') === 'metal' ? 'metal' : 'classic'
  const [lang, setLang] = useState(initialLang)
  const t = UI[lang]
  const io = useRef(null)

  useEffect(() => {
    document.documentElement.lang = t.htmlLang
    try {
      window.localStorage.setItem('io.lang', lang)
    } catch {
      /* ignore */
    }
  }, [lang, t.htmlLang])

  useEffect(() => {
    document.body.classList.toggle('is-embed', embed)
  }, [embed])

  if (embed) {
    return (
      <main className="embed-stage">
        <IoHost ref={io} lang={lang} size={Number(params.get('size')) || 260} skin={skin} hintLabel={t.ioLabel} />
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
          <div className="hero-io">
            <IoHost ref={io} lang={lang} size={360} skin={skin} hintLabel={t.ioLabel} />
            <p className="io-hint">{t.ioHint}</p>
          </div>

          <div className="hero-copy">
            <span className="kicker">{t.heroKicker}</span>
            <h1>
              {t.heroTitle} <span className="grad">{t.heroTitleGrad}</span>
            </h1>
            <p className="lead">{t.heroSub}</p>

            <h2 className="paths-title">{t.pathsTitle}</h2>
            <div className="paths">
              <PathCard kind="basic" data={t.basic} io={io} />
              <PathCard kind="kids" data={t.kids} io={io} external />
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
   him wave goodbye (the link itself navigates normally). */
function PathCard({ kind, data, io, external = false }) {
  const enter = () => io.current?.hover(kind)
  const leave = () => io.current?.unhover()
  return (
    <a
      className={`path-card path-${kind}`}
      href={data.url}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
      onClick={() => io.current?.farewell()}
    >
      <span className="path-badge">{data.badge}</span>
      <span className="path-title">{data.title}</span>
      <span className="path-desc">{data.desc}</span>
      <span className="path-chips">
        {data.chips.map((c) => (
          <span key={c} className="chip">
            {c}
          </span>
        ))}
      </span>
      <span className="path-cta">
        {data.cta} <span aria-hidden="true">→</span>
      </span>
    </a>
  )
}
