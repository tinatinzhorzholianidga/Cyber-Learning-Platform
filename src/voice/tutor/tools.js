/* The seven tools (brief Phase 5; docs/io-voice-plan.md §5.8), shared by
   every session: the declarations the model sees, their Live behaviours,
   a schema-subset validator, the browser-side handlers, and the text-tag
   convention the local backend uses instead of native function calls.

   runTool(name, args, ctx) → { response, effect }: `response` goes back
   to the model; `effect` is what the UI does (a mood, a board card, a
   quiz, a navigation, the end of the session). */
import { SKILL_IDS } from './skills.js'

export const MOODS = ['happy', 'wink', 'thinking', 'excited', 'celebrate', 'surprised']
export const CARD_KINDS = ['steps', 'checklist', 'diagram', 'link']
export const DIAGRAMS = ['phishing_email', 'password_strength', 'two_factor_flow']
export const PATHS = ['basic', 'kids']

export const DECLARATIONS = [
  {
    name: 'set_mood',
    description: "Change IO's face to match what you are saying. Use sparingly: excited or celebrate for a right answer, thinking for a puzzle, surprised for a twist.",
    parameters: { type: 'OBJECT', properties: { mood: { type: 'STRING', enum: MOODS } }, required: ['mood'] },
  },
  {
    name: 'show_card',
    description: 'Show a card beside IO: numbered steps, a checklist, one of the shipped diagrams, or a link. Keep speaking while it shows; never read the card aloud word by word.',
    parameters: {
      type: 'OBJECT',
      properties: {
        kind: { type: 'STRING', enum: CARD_KINDS },
        title: { type: 'STRING', description: 'Short title in the session language.' },
        items: { type: 'ARRAY', items: { type: 'STRING' }, description: 'For steps or checklist: two to six short lines.' },
        diagram: { type: 'STRING', enum: DIAGRAMS, description: 'For kind=diagram.' },
        url: { type: 'STRING', description: 'For kind=link: a platform URL from the facts.' },
      },
      required: ['kind', 'title'],
    },
  },
  {
    name: 'ask_quiz',
    description: "Show a three-option question the learner answers by voice or by clicking. Their answer comes back to you as a message starting with quiz_answer. React to it yourself: narrow the problem after a wrong answer, confirm briefly and raise the difficulty after a right one.",
    parameters: {
      type: 'OBJECT',
      properties: {
        scenario: { type: 'STRING', description: 'One or two sentences in the session language.' },
        options: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Exactly three short options.' },
        correctIndex: { type: 'INTEGER', description: '0, 1 or 2.' },
        skill: { type: 'STRING', enum: SKILL_IDS },
      },
      required: ['scenario', 'options', 'correctIndex', 'skill'],
    },
  },
  {
    name: 'record_skill',
    description: 'Record what the learner showed about one skill: level 0 (new) to 3 (mastered) and one line of evidence. Call it after a quiz or a clear demonstration.',
    parameters: {
      type: 'OBJECT',
      properties: { skill: { type: 'STRING', enum: SKILL_IDS }, level: { type: 'INTEGER' }, evidence: { type: 'STRING' } },
      required: ['skill', 'level'],
    },
  },
  {
    name: 'lookup_course_material',
    description: 'Search the platform material (CyberHero missions, parent and teacher guides, tips) before answering a question about what the platform teaches. Returns the best matching passages; if nothing comes back, say you are not sure and point to the course.',
    parameters: { type: 'OBJECT', properties: { query: { type: 'STRING' }, lang: { type: 'STRING', enum: ['ka', 'en'] } }, required: ['query'] },
  },
  {
    name: 'navigate_to_path',
    description: 'Take the learner to one of the two paths when they decide to start: basic (the Basic Course, adults) or kids (CyberHero, teens). Say goodbye first; the page follows the link after your words.',
    parameters: { type: 'OBJECT', properties: { path: { type: 'STRING', enum: PATHS } }, required: ['path'] },
  },
  {
    name: 'end_session',
    description: 'When the learner says goodbye or wants to stop: summarise the conversation in two short lines (Georgian and English) and list the skills touched; then say a one-sentence farewell that names what you covered. The session closes after it.',
    parameters: {
      type: 'OBJECT',
      properties: {
        summary_ka: { type: 'STRING' },
        summary_en: { type: 'STRING' },
        skills: { type: 'ARRAY', items: { type: 'STRING', enum: SKILL_IDS } },
      },
      required: ['summary_ka', 'summary_en'],
    },
  },
]

