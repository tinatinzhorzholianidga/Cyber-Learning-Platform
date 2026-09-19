/* Pure PCM helpers shared by the player, the sessions and the tests. No
   Web Audio here: everything is plain arrays, so Node can run it. The
   mic worklet (mic-worklet.js) carries its own copy of the resampler
   because worklet modules cannot import from the app bundle. */

export function floatToInt16(f32) {
  const out = new Int16Array(f32.length)
  for (let i = 0; i < f32.length; i++) {
    const v = Math.max(-1, Math.min(1, f32[i]))
    out[i] = Math.round(v < 0 ? v * 32768 : v * 32767)
  }
  return out
}

export function int16ToFloat(i16) {
  const out = new Float32Array(i16.length)
  for (let i = 0; i < i16.length; i++) out[i] = i16[i] / 32768
  return out
}

/* Bytes (little-endian PCM16) → Int16Array, copying when the offset is odd. */
export function bytesToInt16(bytes) {
  if (bytes instanceof Int16Array) return bytes
  const even = bytes.byteLength - (bytes.byteLength % 2)
  if (bytes.byteOffset % 2 === 0) return new Int16Array(bytes.buffer, bytes.byteOffset, even / 2)
  return new Int16Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + even))
}

/* Linear-interpolation resampler for a whole buffer (Float32 in and out). */
export function resampleLinear(input, fromRate, toRate) {
  if (fromRate === toRate) return Float32Array.from(input)
  const ratio = fromRate / toRate
  const n = Math.floor(input.length / ratio)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const pos = i * ratio
    const j = Math.floor(pos)
    const frac = pos - j
    const a = input[j]
    const b = j + 1 < input.length ? input[j + 1] : a
    out[i] = a + (b - a) * frac
  }
  return out
}

/* Root mean square of Float32 (-1..1) or Int16 samples, as 0..1. */
export function rms(samples) {
  if (!samples.length) return 0
  const scale = samples instanceof Int16Array ? 1 / 32768 : 1
  let sum = 0
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i] * scale
    sum += v * v
  }
  return Math.sqrt(sum / samples.length)
}

/* A RIFF/WAVE file (PCM16, any channel count) → the first channel. */
export function parseWav(arrayBuffer) {
  const dv = new DataView(arrayBuffer)
  const tag = (o) => String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3))
  if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('not a WAV file')
  let offset = 12
  let fmt = null
  let data = null
  while (offset + 8 <= dv.byteLength) {
    const id = tag(offset)
    const size = dv.getUint32(offset + 4, true)
    const body = offset + 8
    if (id === 'fmt ') {
      fmt = {
        format: dv.getUint16(body, true),
        channels: dv.getUint16(body + 2, true),
        sampleRate: dv.getUint32(body + 4, true),
        bitsPerSample: dv.getUint16(body + 14, true),
      }
    } else if (id === 'data') {
      data = { start: body, size: Math.min(size, dv.byteLength - body) }
    }
    offset = body + size + (size % 2)
  }
  if (!fmt || !data) throw new Error('WAV without fmt or data chunk')
  if (fmt.format !== 1 || fmt.bitsPerSample !== 16) throw new Error(`unsupported WAV: format ${fmt.format}, ${fmt.bitsPerSample} bits`)
  const frames = Math.floor(data.size / (2 * fmt.channels))
  const samples = new Int16Array(frames)
  for (let i = 0; i < frames; i++) samples[i] = dv.getInt16(data.start + i * 2 * fmt.channels, true)
  return { sampleRate: fmt.sampleRate, channels: fmt.channels, samples }
}

/* Deterministic speech-like audio for the stub session: syllable bursts
   (a buzzy voiced tone with an envelope) separated by short gaps and
   word pauses, so the mouth visibly opens per syllable. Not speech - a
   test signal that behaves like it. */
export function synthSpeech({ seconds = 3, rate = 24000, seed = 1, gain = 0.4 } = {}) {
  let s = seed >>> 0 || 1
  const rand = () => {
    // mulberry32
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const total = Math.round(seconds * rate)
  const out = new Int16Array(total)
  let pos = 0
  let inWord = 0
  while (pos < total) {
    const syll = Math.round((0.08 + rand() * 0.09) * rate)
    const f0 = 105 + rand() * 40
    const vib = 3 + rand() * 3
    for (let i = 0; i < syll && pos + i < total; i++) {
      const tt = i / rate
      const env = Math.min(1, i / (0.015 * rate)) * Math.min(1, (syll - i) / (0.04 * rate))
      const f = f0 * (1 + 0.02 * Math.sin(2 * Math.PI * vib * tt))
      const v = 0.6 * Math.sin(2 * Math.PI * f * tt) + 0.3 * Math.sin(2 * Math.PI * 2 * f * tt) + 0.15 * Math.sin(2 * Math.PI * 3.1 * f * tt)
      out[pos + i] = Math.round(Math.max(-1, Math.min(1, v * env * gain)) * 32767)
    }
    pos += syll
    inWord += 1
    const pause = inWord >= 3 + Math.floor(rand() * 3) ? 0.14 + rand() * 0.08 : 0.04 + rand() * 0.05
    if (pause > 0.1) inWord = 0
    pos += Math.round(pause * rate)
  }
  return out
}
