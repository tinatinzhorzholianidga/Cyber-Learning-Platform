// A7 - Fake news, deepfakes & dangerous trends. Media literacy for parents:
// calm evaluation over panic; model doubt out loud; competence, not fear.
export default {
  id: 'a7',
  shelf: 'A',
  order: 7,
  emoji: '🤖',
  color: '#00b5d8',
  minutes: 6,
  mission: 'g7',
  title: {
    en: 'Fake news, deepfakes & dangerous trends: a parent’s guide',
    ka: 'ყალბი ამბები, დიპფეიკები და საშიში ტრენდები: გზამკვლევი მშობლებისთვის',
  },
  teaser: {
    en: 'The feed is built to hold attention, not to tell the truth. Here’s how to raise a teen who checks before believing - without a single lecture.',
    ka: 'ლენტა ყურადღების შესაკავებლად არის აწყობილი და არა სიმართლის სათქმელად. აი, როგორ გაზარდოთ მოზარდი, რომელიც დაჯერებამდე ამოწმებს - ერთი დარიგების გარეშეც.',
  },
  lead: {
    en: 'Your teen’s news comes from a feed, and the feed has one goal: keep them watching. Add cheap, convincing AI fakes, and "seeing is believing" stops working. The good news: the checking habits that protect against all of it are simple - and the best way to teach them is to practice them out loud, together.',
    ka: 'თქვენი შვილის ახალი ამბები ლენტიდან მოდის, ლენტას კი ერთი მიზანი აქვს: მაყურებელი რაც შეიძლება დიდხანს შეაკავოს. დაუმატეთ ამას იაფი და დამაჯერებელი ხელოვნური ინტელექტით შექმნილი ყალბი მასალა - და პრინციპი „საკუთარი თვალით ვნახე“ აღარ მუშაობს. კარგი ამბავი ის არის, რომ შემოწმების ჩვევები, რომლებიც ამ ყველაფრისგან იცავს, მარტივია - სწავლების საუკეთესო გზა კი მათი ხმამაღლა, ერთად გავარჯიშებაა.',
  },
  body: [
    { type: 'h2', text: { en: 'The algorithm is not a news editor', ka: 'ალგორითმი ახალი ამბების რედაქტორი არ არის' } },
    {
      type: 'p',
      text: {
        en: 'Feeds do not rank content by accuracy; they rank it by engagement. Whatever makes people stop, react and share rises to the top - and shock, outrage and too-good-to-be-true stories outperform careful truth every time. Nobody at the platform decided to show your child a false story; the system simply learned that the false story keeps eyes on screens. Understanding this - that virality measures emotion, not truth - is the foundation for everything else.',
        ka: 'ლენტა შინაარსს სიზუსტით არ ალაგებს - ის ჩართულობით ალაგებს. მაღლა ის ადის, რაც ადამიანებს აჩერებს, არეაგირებინებს და აზიარებინებს - შოკი, აღშფოთება და დაუჯერებლად კარგი ამბები კი ფრთხილ სიმართლეს ყოველთვის ამარცხებს. პლატფორმაში არავის გადაუწყვეტია, რომ თქვენს შვილს ყალბი ამბავი აჩვენოს; სისტემამ უბრალოდ ისწავლა, რომ ყალბი ამბავი მზერას ეკრანზე აკავებს. ამის გაგება - რომ ვირუსულობა ემოციას ზომავს და არა სიმართლეს - ყველაფრის საფუძველია.',
      },
    },
    { type: 'h2', text: { en: 'AI made fakery cheap', ka: 'ხელოვნურმა ინტელექტმა გაყალბება გააიაფა' } },
    {
      type: 'p',
      text: {
        en: 'AI can now produce photos, video and cloned voices that fool most people - in minutes, for free. This is not just about politics: schools around the world are dealing with AI-faked images of real classmates, and scammers clone the voices of relatives. The old advice - "look closely, fakes have weird hands" - is expiring fast. The durable skill is not spotting pixels; it is asking where a thing came from before believing it. If a shocking image exists only on one random account, that is the tell.',
        ka: 'ხელოვნურ ინტელექტს დღეს უკვე შეუძლია წუთებში და უფასოდ შექმნას ფოტო, ვიდეო და გაკოპირებული ხმა, რომელიც ადამიანების უმეტესობას მოატყუებს. საქმე მხოლოდ პოლიტიკას არ ეხება: მთელ მსოფლიოში სკოლები რეალური თანაკლასელების ხელოვნურად გაყალბებულ სურათებს ებრძვიან, თაღლითები კი ნათესავების ხმებს აკოპირებენ. ძველი რჩევა - „კარგად დააკვირდი, ყალბ სურათზე ხელები უცნაურია“ - სწრაფად ძველდება. გამძლე უნარი პიქსელების დათვალიერება კი არა, კითხვაა: საიდან მოვიდა ეს, სანამ დავიჯერებ? თუ შოკისმომგვრელი სურათი მხოლოდ ერთ შემთხვევით ანგარიშზე არსებობს, ეს უკვე მინიშნებაა.',
      },
    },
    { type: 'h2', text: { en: 'Teach lateral reading - without lecturing', ka: 'ასწავლეთ გვერდითი კითხვა - დარიგების გარეშე' } },
    {
      type: 'p',
      text: {
        en: 'Professional fact-checkers don’t stare at a claim; they leave it. They open a new tab and read sideways: who published this, what do others say about that source, has the claim been reported anywhere reputable, has this photo appeared before in a different story? That is the whole method - check the source, search the claim, think about where the image came from. Teens learn it not from a lesson but from watching you do it in twenty seconds - and from it feeling like a detective game, not homework.',
        ka: 'პროფესიონალი ფაქტების შემმოწმებლები განცხადებას კი არ მიშტერებიან - ტოვებენ მას. ხსნიან ახალ ჩანართს და „გვერდულად“ კითხულობენ: ვინ გამოაქვეყნა ეს, რას ამბობენ სხვები ამ წყაროზე, დაწერა თუ არა იგივე ამბავი რომელიმე სანდო გამოცემამ, გამოჩენილა თუ არა ეს ფოტო ადრე სხვა ამბავში? მთელი მეთოდი ეს არის - შეამოწმე წყარო, მოძებნე განცხადება, დაფიქრდი სურათის წარმომავლობაზე. მოზარდები ამას გაკვეთილიდან კი არ სწავლობენ, არამედ იმის ყურებით, როგორ აკეთებთ ამას თქვენ ოც წამში - და იმით, რომ ეს დეტექტიურ თამაშად აღიქმება და არა დავალებად.',
      },
    },
    {
      type: 'callout',
      variant: 'script',
      title: { en: 'Check something together', ka: 'შეამოწმეთ რამე ერთად' },
      ps: [
        {
          en: '"Gio, look at this - I saw it and honestly I’m not sure it’s real. Want to help me check? Let’s see who posted it first and whether any real news site has it. I bet you find the answer before I do."',
          ka: '„გიო, ნახე ეს - ვნახე და, გულწრფელად, არ ვიცი, ნამდვილია თუ არა. დამეხმარები შემოწმებაში? ვნახოთ, პირველად ვინ გამოაქვეყნა და წერს თუ არა ამას რომელიმე ნამდვილი საინფორმაციო საიტი. დავნიძლავდები, პასუხს ჩემზე მალე იპოვი.“',
        },
      ],
    },
    { type: 'h2', text: { en: 'Viral challenges: evaluate, don’t panic', ka: 'ვირუსული გამოწვევები: შეაფასეთ მშვიდად, პანიკის გარეშე' } },
    {
      type: 'p',
      text: {
        en: 'Every few months a headline announces a terrifying "challenge sweeping the schools". The track record: most viral challenges are harmless fun - dances, jokes, silly stunts; a small number are genuinely dangerous; and a few famous panics turned out to be largely invented, spread faster by frightened adults than by kids. Panicked bans teach nothing. The calm move: ask your teen what they have actually seen ("Is this really going around? What do people at school say about it?"), evaluate the real risk together, and agree on what is off-limits and why. You will often discover your teen already thinks the challenge is stupid - and says so.',
        ka: 'რამდენიმე თვეში ერთხელ სათაურები საშინელ „გამოწვევას“ გვამცნობს, „რომელმაც სკოლები მოიცვა“. გამოცდილება კი ასეთია: ვირუსული გამოწვევების უმეტესობა უწყინარი გართობაა - ცეკვები, ხუმრობები, სასაცილო ილეთები; მცირე ნაწილი მართლაც საშიშია; რამდენიმე ცნობილი პანიკა კი დიდწილად გამოგონილი აღმოჩნდა, რომელიც შეშინებულმა უფროსებმა ბავშვებზე სწრაფად გაავრცელეს. პანიკური აკრძალვები ვერაფერს ასწავლის. მშვიდი გზა ასეთია: ჰკითხეთ შვილს, რეალურად რა უნახავს („მართლა ვრცელდება ეს? რას ამბობენ ამაზე სკოლაში?“), ერთად შეაფასეთ ნამდვილი რისკი და შეთანხმდით, რა არის დაუშვებელი და რატომ. ხშირად აღმოაჩენთ, რომ თქვენი შვილი ამ გამოწვევას ისედაც სისულელედ თვლის - და ამას პირდაპირ ამბობს.',
      },
    },
    { type: 'h2', text: { en: 'Adults have confirmation bias too', ka: 'დამადასტურებელი მიკერძოება უფროსებსაც აქვთ' } },
    {
      type: 'p',
      text: {
        en: 'We all believe faster when a story matches what we already think - adults included, parents included. The most powerful media-literacy lesson costs nothing: model doubt out loud. "I saw this today - I wonder if it’s real." "I shared something yesterday that turned out to be false, so I deleted it and said so." A child who watches you question your own feed learns that checking is not an insult to intelligence - it is what smart people do.',
        ka: 'ყველანი უფრო სწრაფად ვიჯერებთ ამბავს, რომელიც ჩვენს არსებულ აზრს ემთხვევა - უფროსებიც, მშობლებიც. მედიაწიგნიერების ყველაზე ძლიერი გაკვეთილი კი უფასოა: ეჭვი ხმამაღლა გამოთქვით. „დღეს ეს ვნახე - ნეტავ, ნამდვილია?“ „გუშინ რაღაც გავაზიარე, რაც ყალბი აღმოჩნდა - წავშალე და ესეც ვთქვი.“ ბავშვი, რომელიც ხედავს, როგორ აყენებთ ეჭვქვეშ საკუთარ ლენტას, სწავლობს, რომ შემოწმება ჭკუის შეურაცხყოფა კი არა - ის არის, რასაც ჭკვიანი ადამიანები აკეთებენ.',
      },
    },
    {
      type: 'callout',
      variant: 'do',
      title: { en: 'Family fact-check habits', ka: 'ფაქტების შემოწმების ოჯახური ჩვევები' },
      items: [
        {
          en: 'Pause before sharing - if something makes you furious or amazed, that is exactly when to check.',
          ka: 'გაზიარებამდე შეჩერდით - თუ რაღაც გაბრაზებთ ან გაოცებთ, სწორედ მაშინ არის შესამოწმებელი.',
        },
        {
          en: 'Ask "who posted this first, and how do they know?" before asking "is it true?"',
          ka: 'ჯერ იკითხეთ „ვინ გამოაქვეყნა ეს პირველად და საიდან იცის?“ და მხოლოდ შემდეგ - „მართალია თუ არა?“',
        },
        {
          en: 'Use reverse-image logic on shocking photos: has this picture appeared before, somewhere else, in another story?',
          ka: 'შოკისმომგვრელ ფოტოებზე გამოიყენეთ წარმომავლობის ლოგიკა: გამოჩენილა ეს სურათი ადრე, სხვაგან, სხვა ამბავში?',
        },
        {
          en: 'Make being corrected a win: whoever catches a fake first earns bragging rights at dinner.',
          ka: 'შესწორება გამარჯვებად აქციეთ: ვინც ყალბს პირველი დაიჭერს, ვახშამზე ტრაბახის უფლებას იღებს.',
        },
        {
          en: 'When you get one wrong yourself, say so in front of the kids - it is the strongest lesson on this list.',
          ka: 'როცა თავად შეცდებით, ეს ბავშვების თანდასწრებით აღიარეთ - ეს ამ სიის ყველაზე ძლიერი გაკვეთილია.',
        },
      ],
    },
    { type: 'h2', text: { en: 'One question protects more than any filter', ka: 'ერთი კითხვა ნებისმიერ ფილტრზე მეტად იცავს' } },
    {
      type: 'p',
      text: {
        en: 'None of this requires you to know more about apps than your teen does - it only requires curiosity and honesty. Aim for a family reflex built around a single question: "how do we know?" A teen who asks it about a fake photo will also ask it about a stranger’s promise or a too-good giveaway - and that one reflex protects more than any parental control ever will.',
        ka: 'არაფერი ამათგან არ მოითხოვს, რომ აპლიკაციები შვილზე უკეთ იცოდეთ - მხოლოდ ცნობისმოყვარეობა და გულწრფელობა სჭირდება. მიზნად დაისახეთ ერთ კითხვაზე აგებული ოჯახური რეფლექსი: „საიდან ვიცით ეს?“ მოზარდი, რომელიც ამას ყალბ ფოტოზე იკითხავს, იმავეს იკითხავს უცნობის დაპირებაზეც და დაუჯერებლად კარგ გათამაშებაზეც - და ეს ერთი რეფლექსი ნებისმიერ მშობლის კონტროლზე მეტად დაიცავს მას.',
      },
    },
    {
      type: 'callout',
      variant: 'note',
      title: { en: 'In Georgia', ka: 'საქართველოში' },
      items: [
        {
          en: 'Georgian teens get their "news" from the same feeds - Instagram, TikTok, and Facebook - so everything in this article applies unchanged. Practise the checking habits on Georgian-language posts too.',
          ka: 'ქართველი მოზარდები „ახალ ამბებს“ იმავე ლენტებიდან იღებენ - Instagram, TikTok და Facebook - ამიტომ ამ სტატიაში ყველაფერი უცვლელად ვრცელდება. შემოწმების ჩვევები ქართულენოვან პოსტებზეც გაავარჯიშეთ.',
        },
        {
          en: 'Fakery circulates in Georgian too: "money doubling" offers arrive from hacked friends’ accounts, and fake giveaways or job ads borrow the names of real Georgian companies - the "who posted this first?" question catches them all.',
          ka: 'გაყალბება ქართულადაც ვრცელდება: „ფულის გაორმაგების“ შეთავაზებები გატეხილი მეგობრების ანგარიშებიდან მოდის, ყალბი გათამაშებები და ვაკანსიები კი ნამდვილი ქართული კომპანიების სახელებს სესხულობს - კითხვა „პირველად ვინ გამოაქვეყნა?“ ყველა მათგანს იჭერს.',
        },
        {
          en: 'If a fabricated image of your child is published without consent, contact the Personal Data Protection Service (personaldata.ge); if the fake image is intimate and the child is under 18, Take It Down (takeitdown.ncmec.org) works from Georgia.',
          ka: 'თუ თქვენი შვილის გაყალბებული გამოსახულება თანხმობის გარეშე გამოქვეყნდა, მიმართეთ პერსონალურ მონაცემთა დაცვის სამსახურს (personaldata.ge); ხოლო თუ ყალბი გამოსახულება ინტიმურია და ბავშვი 18 წლამდეა, Take It Down (takeitdown.ncmec.org) საქართველოდანაც მუშაობს.',
        },
        {
          en: 'When fabricated content is used for blackmail or fraud, that is a police matter: call 112 or contact the MIA cyber-crime division via police.ge.',
          ka: 'როცა გაყალბებული მასალა შანტაჟისთვის ან თაღლითობისთვის გამოიყენება, ეს პოლიციის საქმეა: დარეკეთ 112-ზე ან მიმართეთ შსს კიბერდანაშაულის სამმართველოს police.ge-ის მეშვეობით.',
        },
      ],
    },
  ],
  sources: [
    'Common Sense Media - Digital Citizenship Curriculum (news & media literacy): commonsense.org/education/digital-citizenship',
    'APA - Health Advisory on Social Media Use in Adolescence (media-literacy recommendation): apa.org/topics/social-media-internet/health-advisory-adolescent-social-media-use',
  ],
}
