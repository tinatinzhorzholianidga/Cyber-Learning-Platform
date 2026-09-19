import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DECLARATIONS, TOOL_NAMES, MOODS, DIAGRAMS, LIVE_BEHAVIOR, LIVE_SCHEDULING, geminiTools, validateArgs, runTool, parseToolTag, splitToolTags, textToolInstructions,
} from '../src/voice/tutor/tools.js'
import { SKILL_IDS } from '../src/voice/tutor/skills.js'

test("the seven declarations of the brief's Phase 5, in that order", () => {
  assert.deepEqual(TOOL_NAMES, ['set_mood', 'show_card', 'ask_quiz', 'record_skill', 'lookup_course_material', 'navigate_to_path', 'end_session'])
  for (const d of DECLARATIONS) {
    assert.equal(d.parameters.type, 'OBJECT')
    for (const key of d.parameters.required) assert.ok(key in d.parameters.properties, `${d.name}.${key}`)
  }
  assert.deepEqual(DECLARATIONS[0].parameters.properties.mood.enum, MOODS)
  assert.deepEqual(DECLARATIONS[2].parameters.properties.skill.enum, SKILL_IDS)
  assert.deepEqual(DECLARATIONS[6].parameters.properties.skills.items.enum, SKILL_IDS)
  assert.deepEqual(DIAGRAMS, ['phishing_email', 'password_strength', 'two_factor_flow'])
})

test('geminiTools wraps the declarations; the Live variant adds the behaviours', () => {
  const plain = geminiTools()
  assert.equal(plain.length, 1)
  assert.equal(plain[0].functionDeclarations.length, 7)
  assert.equal(plain[0].functionDeclarations[0].behavior, undefined)
  const live = geminiTools({ live: true })
  assert.equal(live[0].functionDeclarations[0].behavior, 'NON_BLOCKING')
  assert.equal(live[0].functionDeclarations.find((d) => d.name === 'lookup_course_material').behavior, 'BLOCKING')
  for (const name of TOOL_NAMES) assert.ok(['BLOCKING', 'NON_BLOCKING'].includes(LIVE_BEHAVIOR[name]), name)
  for (const name of Object.keys(LIVE_SCHEDULING)) assert.equal(LIVE_BEHAVIOR[name], 'NON_BLOCKING', `${name} scheduling on a non-blocking tool`)
})

test('validateArgs checks required, types, enums and the per-tool rules', () => {
  assert.deepEqual(validateArgs('nope', {}), { ok: false, errors: ['unknown tool nope'] })
  assert.deepEqual(validateArgs('set_mood', {}), { ok: false, errors: ['mood is required'] })
  assert.deepEqual(validateArgs('set_mood', { mood: 'angry' }).errors, ['mood must be one of happy, wink, thinking, excited, celebrate, surprised'])
  assert.deepEqual(validateArgs('set_mood', { mood: 'wink', extra: 1 }).errors, ['extra is not a parameter'])
  assert.equal(validateArgs('set_mood', { mood: 'wink' }).ok, true)
  const quiz = { scenario: 'ს', options: ['ა', 'ბ', 'გ'], correctIndex: 1, skill: 'phishing' }
  assert.equal(validateArgs('ask_quiz', quiz).ok, true)
  assert.deepEqual(validateArgs('ask_quiz', { ...quiz, options: ['ა', 'ბ'] }).errors, ['options must have exactly three entries'])
  assert.deepEqual(validateArgs('ask_quiz', { ...quiz, correctIndex: 3 }).errors, ['correctIndex must be 0, 1 or 2'])
  assert.deepEqual(validateArgs('ask_quiz', { ...quiz, correctIndex: '1' }).errors, ['correctIndex must be an integer'])
  assert.deepEqual(validateArgs('ask_quiz', { ...quiz, skill: 'juggling' }).errors, ['skill must be one of ' + SKILL_IDS.join(', ')])
  assert.deepEqual(validateArgs('show_card', { kind: 'diagram', title: 't', diagram: 'nope' }).errors, ['diagram must be one of phishing_email, password_strength, two_factor_flow', 'diagram must name a shipped diagram'])
  assert.deepEqual(validateArgs('show_card', { kind: 'link', title: 't', url: 'javascript:alert(1)' }).errors, ['url must be an http(s) address'])
  assert.deepEqual(validateArgs('show_card', { kind: 'steps', title: 't' }).errors, ['items are required for steps and checklist'])
  assert.equal(validateArgs('show_card', { kind: 'checklist', title: 't', items: ['ა'] }).ok, true)
  assert.deepEqual(validateArgs('end_session', { summary_ka: 'ა', summary_en: 'b', skills: ['phishing', 'x'] }).errors, ['skills contains x, not one of ' + SKILL_IDS.join(', ')])
  assert.deepEqual(validateArgs('record_skill', { skill: 'phishing', level: 'two' }).errors, ['level must be an integer'])
})

test('runTool: invalid arguments come back as an error response and no effect', async () => {
  const r = await runTool('ask_quiz', { scenario: 'x' }, {})
  assert.equal(r.effect, null)
  assert.match(r.response.error, /options is required/)
  assert.deepEqual(await runTool('unknown', {}, {}), { response: { error: 'unknown tool unknown' }, effect: null })
  assert.match((await runTool('set_mood', 'not an object', {})).response.error, /mood is required/)
})

