#!/usr/bin/env node
/* Talk-mode acceptance in headless Chromium against the dev server
   (docs/io-voice-plan.md §7.1, D2): with ?voice=stub the mouth follows
   the audio (and the word-pulse / sine paths with &mouth=pulse|sine), the
   ring follows the microphone, Esc and a click on IO cut the audio at
   once, typed questions flow, End returns to host mode with the click
   cycle intact, reduced motion shows captions at once, embeds get the
   button only with ?voice, narrow viewports get the bottom sheet, and no
   console error appears. Prints one JSON report and exits 1 on a failed
   expectation.

   Needs: `npm run dev` on port 5173 (the dev server exposes window.__ioVoice)
   and playwright-core with a Chromium (`npx playwright-core install chromium`
   or PW_CHROMIUM=<path>). Usage: node scripts/e2e/talk.mjs [base url] */
import { chromium } from 'playwright-core'

const BASE = process.argv[2] || process.env.IO_BASE || 'http://localhost:5173/IO-for-main-page/'
const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || undefined,
  args: [
    '--use-gl=swiftshader',
    '--enable-unsafe-swiftshader',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--autoplay-policy=no-user-gesture-required',
  ],
})
const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, permissions: ['microphone'] })
const report = { errors: [], failures: [] }
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

function watch(page, tag) {
  page.on('console', (m) => {
    if (m.type() !== 'error' && m.type() !== 'warning') return
    const text = m.text()
    if (/GL Driver Message|GPU stall/.test(text)) return
    report.errors.push(`${tag} ${m.type()}: ${text.slice(0, 200)}`)
  })
  page.on('pageerror', (e) => report.errors.push(`${tag} pageerror: ${e.message}`))
}
const state = (page) => page.evaluate(() => window.__ioVoice?.store.get().state ?? null)
const waitState = async (page, wanted, ms = 15000) => {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    const s = await state(page)
    if (wanted.includes(s)) return s
    await sleep(40)
  }
  return `timeout (${await state(page)})`
}
/* measure, inside the page, how long an event takes to reach the state */
const latency = (page, fire, wanted) =>
  page.evaluate(
    ({ fire, wanted }) =>
      new Promise((resolve) => {
        const store = window.__ioVoice.store
        const t0 = performance.now()
        const off = store.subscribe(() => {
          if (store.get().state === wanted) {
            off()
            resolve(Math.round((performance.now() - t0) * 10) / 10)
          }
        })
        if (fire === 'escape') window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }))
        else {
          const el = document.querySelector('.io-canvas canvas')
          const r = el.getBoundingClientRect()
          el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0 }))
        }
        setTimeout(() => {
          off()
          resolve(null)
        }, 2000)
      }),
    { fire, wanted },
  )
const sampleMouth = async (page, ms) => {
  const out = []
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    const v = await page.evaluate(() => ({ m: window.__ioVoice?.mouth() ?? null, s: window.__ioVoice?.store.get().state, talking: window.__ioVoice?.store.get().face.talking }))
    if (v.s !== 'speaking') break
    out.push(v)
    await sleep(40)
  }
  const nums = out.map((v) => v.m).filter((v) => typeof v === 'number')
  return { samples: out.length, numeric: nums.length, min: nums.length ? Math.min(...nums) : null, max: nums.length ? Math.max(...nums) : null, talking: out.some((v) => v.talking) }
}

