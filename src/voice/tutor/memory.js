/* The learner's profile (brief Phase 5; docs/io-voice-plan.md §5.8):
   localStorage['io.learner.v1'], at most ten sessions, first name only if
   volunteered, and summarise() - the ≤ 300-character text the persona
   gets. Every storage access sits in try/catch with an in-memory fallback
   (private mode, blocked storage). forget() wipes it (Delete my data) and
   leaves io.lang alone. */
import { SKILL_IDS, skillById, MAX_LEVEL, skillName } from './skills.js'

export const PROFILE_KEY = 'io.learner.v1'
export const MAX_SESSIONS = 10
export const MAX_SUMMARY = 300
let cache = null

const iso = () => new Date().toISOString()
const store = () => {
  try {
    return globalThis.localStorage || null
  } catch {
    return null
  }
}

export function emptyProfile(lang = 'ka') {
  const now = iso()
  return { v: 1, name: null, lang, createdAt: now, lastSeenAt: now, skills: {}, sessions: [] }
}

export function loadProfile() {
  try {
    const raw = store()?.getItem(PROFILE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (p && p.v === 1 && p.skills && Array.isArray(p.sessions)) {
        cache = p
        return p
      }
    }
  } catch {
    /* unreadable or blocked: fall back to memory */
  }
  return cache
}

export function saveProfile(p) {
  cache = p
  try {
    store()?.setItem(PROFILE_KEY, JSON.stringify(p))
  } catch {
    /* blocked storage: the in-memory copy lives for this page */
  }
  return p
}

/* a visit: create or refresh the profile */
export function touchProfile(lang = 'ka') {
  const p = loadProfile() || emptyProfile(lang)
  p.lastSeenAt = iso()
  p.lang = lang
  return saveProfile(p)
}

export function isReturning(p = loadProfile()) {
  return Boolean(p && p.sessions.length)
}

/* first name only, letters only, short; anything else is ignored */
export function setName(name) {
  const first = String(name || '')
    .trim()
    .split(/\s+/)[0]
  if (!first || !/^[\p{L}'’-]{2,30}$/u.test(first)) return loadProfile()
  const p = loadProfile() || emptyProfile()
  p.name = first
  return saveProfile(p)
}

export function recordSkill({ skill, level, evidence = '' } = {}) {
  if (!SKILL_IDS.includes(skill)) return null
  const lvl = Math.max(0, Math.min(MAX_LEVEL, Math.round(Number(level) || 0)))
  const p = loadProfile() || emptyProfile()
  p.skills[skill] = { level: lvl, lastSeen: iso(), evidence: String(evidence || '').slice(0, 120) }
  saveProfile(p)
  return p.skills[skill]
}

export function addSession({ summary_ka = '', summary_en = '', skills = [] } = {}) {
  const p = loadProfile() || emptyProfile()
  const session = {
    at: iso(),
    summary_ka: String(summary_ka || '').slice(0, MAX_SUMMARY),
    summary_en: String(summary_en || '').slice(0, MAX_SUMMARY),
    skills: (Array.isArray(skills) ? skills : []).filter((s) => SKILL_IDS.includes(s)),
  }
  p.sessions = [...p.sessions, session].slice(-MAX_SESSIONS)
  saveProfile(p)
  return session
}

export function forgetProfile() {
  cache = null
  try {
    store()?.removeItem(PROFILE_KEY)
  } catch {
    /* ignore */
  }
}

/* the two skills with the lowest mastery among those seen (or, when
   nothing was recorded, none) */
export function weakestSkills(p = loadProfile(), n = 2) {
  if (!p) return []
  return Object.entries(p.skills)
    .filter(([id]) => skillById[id])
    .sort((a, b) => a[1].level - b[1].level || String(a[1].lastSeen).localeCompare(String(b[1].lastSeen)))
    .slice(0, n)
    .map(([id, s]) => ({ id, level: s.level }))
}

/* the topic of the last session, in the language and form asked */
export function lastTopic(p = loadProfile(), lang = 'ka', form = 'on') {
  const last = p?.sessions?.[p.sessions.length - 1]
  const id = last?.skills?.[0]
  return id ? skillName(id, lang, form) : null
}

/* ≤ 300 characters for the system instruction (never read aloud) */
export function summarise(lang = 'ka', p = loadProfile()) {
  if (!p || (!p.sessions.length && !Object.keys(p.skills).length && !p.name)) return ''
  const parts = []
  if (p.name) parts.push(`Name: ${p.name}.`)
  if (p.sessions.length) {
    const last = p.sessions[p.sessions.length - 1]
    const summary = (lang === 'ka' ? last.summary_ka || last.summary_en : last.summary_en || last.summary_ka).trim()
    parts.push(`Returning learner, ${p.sessions.length} previous session${p.sessions.length > 1 ? 's' : ''}.`)
    if (summary) parts.push(`Last time: ${summary}`)
  }
  const weak = weakestSkills(p)
  if (weak.length) parts.push(`Weakest skills: ${weak.map((w) => `${w.id} (level ${w.level})`).join(', ')}.`)
  let text = parts.join(' ')
  if (text.length > MAX_SUMMARY) text = `${text.slice(0, MAX_SUMMARY - 1).trimEnd()}…`
  return text
}
