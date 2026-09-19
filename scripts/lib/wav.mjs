/* Raw PCM16 → WAV (RIFF) for the bake-off files. Gemini's audio parts are
   "audio/l16; rate=24000; channels=1": 16-bit little-endian mono. */

export function wavHeader({ dataBytes, sampleRate = 24000, channels = 1, bitsPerSample = 16 }) {
  const blockAlign = (channels * bitsPerSample) / 8
  const h = Buffer.alloc(44)
  h.write('RIFF', 0)
  h.writeUInt32LE(36 + dataBytes, 4)
  h.write('WAVE', 8)
  h.write('fmt ', 12)
  h.writeUInt32LE(16, 16) // PCM chunk size
  h.writeUInt16LE(1, 20) // PCM format
  h.writeUInt16LE(channels, 22)
  h.writeUInt32LE(sampleRate, 24)
  h.writeUInt32LE(sampleRate * blockAlign, 28)
  h.writeUInt16LE(blockAlign, 32)
  h.writeUInt16LE(bitsPerSample, 34)
  h.write('data', 36)
  h.writeUInt32LE(dataBytes, 40)
  return h
}

/* chunks: Uint8Array[] of raw PCM. */
export function pcmToWav(chunks, opts = {}) {
  const data = Buffer.concat(chunks.map((c) => Buffer.from(c.buffer, c.byteOffset, c.byteLength)))
  return Buffer.concat([wavHeader({ ...opts, dataBytes: data.length }), data])
}

export function pcmDurationSec(dataBytes, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
  const bytesPerSec = (sampleRate * channels * bitsPerSample) / 8
  return bytesPerSec ? dataBytes / bytesPerSec : 0
}
