#!/usr/bin/env node
/* Host mode before/after (docs/io-voice-plan.md §7.1 D2 acceptance, §8
   "IO's look unchanged"). Screenshots two served builds with reduced
   motion (a still face, no idle bob, the greeting typed at once) on both
   skins, diffs the pixels inside the browser and prints the bounding box
   of every difference. Expected: nothing differs outside the Talk button,
   IO's box and the hint sit where they were, and inside IO's box at most
   0.5 % of the pixels differ (the metal skin's chrome rivets show a few
   specular sparkles that move with sub-pixel rounding between otherwise
   identical renders; the classic skin matches exactly).

   Needs: playwright-core (devDependency) and a Chromium it can launch -
   `npx playwright-core install chromium`, or PW_CHROMIUM=<path to a
   headless shell>. Serve the two builds first, e.g.
     git worktree add ../io-before IO-for-main-page && (cd ../io-before && npm ci && npm run build && npx vite preview --port 4174)
     npm run build && npx vite preview --port 4173
   Usage: IO_BEFORE=http://localhost:4174/IO-for-main-page/ IO_AFTER=http://localhost:4173/IO-for-main-page/ node scripts/e2e/host-diff.mjs */
import { chromium } from 'playwright-core'

const BEFORE = process.env.IO_BEFORE || 'http://localhost:4174/IO-for-main-page/'
const AFTER = process.env.IO_AFTER || 'http://localhost:4173/IO-for-main-page/'
const OUT = process.env.IO_SHOTS || '.' // screenshots go here (gitignored bakeoff/ is a good choice)
const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || undefined,
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
})

async function shot(url, name) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, reducedMotion: 'reduce' })
  // the host picks his greeting by the time of day and seeds the cycle
  // with the minute: freeze the clock so both builds say the same line
  await page.clock.setFixedTime(new Date('2026-09-19T10:30:00'))
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const buf = await page.screenshot({ path: `${OUT}/${name}.png` })
  const button = await page.$('.io-talk')
  const hint = await page.$('.io-hint')
  const canvas = await page.$('.io-canvas')
  const out = { png: buf.toString('base64'), button: button ? await button.boundingBox() : null, hint: hint ? await hint.boundingBox() : null, canvas: canvas ? await canvas.boundingBox() : null }
  await page.close()
  return out
}

const diffPage = await browser.newPage()
let failed = false
for (const skin of ['classic', 'metal']) {
  const q = skin === 'metal' ? '?skin=metal' : ''
  const a = await shot(BEFORE + q, `host-before-${skin}`)
  const b = await shot(AFTER + q, `host-after-${skin}`)
  const diff = await diffPage.evaluate(
    async ({ a, b, button, canvas }) => {
      const within = (box, x, y) => Boolean(box) && x >= Math.floor(box.x) - 1 && y >= Math.floor(box.y) - 1 && x <= Math.ceil(box.x + box.width) + 1 && y <= Math.ceil(box.y + box.height) + 1
      const load = (b64) =>
        new Promise((resolve) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.src = `data:image/png;base64,${b64}`
        })
      const [ia, ib] = await Promise.all([load(a), load(b)])
      const w = Math.min(ia.width, ib.width)
      const h = Math.min(ia.height, ib.height)
      const pixels = (img) => {
        const c = document.createElement('canvas')
        c.width = w
        c.height = h
        const g = c.getContext('2d')
        g.drawImage(img, 0, 0)
        return g.getImageData(0, 0, w, h).data
      }
      const da = pixels(ia)
      const db = pixels(ib)
      let minX = w
      let minY = h
      let maxX = -1
      let maxY = -1
      let count = 0
      let inButton = 0
      let inCanvas = 0
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4
          const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2])
          if (d > 24) {
            count += 1
            if (within(button, x, y)) inButton += 1
            else if (within(canvas, x, y)) inCanvas += 1
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
          }
        }
      }
      return { count, inButton, inCanvas, elsewhere: count - inButton - inCanvas, box: maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } }
    },
    { a: a.png, b: b.png, button: b.button, canvas: b.canvas },
  )
  const btn = b.button
  const hintSame = JSON.stringify(a.hint) === JSON.stringify(b.hint)
  const canvasSame = JSON.stringify(a.canvas) === JSON.stringify(b.canvas)
  const canvasArea = b.canvas ? b.canvas.width * b.canvas.height : 0
  const sparkle = canvasArea ? diff.inCanvas / canvasArea : 1
  const ok = diff.elsewhere === 0 && hintSame && canvasSame && sparkle <= 0.005
  if (!ok) failed = true
  console.log(JSON.stringify({ skin, ok, differingPixels: diff.count, inButton: diff.inButton, inCanvas: diff.inCanvas, elsewhere: diff.elsewhere, canvasSparkle: `${(sparkle * 100).toFixed(2)}%`, diffBox: diff.box, talkButton: btn, canvasBox: b.canvas, hintMoved: !hintSame, canvasMoved: !canvasSame }))
}
await browser.close()
console.log(failed ? 'host-diff: FAILED - host mode changed outside the Talk button' : 'host-diff: ok - only the Talk button differs (plus sub-pixel sparkle inside IO\'s box at most)')
process.exit(failed ? 1 : 0)
