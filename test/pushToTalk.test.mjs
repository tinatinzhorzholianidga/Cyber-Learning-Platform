import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { createPushToTalkSession } from '../src/voice/session/pushToTalk.js'
import { STRINGS } from '../src/voice/tutor/strings.js'
import { stripForSpeech } from '../src/voice/tts/speechSynthesis.js'
import { forgetProfile, loadProfile, addSession, PROFILE_KEY } from '../src/voice/tutor/memory.js'

const KEY = 'AIza' + 's'.repeat(35)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sse = (chunks) => chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join('')
const textChunk = (text, finish) => ({ candidates: [{ content: { parts: [{ text }] }, ...(finish ? { finishReason: finish } : {}) }] })
const callChunk = (calls) => ({ candidates: [{ content: { parts: calls.map(([name, args]) => ({ functionCall: { name, args } })) }, finishReason: 'STOP' }] })

/* the learner profile lives in localStorage: a fresh one per test */
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
beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: fakeStorage(), configurable: true, writable: true })
  forgetProfile()
})
afterEach(() => {
  forgetProfile()
  delete globalThis.localStorage
})

/* Gemini chat mock driven by the request: `reply(lastUserText, body)`
   returns the SSE chunks; every request body is recorded */
function mockGemini(reply) {
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body)
    calls.push(body)
    const last = body.contents.at(-1)
    const text = last.parts.map((p) => p.text || '').join('')
    const responses = last.parts.filter((p) => p.functionResponse).map((p) => p.functionResponse.name)
    return new Response(sse(reply(text, responses, body)), { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
  }
  return { calls, restore: () => (globalThis.fetch = original) }
}

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
  const events = { state: [], user: [], io: [], mouth: [], errors: [], tools: [], navigate: [] }
  session.on('state', (s) => events.state.push(s))
  session.on('userCaption', (e) => events.user.push(e))
  session.on('ioCaption', (e) => events.io.push(e))
  session.on('mouth', (e) => events.mouth.push(e.mode))
  session.on('error', (e) => events.errors.push(e.key))
  session.on('tool', (e) => events.tools.push(e))
  session.on('navigate', (e) => events.navigate.push(e))
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

/* ---- D5: the tutor's tools through the push-to-talk session ---- */

const QUIZ = { scenario: 'წერილი გთხოვთ პაროლის დადასტურებას.', options: ['დავაწკაპუნებ', 'გამგზავნს შევამოწმებ', 'გადავაგზავნი'], correctIndex: 1, skill: 'phishing' }

test('tool calls reach the UI as effects while the answer continues', async () => {
  const m = mockGemini((text, responses) => {
    if (responses.length) return [textChunk('ფიშინგი თაღლითობაა. ', ), textChunk('ბარათზე სამი ნაბიჯია.', 'STOP')]
    return [callChunk([['set_mood', { mood: 'excited' }], ['show_card', { kind: 'steps', title: 'სამი ნაბიჯი', items: ['ა', 'ბ', 'გ'] }]])]
  })
  try {
    const speaker = fakeSpeaker()
    const session = createPushToTalkSession({ ...opts(speaker), page: { paths: { basic: { url: 'https://x/basic' } } } })
    const ev = record(session)
    await session.start()
    assert.equal(m.calls.length, 0, 'the greeting costs no model call')
    session.sendText('რა არის ფიშინგი?')
    await sleep(150)
    assert.deepEqual(ev.tools.map((t) => t.effect.type), ['mood', 'card'])
    assert.equal(ev.tools[0].effect.mood, 'excited')
    assert.deepEqual(ev.tools[1].effect.card, { kind: 'steps', title: 'სამი ნაბიჯი', items: ['ა', 'ბ', 'გ'], diagram: null, url: null })
    assert.deepEqual(speaker.spoken.slice(1), ['ფიშინგი თაღლითობაა.', 'ბარათზე სამი ნაბიჯია.'])
    assert.equal(session.state, 'idle')
    assert.equal(m.calls.length, 2)
    // the first request carries the persona with the tools and the first-visit learner block
    const sys = m.calls[0].systemInstruction.parts[0].text
    assert.match(sys, /LEARNER\nFirst visit/)
    assert.equal(m.calls[0].tools[0].functionDeclarations.length, 7)
    await session.end()
    // no end_session: the first question becomes the session record
    const p = loadProfile()
    assert.equal(p.sessions.length, 1)
    assert.equal(p.sessions[0].summary_ka, 'რა არის ფიშინგი?')
  } finally {
    m.restore()
  }
})

