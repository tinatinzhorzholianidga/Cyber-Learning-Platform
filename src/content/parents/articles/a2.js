// A2 - Phishing & scams that target kids. Free-skins/V-Bucks bait, fake
// giveaways, fake login pages, urgency tricks; Georgian bank-SMS and delivery
// scams; the three rules to teach; recovery steps if a password was stolen.
export default {
  id: 'a2',
  shelf: 'A',
  order: 2,
  emoji: '🎣',
  color: '#ffb020',
  minutes: 5,
  mission: 'g1',
  title: {
    en: 'Phishing & scams that target kids',
    ka: 'ფიშინგი და თაღლითობები, რომლებიც ბავშვებს ემიზნება',
  },
  teaser: {
    en: 'Free V-Bucks, fake giveaways, "your card is blocked" SMS - how scams reach kids, and the three rules that stop them.',
    ka: 'უფასო V-Bucks, ყალბი გათამაშებები, SMS „თქვენი ბარათი დაიბლოკა“ - როგორ წვდება თაღლითობა ბავშვებს და სამი წესი, რომელიც მას აჩერებს.',
  },
  lead: {
    en: 'Scammers go where the victims are - and millions of kids online, with game accounts worth real money and access to a parent’s card, are exactly who they’re looking for. The good news: spotting a scam is a learnable skill, and a child who has practised it once rarely falls twice. This guide shows what the bait looks like and what to teach.',
    ka: 'თაღლითები იქ მიდიან, სადაც მსხვერპლია - და მილიონობით ბავშვი ონლაინ სივრცეში, რეალური ფულის ღირებულების სათამაშო ანგარიშებითა და მშობლის ბარათთან წვდომით, ზუსტად ის არის, ვისაც ისინი ეძებენ. კარგი ამბავი: თაღლითობის ამოცნობა სწავლადი უნარია, და ბავშვი, რომელიც ამას ერთხელ ივარჯიშებს, მეორედ იშვიათად ტყუვდება. ეს გზამკვლევი გაჩვენებთ, როგორ გამოიყურება სატყუარა და რა უნდა ასწავლოთ შვილს.',
  },
  body: [
    { type: 'h2', text: { en: 'The bait: free skins, V-Bucks and giveaways', ka: 'სატყუარა: უფასო სქინები, V-Bucks და გათამაშებები' } },
    {
      type: 'p',
      text: {
        en: 'For an adult, the classic scam message is about a bank. For a kid, it’s about a game. "Free V-Bucks generator", "10,000 Robux - just log in", a giveaway from a famous streamer that needs your account details "to send the prize". Twelve-year-old Luka doesn’t see money being stolen - he sees the skin all his friends already have. That is the whole trick: the bait matches the dream.',
        ka: 'უფროსისთვის კლასიკური სათაღლითო შეტყობინება ბანკს ეხება. ბავშვისთვის - თამაშს. „უფასო V-Bucks გენერატორი“, „10 000 Robux - უბრალოდ შედი ანგარიშით“, ცნობილი სტრიმერის გათამაშება, რომელსაც „პრიზის გამოსაგზავნად“ შენი ანგარიშის მონაცემები სჭირდება. თორმეტი წლის ლუკა ვერ ხედავს, რომ ფულს პარავენ - ის ხედავს სქინს, რომელიც ყველა მის მეგობარს უკვე აქვს. მთელი ხრიკიც ეს არის: სატყუარა ოცნებას ერგება.',
      },
    },
    {
      type: 'p',
      text: {
        en: 'Game accounts are real targets: an account full of rare skins resells for real money, and many have a parent’s card saved for purchases. So a "free gift" that ends with a stolen password can cost a collection built over years - or actual charges on your card.',
        ka: 'სათამაშო ანგარიშები რეალური სამიზნეა: იშვიათი სქინებით სავსე ანგარიში ნამდვილ ფულად იყიდება, ბევრზე კი მშობლის ბარათია მიბმული შესყიდვებისთვის. ასე რომ, „უფასო საჩუქარი“, რომელიც მოპარული პაროლით სრულდება, შეიძლება ბავშვს წლების განმავლობაში შეგროვებული კოლექცია დაუჯდეს - ან თქვენ რეალური თანხები ჩამოგეჭრათ ბარათიდან.',
      },
    },
    { type: 'h2', text: { en: 'Two tools of the trade: fake pages and fake urgency', ka: 'ორი მთავარი იარაღი: ყალბი გვერდები და ხელოვნური სისწრაფე' } },
    {
      type: 'p',
      text: {
        en: 'A fake login page is a pixel-perfect copy of the real one - same logo, same colours. The only honest part is the address bar: epicgames-rewards.xyz is not Epic Games. Once a password is typed there, the account is gone. The second tool is urgency: "only 3 prizes left", "your account will be deleted in 24 hours", a ticking countdown. Urgency exists for one reason - a person in a hurry doesn’t check. Teach your child to treat every countdown as a signal to slow down, not speed up.',
        ka: 'ყალბი შესვლის გვერდი ნამდვილის ზუსტი ასლია - იგივე ლოგო, იგივე ფერები. ერთადერთი პატიოსანი ადგილი მისამართის ველია: epicgames-rewards.xyz არ არის Epic Games. როგორც კი იქ პაროლი აიკრიფება, ანგარიში დაკარგულია. მეორე იარაღი ხელოვნური სისწრაფეა: „დარჩა მხოლოდ 3 პრიზი“, „თქვენი ანგარიში 24 საათში წაიშლება“, მოტიკტიკე უკუთვლა. ხელოვნური სისწრაფე ერთი მიზეზით არსებობს - აჩქარებული ადამიანი არ ამოწმებს. ასწავლეთ შვილს, რომ ნებისმიერი უკუთვლა შენელების სიგნალია და არა აჩქარების.',
      },
    },
    { type: 'h2', text: { en: 'The Georgian versions you’ll both see', ka: 'ქართული ვერსიები, რომლებსაც ორივე ნახავთ' } },
    {
      type: 'p',
      text: {
        en: 'The same tricks arrive in Georgian, aimed at the whole family. The fake bank SMS: „თქვენი ბარათი დაიბლოკა. განსაბლოკად გადადით ბმულზე…“ followed by a link that looks almost, but not quite, like your bank’s address. No Georgian bank asks you to enter card details through an SMS link. Then there is the fake delivery message: "your parcel could not be delivered - pay 1 GEL to reschedule". The one lari is not the goal; the card details typed on that page are. Show these to your child as specimens - kids with their own phones and cards receive them too.',
        ka: 'იგივე ხრიკები ქართულადაც მოდის და მთელ ოჯახს ემიზნება. ყალბი საბანკო SMS: „თქვენი ბარათი დაიბლოკა. განსაბლოკად გადადით ბმულზე…“ - და ბმული, რომელიც თქვენი ბანკის მისამართს ჰგავს, მაგრამ ზუსტად ის არ არის. არც ერთი ქართული ბანკი არ გთხოვთ ბარათის მონაცემების შეყვანას SMS-ის ბმულით. არის ყალბი საკურიერო შეტყობინებაც: „თქვენი ამანათი ვერ ჩაბარდა - ხელახლა გამოსაგზავნად გადაიხადეთ 1 ლარი“. ერთი ლარი მიზანი არ არის; მიზანი ის საბარათე მონაცემებია, რომლებსაც იმ გვერდზე შეიყვანთ. აჩვენეთ ეს მაგალითები შვილს, როგორც ნიმუშები - საკუთარი ტელეფონისა და ბარათის მქონე ბავშვებიც იღებენ ამ შეტყობინებებს.',
      },
    },
    { type: 'h2', text: { en: 'Three rules to teach', ka: 'სამი წესი, რომელიც უნდა ასწავლოთ' } },
    {
      type: 'list',
      items: [
        {
          en: 'Never enter a password on a page you reached through a link. If a message says your account has a problem, open the app or type the site address yourself and check there.',
          ka: 'არასოდეს შეიყვანო პაროლი გვერდზე, რომელზეც ბმულით მოხვდი. თუ შეტყობინება ამბობს, რომ ანგარიშს პრობლემა აქვს, თავად გახსენი აპლიკაცია ან თავად აკრიფე საიტის მისამართი და იქ შეამოწმე.',
        },
        {
          en: 'Check who actually sent it. The display name can say anything; what counts is the real address or username underneath - and a scammer’s address is always slightly off.',
          ka: 'შეამოწმე, სინამდვილეში ვინ გამოგზავნა. გამოსაჩენ სახელად შეიძლება ყველაფერი ეწეროს; მნიშვნელობა მის ქვეშ მდგომ ნამდვილ მისამართს ან მომხმარებლის სახელს აქვს - თაღლითის მისამართი კი ყოველთვის ოდნავ „მრუდეა“.',
        },
        {
          en: 'The too-good-to-be-true rule: free game currency, prizes from giveaways you never entered, and gifts that ask for a login or a "small fee" are the scam. A real giveaway never needs your password.',
          ka: 'წესი „ზედმეტად კარგია, რომ მართალი იყოს“: უფასო სათამაშო ვალუტა, პრიზები გათამაშებიდან, რომელშიც არ მიგიღია მონაწილეობა, და საჩუქრები, რომლებიც პაროლს ან „მცირე გადასახადს“ ითხოვს - სწორედ თაღლითობაა. ნამდვილ გათამაშებას შენი პაროლი არასოდეს სჭირდება.',
        },
      ],
    },
    {
      type: 'callout',
      variant: 'do',
      title: { en: 'Family anti-phishing rules', ka: 'ოჯახური ანტიფიშინგური წესები' },
      items: [
        {
          en: 'Make it a rule for everyone, adults included: before anyone enters a password or card number, they pause for ten seconds and check the address.',
          ka: 'დააწესეთ წესი ყველასთვის, უფროსების ჩათვლით: სანამ ვინმე პაროლს ან ბარათის ნომერს შეიყვანს, ათი წამით ჩერდება და მისამართს ამოწმებს.',
        },
        {
          en: 'Agree that any "you won" or "your account is blocked" message gets shown to another family member before anyone clicks.',
          ka: 'შეთანხმდით, რომ ნებისმიერ შეტყობინებას „მოიგეთ“ ან „ანგარიში დაიბლოკა“ ჯერ ოჯახის სხვა წევრს აჩვენებთ და მხოლოდ ამის შემდეგ აწვებით რამეს.',
        },
        {
          en: 'Turn spotting scams into a family sport: whoever finds one shows it off at dinner. Praise the catches - a child who gets applause for spotting fakes will bring you the real one in time.',
          ka: 'აქციეთ თაღლითობის ამოცნობა ოჯახურ სპორტად: ვინც აღმოაჩენს, ვახშამზე დაიკვეხნის. შეაქეთ ყოველი ამოცნობა - ბავშვი, რომელსაც ყალბის შემჩნევისთვის ტაში ხვდება, ნამდვილსაც დროულად მოგიტანთ.',
        },
      ],
    },
    {
      type: 'callout',
      variant: 'dont',
      title: { en: 'What not to do', ka: 'რას არ უნდა აკეთებდეთ' },
      items: [
        {
          en: 'Don’t scold a child who clicked or paid - shame teaches kids to hide the next mistake, and hiding is what turns small losses into big ones.',
          ka: 'ნუ გაუბრაზდებით ბავშვს, რომელიც ბმულზე გადავიდა ან გადაიხადა - სირცხვილი ასწავლის, რომ შემდეგი შეცდომა დამალოს, დამალვა კი პატარა ზარალს დიდად აქცევს.',
        },
        {
          en: 'Don’t reply to suspicious messages, even to say "stop" - a reply confirms the number is live and invites more.',
          ka: 'ნუ უპასუხებთ საეჭვო შეტყობინებებს, თუნდაც სიტყვით „შეწყვიტეთ“ - პასუხი ადასტურებს, რომ ნომერი აქტიურია, და მეტ შეტყობინებას იზიდავს.',
        },
        {
          en: 'Don’t assume a message is safe because it names your real bank or a real courier company - scammers copy the biggest brands precisely because everyone uses them.',
          ka: 'ნუ ჩათვლით შეტყობინებას უსაფრთხოდ მხოლოდ იმიტომ, რომ მასში თქვენი ნამდვილი ბანკის ან ნამდვილი საკურიერო კომპანიის სახელი წერია - თაღლითები ყველაზე დიდ ბრენდებს სწორედ იმიტომ ბაძავენ, რომ მათ ყველა იყენებს.',
        },
      ],
    },
    { type: 'h2', text: { en: 'If a password was already stolen', ka: 'თუ პაროლი უკვე მოპარულია' } },
    {
      type: 'p',
      text: {
        en: 'It happens even in careful families, and it is fixable. Four calm steps, in order:',
        ka: 'ეს ფრთხილ ოჯახებშიც ხდება და გამოსწორებადია. ოთხი მშვიდი ნაბიჯი, თანმიმდევრობით:',
      },
    },
    {
      type: 'list',
      items: [
        {
          en: 'Change the password on the affected account immediately - and everywhere else the same password was used.',
          ka: 'დაუყოვნებლივ შეცვალეთ პაროლი დაზარალებულ ანგარიშზე - და ყველგან, სადაც იგივე პაროლი გქონდათ.',
        },
        {
          en: 'Turn on two-factor authentication (2FA), so a password alone is no longer enough to get in.',
          ka: 'ჩართეთ ორფაქტორიანი დაცვა (2FA), რომ შესასვლელად მხოლოდ პაროლი აღარ კმაროდეს.',
        },
        {
          en: 'Warn the contacts: scammers often write to friends from a stolen account. One short "my account was hacked - ignore anything from it" protects the next person.',
          ka: 'გააფრთხილეთ კონტაქტები: თაღლითები ხშირად მოპარული ანგარიშიდან მეგობრებს სწერენ. ერთი მოკლე „ანგარიში გამიტეხეს - მისგან მოსულს ნუ ენდობით“ შემდეგ ადამიანს იცავს.',
        },
        {
          en: 'Report it to the platform’s support - account-recovery teams deal with this every day, and stolen accounts often come back.',
          ka: 'შეატყობინეთ პლატფორმის მხარდაჭერის სამსახურს - ანგარიშების აღდგენის გუნდები ამას ყოველდღე აგვარებენ, და მოპარული ანგარიშები ხშირად ბრუნდება.',
        },
      ],
    },
    {
      type: 'p',
      text: {
        en: 'And when the crisis is over, resist the lecture. One question - "what would you check first next time?" - turns a bad day into a skill. Your child can also practise somewhere safe: the Phishing Hunter mission on CyberHero is an inbox full of real-looking messages where mistakes cost nothing.',
        ka: 'და როცა კრიზისი დასრულდება, ლექციისგან თავი შეიკავეთ. ერთი კითხვა - „მომავალში პირველად რას შეამოწმებდი?“ - ცუდ დღეს უნარად აქცევს. თქვენს შვილს ვარჯიში უსაფრთხო ადგილასაც შეუძლია: CyberHero-ს მისია „ფიშინგზე მონადირე“ ნამდვილის მსგავსი შეტყობინებებით სავსე საფოსტო ყუთია, სადაც შეცდომა არაფერი ღირს.',
      },
    },
    {
      type: 'callout',
      variant: 'note',
      title: { en: 'In Georgia', ka: 'საქართველოში' },
      items: [
        {
          en: 'The fake bank SMS arrives in Georgian - „თქვენი ბარათი დაიბლოკა, გაიარეთ ვერიფიკაცია…“ with a lookalike link. No Georgian bank asks for card details through an SMS link.',
          ka: 'ყალბი საბანკო SMS ქართულად მოდის - „თქვენი ბარათი დაიბლოკა, გაიარეთ ვერიფიკაცია…“ - თან ახლავს ბანკის მისამართის მსგავსი ბმული. არც ერთი ქართული ბანკი არ ითხოვს ბარათის მონაცემებს SMS-ის ბმულით.',
        },
        {
          en: 'Marketplace prepayment scams are common on olx.ge, mymarket.ge, and Facebook Marketplace: a "buyer" or "seller" pushes for prepayment or card details. Teens selling an old phone or sneakers meet these too.',
          ka: 'წინასწარი გადახდის თაღლითობები გავრცელებულია olx.ge-ზე, mymarket.ge-სა და Facebook Marketplace-ზე: „მყიდველი“ ან „გამყიდველი“ დაჟინებით ითხოვს წინასწარ გადახდას ან ბარათის მონაცემებს. ამას ძველი ტელეფონისა თუ სპორტული ფეხსაცმლის გამყიდველი მოზარდებიც აწყდებიან.',
        },
        {
          en: '"Money doubling" messages come from hacked friends’ accounts - the offer arrives from a real friend’s profile, which is exactly why it works. Call the friend and verify before believing anything.',
          ka: '„ფულის გაორმაგების“ შეტყობინებები გატეხილი მეგობრების ანგარიშებიდან მოდის - შეთავაზება ნამდვილი მეგობრის პროფილიდან ჩანს, და სწორედ ამიტომ მუშაობს. სანამ დაიჯერებთ, დაურეკეთ მეგობარს და გადაამოწმეთ.',
        },
        {
          en: 'Fake job ads that charge a "registration fee" target teens looking for a first job - a real employer never charges you to hire you.',
          ka: 'ყალბი ვაკანსიები „სარეგისტრაციო გადასახადით“ პირველი სამსახურის მაძიებელ მოზარდებს ემიზნება - ნამდვილი დამსაქმებელი დასაქმებისთვის ფულს არასოდეს გთხოვთ.',
        },
        {
          en: 'To report online fraud, call 112 or contact the MIA cyber-crime division via police.ge.',
          ka: 'ონლაინ თაღლითობის შესატყობინებლად დარეკეთ 112-ზე ან მიმართეთ შსს კიბერდანაშაულის სამმართველოს police.ge-ის მეშვეობით.',
        },
      ],
    },
  ],
  sources: [
    'Childnet - common online safety questions from parents: childnet.com/blog/common-online-safety-questions-from-parents',
    'UK Safer Internet Centre - parents’ FAQ: saferinternet.org.uk/blog/answering-parents-commonly-asked-online-safety-questions',
    'Common Sense Media - Digital Citizenship Curriculum: commonsense.org/education/digital-citizenship',
  ],
}
