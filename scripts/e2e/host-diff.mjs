#!/usr/bin/env node
/* Host mode before/after (docs/io-voice-plan.md §7.1 D2 acceptance, §8
   "IO's look unchanged"). Screenshots two served builds with reduced
   motion (a still face, no idle bob, the greeting typed at once) on both
   skins, diffs the pixels inside the browser and prints the bounding box
   of every difference. Expected: nothing above the Talk button, and the
   box equals the button's box.

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
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const buf = await page.screenshot({ path: `${OUT}/${name}.png` })
  const button = await page.$('.io-talk')
  const hint = await page.$('.io-hint')
  const out = { png: buf.toString('base64'), button: button ? await button.boundingBox() : null, hint: hint ? await hint.boundingBox() : null }
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
    async ({ a, b }) => {
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
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4
          const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2])
          if (d > 24) {
            count += 1
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
          }
        }
      }
      return { count, box: maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } }
    },
    { a: a.png, b: b.png },
  )
  const btn = b.button
  const inside = diff.box && btn && diff.box.x >= Math.floor(btn.x) - 1 && diff.box.y >= Math.floor(btn.y) - 1 && diff.box.x + diff.box.w <= Math.ceil(btn.x + btn.width) + 1 && diff.box.y + diff.box.h <= Math.ceil(btn.y + btn.height) + 1
  const hintSame = JSON.stringify(a.hint) === JSON.stringify(b.hint)
  const ok = diff.count === 0 || (inside && hintSame)
  if (!ok) failed = true
  console.log(JSON.stringify({ skin, ok, differingPixels: diff.count, diffBox: diff.box, talkButton: btn, hintMoved: !hintSame }))
}
await browser.close()
console.log(failed ? 'host-diff: FAILED - host mode changed outside the Talk button' : 'host-diff: ok - only the Talk button differs')
process.exit(failed ? 1 : 0)
