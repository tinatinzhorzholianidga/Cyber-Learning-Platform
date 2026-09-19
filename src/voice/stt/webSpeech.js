/* Speech recognition through the browser (docs/io-voice-plan.md §5.5):
   window.SpeechRecognition / webkitSpeechRecognition with the page
   language, interim results for live captions, one utterance per start
   (continuous = false, so recognition ends by itself when the visitor
   stops speaking). Recognition is cloud-based in Chrome (Google) and Edge
   (Microsoft); Safari serves some locales; Firefox has none. */

export const LANG_TAG = { ka: 'ka-GE', en: 'en-US' }

const ctor = () => globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition || null

export function recognitionSupported() {
  return Boolean(ctor())
}

/* SpeechRecognitionErrorEvent.error → a voice.* key, or null to ignore.
   'noMic' and 'errSpeech' mean: stay in typed mode; 'errEmpty' means
   nothing was heard (back to idle); 'errSocket' is the speech service. */
export function mapRecognitionError(code) {
  switch (code) {
    case 'not-allowed':
    case 'audio-capture':
      return 'noMic'
    case 'language-not-supported':
    case 'service-not-allowed':
      return 'errSpeech'
    case 'network':
      return 'errSocket'
    case 'no-speech':
      return 'errEmpty'
    case 'aborted':
    case 'bad-grammar':
    default:
      return code === undefined ? 'errSpeech' : null
  }
}

/* One recogniser for one language. Callbacks:
     onInterim(text)            the utterance so far (replaces)
     onFinal(text)              the finished utterance
     onError(key, code)         mapped error (null keys are not reported)
     onEnd({ heard })           recognition stopped (after any error)
     onStart()                  the microphone is open for recognition */
export function createRecognizer({ lang = 'ka', onInterim, onFinal, onError, onEnd, onStart } = {}) {
  const Ctor = ctor()
  if (!Ctor) return null
  let rec = null
  let active = false
  let heard = false

  return {
    start() {
      if (active) return
      rec = new Ctor()
      rec.lang = LANG_TAG[lang] || lang
      rec.interimResults = true
      rec.continuous = false
      rec.maxAlternatives = 1
      heard = false
      rec.onstart = () => {
        active = true
        onStart?.()
      }
      rec.onresult = (e) => {
        let text = ''
        let isFinal = false
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i]
          text += r[0]?.transcript || ''
          if (r.isFinal) isFinal = true
        }
        text = text.trim()
        if (!text) return
        heard = true
        if (isFinal) onFinal?.(text)
        else onInterim?.(text)
      }
      rec.onerror = (e) => {
        const key = mapRecognitionError(e?.error)
        if (key) onError?.(key, e?.error)
      }
      rec.onend = () => {
        active = false
        rec = null
        onEnd?.({ heard })
      }
      try {
        rec.start()
      } catch (err) {
        active = false
        rec = null
        onError?.('errSpeech', err?.message)
        onEnd?.({ heard: false })
      }
    },
    /* stop listening but keep what was recognised (a second press) */
    stop() {
      try {
        rec?.stop()
      } catch {
        /* not started */
      }
    },
    /* drop everything (interrupt, end) */
    abort() {
      try {
        rec?.abort()
      } catch {
        /* not started */
      }
    },
    isActive: () => active,
  }
}
