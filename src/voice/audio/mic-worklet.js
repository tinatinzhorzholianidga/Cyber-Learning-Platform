/* AudioWorklet processor for the microphone (docs/io-voice-plan.md §2.3,
   brief Phase 2): Float32 at the context's rate → 16 kHz Int16 mono,
   posted as ~100 ms chunks (1600 samples) with the buffer transferred,
   plus a smoothed input level every few blocks for the listening ring.
   The output is silence (the node is connected only to keep the graph
   pulling audio), so the visitor never hears themselves.

   Self-contained on purpose: worklet modules load outside the app bundle,
   so nothing is imported here. `sampleRate` is the worklet global. */
class IoMicProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super()
    const o = (options && options.processorOptions) || {}
    this.target = o.targetRate || 16000
    this.chunk = o.chunkSamples || 1600
    this.ratio = sampleRate / this.target
    this.pos = 0 // fractional read position carried across blocks
    this.prev = 0 // last input sample of the previous block
    this.out = new Int16Array(this.chunk)
    this.n = 0
    this.blocks = 0
    this.levelAcc = 0
    this.levelN = 0
  }

  process(inputs) {
    const ch = inputs[0] && inputs[0][0]
    if (!ch || !ch.length) return true

    // input level: RMS over the last few blocks
    let sum = 0
    for (let i = 0; i < ch.length; i++) sum += ch[i] * ch[i]
    this.levelAcc += sum
    this.levelN += ch.length
    this.blocks += 1
    if (this.blocks % 8 === 0) {
      const level = Math.min(1, Math.sqrt(this.levelAcc / this.levelN) * 4)
      this.port.postMessage({ type: 'level', level })
      this.levelAcc = 0
      this.levelN = 0
    }

    // resample (linear) and convert to Int16
    let t = this.pos
    while (t < ch.length) {
      const i = Math.floor(t)
      const frac = t - i
      const a = i < 0 ? this.prev : ch[i]
      const b = i + 1 < ch.length ? ch[i + 1] : ch[i]
      const v = a + (b - a) * frac
      const c = v < -1 ? -1 : v > 1 ? 1 : v
      this.out[this.n++] = c < 0 ? c * 32768 : c * 32767
      if (this.n === this.chunk) {
        const buffer = this.out.buffer.slice(0)
        this.port.postMessage({ type: 'chunk', buffer, sampleRate: this.target }, [buffer])
        this.n = 0
      }
      t += this.ratio
    }
    this.pos = t - ch.length
    this.prev = ch[ch.length - 1]
    return true
  }
}

registerProcessor('io-mic', IoMicProcessor)