test('a quiz answered by click goes back as quiz_answer text, with the option as the caption', async () => {
  const m = mockGemini((text, responses) => {
    if (responses.includes('ask_quiz')) return [textChunk('აირჩიეთ პასუხი.', 'STOP')]
    if (responses.includes('record_skill')) return [textChunk('ზუსტად ასეა!', 'STOP')]
    if (text.startsWith('quiz_answer')) return [callChunk([['set_mood', { mood: 'celebrate' }], ['record_skill', { skill: 'phishing', level: 2, evidence: 'quiz' }]])]
    return [callChunk([['ask_quiz', QUIZ]])]
  })
  try {
    const speaker = fakeSpeaker()
    const session = createPushToTalkSession(opts(speaker))
    const ev = record(session)
    await session.start()
    session.sendText('ვიქტორინა')
    await sleep(120)
    assert.equal(ev.tools[0].effect.type, 'quiz')
    assert.deepEqual(ev.tools[0].effect.quiz, QUIZ)
    assert.equal(session.state, 'idle')
    session.answerQuiz(9) // no such option: ignored
    assert.equal(ev.tools.length, 1)
    session.answerQuiz(1)
    await sleep(150)
    assert.deepEqual(ev.tools[1], { name: 'quiz_answer', args: { index: 1, correct: true }, effect: { type: 'quizAnswered', index: 1, correct: true, skill: 'phishing' } })
    assert.deepEqual(ev.user.at(-1), { text: 'გამგზავნს შევამოწმებ', final: true })
    const sent = m.calls[2].contents.at(-1).parts[0].text
    assert.equal(sent, 'quiz_answer 2: გამგზავნს შევამოწმებ (correct; the right option was 2)')
    assert.deepEqual(ev.tools.slice(2).map((t) => t.effect.type), ['mood', 'skill'])
    assert.equal(loadProfile().skills.phishing.level, 2)
    assert.equal(speaker.spoken.at(-1), 'ზუსტად ასეა!')
    session.answerQuiz(1) // the quiz is closed: nothing happens
    assert.equal(ev.tools.length, 4)
    await session.end()
    assert.deepEqual(loadProfile().sessions[0].skills, ['phishing'])
    assert.equal(loadProfile().sessions[0].summary_ka, 'ვიქტორინა', 'a quiz answer is never the session summary')
  } finally {
    m.restore()
  }
})

test('end_session saves the summary and closes after the farewell; navigate_to_path hands over after it', async () => {
  const m = mockGemini((text, responses) => {
    if (responses.includes('end_session')) return [textChunk('ნახვამდის!', 'STOP')]
    if (responses.includes('navigate_to_path')) return [textChunk('წარმატებები!', 'STOP')]
    if (text.includes('ნახვამდის')) return [callChunk([['end_session', { summary_ka: 'ფიშინგზე ვისაუბრეთ.', summary_en: 'We talked about phishing.', skills: ['phishing'] }]])]
    return [callChunk([['navigate_to_path', { path: 'kids' }]])]
  })
  try {
    const speaker = fakeSpeaker()
    const session = createPushToTalkSession(opts(speaker))
    const ev = record(session)
    await session.start()
    session.sendText('ნახვამდის, იო')
    await sleep(150)
    assert.equal(session.state, 'ended')
    assert.equal(ev.state.at(-1), 'ended')
    assert.equal(ev.tools[0].effect.type, 'end')
    assert.equal(speaker.spoken.at(-1), 'ნახვამდის!')
    assert.deepEqual(loadProfile().sessions.map((s) => s.summary_en), ['We talked about phishing.'])
    assert.deepEqual(await session.end(), { summary: '' }, 'already ended')

    const page = { paths: { basic: { url: 'https://x/basic' }, kids: { url: 'https://x/kids', newTab: true } } }
    const s2 = createPushToTalkSession({ ...opts(fakeSpeaker()), page })
    const ev2 = record(s2)
    await s2.start()
    s2.sendText('კურსი მინდა')
    await sleep(150)
    assert.deepEqual(ev2.navigate, [{ type: 'navigate', path: 'kids', url: 'https://x/kids', newTab: true }])
    assert.equal(s2.state, 'ended')
    assert.equal(loadProfile().sessions.length, 2)
  } finally {
    m.restore()
  }
})

