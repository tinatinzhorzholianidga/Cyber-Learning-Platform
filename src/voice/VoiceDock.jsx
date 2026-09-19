/* The talk-mode controls (docs/io-voice-plan.md §5.3): the ring button
   whose state is idle / connecting / listening / thinking / speaking, the
   microphone-open indicator, a text input, mute, End, Delete my data,
   the runtime-key field (A2) when a session needs a key, the privacy
   lines and, in dev serves, a badge naming the active session. On narrow
   viewports and in embeds it is a fixed bottom sheet. */
import { useEffect, useRef, useState } from 'react'
import { useStore } from './store.js'
import { VOICE, plain } from './i18n.js'
import { devKey, runtimeKey, setRuntimeKey, isDevServe } from './auth/devKey.js'

const RING_STATES = ['idle', 'connecting', 'listening', 'thinking', 'speaking']

export default function VoiceDock({ voice, lang, sheet = false, reduced = false, typedOnly = false, transcript = null, board = null, onExit }) {
  const t = VOICE[lang] || VOICE.ka
  const state = useStore(voice.store, (s) => s.state)
  const micOpen = useStore(voice.store, (s) => s.micOpen)
  const muted = useStore(voice.store, (s) => s.muted)
  const error = useStore(voice.store, (s) => s.error)
  const kind = useStore(voice.store, (s) => s.kind)
  const reason = useStore(voice.store, (s) => s.reason)
  const needsKey = useStore(voice.store, (s) => s.needsKey)
  const [collapsed, setCollapsed] = useState(false)
  const [text, setText] = useState('')
  const ring = useRef(null)

  // the listening ring follows the microphone level (a CSS variable, no React state)
  useEffect(() => {
    const el = ring.current
    if (!el) return undefined
    if (state !== 'listening' || reduced) {
      el.style.setProperty('--mic', '0')
      return undefined
    }
    let raf = 0
    const tick = () => {
      el.style.setProperty('--mic', voice.micLevel().toFixed(2))
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [state, reduced, voice])

  const ringState = RING_STATES.includes(state) ? state : state === 'interrupted' ? 'idle' : 'idle'
  const stateLabel =
    { connecting: t.connecting, listening: t.listening, thinking: t.thinking, speaking: t.speaking, idle: t.pushToTalk, interrupted: t.pushToTalk }[state] || ''
  const ringDisabled = typedOnly || state === 'connecting' || state === 'ended' || state === 'error'

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    voice.sendText(text)
    setText('')
  }

  const deleteData = () => {
    if (window.confirm(t.deleteConfirm)) voice.forget()
  }

  return (
    <section className="voice-dock" data-sheet={sheet || undefined} data-collapsed={collapsed || undefined} aria-label={t.dockLabel}>
      <p className="voice-hint">{t.ioHintTalk}</p>

      <div className="voice-main">
        <button
          ref={ring}
          type="button"
          className="voice-ring"
          data-state={ringState}
          aria-label={plain(stateLabel) || t.pushToTalk}
          onClick={voice.toggleListening}
          disabled={ringDisabled}
        >
          <RingIcon state={ringState} />
        </button>
        <div className="voice-status">
          <span className="voice-state" role="status">
            {stateLabel}
          </span>
          <span className="voice-mic" hidden={!micOpen}>
            <span className="voice-mic-dot" aria-hidden="true" />
            <span role="status">{micOpen ? t.micOn : ''}</span>
          </span>
        </div>
        {sheet && transcript ? (
          <button type="button" className="voice-btn voice-toggle" aria-expanded={!collapsed} onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? t.showTranscript : t.hideTranscript}
          </button>
        ) : null}
      </div>

      {transcript ? <div className="voice-sheet-transcript">{transcript}</div> : null}
      {board}

      {error ? (
        <p className="voice-error" role="alert">
          {t[error] || t.errSocket}
        </p>
      ) : null}

      <form className="voice-form" onSubmit={submit}>
        <input
          className="voice-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.typeInstead}
          aria-label={t.typeInstead}
          autoComplete="off"
          enterKeyHint="send"
          disabled={state === 'ended' || (state === 'error' && !kind)}
        />
        <button type="submit" className="voice-send" disabled={!text.trim() || state === 'ended' || (state === 'error' && !kind)}>
          {t.send}
        </button>
      </form>

      <div className="voice-actions">
        <button type="button" className="voice-btn" onClick={() => voice.setMuted(!muted)} aria-pressed={muted} disabled={!micOpen && !muted}>
          {muted ? t.unmute : t.mute}
        </button>
        <button type="button" className="voice-btn" onClick={onExit}>
          {t.end}
        </button>
        <button type="button" className="voice-btn" onClick={deleteData}>
          {t.deleteData}
        </button>
      </div>

      {(needsKey || runtimeKey()) && !devKey() ? <KeyField t={t} onChange={voice.restart} /> : null}

      <p className="voice-privacy">
        {t.privacy} {t.privacyText}
      </p>

      {isDevServe() ? (
        <span className="voice-dev" data-kind={kind || 'none'}>
          {kind || 'none'}
          {reason ? ` · ${reason}` : ''}
        </span>
      ) : null}
    </section>
  )
}

/* The pasted-key field (A2): the value goes to localStorage['io.gemini.key']
   and nowhere else. Never rendered when a dev key is injected. While a
   pasted key exists only the Forget button shows, so the presenter can
   always remove it from this browser. */
function KeyField({ t, onChange }) {
  const [value, setValue] = useState('')
  const saved = Boolean(runtimeKey())
  const save = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    setRuntimeKey(value)
    setValue('')
    onChange()
  }
  const forget = () => {
    setRuntimeKey('')
    onChange()
  }
  return (
    <form className="voice-key" onSubmit={save} data-saved={saved || undefined}>
      {saved ? (
        <div className="voice-actions">
          <span className="voice-key-saved">{t.keyLabel}</span>
          <button type="button" className="voice-btn" onClick={forget}>
            {t.keyForget}
          </button>
        </div>
      ) : (
        <>
          <label>
            <span>{t.keyLabel}</span>
            <input type="password" value={value} onChange={(e) => setValue(e.target.value)} placeholder={t.keyPlaceholder} autoComplete="off" />
          </label>
          <div className="voice-actions">
            <button type="submit" className="voice-btn" disabled={!value.trim()}>
              {t.keySave}
            </button>
          </div>
        </>
      )}
    </form>
  )
}

function RingIcon({ state }) {
  if (state === 'speaking' || state === 'thinking') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <rect x="6" y="6" width="12" height="12" rx="3" fill="currentColor" />
      </svg>
    )
  }
  if (state === 'connecting') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <circle cx="6" cy="12" r="2.2" fill="currentColor" />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
        <circle cx="18" cy="12" r="2.2" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17.5V21M9 21h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
