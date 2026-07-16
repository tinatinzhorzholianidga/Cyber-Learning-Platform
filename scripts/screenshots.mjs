// Capture review screenshots of key pages (desktop + mobile, EN + KA).
// Usage: node scripts/screenshots.mjs <baseURL> <outDir>
// Expects `vite preview` (or dev) already serving the app at baseURL.
import { chromium } from 'playwright-core'

const base = process.argv[2] || 'http://localhost:4173/Cyber-Learning-Platform/'
const outDir = process.argv[3] || 'shots'

const PAGES = [
  ['welcome', '#/'],
  ['parents-hub', '#/parents'],
  ['article-a3', '#/parents/a3'],
  ['agreement', '#/parents/agreement'],
  ['guardians-map', '#/guardians'],
  ['mission-g1', '#/guardians/mission/g1'],
]

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })

async function shoot(lang, viewport, suffix) {
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  await page.goto(base + '#/', { waitUntil: 'networkidle' })
  await page.evaluate((l) => localStorage.setItem('cyberhero.lang', l), lang)
  for (const [name, hash] of PAGES) {
    await page.goto(base + hash, { waitUntil: 'networkidle' })
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    await page.screenshot({ path: `${outDir}/${name}-${lang}${suffix}.png`, fullPage: name !== 'welcome' })
  }
  await ctx.close()
}

await shoot('en', { width: 1280, height: 800 }, '')
await shoot('ka', { width: 1280, height: 800 }, '')
await shoot('ka', { width: 375, height: 720 }, '-mobile')

await browser.close()
console.log('screenshots written to', outDir)
