/* Browser voices (window.speechSynthesis) for BrowserVoiceSession and the
   bake-off page (docs/io-voice-plan.md §5.5, §2.11).

   D1 delivers voice discovery, text preparation, sentence speaking and the
   word-boundary logging the bake-off needs; D2 maps the boundary events to
   IO's mouth. No React, no globals at import time. */

/* Voice names to try first, per language. Edge ships Microsoft's online
   natural voices; other browsers offer whatever the OS has. */
export const PREFERRED_VOICES = {
  ka: ['Microsoft Giorgi Online (Natural)', 'Microsoft Eka Online (Natural)'],
  en: ['Microsoft Ryan Online (Natural)', 'Microsoft Guy Online (Natural)', 'Microsoft Sonia Online (Natural)', 'Microsoft Aria Online (Natural)', 'Google UK English Male', 'Google US English'],
}

export function hasSpeechSynthesis() {
  return typeof globalThis.speechSynthesis !== 'undefined' && typeof globalThis.SpeechSynthesisUtterance !== 'undefined'
}

export function getVoicesNow() {
  try {
    return hasSpeechSynthesis() ? speechSynthesis.getVoices() : []
  } catch {
    return []
  }
}

/* Voices arrive asynchronously in Chromium: resolves with the list once
   `voiceschanged` fires or the timeout passes (whichever first). */
export function waitForVoices({ timeoutMs = 1500 } = {}) {
  return new Promise((resolve) => {
    const now = getVoicesNow()
    if (now.length) return resolve(now)
    if (!hasSpeechSynthesis()) return resolve([])
    let done = false
    const finish = () => {
      if (done) return
      done = true
      speechSynthesis.removeEventListener?.('voiceschanged', finish)
      resolve(getVoicesNow())
    }
    speechSynthesis.addEventListener?.('voiceschanged', finish)
    setTimeout(finish, timeoutMs)
  })
}

export function onVoicesChanged(cb) {
  if (!hasSpeechSynthesis() || !speechSynthesis.addEventListener) return () => {}
  const handler = () => cb(getVoicesNow())
  speechSynthesis.addEventListener('voiceschanged', handler)
  return () => speechSynthesis.removeEventListener('voiceschanged', handler)
}

const baseLang = (tag) => String(tag || '').toLowerCase().replace('_', '-').split('-')[0]

/* Voices for a language ('ka' | 'en'), preferred names first, then online
   natural voices, then the rest. */
export function voicesFor(voices, lang, preferredNames = PREFERRED_VOICES[lang] || []) {
  const l = baseLang(lang)
  const list = (voices || []).filter((v) => baseLang(v.lang) === l)
  const rank = (v) => {
    const i = preferredNames.findIndex((n) => v.name.toLowerCase().includes(n.toLowerCase()))
    if (i >= 0) return i
    if (/online \(natural\)/i.test(v.name)) return 100
    return 200 + (v.localService ? 0 : 1)
  }
  return list.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
}

export function pickVoice(voices, lang, preferredNames) {
  return voicesFor(voices, lang, preferredNames)[0] || null
}

/* True when the browser can speak the page language at all. */
export function hasVoiceFor(voices, lang) {
  return voicesFor(voices, lang).length > 0
}