/* ---- 1. the full flow with the amplitude mouth ---- */
{
  const page = await context.newPage()
  watch(page, 'talk')
  await page.goto(`${BASE}?voice=stub`, { waitUntil: 'networkidle' })
  report.entryLabel = await page.textContent('.io-talk')
  expect(await page.$('.io-hint'), 'hint present in host mode')
  await page.click('.io-talk')
  await page.waitForSelector('.voice-dock', { timeout: 10000 })
  expect(!(await page.$('.io-hint')), 'hint hidden in talk mode')
  expect((await page.getAttribute('.io-host', 'data-mode')) === 'talk', 'io-host data-mode=talk')
  report.greeting = await waitState(page, ['speaking'], 8000)
  expect(report.greeting === 'speaking', 'greeting speaks')
  report.mic = await page.evaluate(() => ({ open: window.__ioVoice?.store.get().micOpen, error: window.__ioVoice?.store.get().error }))
  expect(report.mic.open === true, 'microphone opened')
  report.mouthLevel = await sampleMouth(page, 2000)
  expect(report.mouthLevel.numeric > 10 && report.mouthLevel.max - report.mouthLevel.min > 0.25, 'amplitude mouth varies while speaking')
  report.captionWhileSpeaking = (await page.textContent('.voice-turn[data-role="io"] .voice-turn-text').catch(() => '')).slice(0, 60)
  expect(report.captionWhileSpeaking.length > 0, 'caption streams while speaking')

  report.escapeMs = await latency(page, 'escape', 'interrupted')
  expect(report.escapeMs != null && report.escapeMs < 100, `Esc interrupts within 100 ms (${report.escapeMs})`)
  report.mouthAfterEsc = await page.evaluate(() => window.__ioVoice?.mouth() ?? null)
  expect(report.mouthAfterEsc === null, 'mouth level cleared after interrupt')
  await waitState(page, ['idle'], 2000)
  expect((await page.textContent('.voice-turn[data-role="io"]')).includes('(შეწყდა)'), 'interrupted mark shown')
  const face = await page.evaluate(() => window.__ioVoice?.store.get().face)
  expect(face.gesture?.type === 'wave', 'wave gesture fired on session start')

  await page.fill('.voice-input', 'რა არის ფიშინგი?')
  await page.press('.voice-input', 'Enter')
  report.typed = { thinking: await waitState(page, ['thinking'], 3000), speaking: await waitState(page, ['speaking'], 5000) }
  expect(report.typed.thinking === 'thinking' && report.typed.speaking === 'speaking', 'typed question → thinking → speaking')
  expect((await page.textContent('.voice-turn[data-role="user"] .voice-turn-text')) === 'რა არის ფიშინგი?', 'user turn shown')
  await sleep(300)
  report.clickIoMs = await latency(page, 'click', 'interrupted')
  expect(report.clickIoMs != null && report.clickIoMs < 100, `click on IO interrupts within 100 ms (${report.clickIoMs})`)
  expect(await page.$('.io-bubble .voice-transcript'), 'bubble keeps the transcript after the click (no host line)')
  await waitState(page, ['idle'], 2000)

  // T is ignored while the text field has focus (correct); leave it first
  await page.evaluate(() => document.activeElement?.blur())
  await page.keyboard.press('KeyT')
  report.listen = { state: await waitState(page, ['listening'], 2000), ring: await page.getAttribute('.voice-ring', 'data-state') }
  expect(report.listen.state === 'listening' && report.listen.ring === 'listening', 'T starts listening; ring shows it')
  const f2 = await page.evaluate(() => window.__ioVoice?.store.get().face)
  expect(f2.listening === true && f2.emotion === 'thinking', 'listening cue + thinking face')
  expect((await page.textContent('.voice-mic')).includes('მიკროფონი'), 'mic-open indicator text')
  let micMax = 0
  let levelMax = 0
  for (let i = 0; i < 12; i++) {
    const v = await page.evaluate(() => ({ css: Number(getComputedStyle(document.querySelector('.voice-ring')).getPropertyValue('--mic')), lvl: window.__ioVoice?.api.micLevel() }))
    micMax = Math.max(micMax, v.css || 0)
    levelMax = Math.max(levelMax, v.lvl || 0)
    await sleep(50)
  }
  report.listen.ringMicMax = micMax
  report.listen.micLevelMax = levelMax
  expect(levelMax > 0.02 && micMax > 0.02, 'the ring follows the (fake) microphone level')
  report.listen.then = await waitState(page, ['thinking', 'speaking', 'idle'], 9000)
  expect(report.listen.then !== 'timeout', 'listening ends by itself')
  await waitState(page, ['idle'], 12000)

  const muteBtn = await page.$('.voice-actions .voice-btn:nth-child(1)')
  await muteBtn.click()
  report.mute = { micOpen: await page.evaluate(() => window.__ioVoice?.store.get().micOpen), label: (await muteBtn.textContent()).trim() }
  expect(report.mute.micOpen === false, 'mute closes the mic indicator')
  page.once('dialog', (d) => d.accept())
  await page.click('.voice-btn:has-text("წაშლა")')
  await sleep(200)
  expect((await page.evaluate(() => window.__ioVoice?.store.get().transcript.turns.length)) === 0, 'delete my data clears the transcript')
  report.devBadge = await page.textContent('.voice-dev').catch(() => null)

  await page.click('.voice-btn:has-text("დასრულება")')
  await page.waitForSelector('.io-talk', { timeout: 5000 })
  await sleep(1200)
  report.afterEnd = { hint: Boolean(await page.$('.io-hint')), dock: Boolean(await page.$('.voice-dock')), mode: await page.getAttribute('.io-host', 'data-mode'), bubble: (await page.textContent('.io-bubble p')).trim().slice(0, 40) }
  expect(report.afterEnd.hint && !report.afterEnd.dock && report.afterEnd.mode === null && report.afterEnd.bubble.length > 0, 'End returns to host mode with a host line')
  const beforeClick = await page.textContent('.io-bubble .sr-only')
  await page.click('.io-canvas', { position: { x: 180, y: 180 } })
  await sleep(300)
  const afterClick = await page.textContent('.io-bubble .sr-only')
  expect(beforeClick !== afterClick && afterClick.length > 10, 'host click cycle still walks the lines')
  await page.close()
}

