/* IO (იო) & Hero (გმირა) - the CyberHero helpers.
   Tips are tagged with topics so the mascot can match what he says to
   where the user is: on the Phishing Hunter mission he talks phishing,
   on the certificate page he congratulates, in the Parents hub he
   speaks to adults. One idea per tip, kid-friendly, no lecturing. */

export const MASCOT_TIPS = [
  {
    topics: ['passwords'],
    en: 'A strong password is a long password - 12+ characters beat clever symbols.',
    ka: 'ძლიერი პაროლი გრძელი პაროლია - 12+ სიმბოლო ხრიკებზე უკეთ მუშაობს.',
  },
  {
    topics: ['passwords', 'scams'],
    en: 'Never share codes you get by SMS - not even with friends.',
    ka: 'SMS-ით მოსული კოდი არავის გაუზიარო - მეგობრებსაც კი.',
  },
  {
    topics: ['phishing', 'scams'],
    en: "If a message rushes you - 'act now!' - that's a red flag.",
    ka: 'თუ შეტყობინება გაჩქარებს - „ახლავე გააკეთე!" - ეს საგანგაშო ნიშანია.',
  },
  {
    topics: ['phishing', 'passwords'],
    en: 'Check the address bar before you type a password.',
    ka: 'სანამ პაროლს აკრეფ, შეამოწმე მისამართის ველი.',
  },
  {
    topics: ['devices'],
    en: 'Updates close security holes - install them when they arrive.',
    ka: 'განახლებები უსაფრთხოების ხვრელებს კეტავს - დააყენე, როგორც კი მოვა.',
  },
  {
    topics: ['help', 'strangers'],
    en: 'Something feels off online? Tell an adult you trust.',
    ka: 'რაღაც უცნაურია ინტერნეტში? უთხარი უფროსს, ვისაც ენდობი.',
  },
  {
    topics: ['devices', 'passwords'],
    en: "On public Wi-Fi, don't open your bank and don't type passwords.",
    ka: 'საჯარო Wi-Fi-ზე ბანკში ნუ შეხვალ და პაროლებს ნუ აკრეფ.',
  },
  {
    topics: ['privacy', 'balance'],
    en: 'Think before you post - the internet remembers everything.',
    ka: 'დაფიქრდი, სანამ გამოაქვეყნებ - ინტერნეტს ყველაფერი ახსოვს.',
  },
  {
    topics: ['phishing'],
    en: 'A real bank never asks for your password in a message.',
    ka: 'ნამდვილი ბანკი პაროლს შეტყობინებით არასდროს გკითხავს.',
  },
  {
    topics: ['privacy'],
    en: "Check who can see your profile - 'friends only' is a strong start.",
    ka: 'შეამოწმე, ვინ ხედავს შენს პროფილს - „მხოლოდ მეგობრები" კარგი დასაწყისია.',
  },
  {
    topics: ['passwords'],
    en: 'One account - one password. Repeats turn one leak into ten.',
    ka: 'ერთი ანგარიში - ერთი პაროლი. გამეორება ერთ გაჟონვას ათად აქცევს.',
  },
  {
    topics: ['scams'],
    en: 'If a deal looks too good to be true, it usually is.',
    ka: 'თუ შემოთავაზება ზედმეტად კარგია, როგორც წესი, ტყუილია.',
  },
  {
    topics: ['kindness'],
    en: 'See someone being picked on in a chat? One message from you can change everything.',
    ka: 'ხედავ, რომ ჩატში ვინმეს ავიწროებენ? ერთი შენი შეტყობინება ყველაფერს ცვლის.',
  },
  {
    topics: ['kindness', 'privacy'],
    en: 'Screenshots never disappear - never share one that hurts someone.',
    ka: 'სქრინშოტები არ ქრება - არასდროს გააზიარო ისეთი, რომელიც ვინმეს ატკენს.',
  },
  {
    topics: ['fake'],
    en: 'Amazing photo? Check who posted it and when, before you believe it.',
    ka: 'წარმოუდგენელი ფოტოა? სანამ დაიჯერებ, შეამოწმე, ვინ და როდის დადო.',
  },
  {
    topics: ['fake'],
    en: 'AI can fake faces and voices - check surprising news in a second source.',
    ka: 'ხელოვნურ ინტელექტს სახეების და ხმების გაყალბება შეუძლია - მოულოდნელი ამბავი მეორე წყაროში გადაამოწმე.',
  },
  {
    topics: ['strangers'],
    en: "Online 'friends' you have never met stay online - never meet up alone.",
    ka: 'ონლაინ „მეგობრები", რომლებიც არასდროს გინახავს, ონლაინ უნდა დარჩნენ - მარტო არასდროს შეხვდე.',
  },
  {
    topics: ['strangers', 'help'],
    en: 'If someone asks you to keep a chat secret from adults - that IS the red flag.',
    ka: 'თუ ვინმე გთხოვს, მიმოწერა უფროსებს დაუმალო - ეს თავად არის საგანგაშო ნიშანი.',
  },
  {
    topics: ['help'],
    en: 'Being threatened online? Never pay, save the proof, tell an adult. It is never your fault.',
    ka: 'გემუქრებიან ინტერნეტში? არასდროს გადაიხადო, შეინახე მტკიცებულება, უთხარი უფროსს. ეს შენი ბრალი არასდროსაა.',
  },
  {
    topics: ['balance'],
    en: 'Screens off 30 minutes before sleep - your brain will thank you.',
    ka: 'ეკრანები ძილამდე 30 წუთით ადრე გამორთე - ტვინი მადლობას გეტყვის.',
  },
  {
    topics: ['parents'],
    en: 'Ask what your child enjoys online before asking what worries you.',
    ka: 'ჯერ ჰკითხე, რა მოსწონს შენს შვილს ინტერნეტში, მერე - რა გაწუხებს.',
  },
  {
    topics: ['parents'],
    en: 'Family rules work best when you write them together.',
    ka: 'ოჯახური წესები ყველაზე კარგად მაშინ მუშაობს, როცა ერთად წერთ.',
  },
]

