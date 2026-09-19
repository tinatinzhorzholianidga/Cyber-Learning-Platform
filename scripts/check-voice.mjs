/* Checks for the talk-mode side of IO (see docs/io-voice-plan.md §6.3).

   Runs with `npm run check` after check-hints.mjs. Every rule that applies
   to a file which does not exist yet is skipped, so the script is useful
   from Phase D1 on and grows with the phases:

   - src/i18n/ui.js         ka/en key and array-length parity; voice.* pairs
                            linted with the hints.js rules (voice strings may
                            not use "...", have no emoji, and may name the
                            browser/speech vendors)
   - src/voice/i18n.js      the voice.* table in the lazy chunk, same rules
   - src/voice/tutor/strings.js   scripted talk-mode lines, same rules; the
                            returning greeting carries one {topic} slot
   - src/voice/tutor/persona.js   must contain no telephone number or hotline
                            (three or more consecutive digits); Georgian
                            quotes „…“ balanced; builds for both languages and
                            names every tool
   - src/voice/tutor/tools.js     the seven declarations against the JSON-schema
                            subset Gemini accepts; skill enums = skills.js;
                            Live behaviours; diagrams that ship
   - src/voice/tutor/skills.js    unique ids, KA/EN names, course references
   - public/io-index.json   the committed CyberHero index: shape, size, no
                            course text; a handful of retrieval queries hit
   - src/content/safety.js  placeholders are a warning, or an error when
                            VITE_IO_SAFETY_REQUIRED=1 (production builds)
   Everything imported here is plain ESM (no JSX, no import.meta.env at
   module scope). New checks are errors. */
import { existsSync, readFileSync } from 'node:fs'
import { UI } from '../src/i18n/ui.js'
import { lintPair, createReporter, LATIN_ALLOW, PLACEHOLDER, COURSE_SENTENCE } from './lib/lint.mjs'

const report = createReporter()
const root = new URL('..', import.meta.url)
const rel = (p) => new URL(p, root)
const VOICE_LATIN_ALLOW = [...LATIN_ALLOW, 'Google', 'Microsoft', 'Gemini', 'Esc', 'Chrome', 'Edge', 'Safari', 'Firefox', 'Ollama']
const VOICE_OPTS = { emojiMax: 0, tipCheck: false, latinAllow: VOICE_LATIN_ALLOW, noDots: true, placeholders: true }

/* ---- ui.js: the two language trees must have the same shape ---- */
function walkParity(a, b, path) {
  const keysA = Object.keys(a || {})
  const keysB = Object.keys(b || {})
  for (const k of keysA) if (!(k in (b || {}))) report.err(`ui.js: ${path}${k} exists in ka but not in en`)
  for (const k of keysB) if (!(k in (a || {}))) report.err(`ui.js: ${path}${k} exists in en but not in ka`)
  for (const k of keysA) {
    if (!(k in (b || {}))) continue
    const va = a[k]
    const vb = b[k]
    if (Array.isArray(va) || Array.isArray(vb)) {
      if (!Array.isArray(va) || !Array.isArray(vb) || va.length !== vb.length) {
        report.err(`ui.js: ${path}${k} has ${va?.length ?? '?'} entries in ka and ${vb?.length ?? '?'} in en`)
      }
    } else if (va && typeof va === 'object') {
      walkParity(va, vb && typeof vb === 'object' ? vb : {}, `${path}${k}.`)
    }
  }
}
walkParity(UI.ka, UI.en, '')

/* ---- voice.* tables: ui.js (entry strings) and src/voice/i18n.js ---- */
function lintTable(name, ka, en) {
  if (!ka || !en) return
  for (const key of new Set([...Object.keys(ka), ...Object.keys(en)])) {
    const pair = { ka: ka[key], en: en[key] }
    if (pair.ka && typeof pair.ka === 'object' && !Array.isArray(pair.ka)) {
      lintTable(`${name}.${key}`, pair.ka, pair.en)
      continue
    }
    report.apply(lintPair(`${name}.${key}`, pair, VOICE_OPTS))
  }
}
lintTable('voice', UI.ka.voice, UI.en.voice)

