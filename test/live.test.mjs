import { test } from 'node:test'
import assert from 'node:assert/strict'
import { create, liveConfig, bytesToBase64, base64ToBytes } from '../src/voice/session/LiveVoiceSession.js'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const KEY = 'AIza' + 'l'.repeat(35)

/* a fake SDK: records connect() calls and lets the test push server messages */
function fakeConnect({ failFirst = false, hang = false } = {}) {
  const calls = []
  let n = 0
  const connect = async ({ model, config, callbacks }) => {
    n += 1
    if (hang) return new Promise(() => {})
    if (failFirst && n === 1) throw Object.assign(new Error('nope'), { code: 'NETWORK' })
    const sent = []
    const live = {
      sent,
      closed: false,
      sendRealtimeInput: (p) => sent.push({ realtimeInput: p }),
      sendClientContent: (p) => sent.push({ clientContent: p }),
      sendToolResponse: (p) => sent.push({ toolResponse: p }),
      close() {
        this.closed = true
        setTimeout(() => callbacks.onclose({ code: 1000, reason: '' }), 0)
      },
      push: (msg) => callbacks.onmessage(msg),
      dropped: (code, reason) => callbacks.onclose({ code, reason }),
    }
    calls.push({ model, config, live })
    return live
  }
  return { connect, calls, last: () => calls[calls.length - 1] }
}

function fakePlayer() {
  const p = { enqueued: [], flushes: 0 }
  p.enqueue = (bytes, rate) => p.enqueued.push({ n: bytes.length, rate })
  p.flush = () => (p.flushes += 1)
  p.drained = () => Promise.resolve()
  return p
}

function record(session) {
  const ev = { state: [], user: [], io: [], mouth: [], errors: [], mic: [] }
  session.on('state', (s) => ev.state.push(s))
  session.on('userCaption', (e) => ev.user.push(e))
  session.on('ioCaption', (e) => ev.io.push(e))
  session.on('mouth', (e) => ev.mouth.push(e.mode))
  session.on('error', (e) => ev.errors.push(e))
  session.on('mic', (e) => ev.mic.push(e.open))
  return ev
}

const pcm = bytesToBase64(new Uint8Array(4800)) // 100 ms of silence at 24 kHz
const audioPart = () => ({ serverContent: { modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: pcm } }] } } })

test('base64 helpers round-trip', () => {
  const bytes = Uint8Array.from({ length: 300 }, (_, i) => i % 256)
  assert.deepEqual([...base64ToBytes(bytesToBase64(bytes))], [...bytes])
  assert.deepEqual([...base64ToBytes(bytesToBase64(bytes.buffer))], [...bytes])
})

test('liveConfig carries the plan\'s settings and the resumption handle', () => {
  const c = liveConfig({ lang: 'ka', voiceName: 'Charon', systemInstruction: 'SYS' })
  assert.deepEqual(c.responseModalities, ['AUDIO'])
  assert.equal(c.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName, 'Charon')
  assert.deepEqual(c.inputAudioTranscription, { languageCodes: ['ka'] })
  assert.deepEqual(c.outputAudioTranscription, {})
  assert.equal(c.realtimeInputConfig.turnCoverage, 'TURN_INCLUDES_ONLY_ACTIVITY')
  assert.equal(c.contextWindowCompression.triggerTokens, '25600')
  assert.deepEqual(c.sessionResumption, {})
  assert.deepEqual(liveConfig({ lang: 'en', voiceName: 'Puck', handle: 'h1', systemInstruction: 's' }).sessionResumption, { handle: 'h1' })
  assert.equal(c.thinkingConfig, undefined)
})

