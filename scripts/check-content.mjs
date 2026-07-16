// Content QA: schema, bilingual completeness, word counts, mixed-script,
// branch-graph integrity, i18n dict parity. Run: node scripts/check-content.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
let errors = 0
let warnings = 0
const err = (msg) => {
  errors++
  console.log(`  ERROR ${msg}`)
}
const warn = (msg) => {
  warnings++
  console.log(`  warn  ${msg}`)
}

const MIXED = /[Ⴀ-ჿ][a-zA-Z]|[a-zA-Z][Ⴀ-ჿ]/

function collectLeaves(node, path, out) {
  if (node == null) return
  if (typeof node === 'object' && !Array.isArray(node)) {
    const keys = Object.keys(node)
    if (keys.includes('en') || keys.includes('ka')) {
      out.push({ path, en: node.en, ka: node.ka })
      return
    }
    for (const k of keys) collectLeaves(node[k], `${path}.${k}`, out)
    return
  }
  if (Array.isArray(node)) node.forEach((v, i) => collectLeaves(v, `${path}[${i}]`, out))
}

function checkLeaves(obj, label) {
  const leaves = []
  collectLeaves(obj, label, leaves)
  for (const leaf of leaves) {
    if (typeof leaf.en !== 'string' || !leaf.en.trim()) err(`${leaf.path}: missing en`)
    if (typeof leaf.ka !== 'string' || !leaf.ka.trim()) err(`${leaf.path}: missing ka`)
    if (typeof leaf.ka === 'string' && MIXED.test(leaf.ka)) err(`${leaf.path}: mixed script in ka: "${leaf.ka.match(/.{0,12}(?:[Ⴀ-ჿ][a-zA-Z]|[a-zA-Z][Ⴀ-ჿ]).{0,12}/)?.[0]}"`)
    if (typeof leaf.ka === 'string' && leaf.en && leaf.ka === leaf.en && /[a-zA-Z]{4,}/.test(leaf.en) && !/^[\d\s+·A-Za-z0-9@._:/-]+$/.test(leaf.en)) {
      warn(`${leaf.path}: ka identical to en`)
    }
  }
  return leaves
}

const words = (leaves, lang) =>
  leaves.reduce((n, l) => n + (typeof l[lang] === 'string' ? l[lang].split(/\s+/).filter(Boolean).length : 0), 0)

console.log('— Articles —')
const { ARTICLES } = await import(join(root, 'src/content/parents/index.js'))
const expected = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'b1', 'b2', 'b3', 'b4', 'b5', 'c1', 'c2', 'c3', 'c4']
for (const id of expected) {
  const a = ARTICLES.find((x) => x.id === id)
  if (!a) {
    err(`article ${id} missing from registry`)
    continue
  }
  for (const field of ['shelf', 'order', 'emoji', 'color', 'minutes', 'title', 'teaser', 'lead', 'body']) {
    if (a[field] == null) err(`${id}: missing field ${field}`)
  }
  if (!Array.isArray(a.sources) || a.sources.length === 0) warn(`${id}: no sources`)
  const leaves = checkLeaves(a, id)
  const en = words(leaves, 'en')
  const ka = words(leaves, 'ka')
  if (en < 450) err(`${id}: EN too short (${en} words)`)
  else if (en < 550 || en > 1200) warn(`${id}: EN word count ${en} (target 600–1000)`)
  if (ka < 0.55 * en) err(`${id}: KA suspiciously short (${ka} vs EN ${en}) — abridged translation?`)
  console.log(`  ${id}: EN ${en}w · KA ${ka}w`)
}

