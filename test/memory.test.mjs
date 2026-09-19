import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  PROFILE_KEY, MAX_SESSIONS, MAX_SUMMARY, emptyProfile, loadProfile, saveProfile, touchProfile, isReturning,
  setName, recordSkill, addSession, forgetProfile, weakestSkills, lastTopic, summarise,
} from '../src/voice/tutor/memory.js'

/* a localStorage for Node: the same surface the browser gives */
function fakeStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
    get length() {
      return map.size
    },
  }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: fakeStorage(), configurable: true, writable: true })
  forgetProfile()
})
afterEach(() => {
  forgetProfile()
  delete globalThis.localStorage
})

test("a first visit creates the brief's schema under io.learner.v1", () => {
  assert.equal(loadProfile(), null)
  assert.equal(isReturning(), false)
  const p = touchProfile('ka')
  assert.deepEqual(Object.keys(p), ['v', 'name', 'lang', 'createdAt', 'lastSeenAt', 'skills', 'sessions'])
  assert.equal(p.v, 1)
  assert.equal(p.name, null)
  assert.equal(p.lang, 'ka')
  assert.deepEqual(p.skills, {})
  assert.deepEqual(p.sessions, [])
  assert.match(p.createdAt, /^\d{4}-\d{2}-\d{2}T/)
  assert.deepEqual(JSON.parse(localStorage.getItem(PROFILE_KEY)), p)
  assert.equal(summarise('ka'), '')
  // a second visit keeps the profile and refreshes the language and the time
  const again = touchProfile('en')
  assert.equal(again.createdAt, p.createdAt)
  assert.equal(again.lang, 'en')
})

test('sessions are capped at ten, summaries at 300 characters, skills at known ids', () => {
  for (let i = 1; i <= 12; i++) addSession({ summary_ka: `სესია ${i}`, summary_en: `session ${i}`, skills: ['phishing', 'nope'] })
  const p = loadProfile()
  assert.equal(p.sessions.length, MAX_SESSIONS)
  assert.equal(p.sessions[0].summary_ka, 'სესია 3')
  assert.equal(p.sessions.at(-1).summary_en, 'session 12')
  assert.deepEqual(p.sessions[0].skills, ['phishing'])
  assert.equal(isReturning(), true)
  const long = addSession({ summary_ka: 'ა'.repeat(500), summary_en: 'b'.repeat(500) })
  assert.equal(long.summary_ka.length, MAX_SUMMARY)
  assert.equal(long.summary_en.length, MAX_SUMMARY)
})

test('recordSkill clamps the level to 0..3, keeps short evidence and ignores unknown skills', () => {
  assert.equal(recordSkill({ skill: 'phishing', level: 7, evidence: 'x'.repeat(200) }).level, 3)
  assert.equal(loadProfile().skills.phishing.evidence.length, 120)
  assert.equal(recordSkill({ skill: 'passwords', level: -2 }).level, 0)
  assert.equal(recordSkill({ skill: 'two_factor', level: 1.6 }).level, 2)
  assert.equal(recordSkill({ skill: 'hacking', level: 3 }), null)
  assert.deepEqual(Object.keys(loadProfile().skills), ['phishing', 'passwords', 'two_factor'])
})

test('setName keeps a first name only when it looks like one', () => {
  assert.equal(setName('ნინო გელაშვილი').name, 'ნინო')
  assert.equal(setName('Anna-Maria K.').name, 'Anna-Maria')
  assert.equal(setName('12345').name, 'Anna-Maria', 'digits are not a name')
  assert.equal(setName('x').name, 'Anna-Maria', 'one letter is not a name')
  assert.equal(setName('').name, 'Anna-Maria')
})

test('summarise names the last session and the two weakest skills within 300 characters', () => {
  recordSkill({ skill: 'phishing', level: 1 })
  recordSkill({ skill: 'passwords', level: 0 })
  recordSkill({ skill: 'two_factor', level: 3 })
  addSession({ summary_ka: 'ფიშინგზე ვისაუბრეთ.', summary_en: 'We talked about phishing.', skills: ['phishing'] })
  setName('ნინო')
  const ka = summarise('ka')
  assert.equal(ka, 'Name: ნინო. Returning learner, 1 previous session. Last time: ფიშინგზე ვისაუბრეთ. Weakest skills: passwords (level 0), phishing (level 1).')
  assert.match(summarise('en'), /Last time: We talked about phishing\./)
  assert.deepEqual(weakestSkills(), [
    { id: 'passwords', level: 0 },
    { id: 'phishing', level: 1 },
  ])
  addSession({ summary_ka: 'ძ'.repeat(300), summary_en: 'e'.repeat(300), skills: [] })
  const long = summarise('ka')
  assert.ok(long.length <= MAX_SUMMARY)
  assert.ok(long.endsWith('…'))
  // English falls back to the Georgian summary when the English one is empty
  addSession({ summary_ka: 'მხოლოდ ქართულად', summary_en: '' })
  assert.match(summarise('en'), /Last time: მხოლოდ ქართულად/)
})

test('lastTopic gives the -ზე form in Georgian and the English name', () => {
  assert.equal(lastTopic(loadProfile(), 'ka', 'on'), null)
  addSession({ summary_ka: 'x', summary_en: 'x', skills: ['phishing', 'passwords'] })
  assert.equal(lastTopic(loadProfile(), 'ka', 'on'), 'ფიშინგზე')
  assert.equal(lastTopic(loadProfile(), 'ka'), 'ფიშინგზე')
  assert.equal(lastTopic(loadProfile(), 'en', 'on'), 'phishing')
  addSession({ summary_ka: 'x', summary_en: 'x', skills: [] })
  assert.equal(lastTopic(loadProfile(), 'ka', 'on'), null)
})

test('forgetProfile removes the profile and leaves io.lang alone', () => {
  localStorage.setItem('io.lang', 'en')
  touchProfile('en')
  addSession({ summary_ka: 'x', summary_en: 'x' })
  forgetProfile()
  assert.equal(localStorage.getItem(PROFILE_KEY), null)
  assert.equal(localStorage.getItem('io.lang'), 'en')
  assert.equal(loadProfile(), null)
  assert.equal(isReturning(), false)
  assert.equal(summarise('en'), '')
})

test('blocked storage falls back to an in-memory profile for the page', () => {
  Object.defineProperty(globalThis, 'localStorage', {
    get() {
      throw new Error('blocked')
    },
    configurable: true,
  })
  const p = touchProfile('ka')
  assert.equal(p.v, 1)
  recordSkill({ skill: 'backups', level: 2 })
  assert.equal(loadProfile().skills.backups.level, 2)
  addSession({ summary_ka: 'სარეზერვო ასლები', summary_en: 'backups', skills: ['backups'] })
  assert.equal(isReturning(), true)
  forgetProfile()
  assert.equal(loadProfile(), null)
  // a corrupt value is ignored, never thrown
  Object.defineProperty(globalThis, 'localStorage', { value: fakeStorage(), configurable: true, writable: true })
  localStorage.setItem(PROFILE_KEY, '{not json')
  assert.equal(loadProfile(), null)
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ v: 2 }))
  assert.equal(loadProfile(), null)
  assert.equal(saveProfile(emptyProfile('en')).lang, 'en')
})
