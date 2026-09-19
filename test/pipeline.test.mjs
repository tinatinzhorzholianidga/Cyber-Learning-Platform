import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createChat, normalise, retryDelayFor, errorKeyOf, chatConfig } from '../src/voice/session/pipeline.js'

const KEY = 'AIza' + 'p'.repeat(35)
const sse = (chunks) => chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join('')
const textChunk = (text, finish) => ({ candidates: [{ content: { parts: [{ text }] }, ...(finish ? { finishReason: finish } : {}) }] })
const callChunk = (calls, finish = 'STOP') => ({ candidates: [{ content: { parts: calls.map(([name, args]) => ({ functionCall: { name, args } })) }, finishReason: finish }] })
const lastParts = (body) => body.contents.at(-1).parts

/* fetch mock: `handler(url, init)` returns { status, body, sse, slow } */
function mockFetch(handler) {
  const calls = []
  const original = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), body: init?.body ? JSON.parse(init.body) : null })
    const r = handler(String(url), init, calls.length)
    if (r.stream) return new Response(r.stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
    const body = typeof r.body === 'string' ? r.body : JSON.stringify(r.body)
    return new Response(body, { status: r.status || 200, headers: { 'Content-Type': r.status >= 400 ? 'application/json' : 'text/event-stream' } })
  }
  return { calls, restore: () => (globalThis.fetch = original) }
}

test('normalise starts with a user turn and alternates', () => {
  assert.deepEqual(normalise([{ role: 'assistant', content: 'x' }, { role: 'user', content: 'a' }, { role: 'user', content: 'b' }, { role: 'model', content: 'c' }, { role: 'assistant', content: '' }]), [
    { role: 'user', content: 'a\nb' },
    { role: 'assistant', content: 'c' },
  ])
})

test('chatConfig follows VITE_IO_LLM', () => {
  assert.deepEqual(chatConfig({}), { backend: 'gemini', model: 'gemini-3.8-flash' })
  assert.deepEqual(chatConfig({ VITE_IO_CHAT_MODEL: 'm' }), { backend: 'gemini', model: 'm' })
  assert.deepEqual(chatConfig({ VITE_IO_LLM: 'openai' }), { backend: 'openai', base: 'http://localhost:11434/v1', model: 'gemma3' })
})

test('retryDelayFor waits for per-minute limits only', () => {
  assert.equal(retryDelayFor({ code: 'RATE_LIMITED', retryAfterMs: 3000, quota: ['GenerateRequestsPerMinutePerProjectPerModel-FreeTier'] }), 3000)
  assert.equal(retryDelayFor({ code: 'RATE_LIMITED', retryAfterMs: 3000, quota: ['GenerateRequestsPerDayPerProjectPerModel-FreeTier'] }), 0)
  assert.equal(retryDelayFor({ code: 'RATE_LIMITED', retryAfterMs: 40000 }), 0)
  assert.equal(retryDelayFor({ code: 'RATE_LIMITED' }), 5000)
  assert.equal(retryDelayFor({ code: 'NETWORK' }), 0)
})

test('errorKeyOf maps transport errors to voice strings', () => {
  assert.equal(errorKeyOf({ code: 'BAD_KEY' }), 'errKey')
  assert.equal(errorKeyOf({ code: 'RATE_LIMITED' }), 'errRateLimit')
  assert.equal(errorKeyOf({ code: 'LOCAL_UNREACHABLE' }), 'errBackend')
  assert.equal(errorKeyOf({ code: 'BLOCKED' }), 'errSafety')
  assert.equal(errorKeyOf({ code: 'EMPTY' }), 'errEmpty')
  assert.equal(errorKeyOf({ code: 'ABORTED' }), null)
  assert.equal(errorKeyOf({ name: 'AbortError' }), null)
  assert.equal(errorKeyOf(new Error('x')), 'errSocket')
})

