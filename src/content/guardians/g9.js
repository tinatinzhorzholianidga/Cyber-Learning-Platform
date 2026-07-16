// G9 - Balance Boss. Sleep, doomscrolling, social comparison and the
// problem-use self-check (spec section 3, APA-based). Frame: performance
// and feeling good - athletes optimize sleep; you run the algorithm,
// not the other way around. Explicitly non-preachy: no "screens are bad".
export default {
  brief: {
    en: 'Top athletes obsess over sleep because it is free, legal performance enhancement. Meanwhile the feed in your hand was engineered by some of the best-paid engineers alive to keep you watching - including at 01:00. This mission is not "screens are bad". It is an audit: who is actually running your evening - you, or the algorithm?',
    ka: 'საუკეთესო სპორტსმენები ძილზე იმიტომ გიჟდებიან, რომ ეს უფასო და ლეგალური დოპინგია. ამასობაში ლენტა შენს ხელში მსოფლიოს ერთ-ერთი ყველაზე მაღალანაზღაურებადი ინჟინრების აწყობილია იმისთვის, რომ უყურო - 01:00-ზეც. ეს მისია არ არის „ეკრანები ცუდია“. ეს აუდიტია: სინამდვილეში ვინ მართავს შენს საღამოს - შენ თუ ალგორითმი?',
  },
  theory: [
    {
      en: 'The real measure is displacement, not hours: screen time is a problem when it eats your sleep, your friends or the rest of your life - not when a counter hits some number.',
      ka: 'ნამდვილი საზომი ჩანაცვლებაა და არა საათები: საეკრანო დრო მაშინ არის პრობლემა, როცა ძილს, მეგობრებს ან დანარჩენ ცხოვრებას გიჭამს - და არა მაშინ, როცა მთვლელი რომელიღაც ციფრს მიაღწევს.',
    },
    {
      en: 'Sleep comes first - it is free performance enhancement, and top athletes guard it like treasure. A bright screen at midnight pushes sleepiness later, never closer.',
      ka: 'ძილი პირველია - ის უფასო დოპინგია და საუკეთესო სპორტსმენები მას განძივით იცავენ. კაშკაშა ეკრანი შუაღამისას ძილიანობას აშორებს და არასდროს - აახლოებს.',
    },
    {
      en: 'Friction beats willpower. A phone charging outside the bedroom wins the fight your discipline loses at 00:30 - you cannot scroll what you cannot reach.',
      ka: 'ხახუნი ნებისყოფას ამარცხებს. საძინებლის გარეთ დამტენზე დადებული ტელეფონი იგებს ბრძოლას, რომელსაც შენი დისციპლინა 00:30-ზე აგებს - რასაც ვერ წვდები, ვერც დაასქროლავ.',
    },
    {
      en: 'Feeds are bottomless on purpose: there is no last video, and teams of engineers are paid to turn "one more" into forty. Losing to that design is not weakness.',
      ka: 'ლენტა განზრახ უფსკერულია: ბოლო ვიდეო არ არსებობს, ინჟინრების გუნდებს კი იმაში უხდიან, რომ „კიდევ ერთი“ ორმოცად აქციონ. ამ დიზაინთან წაგება სისუსტე არ არის.',
    },
    {
      en: 'Curate the feed: mute or unfollow whatever reliably makes you feel worse. The algorithm reads that signal and rebuilds around it - you run it, not the other way around.',
      ka: 'გააკეთე ლენტის კურირება: გააჩუმე ან გააუქმე ყველაფერი, რაც სტაბილურად თავს ცუდად გაგრძნობინებს. ალგორითმი ამ სიგნალს კითხულობს და ლენტას მის მიხედვით გიწყობს - მას შენ მართავ და არა პირიქით.',
    },
  ],
  rounds: [
    {
      type: 'choice',
      q: {
        en: 'It is 23:40. Big test tomorrow. You tell yourself "one more video". You already know how this story usually ends. What actually works?',
        ka: '23:40-ია. ხვალ მნიშვნელოვანი ტესტი გაქვს. საკუთარ თავს ეუბნები: „კიდევ ერთი ვიდეო“. უკვე იცი, როგორ მთავრდება ხოლმე ეს ამბავი. რა მუშაობს რეალურად?',
      },
      options: [
        {
          label: { en: 'Trust your willpower - watch one more, then stop', ka: 'ვენდობი ნებისყოფას - კიდევ ერთს ვუყურებ და გავჩერდები' },
          correct: false,
        },
        {
          label: { en: 'Keep watching until you feel sleepy, then sleep', ka: 'ვუყურებ, სანამ არ დამეძინება, და მერე დავიძინებ' },
          correct: false,
        },
        {
          label: {
            en: 'Park the phone on its charging spot out of arm’s reach and set the alarm on a real clock',
            ka: 'ტელეფონს დასატენ ადგილას დავდებ, ხელმიუწვდომლად, და მაღვიძარას ნამდვილ საათზე დავაყენებ',
          },
          correct: true,
        },
      ],
      explain: {
        en: 'Willpower loses this fight by design. 45% of teens say social media hurts their sleep (Pew, 2025) - and the feed is built by teams whose only job is to turn "one more" into forty. That is not your weakness; it is their profession. Watching until sleepy backfires too: the bright screen and the dopamine drip push sleepiness later, not closer. Friction wins where willpower fails - a phone across the room cannot be scrolled from under the blanket.',
        ka: 'ნებისყოფა ამ ბრძოლას თავიდანვე აგებს. მოზარდების 45% ამბობს, რომ სოციალური ქსელები ძილს უფუჭებს (Pew, 2025) - ლენტას კი ისეთი გუნდები აწყობენ, რომელთა ერთადერთი საქმეა, „კიდევ ერთი“ ორმოცად აქციონ. ეს შენი სისუსტე კი არა, მათი პროფესიაა. „სანამ დამეძინება, ვუყურებ“ პირიქით მუშაობს: კაშკაშა ეკრანი და დოფამინის წვეთები ძილიანობას აშორებს და არა აახლოებს. სადაც ნებისყოფა მარცხდება, იქ ხახუნი იმარჯვებს - ოთახის მეორე კუთხეში მდებარე ტელეფონს საბნიდან ვერ დაასქროლავ.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'You spent 20 minutes on a fitness-and-looks feed. You went in feeling fine. You came out feeling worse about your own body. What is the move?',
        ka: '20 წუთი გაატარე ფიტნესისა და გარეგნობის ლენტაზე. შეხვედი კარგ ხასიათზე - გამოხვედი საკუთარ სხეულზე გულმოსული. რა არის სვლა?',
      },
      options: [
        {
          label: {
            en: 'Keep following - it is motivation, and feeling bad is part of training',
            ka: 'ვაგრძელებ გამოწერას - ეს მოტივაციაა, ცუდი განცდა ვარჯიშის ნაწილია',
          },
          correct: false,
        },
        {
          label: {
            en: 'Mute or unfollow every account that reliably makes you feel worse',
            ka: 'ვაჩუმებ ან გამოწერას ვუუქმებ ყველა ანგარიშს, რომელიც სტაბილურად თავს ცუდად მაგრძნობინებს',
          },
          correct: true,
        },
        {
          label: { en: 'Delete social media completely', ka: 'საერთოდ ვშლი სოციალურ ქსელებს' },
          correct: false,
        },
      ],
      explain: {
        en: 'Track the pattern, then act on it: if an account reliably leaves you feeling worse, mute or unfollow - the algorithm reads that signal and rebuilds your feed around it. That is not weakness; it is exactly what a coach does when a drill damages more than it builds. "Motivation" that lowers your opinion of yourself twenty minutes at a time is not motivation. And deleting everything is a crash diet - it rarely holds. Curating is a system, and it works.',
        ka: 'დაიჭირე კანონზომიერება და იმოქმედე: თუ ანგარიში ყოველ ჯერზე უარეს ხასიათზე გტოვებს, გააჩუმე ან გამოწერა გაუუქმე - ალგორითმი ამ სიგნალს კითხულობს და ლენტას მის მიხედვით გიწყობს თავიდან. ეს სისუსტე არ არის; ზუსტად ასე იქცევა მწვრთნელი, როცა სავარჯიშო აშენებაზე მეტად ტეხს. „მოტივაცია“, რომელიც ოცწუთიან პორციებად საკუთარ თავზე წარმოდგენას გინგრევს, მოტივაცია არ არის. ყველაფრის წაშლა კი მკაცრი დიეტასავითაა - იშვიათად ძლებს. ლენტის კურირება სისტემაა და ის მუშაობს.',
      },
    },
    {
      type: 'flags',
      prompt: {
        en: 'Self-audit - honestly, nobody sees your answers. Six statements. Flag only the ones that are actual problem-use signs.',
        ka: 'თვითაუდიტი - გულწრფელად, შენს პასუხებს არავინ ხედავს. ექვსი წინადადება. მონიშნე მხოლოდ ის, რაც პრობლემური მოხმარების რეალური ნიშანია.',
      },
      items: [
        {
          text: {
            en: 'You skip meeting friends in person because you would rather stay home and scroll',
            ka: 'მეგობრებთან შეხვედრებს აცდენ, რადგან გირჩევნია სახლში დარჩე და ისქროლო',
          },
          flag: true,
          explain: {
            en: 'Scrolling that replaces real friends is displacement - the core warning sign in the APA guidance.',
            ka: 'სქროლვა, რომელიც ცოცხალ მეგობრებს ანაცვლებს, ჩანაცვლებაა - APA-ს მთავარი გამაფრთხილებელი ნიშანი.',
          },
        },
        {
          text: {
            en: 'You wake at 03:00 and the phone is in your hand before you are fully awake',
            ka: '03:00-ზე იღვიძებ და ტელეფონი ხელში გიჭირავს მანამ, სანამ ბოლომდე გაიღვიძებდე',
          },
          flag: true,
          explain: {
            en: 'Night use that cuts into sleep is the fastest route into the problem zone.',
            ka: 'ღამის მოხმარება, რომელიც ძილს გიჭრის, პრობლემურ ზონამდე უმოკლესი გზაა.',
          },
        },
        {
          text: {
            en: 'Your mood crashes when the phone is not with you - restless, irritable, checking an empty pocket',
            ka: 'როცა ტელეფონი თან არ გაქვს, ხასიათი გეფუშება - მოუსვენრობა, გაღიზიანება, ცარიელი ჯიბის შემოწმება',
          },
          flag: true,
          explain: {
            en: 'Distress at separation is a withdrawal-type signal - worth taking seriously.',
            ka: 'განშორებაზე ასეთი რეაქცია მოწყვეტის ტიპის სიგნალია - სერიოზულად აღების ღირსი.',
          },
        },
        {
          text: {
            en: 'You report smaller screen-time numbers than the app shows - to your parents, and to yourself',
            ka: 'მშობლებს - და საკუთარ თავსაც - აპის ნაჩვენებზე ნაკლებ საეკრანო დროს ეუბნები',
          },
          flag: true,
          explain: {
            en: 'Hiding the numbers means part of you has already flagged the problem.',
            ka: 'ციფრების დამალვა ნიშნავს, რომ შენმა ნაწილმა პრობლემა უკვე მონიშნა.',
          },
        },
        {
          text: {
            en: 'On a free Friday evening you spend two hours gaming with your friends',
            ka: 'თავისუფალ პარასკევ საღამოს ორ საათს მეგობრებთან ერთად თამაშში ატარებ',
          },
          flag: false,
          explain: {
            en: 'Social play in free time displaces nothing. That is a hobby - with friends.',
            ka: 'თავისუფალ დროს მეგობრებთან თამაში არაფერს ანაცვლებს. ეს ჰობია - თანაც მეგობრებთან ერთად.',
          },
        },
        {
          text: {
            en: 'You spend an hour on your phone researching a school project',
            ka: 'ერთ საათს ტელეფონით სასკოლო პროექტისთვის მასალის ძებნაში ატარებ',
          },
          flag: false,
          explain: {
            en: 'A tool doing its job. Raw hours are not the metric.',
            ka: 'ინსტრუმენტი თავის საქმეს აკეთებს. საათები, თავისთავად, საზომი არ არის.',
          },
        },
      ],
      explain: {
        en: 'The APA does not draw the line at an hour count - it draws it at displacement. Two hours of gaming with friends on a free evening costs nothing; use that eats your sleep, replaces in-person friends or crowds out the rest of your life does. Add hidden numbers and mood crashes without the phone, and you have the real checklist. If you just flagged something in yourself, that is data, not a verdict - the next round is the fix.',
        ka: 'APA ზღვარს საათების რაოდენობაზე კი არ ავლებს, არამედ ჩანაცვლებაზე. თავისუფალ საღამოს მეგობრებთან ორსაათიანი თამაში არაფერს გაკარგვინებს; მოხმარება, რომელიც ძილს გიჭამს, ცოცხალ მეგობრებს გინაცვლებს ან დანარჩენ ცხოვრებას გიმჩნევს ადგილს - გაკარგვინებს. დაუმატე დამალული ციფრები და ტელეფონის გარეშე ჩამოვარდნილი ხასიათი - და გაქვს ნამდვილი ჩეკლისტი. თუ ახლა საკუთარ თავში რამე მონიშნე, ეს მონაცემია და არა განაჩენი - შემდეგი რაუნდი გამოსავალია.',
      },
    },
    {
      type: 'builder',
      prompt: {
        en: 'Build tonight, starting at 21:00. Goal: wake up in top form. Pick your setup - the meter shows who is in charge.',
        ka: 'ააწყვე დღევანდელი საღამო, 21:00-დან. მიზანი: დილით მაქსიმალურ ფორმაში გაიღვიძო. აარჩიე შენი წყობა - მაჩვენებელი გეტყვის, ვინ მართავს.',
      },
      target: 60,
      meterLow: { en: 'The algorithm is running your night.', ka: 'შენს ღამეს ალგორითმი მართავს.' },
      meterHigh: { en: 'You run the night. Boss level.', ka: 'ღამეს შენ მართავ. ბოსის დონე.' },
      options: [
        {
          label: { en: 'Phone charges outside the bedroom', ka: 'ტელეფონი საძინებლის გარეთ იტენება' },
          note: { en: 'the single strongest move on the board', ka: 'ერთადერთი ყველაზე ძლიერი სვლა მთელ დაფაზე' },
          value: 20,
        },
        {
          label: { en: 'Alarm on a real clock, not the phone', ka: 'მაღვიძარა ნამდვილ საათზე და არა ტელეფონზე' },
          value: 10,
        },
        {
          label: { en: 'Notifications off after 22:00', ka: 'შეტყობინებები გამორთულია 22:00-ის შემდეგ' },
          value: 15,
        },
        {
          label: {
            en: '30 minutes of anything offline before sleep - music, shower, book, stretching',
            ka: 'ძილის წინ 30 წუთი ნებისმიერი რამ ოფლაინში - მუსიკა, შხაპი, წიგნი, გაჭიმვა',
          },
          value: 15,
        },
        {
          label: { en: 'Write down tomorrow’s first task', ka: 'ჩაწერე ხვალინდელი პირველი საქმე' },
          value: 10,
        },
        {
          label: { en: 'Phone under the pillow - "it is my alarm"', ka: 'ტელეფონი ბალიშის ქვეშ - „მაღვიძარაა“' },
          value: -15,
        },
        {
          label: { en: '"Just 10 minutes" of the feed, in bed', ka: '„სულ 10 წუთი“ ლენტაზე, საწოლში' },
          value: -15,
        },
      ],
      explain: {
        en: 'Look at what scored: none of it is willpower - it is architecture. Phone out of the room, a real clock, dead notifications: each one deletes a decision you would otherwise have to win at 23:50 with a tired brain. Athletes call this sleep hygiene. Engineers call it removing failure modes. Either way, the boss designs the system instead of fighting it.',
        ka: 'დააკვირდი, რამ დააგროვა ქულები: არცერთი მათგანი ნებისყოფა არ არის - ეს არქიტექტურაა. ტელეფონი ოთახის გარეთ, ნამდვილი საათი, გამორთული შეტყობინებები: თითოეული შლის გადაწყვეტილებას, რომელიც სხვა შემთხვევაში 23:50-ზე დაღლილი ტვინით უნდა მოიგო. სპორტსმენები ამას ძილის ჰიგიენას ეძახიან. ინჟინრები - ჩავარდნის წერტილების მოცილებას. ორივე შემთხვევაში ბოსი სისტემას აწყობს და არა ებრძვის.',
      },
      explainNegative: {
        en: 'Both negative picks run on the same lie: "just a little, then I will stop." The feed has no bottom - it refreshes forever, and there is no last video to reach. The design is rigged against your discipline, so the only winning move is distance: it cannot pull on what it cannot reach.',
        ka: 'ორივე მინუსიანი არჩევანი ერთსა და იმავე ტყუილზე მუშაობს: „ცოტას და გავჩერდები“. ლენტას ფსკერი არ აქვს - ის უსასრულოდ ახლდება და ბოლო ვიდეო უბრალოდ არ არსებობს. დიზაინი შენი დისციპლინის წინააღმდეგ არის აწყობილი, ამიტომ ერთადერთი მომგებიანი სვლა მანძილია: რასაც ვერ წვდება, იმას ვერც გითრევს.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'Last question of the audit. Who is the feed actually built for?',
        ka: 'აუდიტის ბოლო კითხვა. სინამდვილეში ვისთვის არის ლენტა აწყობილი?',
      },
      options: [
        {
          label: { en: 'For you - to show you what you like', ka: 'შენთვის - რომ გაჩვენოს, რაც მოგწონს' },
          correct: false,
        },
        {
          label: { en: 'For creators - to help them grow an audience', ka: 'შემქმნელებისთვის - რომ აუდიტორია გაზარდონ' },
          correct: false,
        },
        {
          label: {
            en: 'For advertisers - your attention is the product being sold',
            ka: 'რეკლამის შემკვეთებისთვის - გასაყიდი პროდუქტი შენი ყურადღებაა',
          },
          correct: true,
        },
      ],
      explain: {
        en: 'Platforms are free because you are not the customer - advertisers are, and they buy your attention by the minute. Autoplay, infinite scroll, streaks: every one of those exists to harvest more sellable minutes. Knowing this is the cheat code. "One more video" stops being your craving and becomes their sales tactic - and it is a lot easier to walk out on someone else’s sales tactic.',
        ka: 'პლატფორმები იმიტომ არის უფასო, რომ კლიენტი შენ არ ხარ - კლიენტები რეკლამის შემკვეთები არიან და ისინი შენს ყურადღებას წუთობრივად ყიდულობენ. ავტოდაკვრა, უსასრულო სქროლი, სერიების ჯაჭვები: ყველა ეს დეტალი იმისთვის არსებობს, რომ მეტი გასაყიდი წუთი მოაგროვოს. ამის ცოდნა თამაშის გასატეხი კოდია. „კიდევ ერთი ვიდეო“ შენი სურვილი აღარ არის - მათი გაყიდვის ხრიკია, სხვისი გაყიდვის ხრიკისთვის ზურგის შექცევა კი ბევრად ადვილია.',
      },
    },
  ],
  takeaways: [
    {
      en: 'Friction beats willpower. Phone out of the bedroom, alarm on a real clock - top performers guard sleep first, because it is free performance.',
      ka: 'ხახუნი ნებისყოფას ამარცხებს. ტელეფონი საძინებლის გარეთ, მაღვიძარა ნამდვილ საათზე - საუკეთესოები პირველ რიგში ძილს იცავენ, რადგან ეს უფასო ფორმაა.',
    },
    {
      en: 'Audit the feed: whatever reliably makes you feel worse gets muted or unfollowed. Curating is a power move, not weakness.',
      ka: 'გააკეთე ლენტის აუდიტი: რაც სტაბილურად თავს ცუდად გაგრძნობინებს, ჩუმდება ან უქმდება. კურირება ძალაუფლების სვლაა და არა სისუსტე.',
    },
    {
      en: 'The problem-use line is displacement - the feed eating your sleep, friends or real life - never the raw hour count.',
      ka: 'პრობლემური მოხმარების ზღვარი ჩანაცვლებაა - როცა ლენტა ძილს, მეგობრებს ან რეალურ ცხოვრებას გიჭამს - და არა საათების რაოდენობა.',
    },
    {
      en: 'The feed has no bottom, by design. You can leave it; you can never finish it.',
      ka: 'ლენტას ფსკერი არ აქვს - ასეა დაპროექტებული. მისი მიტოვება შეგიძლია; დამთავრება - ვერასდროს.',
    },
    {
      en: 'Your attention is the product. Once you know that, you scroll on your own terms - you are the boss of the algorithm, not its inventory.',
      ka: 'პროდუქტი შენი ყურადღებაა. როგორც კი ეს იცი, სქროლავ შენი პირობებით - ალგორითმის ბოსი შენ ხარ და არა მისი საქონელი.',
    },
  ],
}
