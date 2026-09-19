/* Gemini TTS through the player for TurnVoiceSession (docs/io-voice-plan.md
   §5.6): one streamGenerateContent request per sentence, the audio
   chunks enqueued in order as they arrive, the next sentence fetched
   while the current one plays (at most two requests in flight). The
   amplitude mouth comes from the player. Track P swaps this module for
   tts/worker.js with the same callbacks.

   createGeminiSpeaker({ apiKey, model, voiceName, player, ... })
     speak(sentence)   queue one sentence
     cancel()          abort every request and flush the player
   Callbacks: onFirstAudio(ms since the first speak())  onSentence(text)
              onMouth('level')  onDone()  onError(err) */
import { streamSpeech, sampleRateOf } from '../llm/geminiDirect.js'

export function createGeminiSpeaker({ apiKey, model, voiceName, player, onFirstAudio, onSentence, onMouth, onDone, onError, prefetch = 1 } = {}) {
  let gen = 0
  let jobs = []
  let looping = false
  let firstSpeakAt = null
  let firstAudioSeen = false

  const signal = () => {
    let wake = null
    const p = () => new Promise((resolve) => (wake = resolve))
    return { wait: p, fire: () => wake?.() }
  }

  function startFetch(job, my) {
    if (job.fetching) return
    job.fetching = true
    job.controller = new AbortController()
    ;(async () => {
      try {
        for await (const chunk of streamSpeech({ apiKey, model, text: job.text, voiceName, signal: job.controller.signal })) {
          if (my !== gen) return
          job.rate = sampleRateOf(chunk.mimeType)
          job.chunks.push(chunk.bytes)
          job.sig.fire()
        }
      } catch (err) {
        if (my === gen && err?.code !== 'ABORTED') {
          job.error = err
          onError?.(err)
        }
      } finally {
        job.done = true
        job.sig.fire()
      }
    })()
  }

  async function loop(my) {
    looping = true
    try {
      while (jobs.length && my === gen) {
        const job = jobs[0]
        startFetch(job, my)
        for (let i = 1; i <= prefetch && jobs[i]; i++) startFetch(jobs[i], my)
        let idx = 0
        while (my === gen && !(job.done && idx === job.chunks.length)) {
          if (idx < job.chunks.length) {
            const bytes = job.chunks[idx++]
            if (!job.announced) {
              job.announced = true
              onSentence?.(job.text)
            }
            player.enqueue(bytes, job.rate || 24000)
            if (!firstAudioSeen) {
              firstAudioSeen = true
              onMouth?.('level')
              onFirstAudio?.(performance.now() - firstSpeakAt)
            }
          } else await job.sig.wait()
        }
        if (my !== gen) return
        jobs.shift()
      }
      if (my === gen) {
        await player.drained()
        if (my === gen && !jobs.length) {
          // the next answer measures its own time to first audio
          firstSpeakAt = null
          firstAudioSeen = false
          onDone?.()
        }
      }
    } finally {
      if (my === gen) looping = false
    }
  }

  return {
    speak(sentence) {
      const text = String(sentence || '').trim()
      if (!text) return
      if (firstSpeakAt == null) firstSpeakAt = performance.now()
      jobs.push({ text, chunks: [], done: false, fetching: false, announced: false, rate: 24000, sig: signal() })
      if (!looping) loop(gen)
    },
    cancel() {
      gen += 1
      for (const job of jobs) job.controller?.abort()
      jobs = []
      looping = false
      firstSpeakAt = null
      firstAudioSeen = false
      player.flush()
    },
    pending: () => jobs.length,
    idle: () => !jobs.length && !looping,
  }
}