test('a returning learner hears the last topic in the greeting and the model gets the summary', async () => {
  addSession({ summary_ka: 'ფიშინგზე ვისაუბრეთ.', summary_en: 'We talked about phishing.', skills: ['phishing'] })
  const m = mockGemini(() => [textChunk('კარგი.', 'STOP')])
  try {
    const speaker = fakeSpeaker()
    const session = createPushToTalkSession(opts(speaker))
    const ev = record(session)
    await session.start()
    assert.equal(ev.io[0].text, 'ისევ თქვენ! წინა ჯერზე ფიშინგზე ვისაუბრეთ — იქიდანვე გავაგრძელოთ?')
    session.sendText('კი')
    await sleep(100)
    assert.match(m.calls[0].systemInstruction.parts[0].text, /LEARNER\nReturning learner, 1 previous session\. Last time: ფიშინგზე ვისაუბრეთ\./)
    await session.end()
    // a session record without skills: the plain returning line
    addSession({ summary_ka: 'x', summary_en: 'x', skills: [] })
    const s2 = createPushToTalkSession(opts(fakeSpeaker()))
    const ev2 = record(s2)
    await s2.start()
    assert.equal(ev2.io[0].text, STRINGS.ka.returningPlain)
    await s2.end()
    // Delete my data: the next session greets a first-time visitor again
    forgetProfile()
    assert.equal(localStorage.getItem(PROFILE_KEY), null)
    const s3 = createPushToTalkSession(opts(fakeSpeaker()))
    const ev3 = record(s3)
    await s3.start()
    assert.equal(ev3.io[0].text, STRINGS.ka.greeting)
    await s3.end()
  } finally {
    m.restore()
  }
})

test('the local backend gets the grounding up front and the text-tag tools', async () => {
  const original = globalThis.fetch
  const bodies = []
  globalThis.fetch = async (url, init) => {
    bodies.push(JSON.parse(init.body))
    return new Response('data: {"choices":[{"delta":{"content":"@@tool set_mood {\\"mood\\":\\"wink\\"}\\nმასალა ნახეთ."}}]}\n\ndata: [DONE]\n\n', { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
  }
  try {
    const speaker = fakeSpeaker()
    const session = createPushToTalkSession({
      ...opts(speaker),
      chatOptions: { config: { backend: 'openai', base: 'http://localhost:11434/v1', model: 'gemma3' }, retry: false },
      lookupImpl: async (q) => ({ chunks: [{ ref: 'a2' }], text: `[1] მასალა: ${q}` }),
    })
    const ev = record(session)
    await session.start()
    session.sendText('რა არის ფიშინგი?')
    await sleep(120)
    assert.match(bodies[0].messages[0].content, /TOOLS \(text convention\)/)
    assert.match(bodies[0].messages[0].content, /PLATFORM MATERIAL THAT MAY HELP\n\[1\] მასალა: რა არის ფიშინგი\?/)
    assert.deepEqual(ev.tools.map((t) => t.effect.type), ['mood'])
    assert.deepEqual(speaker.spoken.slice(1), ['მასალა ნახეთ.'])
    assert.ok(!ev.io.some((e) => e.text.includes('@@')))
    await session.end()
  } finally {
    globalThis.fetch = original
  }
})
