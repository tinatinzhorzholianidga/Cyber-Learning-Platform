// A6 — Screen time, sleep & mental health. APA Health Advisory approach:
// no magic hour count — what matters is what use displaces and what the content is.
export default {
  id: 'a6',
  shelf: 'A',
  order: 6,
  emoji: '😴',
  color: '#3ecf8e',
  minutes: 7,
  mission: 'g9',
  title: {
    en: 'Screen time, sleep & mental health: what actually matters',
    ka: 'ეკრანთან გატარებული დრო, ძილი და ფსიქიკური ჯანმრთელობა: რა არის სინამდვილეში მნიშვნელოვანი',
  },
  teaser: {
    en: 'Stop hunting for the magic hour limit. What matters is what the phone displaces — sleep, movement, real friends — and what your teen is actually watching.',
    ka: 'ნუღარ ეძებთ ჯადოსნურ საათობრივ ლიმიტს. მნიშვნელოვანია, რას ანაცვლებს ტელეფონი — ძილს, მოძრაობას, ნამდვილ მეგობრებს — და რას უყურებს რეალურად თქვენი შვილი.',
  },
  lead: {
    en: '"How much screen time is too much?" is the question parents ask most — and the honest answer from psychologists is that the number of hours is the wrong place to look. The American Psychological Association’s health advisory doesn’t set a magic limit. It asks two better questions: what is the screen displacing, and what is on it? This guide turns that into practical rules your family can actually keep.',
    ka: '„რამდენი დროა ეკრანთან ზედმეტი?“ — ეს მშობლების ყველაზე ხშირი კითხვაა, ფსიქოლოგების გულწრფელი პასუხი კი ის არის, რომ საათების რაოდენობა არასწორი საზომია. ამერიკის ფსიქოლოგთა ასოციაციის ჯანმრთელობის რეკომენდაცია ჯადოსნურ ლიმიტს არ ადგენს. ის ორ უკეთეს კითხვას სვამს: რას ანაცვლებს ეკრანი და რა არის მასზე? ეს გზამკვლევი ამ მიდგომას პრაქტიკულ წესებად აქცევს, რომლებსაც თქვენი ოჯახი ნამდვილად შეძლებს დაიცვას.',
  },
  body: [
    { type: 'h2', text: { en: 'It’s not the hours — it’s what they replace', ka: 'საქმე საათებში კი არა, იმაშია, თუ რას ანაცვლებს ისინი' } },
    {
      type: 'p',
      text: {
        en: 'Two teens can spend the same three hours online and have opposite experiences. Mariam video-calls her cousins, edits photos for the school club and follows a workout channel. Nino spends the same three hours — but at two in the morning, scrolling appearance content instead of sleeping. Same number, completely different effect. The APA’s core conclusion: screen use becomes a problem when it displaces sleep, physical activity, or in-person friendship — or when the content itself is harmful. So instead of counting minutes, look at what has quietly disappeared from your teen’s week.',
        ka: 'ორმა მოზარდმა შეიძლება ერთი და იგივე სამი საათი ონლაინ სრულიად საპირისპიროდ გაატაროს. მარიამი ბიძაშვილებთან ვიდეოზარებზეა, სკოლის კლუბისთვის ფოტოებს ამუშავებს და ვარჯიშის არხს ადევნებს თვალს. ნინო იმავე სამ საათს ხარჯავს — ოღონდ ღამის ორ საათზე, ძილის ნაცვლად გარეგნობის შესადარებელი ვიდეოების ფურცვლაში. რიცხვი ერთია, ეფექტი — სრულიად განსხვავებული. ასოციაციის მთავარი დასკვნა ასეთია: ეკრანი პრობლემად მაშინ იქცევა, როცა ის ანაცვლებს ძილს, ფიზიკურ აქტივობას ან ცოცხალ მეგობრობას — ან როცა თავად შინაარსია მავნე. ამიტომ წუთების თვლის ნაცვლად დააკვირდით, რა გაქრა ჩუმად თქვენი შვილის კვირიდან.',
      },
    },
    { type: 'h2', text: { en: 'Sleep comes first', ka: 'ძილი პირველ ადგილზეა' } },
    {
      type: 'p',
      text: {
        en: 'If you change only one thing, change sleep. A tired teen has a worse mood, worse grades and thinner patience — and the phone in the bedroom is the single biggest thief of teenage sleep. Notifications wake them; "one more video" costs an hour; the group chat is most alive at midnight. This is not a character flaw: apps are built to make stopping hard, and they work on adults too.',
        ka: 'თუ მხოლოდ ერთ რამეს შეცვლით, ძილი შეცვალეთ. გამოუძინებელ მოზარდს უფრო ცუდი განწყობა, უფრო დაბალი შეფასებები და ნაკლები მოთმინება აქვს — საძინებელში შეტანილი ტელეფონი კი მოზარდის ძილის მთავარი ქურდია. შეტყობინებები აღვიძებს; „კიდევ ერთი ვიდეო“ ერთი საათი ჯდება; ჯგუფური ჩატი შუაღამისას ყველაზე ცოცხალია. ეს ხასიათის ნაკლი არ არის: აპლიკაციები ისეა აწყობილი, რომ გაჩერება გაჭირდეს — და ეს უფროსებზეც მოქმედებს.',
      },
    },
    {
      type: 'callout',
      variant: 'do',
      title: { en: 'The rules that actually protect sleep and balance', ka: 'წესები, რომლებიც ნამდვილად იცავს ძილსა და ბალანსს' },
      items: [
        {
          en: 'All devices — including yours — charge outside the bedrooms overnight. A cheap alarm clock replaces the phone.',
          ka: 'ღამით ყველა მოწყობილობა — თქვენი ჩათვლით — საძინებლების გარეთ იტენება. ტელეფონს იაფი მაღვიძარა ანაცვლებს.',
        },
        {
          en: 'A no-phone hour before bed: screens off, lights down — a bit of boredom is fine.',
          ka: 'ტელეფონის გარეშე ერთი საათი ძილის წინ: ეკრანები გამორთულია, შუქი ჩამქრალი — ცოტა მოწყენილობა ნორმალურია.',
        },
        {
          en: 'Meals are phone-free for everyone at the table — parents first.',
          ka: 'ჭამის დროს ტელეფონი მაგიდასთან არავის უჭირავს — პირველ რიგში, მშობლებს.',
        },
        {
          en: 'Something physical every day: a walk, football, dancing — anything that moves the body.',
          ka: 'ყოველდღე რაღაც ფიზიკური: სეირნობა, ფეხბურთი, ცეკვა — ნებისმიერი რამ, რაც სხეულს ამოძრავებს.',
        },
        {
          en: 'Protect in-person time with friends as seriously as homework.',
          ka: 'მეგობრებთან ცოცხალი შეხვედრების დრო ისეთივე სერიოზულად დაიცავით, როგორც საშინაო დავალებას იცავთ.',
        },
      ],
    },
    { type: 'h2', text: { en: 'Warning signs of problem use', ka: 'პრობლემური გამოყენების გამაფრთხილებელი ნიშნები' } },
    {
      type: 'p',
      text: {
        en: 'Most teen phone use is normal — even the parts that annoy you. Watch instead for use that starts to break daily life:',
        ka: 'მოზარდის მიერ ტელეფონის გამოყენების უმეტესი ნაწილი ნორმალურია — ისიც კი, რაც გაღიზიანებთ. სამაგიეროდ დააკვირდით ისეთ გამოყენებას, რომელიც ყოველდღიურ ცხოვრებას არღვევს:',
      },
    },
    {
      type: 'list',
      items: [
        { en: 'Daily roles and routines start to suffer: school, sleep, meals, hygiene, chores', ka: 'ზიანდება ყოველდღიური მოვალეობები და რუტინა: სკოლა, ძილი, კვება, ჰიგიენა, საოჯახო საქმეები' },
        { en: 'Noticeable mood changes — irritability, flatness, anxiety — that track with time online', ka: 'შესამჩნევი ცვლილებები განწყობაში — გაღიზიანება, გულგრილობა, შფოთვა — რომლებიც ონლაინ გატარებულ დროს მიჰყვება' },
        { en: 'Withdrawal from friends, family, and activities they used to enjoy', ka: 'გარიდება მეგობრებისგან, ოჯახისგან და საქმიანობებისგან, რომლებიც ადრე უყვარდა' },
        { en: 'Strong distress when separated from the phone — panic, anger, or constant checking', ka: 'ძლიერი წუხილი ტელეფონთან განშორებისას — პანიკა, ბრაზი ან განუწყვეტელი შემოწმება' },
      ],
    },
    {
      type: 'p',
      text: {
        en: 'If several of these appear together and persist, that’s a conversation — and possibly a visit to a psychologist. It is a solvable problem, not a moral failure, and neither you nor your teen is to blame for it.',
        ka: 'თუ რამდენიმე ეს ნიშანი ერთად ჩნდება და დროში გრძელდება, დგება საუბრის დრო — შესაძლოა, ფსიქოლოგთან ვიზიტისაც. ეს მოგვარებადი პრობლემაა და არა ზნეობრივი მარცხი — მასში არც თქვენ ხართ დამნაშავე და არც თქვენი შვილი.',
      },
    },
    { type: 'h2', text: { en: 'Girls and the comparison trap', ka: 'გოგოები და შედარების ხაფანგი' } },
    {
      type: 'p',
      text: {
        en: 'Research keeps finding the same asymmetry: appearance-focused and social-comparison content hits teenage girls hardest. An endless feed of edited faces and bodies quietly teaches that your own are not good enough. The fix is not only less time but different content: sit down together, look at the feed, unfollow or mute the accounts that leave her feeling worse, and add ones that teach or encourage. Teens curate willingly once they see the feed as something adjustable — a setting, not reality.',
        ka: 'კვლევები ერთსა და იმავე ასიმეტრიას ადასტურებს: გარეგნობაზე ორიენტირებული და შედარებისკენ მიმზიდველი შინაარსი ყველაზე მძიმედ თინეიჯერ გოგოებზე მოქმედებს. დამუშავებული სახეებისა და სხეულების უსასრულო ლენტა ჩუმად ასწავლის, რომ საკუთარი — საკმარისად კარგი არ არის. გამოსავალი მხოლოდ ნაკლები დრო კი არა, სხვა შინაარსია: დასხედით ერთად, დაათვალიერეთ ლენტა, გააუქმეთ გამოწერა ან დაადუმეთ ანგარიშები, რომლებიც მას თავს ცუდად აგრძნობინებს, და დაამატეთ ისეთები, რომლებიც რაღაცას ასწავლის ან ამხნევებს. მოზარდები ამას სიამოვნებით აკეთებენ, როგორც კი ხვდებიან, რომ ლენტა რეალობა კი არა, მოსაწესრიგებელი პარამეტრია.',
      },
    },
    {
      type: 'callout',
      variant: 'note',
      title: { en: 'The numbers', ka: 'ციფრები' },
      ps: [
        {
          en: 'In Pew Research’s 2025 survey, 45% of US teens said social media hurts their sleep — the most commonly named harm.',
          ka: 'Pew Research-ის 2025 წლის გამოკითხვაში აშშ-ის მოზარდების 45%-მა თქვა, რომ სოციალური მედია მათ ძილს აზიანებს — ეს ყველაზე ხშირად დასახელებული ზიანია.',
        },
        {
          en: 'In the same survey, 25% of teen girls said social media hurts their mental health, versus 14% of boys.',
          ka: 'იმავე გამოკითხვაში თინეიჯერი გოგოების 25%-მა თქვა, რომ სოციალური მედია მათ ფსიქიკურ ჯანმრთელობას აზიანებს — ბიჭებში ეს მაჩვენებელი 14%-ია.',
        },
      ],
    },
    { type: 'h2', text: { en: 'Make the rules together — and follow them yourself', ka: 'შეადგინეთ წესები ერთად — და თავადაც დაიცავით' } },
    {
      type: 'p',
      text: {
        en: 'A rule a teen helped write is a rule they half-own. Sit down together, agree on what matters — sleep, school, movement, family time — and let them propose the details: which hours, which exceptions, what happens on weekends. Vague limits ("less phone!") fail; specific, co-written ones mostly hold. Then comes the hard part: your own phone. If you scroll at dinner and answer work messages at midnight, that — not your lecture — is the lesson. Teens copy what parents do, not what they say.',
        ka: 'წესს, რომლის დაწერაშიც მოზარდი მონაწილეობდა, ის ნახევრად საკუთარ წესად აღიქვამს. დასხედით ერთად, შეთანხმდით, რა არის მთავარი — ძილი, სკოლა, მოძრაობა, ოჯახური დრო — და მიეცით საშუალება, დეტალები თავად შემოგთავაზოთ: რომელი საათები, რა გამონაკლისები, რა ხდება შაბათ-კვირას. ბუნდოვანი შეზღუდვები („ნაკლები ტელეფონი!“) მარცხდება; კონკრეტული და ერთად დაწერილი წესები კი ძირითადად მუშაობს. შემდეგ მოდის ყველაზე რთული ნაწილი: თქვენი საკუთარი ტელეფონი. თუ ვახშამზე ლენტას ათვალიერებთ და შუაღამისას სამსახურის შეტყობინებებს პასუხობთ, გაკვეთილი სწორედ ეს არის — და არა თქვენი დარიგება. მოზარდები იმას იმეორებენ, რასაც მშობლები აკეთებენ, და არა იმას, რასაც ამბობენ.',
      },
    },
    {
      type: 'p',
      text: {
        en: 'Expect a few weeks of friction, especially over the bedroom rule. Hold the line kindly. Better sleep improves mood within days — and a teen who feels better argues less about the rule that got them there.',
        ka: 'რამდენიმე კვირის წინააღმდეგობას ელოდეთ, განსაკუთრებით საძინებლის წესის გამო. იდექით მშვიდად, მაგრამ მტკიცედ. უკეთესი ძილი განწყობას რამდენიმე დღეში აუმჯობესებს — მოზარდი კი, რომელიც თავს უკეთ გრძნობს, ნაკლებად ედავება წესს, რომელმაც აქამდე მიიყვანა.',
      },
    },
  ],
  sources: [
    'APA — Health Advisory on Social Media Use in Adolescence: apa.org/topics/social-media-internet/health-advisory-adolescent-social-media-use',
    'Pew Research (Apr 2025) — Teens, Social Media & Mental Health: pewresearch.org/internet/2025/04/22/teens-social-media-and-mental-health',
    'Child Mind Institute — monitoring teens’ social media: childmind.org/article/how-much-should-you-monitor-your-teens-social-media',
  ],
}
