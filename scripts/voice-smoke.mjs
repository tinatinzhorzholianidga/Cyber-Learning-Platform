#!/usr/bin/env node
/* Smoke test for the Gemini key in .env.local (docs/io-voice-plan.md §7.1,
   phase D1; gate G1(c)). Per candidate chat model it tries the model
   lookup, one generateContent, one streamGenerateContent (and an optional
   burst to surface the per-minute quota text); then one TTS request and a
   Live connect per Live model. Every 429 is printed with its quota metric
   and retry delay, so the team can pick the models with a usable free
   quota (VITE_IO_CHAT_MODEL, VITE_IO_LIVE_OK).

   Usage:  npm run smoke:voice -- [--models=a,b] [--live=a,b | --no-live]
                                  [--tts=model | --no-tts] [--voice=Charon]
                                  [--burst=N] [--timeout=ms] [--json]
   The key is read from IO_GEMINI_KEY (environment or .env.local) and is
   never printed. Exit code 1 when the key is rejected, 2 when missing. */
import { writeFileSync, mkdirSync } from 'node:fs'
import { Modality } from '@google/genai'
import { geminiKey, keyDescription, mask, parseArgs, table, sleep, ROOT } from './lib/env.mjs'
import { getModel, generateOnce, streamChat, streamSpeech, GeminiError, sampleRateOf } from '../src/voice/llm/geminiDirect.js'
import { pcmDurationSec } from './lib/wav.mjs'
import { connectLive, audioChunks } from './lib/liveNode.mjs'

const args = parseArgs(process.argv.slice(2))
const CHAT_MODELS = String(args.models || 'gemini-3.8-flash,gemini-3.7-flash,gemini-3.6-flash,gemini-3.5-flash-lite').split(',').filter(Boolean)
const LIVE_MODELS = args['no-live'] ? [] : String(args.live === true || !args.live ? 'gemini-3.8-live,gemini-3.1-flash-live-preview' : args.live).split(',').filter(Boolean)
const TTS_MODEL = args['no-tts'] ? '' : String(args.tts === true || !args.tts ? 'gemini-3.1-flash-tts-preview' : args.tts)
const VOICE = String(args.voice || 'Charon')
const BURST = Number(args.burst || 0)
const TIMEOUT = Number(args.timeout || 20000)

const key = geminiKey()
if (!key) {
  console.error('No key. Put IO_GEMINI_KEY=… in .env.local (see .env.example) or export IO_GEMINI_KEY.')
  process.exit(2)
}
console.log(`key: ${keyDescription(key)} - never printed\n`)

const PROMPT_SYSTEM = 'You are IO, a friendly robot host. Reply in one short Georgian sentence.'
const PROMPT_USER = 'გამარჯობა, იო! ვინ ხართ?'
const TTS_TEXT = 'გამარჯობა! მე იო ვარ, თქვენი გზამკვლევი.'

const results = { at: new Date().toISOString(), chat: [], tts: null, live: [] }
let keyRejected = false
const now = () => performance.now()

function describeError(err) {
  const code = err instanceof GeminiError ? err.code : err?.name === 'AbortError' ? 'TIMEOUT' : 'ERROR'
  const parts = [mask(err?.message || String(err), key)]
  if (err?.retryAfterMs) parts.push(`retry in ${Math.round(err.retryAfterMs / 1000)} s`)
  if (err?.quota?.length) parts.push(`quota: ${err.quota.join(', ')}`)
  if (code === 'BAD_KEY') keyRejected = true
  return { code, note: parts.join(' · ') }
}

async function timed(fn) {
  const t0 = now()
  const value = await fn()
  return { value, ms: Math.round(now() - t0) }
}

const controllerFor = (ms) => {
  const c = new AbortController()
  setTimeout(() => c.abort(), ms).unref?.()
  return c
}