test('start connects, sends the hidden session_started turn, plays audio and captions', async () => {
  const sdk = fakeConnect()
  const player = fakePlayer()
  const session = create({ ctx: null, player, lang: 'ka', connect: sdk.connect, apiKey: KEY, idleMs: 100000 })
  const ev = record(session)
  await session.start()
  assert.equal(sdk.calls.length, 1)
  assert.equal(sdk.last().model, 'gemini-3.8-live')
  assert.match(sdk.last().config.systemInstruction, /session_started/)
  assert.match(sdk.last().config.systemInstruction, /You speak Georgian \(ქართული\) by default in the polite plural/)
  const live = sdk.last().live
  assert.equal(live.sent.length, 1)
  assert.match(live.sent[0].clientContent.turns[0].parts[0].text, /^session_started \{"lang":"ka"/)
  assert.equal(live.sent[0].clientContent.turnComplete, true)
  assert.equal(session.state, 'thinking')

  live.push({ serverContent: { outputTranscription: { text: 'გამარჯობა! ' } } })
  live.push(audioPart())
  live.push(audioPart())
  live.push({ serverContent: { outputTranscription: { text: 'მე იო ვარ.' } } })
  assert.equal(session.state, 'speaking')
  assert.deepEqual(ev.mouth, ['level'])
  assert.equal(player.enqueued.length, 2)
  assert.equal(player.enqueued[0].rate, 24000)
  live.push({ serverContent: { turnComplete: true } })
  await sleep(5)
  assert.equal(session.state, 'listening') // no mic in Node, not muted → listening
  assert.deepEqual(ev.io.map((e) => e.text), ['გამარჯობა! ', 'მე იო ვარ.', ''])
  assert.equal(ev.io.at(-1).final, true)
  await session.end()
  assert.equal(session.state, 'ended')
  assert.equal(live.closed, true)
})

test('the visitor speaks: input transcription → captions → thinking; a typed question goes as realtime text', async () => {
  const sdk = fakeConnect()
  const session = create({ ctx: null, player: fakePlayer(), lang: 'en', connect: sdk.connect, apiKey: KEY, idleMs: 100000 })
  const ev = record(session)
  await session.start()
  const live = sdk.last().live
  live.push({ serverContent: { turnComplete: true } })
  await sleep(5)
  assert.equal(session.state, 'listening')
  live.push({ serverContent: { inputTranscription: { text: 'what is ' } } })
  live.push({ serverContent: { inputTranscription: { text: 'phishing?', finished: true } } })
  assert.deepEqual(ev.user, [
    { text: 'what is ', final: false },
    { text: 'what is phishing?', final: true },
  ])
  assert.equal(session.state, 'thinking')
  live.push({ serverContent: { outputTranscription: { text: 'Phishing is…' } } })
  live.push({ serverContent: { turnComplete: true } })
  await sleep(5)
  session.sendText('And scams?')
  assert.deepEqual(live.sent.at(-1), { realtimeInput: { text: 'And scams?' } })
  assert.deepEqual(ev.user.at(-1), { text: 'And scams?', final: true })
  assert.equal(session.state, 'thinking')
  await session.end()
})

test('server barge-in flushes; a manual interrupt discards the rest of the turn', async () => {
  const sdk = fakeConnect()
  const player = fakePlayer()
  const session = create({ ctx: null, player, lang: 'ka', connect: sdk.connect, apiKey: KEY, idleMs: 100000 })
  const ev = record(session)
  await session.start()
  const live = sdk.last().live
  live.push({ serverContent: { outputTranscription: { text: 'ნახევარი' } } })
  live.push(audioPart())
  assert.equal(session.state, 'speaking')
  live.push({ serverContent: { interrupted: true } })
  assert.equal(player.flushes, 1)
  assert.equal(session.state, 'interrupted')
  assert.equal(ev.io.at(-1).interrupted, true)
  await sleep(450)
  assert.equal(session.state, 'listening')

  // a new answer, cut off by the visitor's click: audio after it is dropped until turnComplete
  live.push(audioPart())
  assert.equal(session.state, 'speaking')
  session.interrupt()
  assert.equal(player.flushes, 2)
  assert.equal(session.state, 'interrupted')
  live.push(audioPart())
  live.push({ serverContent: { outputTranscription: { text: 'დაგვიანებული' } } })
  assert.equal(player.enqueued.length, 2, 'audio after the interrupt is discarded')
  assert.ok(!ev.io.some((e) => e.text === 'დაგვიანებული'))
  live.push({ serverContent: { turnComplete: true } })
  await sleep(450)
  assert.equal(session.state, 'listening')
  live.push(audioPart())
  assert.equal(player.enqueued.length, 3, 'the next turn plays again')
  await session.end()
})

test('goAway reconnects with the resumption handle; a dropped socket without a handle falls back', async () => {
  const sdk = fakeConnect()
  const session = create({ ctx: null, player: fakePlayer(), lang: 'ka', connect: sdk.connect, apiKey: KEY, idleMs: 100000 })
  const ev = record(session)
  await session.start()
  const first = sdk.last().live
  first.push({ sessionResumptionUpdate: { newHandle: 'h1', resumable: true } })
  first.push({ goAway: { timeLeft: '10s' } })
  await sleep(10)
  assert.equal(sdk.calls.length, 2)
  assert.deepEqual(sdk.last().config.sessionResumption, { handle: 'h1' })
  assert.equal(first.closed, true)
  assert.equal(session.state, 'listening')
  assert.deepEqual(ev.errors, [])
  // the second socket dies too: one more reconnect is allowed, then the third drop fails over
  sdk.last().live.dropped(1011, 'internal')
  await sleep(10)
  assert.equal(sdk.calls.length, 3)
  sdk.last().live.dropped(1011, 'internal')
  await sleep(10)
  assert.equal(sdk.calls.length, 3)
  assert.equal(session.state, 'error')
  assert.deepEqual(ev.errors.at(-1), { key: 'errSocket', fatal: true, fallback: 'browser' })
  await session.end()
})

test('a rejected key and a connect timeout name their errors and the fallback', async () => {
  const sdk = fakeConnect()
  const s1 = create({ ctx: null, player: fakePlayer(), lang: 'ka', connect: sdk.connect, apiKey: KEY, idleMs: 100000 })
  const ev = record(s1)
  await s1.start()
  sdk.last().live.dropped(1007, 'API key not valid. Please pass a valid API key.')
  assert.deepEqual(ev.errors, [{ key: 'errKey', fatal: true, fallback: 'browser' }])
  const hanging = fakeConnect({ hang: true })
  const s2 = create({ ctx: null, player: fakePlayer(), lang: 'ka', connect: hanging.connect, apiKey: KEY, connectTimeoutMs: 30 })
  await assert.rejects(s2.start(), (e) => e.key === 'errSocket' && e.fallback === 'browser')
  const s3 = create({ ctx: null, player: fakePlayer(), lang: 'ka', connect: sdk.connect, apiKey: '' })
  await assert.rejects(s3.start(), (e) => e.key === 'errNoSession' && e.fallback === 'browser')
})

test('silence for the idle period asks for a goodbye and ends after that turn', async () => {
  const sdk = fakeConnect()
  const session = create({ ctx: null, player: fakePlayer(), lang: 'ka', connect: sdk.connect, apiKey: KEY, idleMs: 60 })
  await session.start()
  const live = sdk.last().live
  live.push({ serverContent: { turnComplete: true } })
  await sleep(120)
  const nudge = live.sent.at(-1).clientContent?.turns?.[0]?.parts?.[0]?.text || ''
  assert.match(nudge, /^session_idle/)
  assert.equal(session.state, 'thinking')
  live.push(audioPart())
  live.push({ serverContent: { turnComplete: true } })
  await sleep(10)
  assert.equal(session.state, 'ended')
  assert.equal(live.closed, true)
})

test('mute stops sending and ends the audio stream; the ring toggles it', async () => {
  const sdk = fakeConnect()
  const session = create({ ctx: null, player: fakePlayer(), lang: 'ka', connect: sdk.connect, apiKey: KEY, idleMs: 100000 })
  const ev = record(session)
  await session.start()
  const live = sdk.last().live
  live.push({ serverContent: { turnComplete: true } })
  await sleep(5)
  session.stopListening()
  assert.equal(session.state, 'idle')
  assert.deepEqual(live.sent.at(-1), { realtimeInput: { audioStreamEnd: true } })
  assert.equal(session.micLevel(), 0)
  session.listen()
  assert.equal(session.state, 'listening')
  assert.ok(ev.mic.length >= 2)
  await session.end()
})

/* ---- D5: tools on the Live path ---- */

function fakeStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
    get length() {
      return map.size
    },
  }
}
const QUIZ = { scenario: 'წერილი გთხოვთ პაროლის დადასტურებას.', options: ['დავაწკაპუნებ', 'გამგზავნს შევამოწმებ', 'გადავაგზავნი'], correctIndex: 1, skill: 'phishing' }

