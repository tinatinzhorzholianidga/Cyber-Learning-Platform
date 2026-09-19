/* The CyberHero chunk builder, ported from the chat branch's ioBrain.js
   (docs/io-voice-plan.md §4.4): missions, parent/teacher guides and IO's
   tips become bilingual chunks tagged with their source and reference,
   so the tutor can cite „მისია: ფიშინგზე მონადირე" or point to a guide.
   Pure: the index script feeds it the content it read from git. */

const MIN_CHARS = 40

function pushChunk(chunks, base, en, ka) {
  const cleanEn = String(en || '').replace(/\s+/g, ' ').trim()
  const cleanKa = String(ka || '').replace(/\s+/g, ' ').trim()
  if (cleanEn.length < MIN_CHARS && cleanKa.length < MIN_CHARS) return
  chunks.push({ ...base, en: cleanEn, ka: cleanKa })
}

/* every { en, ka } text leaf inside an article body item */
export function collectLeaves(node, out = []) {
  if (!node || typeof node !== 'object') return out
  if (typeof node.en === 'string' || typeof node.ka === 'string') {
    out.push(node)
    return out
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((v) => collectLeaves(v, out))
    else if (value && typeof value === 'object') collectLeaves(value, out)
  }
  return out
}

/* { missions, articles, tips } → chunks
   { source: 'mission'|'guide'|'tip', ref, title: { en, ka }, en, ka } */
export function buildChunks({ missions = [], articles = [], tips = [] }) {
  const chunks = []

  for (const m of missions) {
    const base = { source: 'mission', ref: m.id, title: { en: `Mission: ${m.name.en}`, ka: `მისია: ${m.name.ka}` } }
    pushChunk(chunks, base, `${m.name.en}. ${m.desc?.en || ''} ${m.brief?.en || ''}`, `${m.name.ka}. ${m.desc?.ka || ''} ${m.brief?.ka || ''}`)
    for (const t of m.theory || []) pushChunk(chunks, base, t.en, t.ka)
    for (const r of m.rounds || []) {
      if (r.explain) pushChunk(chunks, base, r.explain.en, r.explain.ka)
      if (r.explainNegative) pushChunk(chunks, base, r.explainNegative.en, r.explainNegative.ka)
      for (const opt of r.options || []) if (opt.explain) pushChunk(chunks, base, opt.explain.en, opt.explain.ka)
      for (const item of r.items || []) if (item.explain) pushChunk(chunks, base, item.explain.en, item.explain.ka)
    }
    for (const t of m.takeaways || []) pushChunk(chunks, base, t.en, t.ka)
  }

  for (const a of articles) {
    const base = { source: 'guide', ref: a.id, title: { en: `Guide: ${a.title.en}`, ka: `გზამკვლევი: ${a.title.ka}` } }
    pushChunk(chunks, base, `${a.title.en}. ${a.teaser?.en || ''} ${a.lead?.en || ''}`, `${a.title.ka}. ${a.teaser?.ka || ''} ${a.lead?.ka || ''}`)
    for (const item of a.body || []) {
      const leaves = collectLeaves(item)
      pushChunk(chunks, base, leaves.map((l) => l.en || '').join(' '), leaves.map((l) => l.ka || '').join(' '))
    }
  }

  tips.forEach((tip, i) => pushChunk(chunks, { source: 'tip', ref: `tip-${i + 1}`, title: { en: 'IO tip', ka: 'იოს რჩევა' } }, tip.en, tip.ka))

  return chunks
}

/* The optional, gitignored Basic Course index (A6): a course object whose
   sections are { id, en, ka, chunks: [Georgian text, …] } (or, more
   generally, sections with { en, ka } leaves) → chunks tagged 'course'. */
export function buildCourseChunks(course) {
  const chunks = []
  ;(course?.sections || []).forEach((section, i) => {
    const n = section.id ?? section.number ?? i
    const titleEn = typeof section.en === 'string' ? section.en : section.title?.en || `Section ${n}`
    const titleKa = typeof section.ka === 'string' ? section.ka : section.title?.ka || `თემა ${n}`
    const base = { source: 'course', ref: `basic-${n}`, title: { en: `Basic Course, topic ${n}: ${titleEn}`, ka: `საბაზისო კურსი, თემა ${n}: ${titleKa}` } }
    if (Array.isArray(section.chunks) && section.chunks.every((c) => typeof c === 'string')) {
      for (const text of section.chunks) pushChunk(chunks, base, '', text)
      return
    }
    const leaves = collectLeaves(section).filter((l) => l !== section.title)
    let en = ''
    let ka = ''
    for (const leaf of leaves) {
      en += ` ${leaf.en || ''}`
      ka += ` ${leaf.ka || ''}`
      if (en.length > 700 || ka.length > 700) {
        pushChunk(chunks, base, en, ka)
        en = ''
        ka = ''
      }
    }
    pushChunk(chunks, base, en, ka)
  })
  return chunks
}
