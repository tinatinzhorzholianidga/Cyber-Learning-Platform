/* Sanity checks for IO's main-page lines (src/content/hints.js):
   every key present, en/ka parity, bubble-friendly length, at most one
   emoji per line, and a soft warning when a line looks like a
   cyber-security tip (which belongs inside the courses, not here). */
import { HINTS } from '../src/content/hints.js'

const REQUIRED = {
  greeting: 1, whoAmI: 1, pickPath: 1, basicCourse: 1, kidsPlatform: 1, login: 1, certificate: 1,
  language: 1, aboutDga: 1, encouragement: 1, hoverBasic: 1, hoverKids: 1, morning: 1, afternoon: 1,
  evening: 1, farewell: 1,
}
const MAX_LEN = 110
const TIP_WORDS = /(პაროლ|ფიშინგ|ანტივირუს|password|phishing|antivirus|two-factor|2fa|update your|განაახლ)/i
const EMOJI = /\p{Extended_Pictographic}/gu

let errors = 0
let warnings = 0
const err = (m) => {
  errors += 1
  console.log('  error', m)
}
const warn = (m) => {
  warnings += 1
  console.log('  warn ', m)
}

for (const [key, min] of Object.entries(REQUIRED)) {
  const pool = HINTS[key]
  if (!Array.isArray(pool) || pool.length < min) {
    err(`${key}: expected at least ${min} line(s)`)
    continue
  }
  pool.forEach((line, i) => {
    for (const l of ['en', 'ka']) {
      const s = line[l]
      if (typeof s !== 'string' || !s.trim()) {
        err(`${key}[${i}].${l}: missing`)
        continue
      }
      if (s.length > MAX_LEN) warn(`${key}[${i}].${l}: ${s.length} chars (> ${MAX_LEN})`)
      const emojis = s.match(EMOJI) || []
      if (emojis.length > 1) warn(`${key}[${i}].${l}: ${emojis.length} emoji`)
      if (key !== 'basicCourse' && TIP_WORDS.test(s)) warn(`${key}[${i}].${l}: looks like a cyber tip - "${s}"`)
    }
    // Latin letters inside a Georgian line are usually a leaked
    // translation (brand names like CyberHero / English are allowed)
    const stripped = line.ka.replace(/English|CyberHero|IO|DGA|elearning\.gov\.ge/g, '')
    if (/[a-z]/i.test(stripped)) warn(`${key}[${i}].ka: contains Latin letters - "${line.ka}"`)
  })
}

console.log(`\n${errors} error(s), ${warnings} warning(s)`)
process.exit(errors ? 1 : 0)
