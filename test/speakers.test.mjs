import { test } from 'node:test'
import assert from 'node:assert/strict'
import { synthSpeech } from '../src/voice/audio/pcm.js'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* ---- browser voices: a fake speechSynthesis ---- */
const queue = []
let cancels = 0
globalThis.SpeechSynthesisUtterance = class {
  constructor(text) {
    this.text = text
  }
}
globalThis.speechSynthesis = {
  speak: (u) => queue.push(u),
  cancel: () => {
    cancels += 1
    queue.length = 0
  },
  resume: () => {},
  getVoices: () => [],
}
const { createBrowserSpeaker } = await import('../src/voice/tts/speechSynthesis.js')

test('browser speaker: pulse when a word boundary arrives, sine when none does, done after the last', async () => {
  const got = { mouth: [], boundaries: 0, sentences: [], done: 0, errors: 0 }
  const speaker = createBrowserSpeaker({
    voice: { name: 'Giorgi' },
    lang: 'ka-GE',
    boundaryWaitMs: 30,
    onMouth: (m) => got.mouth.push(m),
    onBoundary: () => (got.boundaries += 1),
    onSentence: (s) => got.sentences.push(s),
    onDone: () => (got.done += 1),
    onError: () => (got.errors += 1),
  })
  speaker.speak('ერთი წინადადება.')
  speaker.speak('მეორე.')
  assert.equal(queue.length, 2)
  assert.equal(queue[0].voice.name, 'Giorgi')
  assert.equal(speaker.pending(), 2)
  const [u1, u2] = queue
  u1.onstart()
  u1.onboundary({ name: 'word', charIndex: 0 })
  u1.onboundary({ name: 'word', charIndex: 6 })
  u1.onboundary({ name: 'sentence', charIndex: 0 }) // not a word: ignored
  assert.deepEqual(got.mouth, ['pulse'])
  assert.equal(got.boundaries, 2)
  u1.onend()
  assert.equal(got.done, 0)
  u2.onstart()
  await sleep(60) // no boundary within 30 ms → sine
  assert.deepEqual(got.mouth, ['pulse', 'sine'])
  u2.onend()
  assert.equal(got.done, 1)
  assert.deepEqual(got.sentences, ['ერთი წინადადება.', 'მეორე.'])
  assert.equal(speaker.idle(), true)
})

test('browser speaker: cancel empties the queue and mutes late events', () => {
  const got = { done: 0, mouth: [] }
  const speaker = createBrowserSpeaker({ voice: null, lang: 'en-US', onDone: () => (got.done += 1), onMouth: (m) => got.mouth.push(m) })
  queue.length = 0
  speaker.speak('One.')
  const u = queue[0]
  const before = cancels
  speaker.cancel()
  assert.equal(cancels, before + 1)
  u.onstart()
  u.onerror({ error: 'interrupted' })
  assert.equal(got.done, 0)
  assert.deepEqual(got.mouth, [])
  assert.equal(speaker.idle(), true)
})

/* ---- Gemini TTS: mocked fetch + a fake player ---- */
const { createGeminiSpeaker } = await import('../src/voice/tts/geminiDirect.js')
const pcm = synthSpeech({ seconds: 0.2, seed: 3 })
const b64 = Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength).toString('base64')
const part = (data) => ({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'audio/l16; rate=24000; channels=1', data } }] } }] })
const sse = (chunks) => chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join('')

function fakePlayer() {
  const calls = []
  let drains = 0
  return {
    calls,
    enqueue: (bytes, rate) => calls.push({ n: bytes.length, rate }),
    drained: () => {
      drains += 1
      return Promise.resolve()
    },
    flush: () => calls.push('flush'),
    get drains() {
      return drains
    },
  }
}

test('gemini speaker keeps sentence order while prefetching, reports first audio and done', async () => {
  const original = globalThis.fetch
  const requests = []
  globalThis.fetch = async (url, init) => {
    const text = JSON.parse(init.body).contents[0].parts[0].text
    requests.push(text)
    const slow = text.startsWith('A')
    const stream = new ReadableStream({
      async start(c) {
        const enc = new TextEncoder()
        if (slow) await sleep(30)
        c.enqueue(enc.encode(sse([part(b64)])))
        if (slow) await sleep(30)
        c.enqueue(enc.encode(sse([part(b64)])))
        c.close()
      },
    })
    return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
  }
  try {
    const player = fakePlayer()
    const got = { first: null, sentences: [], mouth: [], done: 0 }
    const speaker = createGeminiSpeaker({
      apiKey: 'k',
      model: 'tts',
      voiceName: 'Charon',
      player,
      onFirstAudio: (ms) => (got.first = ms),
      onSentence: (s) => got.sentences.push(s),
      onMouth: (m) => got.mouth.push(m),
      onDone: () => (got.done += 1),
    })
    speaker.speak('A slow first sentence.')
    speaker.speak('B fast second sentence.')
    await sleep(200)
    assert.deepEqual(requests, ['A slow first sentence.', 'B fast second sentence.'], 'both fetched (prefetch)')
    assert.deepEqual(got.sentences, ['A slow first sentence.', 'B fast second sentence.'], 'announced in order')
    assert.equal(player.calls.length, 4)
    assert.ok(player.calls.every((c) => c.n === pcm.byteLength && c.rate === 24000))
    assert.equal(typeof got.first, 'number')
    assert.deepEqual(got.mouth, ['level'])
    assert.equal(got.done, 1)
    assert.equal(speaker.idle(), true)
  } finally {
    globalThis.fetch = original
  }
})

test('gemini speaker: cancel flushes and silences everything after it', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () =>
    new Response(
      new ReadableStream({
        async start(c) {
          await sleep(20)
          c.enqueue(new TextEncoder().encode(sse([part(b64)])))
          c.close()
        },
      }),
      { status: 200 },
    )
  try {
    const player = fakePlayer()
    let done = 0
    const speaker = createGeminiSpeaker({ apiKey: 'k', model: 'tts', voiceName: 'Charon', player, onDone: () => (done += 1) })
    speaker.speak('One.')
    speaker.cancel()
    await sleep(60)
    assert.deepEqual(player.calls, ['flush'])
    assert.equal(done, 0)
    assert.equal(speaker.pending(), 0)
  } finally {
    globalThis.fetch = original
  }
})
