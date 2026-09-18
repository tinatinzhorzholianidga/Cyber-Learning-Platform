/* IO's speech on the main page - everything he says, in Georgian and
   English. He is the HOST here, not the teacher: he welcomes, introduces
   himself, points to the right course and explains the small print. No
   cyber-security advice on this page - that lives inside the courses.

   Register: თქვენ (polite plural) throughout.
   Rules: one register, <= 110 characters per language, at most one emoji.
   Run `npm run check` after editing. Which line plays when is decided in
   src/mascot/hostBrain.js. */
export const HINTS = {
  register: "თქვენ",

  // first line on arrival, before noon (local time)
  morning: [
    { ka: "დილა მშვიდობისა! მთელი ღამე ვიმუხტებოდი და მზად ვარ. თქვენ? ☀️", en: "Good morning! I charged all night and I'm ready. Are you? ☀️" },
    { ka: "დილა მშვიდობისა! ახალი დღე ახალი რამის სასწავლად საუკეთესო დროა. საიდან დავიწყოთ?", en: "Good morning! A new day is the best time to learn something new. Where shall we start?" },
  ],

  // first line on arrival, 12:00-18:00
  afternoon: [
    { ka: "შუადღე მშვიდობისა! მოკლე შესვენებაც საკმარისია, აქაურობას რომ გაეცნოთ.", en: "Good afternoon! A short break is all it takes to see what's here." },
    { ka: "შუადღე მშვიდობისა! სამსახურის შესვენებაზე ხართ თუ სახლში? ორივე შემთხვევაში სწორ ადგილას მოხვედით.", en: "Good afternoon! On a work break or at home? Either way, you're in the right place." },
  ],

  // first line on arrival, after 18:00
  evening: [
    { ka: "საღამო მშვიდობისა! დღე დასასრულს უახლოვდება, სწავლისთვის კი არასდროსაა გვიან. მე აქ ვარ.", en: "Good evening! The day is winding down, but it's never too late to learn. I'm right here." },
    { ka: "საღამო მშვიდობისა! ნუ იჩქარებთ - კურსებიც ხვალ აქ იქნება და მეც.", en: "Good evening! No rush - the courses will still be here tomorrow, and so will I." },
  ],

  // fallback greeting
  greeting: [
    { ka: "მე იო ვარ, თქვენი გზამკვლევი კიბერუსაფრთხოების სამყაროში. კეთილი იყოს თქვენი მობრძანება!", en: "Welcome! I'm IO, your cybersecurity guide - glad you found your way here." },
    { ka: "მოგესალმებით! მე იო ვარ, ამ გვერდის მასპინძელი. აქ ყველა თავის გზას იპოვის.", en: "Hello! I'm IO, your host on this page. There's a path here for everyone." },
    { ka: "ო, სტუმარი! მთელი დღე გელოდებოდით. შემობრძანდით, ერთად ვიპოვოთ თქვენი კურსი.", en: "Oh, a visitor! I've been waiting all day. Come in - let's find your course together." },
    { ka: "მოგესალმებით! რობოტი ვარ, მაგრამ მასპინძლობა კარგად გამომდის. გზას სიამოვნებით გიჩვენებთ. 🤖", en: "Hi there! I'm a robot, but I make a pretty good host. Happy to show you around. 🤖" },
  ],

  // second beat after the greeting
  whoAmI: [
    { ka: "მე იო ვარ - რობოტი, რომელიც აქ სტუმრებს მასპინძლობს. არჩევაში დაგეხმარებით - საიდან დაიწყოთ.", en: "I'm IO, the robot who hosts visitors here. I'll help you choose where to begin." },
    { ka: "იო გახლავართ. კიბერგმირზეც ვცხოვრობ, მაგრამ დღეს აქ სტუმრებს ვხვდები.", en: "IO, at your service. I live on CyberHero too, but today I'm the host here." },
  ],

  // click cycle: which door is for whom
  pickPath: [
    { ka: "ორი გზა გაქვთ: საბაზისო კურსი უფროსებისთვის, კიბერგმირი - ბავშვებისა და მოზარდებისთვის.", en: "Two paths: the Basic Course for adults, or CyberHero for kids and teens." },
    { ka: "საკუთარი თავისთვის ან სამსახურისთვის - საბაზისო კურსი. შვილისთვის ან კლასისთვის - კიბერგმირი.", en: "For yourself or your workplace, the Basic Course. For a child or a classroom, CyberHero." },
    { ka: "ვერ წყვეტთ? უფროსებისთვის საბაზისო კურსია, 13-18 წლის მოზარდებისთვის კი - კიბერგმირი.", en: "Can't decide? Adults start with the Basic Course; teens aged 13 to 18 start with CyberHero." },
  ],

  // click cycle: the Basic Cybersecurity Course (adults)
  basicCourse: [
    { ka: "9 თემა - კომპიუტერის უსაფრთხოებიდან დეზინფორმაციამდე - და თავი ხელოვნური ინტელექტის საფრთხეებზე.", en: "Nine topics, from PC security to disinformation, plus a chapter on AI-related threats." },
    { ka: "საშუალოდ სამი საათი. ყავა - სურვილისამებრ, ცნობისმოყვარეობა - აუცილებლად. ☕", en: "About three hours on average. Coffee optional, curiosity required. ☕" },
    { ka: "საბაზისო კურსი ყველასთვისაა - თანამშრომლისთვისაც და ცნობისმოყვარისთვისაც. ისწავლეთ თქვენი ტემპით.", en: "The Basic Course is for everyone - employees and the simply curious alike. Learn at your own pace." },
    { ka: "კურსის ბოლოს 100-კითხვიანი ტესტია. 70 სწორი პასუხი - და სერტიფიკატი თქვენია. სამი ცდა გაქვთ.", en: "It ends with a 100-question test. Get 70 right and the certificate is yours - you have 3 attempts." },
  ],

  // click cycle: CyberHero (kids, teens, parents, teachers)
  kidsPlatform: [
    { ka: "კიბერგმირი უფასო, ორენოვანი პლატფორმაა - სცენარული მისიები 13-18 წლის მოზარდებისთვის.", en: "CyberHero is a free, bilingual platform - scenario missions for ages 13 to 18." },
    { ka: "კიბერგმირზე მოზარდები „კიბერ დამცველები“ ხდებიან: მისიებში თავად წყვეტენ და შედეგსაც ხედავენ.", en: "On CyberHero, teens become Cyber Guardians: in every mission they decide and see what follows." },
    { ka: "კიბერგმირზე მშობლებსა და მასწავლებლებსაც თავიანთი გზამკვლევები ელოდებათ - მშვიდი და პრაქტიკული.", en: "Parents and teachers have their own guides on CyberHero - calm and practical." },
    { ka: "კიბერგმირზე მეც ვცხოვრობ - მისიებში ბავშვებს გვერდით ვუდგავარ. ბოლოს კი ამოსაბეჭდი სერტიფიკატია.", en: "I live on CyberHero too, beside the kids in every mission. There's a printable certificate at the end." },
  ],

  // while the Basic Course card is hovered / focused
  hoverBasic: [
    { ka: "ო, საბაზისო კურსი! ცხრა თემა, ერთი ტესტი, ერთი სერტიფიკატი. დავიწყოთ?", en: "Ah, the Basic Course! Nine topics, one test, one certificate. Shall we?" },
    { ka: "საბაზისო კურსი - უფროსებისთვის. 9 თემა, დაახლოებით 3 საათი, ბოლოს კი ტესტი და სერტიფიკატი.", en: "The Basic Course, for adults: 9 topics, about 3 hours, then a test and a certificate." },
    { ka: "კარგი არჩევანია! ეს გზა თანამშრომლებისთვისაც გამოდგება და მათთვისაც, ვინც ნულიდან იწყებს.", en: "Good pick! This path works for employees and for anyone starting from scratch." },
  ],

  // while the CyberHero card is hovered / focused
  hoverKids: [
    { ka: "კიბერგმირი - ბავშვებისა და მოზარდებისთვის. მისიები, არჩევანი და ბოლოს სერტიფიკატი. მეც იქ ვარ!", en: "CyberHero, for kids and teens: missions, choices, and a certificate at the end. I'm there too!" },
    { ka: "ეს ბმული სხვა საიტზე გადაგიყვანთ - იქაც მე დაგხვდებით. 🤖", en: "This one opens on a separate site - and I'll be there to greet you. 🤖" },
    { ka: "კიბერგმირი უფასოა, ორენოვანი და მშობლებისა და მასწავლებლებისთვისაც აქვს გზამკვლევები. გადავიდეთ?", en: "CyberHero is free, bilingual, and has guides for parents and teachers too. Shall we head over?" },
  ],

  // click cycle: where the login button is
  login: [
    { ka: "საბაზისო კურსის დასაწყებად შედით სისტემაში - ღილაკი „შესვლა“ ზედა მარჯვენა კუთხეშია.", en: "To start the Basic Course, log in - the Log in button is in the top-right corner." },
    { ka: "გვერდის დათვალიერება უფასოა და შესვლა არ სჭირდება. როცა მოგინდებათ, „შესვლა“ ზემოთ მარჯვნივაა.", en: "Browsing is free and needs no login. When you're ready, Log in is up in the top-right corner." },
  ],

  // click cycle: how the certificate is earned
  certificate: [
    { ka: "საბაზისო კურსის სერტიფიკატს ტესტში 100-დან 70 სწორი პასუხით მიიღებთ. სამი ცდა გაქვთ - ნუ იჩქარებთ.", en: "The Basic Course certificate takes 70 correct out of 100 on the test. Three attempts - no rush." },
    { ka: "ორივე გზა სერტიფიკატით მთავრდება: საბაზისო კურსი - ტესტის ჩაბარებით, კიბერგმირი - მისიების დასრულებით.", en: "Both paths end with a certificate: the test on the Basic Course, the missions on CyberHero." },
  ],

  // click cycle: the language switch
  language: [
    { ka: "ქართულად თუ ინგლისურად? ენა ზედა მარჯვენა კუთხეში შეგიძლიათ შეცვალოთ - მე ორივე ენაზე ვლაპარაკობ.", en: "Georgian or English? Switch the language in the top-right corner - I speak both." },
  ],

  // click cycle: who runs the platform
  aboutDga: [
    { ka: "ამ პლატფორმას საქართველოს ციფრული მმართველობის სააგენტო (DGA) უძღვება.", en: "This platform is run by the Digital Governance Agency of Georgia (DGA)." },
    { ka: "ეს ციფრული მმართველობისა და კიბერუსაფრთხოების სასწავლო პლატფორმაა და ყველასთვის ღიაა.", en: "This is the Digital Governance and Cybersecurity Learning Platform - open to everyone." },
  ],

  // click cycle: a nudge to start
  encouragement: [
    { ka: "პირველი ნაბიჯი ყოველთვის ყველაზე რთულია - და ის უკვე გადადგით: აქ ხართ.", en: "The first step is always the hardest - and you've already taken it. You're here." },
    { ka: "სწავლას ასაკი არ აქვს. ბავშვიც და უფროსიც აქ თავის გზას იპოვის.", en: "Learning has no age. Kids and grown-ups alike find their path here." },
    { ka: "ჯერ ფიქრობთ? არაუშავს. რობოტი ვარ - მოცდა კარგად გამომდის.", en: "Still deciding? No problem. I'm a robot - waiting is one of my best features." },
    { ka: "აქ არასწორი არჩევანი არ არსებობს - ორივე გზა კარგ ადგილას მიგიყვანთ.", en: "There's no wrong choice here - both paths lead somewhere good." },
  ],

  // when a path is chosen
  farewell: [
    { ka: "მალე შევხვდებით! რობოტს არც სახე ავიწყდება, არც სტუმარი. 👋", en: "See you soon! A robot never forgets a face - or a visitor. 👋" },
    { ka: "გზა მშვიდობისა! თუ კიბერგმირისკენ მიდიხართ, იქ მე დაგხვდებით.", en: "Safe travels! If you're headed to CyberHero, I'll be there to meet you." },
  ],
}
