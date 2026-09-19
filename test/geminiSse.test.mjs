import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseGeminiSse, eventsFromLine, eventsFromChunk, collectEvents } from '../src/voice/llm/geminiSse.js'

const enc = new TextEncoder()
const streamOf = (chunks) =>
  new ReadableStream({
    start(c) {
      for (const ch of chunks) c.enqueue(typeof ch === 'string' ? enc.encode(ch) : ch)
      c.close()
    },
  })
const chunkJson = (parts, extra = {}) => JSON.stringify({ candidates: [{ content: { parts, role: 'model' }, ...extra }] })

test('text split across network chunks, mid-line and mid-character', async () => {
  const georgian = 'გამარჯობა, მე იო ვარ.'
  const line = `data: ${chunkJson([{ text: georgian }])}\r\n\r\n`
  const bytes = enc.encode(line)
  // cut inside the multibyte word (byte 12 is inside a 3-byte Georgian letter)
  const cut = 12
  const events = []
  for await (const e of parseGeminiSse(streamOf([bytes.slice(0, cut), bytes.slice(cut, cut + 7), bytes.slice(cut + 7)]))) events.push(e)
  assert.deepEqual(events, [{ type: 'text', text: georgian }])
})

test('several data lines, a function call, finish and usage', async () => {
  const body =
    `data: ${chunkJson([{ text: 'Hello ' }])}\n\n` +
    `data: ${chunkJson([{ functionCall: { id: 'c1', name: 'show_board', args: { kind: 'steps' } } }])}\n\n` +
    `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: 'world' }] }, finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 3, candidatesTokenCount: 2 } })}\n`
  const out = await collectEvents(parseGeminiSse(streamOf([body])))
  assert.equal(out.text, 'Hello world')
  assert.deepEqual(out.functionCalls, [{ type: 'functionCall', id: 'c1', name: 'show_board', args: { kind: 'steps' } }])
  assert.equal(out.finish, 'STOP')
  assert.deepEqual(out.usage, { promptTokenCount: 3, candidatesTokenCount: 2 })
})

test('the last line without a trailing newline is still parsed', async () => {
  const out = await collectEvents(parseGeminiSse(streamOf([`data: ${chunkJson([{ text: 'tail' }])}`])))
  assert.equal(out.text, 'tail')
})

test('blocked prompts surface as an event, not a throw', async () => {
  const out = await collectEvents(parseGeminiSse(streamOf([`data: ${JSON.stringify({ promptFeedback: { blockReason: 'SAFETY' } })}\n`])))
  assert.equal(out.blocked, 'SAFETY')
  assert.equal(out.text, '')
})

test('malformed, empty, comment and [DONE] lines carry nothing', () => {
  assert.deepEqual([...eventsFromLine('data: {not json')], [])
  assert.deepEqual([...eventsFromLine('')], [])
  assert.deepEqual([...eventsFromLine(': keep-alive')], [])
  assert.deepEqual([...eventsFromLine('event: message')], [])
  assert.deepEqual([...eventsFromLine('data: [DONE]')], [])
})

test('eventsFromChunk ignores empty text parts and missing candidates', () => {
  assert.deepEqual([...eventsFromChunk({ candidates: [{ content: { parts: [{ text: '' }] } }] })], [])
  assert.deepEqual([...eventsFromChunk({})], [])
  assert.deepEqual([...eventsFromChunk({ candidates: [{ finishReason: 'MAX_TOKENS' }] })], [{ type: 'finish', reason: 'MAX_TOKENS' }])
})
