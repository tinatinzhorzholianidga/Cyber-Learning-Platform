import { test } from 'node:test'
import assert from 'node:assert/strict'
import { devKey, runtimeKey, setRuntimeKey, resolveKey, keySource, isDevServe, isLocalhost, RUNTIME_KEY } from '../src/voice/auth/devKey.js'

function fakeStorage() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }
}

test('outside a dev serve there is never a dev key', () => {
  assert.equal(isDevServe(), false)
  assert.equal(devKey(), '')
  globalThis.__IO_DEV_SERVE__ = true
  globalThis.__IO_DEV_GEMINI_KEY__ = 'AIza' + 'd'.repeat(35)
  try {
    // defined, but not on localhost (no window.location in Node)
    assert.equal(isLocalhost(), false)
    assert.equal(devKey(), '')
    globalThis.location = { hostname: 'localhost' }
    assert.equal(devKey(), globalThis.__IO_DEV_GEMINI_KEY__)
    assert.equal(keySource(), 'dev')
    globalThis.location = { hostname: '192.168.1.20' }
    assert.equal(devKey(), '')
    globalThis.__IO_DEV_SERVE__ = false
    globalThis.location = { hostname: 'localhost' }
    assert.equal(devKey(), '')
  } finally {
    delete globalThis.__IO_DEV_SERVE__
    delete globalThis.__IO_DEV_GEMINI_KEY__
    delete globalThis.location
  }
})

test('the runtime key lives in localStorage under one name', () => {
  assert.equal(runtimeKey(), '')
  assert.equal(keySource(), 'none')
  globalThis.localStorage = fakeStorage()
  try {
    setRuntimeKey('  AIzaPasted  ')
    assert.equal(globalThis.localStorage.getItem(RUNTIME_KEY), 'AIzaPasted')
    assert.equal(runtimeKey(), 'AIzaPasted')
    assert.equal(resolveKey(), 'AIzaPasted')
    assert.equal(keySource(), 'runtime')
    setRuntimeKey('')
    assert.equal(runtimeKey(), '')
    assert.equal(keySource(), 'none')
  } finally {
    delete globalThis.localStorage
  }
})
