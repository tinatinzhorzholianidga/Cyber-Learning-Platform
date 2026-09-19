#!/usr/bin/env node
/* Gemini voice bake-off (docs/io-voice-plan.md §6.2, A7): synthesises the
   bake-off lines with Gemini TTS voices, and with `--live` with the Live
   model's own voice, into bakeoff/*.wav (gitignored) for the team to rate
   on bakeoff/README.md. Browser voices are rated on the ?bakeoff=1 page.

   Usage:  npm run bakeoff -- [--voices=Charon,Puck] [--extra] [--lines=1,2,3]
                              [--lang=ka|en] [--hint=both|on|off] [--model=…]
                              [--delay=1500] [--retries=3] [--out=bakeoff]
                              [--live [--live-model=gemini-3.8-live]] [--only-live]
   Files:  bakeoff/gemini-<voice>-<n>[-en][-hint].wav   24 kHz 16-bit mono
           bakeoff/live-<voice>-<n>[-en].wav
   The key comes from IO_GEMINI_KEY (environment or .env.local) and is never
   printed. 429s are retried after the server's retryDelay. */
import { mkdirSync, writeFileSync } from 'node:fs'
import { Modality } from '@google/genai'
import { BAKEOFF_LINES } from '../src/voice/dev/bakeoffLines.js'
import { streamSpeech, GeminiError, sampleRateOf } from '../src/voice/llm/geminiDirect.js'
import { pcmToWav, pcmDurationSec } from './lib/wav.mjs'
import { geminiKey, keyDescription, mask, parseArgs, table, sleep, ROOT } from './lib/env.mjs'
import { connectLive, audioChunks } from './lib/liveNode.mjs'

const DEFAULT_VOICES = ['Charon', 'Puck', 'Orus', 'Achird', 'Iapetus']
const EXTRA_VOICES = ['Umbriel', 'Fenrir']

const args = parseArgs(process.argv.slice(2))
const voices = args.voices ? String(args.voices).split(',').filter(Boolean) : [...DEFAULT_VOICES, ...(args.extra ? EXTRA_VOICES : [])]
const lang = args.lang === 'en' ? 'en' : 'ka'
const lineNumbers = args.lines ? String(args.lines).split(',').map(Number) : BAKEOFF_LINES.map((l) => l.n)
const lines = BAKEOFF_LINES.filter((l) => lineNumbers.includes(l.n))
const hintModes = args.hint === 'on' ? [true] : args.hint === 'off' ? [false] : [false, true]
const TTS_MODEL = String(args.model || 'gemini-3.1-flash-tts-preview')
const LIVE_MODEL = String(args['live-model'] || 'gemini-3.8-live')
const DELAY = Number(args.delay ?? 1500)
const RETRIES = Number(args.retries ?? 3)
const OUT = `${ROOT}${String(args.out || 'bakeoff').replace(/\/$/, '')}/`
const doTts = !args['only-live']
const doLive = Boolean(args.live || args['only-live'])

const key = geminiKey()
if (!key) {
  console.error('No key. Put IO_GEMINI_KEY=… in .env.local (see .env.example) or export IO_GEMINI_KEY.')
  process.exit(2)
}
mkdirSync(OUT, { recursive: true })
console.log(`key: ${keyDescription(key)} - never printed`)
console.log(`voices: ${voices.join(', ')} · lines: ${lines.map((l) => l.n).join(',')} · lang: ${lang} · out: ${OUT}\n`)

const rows = []
const suffix = (hint) => `${lang === 'en' ? '-en' : ''}${hint ? '-hint' : ''}`

/* The TTS prompt: the text itself, or an English direction naming the
   language first (V17: speechConfig.languageCode has no ka-GE). */
function prompt(line, hint) {
  const text = line.speak[lang]
  if (!hint) return text
  return lang === 'ka' ? `Say in Georgian, warmly and clearly, at an unhurried pace: ${text}` : `Say warmly and clearly, at an unhurried pace: ${text}`
}

async function synthesise(line, voice, hint) {
  const chunks = []
  let rate = 24000
  for await (const chunk of streamSpeech({ apiKey: key, model: TTS_MODEL, text: prompt(line, hint), voiceName: voice })) {
    chunks.push(chunk.bytes)
    rate = sampleRateOf(chunk.mimeType)
  }
  return { chunks, rate }
}

async function withRetries(label, fn) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (err) {
      const retryable = err instanceof GeminiError && (err.code === 'RATE_LIMITED' || err.code === 'UPSTREAM')
      if (!retryable || attempt >= RETRIES) throw err
      const wait = Math.min(err.retryAfterMs || 5000 * 2 ** attempt, 65000)
      console.log(`  ${label}: ${err.code}${err.quota?.length ? ` (${err.quota.join(', ')})` : ''} - retry ${attempt + 1}/${RETRIES} in ${Math.round(wait / 1000)} s`)
      await sleep(wait)
    }
  }
}

