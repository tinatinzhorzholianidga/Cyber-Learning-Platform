import { test } from 'node:test'
import assert from 'node:assert/strict'
import { selectSession, defaultKind, checkKind } from '../src/voice/session/select.js'

const caps = { recognition: true, synthesis: true, audio: true }
const registry = { stub: () => Promise.resolve({}), browser: () => Promise.resolve({}), turn: () => Promise.resolve({}), live: () => Promise.resolve({}) }

test('defaultKind parses one kind or a per-language map', () => {
  assert.equal(defaultKind('ka', undefined), 'browser')
  assert.equal(defaultKind('ka', 'live'), 'live')
  assert.equal(defaultKind('en', 'ka=browser,en=live'), 'live')
  assert.equal(defaultKind('ka', 'ka=browser,en=live'), 'browser')
  assert.equal(defaultKind('ka', 'nonsense'), 'browser')
})

test('without any key, browser and turn need a key and the stub is never a fallback', () => {
  const r = selectSession({ requested: null, lang: 'ka', env: {}, caps, registry })
  assert.equal(r.kind, null)
  assert.equal(r.needsKey, true)
  assert.match(r.reason, /browser: no key/)
  assert.match(r.reason, /turn: no key/)
  assert.ok(!r.reason.includes('stub'))
})

test('?voice=stub always runs; a kind that is not built falls through', async () => {
  const r = selectSession({ requested: 'stub', lang: 'ka', env: {}, caps, registry })
  assert.equal(r.kind, 'stub')
  assert.equal(typeof r.load, 'function')
  const none = selectSession({ requested: 'stub', lang: 'ka', env: {}, caps, registry: {} })
  assert.equal(none.kind, null)
  assert.match(none.reason, /not built yet/)
})

test('a local model makes the browser session available without a key', () => {
  const r = selectSession({ requested: null, lang: 'ka', env: { VITE_IO_LLM: 'openai' }, caps, registry })
  assert.equal(r.kind, 'browser')
  assert.match(r.reason, /local model/)
  const typed = checkKind('browser', { env: { VITE_IO_LLM: 'openai' }, caps: { recognition: false, synthesis: false, audio: true } })
  assert.equal(typed.ok, true)
  assert.match(typed.reason, /typed only/)
})

test('live needs the dev key and the flag; the fallback names the reason', () => {
  const r = selectSession({ requested: 'live', lang: 'en', env: { VITE_IO_LIVE_OK: '1', VITE_IO_LLM: 'openai' }, caps, registry })
  assert.equal(r.kind, 'browser')
  assert.equal(r.wanted, 'live')
  assert.match(r.reason, /live unavailable \(live: no dev key\)/)
})
