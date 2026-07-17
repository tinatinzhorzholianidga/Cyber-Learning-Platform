// Capture review screenshots of Byte, the mascot demo (states + EN/KA + mobile).
// Usage: node scripts/mascot-screenshots.mjs <baseURL> <outDir>
// Expects `vite preview` (or dev) already serving the app at baseURL.
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright-core'

const base = process.argv[2] || 'http://localhost:4173/Cyber-Learning-Platform/'
const outDir = process.argv[3] || 'shots-mascot'
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  // software WebGL so the 3D canvas renders in headless CI containers
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})

const page = await browser.newPage({ viewport: { width: 1280, height: 960 } })
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message))
page.on('console', (m) => {
  if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text())
})

await page.goto(base + '#/', { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.setItem('cyberhero.lang', 'en'))
await page.goto(base + '#/mascot-demo', { waitUntil: 'networkidle' })
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(2600)
await page.screenshot({ path: `${outDir}/demo-en.png` })

const stage = page.locator('.mascot-stage')
await stage.screenshot({ path: `${outDir}/stage-happy.png` })

for (const [btn, name] of [
  ['Excited', 'excited'],
  ['Celebrating', 'celebrate'],
  ['Thinking', 'thinking'],
  ['Sleepy', 'sleepy'],
]) {
  await page.getByRole('button', { name: btn, exact: true }).click()
  await page.waitForTimeout(2400) // let the reaction overlay fade back to the chosen mood
  await stage.screenshot({ path: `${outDir}/stage-${name}.png` })
}
await page.getByRole('button', { name: 'Happy', exact: true }).click()

await page.getByRole('button', { name: 'Wave', exact: true }).click()
await page.waitForTimeout(700) // mid-wave
await stage.screenshot({ path: `${outDir}/stage-wave.png` })
await page.waitForTimeout(2000)

await page.getByRole('button', { name: /Give me a tip/i }).click()
await page.waitForTimeout(1700)
await stage.screenshot({ path: `${outDir}/stage-tip.png` })

await page.getByRole('button', { name: /Show him as he will appear/i }).click()
await page.waitForTimeout(1500)
await page.screenshot({ path: `${outDir}/widget-preview.png` })
await page.getByRole('button', { name: /Show him as he will appear/i }).click() // widget off again

// ---- Hero, the hooded guardian ----
await page.getByRole('button', { name: /Hero|გმირა/ }).click()
await page.waitForTimeout(2600)
await page.screenshot({ path: `${outDir}/hero-demo.png` })
await stage.screenshot({ path: `${outDir}/hero-happy.png` })

for (const [btn, name] of [
  ['Thinking', 'thinking'],
  ['Sleepy', 'resting'],
  ['Funny', 'funny'],
  ['Celebrating', 'celebrate'],
]) {
  await page.getByRole('button', { name: btn, exact: true }).click()
  await page.waitForTimeout(2600)
  await stage.screenshot({ path: `${outDir}/hero-${name}.png` })
}
await page.getByRole('button', { name: 'Happy', exact: true }).click()
await page.getByRole('button', { name: 'Wave', exact: true }).click()
await page.waitForTimeout(700)
await stage.screenshot({ path: `${outDir}/hero-wave.png` })
await page.waitForTimeout(2000)

await page.getByRole('button', { name: /Simulate a completed mission/i }).click()
await page.waitForTimeout(1400)
await stage.screenshot({ path: `${outDir}/hero-reaction.png` })
await page.waitForTimeout(4200)
await page.getByRole('button', { name: /IO|იო/ }).click() // back to the robot

await page.evaluate(() => localStorage.setItem('cyberhero.lang', 'ka'))
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(2400)
await page.screenshot({ path: `${outDir}/demo-ka.png` })

await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(900)
await page.screenshot({ path: `${outDir}/demo-ka-mobile.png`, fullPage: true })

await browser.close()
console.log('mascot screenshots written to', outDir)
