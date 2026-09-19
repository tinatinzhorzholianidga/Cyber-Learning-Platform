import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

/* The worklet runs in a fake AudioWorkletGlobalScope: register the class,
   feed 128-sample blocks of a 440 Hz tone at 48 kHz and check the 16 kHz
   Int16 chunks that come out. */
const registered = {}
globalThis.sampleRate = 48000
globalThis.AudioWorkletProcessor = class {
  constructor() {
    this.port = { postMessage: (m) => this.messages.push(m) }
    this.messages = []
  }
}
globalThis.registerProcessor = (name, cls) => {
  registered[name] = cls
}
const source = readFileSync(new URL('../src/voice/audio/mic-worklet.js', import.meta.url), 'utf8')

test('the worklet module is self-contained', () => {
  assert.ok(!/^\s*import\s/m.test(source), 'no imports')
  assert.ok(!/import\.meta/.test(source), 'no import.meta')
})

test('resamples 48 kHz blocks to 1600-sample 16 kHz chunks and reports a level', async () => {
  await import('../src/voice/audio/mic-worklet.js')
  const Proc = registered['io-mic']
  assert.ok(Proc, 'registered as io-mic')
  const p = new Proc({ processorOptions: { targetRate: 16000, chunkSamples: 1600 } })
  const block = new Float32Array(128)
  let n = 0
  const blocks = Math.ceil((0.25 * 48000) / 128) // a quarter second
  for (let b = 0; b < blocks; b++) {
    for (let i = 0; i < 128; i++, n++) block[i] = 0.5 * Math.sin((2 * Math.PI * 440 * n) / 48000)
    assert.equal(p.process([[block]]), true)
  }
  const chunks = p.messages.filter((m) => m.type === 'chunk')
  const levels = p.messages.filter((m) => m.type === 'level')
  assert.equal(chunks.length, 2, 'two 100 ms chunks in 250 ms')
  assert.equal(chunks[0].sampleRate, 16000)
  const pcm = new Int16Array(chunks[0].buffer)
  assert.equal(pcm.length, 1600)
  let crossings = 0
  for (let i = 1; i < pcm.length; i++) if (pcm[i - 1] < 0 && pcm[i] >= 0) crossings += 1
  assert.ok(Math.abs(crossings - 44) <= 1, `440 Hz over 100 ms → ~44 cycles, got ${crossings}`)
  assert.ok(Math.max(...pcm) > 15000 && Math.min(...pcm) < -15000, 'amplitude kept')
  assert.ok(levels.length >= 5, 'level messages')
  assert.ok(levels[0].level > 0.5 && levels[0].level <= 1, `level ${levels[0].level}`)
})

test('silence gives a zero level and empty input is tolerated', async () => {
  const Proc = registered['io-mic']
  const p = new Proc({ processorOptions: {} })
  for (let b = 0; b < 16; b++) p.process([[new Float32Array(128)]])
  assert.equal(p.process([[]]), true)
  assert.equal(p.process([]), true)
  const levels = p.messages.filter((m) => m.type === 'level')
  assert.ok(levels.length >= 1)
  assert.equal(levels[0].level, 0)
})
