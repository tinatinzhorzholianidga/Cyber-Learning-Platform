/* Helpers for the Node scripts: .env.local reading, argument parsing and
   key masking. The key is never printed - every message that could carry
   it (SDK errors include the WebSocket URL) goes through mask(). */
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const ROOT = fileURLToPath(new URL('../../', import.meta.url))

/* KEY=value lines; `#` comments; optional single or double quotes. */
export function parseDotenv(text) {
  const out = {}
  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    } else {
      value = value.replace(/\s+#.*$/, '') // trailing comment
    }
    out[key] = value
  }
  return out
}

/* .env then .env.local (later wins), without touching process.env. */
export function loadLocalEnv(root = ROOT) {
  const merged = {}
  for (const name of ['.env', '.env.local']) {
    const p = `${root}${name}`
    if (existsSync(p)) Object.assign(merged, parseDotenv(readFileSync(p, 'utf8')))
  }
  return merged
}

/* process.env wins over the files. */
export function geminiKey(root = ROOT) {
  return process.env.IO_GEMINI_KEY || loadLocalEnv(root).IO_GEMINI_KEY || ''
}

/* A description that is safe to print. */
export function keyDescription(key) {
  if (!key) return 'none'
  const shape = /^AIza[0-9A-Za-z_-]{35}$/.test(key) ? 'AI Studio key shape' : 'unexpected shape'
  return `${key.length} chars, ${shape}`
}

export function mask(text, key) {
  let s = String(text ?? '')
  if (key) s = s.split(key).join('***')
  return s.replace(/AIza[0-9A-Za-z_-]{35}/g, 'AIza***').replace(/([?&](?:key|access_token)=)[^&\s'"]+/g, '$1***')
}

/* --flag, --k=v, --k v  →  { flag: true, k: 'v', _: [positional] } */
export function parseArgs(argv) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) {
      out._.push(a)
      continue
    }
    const body = a.slice(2)
    const eq = body.indexOf('=')
    if (eq >= 0) out[body.slice(0, eq)] = body.slice(eq + 1)
    else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) out[body] = argv[++i]
    else out[body] = true
  }
  return out
}

/* Fixed-width console table. */
export function table(rows, headers) {
  const all = headers ? [headers, ...rows] : rows
  const widths = []
  for (const r of all) r.forEach((c, i) => (widths[i] = Math.max(widths[i] || 0, String(c ?? '').length)))
  const line = (r) => r.map((c, i) => String(c ?? '').padEnd(widths[i])).join('  ').trimEnd()
  const out = []
  if (headers) {
    out.push(line(headers))
    out.push(widths.map((w) => '-'.repeat(w)).join('  '))
  }
  for (const r of rows) out.push(line(r))
  return out.join('\n')
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export function withTimeout(promise, ms, message) {
  let t
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error(message || `timed out after ${ms} ms`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t))
}