/* ---- chat models ---- */
for (const model of CHAT_MODELS) {
  const row = { model, lookup: '', generate: '', stream: '', burst: '' }
  results.chat.push(row)
  console.log(`== ${model}`)

  try {
    const { value, ms } = await timed(() => getModel({ apiKey: key, model, signal: controllerFor(TIMEOUT).signal }))
    const methods = (value.supportedGenerationMethods || []).join(',')
    row.lookup = `ok ${ms} ms`
    console.log(`  lookup     ok (${ms} ms) ${value.displayName || ''} [${methods}]`)
  } catch (err) {
    const e = describeError(err)
    row.lookup = e.code
    console.log(`  lookup     ${e.code}: ${e.note}`)
    if (e.code === 'BAD_KEY') break
  }

  try {
    const { value, ms } = await timed(() =>
      generateOnce({ apiKey: key, model, system: PROMPT_SYSTEM, history: [{ role: 'user', content: PROMPT_USER }], maxOutputTokens: 80, signal: controllerFor(TIMEOUT).signal }),
    )
    const usage = value.usage ? `${value.usage.promptTokenCount ?? '?'}→${value.usage.candidatesTokenCount ?? '?'} tokens` : ''
    row.generate = value.text ? `ok ${ms} ms` : `empty (${value.finish || value.blocked || '?'})`
    console.log(`  generate   ${row.generate} ${usage} "${value.text.slice(0, 70).replace(/\s+/g, ' ')}"`)
  } catch (err) {
    const e = describeError(err)
    row.generate = e.code
    console.log(`  generate   ${e.code}: ${e.note}`)
    if (e.code === 'BAD_KEY') break
  }

  try {
    const t0 = now()
    let first = null
    let chunks = 0
    let text = ''
    let finish = ''
    for await (const ev of streamChat({ apiKey: key, model, system: PROMPT_SYSTEM, history: [{ role: 'user', content: PROMPT_USER }], maxOutputTokens: 80, signal: controllerFor(TIMEOUT).signal })) {
      if (ev.type === 'text') {
        if (first == null) first = Math.round(now() - t0)
        chunks += 1
        text += ev.text
      } else if (ev.type === 'finish') finish = ev.reason
    }
    const total = Math.round(now() - t0)
    row.stream = chunks ? `ok first ${first} ms, ${chunks} chunks, ${total} ms` : `no text (${finish || '?'})`
    console.log(`  stream     ${row.stream} "${text.slice(0, 70).replace(/\s+/g, ' ')}"`)
  } catch (err) {
    const e = describeError(err)
    row.stream = e.code
    console.log(`  stream     ${e.code}: ${e.note}`)
  }

  if (BURST > 0 && !/BAD_KEY|MODEL_NOT_FOUND/.test(row.generate)) {
    let ok = 0
    let limited = 0
    let firstLimit = ''
    for (let i = 0; i < BURST; i++) {
      try {
        await generateOnce({ apiKey: key, model, history: [{ role: 'user', content: 'პასუხი: ერთი სიტყვა.' }], maxOutputTokens: 5, signal: controllerFor(TIMEOUT).signal })
        ok += 1
      } catch (err) {
        const e = describeError(err)
        if (e.code === 'RATE_LIMITED') {
          limited += 1
          if (!firstLimit) firstLimit = e.note
        } else {
          console.log(`  burst      ${e.code}: ${e.note}`)
          break
        }
      }
    }
    row.burst = `${ok} ok, ${limited} × 429`
    console.log(`  burst      ${row.burst}${firstLimit ? ` - ${firstLimit}` : ''}`)
  }
  await sleep(500)
}

/* ---- TTS ---- */
if (TTS_MODEL && !keyRejected) {
  console.log(`== ${TTS_MODEL} (voice ${VOICE})`)
  const row = { model: TTS_MODEL, result: '' }
  results.tts = row
  try {
    const t0 = now()
    let first = null
    let bytes = 0
    let rate = 24000
    for await (const chunk of streamSpeech({ apiKey: key, model: TTS_MODEL, text: TTS_TEXT, voiceName: VOICE, signal: controllerFor(TIMEOUT * 2).signal })) {
      if (first == null) first = Math.round(now() - t0)
      bytes += chunk.bytes.length
      rate = sampleRateOf(chunk.mimeType)
    }
    row.result = bytes ? `ok first ${first} ms, ${pcmDurationSec(bytes, rate).toFixed(1)} s audio @ ${rate} Hz, ${Math.round(now() - t0)} ms` : 'no audio'
    console.log(`  tts        ${row.result}`)
  } catch (err) {
    const e = describeError(err)
    row.result = e.code
    console.log(`  tts        ${e.code}: ${e.note}`)
  }
}

