/* Retrieval over the committed CyberHero index (docs/io-voice-plan.md
   §4.2, §4.4): public/io-index.json is fetched on the first lookup(),
   never on page load; scoring is BM25-style with a title boost, Georgian
   prefix stems and a small synonym map; the top chunks come back as text
   for the model. In a dev serve an optional, gitignored Basic Course
   index (src/voice/tutor/local/basic.json) is fetched from the dev server
   as well; a build never contains it. */

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {}
const BASE = ENV.BASE_URL || '/'

export const SYNONYMS = [
  ['ორმაგი ავთენტიფიკაცია', 'ორფაქტორიანი', 'მრავალფაქტორიანი', '2fa', 'mfa', 'two-factor', 'two factor', 'ორმაგი'],
  ['ფიშინგი', 'phishing', 'ფიშინგ'],
  ['დეზინფორმაცია', 'ყალბი ამბები', 'fake news', 'disinformation', 'ყალბი'],
  ['დიპფეიკი', 'deepfake', 'დიპფეიქი'],
  ['პაროლი', 'password', 'პაროლები'],
  ['თაღლითობა', 'scam', 'scams', 'თაღლითი'],
  ['კიბერბულინგი', 'ბულინგი', 'cyberbullying', 'bullying'],
  ['შანტაჟი', 'blackmail', 'sextortion'],
  ['უცნობი', 'stranger', 'grooming', 'გრუმინგი'],
]

const STOP = new Set(
  'the a an and or of to in is are was what how do does i my me you your it for on with not this that about რა როგორ არის და ან რომ თუ მე თქვენ ჩემი თქვენი ის ეს არ არა ვინ ხართ ვარ უნდა შეიძლება მინდა'.split(' '),
)

export function tokens(text) {
  return (String(text || '').toLowerCase().match(/[a-z0-9]+|[ა-ჰ]+/g) || []).filter((w) => w.length > 1 && !STOP.has(w))
}

/* Georgian inflects at the end: a stem is the token minus two letters
   (min 4); an English plural loses its s (deepfakes → deepfake) */
export const stem = (t) => {
  if (/^[ა-ჰ]/.test(t)) return t.length > 5 ? t.slice(0, Math.max(4, t.length - 2)) : t
  return t.length > 4 && /[a-z]s$/.test(t) && !/ss$/.test(t) ? t.slice(0, -1) : t
}

export function expandQuery(query) {
  const q = query.toLowerCase()
  const extra = []
  for (const group of SYNONYMS) if (group.some((g) => q.includes(g))) extra.push(...group)
  return [...new Set([...tokens(query), ...tokens(extra.join(' '))])]
}

/* index-wide statistics, cached per chunk array */
const stats = new WeakMap()
function statsFor(chunks) {
  let s = stats.get(chunks)
  if (s) return s
  const docs = chunks.map((c) => {
    const body = tokens(`${c.en} ${c.ka}`).map(stem)
    const title = tokens(`${c.title?.en || ''} ${c.title?.ka || ''}`).map(stem)
    const tf = new Map()
    for (const t of body) tf.set(t, (tf.get(t) || 0) + 1)
    return { tf, title: new Set(title), len: body.length }
  })
  const df = new Map()
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) || 0) + 1)
  const avg = docs.reduce((a, d) => a + d.len, 0) / (docs.length || 1)
  s = { docs, df, avg, n: docs.length }
  stats.set(chunks, s)
  return s
}

/* BM25 with a title boost; returns [{ chunk, score }] sorted */
export function scoreChunks(chunks, query, { topN = 3, k1 = 1.4, b = 0.6 } = {}) {
  const terms = expandQuery(query).map(stem)
  if (!terms.length || !chunks.length) return []
  const { docs, df, avg, n } = statsFor(chunks)
  const scored = []
  docs.forEach((d, i) => {
    let score = 0
    for (const t of terms) {
      const tf = d.tf.get(t) || 0
      if (!tf && !d.title.has(t)) continue
      const idf = Math.log(1 + (n - (df.get(t) || 0) + 0.5) / ((df.get(t) || 0) + 0.5))
      const norm = tf ? (tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * d.len) / avg)) : 0
      score += idf * norm + (d.title.has(t) ? idf * 1.5 : 0)
    }
    if (score > 0) scored.push({ chunk: chunks[i], score })
  })
  scored.sort((a, b2) => b2.score - a.score)
  return scored.slice(0, topN)
}

/* the text the model gets */
export function formatChunks(chunks, lang = 'ka', maxChars = 600) {
  return chunks
    .map((c, i) => {
      const title = c.title?.[lang] || c.title?.en || ''
      const text = (lang === 'ka' ? c.ka || c.en : c.en || c.ka).slice(0, maxChars)
      return `[${i + 1}] ${title}\n${text}`
    })
    .join('\n\n')
}

let indexPromise = null
async function fetchJson(url, fetchImpl) {
  const res = await fetchImpl(url)
  if (!res.ok) throw new Error(`${url}: ${res.status}`)
  return res.json()
}

/* the CyberHero chunks (+ the dev-only course chunks when present) */
export function loadIndex({ fetchImpl = globalThis.fetch, base = BASE, devServe = typeof __IO_DEV_SERVE__ !== 'undefined' && __IO_DEV_SERVE__ === true } = {}) {
  if (!indexPromise) {
    indexPromise = (async () => {
      const main = await fetchJson(`${base}io-index.json`, fetchImpl)
      let chunks = main.chunks || []
      if (devServe) {
        try {
          const local = await fetchJson(`${base}src/voice/tutor/local/basic.json`, fetchImpl)
          if (Array.isArray(local.chunks)) chunks = [...chunks, ...local.chunks]
        } catch {
          /* no local course index: fine */
        }
      }
      return chunks
    })().catch((err) => {
      indexPromise = null
      throw err
    })
  }
  return indexPromise
}

export function resetIndex() {
  indexPromise = null
}

export async function lookup(query, lang = 'ka', { topN = 3, ...opts } = {}) {
  const chunks = await loadIndex(opts)
  const hits = scoreChunks(chunks, query, { topN }).map((h) => h.chunk)
  return { chunks: hits, text: formatChunks(hits, lang) }
}