/* ---- 2. the word-pulse and sine mouths (what browser voices send) ---- */
for (const mode of ['pulse', 'sine']) {
  const page = await context.newPage()
  watch(page, mode)
  await page.goto(`${BASE}?voice=stub&mouth=${mode}`, { waitUntil: 'networkidle' })
  await page.click('.io-talk')
  await page.waitForSelector('.voice-dock', { timeout: 10000 })
  const s = await waitState(page, ['speaking'], 8000)
  const m = await sampleMouth(page, 1500)
  report[`mouth_${mode}`] = { state: s, ...m }
  if (mode === 'pulse') expect(m.numeric > 10 && m.max > 0.6 && m.min < 0.2, 'pulse mouth: per-word pulses decay')
  else expect(m.samples > 5 && m.numeric === 0 && m.talking, 'sine mouth: level null, talking flag on')
  await page.close()
}

/* ---- 3. reduced motion ---- */
{
  const page = await context.newPage()
  watch(page, 'reduced')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${BASE}?voice=stub&lang=en`, { waitUntil: 'networkidle' })
  await page.click('.io-talk')
  await page.waitForSelector('.voice-dock', { timeout: 10000 })
  const s = await waitState(page, ['speaking'], 8000)
  await sleep(300)
  report.reduced = {
    state: s,
    mouth: await page.evaluate(() => window.__ioVoice?.mouth() ?? null),
    caption: (await page.textContent('.voice-turn[data-role="io"] .voice-turn-text').catch(() => '')).trim(),
    gesture: await page.evaluate(() => window.__ioVoice?.store.get().face.gesture),
  }
  expect(report.reduced.state === 'speaking' && report.reduced.mouth === null && report.reduced.gesture === null, 'reduced motion: still face, no gesture')
  expect(report.reduced.caption.endsWith('?'), 'reduced motion: the whole caption at once')
  await page.close()
}

/* ---- 4. embeds, the default selection without a key, the narrow sheet ---- */
{
  const page = await context.newPage()
  watch(page, 'embed')
  await page.goto(`${BASE}?embed=1`, { waitUntil: 'networkidle' })
  expect(!(await page.$('.io-talk')), 'embed without ?voice has no button')
  await page.goto(`${BASE}?embed=1&voice=stub`, { waitUntil: 'networkidle' })
  expect(await page.$('.io-talk'), 'embed with ?voice shows the button')
  await page.click('.io-talk')
  await page.waitForSelector('.voice-dock', { timeout: 10000 })
  expect((await page.evaluate(() => getComputedStyle(document.querySelector('.voice-dock')).position)) === 'fixed', 'embed dock is fixed')
  await page.goto(`${BASE}`, { waitUntil: 'networkidle' })
  await page.click('.io-talk')
  await page.waitForSelector('.voice-dock', { timeout: 10000 })
  await sleep(300)
  report.defaultSelection = { state: await state(page), error: await page.textContent('.voice-error').catch(() => null), badge: await page.textContent('.voice-dev').catch(() => null), keyField: Boolean(await page.$('.voice-key')) }
  expect(report.defaultSelection.error && report.defaultSelection.keyField, 'no session without a key: message + key field')
  await page.close()

  const narrow = await context.newPage()
  watch(narrow, 'narrow')
  await narrow.setViewportSize({ width: 390, height: 780 })
  await narrow.goto(`${BASE}?voice=stub`, { waitUntil: 'networkidle' })
  await narrow.click('.io-talk')
  await narrow.waitForSelector('.voice-dock', { timeout: 10000 })
  await waitState(narrow, ['speaking'], 8000)
  await sleep(500)
  report.narrow = {
    position: await narrow.evaluate(() => getComputedStyle(document.querySelector('.voice-dock')).position),
    sheetTranscript: Boolean(await narrow.$('.voice-sheet-transcript .voice-transcript')),
    compactBubble: Boolean(await narrow.$('.io-bubble .voice-compact')),
    liveRegions: await narrow.evaluate(() => document.querySelectorAll('[aria-live]').length),
  }
  expect(report.narrow.position === 'fixed' && report.narrow.sheetTranscript && report.narrow.compactBubble && report.narrow.liveRegions === 1, 'narrow: bottom sheet, one live region')
  await narrow.close()
}

await browser.close()
expect(report.errors.length === 0, 'no console errors')
report.ok = report.failures.length === 0
finish(report.ok ? 0 : 1)