test('a toolCall runs the handlers and answers with the Live scheduling; a click answers the quiz with INTERRUPT', async () => {
  Object.defineProperty(globalThis, 'localStorage', { value: fakeStorage(), configurable: true, writable: true })
  const { forgetProfile, loadProfile } = await import('../src/voice/tutor/memory.js')
  forgetProfile()
  try {
    const sdk = fakeConnect()
    const session = create({ ctx: null, player: fakePlayer(), lang: 'ka', connect: sdk.connect, apiKey: KEY, idleMs: 100000 })
    const ev = record(session)
    const tools = []
    session.on('tool', (e) => tools.push(e))
    await session.start()
    const live = sdk.last().live
    assert.equal(sdk.last().config.tools[0].functionDeclarations.find((d) => d.name === 'ask_quiz').behavior, 'NON_BLOCKING')
    live.push({ serverContent: { turnComplete: true } })
    await sleep(5)
    session.sendText('რა არის ფიშინგი?')
    live.push({ toolCall: { functionCalls: [{ id: 'c1', name: 'set_mood', args: { mood: 'wink' } }, { id: 'c2', name: 'ask_quiz', args: QUIZ }, { id: 'c3', name: 'set_mood', args: { mood: 'angry' } }] } })
    await sleep(5)
    const sent = live.sent.at(-1).toolResponse.functionResponses
    assert.deepEqual(sent[0], { id: 'c1', name: 'set_mood', response: { ok: true }, scheduling: 'SILENT' })
    assert.equal(sent[1].id, 'c2')
    assert.equal(sent[1].willContinue, true)
    assert.equal(sent[1].scheduling, 'SILENT')
    assert.equal(sent[1].response.shown, true)
    assert.match(sent[2].response.error, /mood must be one of/)
    assert.deepEqual(tools.map((t) => t.effect.type), ['mood', 'quiz'])

    session.answerQuiz(1)
    const answer = live.sent.at(-1).toolResponse.functionResponses[0]
    assert.deepEqual(answer, { id: 'c2', name: 'ask_quiz', response: { quiz_answer: 2, text: 'გამგზავნს შევამოწმებ', correct: true, correctIndex: 2 }, scheduling: 'INTERRUPT' })
    assert.deepEqual(ev.user.at(-1), { text: 'გამგზავნს შევამოწმებ', final: true })
    assert.equal(session.state, 'thinking')
    assert.deepEqual(tools.at(-1).effect, { type: 'quizAnswered', index: 1, correct: true, skill: 'phishing' })
    session.answerQuiz(1)
    assert.equal(tools.length, 3, 'the quiz is closed after one answer')
    // a cancelled quiz is dropped
    live.push({ toolCall: { functionCalls: [{ id: 'c4', name: 'ask_quiz', args: QUIZ }] } })
    await sleep(5)
    live.push({ toolCallCancellation: { ids: ['c4'] } })
    session.answerQuiz(0)
    assert.equal(tools.length, 4)
    live.push({ toolCall: { functionCalls: [{ id: 'c5', name: 'record_skill', args: { skill: 'phishing', level: 2, evidence: 'quiz' } }] } })
    await sleep(5)
    assert.equal(loadProfile().skills.phishing.level, 2)
    await session.end()
    assert.deepEqual(loadProfile().sessions.at(-1).skills, ['phishing'])
    assert.equal(loadProfile().sessions.at(-1).summary_ka, 'რა არის ფიშინგი?')
  } finally {
    forgetProfile()
    delete globalThis.localStorage
  }
})