/* Text as the voice should read it: no markdown, no emoji, no audio tags. */
export function stripForSpeech(text) {
  return String(text || '')
    .replace(/\[[a-z ]{2,20}\]/gi, ' ') // [curious], [laughs] - audio tags for Gemini voices
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[*_`~#>]+/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\p{Extended_Pictographic}|️|‍/gu, '')
    .replace(/\(DGA\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/* Split streamed text into sentences at . ! ? … followed by a space or the
   end. Returns { sentences, rest } so a caller can keep the unfinished tail. */
export function splitSentences(text) {
  const sentences = []
  let rest = String(text || '')
  const re = /^(.*?[.!?…]+)(?:\s+|$)/s
  let m
  while ((m = re.exec(rest))) {
    const s = m[1].trim()
    if (s) sentences.push(s)
    rest = rest.slice(m[0].length)
    if (!m[0].length) break
  }
  return { sentences, rest }
}

/* Speak one sentence. Returns a handle with cancel(). The callbacks carry
   the events the mouth and the bake-off need. */
export function speakSentence(text, { voice, lang, rate = 1, pitch = 1, volume = 1, onStart, onBoundary, onEnd, onError } = {}) {
  if (!hasSpeechSynthesis()) {
    onError?.(new Error('speechSynthesis unavailable'))
    return { utterance: null, cancel() {} }
  }
  const u = new SpeechSynthesisUtterance(text)
  if (voice) u.voice = voice
  if (lang) u.lang = lang
  u.rate = rate
  u.pitch = pitch
  u.volume = volume
  const t0 = () => (globalThis.performance?.now?.() ?? Date.now())
  let started = 0
  u.onstart = () => {
    started = t0()
    onStart?.({ at: started })
  }
  u.onboundary = (e) => {
    onBoundary?.({ name: e.name, charIndex: e.charIndex, charLength: e.charLength, sinceStartMs: started ? t0() - started : null })
  }
  u.onend = () => onEnd?.({ durationMs: started ? t0() - started : null })
  u.onerror = (e) => {
    // cancel() raises 'interrupted' / 'canceled' on the current utterance - not a failure
    if (e.error === 'interrupted' || e.error === 'canceled') return onEnd?.({ cancelled: true })
    onError?.(new Error(e.error || 'speech error'))
  }
  speechSynthesis.speak(u)
  return {
    utterance: u,
    cancel() {
      try {
        speechSynthesis.cancel()
      } catch {
        /* ignore */
      }
    },
  }
}

/* Stop everything queued or speaking. */
export function cancelAll() {
  try {
    if (hasSpeechSynthesis()) speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
}

/* An empty utterance inside the user's click unlocks speech on iOS Safari
   (docs/io-voice-plan.md §5.5). Harmless elsewhere. */
export function unlockSpeech() {
  try {
    if (!hasSpeechSynthesis()) return
    const u = new SpeechSynthesisUtterance('')
    u.volume = 0
    speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}

/* Collects what the bake-off page reports per voice: boundary count, the
   latency of the first word boundary, errors. */
export function createBoundaryLogger() {
  const log = { starts: 0, ends: 0, boundaries: 0, wordBoundaries: 0, firstBoundaryMs: null, errors: [] }
  return {
    log,
    callbacks: {
      onStart: () => {
        log.starts += 1
      },
      onBoundary: (e) => {
        log.boundaries += 1
        if (e.name === 'word') log.wordBoundaries += 1
        if (log.firstBoundaryMs == null && e.sinceStartMs != null) log.firstBoundaryMs = Math.round(e.sinceStartMs)
      },
      onEnd: () => {
        log.ends += 1
      },
      onError: (err) => {
        log.errors.push(String(err?.message || err))
      },
    },
  }
}

/* ---- D3: the sentence queue for BrowserVoiceSession (§5.5) ----
   speak(sentence) queues utterances in order (speechSynthesis keeps its
   own queue, so the first sentence starts while the reply is still
   streaming). Per utterance the mouth mode is decided once: 'pulse' when
   a word boundary arrives within `boundaryWaitMs` of onstart, otherwise
   'sine' (A3's fallback). Chrome never ends an utterance it has garbage
   collected, so live utterances are held until they end. Callbacks:
     onMouth('pulse'|'sine')   onBoundary(e)   onSentence(text)
     onDone()  after the last queued utterance   onError(err) */
export function createBrowserSpeaker({ voice, lang, rate = 1, pitch = 1, boundaryWaitMs = 400, onMouth, onBoundary, onSentence, onDone, onError } = {}) {
  let gen = 0
  let pending = 0
  const live = new Set()
  let watchdog = 0

  const finishOne = (my) => {
    if (my !== gen) return
    pending -= 1
    if (pending <= 0) {
      pending = 0
      onDone?.()
    }
  }

  return {
    speak(sentence) {
      const text = String(sentence || '').trim()
      if (!text) return
      const my = gen
      pending += 1
      let sawBoundary = false
      try {
        speechSynthesis.resume() // Chrome can be left paused by a previous cancel()
      } catch {
        /* ignore */
      }
      const handle = speakSentence(text, {
        voice,
        lang,
        rate,
        pitch,
        onStart: () => {
          if (my !== gen) return
          onSentence?.(text)
          clearTimeout(watchdog)
          watchdog = setTimeout(() => {
            if (my === gen && !sawBoundary) onMouth?.('sine')
          }, boundaryWaitMs)
        },
        onBoundary: (e) => {
          if (my !== gen || (e.name && e.name !== 'word')) return
          if (!sawBoundary) {
            sawBoundary = true
            clearTimeout(watchdog)
            onMouth?.('pulse')
          }
          onBoundary?.(e)
        },
        onEnd: () => {
          live.delete(handle.utterance)
          finishOne(my)
        },
        onError: (err) => {
          live.delete(handle.utterance)
          if (my === gen) onError?.(err)
          finishOne(my)
        },
      })
      if (handle.utterance) live.add(handle.utterance)
    },
    cancel() {
      gen += 1
      pending = 0
      clearTimeout(watchdog)
      live.clear()
      cancelAll()
    },
    pending: () => pending,
    idle: () => pending === 0,
  }
}
