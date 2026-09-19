import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createPushToTalkSession } from '../src/voice/session/pushToTalk.js'
import { STRINGS } from '../src/voice/tutor/strings.js'
import { stripForSpeech } from '../src/voice/tts/speechSynthesis.js'

const KEY = 'AIza' + 's'.repeat(35)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sse = (chunks) => chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join('')
const textChunk = (text, finish) => ({ candidates: [{ content: { parts: [{ text }] }, ...(finish ? { finishReason: finish } : {}) }] })

/* Gemini chat mock: two chunks, the sentence boundary inside the second */
function mockChat(answerChunks, { delayMs = 0 } = {}) {
  const original = globalThis.fetch
  globalThis.fetch = async () =>
    new Response(
      new ReadableStream({
        async start(c) {
          const enc = new TextEncoder()
          for (const [i, ch] of answerChunks.entries()) {
            if (delayMs) await sleep(delayMs)
            c.enqueue(enc.encode(sse([textChunk(ch, i === answerChunks.length - 1 ? 'STOP' : undefined)])))
          }
          c.close()
        },
      }),
      { status: 200, headers: { 'Content-Type': 'text/event-stream' } },
    )
  return () => (globalThis.fetch = original)
}

/* a speaker that "plays" each sentence for `ms` and reports like the real ones */
function fakeSpeaker({ ms = 10 } = {}) {
  const spoken = []
  let cancelled = 0
  let pending = 0
  let cb
  return {
    spoken,
    get cancelled() {
      return cancelled
    },
    factory: async ({ callbacks }) => {
      cb = callbacks
      return {
        speak(s) {
          spoken.push(s)
          pending += 1
          const my = cancelled
          setTimeout(() => {
            if (my !== cancelled) return
            cb.onSentence(s)
            cb.onMouth('pulse')
            pending -= 1
            if (pending === 0) cb.onDone()
          }, ms)
        },
        cancel() {
          cancelled += 1
          pending = 0
        },
      }
    },
  }
}

function record(session) {
  const events = { state: [], user: [], io: [], mouth: [], errors: [] }
  session.on('state', (s) => events.state.push(s))
  session.on('userCaption', (e) => events.user.push(e))
  session.on('ioCaption', (e) => events.io.push(e))
  session.on('mouth', (e) => events.mouth.push(e.mode))
  session.on('error', (e) => events.errors.push(e.key))
  return events
}

const opts = (speaker) => ({
  ctx: null,
  player: null,
  lang: 'ka',
  kind: 'test',
  reduced: true,
  makeSpeaker: speaker.factory,
  chatOptions: { apiKey: KEY, config: { backend: 'gemini', model: 'm' }, retry: false },
})

test('start speaks the scripted greeting, a typed question streams sentence by sentence', async () => {
  const restore = mockChat(['ფიშინგი თაღლითობაა. ფრთხი', 'ლად იყავით.'])
  try {
    const speaker = fakeSpeaker()
    const session = createPushToTalkSession(opts(speaker))
    const ev = record(session)
    await session.start()
    // the session is born 'connecting'; the first event is the greeting
    assert.deepEqual(ev.state, ['speaking', 'idle'])
    assert.deepEqual(speaker.spoken, [stripForSpeech(STRINGS.ka.greeting)])
    assert.equal(ev.io[0].text, STRINGS.ka.greeting)

    session.sendText('რა არის ფიშინგი?')
    await sleep(150)
    assert.deepEqual(ev.state.slice(2), ['thinking', 'speaking', 'idle'])
    assert.deepEqual(ev.user.at(-1), { text: 'რა არის ფიშინგი?', final: true })
    assert.deepEqual(speaker.spoken.slice(1), ['ფიშინგი თაღლითობაა.', 'ფრთხილად იყავით.'])
    const ioText = ev.io.slice(1).map((e) => e.text).join('')
    assert.equal(ioText, 'ფიშინგი თაღლითობაა. ფრთხილად იყავით.')
    assert.equal(ev.io.at(-1).final, true)
    assert.ok(ev.mouth.includes('pulse'))
    await session.end()
    assert.equal(session.state, 'ended')
  } finally {
    restore()
  }
})

test('interrupt while speaking cancels the speaker, marks the caption and returns to idle', async () => {
  const restore = mockChat(['გრძელი პასუხი. კიდევ ერთი.'])
  try {
    const speaker = fakeSpeaker({ ms: 500 })
    const session = createPushToTalkSession(opts(speaker))
    const ev = record(session)
    const starting = session.start()
    await sleep(50)
    // the greeting is still "playing" (500 ms): interrupt it
    assert.equal(session.state, 'speaking')
    session.interrupt()
    await starting
    assert.equal(session.state, 'interrupted')
    assert.equal(speaker.cancelled, 1)
    assert.equal(ev.io.at(-1).interrupted, true)
    await sleep(450)
    assert.equal(session.state, 'idle')
    session.sendText('კითხვა?')
    await sleep(100)
    assert.equal(session.state, 'speaking')
    session.sendText('სხვა კითხვა?') // a new question interrupts first
    await sleep(100)
    assert.equal(speaker.cancelled, 2)
    assert.equal(ev.user.at(-1).text, 'სხვა კითხვა?')
    await session.end()
  } finally {
    restore()
  }
})

test('without a voice IO answers in captions; without recognition the ring reports typed mode', async () => {
  const restore = mockChat(['ტექსტური პასუხი.'])
  try {
    const session = createPushToTalkSession({ ...opts({ factory: async () => null }) })
    const ev = record(session)
    await session.start()
    assert.deepEqual(ev.errors, ['noVoice'])
    assert.deepEqual(ev.state, ['speaking', 'idle'])
    assert.deepEqual(ev.mouth, ['sine'])
    session.listen()
    assert.deepEqual(ev.errors, ['noVoice', 'errSpeech'])
    assert.equal(session.state, 'idle')
    session.sendText('კითხვა')
    await sleep(100)
    assert.equal(ev.io.at(-1).final, true)
    assert.equal(session.state, 'idle')
    await session.end()
  } finally {
    restore()
  }
})

test('a rejected key surfaces as errKey and the session stays usable', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: 'API key not valid' } }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  try {
    const speaker = fakeSpeaker()
    const session = createPushToTalkSession(opts(speaker))
    const ev = record(session)
    await session.start()
    session.sendText('კითხვა?')
    await sleep(80)
    assert.deepEqual(ev.errors, ['errKey'])
    assert.equal(session.state, 'idle')
    await session.end()
  } finally {
    globalThis.fetch = original
  }
})
