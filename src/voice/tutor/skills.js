/* The skill taxonomy (docs/io-voice-plan.md §5.8; brief Phase 5), derived
   from the platform's content: the Basic Course topics named in hints.js
   and the CyberHero missions and guides. `courseRef.basic` holds topic
   numbers only (no course text, A6); `mission` and `guide` hold CyberHero
   ids. The Basic Course topics: 1 PC security, 2 passwords and
   authentication, 3 email security, 4 safe internet, 5 social media,
   6 mobile devices, 7 data security, 8 workplace security,
   9 disinformation, 10 AI-related threats. Mastery is 0-3 per skill. `kaOn` is the topic in the postpositional
   form the memory line needs („წინა ჯერზე ფიშინგზე ვისაუბრეთ"). */
export const SKILLS = [
  { id: 'passwords', ka: 'პაროლები', kaOn: 'პაროლებზე', en: 'passwords', courseRef: { basic: [2], mission: ['g3'], guide: ['b3'] } },
  { id: 'two_factor', ka: 'ორმაგი ავთენტიფიკაცია', kaOn: 'ორმაგ ავთენტიფიკაციაზე', en: 'two-factor authentication', courseRef: { basic: [2], mission: ['g3'], guide: ['b3'] } },
  { id: 'phishing', ka: 'ფიშინგი', kaOn: 'ფიშინგზე', en: 'phishing', courseRef: { basic: [3], mission: ['g1'], guide: ['a2'] } },
  { id: 'scams', ka: 'ონლაინ თაღლითობა', kaOn: 'ონლაინ თაღლითობაზე', en: 'online scams', courseRef: { basic: [3, 4], mission: ['g5'], guide: ['a2'] } },
  { id: 'social_engineering', ka: 'სოციალური ინჟინერია', kaOn: 'სოციალურ ინჟინერიაზე', en: 'social engineering', courseRef: { basic: [3, 8], mission: ['g1', 'g5', 'g8'], guide: ['a5'] } },
  { id: 'privacy_settings', ka: 'კონფიდენციალურობის პარამეტრები', kaOn: 'კონფიდენციალურობის პარამეტრებზე', en: 'privacy settings', courseRef: { basic: [5], mission: ['g2'], guide: ['a1'] } },
  { id: 'cyberbullying', ka: 'კიბერბულინგი', kaOn: 'კიბერბულინგზე', en: 'cyberbullying', courseRef: { basic: [5], mission: ['g4', 'g6'], guide: ['a3', 'a4', 'b5'] } },
  { id: 'safe_browsing', ka: 'უსაფრთხო დათვალიერება', kaOn: 'უსაფრთხო დათვალიერებაზე', en: 'safe browsing', courseRef: { basic: [4], mission: ['g1'], guide: ['b3'] } },
  { id: 'device_security', ka: 'მოწყობილობის უსაფრთხოება', kaOn: 'მოწყობილობის უსაფრთხოებაზე', en: 'device security', courseRef: { basic: [1, 6], mission: [], guide: ['b3'] } },
  { id: 'backups', ka: 'სარეზერვო ასლები', kaOn: 'სარეზერვო ასლებზე', en: 'backups', courseRef: { basic: [7], mission: [], guide: [] } },
  { id: 'disinformation', ka: 'დეზინფორმაცია', kaOn: 'დეზინფორმაციაზე', en: 'disinformation', courseRef: { basic: [9], mission: ['g7'], guide: ['a7'] } },
  { id: 'ai_threats', ka: 'ხელოვნური ინტელექტის საფრთხეები', kaOn: 'ხელოვნური ინტელექტის საფრთხეებზე', en: 'AI-related threats', courseRef: { basic: [10], mission: ['g7'], guide: ['a7'] } },
  { id: 'incident_reporting', ka: 'ინციდენტის შეტყობინება', kaOn: 'ინციდენტის შეტყობინებაზე', en: 'reporting an incident', courseRef: { basic: [8], mission: ['g4', 'g8'], guide: ['b5', 'c3'] } },
]

export const SKILL_IDS = SKILLS.map((s) => s.id)
export const skillById = Object.fromEntries(SKILLS.map((s) => [s.id, s]))
export const MAX_LEVEL = 3

export function skillName(id, lang = 'ka', form = 'nominative') {
  const s = skillById[id]
  if (!s) return id
  if (lang === 'ka') return form === 'on' ? s.kaOn : s.ka
  return s.en
}

/* The list the persona shows the model: id → names, so record_skill and
   ask_quiz use ids that exist. */
export function skillsForPrompt() {
  return SKILLS.map((s) => `${s.id} (${s.en} / ${s.ka})`).join(', ')
}
