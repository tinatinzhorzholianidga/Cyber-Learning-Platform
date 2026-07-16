// Runtime smoke test: renders every article and mission in both languages,
// starts each mission's first round, and fails on any console error.
// Usage: node scripts/smoke.mjs [baseURL]
import { chromium } from 'playwright-core'

const base = process.argv[2] || 'http://localhost:4173/Cyber-Learning-Platform/'
const ARTICLES = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'b1', 'b2', 'b3', 'b4', 'b5', 'c1', 'c2', 'c3', 'c4']
const MISSIONS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9']

let failures = 0
const fail = (msg) => {
  failures++
  console.log('FAIL', msg)
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const ctx = await browser.newContext()
const page = await ctx.newPage()
const consoleErrors = []
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text())
})
page.on('pageerror', (e) => consoleErrors.push(String(e)))

async function go(hash) {
  await page.goto(base + hash, { waitUntil: 'networkidle' })
}

for (const lang of ['en', 'ka']) {
  await go('#/')
  await page.evaluate((l) => localStorage.setItem('cyberhero.lang', l), lang)
  await page.reload({ waitUntil: 'networkidle' })

  // articles
  for (const id of ARTICLES) {
    await go(`#/parents/${id}`)
    const h1 = await page.textContent('.article-paper h1').catch(() => null)
    if (!h1 || h1.trim().length < 4) fail(`${lang} article ${id}: missing h1`)
    const bodyLen = await page.evaluate(() => document.querySelector('.article-body')?.textContent.length || 0)
    if (bodyLen < 1500) fail(`${lang} article ${id}: body too short in DOM (${bodyLen} chars)`)
  }

  // agreement
  await go('#/parents/agreement')
  const clauses = await page.$$eval('.sheet .clause', (els) => els.length)
  if (clauses < 10) fail(`${lang} agreement: only ${clauses} clauses`)

  // missions: brief -> begin -> first round visible
  for (const id of MISSIONS) {
    await go(`#/guardians/mission/${id}`)
    const begin = await page.$('.brief-card .btn-solid')
    if (!begin) {
      fail(`${lang} mission ${id}: no begin button`)
      continue
    }
    await begin.click()
    await page.waitForTimeout(150)
    const round = await page.$('.play-card, .brief-card')
    const interactive = await page.$$eval('.play-card button', (els) => els.length).catch(() => 0)
    if (!round || interactive === 0) fail(`${lang} mission ${id}: first round did not render interactive controls`)
  }

  // g10 must be locked (redirects to map) while g1-g9 incomplete
  await go('#/guardians/mission/g10')
  await page.waitForTimeout(200)
  if (page.url().includes('mission/g10')) fail(`${lang}: g10 not locked with empty progress`)

  // certificate must redirect without progress
  await go('#/guardians/certificate')
  await page.waitForTimeout(200)
  if (page.url().includes('certificate')) fail(`${lang}: certificate page not guarded`)
}

// play g1 fully through round 1 (choice) to validate scoring pipeline
await go('#/guardians/mission/g1')
await page.click('.brief-card .btn-solid')
await page.waitForTimeout(100)
await page.click('.choice-list .choice-btn:nth-child(2)') // correct for round 1
await page.waitForTimeout(100)
const feedback = await page.$('.feedback.ok')
if (!feedback) fail('g1 round 1: correct answer did not show ok feedback')

const realErrors = consoleErrors.filter((e) => !e.includes('favicon'))
if (realErrors.length) fail(`console errors: ${realErrors.slice(0, 5).join(' | ')}`)

await browser.close()
console.log(failures ? `${failures} failure(s)` : 'SMOKE OK')
process.exit(failures ? 1 : 0)
