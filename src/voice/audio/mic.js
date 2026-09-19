/* The microphone (brief Phase 2): getUserMedia with the phone-friendly
   constraints, an AudioWorklet that delivers 16 kHz PCM16 chunks, and a
   live input level for the listening ring. Opened only from a user
   gesture by a session; closed by end(). Track P and the Live session
   consume the chunks; the browser session only needs the level. */

const WORKLET_URL = new URL('./mic-worklet.js', import.meta.url)
const CONSTRAINTS = { audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } }

export function micSupported() {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof AudioWorkletNode !== 'undefined'
}

/* 'noMic' for a denied / missing / insecure microphone, 'error' otherwise. */
export function micErrorKey(err) {
  const name = err?.name || ''
  if (/NotAllowedError|SecurityError|NotFoundError|NotReadableError|OverconstrainedError|PermissionDeniedError/.test(name)) return 'noMic'
  return 'error'
}

/* Load the worklet module once per AudioContext. */
async function ensureWorklet(ctx) {
  if (ctx.__ioMicWorklet) return ctx.__ioMicWorklet
  ctx.__ioMicWorklet = ctx.audioWorklet.addModule(WORKLET_URL)
  try {
    await ctx.__ioMicWorklet
  } catch (err) {
    ctx.__ioMicWorklet = null
    throw err
  }
  return ctx.__ioMicWorklet
}

/* Open the microphone. Resolves with a handle:
     level()      0..1 input level, updated a few times per second
     isOpen()     the track is live and not muted (the mic-open indicator)
     setMuted(b)  disables the track (the level drops to 0)
     close()      stops the track and tears the nodes down
   `onChunk(ArrayBuffer)` receives 16 kHz PCM16 chunks (~100 ms each). */
export async function openMic(ctx, { onChunk, targetRate = 16000, chunkSamples = 1600 } = {}) {
  const stream = await navigator.mediaDevices.getUserMedia(CONSTRAINTS)
  let source = null
  let node = null
  let sink = null
  let level = 0
  try {
    await ensureWorklet(ctx)
    source = ctx.createMediaStreamSource(stream)
    node = new AudioWorkletNode(ctx, 'io-mic', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [1],
      processorOptions: { targetRate, chunkSamples },
    })
    node.port.onmessage = (e) => {
      const d = e.data
      if (!d) return
      if (d.type === 'chunk') onChunk?.(d.buffer, d.sampleRate)
      else if (d.type === 'level') level = d.level
    }
    // the processor outputs silence; the muted sink only keeps the graph running
    sink = ctx.createGain()
    sink.gain.value = 0
    source.connect(node)
    node.connect(sink)
    sink.connect(ctx.destination)
  } catch (err) {
    stream.getTracks().forEach((t) => t.stop())
    throw err
  }
  const track = stream.getAudioTracks()[0]
  let closed = false
  return {
    stream,
    level: () => level,
    isOpen: () => !closed && track.readyState === 'live' && track.enabled,
    setMuted(muted) {
      track.enabled = !muted
      if (muted) level = 0
    },
    close() {
      if (closed) return
      closed = true
      try {
        node.port.onmessage = null
        node.port.close?.()
        node.disconnect()
        source.disconnect()
        sink.disconnect()
      } catch {
        /* already gone */
      }
      stream.getTracks().forEach((t) => t.stop())
      level = 0
    },
  }
}
