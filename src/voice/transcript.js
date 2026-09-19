/* The transcript as pure data (docs/io-voice-plan.md §5.1): turns for the
   panel, and what the aria-live region announces - IO's completed
   sentences (sentences, never tokens) and, so both sides are heard, the
   learner's recognised utterance once it is final (`heard`; typed text
   is not read back). Sessions send captions; these functions fold them
   into an immutable structure the store holds.
   announced: [{ role: 'io' | 'user', text }] */

let nextId = 1
export const emptyTranscript = () => ({ turns: [], announced: [] })

const SENTENCE_END = /[.!?…](?:\s|$)/

/* Text up to and including the last sentence terminator. */
export function completedPart(text) {
  const s = String(text || '')
  let end = -1
  const re = /[.!?…](?=\s|$)/g
  let m
  while ((m = re.exec(s))) end = m.index + 1
  return end < 0 ? '' : s.slice(0, end)
}

/* Fold one caption event into the transcript. `role` is 'user' | 'io'.
   User captions carry the whole utterance so far (replace semantics);
   IO captions are deltas unless `replace`. `final` closes the turn. */
export function applyCaption(tr, { role, text = '', final = false, replace = false, interrupted = false, heard = false }) {
  const turns = tr.turns.slice()
  const last = turns[turns.length - 1]
  const open = last && last.role === role && !last.final ? last : null
  const nextText = role === 'user' || replace ? text : (open?.text || '') + text
  const turn = open ? { ...open, text: nextText, final, interrupted: open.interrupted || interrupted } : { id: nextId++, role, text: nextText, final, interrupted }
  if (open) {
    // a turn that closes with nothing said (listening ended in silence) disappears
    if (final && !turn.text) turns.pop()
    else turns[turns.length - 1] = turn
  } else if (turn.text || !final) turns.push(turn)
  // announce IO's newly completed sentences, and a heard utterance once final
  let announced = tr.announced
  if (role === 'io') {
    const before = completedPart(open?.text || '')
    const after = final ? turn.text : completedPart(turn.text)
    const fresh = after.slice(before.length).trim()
    if (fresh) announced = [...announced.slice(-5), { role: 'io', text: fresh }]
  } else if (heard && final && turn.text.trim()) {
    announced = [...announced.slice(-5), { role: 'user', text: turn.text.trim() }]
  }
  return { turns, announced }
}

/* Mark the open IO turn as interrupted and close it. */
export function markInterrupted(tr) {
  const turns = tr.turns.slice()
  const last = turns[turns.length - 1]
  if (!last || last.role !== 'io' || last.final) return tr
  turns[turns.length - 1] = { ...last, final: true, interrupted: true }
  return { ...tr, turns }
}

/* Drop an empty open user turn (listening ended without speech). */
export function dropEmptyUser(tr) {
  const last = tr.turns[tr.turns.length - 1]
  if (!last || last.role !== 'user' || last.final || last.text) return tr
  return { ...tr, turns: tr.turns.slice(0, -1) }
}

export function lastTurns(tr, n = 3) {
  return tr.turns.slice(-n)
}

export function hasSentenceEnd(text) {
  return SENTENCE_END.test(text)
}