test('ask streams, keeps a rolling window and sends the system instruction', async () => {
  const m = mockFetch((url, init, n) => ({ body: sse([textChunk(`პასუხი ${n} `), textChunk('ბოლო.', 'STOP')]) }))
  try {
    const chat = createChat({ system: 'SYS', apiKey: KEY, maxTurns: 2, config: { backend: 'gemini', model: 'm' } })
    const deltas = []
    const r1 = await chat.ask('ერთი?', { onText: (d) => deltas.push(d) })
    assert.equal(r1.text, 'პასუხი 1 ბოლო.')
    assert.deepEqual(deltas, ['პასუხი 1 ', 'ბოლო.'])
    assert.equal(r1.finish, 'STOP')
    await chat.ask('ორი?')
    const r3 = await chat.ask('სამი?')
    assert.equal(r3.text, 'პასუხი 3 ბოლო.')
    const body = m.calls[2].body
    assert.equal(body.systemInstruction.parts[0].text, 'SYS')
    // maxTurns 2: the window is the previous answer and the new question
    assert.deepEqual(body.contents.map((c) => c.role), ['model', 'user'])
    assert.equal(body.contents[1].parts[0].text, 'სამი?')
    assert.equal(body.safetySettings.length, 4)
    assert.equal(chat.history.length, 4) // 2 * maxTurns
  } finally {
    m.restore()
  }
})

test('an interrupted answer keeps its partial text with a marker', async () => {
  let controller
  const m = mockFetch((url, init) => ({
    stream: new ReadableStream({
      start(c) {
        controller = c
        c.enqueue(new TextEncoder().encode(sse([textChunk('ნახევარი წინადადება ')])))
        init.signal.addEventListener('abort', () => {
          try {
            c.error(Object.assign(new Error('aborted'), { name: 'AbortError' }))
          } catch {
            /* closed */
          }
        })
      },
    }),
  }))
  try {
    const chat = createChat({ system: 's', apiKey: KEY, config: { backend: 'gemini', model: 'm' } })
    const p = chat.ask('კითხვა?', { onText: () => chat.abort() })
    const r = await p
    assert.equal(r.aborted, true)
    assert.equal(r.text, 'ნახევარი წინადადება ')
    assert.deepEqual(chat.history, [
      { role: 'user', content: 'კითხვა?' },
      { role: 'assistant', content: 'ნახევარი წინადადება …' },
    ])
    assert.ok(controller)
  } finally {
    m.restore()
  }
})

test('a newer question supersedes the running one without touching history twice', async () => {
  let n = 0
  const m = mockFetch((url, init) => {
    n += 1
    if (n === 1) {
      return {
        stream: new ReadableStream({
          start(c) {
            c.enqueue(new TextEncoder().encode(sse([textChunk('ძველი ')])))
            // never closes by itself: the second ask aborts it
            init.signal.addEventListener('abort', () => {
              try {
                c.error(Object.assign(new Error('aborted'), { name: 'AbortError' }))
              } catch {
                /* closed */
              }
            })
          },
        }),
      }
    }
    return { body: sse([textChunk('ახალი.', 'STOP')]) }
  })
  try {
    const chat = createChat({ system: 's', apiKey: KEY, config: { backend: 'gemini', model: 'm' } })
    let second
    const first = chat.ask('პირველი?', {
      onText: () => {
        if (!second) second = chat.ask('მეორე?')
      },
    })
    const r1 = await first
    const r2 = await second
    assert.equal(r1.aborted, true)
    assert.equal(r2.text, 'ახალი.')
    assert.deepEqual(
      chat.history.map((t) => t.content),
      ['მეორე?', 'ახალი.'],
    )
  } finally {
    m.restore()
  }
})

test('empty and safety-blocked answers throw typed errors', async () => {
  let n = 0
  const m = mockFetch(() => {
    n += 1
    return n === 1 ? { body: sse([textChunk('', 'STOP')]) } : { body: sse([{ candidates: [{ content: { parts: [{ text: 'x' }] }, finishReason: 'SAFETY' }] }]) }
  })
  try {
    const chat = createChat({ system: 's', apiKey: KEY, config: { backend: 'gemini', model: 'm' } })
    await assert.rejects(chat.ask('a'), (e) => e.code === 'EMPTY')
    await assert.rejects(chat.ask('b'), (e) => e.code === 'BLOCKED')
    assert.equal(chat.history.length, 0)
  } finally {
    m.restore()
  }
})