/* what the helper says when the user achieves something */
export const MASCOT_REACTIONS = {
  mission: [
    {
      en: '🎉 Mission complete! You are getting stronger.',
      ka: '🎉 მისია შესრულებულია! სულ უფრო ძლიერდები.',
    },
    {
      en: '⭐ Great job! Another mission down.',
      ka: '⭐ ყოჩაღ! კიდევ ერთი მისია მოგებულია.',
    },
  ],
  exam: {
    en: '🏆 You passed the exam! You are a true Cyber Guardian!',
    ka: '🏆 გამოცდა ჩააბარე! ნამდვილი კიბერ დამცველი ხარ!',
  },
  cert: {
    en: 'You earned this. I am proud of you! 🎖️',
    ka: 'ეს შენ დაიმსახურე. ვამაყობ შენით! 🎖️',
  },
  guardians: {
    en: 'Pick a mission - I will be right here.',
    ka: 'აირჩიე მისია - მე აქვე ვიქნები.',
  },
}

/* which topics each Guardian mission is about (ids from guardians/meta.js) */
const MISSION_TOPICS = {
  g1: ['phishing'],
  g2: ['privacy'],
  g3: ['passwords'],
  g4: ['help', 'strangers'],
  g5: ['scams'],
  g6: ['kindness', 'help'],
  g7: ['fake'],
  g8: ['strangers', 'help'],
  g9: ['balance'],
  g10: [], // final exam - everything
}

const KID_TIPS = MASCOT_TIPS.filter((tip) => !tip.topics.includes('parents'))
const PARENT_TIPS = MASCOT_TIPS.filter((tip) => tip.topics.includes('parents'))

/* Resolve what the helper should say for a route (HashRouter pathname).
   Returns { tips, opener? } - opener is an optional context greeting. */
export function getMascotContext(pathname = '/') {
  const mission = pathname.match(/^\/guardians\/mission\/(g\d+)/)
  if (mission) {
    const topics = MISSION_TOPICS[mission[1]] ?? []
    const pool = KID_TIPS.filter((tip) => tip.topics.some((topic) => topics.includes(topic)))
    return { tips: pool.length ? pool : KID_TIPS }
  }
  if (pathname.startsWith('/guardians/certificate')) {
    return { tips: KID_TIPS, opener: MASCOT_REACTIONS.cert }
  }
  if (pathname.startsWith('/guardians')) {
    return { tips: KID_TIPS, opener: MASCOT_REACTIONS.guardians }
  }
  if (pathname.startsWith('/parents')) {
    return { tips: [...PARENT_TIPS, ...KID_TIPS.filter((tip) => tip.topics.includes('help'))] }
  }
  return { tips: KID_TIPS }
}

/* what the team should verify on this branch before the mascot goes live */
export const MASCOT_CHECKLIST = [
  {
    en: 'Both languages read naturally (EN / ქარ)',
    ka: 'ორივე ენა ბუნებრივად იკითხება (EN / ქარ)',
  },
  {
    en: 'Runs smoothly on an older phone or laptop',
    ka: 'ძველ ტელეფონზე და ლეპტოპზეც შეუფერხებლად მუშაობს',
  },
  {
    en: 'Reduced-motion mode: he calms down and stops moving',
    ka: 'შემცირებული მოძრაობის რეჟიმში წყნარდება და აღარ მოძრაობს',
  },
  {
    en: 'Tips are accurate and age-appropriate',
    ka: 'რჩევები ზუსტი და ასაკის შესაფერისია',
  },
  {
    en: 'He never covers content or buttons on small screens',
    ka: 'პატარა ეკრანზე კონტენტს და ღილაკებს არ ფარავს',
  },
  {
    en: 'Keyboard and screen-reader users can use every control',
    ka: 'კლავიატურითა და ეკრანის წამკითხველით ყველა ღილაკი მუშაობს',
  },
]
