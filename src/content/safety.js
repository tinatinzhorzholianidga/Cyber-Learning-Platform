/* Resources IO reads when a learner says they are bullied, threatened,
   blackmailed or contacted by a stranger online (brief Phase 5;
   docs/io-voice-plan.md §5.8). The DGA team fills in the organisations
   and contacts - nothing here is invented. Until then the {{…}}
   placeholders stay: scripts/check-voice.mjs warns, and fails the build
   when VITE_IO_SAFETY_REQUIRED=1 (the production workflow). While
   placeholders remain, IO does not read this file and says only to tell
   a trusted adult now. */
export const SAFETY = {
  ka: {
    intro: 'ეს თქვენი ბრალი არ არის. ახლავე ესაუბრეთ უფროსს, ვისაც ენდობით.',
    resources: [
      { name: '{{ორგანიზაციის სახელი}}', contact: '{{ტელეფონი ან ბმული}}', note: '{{როდის და ვისთვის}}' },
    ],
  },
  en: {
    intro: 'It is not your fault. Talk to an adult you trust right now.',
    resources: [{ name: '{{organisation}}', contact: '{{phone or link}}', note: '{{when and for whom}}' }],
  },
}

export function hasPlaceholders(safety = SAFETY) {
  return /\{\{|TODO|PLACEHOLDER|შესავსებია/i.test(JSON.stringify(safety))
}

/* The lines IO may read aloud, or null while the file is not filled in. */
export function safetyText(lang = 'ka', safety = SAFETY) {
  if (hasPlaceholders(safety)) return null
  const s = safety[lang] || safety.ka
  const lines = s.resources.map((r) => `${r.name}: ${r.contact}${r.note ? ` (${r.note})` : ''}`)
  return `${s.intro} ${lines.join(' ')}`.trim()
}