test('a per-minute 429 is retried once after the server delay', async () => {
  let n = 0
  const m = mockFetch(() => {
    n += 1
    if (n === 1) return { status: 429, body: { error: { message: 'slow down', details: [{ retryDelay: '0.05s' }, { violations: [{ quotaId: 'PerMinute' }] }] } } }
    return { body: sse([textChunk('კარგი.', 'STOP')]) }
  })
  try {
    const chat = createChat({ system: 's', apiKey: KEY, config: { backend: 'gemini', model: 'm' } })
    const r = await chat.ask('a')
    assert.equal(r.text, 'კარგი.')
    assert.equal(n, 2)
    const daily = createChat({ system: 's', apiKey: KEY, config: { backend: 'gemini', model: 'm' } })
    n = 0
    m.restore()
    const m2 = mockFetch(() => ({ status: 429, body: { error: { message: 'quota', details: [{ retryDelay: '1s' }, { violations: [{ quotaId: 'GenerateRequestsPerDay' }] }] } } }))
    try {
      await assert.rejects(daily.ask('a'), (e) => e.code === 'RATE_LIMITED')
    } finally {
      m2.restore()
    }
  } finally {
    if (globalThis.fetch !== undefined) m.restore()
  }
})

test('a function call runs the handler and the model continues in a second call', async () => {
  const m = mockFetch((url, init, n) => {
    const body = JSON.parse(init.body)
    if (lastParts(body).some((p) => p.functionResponse)) return { body: sse([textChunk('ბარათი '), textChunk('დაფაზეა.', 'STOP')]) }
    return { body: sse([textChunk(''), callChunk([['set_mood', { mood: 'excited' }], ['show_card', { kind: 'steps', title: 'ნაბიჯები', items: ['ა', 'ბ'] }]])]) }
  })
  try {
    const handled = []
    const chat = createChat({
      system: 'SYS',
      apiKey: KEY,
      config: { backend: 'gemini', model: 'm' },
      tools: [{ functionDeclarations: [{ name: 'set_mood' }, { name: 'show_card' }] }],
      onToolCall: async (name, args) => {
        handled.push({ name, args })
        return name === 'set_mood' ? { ok: true } : { shown: true }
      },
    })
    const deltas = []
    const r = await chat.ask('რა არის ფიშინგი?', { onText: (d) => deltas.push(d) })
    assert.equal(r.text, 'ბარათი დაფაზეა.')
    assert.deepEqual(deltas, ['ბარათი ', 'დაფაზეა.'])
    assert.deepEqual(handled, [
      { name: 'set_mood', args: { mood: 'excited' } },
      { name: 'show_card', args: { kind: 'steps', title: 'ნაბიჯები', items: ['ა', 'ბ'] } },
    ])
    assert.deepEqual(r.calls.map((c) => c.name), ['set_mood', 'show_card'])
    assert.equal(m.calls.length, 2)
    assert.equal(m.calls[0].body.tools[0].functionDeclarations.length, 2)
    // the second request replays the call parts and carries the handlers' responses
    const second = m.calls[1].body.contents
    assert.deepEqual(second.map((c) => c.role), ['user', 'model', 'user'])
    assert.deepEqual(second[1].parts, [
      { functionCall: { name: 'set_mood', args: { mood: 'excited' } } },
      { functionCall: { name: 'show_card', args: { kind: 'steps', title: 'ნაბიჯები', items: ['ა', 'ბ'] } } },
    ])
    assert.deepEqual(second[2].parts, [
      { functionResponse: { name: 'set_mood', response: { ok: true } } },
      { functionResponse: { name: 'show_card', response: { shown: true } } },
    ])
    // the history keeps the plain exchange only
    assert.deepEqual(chat.history, [
      { role: 'user', content: 'რა არის ფიშინგი?' },
      { role: 'assistant', content: 'ბარათი დაფაზეა.' },
    ])
  } finally {
    m.restore()
  }
})