/* ---- Gemini TTS ---- */
if (doTts) {
  let keyRejected = false
  for (const voice of voices) {
    if (keyRejected) break
    for (const line of lines) {
      for (const hint of hintModes) {
        const file = `gemini-${voice}-${line.n}${suffix(hint)}.wav`
        const label = `${voice} #${line.n}${hint ? ' hint' : ''}`
        try {
          const t0 = performance.now()
          const { chunks, rate } = await withRetries(label, () => synthesise(line, voice, hint))
          const bytes = chunks.reduce((n, c) => n + c.length, 0)
          if (!bytes) throw new Error('no audio returned')
          writeFileSync(`${OUT}${file}`, pcmToWav(chunks, { sampleRate: rate }))
          const sec = pcmDurationSec(bytes, rate)
          rows.push([file, `${sec.toFixed(1)} s`, `${Math.round(performance.now() - t0)} ms`, `${(line.speak[lang].length / sec).toFixed(1)} chars/s`, 'ok'])
          console.log(`  ${label}: ${file} ${sec.toFixed(1)} s`)
        } catch (err) {
          const code = err instanceof GeminiError ? err.code : 'ERROR'
          rows.push([file, '', '', '', `${code}: ${mask(err.message, key)}`])
          console.log(`  ${label}: ${code}: ${mask(err.message, key)}`)
          if (code === 'BAD_KEY') {
            keyRejected = true
            break
          }
          if (code === 'MODEL_NOT_FOUND') break
        }
        await sleep(DELAY)
      }
      if (keyRejected) break
    }
  }
  if (keyRejected) {
    console.log('\nThe key was rejected (BAD_KEY). Create a fresh key in AI Studio and put it in .env.local.')
    process.exit(1)
  }
}

/* ---- the Live model's own voice (G1(c), G1(d)) ---- */
const normalise = (s) => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
function similarity(a, b) {
  a = normalise(a)
  b = normalise(b)
  if (!a.length && !b.length) return 1
  const prev = new Array(b.length + 1).fill(0).map((_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let last = i
    for (let j = 1; j <= b.length; j++) {
      const cur = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j - 1], prev[j], last)
      prev[j - 1] = last
      last = cur
    }
    prev[b.length] = last
  }
  return 1 - prev[b.length] / Math.max(a.length, b.length)
}

if (doLive) {
  console.log(`\n== Live (${LIVE_MODEL})`)
  for (const voice of voices) {
    let live
    try {
      live = await connectLive({
        apiKey: key,
        model: LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
          systemInstruction: 'You are a text-to-speech reader. Read the user\'s message aloud verbatim, in its own language, and say nothing else.',
        },
      })
      console.log(`  ${voice}: connected`)
    } catch (err) {
      const st = err.state || {}
      const detail = st.closed ? ` close ${st.closed.code} "${mask(st.closed.reason, key)}"` : st.error ? ` "${mask(st.error, key)}"` : ''
      rows.push([`live-${voice}`, '', '', '', `connect failed: ${mask(err.message, key)}${detail}`])
      console.log(`  ${voice}: connect failed: ${mask(err.message, key)}${detail}`)
      if (/API key/i.test(st.closed?.reason || '')) {
        console.log('\nThe key was rejected. Create a fresh key in AI Studio and put it in .env.local.')
        process.exit(1)
      }
      continue
    }
    for (const line of lines) {
      const file = `live-${voice}-${line.n}${lang === 'en' ? '-en' : ''}.wav`
      try {
        const t0 = performance.now()
        live.session.sendClientContent({ turns: [{ role: 'user', parts: [{ text: line.speak[lang] }] }], turnComplete: true })
        const chunks = []
        let transcript = ''
        let closed = null
        while (true) {
          const item = await live.next(30000)
          if (item.type === 'close' || item.type === 'error') {
            closed = item
            break
          }
          const m = item.message
          chunks.push(...audioChunks(m))
          if (m.serverContent?.outputTranscription?.text) transcript += m.serverContent.outputTranscription.text
          if (m.serverContent?.interrupted) console.log(`  ${voice} #${line.n}: interrupted`)
          if (m.serverContent?.turnComplete) break
        }
        if (closed) throw new Error(closed.type === 'close' ? `closed ${closed.code} "${closed.reason}"` : closed.error)
        const bytes = chunks.reduce((n, c) => n + c.length, 0)
        if (!bytes) throw new Error('no audio (proactive audio may have judged the text not addressed to it)')
        writeFileSync(`${OUT}${file}`, pcmToWav(chunks, { sampleRate: 24000 }))
        const sec = pcmDurationSec(bytes)
        const match = Math.round(similarity(transcript, line.speak[lang]) * 100)
        rows.push([file, `${sec.toFixed(1)} s`, `${Math.round(performance.now() - t0)} ms`, `transcript match ${match}%`, 'ok'])
        console.log(`  ${voice} #${line.n}: ${file} ${sec.toFixed(1)} s, transcript match ${match}%${match < 80 ? ` - "${transcript.trim()}"` : ''}`)
      } catch (err) {
        rows.push([file, '', '', '', mask(err.message, key)])
        console.log(`  ${voice} #${line.n}: ${mask(err.message, key)}`)
        if (live.state.closed) break
      }
      await sleep(DELAY)
    }
    live.close()
    await sleep(300)
  }
}

console.log('\n' + table(rows, ['file', 'audio', 'took', 'measure', 'status']))
writeFileSync(`${OUT}results-${lang}.json`, JSON.stringify({ at: new Date().toISOString(), ttsModel: TTS_MODEL, liveModel: doLive ? LIVE_MODEL : null, lang, rows }, null, 2))
console.log(`\nwritten ${OUT.replace(ROOT, '')}results-${lang}.json - rate the files on bakeoff/README.md`)
