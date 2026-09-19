import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  mapGeminiError, toContents, sampleRateOf, base64ToBytes, streamChat, generateOnce, streamSpeech, getModel, GeminiError, GEMINI_API,
} from '../src/voice/llm/geminiDirect.js'
import { collectEvents } from '../src/voice/llm/geminiSse.js'

const KEY = 'AIza' + 'x'.repeat(35)

test('mapGeminiError gives stable codes and keeps the 429 quota details', () => {
  assert.deepEqual(mapGeminiError(400, { error: { message: 'API key not valid. Please pass a valid API key.' } }), { code: 'BAD_KEY', message: 'API key not valid. Please pass a valid API key.' })
  assert.equal(mapGeminiError(400, { error: { message: 'bad request' } }).code, 'HTTP_400')
  assert.equal(mapGeminiError(401, null).code, 'BAD_KEY')
  assert.equal(mapGeminiError(403, null).code, 'FORBIDDEN')
  assert.equal(mapGeminiError(404, null).code, 'MODEL_NOT_FOUND')
  assert.equal(mapGeminiError(503, null).code, 'UPSTREAM')
  const limited = mapGeminiError(429, {
    error: {
      message: 'You exceeded your current quota',
      details: [
        { '@type': 'type.googleapis.com/google.rpc.QuotaFailure', violations: [{ quotaMetric: 'generativelanguage.googleapis.com/generate_content_free_tier_requests', quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier' }] },
        { '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: '37s' },
      ],
    },
  })
  assert.equal(limited.code, 'RATE_LIMITED')
  assert.equal(limited.retryAfterMs, 37000)
  assert.deepEqual(limited.quota, ['GenerateRequestsPerDayPerProjectPerModel-FreeTier'])
})

test('history shapes map to Gemini contents', () => {
  assert.deepEqual(toContents([{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }]), [
    { role: 'user', parts: [{ text: 'a' }] },
    { role: 'model', parts: [{ text: 'b' }] },
  ])
  assert.deepEqual(toContents([{ role: 'model', parts: [{ functionCall: { name: 'f' } }] }]), [{ role: 'model', parts: [{ functionCall: { name: 'f' } }] }])
  assert.deepEqual(toContents(undefined), [])
})

test('audio helpers', () => {
  assert.equal(sampleRateOf('audio/l16; rate=24000; channels=1'), 24000)
  assert.equal(sampleRateOf('audio/pcm;rate=16000'), 16000)
  assert.equal(sampleRateOf(''), 24000)
  assert.deepEqual([...base64ToBytes('AAEC')], [0, 1, 2])
})

/* fetch mock: records the request, answers with the given status/body */
function mockFetch(handler) {
  const calls = []
  const original = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init })
    const r = handler(String(url), init)
    const body = typeof r.body === 'string' ? r.body : JSON.stringify(r.body)
    return new Response(body, { status: r.status || 200, headers: { 'Content-Type': r.status >= 400 || !r.sse ? 'application/json' : 'text/event-stream' } })
  }
  return { calls, restore: () => (globalThis.fetch = original) }
}
const sse = (chunks) => chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join('')

test('streamChat sends the key in a header, never in the URL, and streams events', async () => {
  const m = mockFetch(() => ({ sse: true, body: sse([{ candidates: [{ content: { parts: [{ text: 'გამარ' }] } }] }, { candidates: [{ content: { parts: [{ text: 'ჯობა' }] }, finishReason: 'STOP' }] }]) }))
  try {
    const out = await collectEvents(streamChat({ apiKey: KEY, model: 'gemini-test', system: 'sys', history: [{ role: 'user', content: 'hi' }], tools: [{ functionDeclarations: [] }] }))
    assert.equal(out.text, 'გამარჯობა')
    assert.equal(out.finish, 'STOP')
    assert.equal(m.calls.length, 1)
    const { url, init } = m.calls[0]
    assert.equal(url, `${GEMINI_API}/v1beta/models/gemini-test:streamGenerateContent?alt=sse`)
    assert.ok(!url.includes(KEY))
    assert.equal(init.headers['x-goog-api-key'], KEY)
    const body = JSON.parse(init.body)
    assert.deepEqual(body.systemInstruction, { parts: [{ text: 'sys' }] })
    assert.deepEqual(body.contents, [{ role: 'user', parts: [{ text: 'hi' }] }])
    assert.deepEqual(body.generationConfig, { temperature: 0.6, maxOutputTokens: 400 })
    assert.equal(body.tools.length, 1)
  } finally {
    m.restore()
  }
})

test('errors become GeminiError with the mapped code', async () => {
  const m = mockFetch(() => ({ status: 429, body: { error: { message: 'quota', details: [{ retryDelay: '2s' }] } } }))
  try {
    await assert.rejects(generateOnce({ apiKey: KEY, model: 'm', history: [] }), (err) => err instanceof GeminiError && err.code === 'RATE_LIMITED' && err.retryAfterMs === 2000 && err.status === 429)
    await assert.rejects(generateOnce({ apiKey: '', model: 'm', history: [] }), (err) => err.code === 'BAD_KEY')
  } finally {
    m.restore()
  }
})

test('generateOnce collects text, function calls and usage', async () => {
  const m = mockFetch(() => ({
    body: { candidates: [{ content: { parts: [{ text: 'ok' }, { functionCall: { id: '1', name: 'show_board', args: { a: 1 } } }] }, finishReason: 'STOP' }], usageMetadata: { totalTokenCount: 9 } },
  }))
  try {
    const out = await generateOnce({ apiKey: KEY, model: 'm', history: [{ role: 'user', content: 'x' }] })
    assert.equal(out.text, 'ok')
    assert.equal(out.functionCalls[0].name, 'show_board')
    assert.equal(out.finish, 'STOP')
    assert.equal(out.usage.totalTokenCount, 9)
    assert.equal(m.calls[0].url, `${GEMINI_API}/v1beta/models/m:generateContent`)
  } finally {
    m.restore()
  }
})

test('streamSpeech yields decoded PCM chunks with their mime type', async () => {
  const b64 = Buffer.from([1, 2, 3, 4]).toString('base64')
  const m = mockFetch(() => ({ sse: true, body: sse([{ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'audio/l16; rate=24000; channels=1', data: b64 } }] } }] }]) }))
  try {
    const chunks = []
    for await (const c of streamSpeech({ apiKey: KEY, model: 'tts', text: 'გამარჯობა', voiceName: 'Charon' })) chunks.push(c)
    assert.equal(chunks.length, 1)
    assert.deepEqual([...chunks[0].bytes], [1, 2, 3, 4])
    assert.equal(sampleRateOf(chunks[0].mimeType), 24000)
    const body = JSON.parse(m.calls[0].init.body)
    assert.deepEqual(body.generationConfig.responseModalities, ['AUDIO'])
    assert.equal(body.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName, 'Charon')
  } finally {
    m.restore()
  }
})

test('getModel uses the header too', async () => {
  const m = mockFetch(() => ({ body: { name: 'models/m', displayName: 'M' } }))
  try {
    const info = await getModel({ apiKey: KEY, model: 'm' })
    assert.equal(info.displayName, 'M')
    assert.ok(!m.calls[0].url.includes(KEY))
    assert.equal(m.calls[0].init.headers['x-goog-api-key'], KEY)
  } finally {
    m.restore()
  }
})