test('a handler that throws answers with an error; tool rounds stop at three', async () => {
  const m = mockFetch(() => ({ body: sse([callChunk([['set_mood', { mood: 'wink' }]])]) }))
  try {
    let n = 0
    const chat = createChat({
      system: 's',
      apiKey: KEY,
      config: { backend: 'gemini', model: 'm' },
      onToolCall: async () => {
        n += 1
        if (n === 1) throw new Error('boom')
        return { ok: true }
      },
    })
    const r = await chat.ask('a')
    assert.equal(n, 3)
    assert.equal(r.calls.length, 3)
    assert.equal(r.text, '')
    assert.equal(m.calls.length, 4)
    assert.deepEqual(lastParts(m.calls[1].body), [{ functionResponse: { name: 'set_mood', response: { error: 'boom' } } }])
    assert.equal(chat.history.at(-1).content, '…')
  } finally {
    m.restore()
  }
})

test('the local backend consumes @@tool lines, even split across chunks, and never shows them', async () => {
  const pieces = ['data: {"choices":[{"delta":{"content":"გამარჯობა.\\n@@tool set_"}}]}\n\n', 'data: {"choices":[{"delta":{"content":"mood {\\"mood\\":\\"wink\\"}\\nკიდევ."}}]}\n\n', 'data: [DONE]\n\n']
  const m = mockFetch(() => ({
    stream: new ReadableStream({
      start(c) {
        const enc = new TextEncoder()
        pieces.forEach((p) => c.enqueue(enc.encode(p)))
        c.close()
      },
    }),
  }))
  try {
    const handled = []
    const chat = createChat({ system: 's', config: { backend: 'openai', base: 'http://localhost:11434/v1', model: 'gemma3' }, onToolCall: async (name, args) => handled.push({ name, args }) })
    const deltas = []
    const r = await chat.ask('a', { onText: (d) => deltas.push(d) })
    assert.deepEqual(deltas, ['გამარჯობა.\n', 'კიდევ.'])
    assert.equal(r.text, 'გამარჯობა.\nკიდევ.')
    assert.deepEqual(handled, [{ name: 'set_mood', args: { mood: 'wink' } }])
    assert.deepEqual(r.calls, [{ name: 'set_mood', args: { mood: 'wink' }, viaTag: true }])
    assert.equal(m.calls.length, 1, 'the text convention has no second call')
    assert.equal(m.calls[0].body.messages[0].content, 's')
  } finally {
    m.restore()
  }
})

test('extraSystem is appended to the system instruction for one answer', async () => {
  const m = mockFetch(() => ({ body: sse([textChunk('კარგი.', 'STOP')]) }))
  try {
    const chat = createChat({ system: 'SYS', apiKey: KEY, config: { backend: 'gemini', model: 'm' } })
    await chat.ask('a', { extraSystem: 'PLATFORM MATERIAL\n[1] x' })
    await chat.ask('b')
    assert.equal(m.calls[0].body.systemInstruction.parts[0].text, 'SYS\n\nPLATFORM MATERIAL\n[1] x')
    assert.equal(m.calls[1].body.systemInstruction.parts[0].text, 'SYS')
  } finally {
    m.restore()
  }
})

test('the local backend posts to /chat/completions', async () => {
  const m = mockFetch(() => ({ body: 'data: {"choices":[{"delta":{"content":"გამარჯობა"}}]}\n\ndata: [DONE]\n\n' }))
  try {
    const chat = createChat({ system: 's', config: { backend: 'openai', base: 'http://localhost:11434/v1', model: 'gemma3' } })
    const r = await chat.ask('a')
    assert.equal(r.text, 'გამარჯობა')
    assert.equal(m.calls[0].url, 'http://localhost:11434/v1/chat/completions')
    assert.equal(m.calls[0].body.messages[0].role, 'system')
  } finally {
    m.restore()
  }
})
