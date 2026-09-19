import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SYNONYMS, tokens, stem, expandQuery, scoreChunks, formatChunks, loadIndex, resetIndex, lookup } from '../src/voice/tutor/lookup.js'

const FIXTURE = [
  { source: 'guide', ref: 'a2', title: { en: 'Guide: Phishing', ka: 'გზამკვლევი: ფიშინგი' }, en: 'Phishing messages pretend to come from a bank. Check the sender before you click.', ka: 'ფიშინგური წერილები ბანკის სახელით მოდის. დაწკაპუნებამდე გამგზავნი შეამოწმეთ.' },
  { source: 'mission', ref: 'g3', title: { en: 'Mission: Password Forge', ka: 'მისია: პაროლების სამჭედლო' }, en: 'A strong password is long and unique. Use a passphrase.', ka: 'ძლიერი პაროლი გრძელი და უნიკალურია. გამოიყენეთ ფრაზა.' },
  { source: 'guide', ref: 'b3', title: { en: 'Guide: Two-factor', ka: 'გზამკვლევი: ორმაგი ავთენტიფიკაცია' }, en: 'Turn it on for email and banking. A code from your phone confirms the login.', ka: 'ჩართეთ ელფოსტასა და ბანკზე. ტელეფონის კოდი შესვლას ადასტურებს.' },
  { source: 'tip', ref: 'tip-1', title: { en: 'IO tip', ka: 'იოს რჩევა' }, en: 'Back up your photos every month so a lost phone is not a lost life.', ka: 'ფოტოების სარეზერვო ასლი ყოველთვიურად გააკეთეთ.' },
]

beforeEach(() => resetIndex())

test('tokens drop stop words and one-letter bits; stems trim inflections', () => {
  assert.deepEqual(tokens('რა არის ფიშინგი? What is the phishing!'), ['ფიშინგი', 'phishing'])
  assert.deepEqual(tokens(''), [])
  assert.equal(stem('ფიშინგური'), 'ფიშინგუ')
  assert.equal(stem('პაროლი'), 'პარო')
  assert.equal(stem('კოდი'), 'კოდი')
  assert.equal(stem('deepfakes'), 'deepfake')
  assert.equal(stem('scams'), 'scam')
  assert.equal(stem('class'), 'class')
  assert.equal(stem('is'), 'is')
})

test('expandQuery adds the synonym group of a matched phrase', () => {
  const q = expandQuery('რა არის 2fa?')
  assert.ok(q.includes('2fa') && q.includes('ორმაგი') && q.includes('ავთენტიფიკაცია') && q.includes('mfa'))
  assert.deepEqual(expandQuery('ბალახი'), ['ბალახი'])
  assert.ok(SYNONYMS.every((g) => g.length >= 2))
})

test('scoreChunks ranks by BM25 with a title boost and respects topN', () => {
  const hits = scoreChunks(FIXTURE, 'რა არის ფიშინგი?')
  assert.equal(hits[0].chunk.ref, 'a2')
  assert.ok(hits[0].score > 0)
  assert.equal(hits.length, 1)
  assert.equal(scoreChunks(FIXTURE, 'password', { topN: 1 })[0].chunk.ref, 'g3')
  assert.equal(scoreChunks(FIXTURE, 'ორმაგი ავთენტიფიკაცია')[0].chunk.ref, 'b3')
  // a term only in the title still scores the chunk
  assert.equal(scoreChunks(FIXTURE, 'forge')[0].chunk.ref, 'g3')
  assert.deepEqual(scoreChunks(FIXTURE, 'რა არის'), [])
  assert.deepEqual(scoreChunks([], 'phishing'), [])
  assert.deepEqual(scoreChunks(FIXTURE, 'ბალახი'), [])
  assert.equal(scoreChunks(FIXTURE, 'phone', { topN: 5 }).length, 2)
})

