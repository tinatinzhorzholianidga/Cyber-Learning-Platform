import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildSystemInstruction, platformFacts } from '../src/voice/tutor/persona.js'
import { UI } from '../src/i18n/ui.js'
import { HINTS } from '../src/content/hints.js'

test('the persona source types no numbers of three digits or more', () => {
  const src = readFileSync(new URL('../src/voice/tutor/persona.js', import.meta.url), 'utf8')
  assert.equal(src.match(/\d{3,}/), null)
})

test('facts come from hints.js and ui.js in the session language', () => {
  const ka = platformFacts('ka')
  assert.ok(ka.includes(HINTS.basicCourse[3].ka))
  assert.ok(ka.some((l) => l.includes(UI.ka.basic.url)))
  assert.ok(ka.some((l) => l.includes(UI.ka.loginUrl)))
  const en = platformFacts('en')
  assert.ok(en.some((l) => l.includes('10 missions')))
  assert.ok(!en.some((l) => /[ა-ჰ]/.test(l)), 'no Georgian in the English facts')
})

test('the system instruction names the language, the register and the facts', () => {
  const ka = buildSystemInstruction({ lang: 'ka' })
  assert.match(ka, /Reply in Georgian/)
  assert.match(ka, /თქვენ/)
  assert.match(ka, /ორმაგი ავთენტიფიკაცია/)
  assert.match(ka, /PLATFORM FACTS \(Georgian/)
  assert.ok(ka.includes(UI.ka.kids.url))
  const en = buildSystemInstruction({ lang: 'en' })
  assert.match(en, /Reply in English only/)
  assert.ok(en.includes(HINTS.certificate[0].en))
  const custom = buildSystemInstruction({ lang: 'en', facts: ['only this'] })
  assert.ok(custom.endsWith('- only this'))
})
