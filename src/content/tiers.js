// The seven welcome-page cards. Names, tags and descriptions come from the
// approved prototype (docs/cyberhero-prototype.html) and must stay in sync
// with it. Only `guardians` and `parents` are active in this stage.
export const TIERS = [
  {
    id: 'kids',
    color: '#ff8c42',
    emoji: '🐣',
    active: false,
    tag: { en: 'Grades 1–3 · ages 6–9', ka: '1–3 კლასი · 6–9 წელი' },
    name: { en: 'Little Heroes', ka: 'პატარა გმირები' },
    desc: {
      en: "Fun games that teach what's safe to click, share, and say online.",
      ka: 'სახალისო თამაშები იმის შესახებ, თუ რა არის უსაფრთხო ინტერნეტში.',
    },
    intro: {
      en: 'Short missions with Fufu the puppy: closing tricky pop-ups, keeping secrets safe, and always asking a grown-up.',
      ka: 'მოკლე მისიები ლეკვ ფუფუსთან ერთად: მოტყუებული ფანჯრების დახურვა, საიდუმლოების დაცვა და უფროსისთვის კითხვა.',
    },
    topics: {
      en: [
        'Close tricky pop-ups and fake prizes',
        'Know what stays secret online',
        'Always ask a grown-up first',
        'Never answer strangers — tell a trusted adult',
      ],
      ka: [
        'დახურე მოტყუებული ფანჯრები და ყალბი პრიზები',
        'იცოდე, რა რჩება საიდუმლოდ ინტერნეტში',
        'ყოველთვის ჯერ უფროსს ჰკითხე',
        'არასდროს უპასუხო უცნობს — უთხარი სანდო უფროსს',
      ],
    },
  },
  {
    id: 'cadets',
    color: '#3ecf8e',
    emoji: '🎮',
    active: false,
    tag: { en: 'Grades 4–7 · ages 9–13', ka: '4–7 კლასი · 9–13 წელი' },
    name: { en: 'Cyber Cadets', ka: 'კიბერ კადეტები' },
    desc: {
      en: 'Your first accounts and phone — passwords, privacy, and being kind online.',
      ka: 'შენი პირველი ანგარიშები და ტელეფონი — პაროლები, პრივატულობა და კეთილგანწყობა.',
    },
    intro: {
      en: 'Real scenarios from social apps and games, with points and challenges to keep it fun.',
      ka: 'რეალური სიტუაციები სოც-აპებიდან და თამაშებიდან, ქულებითა და გამოწვევებით.',
    },
    topics: {
      en: [
        'Make strong passwords',
        'Set your profiles to private',
        "Don't overshare online",
        'Beware of strangers in game chats',
        'Recognize and report bullying',
        'Spot basic phishing tricks',
      ],
      ka: [
        'შექმენი ძლიერი პაროლები',
        'გახადე პროფილები დახურული',
        'ნუ გააზიარებ ზედმეტს',
        'ფრთხილად უცნობებთან თამაშის ჩატებში',
        'ამოიცანი და დააფიქსირე ბულინგი',
        'ამოიცანი ფიშინგის მარტივი ხრიკები',
      ],
    },
  },
  {
    id: 'guardians',
    color: '#5b8cff',
    emoji: '🛡️',
    active: true,
    route: '/guardians',
    tag: { en: 'Grades 8–12 · ages 13–18', ka: '8–12 კლასი · 13–18 წელი' },
    name: { en: 'Cyber Guardians', ka: 'კიბერ დამცველები' },
    desc: {
      en: 'Phishing, scams, and protecting your digital footprint — serious skills.',
      ka: 'ფიშინგი, თაღლითობა და ციფრული კვალის დაცვა — სერიოზული უნარები.',
    },
  },
  {
    id: 'campus',
    color: '#8b5cff',
    emoji: '🎓',
    active: false,
    tag: { en: 'University · ages 18–21', ka: 'სტუდენტები · 18–21 წელი' },
    name: { en: 'Campus Cyber', ka: 'კამპუს კიბერი' },
    desc: {
      en: 'The full toolkit: passwords, 2FA, scams, deepfakes, and data privacy.',
      ka: 'სრული ხელსაწყოები: პაროლები, 2FA, თაღლითობა, დიპფეიქები, მონაცემები.',
    },
    intro: {
      en: 'The complete curriculum — every core topic, at full depth, for independent adults.',
      ka: 'სრული კურსი — ყველა ძირითადი თემა, სრული სიღრმით, დამოუკიდებელი ადამიანებისთვის.',
    },
    topics: {
      en: [
        'Use a password manager',
        'Enable 2FA on every account',
        'Public Wi-Fi risks',
        'Job & scholarship scams',
        'Deepfakes and misinformation',
        'Build a clean professional presence',
        'Protect your personal data',
      ],
      ka: [
        'გამოიყენე პაროლების მენეჯერი',
        'ჩართე 2FA ყველა ანგარიშზე',
        'საჯარო Wi-Fi-ის რისკები',
        'სამსახურისა და სტიპენდიის თაღლითობა',
        'დიპფეიქები და დეზინფორმაცია',
        'ააგე პროფესიული ონლაინ იმიჯი',
        'დაიცავი პერსონალური მონაცემები',
      ],
    },
  },
  {
    id: 'work',
    color: '#00b5d8',
    emoji: '💼',
    active: false,
    tag: { en: 'Working adults', ka: 'მომუშავე ადამიანები' },
    name: { en: 'Cyber@Work', ka: 'კიბერი სამსახურში' },
    desc: {
      en: 'Practical security for work, money, and protecting your family.',
      ka: 'პრაქტიკული უსაფრთხოება სამსახურის, ფულისა და ოჯახისთვის.',
    },
    intro: {
      en: 'The full curriculum in a workplace-focused, professional tone.',
      ka: 'სრული კურსი სამსახურზე ორიენტირებული, პროფესიული ტონით.',
    },
    topics: {
      en: [
        'Spot phishing at work',
        'Business email compromise & fake invoices',
        'Protect against financial fraud',
        'Secure your home network',
        'Password managers & 2FA',
        'Protect your family online',
      ],
      ka: [
        'ამოიცანი ფიშინგი სამსახურში',
        'ბიზნეს-იმეილის თაღლითობა და ყალბი ინვოისები',
        'დაიცავი თავი ფინანსური თაღლითობისგან',
        'დაიცავი შენი სახლის ქსელი',
        'პაროლების მენეჯერი და 2FA',
        'დაიცავი შენი ოჯახი ონლაინში',
      ],
    },
  },
  {
    id: 'seniors',
    color: '#e05780',
    emoji: '🏡',
    active: false,
    tag: { en: '50+ · Seniors', ka: '50+ · უფროსი თაობა' },
    name: { en: 'Safe & Sound', ka: 'უსაფრთხოდ' },
    desc: {
      en: 'Spot scam calls and fake messages with calm confidence.',
      ka: 'ამოიცანი თაღლითური ზარები და ყალბი შეტყობინებები სიმშვიდით.',
    },
    intro: {
      en: 'Calm, simple, large-text lessons focused on the scams that target seniors most.',
      ka: 'მშვიდი, მარტივი, მსხვილშრიფტიანი გაკვეთილები ყველაზე გავრცელებულ თაღლითობებზე.',
    },
    topics: {
      en: [
        'Recognize scam phone calls',
        'Spot fake bank SMS and messages',
        'Avoid tech-support scams',
        'Recognize romance scams',
        'One simple rule: stop and verify first',
      ],
      ka: [
        'ამოიცანი სატელეფონო თაღლითობა',
        'ამოიცანი ყალბი საბანკო SMS',
        'აარიდე თავი ტექ-მხარდაჭერის თაღლითობას',
        'ამოიცანი სასიყვარულო თაღლითობა',
        'ერთი წესი: გაჩერდი და ჯერ გადაამოწმე',
      ],
    },
  },
]

export const PARENTS_TIER = {
  id: 'parents',
  color: '#ffb020',
  emoji: '🧭',
  active: true,
  route: '/parents',
  tag: { en: 'For the adults who help', ka: 'უფროსებისთვის, ვინც გვერდში დგას' },
  name: { en: 'Teachers & Parents', ka: 'მასწავლებლები და მშობლები' },
  desc: {
    en: 'Understand the risks, act with confidence, and bring it to the classroom — calm, practical, no jargon.',
    ka: 'გაიგეთ რისკები, იმოქმედეთ თავდაჯერებულად და წაიღეთ საკლასო ოთახში — მშვიდად, პრაქტიკულად, ჟარგონის გარეშე.',
  },
}