test('formatChunks numbers the passages in the session language and caps their length', () => {
  const text = formatChunks(FIXTURE.slice(0, 2), 'ka', 30)
  assert.equal(text, `[1] გზამკვლევი: ფიშინგი\n${FIXTURE[0].ka.slice(0, 30)}\n\n[2] მისია: პაროლების სამჭედლო\n${FIXTURE[1].ka.slice(0, 30)}`)
  assert.match(formatChunks(FIXTURE.slice(0, 1), 'en'), /^\[1\] Guide: Phishing\nPhishing messages/)
  assert.equal(formatChunks([{ title: { en: 'T' }, en: 'only english' }], 'ka'), '[1] T\nonly english')
})

test('loadIndex fetches once, merges the dev-only local course and survives its absence', async () => {
  const calls = []
  const fetchImpl = async (url) => {
    calls.push(url)
    if (url.endsWith('io-index.json')) return { ok: true, json: async () => ({ v: 1, chunks: FIXTURE }) }
    if (url.endsWith('basic.json')) return { ok: true, json: async () => ({ chunks: [{ source: 'course', ref: 'basic-3', title: { en: 'Basic Course, topic 3', ka: 'თემა 3' }, en: '', ka: 'კურსის ტექსტი ფიშინგზე'.repeat(3) }] }) }
    return { ok: false, status: 404 }
  }
  const chunks = await loadIndex({ fetchImpl, base: '/x/', devServe: true })
  assert.equal(chunks.length, 5)
  assert.deepEqual(calls, ['/x/io-index.json', '/x/src/voice/tutor/local/basic.json'])
  await loadIndex({ fetchImpl, base: '/x/', devServe: true })
  assert.equal(calls.length, 2, 'cached')
  resetIndex()
  const noLocal = await loadIndex({ fetchImpl: async (url) => (url.endsWith('io-index.json') ? { ok: true, json: async () => ({ chunks: FIXTURE }) } : { ok: false, status: 404 }), base: '/x/', devServe: true })
  assert.equal(noLocal.length, 4)
  resetIndex()
  const build = await loadIndex({ fetchImpl, base: '/x/', devServe: false })
  assert.equal(build.length, 4, 'a build never asks for the local course')
  resetIndex()
  await assert.rejects(loadIndex({ fetchImpl: async () => ({ ok: false, status: 500 }), base: '/x/', devServe: false }), /io-index.json: 500/)
  // a failed load is not cached
  const ok = await loadIndex({ fetchImpl, base: '/x/', devServe: false })
  assert.equal(ok.length, 4)
})

test('lookup returns the top chunks and their text', async () => {
  const fetchImpl = async () => ({ ok: true, json: async () => ({ chunks: FIXTURE }) })
  const r = await lookup('ფიშინგი', 'ka', { fetchImpl, base: '/', devServe: false })
  assert.equal(r.chunks[0].ref, 'a2')
  assert.match(r.text, /^\[1\] გზამკვლევი: ფიშინგი/)
  const none = await lookup('ბალახი', 'ka', { fetchImpl, base: '/', devServe: false })
  assert.deepEqual(none, { chunks: [], text: '' })
})

test('the committed CyberHero index answers the acceptance questions', async () => {
  const raw = JSON.parse(readFileSync(new URL('../public/io-index.json', import.meta.url), 'utf8'))
  const fetchImpl = async () => ({ ok: true, json: async () => raw })
  assert.ok(raw.count >= 300)
  const phishing = await lookup('რა არის ფიშინგი?', 'ka', { fetchImpl, base: '/', devServe: false })
  assert.equal(phishing.chunks.length, 3)
  assert.ok(['a2', 'g1'].includes(phishing.chunks[0].ref))
  assert.ok(phishing.text.length <= 3 * 700 + 200)
  assert.ok(!/USB Baiting/.test(JSON.stringify(raw)), 'no course text in the index (A6)')
  const en = await lookup('what is a strong password', 'en', { fetchImpl, base: '/', devServe: false })
  assert.ok(en.chunks.length >= 1)
  assert.ok(!/[ა-ჰ]/.test(en.text.split('\n')[1]), 'English passages for an English learner')
})
