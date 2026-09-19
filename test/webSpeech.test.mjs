import { test } from 'node:test'
import assert from 'node:assert/strict'

/* a fake SpeechRecognition the wrapper drives */
class FakeRecognition {
  constructor() {
    FakeRecognition.last = this
    this.started = false
  }
  start() {
    if (FakeRecognition.throwOnStart) throw new Error('already started')
    this.started = true
    this.onstart?.()
  }
  stop() {
    this.onend?.()
  }
  abort() {
    this.onerror?.({ error: 'aborted' })
    this.onend?.()
  }
  result(items, isFinal) {
    this.onresult?.({ resultIndex: 0, results: items.map((t) => ({ 0: { transcript: t }, isFinal, length: 1 })) })
  }
}
globalThis.SpeechRecognition = FakeRecognition
const { createRecognizer, mapRecognitionError, recognitionSupported, LANG_TAG } = await import('../src/voice/stt/webSpeech.js')

test('error codes map to voice strings; aborted is silent', () => {
  assert.equal(mapRecognitionError('not-allowed'), 'noMic')
  assert.equal(mapRecognitionError('audio-capture'), 'noMic')
  assert.equal(mapRecognitionError('language-not-supported'), 'errSpeech')
  assert.equal(mapRecognitionError('service-not-allowed'), 'errSpeech')
  assert.equal(mapRecognitionError('network'), 'errSocket')
  assert.equal(mapRecognitionError('no-speech'), 'errEmpty')
  assert.equal(mapRecognitionError('aborted'), null)
  assert.equal(mapRecognitionError(undefined), 'errSpeech')
})

test('one utterance: interim captions, then the final text, then end', () => {
  assert.equal(recognitionSupported(), true)
  const got = { interim: [], final: [], errors: [], ends: [], starts: 0 }
  const rec = createRecognizer({
    lang: 'ka',
    onStart: () => (got.starts += 1),
    onInterim: (t) => got.interim.push(t),
    onFinal: (t) => got.final.push(t),
    onError: (k) => got.errors.push(k),
    onEnd: (e) => got.ends.push(e),
  })
  rec.start()
  const r = FakeRecognition.last
  assert.equal(r.lang, LANG_TAG.ka)
  assert.equal(r.interimResults, true)
  assert.equal(r.continuous, false)
  assert.equal(rec.isActive(), true)
  r.result(['რა არის'], false)
  r.result(['რა არის ფიშინგი'], false)
  r.result(['რა არის ფიშინგი?'], true)
  r.stop()
  assert.deepEqual(got.interim, ['რა არის', 'რა არის ფიშინგი'])
  assert.deepEqual(got.final, ['რა არის ფიშინგი?'])
  assert.deepEqual(got.ends, [{ heard: true }])
  assert.deepEqual(got.errors, [])
  assert.equal(rec.isActive(), false)
  assert.equal(got.starts, 1)
})

test('abort reports no error; a denied microphone does; a failing start ends cleanly', () => {
  const got = { errors: [], ends: [] }
  const rec = createRecognizer({ lang: 'en', onError: (k) => got.errors.push(k), onEnd: (e) => got.ends.push(e) })
  rec.start()
  rec.abort()
  assert.deepEqual(got.errors, [])
  assert.deepEqual(got.ends, [{ heard: false }])
  rec.start()
  FakeRecognition.last.onerror({ error: 'not-allowed' })
  FakeRecognition.last.onend()
  assert.deepEqual(got.errors, ['noMic'])
  FakeRecognition.throwOnStart = true
  rec.start()
  FakeRecognition.throwOnStart = false
  assert.deepEqual(got.errors, ['noMic', 'errSpeech'])
  assert.equal(got.ends.length, 3)
})
