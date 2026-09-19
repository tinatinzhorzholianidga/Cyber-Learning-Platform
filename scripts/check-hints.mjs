/* Sanity checks for IO's main-page lines (src/content/hints.js):
   every key present, en/ka parity, bubble-friendly length, at most one
   emoji per line, dash/quote typography, and a soft warning when a line
   looks like a cyber-security tip (which belongs inside the courses,
   not here). The rules themselves live in scripts/lib/lint.mjs so the
   talk-mode strings are checked with the same regexes. */
import { HINTS } from '../src/content/hints.js'
import { lintPair, createReporter } from './lib/lint.mjs'

const REQUIRED = {
  greeting: 1, whoAmI: 1, pickPath: 1, basicCourse: 1, kidsPlatform: 1, login: 1, certificate: 1,
  language: 1, aboutDga: 1, encouragement: 1, hoverBasic: 1, hoverKids: 1, morning: 1, afternoon: 1,
  evening: 1, farewell: 1,
}

const report = createReporter()

for (const [key, min] of Object.entries(REQUIRED)) {
  const pool = HINTS[key]
  if (!Array.isArray(pool) || pool.length < min) {
    report.err(`${key}: expected at least ${min} line(s)`)
    continue
  }
  pool.forEach((line, i) => {
    // the tip-word warning is skipped for the Basic Course lines, which
    // may name what the course teaches
    report.apply(lintPair(`${key}[${i}]`, line, { tipCheck: key !== 'basicCourse' }))
  })
}

report.finish()
