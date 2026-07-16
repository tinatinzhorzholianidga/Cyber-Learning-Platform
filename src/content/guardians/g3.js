// G3 - Fort Knox. Passwords, password manager, 2FA and account recovery
// with a crack-time-visualizer feel (spec section 3). Length beats
// complexity; email is the master key; recovery in the first hours.
export default {
  brief: {
    en: 'Right now, somewhere, a machine is guessing passwords - billions per second, no breaks, no lunch. Today it gets your accounts to chew on. First you watch how long each door holds. Then you build a fortress the machine gives up on.',
    ka: 'ახლა, სადღაც, მანქანა პაროლებს არჩევს - მილიარდობით ვარიანტს წამში, შესვენებისა და სადილის გარეშე. დღეს მას შენი ანგარიშები შეხვდება. ჯერ ნახავ, რამდენ ხანს უძლებს თითოეული კარი. მერე ააგებ ციხესიმაგრეს, რომელზეც მანქანა ხელს ჩაიქნევს.',
  },
  rounds: [
    {
      type: 'choice',
      card: {
        from: { en: 'Cracking rig · 10 billion guesses per second', ka: 'გამტეხი მანქანა · 10 მილიარდი ვარიანტი წამში' },
        body: {
          en: '1) giorgi2009    2) G!0rg1    3) qwerty123    4) Tiger-Moon-River-42',
          ka: '1) giorgi2009    2) G!0rg1    3) qwerty123    4) მთვარე-ვეფხვი-მდინარე-42',
        },
      },
      q: {
        en: 'Four passwords go into the grinder. Which one is still standing a hundred years later?',
        ka: 'ოთხი პაროლი ხვდება წისქვილში. რომელი დგას კიდევ ასი წლის შემდეგაც?',
      },
      options: [
        {
          label: { en: 'giorgi2009 - a name plus a year, that is personal', ka: 'giorgi2009 - სახელი და წელი, ეს ხომ პირადულია' },
          correct: false,
        },
        {
          label: { en: 'G!0rg1 - it has symbols AND numbers', ka: 'G!0rg1 - სიმბოლოებიც აქვს და ციფრებიც' },
          correct: false,
        },
        {
          label: { en: 'qwerty123 - a classic never dies', ka: 'qwerty123 - კლასიკა არ კვდება' },
          correct: false,
        },
        {
          label: { en: 'Tiger-Moon-River-42 - four random words', ka: 'მთვარე-ვეფხვი-მდინარე-42 - ოთხი შემთხვევითი სიტყვა' },
          correct: true,
        },
      ],
      explain: {
        en: 'qwerty123 falls instantly - it is on every leaked-password list. giorgi2009 lasts seconds: name + birth year is the first pattern any rig tries. G!0rg1 holds a few hours - symbols do not rescue a six-character password. The passphrase stands for centuries, because every added character multiplies the guesses needed. Length beats cleverness: four random words are easy for you and mathematically brutal for the machine.',
        ka: 'qwerty123 მყისიერად ეცემა - ის გაჟონილი პაროლების ყველა სიაშია. giorgi2009 წამებს ძლებს: სახელი + დაბადების წელი პირველი შაბლონია, რომელსაც ნებისმიერი მანქანა ცდის. G!0rg1 რამდენიმე საათს უძლებს - სიმბოლოები ექვსნიშნა პაროლს ვერ გადაარჩენს. ფრაზა-პაროლი კი საუკუნეებს დგას, რადგან ყოველი დამატებული ასო საჭირო ვარიანტების რაოდენობას ამრავლებს. სიგრძე ეშმაკობას ჯობია: ოთხი შემთხვევითი სიტყვა შენთვის ადვილია, მანქანისთვის კი - მათემატიკურად აუტანელი.',
      },
    },
    {
      type: 'choice',
      card: {
        from: { en: 'News feed', ka: 'სიახლეების ლენტა' },
        body: {
          en: 'GameForge forum hacked: 3 million email + password pairs leaked and posted online.',
          ka: 'გატეხეს GameForge ფორუმი: 3 მილიონი ელფოსტისა და პაროლის წყვილი გაჟონა და ინტერნეტში გამოქვეყნდა.',
        },
      },
      q: {
        en: 'You registered there in 2023 - with the same password you use for your email and Instagram. Realistically, what happens next?',
        ka: 'შენ იქ 2023 წელს დარეგისტრირდი - იმავე პაროლით, რომელსაც ელფოსტასა და Instagram-ზე იყენებ. რეალურად რა ხდება შემდეგ?',
      },
      options: [
        {
          label: {
            en: 'Nothing - who needs some old forum account',
            ka: 'არაფერი - ვის რაში სჭირდება ვიღაცის ძველი ფორუმის ანგარიში',
          },
          correct: false,
        },
        {
          label: {
            en: 'Within hours, bots try that email + password pair on your email, Instagram, TikTok - everywhere',
            ka: 'რამდენიმე საათში ბოტები ამ ელფოსტისა და პაროლის წყვილს შენს ელფოსტაზე, Instagram-სა და TikTok-ზე - ყველგან ცდიან',
          },
          correct: true,
        },
        {
          label: {
            en: 'Hackers only go after adults with bank cards',
            ka: 'ჰაკერები მხოლოდ საბანკო ბარათიან უფროსებზე ნადირობენ',
          },
          correct: false,
        },
      ],
      explain: {
        en: 'The technique is called credential stuffing, and it is fully automated: leaked pairs get fed to bots that try them on every major service within hours - no human even looks at your name. One reused password turns one boring forum leak into every account you own. And your email is the master key: whoever controls it can press "reset password" everywhere else. A unique password per account means a leak stays just a leak.',
        ka: 'ამ ტექნიკას credential stuffing ჰქვია და ის სრულად ავტომატიზებულია: გაჟონილი წყვილები ბოტებს გადაეცემა, რომლებიც მათ რამდენიმე საათში ყველა დიდ სერვისზე ცდიან - შენს სახელს ადამიანი არც უყურებს. ერთი გამეორებული პაროლი ერთ მოსაწყენ ფორუმის გაჟონვას შენს ყველა ანგარიშად აქცევს. ელფოსტა კი მთავარი გასაღებია: ვინც მას აკონტროლებს, ყველგან დააჭერს „პაროლის აღდგენას“. უნიკალური პაროლი თითო ანგარიშზე ნიშნავს, რომ გაჟონვა მხოლოდ გაჟონვად რჩება.',
      },
    },
    {
      type: 'builder',
      prompt: {
        en: 'Build your fortress. Toggle the defenses that actually hold - the meter shows how much the cracking rig hates you.',
        ka: 'ააგე შენი ციხესიმაგრე. ჩართე დაცვები, რომლებიც ნამდვილად უძლებს - მრიცხველი აჩვენებს, რამდენად ეზიზღები გამტეხ მანქანას.',
      },
      target: 70,
      meterLow: { en: 'Open gate', ka: 'ღია ჭიშკარი' },
      meterHigh: { en: 'Fort Knox', ka: 'ფორტ ნოქსი' },
      options: [
        {
          label: { en: '2FA on your email', ka: '2FA შენს ელფოსტაზე' },
          note: { en: 'the master key gets a second lock', ka: 'მთავარ გასაღებს მეორე საკეტი ემატება' },
          value: 25,
        },
        {
          label: { en: 'A unique passphrase for every account', ka: 'უნიკალური ფრაზა-პაროლი თითოეულ ანგარიშზე' },
          value: 20,
        },
        {
          label: { en: '2FA on your social accounts', ka: '2FA სოციალურ ანგარიშებზე' },
          value: 15,
        },
        {
          label: { en: 'A password manager remembers them all', ka: 'პაროლების მენეჯერი ყველა მათგანს იმახსოვრებს' },
          value: 15,
        },
        {
          label: { en: 'Recovery email and phone set up', ka: 'აღდგენის ელფოსტა და ტელეფონი მითითებულია' },
          value: 10,
        },
        {
          label: {
            en: 'Your birthday in the password - easy to remember',
            ka: 'დაბადების თარიღი პაროლში - ადვილი დასამახსოვრებელია',
          },
          value: -15,
        },
        {
          label: {
            en: 'Share the password with your best friend',
            ka: 'პაროლი საუკეთესო მეგობარს გაუზიარე',
          },
          value: -10,
        },
        {
          label: {
            en: 'Keep all passwords in a screenshot in your notes app',
            ka: 'ყველა პაროლი ჩანაწერების აპში, ერთ სქრინშოტად შეინახე',
          },
          value: -10,
        },
      ],
      explain: {
        en: 'That is a fortress: long unique passphrases, a manager that remembers them so you do not have to, 2FA on email first because email guards everything else, and a recovery route for the day your phone dies. The rig can grind for centuries and still slam into a second lock it cannot guess.',
        ka: 'ეს ციხესიმაგრეა: გრძელი უნიკალური ფრაზა-პაროლები, მენეჯერი, რომელიც მათ შენ მაგივრად იმახსოვრებს, 2FA პირველ რიგში ელფოსტაზე - რადგან ელფოსტა ყველაფერს იცავს - და აღდგენის გზა იმ დღისთვის, როცა ტელეფონი გაფუჭდება. მანქანამ საუკუნეები რომ იფქვას, მაინც მეორე საკეტს დაეჯახება, რომლის გამოცნობაც არ შეუძლია.',
      },
      explainNegative: {
        en: 'Solid walls - with a weakness bricked in. Your birthday is the first guess, and it sits publicly on your own profile. A shared password is a password you no longer control: friendships change, screenshots travel. And a notes-app screenshot is plain text for anyone who touches your phone - plus it syncs to the cloud.',
        ka: 'მყარი კედლებია - მაგრამ სისუსტე ჩააშენე. დაბადების თარიღი პირველი ვარაუდია და ის შენსავე პროფილზე საჯაროდ დევს. გაზიარებული პაროლი პაროლია, რომელსაც შენ ვეღარ აკონტროლებ: მეგობრობა იცვლება, სქრინშოტები კი მოგზაურობს. ჩანაწერების აპის სქრინშოტი კი ღია ტექსტია ყველასთვის, ვინც შენს ტელეფონს შეეხება - თან ღრუბელშიც სინქრონდება.',
      },
    },
    {
      type: 'flags',
      prompt: {
        en: 'Five claims overheard in the school corridor. Flag every myth.',
        ka: 'ხუთი ფრაზა, სკოლის დერეფანში გაგონილი. მონიშნე ყველა მითი.',
      },
      items: [
        {
          text: {
            en: '"2FA is for adults with bank accounts - nobody wants a 15-year-old’s account."',
            ka: '„2FA საბანკო ანგარიშიანი უფროსებისთვისაა - 15 წლის მოზარდის ანგარიში არავის სჭირდება.“',
          },
          flag: true,
          explain: {
            en: 'Teen accounts are hijacked every day - to scam the followers who trust them, to sell the username, or for blackmail. Attack bots do not check your age.',
            ka: 'მოზარდების ანგარიშებს ყოველდღე იტაცებენ - გამომწერების მოსატყუებლად, მომხმარებლის სახელის გასაყიდად ან შანტაჟისთვის. თავდამსხმელი ბოტები ასაკს არ ამოწმებენ.',
          },
        },
        {
          text: {
            en: '"An authenticator app is stronger than SMS codes."',
            ka: '„ავთენტიფიკატორი აპი SMS კოდებზე ძლიერია.“',
          },
          flag: false,
          explain: {
            en: 'True. SMS can be intercepted or stolen with a SIM swap; an app code is generated on your device and never travels.',
            ka: 'მართალია. SMS შეიძლება ჩაიჭრას ან SIM ბარათის გადატანით მოიპარონ; აპის კოდი კი შენს მოწყობილობაზე იქმნება და არსად მიდის.',
          },
        },
        {
          text: {
            en: '"Incognito mode keeps me safe from hackers."',
            ka: '„ინკოგნიტო რეჟიმი ჰაკერებისგან მიცავს.“',
          },
          flag: true,
          explain: {
            en: 'Incognito only hides your history from your own browser on your own device. Against phishing, leaks and weak passwords it does exactly nothing.',
            ka: 'ინკოგნიტო მხოლოდ შენს ისტორიას მალავს შენივე ბრაუზერში, შენსავე მოწყობილობაზე. ფიშინგის, გაჟონვებისა და სუსტი პაროლების წინააღმდეგ ის ზუსტად არაფერს აკეთებს.',
          },
        },
        {
          text: {
            en: '"If support asks for the code from your SMS, you should tell them - they are support."',
            ka: '„თუ მხარდაჭერა SMS-ით მოსულ კოდს გთხოვს, უნდა უთხრა - მხარდაჭერაა.“',
          },
          flag: true,
          explain: {
            en: 'That code IS the second lock on your account. Real support never asks for it. The only person who will ever ask is the attacker already standing at your door.',
            ka: 'ეს კოდი სწორედ შენი ანგარიშის მეორე საკეტია. ნამდვილი მხარდაჭერა მას არასდროს გთხოვს. ერთადერთი, ვინც ოდესმე მოგთხოვს, თავდამსხმელია, რომელიც უკვე შენს კართან დგას.',
          },
        },
        {
          text: {
            en: '"A password manager remembers everything so I do not have to."',
            ka: '„პაროლების მენეჯერი ყველაფერს იმახსოვრებს, რომ მე აღარ დამჭირდეს.“',
          },
          flag: false,
          explain: {
            en: 'True - that is its whole job. You remember one strong master phrase; it generates and stores a unique one for everything else.',
            ka: 'მართალია - მისი საქმეც ეს არის. შენ ერთ ძლიერ მთავარ ფრაზას იმახსოვრებ; ის კი ყველა დანარჩენისთვის უნიკალურს ქმნის და ინახავს.',
          },
        },
      ],
      explain: {
        en: 'Three myths down. Attackers do not care how old you are; incognito hides your history from your own browser, not you from anyone; and no legitimate human will ever ask for your 2FA code. The two true statements are your toolkit.',
        ka: 'სამი მითი დაემხო. თავდამსხმელებს შენი ასაკი არ აინტერესებთ; ინკოგნიტო შენს ისტორიას მალავს შენივე ბრაუზერისგან და არა შენ - ვინმესგან; და ვერცერთი ნამდვილი თანამშრომელი ვერასდროს მოგთხოვს 2FA კოდს. ორი მართალი მტკიცება კი შენი ხელსაწყოებია.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'It happened anyway: you cannot log in to Instagram, and friends say "your" account is DMing them a crypto link. First move?',
        ka: 'მაინც მოხდა: Instagram-ზე ვეღარ შედიხარ, მეგობრები კი ამბობენ, რომ „შენი“ ანგარიში მათ კრიპტოს ბმულს უგზავნის. პირველი სვლა?',
      },
      options: [
        {
          label: {
            en: 'Make a new account and forget the old one',
            ka: 'შექმნი ახალ ანგარიშს და ძველს დაივიწყებ',
          },
          correct: false,
        },
        {
          label: {
            en: 'Open the account recovery page, change your EMAIL password first, then turn on 2FA',
            ka: 'გახსნი ანგარიშის აღდგენის გვერდს, ჯერ ელფოსტის პაროლს შეცვლი, მერე 2FA-ს ჩართავ',
          },
          correct: true,
        },
        {
          label: {
            en: 'DM the hacker from a friend’s phone - maybe you can make a deal',
            ka: 'მეგობრის ტელეფონიდან მისწერ ჰაკერს - იქნებ მოურიგდე',
          },
          correct: false,
        },
      ],
      explain: {
        en: 'Recovery pages ("Forgot password", "My account was hacked") exist exactly for this and work best in the first hours. Email comes first: if the attacker holds your inbox, they can undo every reset you make. Then 2FA, then a warning to friends that the DMs are not you. Abandoning the account leaves a scammer wearing your name in front of people who trust it - and negotiating only confirms the account is worth something to you.',
        ka: 'აღდგენის გვერდები („პაროლი დამავიწყდა“, „ანგარიში გამიტეხეს“) ზუსტად ამისთვის არსებობს და საუკეთესოდ პირველ საათებში მუშაობს. ელფოსტა პირველია: თუ თავდამსხმელს შენი საფოსტო ყუთი უჭირავს, ის შენს ყველა ცვლილებას უკან დააბრუნებს. მერე 2FA, მერე მეგობრების გაფრთხილება, რომ ის შეტყობინებები შენ არ ხარ. ანგარიშის მიტოვება თაღლითს შენი სახელით ტოვებს იმ ხალხის წინაშე, ვისაც ეს სახელი სჯერა - მოლაპარაკება კი მხოლოდ იმას უდასტურებს, რომ ანგარიში შენთვის რაღაც ღირს.',
      },
    },
  ],
  takeaways: [
    {
      en: 'Length beats complexity. A four-random-word passphrase holds for centuries; a short "clever" password holds for hours.',
      ka: 'სიგრძე სირთულეს ჯობია. ოთხი შემთხვევითი სიტყვის ფრაზა-პაროლი საუკუნეებს უძლებს; მოკლე „ეშმაკური“ პაროლი - საათებს.',
    },
    {
      en: 'One reused password means one leak opens everything. Unique passphrase per account - a manager does the remembering.',
      ka: 'ერთი გამეორებული პაროლი ნიშნავს, რომ ერთი გაჟონვა ყველაფერს აღებს. უნიკალური ფრაზა-პაროლი თითო ანგარიშზე - დამახსოვრებას მენეჯერი ითავებს.',
    },
    {
      en: 'Email is the master key. 2FA goes there first - every other password resets through it.',
      ka: 'ელფოსტა მთავარი გასაღებია. 2FA პირველ რიგში იქ ჩართე - ყველა სხვა პაროლი მისით აღდგება.',
    },
    {
      en: 'Nobody legitimate ever asks for your password or your 2FA code. Nobody. That request is the attack itself.',
      ka: 'ვერცერთი ნამდვილი სერვისი ვერასდროს მოგთხოვს პაროლს ან 2FA კოდს. ვერცერთი. ეს თხოვნა თავად თავდასხმაა.',
    },
    {
      en: 'Hacked anyway? Recovery page, email password first, 2FA on, warn your friends - in that order, in the first hours.',
      ka: 'მაინც გაგტეხეს? აღდგენის გვერდი, ჯერ ელფოსტის პაროლი, შემდეგ 2FA, მერე მეგობრების გაფრთხილება - ამ თანმიმდევრობით, პირველივე საათებში.',
    },
  ],
}
