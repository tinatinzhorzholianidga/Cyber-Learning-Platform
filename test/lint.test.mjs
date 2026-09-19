import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lintPair, MAX_LEN } from '../scripts/lib/lint.mjs'

const clean = { ka: 'მე იო ვარ — თქვენი გზამკვლევი. „შესვლა“ ზემოთ მარჯვნივაა.', en: "I'm IO — your guide. Log in is top right." }

test('a clean pair has no findings', () => {
  assert.deepEqual(lintPair('x', clean), { errors: [], warnings: [] })
})

test('missing language is an error and skips the other rules for it', () => {
  const r = lintPair('greeting[0]', { ka: clean.ka })
  assert.deepEqual(r.errors, ['greeting[0].en: missing'])
  assert.deepEqual(lintPair('x', { ka: '   ', en: 'ok' }).errors, ['x.ka: missing'])
})

test('length and emoji limits are warnings', () => {
  const long = 'ა'.repeat(MAX_LEN + 1)
  const r = lintPair('x', { ka: long, en: 'ok 🤖 👋' })
  assert.deepEqual(r.errors, [])
  // languages are reported en first, ka second - the order check-hints.mjs has always used
  assert.deepEqual(r.warnings, ['x.en: 2 emoji', `x.ka: ${MAX_LEN + 1} chars (> ${MAX_LEN})`])
  assert.deepEqual(lintPair('x', { ka: 'ა 🤖', en: 'b 👋' }, { emojiMax: 0 }).warnings, ['x.en: 1 emoji', 'x.ka: 1 emoji'])
})

test('tip words warn only when asked', () => {
  const pair = { ka: 'შეცვალეთ პაროლი.', en: 'Change your password.' }
  assert.deepEqual(lintPair('x', pair).warnings, [])
  assert.deepEqual(lintPair('x', pair, { tipCheck: true }).warnings, [
    'x.en: looks like a cyber tip - "Change your password."',
    'x.ka: looks like a cyber tip - "შეცვალეთ პაროლი."',
  ])
})

test('Latin letters in Georgian warn unless allowed', () => {
  assert.deepEqual(lintPair('x', { ka: 'გადადით CyberHero-ზე, DGA და elearning.gov.ge', en: 'ok' }).warnings, [])
  assert.deepEqual(lintPair('x', { ka: 'დააჭირეთ Talk', en: 'ok' }).warnings, ['x.ka: contains Latin letters - "დააჭირეთ Talk"'])
  assert.deepEqual(lintPair('x', { ka: 'გახსენით Edge', en: 'ok' }, { latinAllow: ['Edge'] }).warnings, [])
})

test('typography: hyphen as dash, quotes and three dots', () => {
  assert.deepEqual(lintPair('x', { ka: 'ა - ბ', en: 'a - b' }).errors, ['x.en: hyphen used as a dash - write " — "', 'x.ka: hyphen used as a dash - write " — "'])
  assert.deepEqual(lintPair('x', { ka: 'ღილაკი "შესვლა"', en: 'ok' }).errors, ['x.ka: use Georgian quotes „…“ - "ღილაკი "შესვლა""'])
  assert.deepEqual(lintPair('x', { ka: 'ღილაკი „შესვლა', en: 'ok' }).errors, ['x.ka: use Georgian quotes „…“ - "ღილაკი „შესვლა"'])
  assert.deepEqual(lintPair('x', { ka: 'ვფიქრობ...', en: 'Thinking...' }).errors, [])
  assert.deepEqual(lintPair('x', { ka: 'ვფიქრობ...', en: 'Thinking…' }, { noDots: true }).errors, ['x.ka: three dots - use the single … character'])
})
