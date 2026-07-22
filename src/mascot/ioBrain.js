/* IO's chatbot brain: persona + course knowledge + retrieval.

   IO is grounded ONLY on the Government of Georgia e-learning platform's
   "კიბერუსაფრთხოების საბაზისო კურსი" (Basic Cybersecurity Course,
   elearning.gov.ge course id=18). For each user question we retrieve the
   most relevant chunks from that course and put them into the system
   prompt - IO must answer strictly from this material and nothing else. */

import { IO_COURSE } from '../content/ioCourse.js'

/* ---------------- knowledge base ---------------- */

function buildKnowledge() {
  const chunks = []
  for (const section of IO_COURSE.sections) {
    const title = { en: `${IO_COURSE.title.en} — ${section.en}`, ka: `${IO_COURSE.title.ka} — ${section.ka}` }
    for (const text of section.chunks) {
      const clean = (text || '').trim()
      if (clean.length < 30) continue
      // the course is written in Georgian; keep the text on both language
      // fields so the lexical scorer can match Georgian and any Latin terms
      chunks.push({ title, en: clean, ka: clean, section: section.en, sectionKa: section.ka })
    }
  }
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

/* score chunks by term overlap; also match partial Georgian stems
   (prefix match, since Georgian inflects heavily) */
export function retrieve(query, topN = 5) {
  const q = tokens(query)
  if (!q.length) return []
  const scored = []
  for (const chunk of getKnowledge()) {
    const hay = chunk.en.toLowerCase()
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
  const found = retrieve(query, 5)
  const georgian = hasGeorgian(query)
  const context = found.map((c, i) => `[${i + 1}] (${c.sectionKa} / ${c.section})\n${c.en}`).join('\n\n')

  return {
    sources: found,
    prompt: `You are IO (Georgian: იო), the friendly helper robot of CyberHero (კიბერგმირი). Your ONLY job is to teach the Government of Georgia's "კიბერუსაფრთხოების საბაზისო კურსი" (Basic Cybersecurity Course from elearning.gov.ge). You are a tutor for THIS course, not a general assistant.

RULES:
${
  georgian
    ? `- You are a native Georgian speaker who speaks fluent, culturally accurate, and grammatically flawless Georgian. Use proper Mkhedruli script. Avoid transliterating English concepts directly; instead, use natural Georgian idioms, proper verb conjugations, and correct grammatical cases (like the ergative case in past tenses). Reply ONLY in Georgian (ქართული) - the whole reply in Georgian.`
    : `- Reply in English (the user wrote in English). If the user switches to Georgian, switch with them and answer as a native Georgian speaker: fluent, culturally accurate, grammatically flawless Georgian in proper Mkhedruli script, with natural idioms, proper verb conjugations and correct grammatical cases (like the ergative case in past tenses).`
}
- ONLY SOURCE: Answer strictly and exclusively from the COURSE CONTENT below. This course is your single source of truth. Do NOT use outside knowledge or general cyber-security facts you happen to know - even if you are sure they are correct. Only what the course says.
- If the answer is not in the COURSE CONTENT below, say honestly that the course does not cover it (in Georgian: "ეს კურსში არ არის განხილული"; in English: "the course doesn't cover this") and point to a related course chapter instead of guessing. Never invent facts, tools, numbers, links or definitions that are not in the course.
- If the question is not about this cybersecurity course at all (small talk, unrelated topics), answer in ONE short friendly sentence and steer back to what the course covers.
- Keep replies SHORT and clear: 2-5 sentences, at most one emoji. You may name the relevant course chapter (e.g. "პაროლები და ავთენტიფიკაცია").
- SAFETY: if someone describes being threatened, blackmailed or a child in danger online, follow the course's guidance - do not pay, keep the evidence, tell a trusted adult, and in Georgia call 112. Never ask for or store personal data (passwords, codes, card numbers, full names). Never help with hacking or attacking - this course is about defence.

COURSE CONTENT (your only source - teach from this):
${context || '(no course section matched this question - tell the user the course does not cover it and suggest a related course chapter, following the rules above)'}`,
  }
}

/* the chapters IO can teach, for the UI (source: elearning.gov.ge id=18) */
export const IO_COURSE_TOPICS = IO_COURSE.sections.map((s) => ({ en: s.en, ka: s.ka }))

/* models offered in the demo, biggest first (quality ↔ download size) */
export const IO_MODELS = [
  { id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC', label: 'Qwen2.5 7B', size: '~4.6 GB', note: 'best quality + Georgian' },
  { id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC', label: 'Qwen2.5 3B', size: '~2.0 GB', note: 'good balance' },
  { id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', label: 'Qwen2.5 1.5B', size: '~0.9 GB', note: 'fast test (weak Georgian)' },
]