test('runTool: the face, the board and the quiz', async () => {
  assert.deepEqual(await runTool('set_mood', { mood: 'celebrate' }), { response: { ok: true }, effect: { type: 'mood', mood: 'celebrate' } })
  const card = await runTool('show_card', { kind: 'steps', title: 'ტ'.repeat(100), items: Array.from({ length: 8 }, (_, i) => `ნაბიჯი ${i}`.padEnd(150, 'ა')) })
  assert.equal(card.effect.type, 'card')
  assert.equal(card.effect.card.title.length, 80)
  assert.equal(card.effect.card.items.length, 6)
  assert.equal(card.effect.card.items[0].length, 140)
  assert.deepEqual(card.effect.card, { ...card.effect.card, kind: 'steps', diagram: null, url: null })
  const diagram = await runTool('show_card', { kind: 'diagram', title: 'ფიშინგი', diagram: 'phishing_email' })
  assert.equal(diagram.effect.card.diagram, 'phishing_email')
  const quiz = await runTool('ask_quiz', { scenario: 'წერილი', options: ['ა', 'ბ', 'გ'], correctIndex: 2, skill: 'phishing' })
  assert.equal(quiz.response.shown, true)
  assert.match(quiz.response.note, /quiz_answer/)
  assert.deepEqual(quiz.effect, { type: 'quiz', quiz: { scenario: 'წერილი', options: ['ა', 'ბ', 'გ'], correctIndex: 2, skill: 'phishing' } })
})

test('runTool: memory, lookup, navigation and the end of the session go through the context', async () => {
  const recorded = []
  const sessions = []
  const ctx = {
    lang: 'ka',
    page: { paths: { basic: { url: 'https://x/basic' }, kids: { url: 'https://x/kids', newTab: true } } },
    lookup: async (q, l) => (q === 'ფიშინგი' ? { chunks: [{}, {}], text: `[1] მასალა (${l})` } : { chunks: [], text: '' }),
    memory: {
      recordSkill: (s) => (recorded.push(s), { level: s.level }),
      addSession: (s) => (sessions.push(s), { at: 'now', ...s }),
    },
  }
  const skill = await runTool('record_skill', { skill: 'phishing', level: 2, evidence: 'spotted the sender' }, ctx)
  assert.deepEqual(recorded, [{ skill: 'phishing', level: 2, evidence: 'spotted the sender' }])
  assert.deepEqual(skill, { response: { ok: true }, effect: { type: 'skill', skill: 'phishing', level: 2 } })
  assert.deepEqual(await runTool('record_skill', { skill: 'phishing', level: 1 }, {}), { response: { ok: false }, effect: { type: 'skill', skill: 'phishing', level: 1 } })

  const found = await runTool('lookup_course_material', { query: 'ფიშინგი' }, ctx)
  assert.deepEqual(found, { response: { found: 2, material: '[1] მასალა (ka)' }, effect: null })
  const en = await runTool('lookup_course_material', { query: 'ფიშინგი', lang: 'en' }, ctx)
  assert.equal(en.response.material, '[1] მასალა (en)')
  const none = await runTool('lookup_course_material', { query: 'ბალახი' }, ctx)
  assert.equal(none.response.found, 0)
  assert.match(none.response.note, /not sure/)
  const broken = await runTool('lookup_course_material', { query: 'x' }, { lookup: async () => { throw new Error('offline') } })
  assert.match(broken.response.note, /offline/)

  const nav = await runTool('navigate_to_path', { path: 'kids' }, ctx)
  assert.deepEqual(nav.effect, { type: 'navigate', path: 'kids', url: 'https://x/kids', newTab: true })
  assert.match(nav.response.note, /goodbye/)
  assert.deepEqual((await runTool('navigate_to_path', { path: 'basic' }, {})).effect, { type: 'navigate', path: 'basic', url: null, newTab: false })
  // an embedded page cannot leave its frame: a link card, and the session goes on
  const embedded = await runTool('navigate_to_path', { path: 'basic' }, { page: { embed: true, paths: { basic: { url: 'https://x/basic', title: 'საბაზისო კურსი' } } } })
  assert.deepEqual(embedded.effect, { type: 'card', card: { kind: 'link', title: 'საბაზისო კურსი', items: [], diagram: null, url: 'https://x/basic' } })
  assert.match(embedded.response.note, /embedded/)

  const end = await runTool('end_session', { summary_ka: 'ფიშინგზე ვისაუბრეთ.', summary_en: 'We talked about phishing.', skills: ['phishing'] }, ctx)
  assert.equal(sessions.length, 1)
  assert.equal(end.effect.type, 'end')
  assert.equal(end.effect.summary.summary_en, 'We talked about phishing.')
  assert.match(end.response.note, /farewell/)
})

test('the text convention: tag lines become calls and never reach the captions', () => {
  assert.deepEqual(parseToolTag('@@tool set_mood {"mood":"wink"}'), { name: 'set_mood', args: { mood: 'wink' } })
  assert.equal(parseToolTag('@@tool set_mood {broken'), null)
  assert.equal(parseToolTag('plain text'), null)
  const r = splitToolTags('გამარჯობა.\n@@tool set_mood {"mood":"wink"}\nკიდევ ერთი.\n@@tool ask_')
  assert.equal(r.text, 'გამარჯობა.\nკიდევ ერთი.\n')
  assert.deepEqual(r.calls, [{ name: 'set_mood', args: { mood: 'wink' } }])
  assert.equal(r.rest, '@@tool ask_')
  assert.equal(r.held, true)
  const plain = splitToolTags('ნახევარი წინადა')
  assert.deepEqual(plain, { text: '', calls: [], rest: 'ნახევარი წინადა', held: false })
  const text = textToolInstructions()
  for (const name of TOOL_NAMES) assert.ok(text.includes(`${name}(`), name)
  assert.match(text, /@@tool <name> <json arguments>/)
})
