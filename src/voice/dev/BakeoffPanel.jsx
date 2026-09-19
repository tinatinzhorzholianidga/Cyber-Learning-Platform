/* Dev-only bake-off page: open ?bakeoff=1 during `npm run dev`. App.jsx
   mounts it only when __IO_DEV_SERVE__ is true, so no build contains it
   (scripts/check-dist.mjs fails if a chunk with this name is emitted).

   What it establishes (docs/io-voice-plan.md §2.11, §6.2, gate G1(a)):
   - which ka / en voices this browser has (Edge: Giorgi and Eka)
   - whether `onboundary` word events fire for a voice, and how long the
     first one takes - the mouth-sync decision of D2 (boundary vs sine)
   - errors, cut-offs and the real duration per line
   The team rates naturalness, pronunciation, pace and warmth by ear on
   bakeoff/README.md; "Copy sheet rows" fills in the measured columns. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { BAKEOFF_LINES } from './bakeoffLines.js'
import {
  hasSpeechSynthesis, getVoicesNow, waitForVoices, onVoicesChanged, voicesFor,
  speakSentence, cancelAll, unlockSpeech, createBoundaryLogger,
} from '../tts/speechSynthesis.js'

const hasRecognition = () =>
  typeof globalThis.SpeechRecognition !== 'undefined' || typeof globalThis.webkitSpeechRecognition !== 'undefined'
const resultKey = (voiceName, n) => `${voiceName}|${n}`
const LANG_TAG = { ka: 'ka-GE', en: 'en-US' }

export default function BakeoffPanel() {
  const [voices, setVoices] = useState(() => getVoicesNow())
  const [lang, setLang] = useState('ka')
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [results, setResults] = useState({})
  const [playing, setPlaying] = useState(null)
  const [notice, setNotice] = useState('')
  const gen = useRef(0)

  useEffect(() => {
    let alive = true
    waitForVoices({ timeoutMs: 3000 }).then((v) => alive && setVoices(v))
    const off = onVoicesChanged((v) => alive && setVoices(v))
    return () => {
      alive = false
      off()
      cancelAll()
    }
  }, [])

  const langVoices = useMemo(() => voicesFor(voices, lang), [voices, lang])
  const kaCount = useMemo(() => voicesFor(voices, 'ka').length, [voices])
  const enCount = useMemo(() => voicesFor(voices, 'en').length, [voices])

  function speakOne(voice, line, myGen) {
    return new Promise((resolve) => {
      const logger = createBoundaryLogger()
      const t0 = performance.now()
      let settled = false
      const record = (extra) => {
        if (settled) return
        settled = true
        const log = {
          ...logger.log,
          ...extra,
          voice: voice.name,
          lang,
          n: line.n,
          key: line.key,
          chars: line.speak[lang].length,
          rate,
          pitch,
          at: new Date().toISOString(),
        }
        if (myGen === gen.current) setResults((r) => ({ ...r, [resultKey(voice.name, line.n)]: log }))
        resolve(log)
      }
      speakSentence(line.speak[lang], {
        voice,
        lang: LANG_TAG[lang],
        rate,
        pitch,
        onStart: logger.callbacks.onStart,
        onBoundary: logger.callbacks.onBoundary,
        onEnd: (e) => {
          logger.callbacks.onEnd(e)
          record({ durationMs: e.durationMs ?? Math.round(performance.now() - t0), cancelled: Boolean(e.cancelled) })
        },
        onError: (err) => {
          logger.callbacks.onError(err)
          record({ durationMs: Math.round(performance.now() - t0), cancelled: false })
        },
      })
      // a voice that never starts (offline "Online" voice, hidden tab) would hang the run
      setTimeout(() => {
        if (!settled) {
          logger.callbacks.onError(new Error('no end event within 30 s'))
          cancelAll()
          record({ durationMs: Math.round(performance.now() - t0), cancelled: false })
        }
      }, 30000)
    })
  }

  async function speak(voice, lines) {
    const myGen = ++gen.current
    cancelAll()
    unlockSpeech()
    for (const line of lines) {
      if (myGen !== gen.current) break
      setPlaying({ voice: voice.name, n: line.n })
      await speakOne(voice, line, myGen)
    }
    if (myGen === gen.current) setPlaying(null)
  }

  function stop() {
    gen.current += 1
    cancelAll()
    setPlaying(null)
  }

  function sheetRows() {
    const rows = []
    for (const v of langVoices) {
      for (const line of BAKEOFF_LINES) {
        const r = results[resultKey(v.name, line.n)]
        if (!r) continue
        const errs = r.errors.length ? r.errors.join('; ') : r.cancelled ? 'cancelled' : ''
        rows.push(
          `| ${v.name} | ${line.n} | ${r.wordBoundaries}/${r.boundaries} | ${r.firstBoundaryMs ?? '–'} | ${r.durationMs ?? '–'} | ${errs} |  |  |  |  |  |`,
        )
      }
    }
    return rows.join('\n')
  }

  async function copyRows() {
    const text = sheetRows()
    if (!text) return setNotice('Nothing measured yet - speak a voice first.')
    try {
      await navigator.clipboard.writeText(text)
      setNotice(`Copied ${text.split('\n').length} row(s) for bakeoff/README.md.`)
    } catch {
      setNotice('Clipboard blocked - the rows are printed in the console.')
      console.log(text)
    }
  }

  function downloadJson() {
    const data = {
      at: new Date().toISOString(),
      userAgent: navigator.userAgent,
      speechSynthesis: hasSpeechSynthesis(),
      speechRecognition: hasRecognition(),
      voices: voices.map((v) => ({ name: v.name, lang: v.lang, localService: v.localService, default: v.default })),
      lines: BAKEOFF_LINES.map((l) => ({ n: l.n, key: l.key, ka: l.speak.ka, en: l.speak.en })),
      results: Object.values(results),
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `bakeoff-browser-${Date.now()}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <main className="bakeoff">
      <style>{CSS}</style>
      <h1>IO voice bake-off · browser voices</h1>
      <p className="bakeoff-sub">
        Dev-only page (docs/io-voice-plan.md §6.2). Rates <code>window.speechSynthesis</code> voices on the seven
        bake-off lines; the sheet and the decision block live in <code>bakeoff/README.md</code>.
      </p>

      <ul className="bakeoff-facts">
        <li>
          <b>speechSynthesis:</b> {hasSpeechSynthesis() ? 'yes' : 'NO'}
        </li>
        <li>
          <b>SpeechRecognition:</b> {hasRecognition() ? 'yes' : 'no'} (the Talk button needs it or a Georgian voice; A8)
        </li>
        <li>
          <b>voices:</b> {voices.length} total · {kaCount} Georgian · {enCount} English
        </li>
        <li>
          <b>browser:</b> <span className="bakeoff-ua">{navigator.userAgent}</span>
        </li>
      </ul>

      {!hasSpeechSynthesis() ? <p className="bakeoff-warn">This browser has no speechSynthesis. Use Edge or Chrome.</p> : null}
      {hasSpeechSynthesis() && kaCount === 0 ? (
        <p className="bakeoff-warn">
          No Georgian voice. In Edge, „Microsoft Giorgi Online (Natural)“ and „Microsoft Eka Online (Natural)“ need
          network access; in Chrome a Georgian voice exists only if the operating system has one.
        </p>
      ) : null}

      <div className="bakeoff-controls">
        <label>
          Language{' '}
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="ka">Georgian (ka)</option>
            <option value="en">English (en)</option>
          </select>
        </label>
        <label>
          Rate {rate.toFixed(2)}{' '}
          <input type="range" min="0.7" max="1.3" step="0.05" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </label>
        <label>
          Pitch {pitch.toFixed(2)}{' '}
          <input type="range" min="0.7" max="1.3" step="0.05" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} />
        </label>
        <button type="button" onClick={stop} disabled={!playing}>
          Stop
        </button>
        <button type="button" onClick={copyRows}>
          Copy sheet rows
        </button>
        <button type="button" onClick={downloadJson}>
          Download JSON
        </button>
        {notice ? <span className="bakeoff-notice">{notice}</span> : null}
      </div>

      {langVoices.map((v) => (
        <section key={v.name + v.lang} className="bakeoff-voice">
          <header>
            <h2>
              {v.name} <small>{v.lang}{v.localService ? ' · local' : ' · online'}{v.default ? ' · default' : ''}</small>
            </h2>
            <button type="button" onClick={() => speak(v, BAKEOFF_LINES)} disabled={playing?.voice === v.name}>
              {playing?.voice === v.name ? `Speaking line ${playing.n}…` : 'Speak all 7 lines'}
            </button>
          </header>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Line ({lang})</th>
                <th>Sounds</th>
                <th>Words/all boundaries</th>
                <th>First boundary</th>
                <th>Duration</th>
                <th>Errors</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {BAKEOFF_LINES.map((line) => {
                const r = results[resultKey(v.name, line.n)]
                const active = playing?.voice === v.name && playing?.n === line.n
                return (
                  <tr key={line.n} className={active ? 'is-active' : ''}>
                    <td>{line.n}</td>
                    <td lang={lang} className="bakeoff-text">
                      {line.speak[lang]}
                      <div className="bakeoff-key">{line.key}</div>
                    </td>
                    <td className="bakeoff-sounds">{line.sounds}</td>
                    <td>{r ? `${r.wordBoundaries}/${r.boundaries}` : '–'}</td>
                    <td>{r ? (r.firstBoundaryMs != null ? `${r.firstBoundaryMs} ms` : 'none') : '–'}</td>
                    <td>{r?.durationMs != null ? `${(r.durationMs / 1000).toFixed(1)} s` : '–'}</td>
                    <td className="bakeoff-err">{r ? (r.errors.length ? r.errors.join('; ') : r.cancelled ? 'cancelled' : 'ok') : '–'}</td>
                    <td>
                      <button type="button" onClick={() => speak(v, [line])} disabled={Boolean(playing)}>
                        {r ? 'Replay' : 'Speak'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      ))}

      {hasSpeechSynthesis() && langVoices.length === 0 && voices.length > 0 ? (
        <p className="bakeoff-warn">No voice for „{lang}“ in this browser.</p>
      ) : null}

      <details className="bakeoff-all">
        <summary>All {voices.length} voices this browser reports</summary>
        <ul>
          {voices.map((v) => (
            <li key={v.name + v.lang}>
              {v.name} <small>{v.lang}{v.localService ? ' · local' : ' · online'}</small>
            </li>
          ))}
        </ul>
      </details>
    </main>
  )
}

/* Styles live here, not in global.css: the page is never built. */
const CSS = `
.bakeoff { max-width: 1100px; margin: 0 auto; padding: 24px 16px 64px; font-family: var(--font, system-ui); color: var(--ink, #1c2434); }
.bakeoff h1 { font-size: 1.5rem; margin: 0 0 4px; }
.bakeoff h2 { font-size: 1.05rem; margin: 0; }
.bakeoff h2 small { font-weight: 400; color: var(--muted, #5b6b82); font-size: 0.8rem; }
.bakeoff-sub { color: var(--muted, #5b6b82); margin: 0 0 16px; }
.bakeoff-facts { list-style: none; padding: 12px 16px; margin: 0 0 16px; background: var(--blue-soft, #e6f0f8); border-radius: 12px; font-size: 0.9rem; }
.bakeoff-ua { font-size: 0.78rem; overflow-wrap: anywhere; }
.bakeoff-warn { background: #fff4e5; border: 1px solid #f0c48a; padding: 10px 14px; border-radius: 10px; }
.bakeoff-controls { display: flex; flex-wrap: wrap; gap: 12px 18px; align-items: center; margin: 0 0 20px; font-size: 0.9rem; }
.bakeoff-controls button, .bakeoff-voice button { font: inherit; padding: 6px 12px; border-radius: 999px; border: 1px solid var(--line, #dfe6ef); background: var(--card, #fff); cursor: pointer; }
.bakeoff-controls button:disabled, .bakeoff-voice button:disabled { opacity: 0.5; cursor: default; }
.bakeoff-notice { color: var(--blue, #1e5b86); }
.bakeoff-voice { background: var(--card, #fff); border: 1px solid var(--line, #dfe6ef); border-radius: 16px; padding: 14px 16px; margin: 0 0 16px; }
.bakeoff-voice header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 8px; }
.bakeoff-voice table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.bakeoff-voice th, .bakeoff-voice td { text-align: left; padding: 6px 8px; border-top: 1px solid var(--line, #dfe6ef); vertical-align: top; }
.bakeoff-voice tr.is-active td { background: var(--blue-soft, #e6f0f8); }
.bakeoff-text { min-width: 260px; }
.bakeoff-key { color: var(--muted, #5b6b82); font-size: 0.75rem; }
.bakeoff-sounds { color: var(--muted, #5b6b82); white-space: nowrap; }
.bakeoff-err { max-width: 180px; overflow-wrap: anywhere; }
.bakeoff-all { font-size: 0.85rem; color: var(--muted, #5b6b82); }
`