/* ---- Live ---- */
for (const model of LIVE_MODELS) {
  if (keyRejected) break
  console.log(`== ${model} (Live, voice ${VOICE})`)
  const row = { model, connect: '', audio: '', close: '' }
  results.live.push(row)
  let live
  try {
    const t0 = now()
    live = await connectLive({
      apiKey: key,
      model,
      connectTimeoutMs: TIMEOUT,
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
      },
    })
    row.connect = `ok ${Math.round(now() - t0)} ms`
    console.log(`  connect    ${row.connect} (setupComplete: ${live.state.setupComplete})`)
  } catch (err) {
    const st = err.state || {}
    const closed = st.closed ? ` close ${st.closed.code} "${mask(st.closed.reason, key)}"` : ''
    const error = st.error ? ` error "${mask(st.error, key)}"` : ''
    row.connect = `FAIL${closed}${error}`
    console.log(`  connect    FAIL: ${mask(err.message, key)}${closed}${error}`)
    continue
  }

  try {
    const t0 = now()
    live.session.sendClientContent({ turns: [{ role: 'user', parts: [{ text: 'Say hello in one short Georgian sentence.' }] }], turnComplete: true })
    let bytes = 0
    let first = null
    let transcript = ''
    let done = false
    while (!done) {
      const item = await live.next(TIMEOUT)
      if (item.type === 'close') {
        row.close = `${item.code} "${mask(item.reason, key)}"`
        break
      }
      if (item.type === 'error') {
        row.close = `error "${mask(item.error, key)}"`
        break
      }
      const m = item.message
      for (const c of audioChunks(m)) {
        if (first == null) first = Math.round(now() - t0)
        bytes += c.length
      }
      if (m.serverContent?.outputTranscription?.text) transcript += m.serverContent.outputTranscription.text
      if (m.serverContent?.turnComplete) done = true
    }
    row.audio = bytes ? `ok first ${first} ms, ${pcmDurationSec(bytes).toFixed(1)} s audio "${transcript.trim().slice(0, 60)}"` : 'no audio'
    console.log(`  audio      ${row.audio}`)
  } catch (err) {
    row.audio = `FAIL ${mask(err.message, key)}`
    console.log(`  audio      FAIL: ${mask(err.message, key)}`)
  } finally {
    live.close()
    await sleep(300)
    if (!row.close && live.state.closed) row.close = `${live.state.closed.code} "${mask(live.state.closed.reason, key)}"`
    console.log(`  close      ${row.close || 'clean'}`)
  }
}

/* ---- summary ---- */
console.log('\nSummary')
console.log(table(results.chat.map((r) => [r.model, r.lookup, r.generate, r.stream, r.burst]), ['chat model', 'lookup', 'generateContent', 'streamGenerateContent', 'burst']))
if (results.tts) console.log(`\n${results.tts.model}: ${results.tts.result}`)
if (results.live.length) console.log('\n' + table(results.live.map((r) => [r.model, r.connect, r.audio, r.close]), ['live model', 'connect', 'audio', 'close']))
if (args.json) {
  mkdirSync(`${ROOT}bakeoff`, { recursive: true })
  writeFileSync(`${ROOT}bakeoff/smoke.json`, JSON.stringify(results, null, 2))
  console.log('\nwritten bakeoff/smoke.json')
}
if (keyRejected) {
  console.log('\nThe key was rejected (BAD_KEY). Create a fresh key in AI Studio and put it in .env.local.')
  process.exit(1)
}