test('end_session closes after the turn; navigate_to_path emits navigate and closes', async () => {
  Object.defineProperty(globalThis, 'localStorage', { value: fakeStorage(), configurable: true, writable: true })
  const { forgetProfile, loadProfile, addSession } = await import('../src/voice/tutor/memory.js')
  forgetProfile()
  try {
    const sdk = fakeConnect()
    const page = { paths: { basic: { url: 'https://x/basic' }, kids: { url: 'https://x/kids', newTab: true } } }
    const s1 = create({ ctx: null, player: fakePlayer(), lang: 'en', connect: sdk.connect, apiKey: KEY, idleMs: 100000, page })
    const ev = record(s1)
    await s1.start()
    let live = sdk.last().live
    assert.match(live.sent[0].clientContent.turns[0].parts[0].text, /"returning":false,"learner":""/)
    live.push({ toolCall: { functionCalls: [{ id: 'e1', name: 'end_session', args: { summary_ka: 'ფიშინგზე ვისაუბრეთ.', summary_en: 'We talked about phishing.', skills: ['phishing'] } }] } })
    await sleep(5)
    assert.equal(live.sent.at(-1).toolResponse.functionResponses[0].scheduling, undefined, 'a blocking tool has no scheduling')
    assert.equal(s1.state, 'thinking')
    live.push(audioPart())
    live.push({ serverContent: { turnComplete: true } })
    await sleep(10)
    assert.equal(s1.state, 'ended')
    assert.equal(ev.state.at(-1), 'ended')
    assert.equal(live.closed, true)
    assert.deepEqual(loadProfile().sessions.map((s) => s.summary_en), ['We talked about phishing.'])

    const s2 = create({ ctx: null, player: fakePlayer(), lang: 'en', connect: sdk.connect, apiKey: KEY, idleMs: 100000, page })
    const nav = []
    s2.on('navigate', (e) => nav.push(e))
    await s2.start()
    live = sdk.last().live
    assert.match(live.sent[0].clientContent.turns[0].parts[0].text, /"returning":true,"learner":"Returning learner, 1 previous session\. Last time: We talked about phishing\./)
    live.push({ toolCall: { functionCalls: [{ id: 'n1', name: 'navigate_to_path', args: { path: 'kids' } }] } })
    await sleep(5)
    live.push({ serverContent: { turnComplete: true } })
    await sleep(10)
    assert.deepEqual(nav, [{ type: 'navigate', path: 'kids', url: 'https://x/kids', newTab: true }])
    assert.equal(s2.state, 'ended')
    addSession({ summary_ka: 'x', summary_en: 'x' })
    assert.equal(loadProfile().sessions.length, 2)
  } finally {
    forgetProfile()
    delete globalThis.localStorage
  }
})
