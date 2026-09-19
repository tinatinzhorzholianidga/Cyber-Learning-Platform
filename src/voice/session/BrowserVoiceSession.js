/* BrowserVoiceSession (A3, docs/io-voice-plan.md §5.5): the zero-cost
   path. Speech recognition and voices come from the browser (Edge has
   Georgian: Giorgi and Eka); the answers come from Gemini Flash or a
   local model. The mouth follows the voice's word boundaries, or the
   sine wave when the voice reports none. Without a voice for the page
   language IO answers in captions. */
import { createPushToTalkSession } from './pushToTalk.js'
import { waitForVoices, pickVoice, PREFERRED_VOICES, createBrowserSpeaker, hasSpeechSynthesis } from '../tts/speechSynthesis.js'
import { LANG_TAG } from '../stt/webSpeech.js'

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {}

export function create({ ctx, player, lang = 'ka', reduced = false }) {
  return createPushToTalkSession({
    ctx,
    player,
    lang,
    reduced,
    kind: 'browser',
    async makeSpeaker({ callbacks }) {
      if (!hasSpeechSynthesis()) return null
      const voices = await waitForVoices({ timeoutMs: 1500 })
      const preferred = [ENV.VITE_IO_VOICE_NAME, ...(PREFERRED_VOICES[lang] || [])].filter(Boolean)
      const voice = pickVoice(voices, lang, preferred)
      if (!voice) return null
      return createBrowserSpeaker({
        voice,
        lang: LANG_TAG[lang] || lang,
        rate: Number(ENV.VITE_IO_VOICE_RATE || 1),
        pitch: Number(ENV.VITE_IO_VOICE_PITCH || 1),
        ...callbacks,
      })
    },
  })
}
