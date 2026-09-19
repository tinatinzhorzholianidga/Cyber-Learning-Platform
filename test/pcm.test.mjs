import { test } from 'node:test'
import assert from 'node:assert/strict'
import { floatToInt16, int16ToFloat, bytesToInt16, resampleLinear, rms, parseWav, synthSpeech } from '../src/voice/audio/pcm.js'
import { pcmToWav } from '../scripts/lib/wav.mjs'

test('float ↔ int16 round trip and clamping', () => {
  const i16 = floatToInt16(Float32Array.from([0, 0.5, -0.5, 1, -1, 2, -2]))
  assert.deepEqual([...i16], [0, 16384, -16384, 32767, -32768, 32767, -32768])
  const back = int16ToFloat(i16)
  assert.ok(Math.abs(back[1] - 0.5) < 0.001)
  assert.equal(back[4], -1)
})

test('bytesToInt16 views even offsets and copies odd ones', () => {
  const buf = new Uint8Array([0, 1, 0, 2, 0, 3, 0]) // 3.5 samples
  const view = bytesToInt16(buf)
  assert.deepEqual([...view], [256, 512, 768])
  const odd = bytesToInt16(new Uint8Array(buf.buffer, 1, 4)) // bytes 1..4 → [1,0] [2,0]
  assert.deepEqual([...odd], [1, 2])
})

test("resampleLinear keeps a tone's frequency", () => {
  const from = 48000
  const to = 16000
  const n = from // one second
  const tone = new Float32Array(n)
  for (let i = 0; i < n; i++) tone[i] = Math.sin((2 * Math.PI * 440 * i) / from)
  const out = resampleLinear(tone, from, to)
  assert.equal(out.length, to)
  let crossings = 0
  for (let i = 1; i < out.length; i++) if (out[i - 1] < 0 && out[i] >= 0) crossings += 1
  assert.ok(Math.abs(crossings - 440) <= 2, `got ${crossings} cycles`)
  assert.equal(resampleLinear(tone, 48000, 48000).length, n)
})

test('rms of silence, a square wave and int16 input', () => {
  assert.equal(rms(new Float32Array(100)), 0)
  assert.ok(Math.abs(rms(Float32Array.from([0.5, -0.5, 0.5, -0.5])) - 0.5) < 1e-6)
  assert.ok(Math.abs(rms(Int16Array.from([16384, -16384])) - 0.5) < 1e-6)
})

test('parseWav reads what pcmToWav writes, first channel only', () => {
  const samples = Int16Array.from([1, -2, 3, -4])
  const wav = pcmToWav([new Uint8Array(samples.buffer)], { sampleRate: 16000 })
  const parsed = parseWav(wav.buffer.slice(wav.byteOffset, wav.byteOffset + wav.byteLength))
  assert.equal(parsed.sampleRate, 16000)
  assert.equal(parsed.channels, 1)
  assert.deepEqual([...parsed.samples], [1, -2, 3, -4])
  assert.throws(() => parseWav(new ArrayBuffer(12)), /not a WAV/)
})

test('synthSpeech is deterministic, loud in bursts and silent in gaps', () => {
  const a = synthSpeech({ seconds: 2, seed: 7 })
  const b = synthSpeech({ seconds: 2, seed: 7 })
  assert.equal(a.length, 48000)
  assert.deepEqual([...a.subarray(0, 500)], [...b.subarray(0, 500)])
  // 50 ms windows: some loud, some quiet
  const levels = []
  for (let i = 0; i + 1200 <= a.length; i += 1200) levels.push(rms(a.subarray(i, i + 1200)))
  assert.ok(Math.max(...levels) > 0.1, 'has loud syllables')
  assert.ok(levels.filter((l) => l < 0.01).length >= 3, 'has gaps')
  assert.ok(levels.filter((l) => l > 0.05).length >= 8, 'many syllables')
})
