// G2 - Footprint Detective. Investigate a fictional public profile the way
// a stalker - or a recruiter - would, then audit "your own" (spec section 3).
// Teaches assembly of harmless-looking posts, permanence, and a 10-minute audit.
export default {
  brief: {
    en: 'Today you work both sides of the glass. First you investigate a stranger’s public profile the way a stalker - or a recruiter - would: no hacking, just careful reading. Then you turn the same lens on your own. Everything you are about to find is technically public. That is exactly the point.',
    ka: 'დღეს შუშის ორივე მხარეს იმუშავებ. ჯერ უცნობის საჯარო პროფილს გამოიკვლევ ისე, როგორც სტოკერი - ან რეკრუტერი - გამოიკვლევდა: არანაირი გატეხვა, მხოლოდ ყურადღებით კითხვა. მერე იმავე მზერას საკუთარ პროფილს მიაპყრობ. ყველაფერი, რასაც ახლა იპოვი, ტექნიკურად საჯაროა. საქმეც სწორედ ეს არის.',
  },
  theory: [
    {
      en: 'Your digital footprint is everything findable about you - posts, tags, comments, old accounts. Deleting rarely helps: screenshots and archives remember.',
      ka: 'შენი ციფრული კვალი ყველაფერია, რაც შენზე მოიძებნება - პოსტები, თეგები, კომენტარები, ძველი ანგარიშები. წაშლა იშვიათად შველის: სქრინშოტებსა და არქივებს ახსოვთ.',
    },
    {
      en: 'Posts are harmless one at a time. Read together, they assemble into your school, your schedule and your address - a stranger only has to read.',
      ka: 'პოსტები სათითაოდ უწყინარია. ერთად წაკითხული კი ისინი შენს სკოლად, განრიგად და მისამართად იწყობა - უცნობს მხოლოდ წაკითხვა სჭირდება.',
    },
    {
      en: 'Live location and "home alone all weekend" tell strangers where you are - and where nobody is. Post the trip after you are back.',
      ka: 'ლოკაცია რეალურ დროში და „მთელი შაბათ-კვირა მარტო ვარ სახლში“ უცნობებს ეუბნება, სად ხარ - და სად არავინ არის. მოგზაურობა დაბრუნების შემდეგ დაპოსტე.',
    },
    {
      en: 'Future employers and universities will search your name - most recruiters check public profiles, and a two-year-old "joke" reads as who you are today.',
      ka: 'მომავალი დამსაქმებლები და უნივერსიტეტები შენს სახელს მოძებნიან - რეკრუტერების უმეტესობა საჯარო პროფილებს ამოწმებს, ორი წლის წინანდელი „ხუმრობა“ კი დღევანდელ შენად იკითხება.',
    },
    {
      en: 'A private account is one switch with the biggest effect: you decide who sees what, instead of everyone seeing everything.',
      ka: 'პრივატული ანგარიში ერთი ჩამრთველია ყველაზე დიდი ეფექტით: ვინ რას ხედავს, შენ წყვეტ - ნაცვლად იმისა, რომ ყველამ ყველაფერი ნახოს.',
    },
  ],
  rounds: [
    {
      type: 'flags',
      prompt: {
        en: 'This is nini_2009’s public profile - anyone can open it, no follow needed. You are the stranger. Tap every item that tells you more than she thinks it does.',
        ka: 'ეს nini_2009-ის საჯარო პროფილია - მისი გახსნა ნებისმიერს შეუძლია, გამოწერა არ სჭირდება. უცნობი შენ ხარ. მონიშნე ყველა ჩანაწერი, რომელიც მასზე იმაზე მეტს ყვება, ვიდრე თვითონ ჰგონია.',
      },
      items: [
        {
          from: { en: 'Bio', ka: 'ბიო' },
          text: {
            en: 'Nini · 15 · Tbilisi · quicker to reach me here: 599 12 34 56',
            ka: 'ნინი · 15 · თბილისი · უფრო სწრაფად აქ დამიკავშირდი: 599 12 34 56',
          },
          flag: true,
          explain: {
            en: 'A phone number in a public bio hands any stranger a direct line - calls, messages - plus a search key: a number links to messaging apps and other accounts.',
            ka: 'ტელეფონის ნომერი საჯარო ბიოში ნებისმიერ უცნობს პირდაპირ კავშირს აძლევს - ზარებს, შეტყობინებებს - და თან საძიებო გასაღებია: ნომრით მესენჯერები და სხვა ანგარიშებიც მოიძებნება.',
          },
        },
        {
          from: { en: 'Post · yesterday', ka: 'პოსტი · გუშინ' },
          text: {
            en: 'A cat meme: "me in first period at 8 AM"',
            ka: 'კატის მემი: „მე დილის 8 საათზე, პირველ გაკვეთილზე“',
          },
          flag: false,
          explain: {
            en: 'A meme tells a stranger nothing - no place, no time, no contact. The goal is not to post less; it is to post less about where and when.',
            ka: 'მემი უცნობს არაფერს ეუბნება - არც ადგილს, არც დროს, არც კონტაქტს. მიზანი ის კი არ არის, ნაკლები დაპოსტო - ის არის, რომ ადგილსა და დროზე დაპოსტო ნაკლები.',
          },
        },
        {
          from: { en: 'Photo · Monday', ka: 'ფოტო · ორშაბათი' },
          text: {
            en: 'New haircut 💇 shot right at our entrance - Vazha-Pshavela 21, the blue door',
            ka: 'ახალი ვარცხნილობა 💇 პირდაპირ ჩვენს სადარბაზოსთან გადავიღე - ვაჟა-ფშაველას 21, ლურჯი კარი',
          },
          flag: true,
          explain: {
            en: 'That caption is a home address. A stranger now knows exactly which door she walks through every day - no following required.',
            ka: 'ეს წარწერა სახლის მისამართია. უცნობმა უკვე ზუსტად იცის, რომელ კარში შედის ის ყოველდღე - თვალთვალი აღარც სჭირდება.',
          },
        },
        {
          from: { en: 'Post', ka: 'პოსტი' },
          text: {
            en: 'Back at school #147 😩 Tuesdays are the worst - chemistry till 3, then volleyball practice till 5',
            ka: '147-ე სკოლაში დავბრუნდით 😩 სამშაბათები ყველაზე მძიმეა - ქიმია 3 საათამდე, მერე ფრენბურთის ვარჯიში 5-მდე',
          },
          flag: true,
          explain: {
            en: 'School name plus a weekly timetable is a fixed place and time where she can be found - every single week. Routines are what strangers wait for.',
            ka: 'სკოლის ნომერი პლუს კვირის განრიგი ფიქსირებული ადგილი და დროა, სადაც მისი პოვნა ყოველ კვირას შეიძლება. უცნობები სწორედ რუტინას ელოდებიან.',
          },
        },
        {
          from: { en: 'Photo', ka: 'ფოტო' },
          text: {
            en: 'A cake with candles: "thank you all 🎂❤️"',
            ka: 'ტორტი სანთლებით: „ყველას მადლობა 🎂❤️“',
          },
          flag: false,
          explain: {
            en: 'No location, no schedule, no contact info. A stranger learns she had a birthday - and can do exactly nothing with that.',
            ka: 'არც ლოკაცია, არც განრიგი, არც საკონტაქტო ინფორმაცია. უცნობი იგებს, რომ მას დაბადების დღე ჰქონდა - და ამით ზუსტად ვერაფერს იზამს.',
          },
        },
        {
          from: { en: 'Story · Friday', ka: 'სთორი · პარასკევი' },
          text: {
            en: 'FINALLY home alone all weekend 🎉 parents left for Kutaisi',
            ka: 'როგორც იქნა - მთელი შაბათ-კვირა მარტო ვარ სახლში 🎉 მშობლები ქუთაისში წავიდნენ',
          },
          flag: true,
          explain: {
            en: 'This tells every stranger reading it that no adult will be at that address for two days. Burglars genuinely scan public posts for exactly this sentence - and thanks to the entrance photo, they have the address too.',
            ka: 'ეს ყველა უცნობ მკითხველს ეუბნება, რომ იმ მისამართზე ორი დღე უფროსი არავინ იქნება. ქურდები საჯარო პოსტებში ზუსტად ამ წინადადებას ეძებენ - სადარბაზოს ფოტოს წყალობით კი მისამართიც უკვე აქვთ.',
          },
        },
        {
          from: { en: 'Post · every day', ka: 'პოსტი · ყოველდღე' },
          text: {
            en: 'Day 47 💪 same time, same place [📍 FitZone Vake · 18:00]',
            ka: '47-ე დღე 💪 იგივე დრო, იგივე ადგილი [📍 FitZone ვაკე · 18:00]',
          },
          flag: true,
          explain: {
            en: 'A daily geotag at a fixed hour is a schedule for a "chance" encounter. Anyone who wants to find her knows where she will be at 6 PM - today, tomorrow, and next week.',
            ka: 'ყოველდღიური გეოთეგი ფიქსირებულ საათზე „შემთხვევითი“ შეხვედრის განრიგია. ვისაც მისი პოვნა უნდა, იცის, სად იქნება ის საღამოს 6-ზე - დღეს, ხვალ და მომავალ კვირასაც.',
          },
        },
      ],
      explain: {
        en: 'Five hits: her number, her door, her school, her weekly schedule, and the exact weekend the flat stands empty. She never posted "here is everything about me" - she posted it in pieces. Strangers do the assembling.',
        ka: 'ხუთი მიგნება: მისი ნომერი, მისი კარი, მისი სკოლა, კვირის განრიგი და ზუსტად ის შაბათ-კვირა, როცა ბინა ცარიელი დგას. მას არასდროს დაუპოსტავს „აი, ყველაფერი ჩემზე“ - მან ეს ნაწილ-ნაწილ დაპოსტა. აწყობას კი უცნობები ითავებენ.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'Now put the pieces together. From those posts alone, what can a total stranger work out about Nini?',
        ka: 'ახლა ნაწილები ერთად ააწყვე. მხოლოდ ამ პოსტებიდან რისი გაგება შეუძლია სრულიად უცნობს ნინიზე?',
      },
      options: [
        {
          label: {
            en: 'Her taste in memes and haircuts - nothing useful',
            ka: 'მისი გემოვნება მემებსა და ვარცხნილობებში - არაფერი გამოსადეგი',
          },
          correct: false,
        },
        {
          label: {
            en: 'Where she will be, at what time, and whether she is alone - enough to plan a "chance" meeting',
            ka: 'სად იქნება, რომელ საათზე და მარტო იქნება თუ არა - საკმარისი „შემთხვევითი“ შეხვედრის დასაგეგმად',
          },
          correct: true,
        },
        {
          label: {
            en: 'Not much - the account is public, but the algorithm hides most posts anyway',
            ka: 'დიდად არაფრის - ანგარიში საჯაროა, მაგრამ პოსტების უმეტესობას ალგორითმი ისედაც მალავს',
          },
          correct: false,
        },
      ],
      explain: {
        en: 'Each post is harmless on its own. Together they are a timetable: gym at six, school on Tuesday till five, an empty flat this weekend, and a direct phone line. Assembling it took you two minutes - a motivated stranger needs about the same.',
        ka: 'თითოეული პოსტი ცალკე უწყინარია. ერთად კი ისინი განრიგია: დარბაზი ექვსზე, სკოლა სამშაბათს ხუთამდე, ცარიელი ბინა ამ შაბათ-კვირას და პირდაპირი სატელეფონო ხაზი. ამის აწყობას შენ ორი წუთი მოანდომე - მოტივირებულ უცნობს დაახლოებით ამდენივე სჭირდება.',
      },
    },
    {
      type: 'choice',
      card: {
        from: { en: 'Public profile · gio_tbilisi', ka: 'საჯარო პროფილი · gio_tbilisi' },
        meta: { en: 'Pinned post · 2 years ago', ka: 'დამაგრებული პოსტი · 2 წლის წინ' },
        body: {
          en: 'An "edgy" joke mocking a classmate’s accent, with his photo attached. 43 laughing emojis in the comments.',
          ka: '„მძაფრი“ ხუმრობა, რომელიც თანაკლასელის აქცენტს დასცინის, მისივე ფოტოთი. კომენტარებში 43 მოცინარი სმაილი.',
        },
      },
      q: {
        en: 'Gio, now 17, applied for a summer internship at a tech company. Before the interview the recruiter opens his profile - standard practice. What actually happens?',
        ka: 'გიომ, რომელიც ახლა 17 წლისაა, ტექნოლოგიურ კომპანიაში საზაფხულო სტაჟირებაზე შეიტანა განაცხადი. გასაუბრებამდე რეკრუტერი მის პროფილს ხსნის - ეს სტანდარტული პრაქტიკაა. სინამდვილეში რა ხდება?',
      },
      options: [
        {
          label: {
            en: 'Nothing - it is two years old, nobody counts ancient posts',
            ka: 'არაფერი - ორი წლის წინანდელია, ძველ პოსტებს არავინ ითვალისწინებს',
          },
          correct: false,
        },
        {
          label: {
            en: 'The recruiter reads it as who Gio is today - and quietly moves on to the next candidate',
            ka: 'რეკრუტერი ამას დღევანდელ გიოდ კითხულობს - და ჩუმად შემდეგ კანდიდატზე გადადის',
          },
          correct: true,
        },
        {
          label: {
            en: 'Recruiters are not allowed to judge personal profiles',
            ka: 'რეკრუტერებს პირადი პროფილებით შეფასების უფლება არ აქვთ',
          },
          correct: false,
        },
      ],
      explain: {
        en: 'Most recruiters and university admissions offices check public profiles, and nothing forbids it. A pinned post is the first thing they see, and "2 years ago" reads as "still proud of it today". The internet has no expiry date - and this kind of rejection arrives as silence: Gio will never learn why nobody called back.',
        ka: 'რეკრუტერებისა და უნივერსიტეტების მიმღები კომისიების უმეტესობა საჯარო პროფილებს ამოწმებს და ამას არაფერი უკრძალავს. დამაგრებული პოსტი პირველია, რასაც ხედავენ, „2 წლის წინ“ კი ასე იკითხება: „დღემდე ვამაყობ ამით“. ინტერნეტს ვადა არ გასდის - ასეთი უარი კი დუმილის სახით მოდის: გიო ვერასდროს გაიგებს, რატომ არ დაურეკა არავინ.',
      },
    },
    {
      type: 'builder',
      prompt: {
        en: 'Second seat: your own profile. You have ten minutes - pick the moves that actually shrink your footprint and reach the target.',
        ka: 'მეორე სკამი: შენი საკუთარი პროფილი. ათი წუთი გაქვს - აირჩიე სვლები, რომლებიც შენს კვალს ნამდვილად ამცირებს, და მიაღწიე მიზანს.',
      },
      target: 60,
      meterLow: { en: 'Open book', ka: 'ღია წიგნი' },
      meterHigh: { en: 'You decide who sees what', ka: 'შენ წყვეტ, ვინ რას ხედავს' },
      options: [
        {
          label: { en: 'Make the account private', ka: 'გახადე ანგარიში პრივატული' },
          note: { en: 'one switch, biggest effect', ka: 'ერთი ჩამრთველი, ყველაზე დიდი ეფექტი' },
          value: 20,
        },
        {
          label: { en: 'Remove location tags from old posts', ka: 'წაშალე ლოკაციის თეგები ძველი პოსტებიდან' },
          value: 15,
        },
        {
          label: { en: 'Delete the post with your school schedule', ka: 'წაშალე პოსტი შენი სკოლის განრიგით' },
          value: 15,
        },
        {
          label: { en: 'Review the photos you are tagged in', ka: 'გადახედე ფოტოებს, რომლებზეც მონიშნული ხარ' },
          note: { en: 'others post you too', ka: 'შენზე სხვებიც პოსტავენ' },
          value: 10,
        },
        {
          label: { en: 'Go through your followers, remove strangers', ka: 'გადაათვალიერე გამომწერები და წაშალე უცნობები' },
          value: 10,
        },
        {
          label: {
            en: 'Post your vacation dates - everyone does it',
            ka: 'დაპოსტე შენი არდადეგების თარიღები - ამას ყველა აკეთებს',
          },
          value: -15,
        },
        {
          label: {
            en: 'Keep the phone number in your bio - it is convenient',
            ka: 'დატოვე ტელეფონის ნომერი ბიოში - მოსახერხებელია',
          },
          value: -10,
        },
      ],
      explain: {
        en: 'A real audit in ten minutes: private account, no location trail, no schedule, no strangers in the follower list, and a check on what others post about you. A stranger opening your profile now learns roughly nothing - which is exactly the goal.',
        ka: 'ნამდვილი აუდიტი ათ წუთში: პრივატული ანგარიში, აღარც ლოკაციის კვალი, აღარც განრიგი, აღარც უცნობები გამომწერებში, პლუს შემოწმებული, თუ რას პოსტავენ შენზე სხვები. უცნობი, რომელიც ახლა შენს პროფილს გახსნის, თითქმის ვერაფერს გაიგებს - მიზანიც ზუსტად ეს არის.',
      },
      explainNegative: {
        en: 'Strong audit - with a door left open. Vacation dates announce exactly when your home is empty, and a phone number in a public bio is a direct line plus a search key to your other accounts. What is convenient for you is convenient for a stranger too.',
        ka: 'ძლიერი აუდიტია - მაგრამ ერთი კარი ღია დატოვე. არდადეგების თარიღები ზუსტად იმას აცხადებს, როდის იქნება შენი სახლი ცარიელი, ტელეფონის ნომერი საჯარო ბიოში კი პირდაპირი ხაზია - და თან გასაღები შენი სხვა ანგარიშების მოსაძებნად. რაც შენთვის მოსახერხებელია, უცნობისთვისაც მოსახერხებელია.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'Case closed - one question left in the file. What is a digital footprint, really?',
        ka: 'საქმე დახურულია - საქაღალდეში ერთი კითხვაღა დარჩა. სინამდვილეში რა არის ციფრული კვალი?',
      },
      options: [
        {
          label: {
            en: 'Whatever is currently visible on my profile',
            ka: 'ის, რაც ახლა ჩემს პროფილზე ჩანს',
          },
          correct: false,
        },
        {
          label: {
            en: 'Everything findable about me - posts, tags, comments, old accounts - searchable by anyone, including people I will meet in five years',
            ka: 'ყველაფერი, რაც ჩემზე მოიძებნება - პოსტები, თეგები, კომენტარები, ძველი ანგარიშები - და რისი მოძებნაც ნებისმიერს შეუძლია, მათ შორის ადამიანებს, რომლებსაც 5 წელიწადში გავიცნობ',
          },
          correct: true,
        },
        {
          label: {
            en: 'Something that disappears as soon as I delete the post',
            ka: 'ის, რაც პოსტის წაშლისთანავე ქრება',
          },
          correct: false,
        },
      ],
      explain: {
        en: 'Deleted posts survive in screenshots, tags and archives, and your comments on other pages count too. The real audience is not today’s followers - it is a future recruiter, a future university, a future friend typing your name into a search bar. You met two of those readers today. Same footprint, different eyes.',
        ka: 'წაშლილი პოსტები სქრინშოტებში, თეგებსა და არქივებში ცოცხლობს, შენი კომენტარები სხვის გვერდებზე კი ასევე ითვლება. ნამდვილი აუდიტორია დღევანდელი გამომწერები არ არიან - ის მომავალი რეკრუტერია, მომავალი უნივერსიტეტი, მომავალი მეგობარი, რომელიც შენს სახელს საძიებო ველში კრეფს. ორ ასეთ მკითხველს დღეს უკვე შეხვდი. კვალი ერთია, თვალები - სხვადასხვა.',
      },
    },
  ],
  takeaways: [
    {
      en: 'Posts are harmless one at a time. Strangers read them together: location + schedule + "home alone" = a plan.',
      ka: 'პოსტები სათითაოდ უწყინარია. უცნობები მათ ერთად კითხულობენ: ლოკაცია + განრიგი + „მარტო ვარ სახლში“ = გეგმა.',
    },
    {
      en: 'Post the trip after you are back. Real-time location and dates tell strangers where you are - and where you are not.',
      ka: 'მოგზაურობა დაბრუნების შემდეგ დაპოსტე. რეალურ დროში ლოკაცია და თარიღები უცნობებს ეუბნება, სად ხარ - და სად არ ხარ.',
    },
    {
      en: 'The internet remembers: a two-year-old "joke" reads as today’s you to a recruiter or a university.',
      ka: 'ინტერნეტს ახსოვს: ორი წლის წინანდელი „ხუმრობა“ რეკრუტერისა და უნივერსიტეტისთვის დღევანდელი შენ ხარ.',
    },
    {
      en: 'The ten-minute audit: private account, no location tags, no phone number in the bio, no strangers in the followers.',
      ka: 'ათწუთიანი აუდიტი: პრივატული ანგარიში, არც ლოკაციის თეგები, არც ტელეფონის ნომერი ბიოში, არც უცნობები გამომწერებში.',
    },
    {
      en: 'Your footprint’s real audience is people you have not met yet. They will search your name first.',
      ka: 'შენი კვალის ნამდვილი აუდიტორია ის ხალხია, ვისაც ჯერ არ იცნობ. ისინი ჯერ შენს სახელს მოძებნიან.',
    },
  ],
}
