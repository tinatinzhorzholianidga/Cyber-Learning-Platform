import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SKILLS, SKILL_IDS, skillById, MAX_LEVEL, skillName, skillsForPrompt } from '../src/voice/tutor/skills.js'

test('thirteen skills with unique ids and both names', () => {
  assert.equal(SKILLS.length, 13)
  assert.equal(new Set(SKILL_IDS).size, 13)
  assert.deepEqual(
    SKILL_IDS,
    ['passwords', 'two_factor', 'phishing', 'scams', 'social_engineering', 'privacy_settings', 'cyberbullying', 'safe_browsing', 'device_security', 'backups', 'disinformation', 'ai_threats', 'incident_reporting'],
  )
  for (const s of SKILLS) {
    assert.match(s.id, /^[a-z][a-z_]+$/)
    assert.ok(s.ka.trim() && s.en.trim() && s.kaOn.trim(), s.id)
    assert.ok(s.kaOn.endsWith('ზე'), `${s.id}: kaOn is the -ზე form`)
    assert.ok(!/[a-z]/i.test(s.ka), `${s.id}: no Latin in the Georgian name`)
    assert.ok(Array.isArray(s.courseRef.basic) && Array.isArray(s.courseRef.mission) && Array.isArray(s.courseRef.guide), s.id)
    for (const n of s.courseRef.basic) assert.ok(Number.isInteger(n) && n >= 1 && n <= 10, `${s.id}: basic topic ${n}`)
    for (const id of s.courseRef.mission) assert.match(id, /^g\d+$/)
    for (const id of s.courseRef.guide) assert.match(id, /^[abc]\d+$/)
  }
  assert.equal(MAX_LEVEL, 3)
  assert.equal(skillById.phishing.ka, 'ფიშინგი')
})

test('every Basic Course topic (1..10) is covered by at least one skill', () => {
  const covered = new Set(SKILLS.flatMap((s) => s.courseRef.basic))
  for (let n = 1; n <= 10; n++) assert.ok(covered.has(n), `topic ${n}`)
})

test('skillName gives the nominative, the -ზე form and the English name', () => {
  assert.equal(skillName('two_factor', 'ka'), 'ორმაგი ავთენტიფიკაცია')
  assert.equal(skillName('two_factor', 'ka', 'on'), 'ორმაგ ავთენტიფიკაციაზე')
  assert.equal(skillName('two_factor', 'en', 'on'), 'two-factor authentication')
  assert.equal(skillName('unknown', 'ka'), 'unknown')
})

test('skillsForPrompt lists id, English and Georgian for the model', () => {
  const text = skillsForPrompt()
  assert.ok(text.includes('phishing (phishing / ფიშინგი)'))
  assert.equal(text.split(', ').length, 13)
})
