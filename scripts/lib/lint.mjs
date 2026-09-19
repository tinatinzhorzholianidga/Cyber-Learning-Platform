/* Shared string checks for IO's Georgian/English text.

   The rules come from src/content/hints.js and were first implemented in
   scripts/check-hints.mjs; they now live here so check-hints.mjs (host
   lines) and check-voice.mjs (talk-mode strings) apply exactly the same
   regexes. Behaviour and messages are identical to the original script. */

export const MAX_LEN = 110
export const TIP_WORDS = /(პაროლ|ფიშინგ|ანტივირუს|password|phishing|antivirus|two-factor|2fa|update your|განაახლ)/i
export const EMOJI = /\p{Extended_Pictographic}/gu
export const LATIN_ALLOW = ['English', 'CyberHero', 'IO', 'DGA', 'elearning.gov.ge']
/* a `{name}` slot a string fills at run time (tutor/strings.js `returning`) */
export const PLACEHOLDER = /\{[a-z_]+\}/g
/* one sentence of the Basic Cybersecurity Course that never appears in the
   site's own copy: check-dist.mjs greps builds for it, check-voice.mjs the
   committed index (docs/io-voice-plan.md §4.4, A6) */
export const COURSE_SENTENCE = 'USB Baiting არის სოციალური ინჟინერიის ერთ-ერთი ფორმა'

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/* Check one { en, ka } pair. `label` is e.g. `greeting[0]` or `voice.talk`.
   Options:
     maxLen        bubble-friendly length (warning); null disables
     emojiMax      at most this many emoji per language (warning)
     tipCheck      warn when a line looks like a cyber tip (host lines only)
     latinAllow    words that may appear in Latin letters inside Georgian
     noDots        error on "..." (voice strings use the single … character)
     placeholders  `{name}` slots are not Latin leaks (talk-mode strings)
   Returns { errors: string[], warnings: string[] } with the same wording
   check-hints.mjs has always printed. */
export function lintPair(label, line, opts = {}) {
  const {
    maxLen = MAX_LEN,
    emojiMax = 1,
    tipCheck = false,
    latinAllow = LATIN_ALLOW,
    noDots = false,
    placeholders = false,
  } = opts
  const errors = []
  const warnings = []
  const present = { en: false, ka: false }

  for (const l of ['en', 'ka']) {
    const s = line?.[l]
    if (typeof s !== 'string' || !s.trim()) {
      errors.push(`${label}.${l}: missing`)
      continue
    }
    present[l] = true
    if (maxLen != null && s.length > maxLen) warnings.push(`${label}.${l}: ${s.length} chars (> ${maxLen})`)
    const emojis = s.match(EMOJI) || []
    if (emojis.length > emojiMax) warnings.push(`${label}.${l}: ${emojis.length} emoji`)
    if (tipCheck && TIP_WORDS.test(s)) warnings.push(`${label}.${l}: looks like a cyber tip - "${s}"`)
    if (noDots && s.includes('...')) errors.push(`${label}.${l}: three dots - use the single … character`)
  }

  if (present.ka) {
    // Latin letters inside a Georgian line are usually a leaked
    // translation (brand names like CyberHero / English are allowed)
    const allow = new RegExp(latinAllow.map(escapeRe).join('|'), 'g')
    const stripped = (placeholders ? line.ka.replace(PLACEHOLDER, '') : line.ka).replace(allow, '')
    if (/[a-z]/i.test(stripped)) warnings.push(`${label}.ka: contains Latin letters - "${line.ka}"`)
  }
  // typography (Georgian orthography, §6.9): a hyphen never stands in
  // for a dash - use the spaced em dash " — "; quotes are „…“
  for (const l of ['en', 'ka']) {
    if (present[l] && / - /.test(line[l])) errors.push(`${label}.${l}: hyphen used as a dash - write " — "`)
  }
  if (present.ka) {
    const open = (line.ka.match(/„/g) || []).length
    const close = (line.ka.match(/“/g) || []).length
    if (/["”]/.test(line.ka) || open !== close) errors.push(`${label}.ka: use Georgian quotes „…“ - "${line.ka}"`)
  }
  return { errors, warnings }
}

/* Small reporter shared by the check scripts: prints "  error …" /
   "  warn  …" lines and the closing count, exits 1 on errors. */
export function createReporter() {
  let errors = 0
  let warnings = 0
  return {
    err(m) {
      errors += 1
      console.log('  error', m)
    },
    warn(m) {
      warnings += 1
      console.log('  warn ', m)
    },
    apply(result) {
      result.errors.forEach((m) => this.err(m))
      result.warnings.forEach((m) => this.warn(m))
    },
    finish() {
      console.log(`\n${errors} error(s), ${warnings} warning(s)`)
      process.exit(errors ? 1 : 0)
    },
    get errors() {
      return errors
    },
    get warnings() {
      return warnings
    },
  }
}
