#!/usr/bin/env node
/* Builds the retrieval index the tutor grounds on (docs/io-voice-plan.md
   §4.4, A6): the public CyberHero content - the ten missions, the parent
   and teacher guides and IO's tips - read straight from git (default
   `origin/main`), chunked by scripts/lib/ioChunks.mjs and written to
   public/io-index.json, which is committed and fetched on first use.

   The Basic Course is NOT indexed here. With `--local-course <ref:path>`
   (e.g. origin/main:src/content/ioCourse.js) a second, gitignored file
   src/voice/tutor/local/basic.json is written for a dev-only demo on the
   presenter's machine; it never enters a build (scripts/check-dist.mjs).

   Usage: npm run build:index [-- --ref origin/main] [--local-course <ref:path>] */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'
import { buildChunks, buildCourseChunks } from './lib/ioChunks.mjs'
import { parseArgs, ROOT } from './lib/env.mjs'

const args = parseArgs(process.argv.slice(2))
const REF = String(args.ref || 'origin/main')
const CONTENT = ['src/content/guardians', 'src/content/parents', 'src/content/mascot.js']

const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

/* copy a git tree into a temp folder so the content modules can import each other */
function materialise(ref, paths, dir) {
  const files = git('ls-tree', '-r', '--name-only', ref, '--', ...paths).split('\n').filter(Boolean)
  for (const f of files) {
    const target = join(dir, f)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, git('show', `${ref}:${f}`))
  }
  return files
}

const work = join(tmpdir(), `io-index-${process.pid}`)
try {
  const files = materialise(REF, CONTENT, work)
  console.log(`read ${files.length} content files from ${REF}`)
  const { MISSIONS } = await import(pathToFileURL(join(work, 'src/content/guardians/index.js')).href)
  const { ARTICLES } = await import(pathToFileURL(join(work, 'src/content/parents/index.js')).href)
  const { MASCOT_TIPS } = await import(pathToFileURL(join(work, 'src/content/mascot.js')).href)
  const chunks = buildChunks({ missions: MISSIONS, articles: ARTICLES, tips: MASCOT_TIPS })
  const commit = git('rev-parse', '--short', REF).trim()
  const out = { v: 1, source: `${REF}@${commit}`, builtAt: new Date().toISOString().slice(0, 10), count: chunks.length, chunks }
  const file = `${ROOT}public/io-index.json`
  mkdirSync(`${ROOT}public`, { recursive: true })
  writeFileSync(file, JSON.stringify(out))
  const bytes = statSync(file).size
  const by = chunks.reduce((acc, c) => ((acc[c.source] = (acc[c.source] || 0) + 1), acc), {})
  console.log(`wrote public/io-index.json: ${chunks.length} chunks (${JSON.stringify(by)}), ${bytes} B, ${gzipSync(JSON.stringify(out)).length} B gzipped`)

  if (args['local-course']) {
    const [ref, ...rest] = String(args['local-course']).split(':')
    const path = rest.join(':')
    if (!path) throw new Error('--local-course expects <git ref>:<path>')
    const target = join(work, 'course', path)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, git('show', `${ref}:${path}`))
    const mod = await import(pathToFileURL(target).href)
    const course = mod.IO_COURSE || mod.default
    const courseChunks = buildCourseChunks(course)
    const localDir = `${ROOT}src/voice/tutor/local`
    mkdirSync(localDir, { recursive: true })
    writeFileSync(`${localDir}/basic.json`, JSON.stringify({ v: 1, source: `${ref}:${path}`, count: courseChunks.length, chunks: courseChunks }))
    console.log(`wrote src/voice/tutor/local/basic.json (gitignored, dev-only): ${courseChunks.length} course chunks`)
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}
