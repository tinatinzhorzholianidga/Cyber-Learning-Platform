/* The bake-off lines (docs/io-voice-plan.md §6.2): exact hints.js text,
   chosen for the sounds they exercise. Shared by the ?bakeoff=1 page and
   scripts/voice-bakeoff.mjs so every candidate voice reads identical text.
   Plain ESM: no browser globals at import time (Node scripts import it). */
import { HINTS } from '../../content/hints.js'
import { stripForSpeech } from '../tts/speechSynthesis.js'

export const BAKEOFF_KEYS = [
  ['greeting', 0, 'ქ ×2, ყ ×2, -რთხ-, -ბრძ-'],
  ['basicCourse', 3, 'წ, ქ ×2, numerals, em-dash pause'],
  ['kidsPlatform', 3, 'ჭ, ვცხ-, -ვშვ-'],
  ['certificate', 0, 'წ, ღ, ქ ×2, 100-დან'],
  ['encouragement', 3, 'ქ, წ, ყ'],
  ['farewell', 0, 'წ, ყ, -ვხვდ-; tests the emoji strip'],
  ['evening', 0, 'ღ ×2 (seventh line, optional)'],
]

export const BAKEOFF_LINES = BAKEOFF_KEYS.map(([key, i, sounds], n) => {
  const line = HINTS[key][i]
  return {
    n: n + 1,
    key: `${key}[${i}]`,
    sounds,
    ka: line.ka,
    en: line.en,
    // what the voice actually reads: emoji and markup removed
    speak: { ka: stripForSpeech(line.ka), en: stripForSpeech(line.en) },
  }
})
