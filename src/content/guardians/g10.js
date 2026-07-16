// G10 - Guardian Exam (final). Timed mixed gauntlet over all topics
// G1-G9: fresh scenarios, 10 choice rounds, 25 seconds each, 80% to pass.
// Passing earns the Guardian certificate; failing costs nothing.
export default {
  timer: 25,
  passRatio: 0.8,
  brief: {
    en: 'Ten questions. Twenty-five seconds each. Score 80% and you are a Guardian - certificate included. Every scenario is new; every skill is one you already trained. Fail and you lose nothing: no points burned, retake whenever you want. The clock starts when you do.',
    ka: 'ათი კითხვა. თითოზე 25 წამი. აიღე 80% - და დამცველი ხარ, სერტიფიკატითურთ. ყველა სცენარი ახალია; ყველა უნარი - უკვე ნავარჯიშები. ჩაჭრით არაფერს კარგავ: ქულები არ იწვება, გადაბარება ნებისმიერ დროს შეგიძლია. ათვლა მაშინ იწყება, როცა შენ დაიწყებ.',
  },
  theory: [
    {
      en: 'Attackers rush you; Guardians slow down. Urgency, deadlines and "act now" mean: pause, check the real sender, go direct.',
      ka: 'თავდამსხმელი გაჩქარებს, დამცველი კი ანელებს. სისწრაფე, ვადები და „ახლავე“ ნიშნავს: შეჩერდი, შეამოწმე ნამდვილი გამომგზავნი, იმოქმედე პირდაპირ.',
    },
    {
      en: 'Lock the doors in advance: long unique passphrases, 2FA on your email first, and a private profile that never announces where you are right now.',
      ka: 'ჩაკეტე კარები წინასწარ: გრძელი უნიკალური ფრაზა-პაროლები, 2FA ჯერ ელფოსტაზე და პრივატული პროფილი, რომელიც არასდროს აცხადებს, სად ხარ ახლა.',
    },
    {
      en: 'Blackmail, bullying and grooming all collapse the same way: save the evidence, block without deleting, tell a trusted adult, report - 112 and Take It Down. The target is never at fault.',
      ka: 'შანტაჟი, ბულინგი და გრუმინგი ერთნაირად ინგრევა: შეინახე მტკიცებულება, დაბლოკე წაშლის გარეშე, უთხარი სანდო უფროსს, დაარეპორტე - 112 და Take It Down. სამიზნე არასდროს არის დამნაშავე.',
    },
    {
      en: 'Verify before you trust or share: the source before the content, money requests through a channel YOU start - and your attention runs on your terms, not the feed’s.',
      ka: 'ჯერ გადაამოწმე, მერე ენდე ან გააზიარე: ჯერ წყარო და მერე შინაარსი, ფულის თხოვნა - არხით, რომელსაც შენ იწყებ. შენი ყურადღება კი შენი პირობებით მუშაობს და არა ლენტის პირობებით.',
    },
  ],
  rounds: [
    {
      type: 'choice',
      q: {
        en: 'SMS from "GePost": "Your package is held at customs. Pay 2 GEL within 12 hours: ge-post-delivery.top". You really did order sneakers this week. Your move?',
        ka: 'SMS „საფოსტო სერვისისგან“: „ამანათი საბაჟოზეა გაჩერებული. გადაიხადეთ 2 ლარი 12 საათში: ge-post-delivery.top“. ამ კვირაში მართლა შეუკვეთე სპორტული ფეხსაცმელი. შენი სვლა?',
      },
      options: [
        {
          label: { en: 'Pay - it is 2 GEL and the package is real', ka: 'გადავიხდი - სულ 2 ლარია და ამანათი ნამდვილია' },
          correct: false,
        },
        {
          label: { en: 'Open the link just to check the tracking number', ka: 'გავხსნი ბმულს, უბრალოდ თრექინგის ნომრის შესამოწმებლად' },
          correct: false,
        },
        {
          label: {
            en: 'Skip the link; track the order on the shop’s official site',
            ka: 'ბმულს არ გავხსნი; შეკვეთას მაღაზიის ოფიციალურ საიტზე შევამოწმებ',
          },
          correct: true,
        },
      ],
      explain: {
        en: 'Your real order is exactly why this works - scammers blast thousands of these hoping to hit someone expecting a package. Random .top domain, tiny "fee", tight deadline: a card-harvesting page. Track orders only where you ordered.',
        ka: 'შენი ნამდვილი შეკვეთა სწორედ ის მიზეზია, რის გამოც ეს ხრიკი მუშაობს - თაღლითები ათასობით ასეთ SMS-ს გზავნიან იმ იმედით, რომ ვინმე ამანათს ელოდება. შემთხვევითი .top დომენი, პაწაწინა „გადასახადი“, მჭიდრო ვადა: ბარათის მოსაპარი გვერდია. შეკვეთა მხოლოდ იქ შეამოწმე, სადაც შეუკვეთე.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'A site you registered on years ago just got breached. You used the same password there as on your email. What matters most right now?',
        ka: 'საიტი, სადაც წლების წინ დარეგისტრირდი, ახლახან გატეხეს. იქ იგივე პაროლი გქონდა, რაც ელფოსტაზე. რა არის ახლა ყველაზე მნიშვნელოვანი?',
      },
      options: [
        {
          label: { en: 'Nothing - the breach is that site’s problem', ka: 'არაფერი - გატეხვა იმ საიტის პრობლემაა' },
          correct: false,
        },
        {
          label: {
            en: 'Give the email a new unique password and turn on 2FA',
            ka: 'ელფოსტას ახალ, უნიკალურ პაროლს დავუყენებ და ჩავრთავ 2FA-ს',
          },
          correct: true,
        },
        {
          label: { en: 'Add "2026" to the end of the old password', ka: 'ძველ პაროლს ბოლოში „2026“-ს მივუწერ' },
          correct: false,
        },
      ],
      explain: {
        en: 'Leaked passwords get tried against email accounts within hours - and email is the master key that resets everything else. A unique password kills the reuse attack; 2FA holds even if a password leaks again. Cosmetic edits like "+2026" sit in every cracking dictionary.',
        ka: 'გაჟონილ პაროლებს ელფოსტებზე საათებში სინჯავენ - ელფოსტა კი მთავარი გასაღებია, რომლითაც ყველა სხვა ანგარიში აღდგება. უნიკალური პაროლი კლავს გამეორების შეტევას; 2FA მაშინაც იცავს, თუ პაროლი ისევ გაჟონავს. კოსმეტიკური ცვლილება, როგორიცაა „+2026“, გამტეხების ყველა ლექსიკონშია.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'ნინი is about to post a boarding-pass photo captioned "Off to Batumi - house empty for 2 weeks!" to 800 followers she mostly does not know. Best call?',
        ka: 'ნინი აპირებს დაპოსტოს ბორდინგის ფოტო წარწერით „ბათუმში მივფრინავ - სახლი 2 კვირა ცარიელია!“ 800 გამომწერთან, რომელთა უმეტესობას არ იცნობს. საუკეთესო რჩევა?',
      },
      options: [
        {
          label: { en: 'Fine - stories disappear in 24 hours', ka: 'ნორმალურია - სთორი 24 საათში ქრება' },
          correct: false,
        },
        {
          label: { en: 'Post it, but with comments turned off', ka: 'დაპოსტოს, ოღონდ კომენტარები გათიშოს' },
          correct: false,
        },
        {
          label: {
            en: 'Post the beach after the trip - the barcode and "empty house" are gifts to strangers',
            ka: 'პლაჟი მგზავრობის მერე დაპოსტოს - შტრიხკოდი და „ცარიელი სახლი“ უცნობებისთვის საჩუქარია',
          },
          correct: true,
        },
      ],
      explain: {
        en: 'A boarding-pass barcode can expose the whole booking, and "empty for two weeks" next to an identifiable home is an open invitation. Screenshots outlive every 24-hour timer. The trip posts just as well after she is back.',
        ka: 'ბორდინგის შტრიხკოდს მთელი ჯავშნის გახსნა შეუძლია, „ორი კვირა ცარიელი სახლი“ კი ამოსაცნობ მისამართთან ერთად ღია მოწვევაა. სქრინშოტი ნებისმიერ 24-საათიან ტაიმერზე მეტხანს ცოცხლობს. მოგზაურობის დაპოსტვა დაბრუნების მერეც შესანიშნავად გამოვა.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'ლუკა sent a photo to an online "girlfriend". Now the account demands 300 GEL or it goes to all his followers. His first move?',
        ka: 'ლუკამ ონლაინ „შეყვარებულს“ ფოტო გაუგზავნა. ახლა ეს ანგარიში 300 ლარს ითხოვს, თორემ ფოტოს მის ყველა გამომწერს დაუგზავნის. რა არის ლუკას პირველი ნაბიჯი?',
      },
      options: [
        {
          label: { en: 'Pay - 300 GEL is survivable', ka: 'გადაიხადოს - 300 ლარი ასატანია' },
          correct: false,
        },
        {
          label: {
            en: 'Delete the whole chat and his account so nothing can spread',
            ka: 'წაშალოს მთელი მიმოწერა და საკუთარი ანგარიში, რომ ვერაფერი გავრცელდეს',
          },
          correct: false,
        },
        {
          label: {
            en: 'Not pay, save the chat as evidence, tell a trusted adult',
            ka: 'არ გადაიხადოს, შეინახოს მიმოწერა მტკიცებულებად და უთხრას სანდო უფროსს',
          },
          correct: true,
        },
      ],
      explain: {
        en: 'Paying marks him as someone who pays - the demand returns, bigger. Deleting destroys the evidence police and platforms need. Block, yes; delete, no; and a trusted adult plus a report (112, Take It Down) is how these cases actually end. The crime is the blackmailer’s, never Luka’s.',
        ka: 'გადახდა შანტაჟისტს ანიშნებს, რომ ლუკა „გადამხდელია“ - მოთხოვნა გაზრდილი ბრუნდება. წაშლა ანადგურებს მტკიცებულებას, რომელიც პოლიციასა და პლატფორმას სჭირდება. დაბლოკვა - კი, წაშლა - არა; სანდო უფროსი და განცხადება (112, Take It Down) - ასე მთავრდება ეს საქმეები რეალურად. დანაშაული შანტაჟისტისაა და არასდროს - ლუკასი.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'Instagram shop: the 400-GEL sneakers at 120, "last pair", payment only by transfer to a personal bank account. The page is 3 weeks old. Verdict?',
        ka: 'Instagram-მაღაზია: 400-ლარიანი სპორტული ფეხსაცმელი 120 ლარად, „ბოლო წყვილი“, გადახდა მხოლოდ პირად საბანკო ანგარიშზე გადარიცხვით. გვერდი 3 კვირისაა. ვერდიქტი?',
      },
      options: [
        {
          label: { en: 'Buy - deals like this vanish fast', ka: 'ვიყიდი - ასეთი შეთავაზება სწრაფად ქრება' },
          correct: false,
        },
        {
          label: { en: 'Ask for more photos first, then decide', ka: 'ჯერ მეტ ფოტოს ვთხოვ და მერე გადავწყვეტ' },
          correct: false,
        },
        {
          label: {
            en: 'Walk away - new page, deep discount, personal-account transfer: the full scam pattern',
            ka: 'გვერდს ავუვლი - ახალი გვერდი, უზარმაზარი ფასდაკლება, გადარიცხვა პირად ანგარიშზე: თაღლითობის სრული სქემა',
          },
          correct: true,
        },
      ],
      explain: {
        en: 'A transfer to a personal account carries zero buyer protection - sent means gone. A weeks-old page, a too-good price and "last pair" pressure complete the pattern. Real shops take cards and survive being checked.',
        ka: 'პირად ანგარიშზე გადარიცხვას მყიდველის დაცვა საერთოდ არ ახლავს - გაგზავნილი ფული წასულია. რამდენიმე კვირის გვერდი, ზედმეტად კარგი ფასი და „ბოლო წყვილის“ ზეწოლა სქემას ასრულებს. ნამდვილი მაღაზია ბარათს იღებს და შემოწმებას უძლებს.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'Class chat: someone posts a cruelly edited photo of გიო and the laughing emojis are piling up. Your move in the next minute?',
        ka: 'საკლასო ჩატი: ვიღაცამ გიოს დამახინჯებული ფოტო დადო და გამცინავი ემოჯიები გროვდება. შენი სვლა უახლოეს წუთში?',
      },
      options: [
        {
          label: {
            en: 'One emoji - it means nothing and keeps you in with the group',
            ka: 'ერთი ემოჯი - არაფერს ნიშნავს და ჯგუფიდანაც არ გამომყოფს',
          },
          correct: false,
        },
        {
          label: { en: 'Say nothing; it will die down on its own', ka: 'არაფერს ვიზამ; თავისით ჩაივლის' },
          correct: false,
        },
        {
          label: {
            en: 'No reaction, screenshot, report the photo, message გიო privately',
            ka: 'რეაქცია - არა; სქრინი, ფოტოს დარეპორტება და გიოსთვის პირადში მიწერა',
          },
          correct: true,
        },
      ],
      explain: {
        en: 'Every emoji is fuel - pile-ons run on audience reactions, and to the target your silence reads as agreement. The Guardian move costs two minutes: no fuel, evidence saved, post reported, and one private message telling გიო he is not alone - the thing targets later say mattered most.',
        ka: 'ყოველი ემოჯი საწვავია - ჯგუფური დაცინვა აუდიტორიის რეაქციებზე მუშაობს, სამიზნისთვის კი შენი დუმილი თანხმობად იკითხება. დამცველის სვლა ორი წუთი ღირს: საწვავი - არა, მტკიცებულება - შენახული, პოსტი - დარეპორტებული, და ერთი პირადი შეტყობინება, რომ გიო მარტო არ არის - ის, რასაც სამიზნეები მერე ყველაზე მნიშვნელოვნად ასახელებენ.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'A video hits your feed: a famous footballer "announces" a crypto giveaway - send 100, get 300 back. It already has 40,000 shares. Your read?',
        ka: 'ლენტაში ვიდეო ამოგიხტა: ცნობილი ფეხბურთელი „აცხადებს“ კრიპტოს გაცემას - გაგზავნი 100-ს, დაბრუნდება 300. ვიდეოს უკვე 40 000 გაზიარება აქვს. შენი დასკვნა?',
      },
      options: [
        {
          label: { en: 'That many shares means people checked it', ka: 'ამდენი გაზიარება ნიშნავს, რომ ხალხმა გადაამოწმა' },
          correct: false,
        },
        {
          label: { en: 'Video cannot be faked - it is real', ka: 'ვიდეოს გაყალბება შეუძლებელია - ნამდვილია' },
          correct: false,
        },
        {
          label: {
            en: 'Deepfake giveaway scam - verify on official channels; nobody doubles strangers’ money',
            ka: 'დიპფეიკ-თაღლითობაა - გადაამოწმე ოფიციალურ არხებზე; უცნობების ფულს არავინ აორმაგებს',
          },
          correct: true,
        },
      ],
      explain: {
        en: '"Send crypto, get double back" is the classic deepfake scam - AI video puts any words in any famous mouth, and share counts measure spread, not truth. Anything that moves your money gets verified on the official account or an independent source first.',
        ka: '„გამოგზავნე კრიპტო და გაორმაგებული დაბრუნდება“ დიპფეიკ-თაღლითობის კლასიკაა - ხელოვნურ ინტელექტს ნებისმიერი სიტყვის ჩადება შეუძლია ნებისმიერი ცნობილი ადამიანის პირში, გაზიარებების რიცხვი კი გავრცელებას ზომავს და არა სიმართლეს. ყველაფერი, რაც შენს ფულს ეხება, ჯერ ოფიციალურ ანგარიშზე ან დამოუკიდებელ წყაროზე მოწმდება.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'A "17-year-old" from a game chat compliments you daily, sends gifts, then writes: "You’re more mature than my other friends. Let’s move to Telegram - and don’t tell your parents." The loudest red flag?',
        ka: 'თამაშის ჩატში გაცნობილი „17 წლის“ ბიჭი ყოველდღე გაქებს, საჩუქრებს გიგზავნის, მერე კი გწერს: „სხვებზე მოწიფული ხარ. Telegram-ზე გადავიდეთ - და მშობლებს ნუ ეტყვი“. რომელია ყველაზე ხმამაღალი წითელი დროშა?',
      },
      options: [
        {
          label: { en: 'The daily compliments', ka: 'ყოველდღიური ქება' },
          correct: false,
        },
        {
          label: { en: 'The in-game gifts', ka: 'საჩუქრები თამაშში' },
          correct: false,
        },
        {
          label: {
            en: 'Secrecy plus moving apps - cutting you off from anyone who would notice',
            ka: 'საიდუმლოება და აპის შეცვლა ერთად - გწყვეტს ყველას, ვინც რამეს შეამჩნევდა',
          },
          correct: true,
        },
      ],
      explain: {
        en: 'Compliments and gifts are grooming fuel, but the tell is the pairing: pull you into a private, unmoderated space AND demand silence toward the adults who might spot the pattern. A real friend never needs your secrecy. Screenshot, block, tell an adult.',
        ka: 'ქება და საჩუქრები გრუმინგის საწვავია, მაგრამ მთავარი ნიშანი წყვილია: გაგიყვანოს პრივატულ, უკონტროლო სივრცეში და ამავდროულად დუმილი მოგთხოვოს უფროსების მიმართ, რომლებიც სქემას შეამჩნევდნენ. ნამდვილ მეგობარს შენი საიდუმლოება არასდროს სჭირდება. სქრინი, დაბლოკვა, უფროსისთვის თქმა.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'It is 00:30. Training at 08:00. For the third time you tell yourself "five more minutes" of the feed. What actually gets you to sleep?',
        ka: '00:30-ია. 08:00-ზე ვარჯიში გაქვს. მესამედ ეუბნები საკუთარ თავს „კიდევ ხუთი წუთი“ ლენტაზე. რა ჩაგაძინებს რეალურად?',
      },
      options: [
        {
          label: { en: 'Scroll until sleep comes by itself', ka: 'ვისქროლებ, სანამ ძილი თავისით მოვა' },
          correct: false,
        },
        {
          label: { en: 'One genuinely final video, then discipline', ka: 'ერთი ნამდვილად ბოლო ვიდეო და მერე დისციპლინა' },
          correct: false,
        },
        {
          label: {
            en: 'Phone on the charger across the room, alarm on a clock, lights out',
            ka: 'ტელეფონი დამტენზე ოთახის მეორე მხარეს, მაღვიძარა საათზე, შუქი გამორთული',
          },
          correct: true,
        },
      ],
      explain: {
        en: '"Final video" is a bet you lose every night - the feed is engineered to beat tired-brain discipline, and the bright screen pushes sleepiness later, not closer. Distance is the only move that does not require winning an argument with an algorithm at 00:30.',
        ka: '„ბოლო ვიდეო“ ფსონია, რომელსაც ყოველ ღამე აგებ - ლენტა ისეა აწყობილი, რომ დაღლილი ტვინის დისციპლინას აჯობოს, კაშკაშა ეკრანი კი ძილიანობას აშორებს და არა აახლოებს. მანძილი ერთადერთი სვლაა, რომელიც 00:30-ზე ალგორითმთან კამათის მოგებას არ საჭიროებს.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'You are locked out of your account, and friends say "you" are DMing them links. First move - first, not eventually?',
        ka: 'საკუთარ ანგარიშზე ვეღარ შედიხარ, მეგობრები კი გწერენ, რომ „შენ“ მათ ბმულებს უგზავნი. რა არის პირველი ნაბიჯი - პირველი და არა „ოდესმე“?',
      },
      options: [
        {
          label: {
            en: 'Make a new account and warn everyone from there',
            ka: 'შევქმნი ახალ ანგარიშს და იქიდან გავაფრთხილებ ყველას',
          },
          correct: false,
        },
        {
          label: {
            en: 'Run the platform’s hacked-account recovery and change the linked email’s password',
            ka: 'გავივლი პლატფორმის გატეხილი ანგარიშის აღდგენას და მიბმული ელფოსტის პაროლს შევცვლი',
          },
          correct: true,
        },
        {
          label: {
            en: 'Pay the "account recovery service" that just DMed you',
            ka: 'გადავუხდი „ანგარიშის აღდგენის სერვისს“, რომელმაც ახლახან პირადში მომწერა',
          },
          correct: false,
        },
        {
          label: { en: 'Wait a day - the hacker may move on', ka: 'ერთ დღეს დავიცდი - ჰაკერი იქნებ თავად წავიდეს' },
          correct: false,
        },
      ],
      explain: {
        en: 'Order decides everything: the recovery flow plus a secured email cuts the attacker’s access - warnings and cleanup come after. A new account hands the old one to the hacker mid-crime, any "recovery service" that finds YOU is scam number two, and every waiting hour is spent scamming your friends with your face.',
        ka: 'თანმიმდევრობა ყველაფერს წყვეტს: აღდგენის პროცედურა და დაცული ელფოსტა თავდამსხმელს წვდომას აჭრის - გაფრთხილება და დალაგება ამის მერე მოდის. ახალი ანგარიში ძველს ჰაკერს დანაშაულის შუაგულში უტოვებს, ნებისმიერი „აღდგენის სერვისი“, რომელიც თავად გპოულობს, მეორე თაღლითობაა, ლოდინის ყოველი საათი კი შენი სახელით შენი მეგობრების მოტყუებაში იხარჯება.',
      },
    },
  ],
  takeaways: [
    {
      en: 'A Guardian slows down exactly where attackers speed you up. Urgency, deadlines and "right now" trigger a pause - never a click.',
      ka: 'დამცველი ზუსტად იქ ანელებს, სადაც თავდამსხმელი გაჩქარებს. სისწრაფე, ვადები და „ახლავე“ პაუზას რთავს - და არასდროს დაწკაპუნებას.',
    },
    {
      en: 'A Guardian locks the doors in advance: unique passwords, 2FA, and a recovery route ready before it is ever needed.',
      ka: 'დამცველი კარებს წინასწარ კეტავს: უნიკალური პაროლები, 2FA და აღდგენის გზა, რომელიც საჭიროებამდე აქვს მომზადებული.',
    },
    {
      en: 'A Guardian never pays fear. Blackmail and scams get evidence, a report and a trusted adult - not money, not silence.',
      ka: 'დამცველი შიშს არასდროს უხდის. შანტაჟი და თაღლითობა იღებს მტკიცებულებას, განცხადებას და სანდო უფროსს - არა ფულს და არა დუმილს.',
    },
    {
      en: 'A Guardian verifies before sharing, and stands with the target - not with the crowd.',
      ka: 'დამცველი ჯერ ამოწმებს და მერე აზიარებს, და დგას სამიზნის გვერდით - და არა ბრბოსთან ერთად.',
    },
    {
      en: 'A Guardian runs their own attention. The feed is a tool in your hand - never the other way around.',
      ka: 'დამცველი საკუთარ ყურადღებას თავად განაგებს. ლენტა ინსტრუმენტია შენს ხელში - და არასდროს პირიქით.',
    },
  ],
}
