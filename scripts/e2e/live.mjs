#!/usr/bin/env node
/* LiveVoiceSession acceptance in headless Chromium against the dev server
   (docs/io-voice-plan.md §7.1, D4), with the Live WebSocket mocked in the
   page: the mock answers the setup with setupComplete, the hidden
   session_started turn with captions and audio (a speech-like test
   signal), a typed question likewise, then hands out a resumption
   handle and a goAway so the client reconnects. Checks: the session is
   selected with the dev key, the microphone streams 16 kHz chunks, the
   amplitude mouth moves, Esc discards the rest of a turn, the reconnect
   carries the handle, End returns to host mode, no console error.

   Needs the dev server started WITH a (fake) dev key and the Live flag:
     IO_GEMINI_KEY=AIzaFAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKE1234 VITE_IO_LIVE_OK=1 npm run dev
   and playwright-core with a Chromium. Usage: node scripts/e2e/live.mjs [base url] */
import { chromium } from 'playwright-core'
import { synthSpeech } from '../../src/voice/audio/pcm.js'

const BASE = process.argv[2] || process.env.IO_BASE || 'http://localhost:5173/IO-for-main-page/'
const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || undefined,
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
})
const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, permissions: ['microphone'] })
const report = { errors: [], failures: [], sockets: [] }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const expect = (cond, label) => {
  if (!cond) report.failures.push(label)
}
const finish = (code) => {
  console.log(JSON.stringify(report, null, 1))
  process.exit(code)
}
process.on('uncaughtException', (e) => {
  report.fatal = String(e?.message || e).slice(0, 400)
  finish(1)
})
process.on('unhandledRejection', (e) => {
  report.fatal = String(e?.message || e).slice(0, 400)
  finish(1)
})

const page = await context.newPage()
page.on('console', (m) => {
  if (m.type() !== 'error' && m.type() !== 'warning') return
  const text = m.text()
  if (/GL Driver Message|GPU stall/.test(text)) return
  report.errors.push(`${m.type()}: ${text.slice(0, 200)}`)
})
page.on('pageerror', (e) => report.errors.push(`pageerror: ${e.message}`))
const state = () => page.evaluate(() => window.__ioVoice?.store.get().state ?? null)
const waitState = async (wanted, ms = 15000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    const s = await state()
    if (wanted.includes(s)) return s
    await sleep(40)
  }
  return `timeout (${await state()})`
}
const sampleMouth = async (ms) => {
  const out = []
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    const v = await page.evaluate(() => ({ m: window.__ioVoice?.mouth() ?? null, s: window.__ioVoice?.store.get().state }))
    if (v.s !== 'speaking') break
    out.push(v.m)
    await sleep(40)
  }
  const nums = out.filter((v) => typeof v === 'number')
  return { samples: out.length, numeric: nums.length, min: nums.length ? Math.min(...nums) : null, max: nums.length ? Math.max(...nums) : null }
}

/* ---- the mocked Live server ---- */
const pcm = synthSpeech({ seconds: 0.4, seed: 9 })
const pcmB64 = Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength).toString('base64')
const GREETING = ['გამარჯობა! ', 'მე იო ვარ, თქვენი გზამკვლევი. ', 'რა გაინტერესებთ?']
const ANSWER = ['ფიშინგი თაღლითობაა, რომელიც ყალბი წერილით გატყუებთ. ', 'ბმულს ნუ დააწკაპუნებთ. ', 'ჯერ გამგზავნი შეამოწმეთ. ', 'ეჭვის შემთხვევაში ჰკითხეთ კოლეგას.']
let socketN = 0
await page.routeWebSocket(/BidiGenerateContent/, (ws) => {
  const sock = { n: ++socketN, url: ws.url().replace(/key=[^&]+/, 'key=***'), keyInUrl: /key=AIzaFAKE/.test(ws.url()), setup: null, audioChunks: 0, texts: [], clientContents: [], audioStreamEnds: 0 }
  report.sockets.push(sock)
  const send = (obj) => ws.send(JSON.stringify(obj))
  const answer = async (sentences) => {
    for (const s of sentences) {
      send({ serverContent: { outputTranscription: { text: s } } })
      send({ serverContent: { modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: pcmB64 } }] } } })
      await sleep(sentences === ANSWER ? 350 : 150)
    }
    send({ serverContent: { turnComplete: true } })
  }
  ws.onMessage(async (raw) => {
    const msg = JSON.parse(typeof raw === 'string' ? raw : raw.toString())
    if (msg.setup) {
      sock.setup = msg.setup
      send({ setupComplete: {} })
      return
    }
    if (msg.clientContent) {
      sock.clientContents.push(msg.clientContent.turns?.[0]?.parts?.[0]?.text?.slice(0, 40))
      await answer(GREETING)
      if (sock.n === 1) {
        // the first socket hands out a handle and asks the client to move on
        await sleep(300)
        send({ sessionResumptionUpdate: { newHandle: 'handle-1', resumable: true } })
        send({ goAway: { timeLeft: '5s' } })
      }
      return
    }
    if (msg.realtimeInput) {
      if (msg.realtimeInput.audio) sock.audioChunks += 1
      if (msg.realtimeInput.audioStreamEnd) sock.audioStreamEnds += 1
      if (msg.realtimeInput.text) {
        sock.texts.push(msg.realtimeInput.text)
        send({ serverContent: { inputTranscription: { text: msg.realtimeInput.text, finished: true } } })
        await answer(ANSWER)
      }
    }
  })
})

