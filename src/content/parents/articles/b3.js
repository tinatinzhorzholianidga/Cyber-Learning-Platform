// B3 — Home setup in 30 minutes. A do-it-now checklist: privacy settings,
// 2FA, purchase approvals, open parental controls, router basics, sleep,
// and family password rules. Done WITH the child, not to the child.
export default {
  id: 'b3',
  shelf: 'B',
  order: 3,
  emoji: '🏠',
  color: '#3ecf8e',
  minutes: 7,
  mission: 'g3',
  title: {
    en: 'Home setup in 30 minutes',
    ka: 'სახლის მოწყობა 30 წუთში',
  },
  teaser: {
    en: 'Seven concrete steps — private profiles, 2FA, purchase approvals, router basics, and a charging spot outside the bedrooms — all done in one evening.',
    ka: 'შვიდი კონკრეტული ნაბიჯი — დახურული პროფილები, 2FA, შესყიდვების დადასტურება, როუტერის საფუძვლები და დასატენი ადგილი საძინებლების გარეთ — ყველაფერი ერთ საღამოში.',
  },
  lead: {
    en: 'You do not need to be a tech expert to make your home noticeably safer online. The checklist below takes about thirty minutes in total, uses tools you already own, and covers the settings that stop the most common problems before they start. One rule while you work: do each step with your child, not to your child. Every setting you change together is also a small lesson they keep.',
    ka: 'იმისთვის, რომ თქვენი სახლი ონლაინ სივრცეში შესამჩნევად უსაფრთხო გახდეს, ტექნიკის ექსპერტობა არ გჭირდებათ. ქვემოთ მოცემულ ჩამონათვალს ჯამში დაახლოებით ოცდაათი წუთი სჭირდება, იყენებს იმას, რაც უკვე გაქვთ, და ფარავს პარამეტრებს, რომლებიც ყველაზე გავრცელებულ პრობლემებს თავიდანვე აჩერებს. ერთი წესი მუშაობისას: ყოველი ნაბიჯი შვილთან ერთად გადადგით და არა მის ნაცვლად. ყოველი პარამეტრი, რომელსაც ერთად ცვლით, პატარა გაკვეთილიცაა, რომელიც მას რჩება.',
  },
  body: [
    {
      type: 'callout',
      variant: 'emergency',
      title: { en: 'The 30-minute checklist', ka: '30-წუთიანი ჩამონათვალი' },
      ordered: true,
      items: [
        {
          en: 'Set every family member’s social profiles to private — yours included — and review who is allowed to send message requests.',
          ka: 'გადაიყვანეთ ოჯახის ყველა წევრის სოციალური პროფილი — თქვენი ჩათვლით — დახურულ რეჟიმში და გადახედეთ, ვის შეუძლია შეტყობინების მოთხოვნის გამოგზავნა.',
        },
        {
          en: 'Turn on two-factor authentication (2FA): email accounts first, then social media and games.',
          ka: 'ჩართეთ ორფაქტორიანი ავთენტიფიკაცია (2FA): ჯერ ელფოსტაზე, შემდეგ სოციალურ ქსელებსა და თამაშებზე.',
        },
        {
          en: 'Set the app stores so every purchase needs a parent’s approval.',
          ka: 'დააყენეთ აპლიკაციების მაღაზიები ისე, რომ ყოველი შესყიდვა მშობლის დადასტურებას საჭიროებდეს.',
        },
        {
          en: 'Turn on the built-in parental controls — Family Link on Android, Screen Time on iPhone — and agree the settings together with your child, openly.',
          ka: 'ჩართეთ ჩაშენებული მშობლის კონტროლი — Family Link Android-ზე, Screen Time iPhone-ზე — და პარამეტრებზე შვილთან ერთად, ღიად შეთანხმდით.',
        },
        {
          en: 'Router basics: change the default admin password and switch on automatic updates.',
          ka: 'როუტერის საფუძვლები: შეცვალეთ ქარხნული ადმინისტრატორის პაროლი და ჩართეთ ავტომატური განახლებები.',
        },
        {
          en: 'Agree the device-free bedroom rule and set up one family charging spot outside the bedrooms.',
          ka: 'შეთანხმდით წესზე „საძინებელი ეკრანების გარეშე“ და მოაწყვეთ ერთი საოჯახო დასატენი ადგილი საძინებლების გარეთ.',
        },
        {
          en: 'Agree the family password rules: long passphrases, the email password is never reused anywhere, and codes are never shared with anyone — including best friends.',
          ka: 'შეთანხმდით ოჯახის პაროლების წესებზე: გრძელი საიდუმლო ფრაზები, ელფოსტის პაროლი არსად მეორდება, კოდები კი არავის ეთქმის — საუკეთესო მეგობრებსაც კი არა.',
        },
      ],
    },
    { type: 'h2', text: { en: 'Why private profiles come first', ka: 'რატომ იწყება ყველაფერი დახურული პროფილით' } },
    {
      type: 'p',
      text: {
        en: 'A public profile is a shop window for strangers: it can show a child’s face, school uniform, neighborhood, and daily routine to anyone who cares to look. Private mode limits the audience to approved friends, and reviewing the message settings stops most stranger contact — the opening move of nearly every scam and grooming attempt — before it starts. Do this for the adults’ accounts too: your public post about Luka’s football match reveals as much as his own would.',
        ka: 'ღია პროფილი უცნობებისთვის ვიტრინაა: მას შეუძლია ნებისმიერ დაინტერესებულ ადამიანს აჩვენოს ბავშვის სახე, სკოლის ფორმა, უბანი და ყოველდღიური განრიგი. დახურული რეჟიმი აუდიტორიას დადასტურებული მეგობრებით ზღუდავს, შეტყობინებების პარამეტრების გადახედვა კი უცნობებთან კონტაქტს — თითქმის ყველა თაღლითობისა და გრუმინგის პირველ ნაბიჯს — თავიდანვე აჩერებს. იგივე გააკეთეთ უფროსების ანგარიშებზეც: თქვენი ღია პოსტი ლუკას საფეხბურთო მატჩის შესახებ იმდენივეს ამხელს, რამდენსაც მისივე პოსტი გაამხელდა.',
      },
    },
    { type: 'h2', text: { en: 'Why email gets 2FA before anything else', ka: 'რატომ სჭირდება 2FA პირველ რიგში ელფოსტას' } },
    {
      type: 'p',
      text: {
        en: 'Email is the master key. Whoever controls the inbox can reset the password of every other account — Instagram, TikTok, games, everything. Two-factor authentication means a stolen password alone is no longer enough to get in, which blocks the most common account-theft attacks outright. Secure the email accounts first, then work outward to social media and games. Your teen can practice the same skills — strong passwords, 2FA, account recovery — in the Fort Knox mission on this site, so the setup evening can end with them teaching you.',
        ka: 'ელფოსტა მთავარი გასაღებია. ვინც საფოსტო ყუთს აკონტროლებს, მას ყველა სხვა ანგარიშის — Instagram-ის, TikTok-ის, თამაშების — პაროლის აღდგენა შეუძლია. ორფაქტორიანი ავთენტიფიკაცია ნიშნავს, რომ მხოლოდ მოპარული პაროლი შესასვლელად საკმარისი აღარ არის, რაც ანგარიშის მოპარვის ყველაზე გავრცელებულ ხერხებს პირდაპირ ბლოკავს. ჯერ ელფოსტა დაიცავით, შემდეგ სოციალური ქსელები და თამაშები. თქვენს შვილს იმავე უნარების — ძლიერი პაროლების, 2FA-ისა და ანგარიშის აღდგენის — გავარჯიშება ამ საიტზე, Fort Knox მისიაში შეუძლია, ასე რომ, საღამო შეიძლება იმით დასრულდეს, რომ ის თქვენ გასწავლით.',
      },
    },
    { type: 'h2', text: { en: 'Purchase approvals are a money lesson, not a leash', ka: 'შესყიდვების დადასტურება ფულის გაკვეთილია და არა აღვირი' } },
    {
      type: 'p',
      text: {
        en: 'Requiring approval for purchases is not about distrust. It protects the family card from accidental taps, from in-game pressure sales aimed squarely at children, and from scams that promise free game currency but first ask for “a small payment”. Just as important, every approval request becomes a thirty-second money conversation: what is this, what does it cost, is it worth it? That habit outlasts the setting itself.',
        ka: 'შესყიდვებზე დადასტურების მოთხოვნა უნდობლობა არ არის. ის იცავს საოჯახო ბარათს შემთხვევითი დაჭერებისგან, თამაშებში სწორედ ბავშვებზე გათვლილი დამაძალებელი შეთავაზებებისგან და თაღლითობებისგან, რომლებიც უფასო სათამაშო ვალუტას გპირდებიან, მაგრამ ჯერ „მცირე გადასახადს“ ითხოვენ. არანაკლებ მნიშვნელოვანია, რომ ყოველი დადასტურების მოთხოვნა ოცდაათწამიან საუბრად იქცევა ფულზე: რა არის ეს, რა ღირს, ღირს კი საერთოდ? ეს ჩვევა თავად პარამეტრზე დიდხანს ცოცხლობს.',
      },
    },
    { type: 'h2', text: { en: 'Parental controls work only in the open', ka: 'მშობლის კონტროლი მხოლოდ ღიად მუშაობს' } },
    {
      type: 'p',
      text: {
        en: 'Family Link and Screen Time can set app limits, bedtimes, and content filters — useful scaffolding, especially for younger children. But how you introduce them decides everything. Controls discovered by accident read as spying and poison trust; controls agreed together read as family rules. Sit down, show your child what the tool does, decide the limits together, and promise out loud that they will loosen as your child shows good judgment. The settings are temporary; the fairness is what they will remember.',
        ka: 'Family Link-სა და Screen Time-ს შეუძლია აპლიკაციების ლიმიტების, ძილის დროისა და კონტენტის ფილტრების დაყენება — სასარგებლო ხარაჩო, განსაკუთრებით უმცროსი ასაკის ბავშვებისთვის. მაგრამ ყველაფერს ის წყვეტს, როგორ შემოიტანთ მათ. შემთხვევით აღმოჩენილი კონტროლი თვალთვალად აღიქმება და ნდობას წამლავს; ერთად შეთანხმებული კი — ოჯახის წესებად. დასხედით, აჩვენეთ შვილს, რას აკეთებს ინსტრუმენტი, ლიმიტები ერთად გადაწყვიტეთ და ხმამაღლა დაჰპირდით, რომ ისინი შერბილდება, როცა ის გონივრულ ქცევას აჩვენებს. პარამეტრები დროებითია; სამართლიანობა კი ის არის, რაც მას დაამახსოვრდება.',
      },
    },
    { type: 'h2', text: { en: 'The router is the front door', ka: 'როუტერი სახლის შესასვლელი კარია' } },
    {
      type: 'p',
      text: {
        en: 'Every device in your home reaches the internet through the router, and most routers still run with the factory admin password printed on the sticker underneath — a password anyone can look up online. Changing it takes five minutes in the router’s app or admin page, and switching on automatic updates means security holes get patched without you ever thinking about it again. That is the whole job: two settings, once.',
        ka: 'თქვენი სახლის ყველა მოწყობილობა ინტერნეტს როუტერის გავლით უკავშირდება, როუტერების უმეტესობა კი დღემდე ქარხნული ადმინისტრატორის პაროლით მუშაობს — ის ქვედა მხარეს, სტიკერზე აწერია და ნებისმიერს შეუძლია ინტერნეტში მოძებნოს. მისი შეცვლა ხუთ წუთს მოითხოვს როუტერის აპლიკაციაში ან სამართავ გვერდზე, ავტომატური განახლებების ჩართვა კი ნიშნავს, რომ უსაფრთხოების ხვრელები თქვენი ჩარევის გარეშე იკეტება. სულ ეს არის: ორი პარამეტრი, ერთხელ.',
      },
    },
    { type: 'h2', text: { en: 'Bedrooms, sleep, and the charging spot', ka: 'საძინებელი, ძილი და დასატენი ადგილი' } },
    {
      type: 'p',
      text: {
        en: 'Sleep is the first thing psychologists tell parents to protect: in Pew Research’s 2025 survey, 45% of teens said social media hurts their sleep. A concrete rule beats a vague one, and “devices charge in the hallway overnight” is as concrete as it gets — no willpower needed at midnight, no negotiation at the bedroom door. The rule sticks only if it applies to everyone: when your phone sits in the same charging spot as Nika’s, it is a family habit, not a punishment.',
        ka: 'ძილი პირველია, რისი დაცვისკენაც ფსიქოლოგები მშობლებს მოუწოდებენ: Pew Research-ის 2025 წლის გამოკითხვაში მოზარდების 45%-მა თქვა, რომ სოციალური ქსელები ძილს უფუჭებს. კონკრეტული წესი ბუნდოვანს ჯობია, „მოწყობილობები ღამით დერეფანში იტენება“ კი მაქსიმალურად კონკრეტულია — შუაღამისას ნებისყოფა აღარ არის საჭირო, საძინებლის კართან ვაჭრობა — აღარც ის. წესი მხოლოდ მაშინ მუშაობს, თუ ყველას ეხება: როცა თქვენი ტელეფონი ნიკას ტელეფონის გვერდით იტენება, ეს ოჯახური ჩვევაა და არა სასჯელი.',
      },
    },
    { type: 'h2', text: { en: 'Password rules the whole family keeps', ka: 'პაროლის წესები, რომლებსაც მთელი ოჯახი იცავს' } },
    {
      type: 'p',
      text: {
        en: 'Short “clever” passwords fall quickly; length is what makes a password strong. Agree three family rules: passwords are long passphrases; the email password is never reused anywhere else; and codes — passwords, SMS codes, 2FA codes — are never shared with anyone, including best friends. Friendships change; a shared password cannot be un-shared.',
        ka: 'მოკლე „მოხერხებული“ პაროლები სწრაფად ტყდება; პაროლს სიგრძე აძლიერებს. შეთანხმდით ოჯახის სამ წესზე: პაროლები გრძელი საიდუმლო ფრაზებია; ელფოსტის პაროლი არსად სხვაგან არ მეორდება; კოდები კი — პაროლები, SMS კოდები, 2FA კოდები — არავის ეთქმის, საუკეთესო მეგობრების ჩათვლითაც. მეგობრობა იცვლება; გაზიარებულ პაროლს კი უკან ვეღარ დაიბრუნებ.',
      },
    },
    {
      type: 'callout',
      variant: 'do',
      title: { en: 'The four-word passphrase method', ka: 'ოთხსიტყვიანი საიდუმლო ფრაზის მეთოდი' },
      ps: [
        {
          en: 'Pick four random words, join them with dashes, add a number: “Tiger-Moon-River-42” or “მთვარე-ვეფხვი-მდინარე-42”. Easy for a person to remember, extremely slow for a computer to crack.',
          ka: 'აირჩიეთ ოთხი შემთხვევითი სიტყვა, გადააბით დეფისებით და დაამატეთ რიცხვი: „მთვარე-ვეფხვი-მდინარე-42“ ან „Tiger-Moon-River-42“. ადამიანისთვის ადვილი დასამახსოვრებელია, კომპიუტერისთვის კი უკიდურესად ნელი გასატეხი.',
        },
        {
          en: 'Each important account gets its own passphrase — email first of all.',
          ka: 'ყოველ მნიშვნელოვან ანგარიშს თავისი ფრაზა აქვს — უპირველესად ელფოსტას.',
        },
        {
          en: 'If memory is a worry, write down a hint, not the passphrase itself — or use the password manager built into the phone.',
          ka: 'თუ დამახსოვრება გაწუხებთ, ჩაიწერეთ მინიშნება და არა თავად ფრაზა — ან გამოიყენეთ ტელეფონში ჩაშენებული პაროლების მენეჯერი.',
        },
      ],
    },
    { type: 'h2', text: { en: 'Done. Now what?', ka: 'მზადაა. ახლა რა?' } },
    {
      type: 'p',
      text: {
        en: 'Half an hour of settings will not raise your child for you — no setting can. What it does is remove the cheap, common failure modes: the stranger who messages first, the stolen password, the two-a.m. scroll, the surprise charge on the family card. With those handled, you are free to do the part that only a parent can do: keep talking.',
        ka: 'პარამეტრებში გატარებული ნახევარი საათი შვილს თქვენ ნაცვლად ვერ აღზრდის — ამას ვერც ერთი პარამეტრი შეძლებს. მაგრამ ის შლის იაფ, გავრცელებულ საფრთხეებს: უცნობს, რომელიც პირველი გწერთ, მოპარულ პაროლს, ღამის ორ საათზე ეკრანის ფურცვლას, მოულოდნელ გადახდას საოჯახო ბარათიდან. ამის მოგვარების შემდეგ კი თავისუფალი ხართ იმისთვის, რაც მხოლოდ მშობელს შეუძლია: განაგრძეთ საუბარი.',
      },
    },
  ],
  sources: [
    'Pew Research (Apr 2025) — Teens, Social Media & Mental Health: pewresearch.org/internet/2025/04/22/teens-social-media-and-mental-health',
    'APA Health Advisory on Social Media Use in Adolescence: apa.org/topics/social-media-internet/health-advisory-adolescent-social-media-use',
  ],
}