export const TOOL_NAMES = DECLARATIONS.map((d) => d.name)

/* Live API behaviours (docs/io-voice-plan.md §5.7) */
export const LIVE_BEHAVIOR = {
  set_mood: 'NON_BLOCKING',
  show_card: 'NON_BLOCKING',
  ask_quiz: 'NON_BLOCKING',
  record_skill: 'NON_BLOCKING',
  lookup_course_material: 'BLOCKING',
  navigate_to_path: 'BLOCKING',
  end_session: 'BLOCKING',
}
export const LIVE_SCHEDULING = { set_mood: 'SILENT', show_card: 'SILENT', ask_quiz: 'SILENT', record_skill: 'SILENT' }

/* the `tools` array for a Gemini request (function calling) */
export function geminiTools({ live = false } = {}) {
  return [{ functionDeclarations: DECLARATIONS.map((d) => (live ? { ...d, behavior: LIVE_BEHAVIOR[d.name] } : d)) }]
}

/* Validate arguments against the declaration (the JSON-schema subset the
   declarations use: OBJECT/STRING/INTEGER/ARRAY, enum, required). */
export function validateArgs(name, args) {
  const decl = DECLARATIONS.find((d) => d.name === name)
  if (!decl) return { ok: false, errors: [`unknown tool ${name}`] }
  const errors = []
  const props = decl.parameters.properties
  for (const key of decl.parameters.required || []) if (args?.[key] === undefined || args?.[key] === null || args?.[key] === '') errors.push(`${key} is required`)
  for (const [key, value] of Object.entries(args || {})) {
    const spec = props[key]
    if (!spec) {
      errors.push(`${key} is not a parameter`)
      continue
    }
    if (spec.type === 'STRING' && typeof value !== 'string') errors.push(`${key} must be a string`)
    if (spec.type === 'INTEGER' && !Number.isInteger(value)) errors.push(`${key} must be an integer`)
    if (spec.type === 'ARRAY' && !Array.isArray(value)) errors.push(`${key} must be an array`)
    if (spec.enum && typeof value === 'string' && !spec.enum.includes(value)) errors.push(`${key} must be one of ${spec.enum.join(', ')}`)
    if (spec.type === 'ARRAY' && Array.isArray(value) && spec.items?.enum) {
      for (const v of value) if (!spec.items.enum.includes(v)) errors.push(`${key} contains ${v}, not one of ${spec.items.enum.join(', ')}`)
    }
  }
  if (name === 'ask_quiz' && Array.isArray(args?.options) && args.options.length !== 3) errors.push('options must have exactly three entries')
  if (name === 'ask_quiz' && Number.isInteger(args?.correctIndex) && (args.correctIndex < 0 || args.correctIndex > 2)) errors.push('correctIndex must be 0, 1 or 2')
  if (name === 'show_card' && args?.kind === 'diagram' && !DIAGRAMS.includes(args?.diagram)) errors.push('diagram must name a shipped diagram')
  if (name === 'show_card' && args?.kind === 'link' && !/^https?:\/\//.test(args?.url || '')) errors.push('url must be an http(s) address')
  if (name === 'show_card' && (args?.kind === 'steps' || args?.kind === 'checklist') && !(Array.isArray(args?.items) && args.items.length >= 1)) errors.push('items are required for steps and checklist')
  return { ok: !errors.length, errors }
}

/* The handlers. ctx = { lang, page, lookup(query, lang) → { text, chunks }, memory: { recordSkill, addSession } } */
export async function runTool(name, rawArgs, ctx = {}) {
  const args = rawArgs && typeof rawArgs === 'object' ? rawArgs : {}
  const { ok, errors } = validateArgs(name, args)
  if (!ok) return { response: { error: errors.join('; ') }, effect: null }
  const lang = ctx.lang || 'ka'
  switch (name) {
    case 'set_mood':
      return { response: { ok: true }, effect: { type: 'mood', mood: args.mood } }
    case 'show_card': {
      const card = { kind: args.kind, title: String(args.title).slice(0, 80), items: (args.items || []).slice(0, 6).map((s) => String(s).slice(0, 140)), diagram: args.diagram || null, url: args.url || null }
      return { response: { ok: true }, effect: { type: 'card', card } }
    }
    case 'ask_quiz': {
      const quiz = { scenario: String(args.scenario).slice(0, 300), options: args.options.map((s) => String(s).slice(0, 120)), correctIndex: args.correctIndex, skill: args.skill }
      return {
        response: { shown: true, note: 'Wait for the learner. Their choice arrives as a message that starts with quiz_answer.' },
        effect: { type: 'quiz', quiz },
      }
    }
    case 'record_skill': {
      const saved = ctx.memory?.recordSkill?.({ skill: args.skill, level: args.level, evidence: args.evidence || '' }) || null
      return { response: { ok: Boolean(saved) }, effect: { type: 'skill', skill: args.skill, level: args.level } }
    }
    case 'lookup_course_material': {
      try {
        const r = await ctx.lookup?.(args.query, args.lang || lang)
        const found = r?.chunks?.length || 0
        return { response: found ? { found, material: r.text } : { found: 0, note: 'Nothing matched. Say you are not sure and point to the course.' }, effect: null }
      } catch (err) {
        return { response: { found: 0, note: `The material could not be loaded (${err?.message || err}). Answer from your own knowledge and say the course has more.` }, effect: null }
      }
    }
    case 'navigate_to_path': {
      const target = ctx.page?.paths?.[args.path] || {}
      if (ctx.page?.embed && target.url) {
        // an embedded page cannot leave its frame: a link card instead (§5.3)
        const card = { kind: 'link', title: String(target.title || args.path).slice(0, 80), items: [], diagram: null, url: target.url }
        return { response: { ok: true, note: 'This page is embedded and cannot navigate. A link card is shown beside you: tell the learner to click it, and carry on.' }, effect: { type: 'card', card } }
      }
      return { response: { ok: true, note: 'Say goodbye now; the page follows the link after your words.' }, effect: { type: 'navigate', path: args.path, url: target.url || null, newTab: Boolean(target.newTab) } }
    }
    case 'end_session': {
      const session = ctx.memory?.addSession?.({ summary_ka: args.summary_ka, summary_en: args.summary_en, skills: args.skills || [] }) || null
      return { response: { ok: true, note: 'Say a short farewell; the session closes after it.' }, effect: { type: 'end', summary: session } }
    }
    default:
      return { response: { error: `unknown tool ${name}` }, effect: null }
  }
}

/* ---- the text convention for backends without function calling ----
   A line `@@tool <name> <json>` anywhere in the answer is a call; it is
   held back from captions and speech. */
const TAG = /^@@tool\s+([a-z_]+)\s+(\{[\s\S]*\})\s*$/

export function parseToolTag(line) {
  const m = TAG.exec(String(line || '').trim())
  if (!m) return null
  try {
    return { name: m[1], args: JSON.parse(m[2]) }
  } catch {
    return null
  }
}

/* Feed streamed text through: complete lines that are tags become calls,
   other text is passed on; a line that starts with @@ is held until its
   newline. Returns { text, calls, rest }. */
export function splitToolTags(buffer) {
  const lines = buffer.split('\n')
  const rest = lines.pop()
  let text = ''
  const calls = []
  for (const line of lines) {
    if (line.trimStart().startsWith('@@')) {
      const call = parseToolTag(line)
      if (call) calls.push(call)
    } else text += `${line}\n`
  }
  return { text, calls, rest: rest.trimStart().startsWith('@@') ? rest : rest, held: rest.trimStart().startsWith('@@') }
}

export function textToolInstructions() {
  return `TOOLS (text convention)
You cannot call functions directly. To use a tool, write a line of its own in the form
@@tool <name> <json arguments>
and continue speaking on the next line. Available: ${DECLARATIONS.map((d) => `${d.name}(${Object.keys(d.parameters.properties).join(', ')})`).join('; ')}. The line is never shown or spoken.`
}
