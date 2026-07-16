// A1 - What your teen's online world looks like. Calm map of the territory:
// apps, group chats, gaming voice chats, algorithms; why bans backfire;
// what teens themselves say (Pew 2025); the guide-not-gatekeeper goal.
export default {
  id: 'a1',
  shelf: 'A',
  order: 1,
  emoji: '🌐',
  color: '#5b8cff',
  minutes: 6,
  mission: 'g2',
  title: {
    en: 'What your teen’s online world actually looks like',
    ka: 'როგორ გამოიყურება სინამდვილეში თქვენი მოზარდის ონლაინ სამყარო',
  },
  teaser: {
    en: 'Apps, group chats, gaming voice chats and algorithms - a calm map of the territory, and why being a guide beats being a gatekeeper.',
    ka: 'აპლიკაციები, ჯგუფური ჩატები, თამაშების ხმოვანი ჩატები და ალგორითმები - ამ ტერიტორიის მშვიდი რუკა და იმის ახსნა, რატომ ჯობია იყოთ გზამკვლევი და არა დარაჯი.',
  },
  lead: {
    en: 'If your teen’s phone feels like a foreign country, you are not alone - and you don’t need a visa to visit. This article is a map: where teens actually spend their time online, why banning it all backfires, and what a realistic, useful goal for a parent looks like.',
    ka: 'თუ თქვენი მოზარდის ტელეფონი უცხო ქვეყანასავით გეჩვენებათ, მარტო არ ხართ - და ამ ქვეყანაში შესასვლელად ვიზა არ გჭირდებათ. ეს სტატია რუკაა: სად ატარებენ მოზარდები დროს ონლაინ სივრცეში, რატომ იძლევა სრული აკრძალვა საპირისპირო შედეგს და როგორია მშობლის რეალისტური, სასარგებლო მიზანი.',
  },
  body: [
    { type: 'h2', text: { en: 'It’s much more than a feed', ka: 'ეს გაცილებით მეტია, ვიდრე ლენტა' } },
    {
      type: 'p',
      text: {
        en: 'When parents picture "the internet," they usually picture a public feed: photos, likes, comments. But most of a teen’s online life is invisible from the outside. It happens in direct messages, in group chats with twenty classmates, in disappearing stories, and in the voice chat running alongside every game. When fourteen-year-old Nika plays online with his friends, he isn’t just playing - that chat is where the jokes, the plans, and the friendships live.',
        ka: 'როცა მშობლები „ინტერნეტს“ წარმოიდგენენ, ჩვეულებრივ საჯარო ლენტას ხედავენ: ფოტოებს, მოწონებებს, კომენტარებს. მაგრამ მოზარდის ონლაინ ცხოვრების უმეტესი ნაწილი გარედან უხილავია. ის მიმდინარეობს პირად შეტყობინებებში, ოცი თანაკლასელის ჯგუფურ ჩატში, გაქრობად „სთორებში“ და ხმოვან ჩატში, რომელიც ყველა თამაშს თან ახლავს. როცა თოთხმეტი წლის ნიკა მეგობრებთან ერთად ონლაინ თამაშობს, ის მხოლოდ არ თამაშობს - სწორედ ამ ჩატში ცხოვრობს ხუმრობები, გეგმები და მეგობრობები.',
      },
    },
    {
      type: 'p',
      text: {
        en: 'The mix changes with age and friend group, but the pattern is stable: Instagram and TikTok for watching and posting, Snapchat or Messenger for talking, game chats for hanging out. For Mariam, the class group chat is where homework questions, gossip, and weekend plans all happen at once. Leaving it isn’t really an option - for her, that chat is the school hallway.',
        ka: 'ნაზავი იცვლება ასაკისა და სამეგობროს მიხედვით, მაგრამ სქემა სტაბილურია: Instagram და TikTok - საყურებლად და დასაპოსტად, Snapchat ან Messenger - სასაუბროდ, თამაშის ჩატები - ერთად დროის გასატარებლად. მარიამისთვის კლასის ჯგუფური ჩატი ის ადგილია, სადაც ერთდროულად ხდება საშინაო დავალების კითხვები, ჭორები და შაბათ-კვირის გეგმები. მისი დატოვება რეალურად არჩევანი არ არის - მისთვის ეს ჩატი სკოლის დერეფანია.',
      },
    },
    { type: 'h2', text: { en: 'Why "just ban it" backfires', ka: 'რატომ არ ამართლებს „უბრალოდ აუკრძალე“' } },
    {
      type: 'p',
      text: {
        en: 'A full ban is tempting - one decision, and the problem seems to vanish. In practice it usually produces three very predictable results.',
        ka: 'სრული აკრძალვა მაცდურია - ერთი გადაწყვეტილება და პრობლემა თითქოს ქრება. პრაქტიკაში ის ჩვეულებრივ სამ სავსებით პროგნოზირებად შედეგს იძლევა.',
      },
    },
    {
      type: 'list',
      items: [
        {
          en: 'It drives the activity underground: secret accounts, a friend’s phone, deleted histories. The behaviour continues - you just stop seeing it.',
          ka: 'აქტივობა იატაკქვეშ გადადის: ფარული ანგარიშები, მეგობრის ტელეფონი, წაშლილი ისტორია. ქცევა გრძელდება - უბრალოდ, თქვენ ვეღარ ხედავთ მას.',
        },
        {
          en: 'It removes you as the support person. A teen with a secret account will not come to you when something goes wrong there - that would mean confessing the account first.',
          ka: 'თქვენ კარგავთ მხარდამჭერის როლს. მოზარდი, რომელსაც ფარული ანგარიში აქვს, პრობლემის დროს თქვენთან არ მოვა - ჯერ ხომ თავად ანგარიშის აღიარება მოუწევდა.',
        },
        {
          en: 'It cuts them off from their social world, which for a teen feels like a punishment far bigger than the risk you were trying to avoid - so trust takes the hit.',
          ka: 'ის მოზარდს საკუთარ სოციალურ სამყაროს აშორებს, რაც მისთვის გაცილებით მძიმე სასჯელია, ვიდრე ის რისკი, რომლის თავიდან აცილებასაც ცდილობდით - და დარტყმას ნდობა იღებს.',
        },
      ],
    },
    {
      type: 'p',
      text: {
        en: 'Boundaries still matter - device-free bedrooms and no-phone hours work well. The difference is between rules made together with the teen about how they use the internet, and a wall that pretends the internet doesn’t exist.',
        ka: 'საზღვრები მაინც მნიშვნელოვანია - ტელეფონისგან თავისუფალი საძინებელი და უტელეფონო საათები კარგად მუშაობს. განსხვავება ისაა, წესებს მოზარდთან ერთად ადგენთ იმაზე, როგორ გამოიყენოს ინტერნეტი, თუ კედელს აშენებთ, რომელიც თავს იკატუნებს, თითქოს ინტერნეტი არ არსებობს.',
      },
    },
    { type: 'h2', text: { en: 'What teens themselves say', ka: 'რას ამბობენ თავად მოზარდები' } },
    {
      type: 'callout',
      variant: 'note',
      title: { en: 'The numbers', ka: 'ციფრები' },
      ps: [
        {
          en: 'In Pew Research’s 2025 survey, 48% of teens said social media harms people their age - but only 14% said it harms them personally. And 45% said it hurts their sleep.',
          ka: 'Pew Research-ის 2025 წლის გამოკითხვაში მოზარდების 48%-მა თქვა, რომ სოციალური ქსელები მათ თანატოლებს ვნებს - მაგრამ მხოლოდ 14%-მა თქვა, რომ პირადად მას ვნებს. 45%-მა კი აღნიშნა, რომ სოციალური ქსელები ძილს უფუჭებს.',
        },
      ],
    },
    {
      type: 'p',
      text: {
        en: 'That gap - "risky for others, fine for me" - is the most useful fact in this article. It explains why lectures bounce off: your teen genuinely believes the warning is about someone else. Questions and real scenarios work better than warnings, because they let a teen reach the conclusion themselves. The numbers also tell you where to start: sleep. Almost half of teens already feel that cost themselves, so a device-out-of-the-bedroom rule is a conversation you can actually win.',
        ka: 'ეს სხვაობა - „სხვებისთვის სახიფათოა, ჩემთვის - არა“ - ამ სტატიის ყველაზე სასარგებლო ფაქტია. ის ხსნის, რატომ ასხლტება ლექციები: თქვენს მოზარდს გულწრფელად სჯერა, რომ გაფრთხილება სხვას ეხება. კითხვები და რეალური სცენარები გაფრთხილებებზე უკეთ მუშაობს, რადგან მოზარდს დასკვნამდე თავად მიჰყავს. ეს ციფრები იმასაც გეუბნებათ, საიდან დაიწყოთ: ძილიდან. მოზარდების თითქმის ნახევარი ამ ფასს საკუთარ თავზე უკვე გრძნობს, ამიტომ წესი „ტელეფონი საძინებლის გარეთ“ ის საუბარია, რომლის მოგებაც ნამდვილად შეგიძლიათ.',
      },
    },
    { type: 'h2', text: { en: 'How the feed hooks attention', ka: 'როგორ იჭერს ლენტა ყურადღებას' } },
    {
      type: 'p',
      text: {
        en: 'The feed is not a neutral pipe. Every pause, replay, and tap teaches the algorithm what keeps your child watching, and it serves up more of exactly that. Add infinite scroll (no natural stopping point), autoplay (the next video starts by itself), and streaks (miss a day and you "lose"), and you get a product engineered to be hard to put down. For a parent this matters for one reason: it is not weak willpower. Saying "you have no self-control" is unfair and starts a fight. Saying "these apps are built by teams whose whole job is to keep you scrolling - who benefits from that?" turns your teen into a critic instead of a defendant.',
        ka: 'ლენტა ნეიტრალური მილი არ არის. ყოველი შეყოვნება, ხელახლა ნახვა და შეხება ალგორითმს ასწავლის, რა აჩერებს თქვენს შვილს ეკრანთან, და ის ზუსტად იმას აწვდის კიდევ მეტს. დაუმატეთ უსასრულო სქროლი (ბუნებრივი გაჩერების წერტილი არ არსებობს), ავტომატური დაკვრა (შემდეგი ვიდეო თავისით ირთვება) და „სთრიქები“ (გამოტოვებ ერთ დღეს და „აგებ“) - და მიიღებთ პროდუქტს, რომელიც განზრახ ისეა აწყობილი, რომ ძნელად დასადებია. მშობლისთვის ეს ერთი მიზეზით არის მნიშვნელოვანი: ეს სუსტი ნებისყოფა არ არის. ფრაზა „თავს ვერ იკავებ“ უსამართლოა და ჩხუბს იწყებს. ფრაზა „ამ აპლიკაციებს მთელი გუნდები აწყობენ, რომელთა სამსახურიც შენი სქროლვის გაგრძელებაა - ვის აწყობს ეს?“ კი თქვენს მოზარდს ბრალდებულის ნაცვლად კრიტიკოსად აქცევს.',
      },
    },
    { type: 'h2', text: { en: 'Your realistic goal: guide, not gatekeeper', ka: 'თქვენი რეალისტური მიზანი: გზამკვლევი და არა დარაჯი' } },
    {
      type: 'p',
      text: {
        en: 'You will never know every app, and you don’t need to. Your child will always be faster with the technology; you are decades ahead on judgement, and judgement is what actually keeps teens safe. The realistic goal is to be the informed guide: curious about their world, clear about a few non-negotiable rules (sleep, private accounts, "come to me if anything feels wrong - you won’t be in trouble"), and calm when something does go wrong. Oversight can loosen as they earn it; the open door should never close.',
        ka: 'ყველა აპლიკაციას ვერასოდეს გაიცნობთ - და არც გჭირდებათ. თქვენი შვილი ტექნოლოგიაში ყოველთვის უფრო სწრაფი იქნება; სამაგიეროდ, თქვენ ათწლეულებით უსწრებთ განსჯაში, და მოზარდებს სწორედ განსჯა იცავს. რეალისტური მიზანია, იყოთ ინფორმირებული გზამკვლევი: ცნობისმოყვარე მისი სამყაროს მიმართ, მკაფიო რამდენიმე ურყევ წესში (ძილი, დახურული ანგარიშები, „თუ რამე ცუდად მოგეჩვენება, მოდი ჩემთან - არ დაისჯები“) და მშვიდი, როცა რაღაც მართლა არეულია. ზედამხედველობა შეიძლება ნელ-ნელა შესუსტდეს, როცა მოზარდი ნდობას დაიმსახურებს; ღია კარი კი არასოდეს უნდა დაიხუროს.',
      },
    },
    {
      type: 'callout',
      variant: 'script',
      title: { en: 'A curiosity opener', ka: 'ცნობისმოყვარე დასაწყისი' },
      ps: [
        {
          en: '"Everyone talks about TikTok, but I’ve never properly watched it. Will you show me your favourite creator? I want to see what’s actually good about them." Then watch, and don’t critique. The goal of the first conversation is only to earn the second one.',
          ka: '„ყველა TikTok-ზე ლაპარაკობს, მე კი ის ნამდვილად არასოდეს მინახავს. მაჩვენებ შენს საყვარელ ბლოგერს? მინდა ვნახო, სინამდვილეში რა მოგწონს მასში.“ შემდეგ უყურეთ და ნუ გააკრიტიკებთ. პირველი საუბრის მიზანი მხოლოდ ისაა, რომ მეორე დაიმსახუროთ.',
        },
      ],
    },
    {
      type: 'p',
      text: {
        en: 'When you’re ready to go one step further, have your teen try the Footprint Detective mission on CyberHero - you’ll both see exactly what a stranger can learn from a public profile, and it makes a great dinner-table conversation.',
        ka: 'როცა შემდეგი ნაბიჯისთვის მზად იქნებით, შესთავაზეთ თქვენს მოზარდს CyberHero-ს მისია „კვალის დეტექტივი“ - ორივე ნახავთ, ზუსტად რისი გაგება შეუძლია უცნობს საჯარო პროფილიდან, და ეს ვახშმის მაგიდასთან საუბრის შესანიშნავი თემაა.',
      },
    },
    {
      type: 'callout',
      variant: 'note',
      title: { en: 'In Georgia', ka: 'საქართველოში' },
      items: [
        {
          en: 'Georgian teens live mostly on Instagram, TikTok, and Facebook/Messenger - the map in this article describes their world without translation.',
          ka: 'ქართველი მოზარდები ძირითადად Instagram-ზე, TikTok-სა და Facebook/Messenger-ში ცხოვრობენ - ამ სტატიაში დახატული რუკა მათ სამყაროსაც ზუსტად აღწერს.',
        },
        {
          en: 'Class group chats usually run on Messenger or WhatsApp - for a Georgian teen that chat really is the school hallway, so leaving it is rarely a realistic option.',
          ka: 'კლასის ჯგუფური ჩატები ჩვეულებრივ Messenger-ში ან WhatsApp-შია - ქართველი მოზარდისთვის ეს ჩატი მართლაც სკოლის დერეფანია, ამიტომ მისი დატოვება იშვიათად არის რეალური არჩევანი.',
        },
        {
          en: 'Family and school groups often live on Viber and WhatsApp - joining them is a natural, low-pressure way to see one corner of your child’s online world.',
          ka: 'საოჯახო და სასკოლო ჯგუფები ხშირად Viber-სა და WhatsApp-შია - მათში ჩართვა ბუნებრივი და უწყინარი გზაა, რომ შვილის ონლაინ სამყაროს ერთი კუთხე მაინც დაინახოთ.',
        },
        {
          en: 'The statistics cited here come from international research (Pew), but they describe the same platforms Georgian teens use every day - the patterns apply to Georgian families too.',
          ka: 'აქ მოყვანილი ციფრები საერთაშორისო კვლევებიდან (Pew) მოდის, მაგრამ ისინი ზუსტად იმ პლატფორმებს აღწერს, რომლებსაც ქართველი მოზარდები ყოველდღე იყენებენ - ეს კანონზომიერებები ქართულ ოჯახებზეც ვრცელდება.',
        },
      ],
    },
  ],
  sources: [
    'Pew Research (2025) - Teens, Social Media & Mental Health: pewresearch.org/internet/2025/04/22/teens-social-media-and-mental-health',
    'APA - Health Advisory on Social Media Use in Adolescence: apa.org/topics/social-media-internet/health-advisory-adolescent-social-media-use',
    'Child Mind Institute - How much should you monitor your teen’s social media: childmind.org/article/how-much-should-you-monitor-your-teens-social-media',
  ],
}
