import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import { getMascotContext, MASCOT_CHECKLIST, MASCOT_REACTIONS } from '../content/mascot.js'
import MascotWidget from '../mascot/MascotWidget.jsx'
import RobotCanvas, { useReducedMotion } from '../mascot/RobotCanvas.jsx'

const EMOTIONS = ['happy', 'excited', 'funny', 'wink', 'thinking', 'celebrate', 'surprised', 'sleepy', 'sad']
const GESTURES = ['wave', 'bounce', 'spin']
const SIZES = { s: 220, m: 320, l: 430 }

/* simulated routes, so testers can hear how his tips change per page */
const TIP_CONTEXTS = [
  { key: 'Home', path: '/' },
  { key: 'Phish', path: '/guardians/mission/g1' },
  { key: 'Pass', path: '/guardians/mission/g3' },
  { key: 'Cert', path: '/guardians/certificate' },
  { key: 'Parents', path: '/parents' },
]

function useFps() {
  const [fps, setFps] = useState(0)
  useEffect(() => {
    let frames = 0
    let last = performance.now()
    let raf
    const loop = (now) => {
      frames += 1
      if (now - last >= 1000) {
        setFps(frames)
        frames = 0
        last = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return fps
}

export default function MascotDemoPage() {
  const { t, tx } = useI18n()
  const reduced = useReducedMotion()
  const fps = useFps()

  const [character, setCharacter] = useState('robot')
  const [emotion, setEmotion] = useState('happy')
  const [gesture, setGesture] = useState(null)
  const gestureId = useRef(0)
  const [follow, setFollow] = useState(true)
  const [idle, setIdle] = useState(true)
  const [size, setSize] = useState('m')
  const [tipIdx, setTipIdx] = useState(null)
  const [widgetOn, setWidgetOn] = useState(false)
  const [checked, setChecked] = useState(() => MASCOT_CHECKLIST.map(() => false))

  const fireGesture = (type) => {
    gestureId.current += 1
    setGesture({ id: gestureId.current, type })
  }

  // context-aware tips + simulated achievement reactions
  const [tipCtx, setTipCtx] = useState('Home')
  const pool = useMemo(
    () => getMascotContext(TIP_CONTEXTS.find((c) => c.key === tipCtx)?.path ?? '/').tips,
    [tipCtx],
  )
  useEffect(() => {
    setTipIdx(null)
  }, [tipCtx])

  const [reactionNode, setReactionNode] = useState(null)
  const reactTimer = useRef(null)
  const simCount = useRef(0)
  const prevEmotion = useRef('happy')
  useEffect(() => () => clearTimeout(reactTimer.current), [])

  const simulateMission = () => {
    if (!reactionNode) prevEmotion.current = emotion
    setReactionNode(MASCOT_REACTIONS.mission[simCount.current % MASCOT_REACTIONS.mission.length])
    simCount.current += 1
    setEmotion('celebrate')
    fireGesture('bounce')
    clearTimeout(reactTimer.current)
    reactTimer.current = setTimeout(() => {
      setReactionNode(null)
      setEmotion(prevEmotion.current)
    }, 5000)
  }

  const baseTip = tipIdx == null ? null : tx(pool[tipIdx % pool.length])
  const tipText = reactionNode ? tx(reactionNode) : baseTip
  const [shownTip, setShownTip] = useState('')
  useEffect(() => {
    if (tipText == null) {
      setShownTip('')
      return undefined
    }
    if (reduced) {
      setShownTip(tipText)
      return undefined
    }
    setShownTip('')
    let i = 0
    const iv = setInterval(() => {
      i += 2
      setShownTip(tipText.slice(0, i))
      if (i >= tipText.length) clearInterval(iv)
    }, 24)
    return () => clearInterval(iv)
  }, [tipText, reduced])

  const askTip = () => {
    setReactionNode(null)
    setTipIdx((i) => (i == null ? 0 : (i + 1) % pool.length))
    fireGesture('wave')
  }

  return (
    <div className="fade-in mascot-demo">
      <Link to="/" className="back-btn">
        ← {t('nav.back')}
      </Link>

      <header className="hero mascot-hero">
        <span className="badge">🧪 {t('mascot.demo.badge')}</span>
        <h1>
          {t('mascot.demo.title1')}{' '}
          <span className="grad">{character === 'hero' ? t('mascot.heroName') : t('mascot.name')}</span>
        </h1>
        <p>{t('mascot.demo.sub')}</p>
      </header>

      <div className="mascot-layout">
        <section className="mascot-stage" aria-label={t('mascot.widget.label')}>
          {tipText != null && (
            <div className="mascot-bubble stage-bubble" role="status" aria-live="polite">
              <p>{shownTip}</p>
            </div>
          )}
          <RobotCanvas
            size={SIZES[size]}
            character={character}
            label={character === 'hero' ? t('mascot.widget.labelHero') : t('mascot.widget.label')}
            emotion={emotion}
            gesture={gesture}
            talking={tipText != null && shownTip.length < tipText.length}
            follow={follow}
            idle={idle}
            onTap={askTip}
          />
          <p className="mascot-hint">{t('mascot.demo.stageHint')}</p>
          <p className="mascot-fps">
            {t('mascot.demo.fps')}: <strong>{fps}</strong>
            {' · v2.2-io'}
            {reduced && ' · prefers-reduced-motion ✓'}
          </p>
        </section>

        <aside className="mascot-controls">
          <div className="ctrl-group">
            <h2>{t('mascot.demo.character')}</h2>
            <div className="chip-row">
              <button
                type="button"
                className={`chip-btn ${character === 'robot' ? 'active' : ''}`}
                aria-pressed={character === 'robot'}
                onClick={() => setCharacter('robot')}
              >
                🤖 {t('mascot.name')}
              </button>
              <button
                type="button"
                className={`chip-btn ${character === 'hero' ? 'active' : ''}`}
                aria-pressed={character === 'hero'}
                onClick={() => setCharacter('hero')}
              >
                🦸 {t('mascot.heroName')}
              </button>
            </div>
          </div>

          <div className="ctrl-group">
            <h2>{t('mascot.demo.emotions')}</h2>
            <div className="chip-row">
              {EMOTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`chip-btn ${emotion === e ? 'active' : ''}`}
                  aria-pressed={emotion === e}
                  onClick={() => setEmotion(e)}
                >
                  {t(`mascot.emotions.${e}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="ctrl-group">
            <h2>{t('mascot.demo.gestures')}</h2>
            <div className="chip-row">
              {GESTURES.map((g) => (
                <button key={g} type="button" className="chip-btn" onClick={() => fireGesture(g)}>
                  {t(`mascot.gestures.${g}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="ctrl-group">
            <h2>{t('mascot.demo.options')}</h2>
            <div className="chip-row">
              <button
                type="button"
                className={`chip-btn ${follow ? 'active' : ''}`}
                aria-pressed={follow}
                onClick={() => setFollow((v) => !v)}
              >
                👀 {t('mascot.demo.optionFollow')}
              </button>
              <button
                type="button"
                className={`chip-btn ${idle ? 'active' : ''}`}
                aria-pressed={idle}
                onClick={() => setIdle((v) => !v)}
              >
                🎈 {t('mascot.demo.optionIdle')}
              </button>
            </div>
          </div>

          <div className="ctrl-group">
            <h2>{t('mascot.demo.size')}</h2>
            <div className="chip-row">
              {Object.keys(SIZES).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip-btn ${size === s ? 'active' : ''}`}
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                >
                  {t(`mascot.demo.size${s.toUpperCase()}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="ctrl-group">
            <h2>{t('mascot.demo.tips')}</h2>
            <div className="chip-row" style={{ marginBottom: 10 }}>
              {TIP_CONTEXTS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={`chip-btn ${tipCtx === c.key ? 'active' : ''}`}
                  aria-pressed={tipCtx === c.key}
                  onClick={() => setTipCtx(c.key)}
                >
                  {t(`mascot.demo.context${c.key}`)}
                </button>
              ))}
            </div>
            <button type="button" className="btn-solid" onClick={askTip}>
              💡 {t('mascot.demo.askTip')}
            </button>
          </div>

          <div className="ctrl-group">
            <h2>{t('mascot.demo.reactions')}</h2>
            <button type="button" className="btn-solid amber" onClick={simulateMission}>
              🎉 {t('mascot.demo.simulate')}
            </button>
            <p className="mascot-ctrl-note">{t('mascot.demo.simulateNote')}</p>
          </div>

          <div className="ctrl-group">
            <h2>{t('mascot.demo.widget')}</h2>
            <button
              type="button"
              className={`chip-btn ${widgetOn ? 'active' : ''}`}
              aria-pressed={widgetOn}
              onClick={() => setWidgetOn((v) => !v)}
            >
              🖥️ {t('mascot.demo.widgetOn')}
            </button>
          </div>
        </aside>
      </div>

      <section className="mascot-checklist">
        <h2>✅ {t('mascot.demo.checklist')}</h2>
        <ul>
          {MASCOT_CHECKLIST.map((item, i) => (
            <li key={i}>
              <label>
                <input
                  type="checkbox"
                  checked={checked[i]}
                  onChange={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
                />
                <span>{tx(item)}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="mascot-note">🔒 {t('mascot.demo.note')}</p>
      </section>

      {widgetOn && <MascotWidget character={character} />}
    </div>
  )
}
