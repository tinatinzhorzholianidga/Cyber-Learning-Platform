// G5 - Scam Radar. Spot-the-scam with escalating difficulty (spec section 3):
// fake shop, gift-card reseller, crypto "doubling" from a hacked friend,
// fake trade middleman, ONE legit offer the radar must let through, fake job.
// Every explain names the exact tell.
export default {
  brief: {
    en: 'Six offers are about to hit your feed: a shop, a gift card, crypto, a game trade, a discount, a job. Most are traps built to take your money - or your identity. At least one is real. A good radar catches the scams AND lets the real thing through. Read each offer like your money is already on the table. Because it is.',
    ka: 'ექვსი შეთავაზება მოდის შენს ლენტაზე: მაღაზია, სასაჩუქრე ბარათი, კრიპტო, თამაშის გაცვლა, ფასდაკლება, სამსახური. უმეტესობა ხაფანგია, რომელიც შენი ფულის - ან შენი ვინაობის - წასაღებად შეიქმნა. მინიმუმ ერთი კი ნამდვილია. კარგი რადარი თაღლითობებს იჭერს და ნამდვილს ატარებს. წაიკითხე თითოეული ისე, თითქოს შენი ფული უკვე მაგიდაზეა. რადგან ასეა.',
  },
  rounds: [
    {
      type: 'choice',
      card: {
        from: { en: 'Instagram · airpods_sale_geo', ka: 'Instagram · airpods_sale_geo' },
        meta: { en: 'Page created last week · 214 followers', ka: 'გვერდი შექმნილია გასულ კვირას · 214 გამომწერი' },
        body: {
          en: 'AirPods Pro 2 - only 89 GEL instead of 449! 🔥 Last 3 pairs! Payment by transfer to a personal bank account only (no card). No returns - trust us, all our customers are happy. DM to order!',
          ka: 'AirPods Pro 2 - მხოლოდ 89 ლარად 449-ის ნაცვლად! 🔥 ბოლო 3 წყვილი! გადახდა მხოლოდ პირად საბანკო ანგარიშზე გადარიცხვით (ბარათი არ მიიღება). დაბრუნება არ ხდება - გვენდეთ, ყველა მყიდველი კმაყოფილია. შესაკვეთად მოგვწერე პირადში!',
        },
      },
      q: { en: 'Scam or legit?', ka: 'თაღლითობაა თუ ნამდვილი?' },
      options: [
        { label: { en: 'Legit - pages sell overstock cheap all the time', ka: 'ნამდვილია - გვერდები ხშირად ყიდიან ნაშთებს იაფად' }, correct: false },
        { label: { en: 'Scam - new page, impossible price, transfer to a personal account', ka: 'თაღლითობაა - ახალი გვერდი, შეუძლებელი ფასი, გადარიცხვა პირად ანგარიშზე' }, correct: true },
      ],
      explain: {
        en: 'Three tells, and any one of them is fatal: a page created LAST WEEK selling premium gear at 80% off; payment ONLY by transfer to a personal bank account - which, unlike a card payment, has zero buyer protection and cannot be reversed; and "no returns" declared in advance. The page collects transfers for a week, vanishes, and reopens under a new name. Nobody sells a 449 GEL product for 89 - the "discount" is the bait, the transfer is the hook.',
        ka: 'სამი ნიშანი - და თითო მათგანიც საკმარისია: გასულ კვირას შექმნილი გვერდი, რომელიც ძვირადღირებულ ტექნიკას 80%-იანი ფასდაკლებით ყიდის; გადახდა მხოლოდ პირად საბანკო ანგარიშზე გადარიცხვით - რომელსაც, ბარათით გადახდისგან განსხვავებით, მყიდველის დაცვა საერთოდ არ აქვს და უკან ვერ დააბრუნებ; და წინასწარვე გამოცხადებული „დაბრუნება არ ხდება“. გვერდი ერთი კვირა აგროვებს გადარიცხვებს, ქრება და ახალი სახელით იხსნება. 449-ლარიან ნივთს 89-ად არავინ ყიდის - „ფასდაკლება“ სატყუარაა, გადარიცხვა კი ანკესი.',
      },
    },
    {
      type: 'choice',
      card: {
        from: { en: 'Discord DM · KeyDrop_Reseller', ka: 'Discord პირადი · KeyDrop_Reseller' },
        body: {
          en: '50 GEL Steam gift card for 25 💳 I buy in bulk, that’s why it’s cheap. You send the money first (bank transfer), I send the code right after. I have vouches - check my pinned screenshots.',
          ka: '50-ლარიანი Steam-ის სასაჩუქრე ბარათი 25-ად 💳 დიდი რაოდენობით ვყიდულობ, ამიტომაა იაფი. ჯერ შენ გზავნი ფულს (გადარიცხვით), მე მაშინვე გიგზავნი კოდს. შემიძლია დავამტკიცო - ნახე ჩემი დაპინული სქრინები.',
        },
      },
      q: { en: 'Scam or legit?', ka: 'თაღლითობაა თუ ნამდვილი?' },
      options: [
        { label: { en: 'Legit - bulk resellers can undercut the store', ka: 'ნამდვილია - საბითუმო გადამყიდველს შეუძლია მაღაზიაზე იაფად გაყიდოს' }, correct: false },
        { label: { en: 'Scam - pay first, to a stranger, for a code that may never come', ka: 'თაღლითობაა - ჯერ გადაიხადე, უცნობთან, კოდში, რომელიც შეიძლება არასდროს მოვიდეს' }, correct: true },
      ],
      explain: {
        en: 'The exact tell: pay first, to a stranger, for a code. A Steam card at half price cannot legitimately exist - Steam sells them at face value, so a "cheap" one is either imaginary (the code never arrives), already redeemed, or bought with a stolen card and dead within days. "Vouches" and pinned screenshots take five minutes to fake. Codes and gift cards are the cash of the scam world: the moment you send money for one, it is gone with no way back.',
        ka: 'ზუსტი ნიშანი: ჯერ გადაიხადე, უცნობთან, კოდის სანაცვლოდ. ნახევარ ფასად Steam-ის ბარათი ლეგალურად ვერ იარსებებს - Steam მათ სრულ ფასად ყიდის, ამიტომ „იაფი“ ბარათი ან საერთოდ არ არსებობს (კოდი არასდროს მოვა), ან უკვე გამოყენებულია, ან მოპარული ბარათითაა ნაყიდი და რამდენიმე დღეში გაუქმდება. „მტკიცებულებები“ და დაპინული სქრინები ხუთ წუთში ყალბდება. კოდები და სასაჩუქრე ბარათები თაღლითური სამყაროს ნაღდი ფულია: როგორც კი ფულს გაგზავნი, ის წავიდა - უკან დასაბრუნებელი გზის გარეშე.',
      },
    },
    {
      type: 'choice',
      card: {
        from: { en: 'DM · Nika (your classmate)', ka: 'პირადი · ნიკა (შენი თანაკლასელი)' },
        body: {
          en: 'bro I swear it’s real 😅 I put 100 GEL into a crypto platform and took out 1000 in ONE week. sign up with my link and you get a bonus. want me to set up your account? send me your number',
          ka: 'ძმაო, ვფიცავარ, რეალურია 😅 100 ლარი ჩავდე კრიპტო პლატფორმაზე და ერთ კვირაში 1000 გამოვიტანე. ჩემი ბმულით დარეგისტრირდი და ბონუსს მიიღებ. გინდა, ანგარიშს გაგიმართავ? ნომერი გამომიგზავნე',
        },
      },
      q: { en: 'Scam or legit?', ka: 'თაღლითობაა თუ ნამდვილი?' },
      options: [
        { label: { en: 'Legit - it’s Nika, I sit two desks away from him', ka: 'ნამდვილია - ეს ნიკაა, ორი მერხის იქით ზის' }, correct: false },
        { label: { en: 'Scam - this doesn’t sound like Nika; his account may be hacked. I’ll ask him face to face', ka: 'თაღლითობაა - ეს ნიკას არ ჰგავს; მისი ანგარიში შეიძლება გატეხილია. პირისპირ ვკითხავ' }, correct: true },
      ],
      explain: {
        en: 'Two tells. First, the math: nobody turns 100 into 1000 in a week - guaranteed multiplication is the oldest lie in finance, and "my link gives a bonus" is how the scheme recruits. Second, the sender: a familiar name proves whose ACCOUNT it is, not whose fingers are typing. Hacked accounts are the perfect scam vehicle precisely because you trust them by default. The fix is out-of-band verification: ask Nika at school or call him. If his account was hacked, you just helped him find out - before it messaged your whole class.',
        ka: 'ორი ნიშანი. ჯერ მათემატიკა: 100-ს ერთ კვირაში 1000-ად ვერავინ აქცევს - გარანტირებული გამრავლება ფინანსების უძველესი ტყუილია, „ჩემი ბმული ბონუსს იძლევა“ კი ის გზაა, რომლითაც სქემა ახალ მსხვერპლებს იწვევს. მერე გამომგზავნი: ნაცნობი სახელი ამტკიცებს, ვისი ანგარიშია - და არა იმას, ვისი თითები წერს. გატეხილი ანგარიშები თაღლითობის იდეალური იარაღია სწორედ იმიტომ, რომ მათ ავტომატურად ენდობი. გამოსავალი სხვა არხით გადამოწმებაა: ჰკითხე ნიკას სკოლაში ან დაურეკე. თუ ანგარიში მართლა გატეხილი აღმოჩნდა, ახლახან დაეხმარე ამის აღმოჩენაში - სანამ ის მთელ კლასს მისწერდა.',
      },
    },
    {
      type: 'choice',
      card: {
        from: { en: 'Game chat · TrustMod_Middleman', ka: 'თამაშის ჩატი · TrustMod_Middleman' },
        body: {
          en: 'saw you two arranging a skin trade 👀 risky without a middleman, lots of scammers around. I’m a trusted mod - you BOTH send the items to me, I hold them, verify everything and pass them on. safest way, all the big trades go through mods.',
          ka: 'ვნახე, სქინების გაცვლას აპირებთ 👀 შუამავლის გარეშე სარისკოა, ბევრი თაღლითი დადის. მე სანდო მოდერატორი ვარ - ორივემ მე გამომიგზავნეთ ნივთები, შევინახავ, ყველაფერს გადავამოწმებ და გადავცემ. ყველაზე უსაფრთხო გზაა, ყველა დიდი გაცვლა მოდერატორებზე გადის.',
        },
      },
      q: { en: 'Scam or legit?', ka: 'თაღლითობაა თუ ნამდვილი?' },
      options: [
        { label: { en: 'Safe - a mod holding both items protects both sides', ka: 'უსაფრთხოა - მოდერატორი ორივე ნივთს ინახავს და ორივე მხარეს იცავს' }, correct: false },
        { label: { en: 'Scam - the "protection" IS the theft: he keeps both items', ka: 'თაღლითობაა - „დაცვა“ თავად არის ქურდობა: ორივე ნივთი მასთან რჩება' }, correct: true },
      ],
      explain: {
        en: 'The exact tell: a stranger volunteering to hold your stuff "for safety". Real platforms have no human middlemen - trades happen in the built-in trade window where both sides confirm at the same moment, and real moderators never DM players asking for items. The title "trusted mod" is typed, not earned; anyone can put it in a username. The second both items land in his inventory, he blocks you both. The person warning you about scammers is the scammer.',
        ka: 'ზუსტი ნიშანი: უცნობი, რომელიც თავად გთავაზობს, რომ „უსაფრთხოებისთვის“ შენი ნივთები შეინახოს. ნამდვილ პლატფორმებზე ადამიანი-შუამავალი არ არსებობს - გაცვლა ჩაშენებულ სავაჭრო ფანჯარაში ხდება, სადაც ორივე მხარე ერთსა და იმავე წამს ადასტურებს, ნამდვილი მოდერატორები კი მოთამაშეებს ნივთებს პირადში არასდროს სთხოვენ. ტიტული „სანდო მოდერატორი“ დაწერილია და არა დამსახურებული; მის სახელში ჩაწერა ყველას შეუძლია. როგორც კი ორივე ნივთი მის ინვენტარში მოხვდება, ორივეს დაბლოკავს. ის, ვინც თაღლითებზე გაფრთხილებს - თავად არის თაღლითი.',
      },
    },
    {
      type: 'choice',
      card: {
        from: { en: 'Instagram · technohub.ge ✔', ka: 'Instagram · technohub.ge ✔' },
        meta: { en: 'Verified account · selling since 2018 · 84K followers', ka: 'ვერიფიცირებული ანგარიში · ყიდის 2018 წლიდან · 84 ათასი გამომწერი' },
        body: {
          en: 'Back-to-school week: 20% off all headphones. 🎧 Order on our website and pay by card at checkout. Standard warranty and 14-day returns apply, as always.',
          ka: 'სასკოლო კვირეული: ყველა ყურსასმენზე 20%-იანი ფასდაკლება. 🎧 შეუკვეთე ჩვენს საიტზე და გადაიხადე ბარათით შეკვეთის გვერდზე. სტანდარტული გარანტია და 14-დღიანი დაბრუნება, როგორც ყოველთვის.',
        },
      },
      q: { en: 'Scam or legit?', ka: 'თაღლითობაა თუ ნამდვილი?' },
      options: [
        { label: { en: 'Scam - any discount on Instagram is a trap', ka: 'თაღლითობაა - ფასდაკლება Instagram-ზე ყოველთვის ხაფანგია' }, correct: false },
        { label: { en: 'Legit - and I can name exactly what makes it credible', ka: 'ნამდვილია - და ზუსტად შემიძლია ვთქვა, რა ხდის მას სანდოს' }, correct: true },
      ],
      explain: {
        en: 'A radar that flags everything is as broken as one that flags nothing. Look at what is different here: a verified account that has existed for years, a believable discount (20%, not 80%), payment by card through the store’s own checkout - which your bank can dispute and reverse if something goes wrong - a warranty and a returns policy, and zero pressure to DM someone and transfer money to a person. Legit sellers make paying SAFER; scammers make it FASTER. That is the signature to learn.',
        ka: 'რადარი, რომელიც ყველაფერზე რეკავს, ისეთივე გაფუჭებულია, როგორც ის, რომელიც ვერაფერს ხედავს. ნახე, რა განსხვავდება აქ: წლების წინ შექმნილი ვერიფიცირებული ანგარიში, დასაჯერებელი ფასდაკლება (20% და არა 80%), ბარათით გადახდა მაღაზიის საკუთარ საიტზე - რასაც პრობლემის შემთხვევაში ბანკი გაასაჩივრებს და დაგიბრუნებს - გარანტია და დაბრუნების პოლიტიკა, და არავინ გაიძულებს, ვინმეს პირადში მისწერო და პირად ანგარიშზე ფული გადაურიცხო. ნამდვილი გამყიდველი გადახდას უფრო უსაფრთხოს ხდის; თაღლითი - უფრო სწრაფს. აი, ხელწერა, რომელიც უნდა ისწავლო.',
      },
    },
    {
      type: 'choice',
      card: {
        from: { en: 'Facebook group · "Student jobs Tbilisi"', ka: 'Facebook ჯგუფი · „სტუდენტური სამსახური თბილისი“' },
        body: {
          en: 'EASY remote work for school students 🔥 50 GEL/day, 2 hours from your phone, no experience needed. Limited spots! To register: send the 20 GEL activation fee + a photo of your ID card, and we open your worker account today.',
          ka: 'მარტივი დისტანციური სამუშაო მოსწავლეებისთვის 🔥 დღეში 50 ლარი, 2 საათი ტელეფონიდან, გამოცდილება არ არის საჭირო. ადგილები შეზღუდულია! რეგისტრაციისთვის: გადმორიცხე 20 ლარი აქტივაციის საფასური + გამოგზავნე პირადობის მოწმობის ფოტო და დღესვე გაგიხსნით სამუშაო ანგარიშს.',
        },
      },
      q: { en: 'Scam or legit?', ka: 'თაღლითობაა თუ ნამდვილი?' },
      options: [
        { label: { en: 'Worth a shot - 20 GEL is nothing next to 50 GEL a day', ka: 'ღირს ცდად - 20 ლარი არაფერია დღეში 50 ლართან შედარებით' }, correct: false },
        { label: { en: 'Scam - real employers never charge you, and my ID is worth far more than 20 GEL', ka: 'თაღლითობაა - ნამდვილი დამსაქმებელი ფულს არასდროს გართმევს, ჩემი პირადობა კი 20 ლარზე ბევრად ძვირი ღირს' }, correct: true },
      ],
      explain: {
        en: 'Two scams stacked in one message. The advance fee: real employers pay YOU - a job that starts with you paying is not a job, and after the 20 GEL comes a "training fee", then silence. The worse half is the ID photo: with it, scammers can open accounts, take out microloans and run schemes in your name - identity theft that costs far more than 20 GEL and takes years to clean up. The dream salary ("50 GEL a day, 2 hours, no experience") exists only to rush you past both.',
        ka: 'ორი თაღლითობა ერთ შეტყობინებაში. წინასწარი გადასახადი: ნამდვილი დამსაქმებელი შენ გიხდის - სამსახური, რომელიც შენი გადახდით იწყება, სამსახური არ არის, და 20 ლარის შემდეგ მოვა „ტრენინგის საფასური“, მერე კი - სიჩუმე. უარესი ნახევარი პირადობის ფოტოა: მისით თაღლითები შენი სახელით ხსნიან ანგარიშებს, იღებენ მიკროსესხებს და ატრიალებენ სქემებს - ეს ვინაობის მოპარვაა, რომელიც 20 ლარზე ბევრად ძვირი ჯდება და წლები სჭირდება გასასწორებლად. საოცნებო ანაზღაურება („დღეში 50 ლარი, 2 საათი, გამოცდილების გარეშე“) მხოლოდ იმისთვის არსებობს, რომ ორივეს სწრაფად ჩაუქროლო.',
      },
    },
  ],
  takeaways: [
    {
      en: 'Price is the bait: 80% off, money that doubles, dream pay for no experience. If a deal only makes sense in a fantasy, it is one.',
      ka: 'ფასი სატყუარაა: 80%-იანი ფასდაკლება, ფული, რომელიც ორმაგდება, საოცნებო ანაზღაურება გამოცდილების გარეშე. თუ შეთავაზება მხოლოდ ფანტაზიაში ჯდება, ის ფანტაზიაა.',
    },
    {
      en: 'The payment method is the verdict: transfers to personal accounts, gift codes and crypto are irreversible. Card payment through a real checkout can be disputed and reversed.',
      ka: 'გადახდის მეთოდი განაჩენია: პირად ანგარიშზე გადარიცხვა, სასაჩუქრე კოდები და კრიპტო უკან არ ბრუნდება. ბარათით გადახდა ნამდვილ საიტზე კი საჩივრდება და ბრუნდება.',
    },
    {
      en: 'A familiar name proves the account, not the person. A weird money message from a friend gets verified out-of-band - in person or with a call.',
      ka: 'ნაცნობი სახელი ანგარიშს ამტკიცებს და არა ადამიანს. მეგობრისგან მოსული უცნაური ფულადი შეტყობინება სხვა არხით უნდა გადამოწმდეს - პირისპირ ან ზარით.',
    },
    {
      en: 'Nobody legitimate asks you to hand over items "for safety", pay to claim a prize, or pay to get a job. The fee IS the scam.',
      ka: 'ვერცერთი ნამდვილი გამყიდველი, დამსაქმებელი თუ „შუამავალი“ არ გთხოვს ნივთების გადაცემას „უსაფრთხოებისთვის“, გადახდას პრიზისთვის ან გადახდას სამსახურისთვის. ეს გადასახადი თავად არის თაღლითობა.',
    },
    {
      en: 'A radar that flags everything is broken too. Verified seller, realistic price, protected payment, returns policy - real offers have a signature; learn it.',
      ka: 'რადარი, რომელიც ყველაფერზე რეკავს, ასევე გაფუჭებულია. ვერიფიცირებული გამყიდველი, რეალისტური ფასი, დაცული გადახდა, დაბრუნების პოლიტიკა - ნამდვილ შეთავაზებებს ხელწერა აქვთ; ისწავლე ის.',
    },
  ],
}
