/* Gap-free playback of streamed PCM16 chunks (24 kHz from Gemini, any
   rate from a WAV) and the amplitude that drives IO's mouth
   (brief Phase 2; docs/io-voice-plan.md §5.2).

   Each chunk becomes an AudioBuffer scheduled at `nextStartTime` through
   GainNode → AnalyserNode → destination. level() is the analyser's RMS,
   smoothed with a ≈ 60 ms attack and ≈ 120 ms release, mapped to 0..1.
   flush() stops everything instantly (interruption). The AudioContext
   itself is created and resumed inside the visitor's click (App.jsx). */
import { bytesToInt16 } from './pcm.js'

const ATTACK_S = 0.06
const RELEASE_S = 0.12
const LEAD_S = 0.02 // scheduling lead when the queue has run dry

export function createPlayer(ctx) {
  const gain = ctx.createGain()
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 512
  analyser.smoothingTimeConstant = 0
  gain.connect(analyser)
  analyser.connect(ctx.destination)
  const frame = new Float32Array(analyser.fftSize)
  const active = new Set()
  const drainWaiters = []
  let nextStart = 0
  let smoothed = 0
  let lastAt = 0
  let queuedSeconds = 0

  const resolveDrain = () => {
    while (drainWaiters.length) drainWaiters.shift()()
  }

  return {
    /* pcm: Int16Array | Uint8Array (LE bytes) | ArrayBuffer. Returns the
       chunk's duration in seconds. */
    enqueue(pcm, sampleRate = 24000) {
      const int16 = pcm instanceof ArrayBuffer ? new Int16Array(pcm) : bytesToInt16(pcm)
      if (!int16.length) return 0
      const buffer = ctx.createBuffer(1, int16.length, sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < int16.length; i++) data[i] = int16[i] / 32768
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.connect(gain)
      const now = ctx.currentTime
      const start = Math.max(nextStart, now + LEAD_S)
      src.start(start)
      nextStart = start + buffer.duration
      queuedSeconds += buffer.duration
      active.add(src)
      src.onended = () => {
        active.delete(src)
        if (!active.size) resolveDrain()
      }
      return buffer.duration
    },

    /* 0..1, smoothed; call every animation frame while speaking. */
    level() {
      analyser.getFloatTimeDomainData(frame)
      let sum = 0
      for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i]
      const target = Math.min(1, Math.sqrt(sum / frame.length) * 4)
      const now = performance.now()
      const dt = lastAt ? Math.min(0.1, (now - lastAt) / 1000) : 1 / 60
      lastAt = now
      const tau = target > smoothed ? ATTACK_S : RELEASE_S
      smoothed += (target - smoothed) * (1 - Math.exp(-dt / tau))
      return smoothed
    },

    /* Stop every scheduled source instantly. */
    flush() {
      active.forEach((src) => {
        try {
          src.onended = null
          src.stop()
        } catch {
          /* not started or already stopped */
        }
      })
      active.clear()
      nextStart = 0
      smoothed = 0
      resolveDrain()
    },

    /* Resolves when the queue has played out (or was flushed). */
    drained() {
      return active.size ? new Promise((resolve) => drainWaiters.push(resolve)) : Promise.resolve()
    },

    playing: () => active.size > 0,
    /* seconds still to play from now */
    pending: () => Math.max(0, nextStart - ctx.currentTime),
    queuedSeconds: () => queuedSeconds,
    setMuted(muted) {
      gain.gain.value = muted ? 0 : 1
    },
    close() {
      this.flush()
      try {
        gain.disconnect()
        analyser.disconnect()
      } catch {
        /* ignore */
      }
    },
  }
}
