import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  stripForSpeech, splitSentences, voicesFor, pickVoice, hasVoiceFor, hasSpeechSynthesis, waitForVoices, speakSentence, createBoundaryLogger,
} from '../src/voice/tts/speechSynthesis.js'
import { BAKEOFF_LINES } from '../src/voice/dev/bakeoffLines.js'
import { HINTS } from '../src/content/hints.js'
import { EMOJI } from '../scripts/lib/lint.mjs'

test('stripForSpeech removes emoji, markdown, audio tags and (DGA)', () => {
  assert.equal(stripForSpeech('მალე შევხვდებით! 👋'), 'მალე შევხვდებით!')
  assert.equal(stripForSpeech('[curious] **ბოლდი** _კურსივი_ `კოდი` # სათაური'), 'ბოლდი კურსივი კოდი სათაური')
  assert.equal(stripForSpeech('სააგენტო (DGA) უძღვება'), 'სააგენტო უძღვება')
  assert.equal(stripForSpeech('- ერთი\n- ორი\n• სამი'), 'ერთი ორი სამი')
  assert.equal(stripForSpeech('a ❤️ b 👨‍👩‍👧 c'), 'a b c')
  assert.equal(stripForSpeech('```js\nx\n``` ტექსტი'), 'ტექსტი')
  assert.equal(stripForSpeech(null), '')
})

test('splitSentences keeps the unfinished tail', () => {
  assert.deepEqual(splitSentences('ერთი. ორი! სამი? ოთხი'), { sentences: ['ერთი.', 'ორი!', 'სამი?'], rest: 'ოთხი' })
  assert.deepEqual(splitSentences('ბოლოს… და კიდევ'), { sentences: ['ბოლოს…'], rest: 'და კიდევ' })
  assert.deepEqual(splitSentences('დასრულებული.'), { sentences: ['დასრულებული.'], rest: '' })
  assert.deepEqual(splitSentences(''), { sentences: [], rest: '' })
  // a decimal or "100-დან 70." inside a sentence is not a boundary unless followed by a space/end
  assert.deepEqual(splitSentences('ვერსია 1.5 კარგია. შემდეგი'), { sentences: ['ვერსია 1.5 კარგია.'], rest: 'შემდეგი' })
})

const voices = [
  { name: 'Google US English', lang: 'en-US', localService: false },
  { name: 'Microsoft Eka Online (Natural) - Georgian (Georgia)', lang: 'ka-GE', localService: false },
  { name: 'Microsoft Giorgi Online (Natural) - Georgian (Georgia)', lang: 'ka-GE', localService: false },
  { name: 'Some Local Georgian', lang: 'ka_GE', localService: true },
  { name: 'Microsoft Ryan Online (Natural) - English (United Kingdom)', lang: 'en-GB', localService: false },
  { name: 'Microsoft Zira - English (United States)', lang: 'en-US', localService: true },
]

test('voicesFor ranks preferred names first, then online natural voices', () => {
  assert.deepEqual(voicesFor(voices, 'ka').map((v) => v.name), [
    'Microsoft Giorgi Online (Natural) - Georgian (Georgia)',
    'Microsoft Eka Online (Natural) - Georgian (Georgia)',
    'Some Local Georgian',
  ])
  assert.equal(pickVoice(voices, 'en').name, 'Microsoft Ryan Online (Natural) - English (United Kingdom)')
  assert.equal(pickVoice(voices, 'ka', ['Eka']).name, 'Microsoft Eka Online (Natural) - Georgian (Georgia)')
  assert.equal(hasVoiceFor(voices, 'ka'), true)
  assert.equal(hasVoiceFor(voices, 'de'), false)
  assert.equal(pickVoice([], 'ka'), null)
})

test('without speechSynthesis (Node) everything degrades quietly', async () => {
  assert.equal(hasSpeechSynthesis(), false)
  assert.deepEqual(await waitForVoices({ timeoutMs: 10 }), [])
  let error = null
  const h = speakSentence('x', { onError: (e) => (error = e) })
  assert.equal(h.utterance, null)
  assert.match(error.message, /unavailable/)
  h.cancel()
})

test('the boundary logger counts word boundaries and the first latency', () => {
  const { log, callbacks } = createBoundaryLogger()
  callbacks.onStart()
  callbacks.onBoundary({ name: 'sentence', sinceStartMs: 5 })
  callbacks.onBoundary({ name: 'word', sinceStartMs: 120.4 })
  callbacks.onBoundary({ name: 'word', sinceStartMs: 300 })
  callbacks.onEnd()
  callbacks.onError(new Error('boom'))
  assert.deepEqual(log, { starts: 1, ends: 1, boundaries: 3, wordBoundaries: 2, firstBoundaryMs: 5, errors: ['boom'] })
})

test('the bake-off lines are the exact hints.js text with emoji stripped', () => {
  assert.equal(BAKEOFF_LINES.length, 7)
  assert.equal(BAKEOFF_LINES[0].ka, HINTS.greeting[0].ka)
  assert.equal(BAKEOFF_LINES[5].key, 'farewell[0]')
  assert.equal(BAKEOFF_LINES[5].ka, HINTS.farewell[0].ka)
  for (const line of BAKEOFF_LINES) {
    assert.equal(line.speak.ka.match(EMOJI), null, `${line.key} still has emoji`)
    assert.ok(line.speak.ka.length > 20)
    assert.ok(line.speak.en.length > 20)
  }
})
