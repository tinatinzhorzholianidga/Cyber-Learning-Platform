/* UI strings for the welcome page (not IO's speech - that lives in
   src/content/hints.js). Georgian is the page's default language. */
export const UI = {
  ka: {
    htmlLang: 'ka',
    pageTitle: 'იო — კიბერუსაფრთხოების გზამკვლევი · elearning.gov.ge',
    metaDescription:
      'იო — კიბერუსაფრთხოების გზამკვლევი. ციფრული მმართველობისა და კიბერუსაფრთხოების სასწავლო პლატფორმის მისასალმებელი გვერდი.',
    agency: 'ციფრული მმართველობის სააგენტო',
    platform: 'ციფრული მმართველობისა და კიბერუსაფრთხოების სასწავლო პლატფორმა',
    login: 'შესვლა',
    langLabel: 'ენა',
    skipToContent: 'მთავარ შინაარსზე გადასვლა',
    heroKicker: 'მოგესალმებით',
    heroTitle: 'გამარჯობა! მე იო ვარ —',
    heroTitleGrad: 'თქვენი კიბერუსაფრთხოების გზამკვლევი',
    heroSub: 'აირჩიეთ, საიდან დაიწყებთ: საბაზისო კურსით უფროსებისთვის თუ კიბერგმირით — ბავშვებისა და მოზარდებისთვის.',
    ioLabel: 'იო, კიბერუსაფრთხოების გზამკვლევი რობოტი — დააწკაპუნეთ, რომ კიდევ რამე გითხრათ',
    ioHint: 'დააწკაპუნეთ იოზე — კიდევ ბევრი აქვს სათქმელი',
    newTab: 'იხსნება ახალ ჩანართში',
    pathsTitle: 'საიდან დავიწყოთ?',
    basic: {
      badge: 'უფროსებისთვის · თანამშრომლებისთვის',
      title: 'კიბერუსაფრთხოების საბაზისო კურსი',
      desc: '9 თემა, დაახლოებით 3 საათი, ბოლოს კი სერტიფიკატი. ყველასთვის, ვინც ყოველდღიურად იყენებს კომპიუტერსა და ინტერნეტს.',
      chips: ['~3 საათი', '9 თემა', 'ტესტი + სერტიფიკატი'],
      cta: 'კურსის დაწყება',
      url: 'https://elearning.gov.ge/course/view.php?id=18',
    },
    kids: {
      badge: 'ბავშვებისთვის · მოზარდებისთვის · მშობლებისთვის',
      title: 'კიბერგმირი',
      desc: 'სცენარული მისიები 13-18 წლის მოზარდებისთვის, გზამკვლევები მშობლებისა და მასწავლებლებისთვის — და მე, იო, ყოველ ნაბიჯზე თქვენ გვერდით.',
      chips: ['10 მისია', 'ქართული / English', 'უფასო'],
      cta: 'კიბერგმირზე გადასვლა',
      url: 'https://tinatinzhorzholianidga.github.io/Cyber-Learning-Platform/',
    },
    footer: 'ციფრული მმართველობის სააგენტო · elearning.gov.ge',
    footerNote: 'უფასო საგანმანათლებლო რესურსი.',
  },
  en: {
    htmlLang: 'en',
    pageTitle: 'IO — your cybersecurity guide · elearning.gov.ge',
    metaDescription:
      'IO, the cybersecurity guide. The welcome page of the Digital Governance & Cybersecurity Learning Platform.',
    agency: 'Digital Governance Agency',
    platform: 'Digital Governance & Cybersecurity Learning Platform',
    login: 'Log in',
    langLabel: 'Language',
    skipToContent: 'Skip to content',
    heroKicker: 'Welcome',
    heroTitle: "Hi! I'm IO -",
    heroTitleGrad: 'your cybersecurity guide',
    heroSub: 'Pick where to start: the basic course for adults, or CyberHero for kids and teens.',
    ioLabel: 'IO, the cybersecurity guide robot — press to hear more',
    ioHint: 'Click IO — he has more to say',
    newTab: 'opens in a new tab',
    pathsTitle: 'Where shall we start?',
    basic: {
      badge: 'For adults · employees',
      title: 'Basic Cybersecurity Course',
      desc: 'Nine topics, about 3 hours, and a certificate at the end. For everyone who uses a computer and the internet every day.',
      chips: ['~3 hours', '9 topics', 'Test + certificate'],
      cta: 'Start the course',
      url: 'https://elearning.gov.ge/course/view.php?id=18',
    },
    kids: {
      badge: 'For kids · teens · parents',
      title: 'CyberHero',
      desc: 'Scenario missions for ages 13-18, guides for parents and teachers — and me, IO, by your side at every step.',
      chips: ['10 missions', 'Georgian / English', 'Free'],
      cta: 'Go to CyberHero',
      url: 'https://tinatinzhorzholianidga.github.io/Cyber-Learning-Platform/',
    },
    footer: 'Digital Governance Agency · elearning.gov.ge',
    footerNote: 'A free educational resource.',
  },
}

export const LANGS = ['ka', 'en']

/* language comes from ?lang=, then the saved choice, then Georgian */
export function initialLang() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang')
    if (LANGS.includes(q)) return q
    const saved = window.localStorage.getItem('io.lang')
    if (LANGS.includes(saved)) return saved
  } catch {
    /* storage can be blocked - fall through */
  }
  return 'ka'
}