for (const file of ['src/voice/i18n.js', 'src/voice/tutor/strings.js']) {
  if (!existsSync(rel(file))) continue
  const mod = await import(rel(file).href)
  const table = mod.VOICE || mod.STRINGS || mod.default
  if (!table || !table.ka || !table.en) {
    report.err(`${file}: expected an export with { ka, en } tables`)
    continue
  }
  lintTable(file.replace(/^src\//, ''), table.ka, table.en)
  if (mod.STRINGS) {
    // the returning greeting fills one {topic} slot; every other line has none
    for (const l of ['ka', 'en']) {
      for (const [key, s] of Object.entries(table[l])) {
        const slots = String(s).match(PLACEHOLDER) || []
        if (key === 'returning' && !(slots.length === 1 && slots[0] === '{topic}')) report.err(`${file}: returning.${l} must contain exactly one {topic} slot`)
        if (key !== 'returning' && slots.length) report.err(`${file}: ${key}.${l} contains a placeholder ${slots[0]}`)
      }
    }
  }
}

/* ---- skills.js: the taxonomy the tools and the memory share ---- */
let SKILL_IDS = null
if (existsSync(rel('src/voice/tutor/skills.js'))) {
  const { SKILLS, SKILL_IDS: ids, MAX_LEVEL } = await import(rel('src/voice/tutor/skills.js').href)
  SKILL_IDS = ids
  if (!Array.isArray(SKILLS) || SKILLS.length < 10 || SKILLS.length > 14) report.err(`skills.js: expected 10 to 14 skills, found ${SKILLS?.length}`)
  if (MAX_LEVEL !== 3) report.err('skills.js: mastery runs 0 to 3')
  const seen = new Set()
  for (const s of SKILLS || []) {
    const tag = `skills.js: ${s.id}`
    if (!/^[a-z][a-z_]+$/.test(s.id || '')) report.err(`${tag}: id must be lower-case letters and underscores`)
    if (seen.has(s.id)) report.err(`${tag}: duplicate id`)
    seen.add(s.id)
    for (const key of ['ka', 'kaOn', 'en']) if (typeof s[key] !== 'string' || !s[key].trim()) report.err(`${tag}: ${key} missing`)
    if (s.kaOn && !s.kaOn.endsWith('ზე')) report.err(`${tag}: kaOn must be the -ზე form („წინა ჯერზე ${s.kaOn} ვისაუბრეთ“)`)
    report.apply(lintPair(tag, { ka: s.ka, en: s.en }, { ...VOICE_OPTS, maxLen: 60 }))
    const ref = s.courseRef || {}
    for (const key of ['basic', 'mission', 'guide']) if (!Array.isArray(ref[key])) report.err(`${tag}: courseRef.${key} must be an array`)
    for (const n of ref.basic || []) if (!(Number.isInteger(n) && n >= 1 && n <= 10)) report.err(`${tag}: courseRef.basic holds topic numbers 1 to 10, not ${n}`)
    for (const id of ref.mission || []) if (!/^g\d+$/.test(id)) report.err(`${tag}: courseRef.mission id ${id} is not a CyberHero mission id`)
    for (const id of ref.guide || []) if (!/^[abc]\d+$/.test(id)) report.err(`${tag}: courseRef.guide id ${id} is not a CyberHero guide id`)
  }
}

/* ---- tools.js: declarations Gemini accepts, Live behaviours, diagrams ---- */
const TYPES = new Set(['STRING', 'INTEGER', 'NUMBER', 'BOOLEAN', 'ARRAY', 'OBJECT'])
const BRIEF_TOOLS = ['set_mood', 'show_card', 'ask_quiz', 'record_skill', 'lookup_course_material', 'navigate_to_path', 'end_session']
if (existsSync(rel('src/voice/tutor/tools.js'))) {
  const tools = await import(rel('src/voice/tutor/tools.js').href)
  const names = (tools.DECLARATIONS || []).map((d) => d.name)
  if (names.join(',') !== BRIEF_TOOLS.join(',')) report.err(`tools.js: the declarations must be exactly ${BRIEF_TOOLS.join(', ')} (found ${names.join(', ')})`)
  for (const d of tools.DECLARATIONS || []) {
    const tag = `tools.js: ${d.name}`
    if (typeof d.description !== 'string' || d.description.length < 20) report.err(`${tag}: description missing`)
    const p = d.parameters || {}
    if (p.type !== 'OBJECT' || !p.properties || !Object.keys(p.properties).length) report.err(`${tag}: parameters must be an OBJECT with properties`)
    for (const [key, spec] of Object.entries(p.properties || {})) {
      if (!TYPES.has(spec.type)) report.err(`${tag}.${key}: type ${spec.type} is not in the schema subset`)
      if (spec.type === 'ARRAY' && !TYPES.has(spec.items?.type)) report.err(`${tag}.${key}: an ARRAY needs items with a type`)
      const en = spec.enum ?? spec.items?.enum
      if (en !== undefined && !(Array.isArray(en) && en.length && en.every((v) => typeof v === 'string'))) report.err(`${tag}.${key}: enum must be a non-empty list of strings`)
      if (spec.enum && spec.type !== 'STRING') report.err(`${tag}.${key}: only STRING parameters take an enum`)
    }
    for (const key of p.required || []) if (!(key in (p.properties || {}))) report.err(`${tag}: required ${key} is not a property`)
    if (tools.LIVE_BEHAVIOR?.[d.name] !== 'BLOCKING' && tools.LIVE_BEHAVIOR?.[d.name] !== 'NON_BLOCKING') report.err(`${tag}: LIVE_BEHAVIOR must be BLOCKING or NON_BLOCKING`)
    const sched = tools.LIVE_SCHEDULING?.[d.name]
    if (sched !== undefined) {
      if (!['SILENT', 'WHEN_IDLE', 'INTERRUPT'].includes(sched)) report.err(`${tag}: LIVE_SCHEDULING ${sched} is not a scheduling value`)
      if (tools.LIVE_BEHAVIOR?.[d.name] !== 'NON_BLOCKING') report.err(`${tag}: scheduling applies to NON_BLOCKING tools only`)
    }
  }
  if (SKILL_IDS) {
    const same = (list) => Array.isArray(list) && list.join(',') === SKILL_IDS.join(',')
    const byName = Object.fromEntries((tools.DECLARATIONS || []).map((d) => [d.name, d]))
    if (!same(byName.ask_quiz?.parameters.properties.skill?.enum)) report.err('tools.js: ask_quiz.skill enum must list the skills.js ids')
    if (!same(byName.record_skill?.parameters.properties.skill?.enum)) report.err('tools.js: record_skill.skill enum must list the skills.js ids')
    if (!same(byName.end_session?.parameters.properties.skills?.items?.enum)) report.err('tools.js: end_session.skills enum must list the skills.js ids')
  }
  for (const name of tools.DIAGRAMS || []) {
    if (!existsSync(rel(`src/voice/diagrams/${name}.jsx`))) report.err(`tools.js: diagram ${name} has no src/voice/diagrams/${name}.jsx`)
  }
  const moods = ['happy', 'wink', 'thinking', 'excited', 'celebrate', 'surprised']
  if ((tools.MOODS || []).join(',') !== moods.join(',')) report.err(`tools.js: set_mood takes ${moods.join(' | ')}`)
}

/* ---- persona.js: no hotline numbers (the brief: resources come only from
   src/content/safety.js, filled in by the DGA team); balanced Georgian
   quotes; builds for both languages and names every tool ---- */
if (existsSync(rel('src/voice/tutor/persona.js'))) {
  const src = readFileSync(rel('src/voice/tutor/persona.js'), 'utf8')
  const hit = src.match(/\d{3,}/)
  if (hit) report.err(`persona.js: contains the number "${hit[0]}" - numbers, hotlines and organisation names belong in src/content/safety.js`)
  const open = (src.match(/„/g) || []).length
  const close = (src.match(/“/g) || []).length
  if (open !== close) report.err(`persona.js: Georgian quotes are unbalanced („ ${open}, “ ${close})`)
  if (src.includes('...')) report.err('persona.js: three dots - use the single … character')
  const { buildSystemInstruction } = await import(rel('src/voice/tutor/persona.js').href)
  for (const lang of ['ka', 'en']) {
    const text = buildSystemInstruction({ lang, learner: 'Returning learner.' })
    for (const name of BRIEF_TOOLS) if (!text.includes(name)) report.err(`persona.js (${lang}): the instruction never names ${name}`)
    if (!/LEARNER\nReturning learner\./.test(text)) report.err(`persona.js (${lang}): the learner summary is not in the LEARNER block`)
    if (text.length > 12000) report.err(`persona.js (${lang}): ${text.length} characters is too long for every turn`)
  }
  if (!buildSystemInstruction({ lang: 'ka' }).includes('თქვენ')) report.err('persona.js: the Georgian instruction must ask for the polite plural (თქვენ)')
}

/* ---- the committed CyberHero index and a handful of retrieval queries ---- */
if (existsSync(rel('public/io-index.json')) && existsSync(rel('src/voice/tutor/lookup.js'))) {
  const raw = readFileSync(rel('public/io-index.json'), 'utf8')
  let index = null
  try {
    index = JSON.parse(raw)
  } catch {
    report.err('public/io-index.json: not valid JSON')
  }
  if (index) {
    const chunks = Array.isArray(index.chunks) ? index.chunks : []
    if (index.v !== 1) report.err(`io-index.json: version ${index.v}, expected 1`)
    if (index.count !== chunks.length) report.err(`io-index.json: count ${index.count} differs from ${chunks.length} chunks`)
    if (chunks.length < 300) report.err(`io-index.json: ${chunks.length} chunks, expected at least 300 (run npm run build:index)`)
    if (raw.includes(COURSE_SENTENCE)) report.err('io-index.json: contains Basic Course text (A6)')
    const sources = new Set(['mission', 'guide', 'tip'])
    let bad = 0
    for (const c of chunks) {
      const ok = sources.has(c.source) && typeof c.ref === 'string' && c.title && typeof c.title.en === 'string' && typeof c.title.ka === 'string' && (String(c.en || '').length >= 40 || String(c.ka || '').length >= 40)
      if (!ok) bad += 1
    }
    if (bad) report.err(`io-index.json: ${bad} chunk(s) do not have { source: mission|guide|tip, ref, title: { en, ka }, en, ka }`)
    if (!chunks.some((c) => c.source === 'mission') || !chunks.some((c) => c.source === 'guide') || !chunks.some((c) => c.source === 'tip')) report.err('io-index.json: missions, guides and tips must all be present')
    if (raw.length > 1024 * 1024) report.err(`io-index.json: ${raw.length} bytes is over the 1 MB cap`)

    const { scoreChunks } = await import(rel('src/voice/tutor/lookup.js').href)
    // what a learner might ask → a CyberHero reference the top hit must carry
    const QUERIES = [
      ['რა არის ფიშინგი?', ['a2', 'g1']],
      ['phishing', ['a2', 'g1']],
      ['როგორ შევქმნა ძლიერი პაროლი?', ['b3', 'g3', 'tip-1']],
      ['password', ['b3', 'g3', 'tip-1']],
      ['ორმაგი ავთენტიფიკაცია', ['b3', 'a2', 'b5', 'g3']],
      ['შანტაჟი', ['a3']],
      ['კიბერბულინგი', ['a4', 'g4']],
      ['ყალბი ამბები', ['a7', 'g7']],
      ['deepfake', ['a7', 'g7', 'g10']],
      ['უცნობი მწერს', ['a5']],
      ['screen time', ['a6', 'g9']],
    ]
    for (const [q, refs] of QUERIES) {
      const hits = scoreChunks(chunks, q, { topN: 3 })
      if (!hits.length) report.err(`lookup: "${q}" finds nothing in the index`)
      else if (!refs.includes(hits[0].chunk.ref)) report.err(`lookup: "${q}" ranks ${hits[0].chunk.ref} first, expected one of ${refs.join(', ')}`)
    }
  }
}

/* ---- safety.js placeholders ---- */
if (existsSync(rel('src/content/safety.js'))) {
  const mod = await import(rel('src/content/safety.js').href)
  const text = JSON.stringify(mod.SAFETY ?? mod.default ?? mod)
  const placeholder = /TODO|PLACEHOLDER|\{\{|შესავსებია/i
  if (placeholder.test(text)) {
    const msg = 'safety.js: still contains placeholders - the DGA team fills in the resources before a public build'
    if (process.env.VITE_IO_SAFETY_REQUIRED === '1') report.err(msg)
    else report.warn(msg)
  }
  if (mod.SAFETY) {
    for (const l of ['ka', 'en']) {
      const s = mod.SAFETY[l]
      if (!s || typeof s.intro !== 'string' || !Array.isArray(s.resources) || !s.resources.length) report.err(`safety.js: ${l} needs an intro and at least one resource`)
    }
    if (mod.SAFETY.ka?.intro) report.apply(lintPair('safety.js.intro', { ka: mod.SAFETY.ka.intro, en: mod.SAFETY.en?.intro }, VOICE_OPTS))
  }
}

report.finish()