await page.goto(`${BASE}?voice=live`, { waitUntil: 'networkidle' })
await page.click('.io-talk')
await page.waitForSelector('.voice-dock', { timeout: 15000 })
report.badge = await page.textContent('.voice-dev').catch(() => null)
expect(report.badge?.startsWith('live'), 'live session selected with the dev key')
report.greeting = await waitState(['speaking'], 15000)
expect(report.greeting === 'speaking', 'greeting audio plays')
report.greetingMouth = await sampleMouth(800)
expect(report.greetingMouth.numeric > 5 && report.greetingMouth.max - report.greetingMouth.min > 0.2, 'amplitude mouth from the Live audio')
report.afterGreeting = await waitState(['listening'], 10000)
expect(report.afterGreeting === 'listening', 'listening after the greeting')
report.greetingCaption = (await page.textContent('.voice-turn[data-role="io"] .voice-turn-text').catch(() => '')).trim()
expect(report.greetingCaption === GREETING.join('').trim(), 'output transcription captioned in full')
report.micOpen = await page.evaluate(() => window.__ioVoice?.store.get().micOpen)
expect(report.micOpen === true, 'microphone open (continuous)')

// the reconnect after goAway: a second socket with the handle
await sleep(800)
expect(report.sockets.length === 2, 'reconnected once after goAway')
expect(report.sockets[1]?.setup?.sessionResumption?.handle === 'handle-1', 'the reconnect carries the resumption handle')
expect((await state()) === 'listening', 'listening again after the reconnect')
expect(report.sockets[1]?.audioChunks > 3, 'microphone chunks reach the second socket')
report.audioChunks = report.sockets.map((s) => s.audioChunks)

// a typed question: input transcription echoed, the answer plays, then listening
await page.fill('.voice-input', 'რა არის ფიშინგი?')
await page.press('.voice-input', 'Enter')
report.typed = { thinking: await waitState(['thinking', 'speaking'], 5000), speaking: await waitState(['speaking'], 8000) }
report.answerMouth = await sampleMouth(250)
// Esc while IO speaks: the rest of the turn is discarded, then listening
await page.evaluate(() => document.activeElement?.blur())
await page.keyboard.press('Escape')
report.escape = await waitState(['interrupted'], 1000)
expect(report.escape === 'interrupted', 'Esc interrupts the Live answer')
report.afterEscape = await waitState(['listening'], 5000)
expect(report.afterEscape === 'listening', 'listening after the interrupted turn completes')
expect(report.answerMouth.numeric > 3, 'answer audio moved the mouth before the interrupt')
report.userTurn = await page.textContent('.voice-turn[data-role="user"] .voice-turn-text').catch(() => null)
expect(report.userTurn === 'რა არის ფიშინგი?', 'typed question shown as the user turn')
expect(report.sockets[1]?.texts?.[0] === 'რა არის ფიშინგი?', 'typed question sent as realtime text')

// mute via the ring, then End → host mode
await page.click('.voice-ring')
report.muted = await waitState(['idle'], 2000)
expect(report.muted === 'idle', 'the ring mutes Live (idle)')
expect(report.sockets[1]?.audioStreamEnds >= 1, 'audioStreamEnd sent on mute')
await page.click('.voice-btn:has-text("დასრულება")')
await page.waitForSelector('.io-talk', { timeout: 5000 })
await sleep(500)
report.afterEnd = { dock: Boolean(await page.$('.voice-dock')), mode: await page.getAttribute('.io-host', 'data-mode') }
expect(!report.afterEnd.dock && report.afterEnd.mode === null, 'End returns to host mode')
expect(report.sockets.every((s) => !s.keyInUrl) === false, 'dev key rides in the socket URL (localhost only, by SDK design)')

await browser.close()
expect(report.errors.length === 0, 'no console errors')
report.ok = report.failures.length === 0
finish(report.ok ? 0 : 1)