console.log('— Missions —')
const { MISSIONS, missionMax, roundMax } = await import(join(root, 'src/content/guardians/index.js'))
const ROUND_TYPES = new Set(['choice', 'flags', 'builder', 'branch'])
for (const m of MISSIONS) {
  if (!m.brief) err(`${m.id}: missing brief`)
  if (!Array.isArray(m.takeaways) || m.takeaways.length < 3) err(`${m.id}: needs ≥3 takeaways`)
  if (!Array.isArray(m.rounds) || m.rounds.length === 0) {
    err(`${m.id}: no rounds`)
    continue
  }
  if (JSON.stringify(m).includes('PLACEHOLDER') || JSON.stringify(m.brief).includes('coming')) warn(`${m.id}: looks like placeholder`)
  m.rounds.forEach((r, i) => {
    const tag = `${m.id}.rounds[${i}]`
    if (!ROUND_TYPES.has(r.type)) return err(`${tag}: bad type ${r.type}`)
    if (r.type === 'choice') {
      if (!r.q || !Array.isArray(r.options) || !r.explain) err(`${tag}: choice needs q/options/explain`)
      else if (r.options.filter((o) => o.correct).length !== 1) err(`${tag}: needs exactly 1 correct option`)
    }
    if (r.type === 'flags') {
      if (!r.prompt || !Array.isArray(r.items) || !r.explain) err(`${tag}: flags needs prompt/items/explain`)
      else {
        if (!r.items.some((it) => it.flag)) err(`${tag}: no flagged items`)
        r.items.forEach((it, j) => {
          if (!it.explain) err(`${tag}.items[${j}]: missing explain`)
        })
      }
    }
    if (r.type === 'builder') {
      if (!r.prompt || !r.target || !Array.isArray(r.options) || !r.explain || !r.meterLow || !r.meterHigh)
        err(`${tag}: builder needs prompt/target/options/explain/meterLow/meterHigh`)
      else {
        const maxPos = r.options.filter((o) => o.value > 0).reduce((s, o) => s + o.value, 0)
        if (maxPos < r.target) err(`${tag}: target ${r.target} unreachable (max +${maxPos})`)
      }
    }
    if (r.type === 'branch') {
      if (!r.start || !r.nodes || !r.max) return err(`${tag}: branch needs start/nodes/max`)
      const seen = new Set()
      let reachedEnd = false
      const stack = [r.start]
      while (stack.length) {
        const id = stack.pop()
        if (seen.has(id)) continue
        seen.add(id)
        const node = r.nodes[id]
        if (!node) {
          err(`${tag}: node "${id}" referenced but missing`)
          continue
        }
        if (node.end) {
          reachedEnd = true
          continue
        }
        if (!Array.isArray(node.choices) || node.choices.length === 0) {
          err(`${tag}: node "${id}" is a dead end (no choices, not end)`)
          continue
        }
        node.choices.forEach((c) => {
          if (!c.next) err(`${tag}: node "${id}" has choice without next`)
          else stack.push(c.next)
          if (c.points > 0 && !c.feedback) warn(`${tag}: node "${id}" scoring choice without feedback`)
        })
      }
      if (!reachedEnd) err(`${tag}: no path reaches an end node`)
      for (const id of Object.keys(r.nodes)) if (!seen.has(id)) warn(`${tag}: node "${id}" unreachable`)
      // best-path sanity: max should be attainable
      const best = (function bestFrom(id, visited) {
        if (visited.has(id)) return 0
        const node = r.nodes[id]
        if (!node || node.end) return 0
        const v = new Set(visited).add(id)
        return Math.max(...node.choices.map((c) => (c.points || 0) + bestFrom(c.next, v)))
      })(r.start, new Set())
      if (best < r.max) err(`${tag}: declared max ${r.max} but best path earns ${best}`)
      if (best > r.max) warn(`${tag}: best path earns ${best} > declared max ${r.max} (capped)`)
    }
  })
  checkLeaves({ brief: m.brief, rounds: m.rounds, takeaways: m.takeaways, helpStrip: m.helpStrip }, m.id)
  console.log(`  ${m.id}: ${m.rounds.length} rounds, max ${missionMax(m)} (${m.rounds.map(roundMax).join('+')})${m.timer ? `, timer ${m.timer}s` : ''}${m.passRatio ? `, pass ${m.passRatio * 100}%` : ''}`)
}
const g10 = MISSIONS.find((m) => m.id === 'g10')
if (g10 && (!g10.timer || !g10.passRatio)) err('g10: must have timer and passRatio')

console.log('— i18n dict parity —')
const en = (await import(join(root, 'src/i18n/en.js'))).default
const ka = (await import(join(root, 'src/i18n/ka.js'))).default
function compareKeys(a, b, path, missingIn) {
  for (const k of Object.keys(a)) {
    if (!(k in b)) err(`i18n: "${path}${k}" missing in ${missingIn}`)
    else if (typeof a[k] === 'object') compareKeys(a[k], b[k], `${path}${k}.`, missingIn)
  }
}
compareKeys(en, ka, '', 'ka')
compareKeys(ka, en, '', 'en')
;(function scanStrings(node, path) {
  if (typeof node === 'string') {
    if (MIXED.test(node)) err(`i18n ka dict ${path}: mixed script`)
    return
  }
  if (node && typeof node === 'object') for (const k of Object.keys(node)) scanStrings(node[k], `${path}.${k}`)
})(ka, 'ka')

console.log(`\n${errors} error(s), ${warnings} warning(s)`)
process.exit(errors ? 1 : 0)
