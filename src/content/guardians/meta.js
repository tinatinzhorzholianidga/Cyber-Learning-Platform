// Card-level metadata for the ten Guardian missions (spec section 3).
// Gameplay lives in g1.js…g10.js; this file is the single source for
// names, colors and the parent-article cross-links.
export const MISSION_META = [
  {
    id: 'g1',
    order: 1,
    emoji: '🎣',
    color: '#5b8cff',
    article: 'a2',
    name: { en: 'Phishing Hunter', ka: 'ფიშინგზე მონადირე' },
    desc: {
      en: 'Emails, DMs and SMS land in your inbox. Real or phish — you decide.',
      ka: 'იმეილები, პირადი შეტყობინებები და SMS მოდის შენს საფოსტო ყუთში. ნამდვილია თუ ფიშინგი — შენ წყვეტ.',
    },
  },
  {
    id: 'g2',
    order: 2,
    emoji: '🔎',
    color: '#00b5d8',
    article: 'a1',
    name: { en: 'Footprint Detective', ka: 'კვალის დეტექტივი' },
    desc: {
      en: 'Investigate a profile the way a stalker — or a recruiter — would.',
      ka: 'გამოიკვლიე პროფილი ისე, როგორც სტოკერი — ან რეკრუტერი — გამოიკვლევდა.',
    },
  },
  {
    id: 'g3',
    order: 3,
    emoji: '🏰',
    color: '#3ecf8e',
    article: 'b3',
    name: { en: 'Fort Knox', ka: 'ფორტ ნოქსი' },
    desc: {
      en: 'Build a defense attackers cannot crack — passwords, 2FA, recovery.',
      ka: 'ააგე დაცვა, რომელსაც ვერ გატეხავენ — პაროლები, 2FA, აღდგენა.',
    },
  },
  {
    id: 'g4',
    order: 4,
    emoji: '🛑',
    color: '#e05780',
    article: 'a3',
    priority: true,
    sensitive: true,
    name: { en: 'The Blackmail Trap', ka: 'შანტაჟის ხაფანგი' },
    desc: {
      en: 'A DM turns into a threat. Every choice matters — and there is always a way out.',
      ka: 'მიმოწერა მუქარაში გადაიზრდება. ყველა არჩევანი მნიშვნელოვანია — და გამოსავალი ყოველთვის არსებობს.',
    },
  },
  {
    id: 'g5',
    order: 5,
    emoji: '📡',
    color: '#ffb020',
    article: 'a2',
    name: { en: 'Scam Radar', ka: 'თაღლითობის რადარი' },
    desc: {
      en: 'Fake shops, gift-card tricks, dream jobs. Spot the scam before it costs you.',
      ka: 'ყალბი მაღაზიები, სასაჩუქრე ბარათების ხრიკები, საოცნებო ვაკანსიები. ამოიცანი თაღლითობა, სანამ დაგიჯდება.',
    },
  },
  {
    id: 'g6',
    order: 6,
    emoji: '🗣️',
    color: '#8b5cff',
    article: 'a4',
    sensitive: true,
    name: { en: 'Upstander', ka: 'მხარში მდგომი' },
    desc: {
      en: 'A group chat turns on one classmate. What you do next changes everything.',
      ka: 'ჯგუფური ჩატი ერთ თანაკლასელს დაერევა. შენი შემდეგი ნაბიჯი ყველაფერს ცვლის.',
    },
  },
  {
    id: 'g7',
    order: 7,
    emoji: '🧿',
    color: '#00b5d8',
    article: 'a7',
    name: { en: 'Reality Check', ka: 'რეალობის შემოწმება' },
    desc: {
      en: 'News, photos, AI content — real or fake? Test your radar.',
      ka: 'ამბები, ფოტოები, ხელოვნური ინტელექტის კონტენტი — ნამდვილია თუ ყალბი? გამოცადე შენი რადარი.',
    },
  },
  {
    id: 'g8',
    order: 8,
    emoji: '🚩',
    color: '#e05780',
    article: 'a5',
    sensitive: true,
    name: { en: 'Stranger Signals', ka: 'უცნობის სიგნალები' },
    desc: {
      en: 'Read a DM conversation and flag every red flag before it goes further.',
      ka: 'წაიკითხე მიმოწერა და მონიშნე ყველა საგანგაშო ნიშანი, სანამ საქმე შორს წავა.',
    },
  },
  {
    id: 'g9',
    order: 9,
    emoji: '🌙',
    color: '#3ecf8e',
    article: 'a6',
    name: { en: 'Balance Boss', ka: 'ბალანსის ოსტატი' },
    desc: {
      en: 'Sleep, doomscrolling, comparison. Audit yourself — no lectures.',
      ka: 'ძილი, უსასრულო სქროლვა, შედარება. შეაფასე საკუთარი თავი — ლექციების გარეშე.',
    },
  },
  {
    id: 'g10',
    order: 10,
    emoji: '🏆',
    color: '#5b8cff',
    article: 'b5',
    final: true,
    name: { en: 'Guardian Exam', ka: 'დამცველის გამოცდა' },
    desc: {
      en: 'A timed gauntlet across every topic. Pass it and earn the Guardian Certificate.',
      ka: 'დროზე გათვლილი გამოცდა ყველა თემაზე. ჩააბარე და მოიპოვე დამცველის სერტიფიკატი.',
    },
  },
]

export const missionMetaById = Object.fromEntries(MISSION_META.map((m) => [m.id, m]))
