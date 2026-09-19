/* Post-build checks (runs as `postbuild`, see docs/io-voice-plan.md §5.4, §9).

   1. No API key in any shipped text file: full key shapes only, so that
      minified code cannot false-positive on a short prefix.
   2. No Basic Course text in a build (the course belongs to its owners and
      sits behind the Moodle login; only a gitignored dev copy may exist).
   3. The welcome page must not get heavier: the JS and CSS files that
      index.html references stay within a small budget of the measured
      baseline, and the voice code is a separate chunk that index.html
      does not reference.
   4. No dev-only chunk (the bake-off panel) is emitted at all. */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { COURSE_SENTENCE } from './lib/lint.mjs'

const DIST = fileURLToPath(new URL('../dist/', import.meta.url))
// baseline: an untouched IO-for-main-page dc8a296 build, gzipped with
// zlib's default level - the same figure Vite prints (docs/io-voice-plan.md §9)
const BASE_JS_GZ = 282152
const BASE_CSS_GZ = 14306
const JS_BUDGET = 4 * 1024
const CSS_BUDGET = 1024
const KEY_PATTERNS = [/AIza[0-9A-Za-z_-]{35}/, /AQ\.[A-Za-z0-9_-]{20,}/]
// COURSE_SENTENCE (scripts/lib/lint.mjs): one sentence of the Basic
// Cybersecurity Course that never appears in the site's own copy

let failed = false
const fail = (m) => {
  failed = true
  console.log('  error', m)
}
const ok = (m) => console.log('  ok   ', m)

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

let files
try {
  files = walk(DIST)
} catch {
  console.log('  error dist/ not found - run `npm run build` first')
  process.exit(1)
}

/* 1 + 2: scan shipped text files */
for (const f of files.filter((p) => /\.(js|css|html|json|svg|txt)$/.test(p))) {
  const text = readFileSync(f, 'utf8')
  for (const re of KEY_PATTERNS) {
    if (re.test(text)) fail(`${f.replace(DIST, 'dist/')}: contains something shaped like an API key (${re})`)
  }
  if (text.includes(COURSE_SENTENCE)) fail(`${f.replace(DIST, 'dist/')}: contains Basic Course text`)
}
if (!failed) ok('no key shapes, no course text in shipped files')

/* 3: the initial chunk */
const html = readFileSync(join(DIST, 'index.html'), 'utf8')
const refs = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((m) => m[1])
const gz = (p) => gzipSync(readFileSync(p)).length
const local = (ref) => join(DIST, ref.replace(/^\/IO-for-main-page\//, '').replace(/^\//, ''))
let jsGz = 0
let cssGz = 0
let jsCount = 0
for (const ref of refs) {
  const p = local(ref)
  const size = gz(p)
  if (ref.endsWith('.js')) {
    jsCount += 1
    jsGz += size
  } else cssGz += size
  console.log(`  size  ${ref}  ${size} B gzipped`)
}
if (jsCount !== 1) fail(`index.html references ${jsCount} JS files; expected exactly one (the voice chunk must load on demand)`)
if (jsGz > BASE_JS_GZ + JS_BUDGET) fail(`initial JS is ${jsGz} B gzipped, more than ${BASE_JS_GZ} + ${JS_BUDGET} (docs/io-voice-plan.md §9)`)
else ok(`initial JS ${jsGz} B gzipped (baseline ${BASE_JS_GZ}, budget +${JS_BUDGET})`)
if (cssGz > BASE_CSS_GZ + CSS_BUDGET) fail(`initial CSS is ${cssGz} B gzipped, more than ${BASE_CSS_GZ} + ${CSS_BUDGET}`)
else ok(`initial CSS ${cssGz} B gzipped (baseline ${BASE_CSS_GZ}, budget +${CSS_BUDGET})`)

/* 4: dev-only code never ships */
for (const f of files) {
  if (/Bakeoff/i.test(f)) fail(`${f.replace(DIST, 'dist/')}: the bake-off panel is dev-only and must not be built`)
}

console.log(failed ? '\ncheck-dist: FAILED' : '\ncheck-dist: ok')
process.exit(failed ? 1 : 0)
