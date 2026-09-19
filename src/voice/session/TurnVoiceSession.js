/* TurnVoiceSession with the direct transport (docs/io-voice-plan.md §5.6):
   speech recognition in the browser, Gemini Flash for the answer, Gemini
   TTS per sentence through the player, so the mouth follows the audio's
   amplitude. Needs a Gemini key (dev key or pasted). Track P keeps this
   session and swaps the transports for the Worker. */
import { createPushToTalkSession } from './pushToTalk.js'
import { createGeminiSpeaker } from '../tts/geminiDirect.js'
import { resolveKey } from '../auth/devKey.js'

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {}

export function create({ ctx, player, lang = 'ka', reduced = false, page = null }) {
  return createPushToTalkSession({
    ctx,
    player,
    lang,
    reduced,
    page,
    kind: 'turn',
    async makeSpeaker({ callbacks }) {
      const apiKey = resolveKey()
      if (!player || !apiKey) return null
      return createGeminiSpeaker({
        apiKey,
        model: ENV.VITE_IO_TTS_MODEL || 'gemini-3.1-flash-tts-preview',
        voiceName: ENV.VITE_IO_GEMINI_VOICE || 'Charon',
        player,
        ...callbacks,
      })
    },
  })
}
