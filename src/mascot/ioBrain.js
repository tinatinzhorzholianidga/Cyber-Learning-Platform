/* IO's chatbot brain: persona + platform knowledge + retrieval.
   The LLM (Qwen2.5, running in the visitor's browser via WebLLM) is
   grounded on the platform's own bilingual content: mission theory and
   explanations, parent/teacher articles and IO's helper tips. For each
   user question we retrieve the most relevant chunks and put them into
   the system prompt - so IO answers with CyberHero's material. */

import { MISSIONS } from '../content/guardians/index.js'
import { ARTICLES } from '../content/parents/index.js'
import { MASCOT_TIPS } from '../content/mascot.js'

/* ---------------- knowledge base ---------------- */

function pushChunk(chunks, title, en, ka) {
  const cleanEn = (en || '').trim()
  const cleanKa = (ka || '').trim()
  if (cleanEn.length < 40 && cleanKa.length < 40) return
  chunks.push({ title, en: cleanEn, ka: cleanKa })
}

function collectLeaves(node, out) {
  // walks an article body item and collects every {en,ka} text leaf
  if (!node || typeof node !== 'object') return
  if (typeof node.en === 'string' || typeof node.ka === 'string') {
    out.push(node)
    return
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((v) => collectLeaves(v, out))
    else if (value && typeof value === 'object') collectLeaves(value, out)
  }
}

function buildKnowledge() {
  const chunks = []

  for (const m of MISSIONS) {
    const title = { en: `Mission: ${m.name.en}`, ka: `მისია: ${m.name.ka}` }
    pushChunk(chunks, title, `${m.name.en}. ${m.desc?.en || ''} ${m.brief?.en || ''}`, `${m.name.ka}. ${m.desc?.ka || ''} ${m.brief?.ka || ''}`)
    for (const t of m.theory || []) pushChunk(chunks, title, t.en, t.ka)
    for (const r of m.rounds || []) {
      if (r.explain) pushChunk(chunks, title, r.explain.en, r.explain.ka)
      for (const opt of r.options || []) if (opt.explain) pushChunk(chunks, title, opt.explain.en, opt.explain.ka)
    }
  }

  for (const a of ARTICLES) {
    const title = { en: `Guide: ${a.title.en}`, ka: `გზამკვლევი: ${a.title.ka}` }
    pushChunk(chunks, title, `${a.title.en}. ${a.teaser?.en || ''} ${a.lead?.en || ''}`, `${a.title.ka}. ${a.teaser?.ka || ''} ${a.lead?.ka || ''}`)
    for (const item of a.body || []) {
      const leaves = []
      collectLeaves(item, leaves)
      const en = leaves.map((l) => l.en || '').join(' ')
      const ka = leaves.map((l) => l.ka || '').join(' ')
      pushChunk(chunks, title, en, ka)
    }
  }

  const tipTitle = { en: 'IO tip', ka: 'იოს რჩევა' }
  for (const tip of MASCOT_TIPS) pushChunk(chunks, tipTitle, tip.en, tip.ka)

  return chunks
}

let KNOWLEDGE = null
export function getKnowledge() {
  if (!KNOWLEDGE) KNOWLEDGE = buildKnowledge()
  return KNOWLEDGE
}

/* ---------------- retrieval ---------------- */

const STOP = new Set(
  'the a an and or of to in is are what how do i my me you your it for on with not this that როგორ არის რა და ან რომ თუ მე შენ ჩემი შენი ის ეს არ არა ვინ'.split(' '),
)

function tokens(text) {
  return (text.toLowerCase().match(/[a-z0-9]+|[ა-ჰ]+/g) || []).filter((w) => w.length > 1 && !STOP.has(w))
}

export function hasGeorgian(text) {
  return /[ა-ჰ]/.test(text)
}

/* score chunks by term overlap against both languages; also match
   partial Georgian stems (prefix match, since Georgian inflects) */
export function retrieve(query, topN = 4) {
  const q = tokens(query)
  if (!q.length) return []
  const scored = []
  for (const chunk of getKnowledge()) {
    const hay = `${chunk.en.toLowerCase()} ${chunk.ka}`
    let score = 0
    for (const term of q) {
      if (hay.includes(term)) score += term.length > 3 ? 2 : 1
      else if (term.length > 4 && hay.includes(term.slice(0, term.length - 2))) score += 1
    }
    if (score > 0) scored.push({ chunk, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topN).map((s) => s.chunk)
}

/* ---------------- persona / prompt ---------------- */

export function buildSystemPrompt(query) {
  const found = retrieve(query, 4)
  const georgian = hasGeorgian(query)
  const context = found
    .map((c, i) => `[${i + 1}] (${c.title.en} / ${c.title.ka})\nEN: ${c.en}\nKA: ${c.ka}`)
    .join('\n\n')

  return {
    sources: found,
    prompt: `You are IO (Georgian: იო), the friendly helper robot of CyberHero (კიბერგმირი) - a free bilingual cyber-safety learning platform for kids, teens, parents and teachers in Georgia. The platform has 10 interactive missions for teens (phishing, digital footprint, passwords, blackmail, scams, cyberbullying, fake news, online strangers, screen balance, final exam) and a guide library for parents and teachers.

RULES:
${
  georgian
    ? `- You are a native Georgian speaker who speaks fluent, culturally accurate, and grammatically flawless Georgian. Use proper Mkhedruli script. Avoid transliterating English concepts directly; instead, use natural Georgian idioms, proper verb conjugations, and correct grammatical cases (like the ergative case in past tenses). Reply ONLY in Georgian (ქართული) - the whole reply in Georgian.`
    : `- Reply in English (the user wrote in English). If the user switches to Georgian, switch with them and answer as a native Georgian speaker: fluent, culturally accurate, grammatically flawless Georgian in proper Mkhedruli script, with natural idioms, proper verb conjugations and correct grammatical cases (like the ergative case in past tenses).`
}
- You teach online safety: phishing, passwords, scams, privacy, cyberbullying, strangers online, fake news and screen balance. Be warm, encouraging and practical - you talk mostly with kids and teens.
- Keep replies SHORT: 2-5 sentences. No lecturing, at most one emoji.
- Base your answers on the PLATFORM KNOWLEDGE below when it is relevant. You may recommend the matching mission or guide by name.
- SAFETY: if someone is threatened, blackmailed or in danger online: never pay, save the evidence, tell a trusted adult, and in Georgia call 112. Never ask for or store personal data (passwords, codes, addresses, full names). Never help with hacking, attacking or breaking into accounts - you defend, not attack.
- If the question is not about online safety or the platform, answer in ONE friendly sentence and steer back to cyber safety.
- Do not invent platform features, prices or contacts that are not in the knowledge below.

PLATFORM KNOWLEDGE:
${context || '(nothing matched this question - answer from your general cyber-safety knowledge, following the rules above)'}`,
  }
}

/* models offered in the demo, biggest first (quality ↔ download size) */
export const IO_MODELS = [
  { id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC', label: 'Qwen2.5 7B', size: '~4.6 GB', note: 'best quality + Georgian' },
  { id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC', label: 'Qwen2.5 3B', size: '~2.0 GB', note: 'good balance' },
  { id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', label: 'Qwen2.5 1.5B', size: '~0.9 GB', note: 'fast test (weak Georgian)' },
]
