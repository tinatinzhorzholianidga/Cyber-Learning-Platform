import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildSystemInstruction, platformFacts } from '../src/voice/tutor/persona.js'
import { TOOL_NAMES } from '../src/voice/tutor/tools.js'
import { UI } from '../src/i18n/ui.js'
import { HINTS } from '../src/content/hints.js'

test('the persona source types no numbers of three digits or more', () => {
  const src = readFileSync(new URL('../src/voice/tutor/persona.js', import.meta.url), 'utf8')
  assert.equal(src.match(/\d{3,}/), null)
  assert.ok(!src.includes('...'))
  assert.equal((src.match(/„/g) || []).length, (src.match(/“/g) || []).length, 'Georgian quotes balanced')
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
  assert.match(ka, /You speak Georgian \(ქართული\) by default in the polite plural \(თქვენ\)/)
  assert.match(ka, /ორმაგი ავთენტიფიკაცია/)
  assert.match(ka, /PLATFORM FACTS \(Georgian/)
  assert.ok(ka.includes(UI.ka.kids.url))
  const en = buildSystemInstruction({ lang: 'en' })
  assert.match(en, /You speak English by default/)
  assert.ok(en.includes(HINTS.certificate[0].en))
  const custom = buildSystemInstruction({ lang: 'en', facts: ['only this'] })
  assert.ok(custom.includes('- only this'))
})

test("the brief's Georgian examples and refusal are quoted verbatim", () => {
  const ka = buildSystemInstruction({ lang: 'ka' })
  assert.ok(ka.includes('„ფიშინგი თაღლითობაა: ვინმე სანდო ორგანიზაციად ასაღებს თავს, რომ პაროლი ან ფული გამოგტყუოთ. თქვენ თუ მიგიღიათ წერილი, სადაც სასწრაფოდ რაღაცის გაკეთებას გთხოვდნენ?“'))
  assert.ok(ka.includes('„ახლოს ხართ! დავფიქრდეთ: ბმულზე დაწკაპუნებამდე რას შეამოწმებდით?“'))
  assert.ok(ka.includes('„ზუსტად ასეა!“'))
  assert.ok(ka.includes('„ამაზე ვერ დაგეხმარებით — მე კიბერუსაფრთხოების გზამკვლევი ვარ. სამაგიეროდ, თუ გსურთ, უსაფრთხო პაროლებზე ვისაუბროთ?“'))
  assert.ok(ka.includes('„გასულ ჯერზე ფიშინგზე ვისაუბრეთ…“'))
  assert.match(ka, /Never help with hacking, bypassing controls, spying on someone or phishing others/)
  assert.match(ka, /Never ask for a surname, school, address, phone number, password or code/)
})

test('the learner block, the tools block and the safety fallback', () => {
  const first = buildSystemInstruction({ lang: 'ka' })
  assert.match(first, /LEARNER\nFirst visit: nothing is known yet\./)
  const back = buildSystemInstruction({ lang: 'ka', learner: 'Returning learner, 2 previous sessions. Weakest skills: passwords (level 0).' })
  assert.match(back, /LEARNER\nReturning learner, 2 previous sessions\. Weakest skills: passwords \(level 0\)\.\nOffer practice on the two weakest skills first\./)
  for (const name of TOOL_NAMES) assert.ok(first.includes(name), name)
  assert.match(first, /Skills you may name in ask_quiz and record_skill: passwords \(passwords \/ პაროლები\)/)
  // safety.js still holds placeholders: no organisation and no number is read
  assert.match(first, /Resources will be added by the agency; until then name no organisation or number/)
  assert.ok(!first.includes('{{'))
  assert.ok(!first.includes('localStorage'))
})

test('text tools for the local backend, Live rules for the Live session', () => {
  const plain = buildSystemInstruction({ lang: 'en', mode: 'browser' })
  assert.ok(!plain.includes('@@tool'))
  assert.ok(!plain.includes('session_started'))
  const tags = buildSystemInstruction({ lang: 'en', mode: 'browser', textTools: true })
  assert.match(tags, /TOOLS \(text convention\)/)
  assert.match(tags, /@@tool <name> <json arguments>/)
  const live = buildSystemInstruction({ lang: 'ka', mode: 'live' })
  assert.match(live, /LIVE SESSION EVENTS/)
  assert.match(live, /session_started/)
  assert.match(live, /session_idle/)
  assert.match(buildSystemInstruction({ lang: 'ka', mode: 'turn', live: true }), /session_started/)
  assert.ok(!buildSystemInstruction({ lang: 'ka', mode: 'live', live: false }).includes('session_started'))
})
