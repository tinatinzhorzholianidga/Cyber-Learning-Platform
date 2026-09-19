/* Checks for the talk-mode side of IO (see docs/io-voice-plan.md §6.3).

   Runs with `npm run check` after check-hints.mjs. Every rule that applies
   to a file which does not exist yet is skipped, so the script is useful
   from Phase D1 on and grows with the phases:

   - src/i18n/ui.js         ka/en key and array-length parity; voice.* pairs
                            linted with the hints.js rules (voice strings may
                            not use "...", have no emoji, and may name the
                            browser/speech vendors)
   - src/voice/i18n.js      the voice.* table in the lazy chunk, same rules
   - src/voice/tutor/strings.js   scripted talk-mode lines, same rules
   - src/voice/tutor/persona.js   must contain no telephone number or hotline
                            (three or more consecutive digits)
   - src/content/safety.js  placeholders are a warning, or an error when
                            VITE_IO_SAFETY_REQUIRED=1 (production builds) */
import { existsSync, readFileSync } from 'node:fs'
import { UI } from '../src/i18n/ui.js'
import { lintPair, createReporter, LATIN_ALLOW } from './lib/lint.mjs'

const report = createReporter()
const root = new URL('..', import.meta.url)
const rel = (p) => new URL(p, root)
const VOICE_LATIN_ALLOW = [...LATIN_ALLOW, 'Google', 'Microsoft', 'Gemini', 'Esc', 'Chrome', 'Edge', 'Safari', 'Firefox', 'Ollama']
const VOICE_OPTS = { emojiMax: 0, tipCheck: false, latinAllow: VOICE_LATIN_ALLOW, noDots: true }

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
}

/* ---- persona.js must not carry hotline numbers (the brief: resources
   come only from src/content/safety.js, filled in by the DGA team) ---- */
if (existsSync(rel('src/voice/tutor/persona.js'))) {
  const src = readFileSync(rel('src/voice/tutor/persona.js'), 'utf8')
  const hit = src.match(/\d{3,}/)
  if (hit) report.err(`persona.js: contains the number "${hit[0]}" - numbers, hotlines and organisation names belong in src/content/safety.js`)
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
}

report.finish()
