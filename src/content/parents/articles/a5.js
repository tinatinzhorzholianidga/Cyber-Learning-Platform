// A5 — Grooming & online strangers. NCMEC victim-first framing:
// the child is never at fault, fear is not the teaching tool — competence is.
export default {
  id: 'a5',
  shelf: 'A',
  order: 5,
  emoji: '🎭',
  color: '#e05780',
  minutes: 6,
  mission: 'g8',
  title: {
    en: 'Grooming & online strangers: how trust is used as a weapon',
    ka: 'გრუმინგი და ონლაინ უცნობები: როგორ იქცევა ნდობა იარაღად',
  },
  teaser: {
    en: 'Groomers don’t look like strangers — they look like the friend who finally understands. Learn the pattern, the red-flag phrases, and the calm response that keeps your child talking to you.',
    ka: 'გრუმერები უცნობებს არ ჰგვანან — ისინი ჰგვანან მეგობარს, რომელიც ბოლოს და ბოლოს გაგიგებს. გაეცანით სქემას, საგანგაშო ფრაზებს და მშვიდ რეაქციას, რომლის წყალობითაც შვილი საუბარს არ შეწყვეტს თქვენთან.',
  },
  lead: {
    en: 'Online grooming is a slow con: an adult (or sometimes another minor) builds a real-feeling friendship with a child, step by step, in order to exploit it later. The good news is that grooming follows a script — and once you know the script, it becomes visible. This guide shows you the pattern, the phrases to listen for, and what to do without frightening or shaming your child.',
    ka: 'ონლაინ გრუმინგი ნელი თაღლითობაა: უფროსი (ზოგჯერ კი სხვა არასრულწლოვანი) ბავშვთან ნაბიჯ-ნაბიჯ აშენებს ერთი შეხედვით ნამდვილ მეგობრობას, რომ მოგვიანებით ის ბოროტად გამოიყენოს. კარგი ამბავი ის არის, რომ გრუმინგი სცენარით მიმდინარეობს — და როცა ამ სცენარს იცნობთ, ის თვალსაჩინო ხდება. ეს გზამკვლევი გაჩვენებთ სქემას, ფრაზებს, რომლებსაც ყური უნდა მოჰკრათ, და გასწავლით, როგორ იმოქმედოთ ისე, რომ შვილი არც შეაშინოთ და არც შეარცხვინოთ.',
  },
  body: [
    { type: 'h2', text: { en: 'It starts with kindness, not threats', ka: 'ის იწყება სიკეთით და არა მუქარით' } },
    {
      type: 'p',
      text: {
        en: 'The uncomfortable truth about grooming is that, from the child’s side, it feels like the best friendship they’ve ever had. Groomers are patient. They compliment, they remember birthdays, they listen for hours, they send small gifts or game currency. Above all, they offer the one thing every young teen craves: someone who says "you’re the only one who understands me — and I’m the only one who understands you." They are not looking for a naive child; they are looking for a normal one, and they work on the completely normal human need for attention.',
        ka: 'გრუმინგის შესახებ ყველაზე უხერხული სიმართლე ის არის, რომ ბავშვის მხრიდან ის საუკეთესო მეგობრობად აღიქმება. გრუმერები მომთმენები არიან. ისინი კომპლიმენტებს ეუბნებიან, ახსოვთ დაბადების დღეები, საათობით უსმენენ, უგზავნიან პატარა საჩუქრებს ან სათამაშო ვალუტას. მთავარი კი ის არის, რომ სთავაზობენ იმას, რაც ყველა მოზარდს ყველაზე მეტად სწყურია: ადამიანს, რომელიც ეუბნება — „მხოლოდ შენ მიგებ მე და მხოლოდ მე მიგებ შენ“. ისინი გულუბრყვილო ბავშვს კი არ ეძებენ — ჩვეულებრივს ეძებენ, და ყურადღების სრულიად ნორმალურ ადამიანურ მოთხოვნილებაზე მუშაობენ.',
      },
    },
    {
      type: 'p',
      text: {
        en: 'Forget the stereotype of the older man in a dark room. Groomers can be any age and any gender, and online they can appear to be anyone at all: many pose as teenagers, with borrowed photos, the right slang and the right games. The friendly 14-year-old "girl gamer" who has been teaming up with Nika for a month may be neither 14, nor a girl, nor a gamer.',
        ka: 'დაივიწყეთ სტერეოტიპი ბნელ ოთახში მჯდომი ასაკოვანი კაცის შესახებ. გრუმერი შეიძლება იყოს ნებისმიერი ასაკისა და სქესის, ონლაინ კი — საერთოდ ვინც გინდათ: ბევრი თინეიჯერად ასაღებს თავს ნასესხები ფოტოებით, სწორი ჟარგონითა და სწორი თამაშებით. მეგობრული 14 წლის „გეიმერი გოგო“, რომელიც უკვე ერთი თვეა ნიკასთან ერთად თამაშობს, შესაძლოა არც 14 წლის იყოს, არც გოგო და არც გეიმერი.',
      },
    },
    { type: 'h2', text: { en: 'The "move to another app" pattern', ka: 'სქემა „გადავიდეთ სხვა აპლიკაციაში“' } },
    {
      type: 'p',
      text: {
        en: 'Contact usually starts somewhere public and lightly moderated: the chat of an online game, comments under a video, a fan group. Very soon comes the suggestion to continue somewhere private — direct messages first, then an encrypted chat app. It is framed as a friendship upgrade ("it’s easier to talk there"), but the real purpose is isolation: no moderators, no witnesses, disappearing messages. Around the same time the requests for secrecy begin — first about small things, then about the friendship itself.',
        ka: 'კონტაქტი ჩვეულებრივ იწყება საჯარო და ზედაპირულად მოდერირებულ სივრცეში: ონლაინ თამაშის ჩატში, ვიდეოს კომენტარებში, ფან-ჯგუფში. ძალიან მალე ჩნდება შეთავაზება, საუბარი უფრო პირად სივრცეში გაგრძელდეს — ჯერ პირად შეტყობინებებში, შემდეგ დაშიფრულ ჩატ-აპლიკაციაში. ეს მეგობრობის „დაწინაურებად“ არის შეფუთული („იქ ლაპარაკი უფრო ადვილია“), მაგრამ ნამდვილი მიზანი იზოლაციაა: არც მოდერატორები, არც მოწმეები, თვითწაშლადი შეტყობინებები. დაახლოებით ამავე დროს იწყება საიდუმლოების თხოვნებიც — ჯერ წვრილმანებზე, შემდეგ თავად ამ მეგობრობაზე.',
      },
    },
    {
      type: 'callout',
      variant: 'note',
      title: { en: 'Red-flag phrases — teach your ears to catch these', ka: 'საგანგაშო ფრაზები — ასწავლეთ ყურს მათი დაჭერა' },
      items: [
        { en: '"Don’t tell your parents — they wouldn’t understand."', ka: '„მშობლებს ნუ ეტყვი — ისინი ვერ გაგიგებენ.“' },
        { en: '"You’re so mature for your age."', ka: '„შენს ასაკთან შედარებით ძალიან მოწიფული ხარ.“' },
        { en: '"This is our secret."', ka: '„ეს ჩვენი საიდუმლოა.“' },
        { en: '"Let’s move to another app — it’s more private there."', ka: '„გადავიდეთ სხვა აპლიკაციაში — იქ უფრო პირადულია.“' },
        { en: 'Asking to keep the friendship hidden from everyone.', ka: 'თხოვნა, რომ ეს მეგობრობა ყველასგან დამალული დარჩეს.' },
        { en: 'Requesting photos, video calls with the camera on, or a meeting in person.', ka: 'ფოტოების, ჩართული კამერით ვიდეოზარების ან პირადად შეხვედრის თხოვნა.' },
      ],
    },
    { type: 'h2', text: { en: 'Signs a child may be in this kind of contact', ka: 'ნიშნები, რომ ბავშვი შესაძლოა ასეთ კონტაქტში იყოს' } },
    {
      type: 'list',
      items: [
        { en: 'Unusual secrecy about one specific online friend, while being open about everyone else', ka: 'უჩვეულო გასაიდუმლოება ერთ კონკრეტულ ონლაინ მეგობართან დაკავშირებით, მაშინ როცა სხვებზე ღიად საუბრობს' },
        { en: 'New gifts, game currency, phone top-ups or money that the child can’t comfortably explain', ka: 'ახალი საჩუქრები, სათამაშო ვალუტა, ტელეფონის ბალანსის შევსება ან ფული, რომლის ახსნაც ბავშვს უჭირს' },
        { en: 'An older "friend" that no one in the family or at school has ever met', ka: 'უფროსი „მეგობარი“, რომელიც ოჯახში ან სკოლაში არავის უნახავს' },
        { en: 'Switching screens or hiding the phone when you come near — but only around one contact', ka: 'ეკრანის სწრაფი გადართვა ან ტელეფონის დამალვა თქვენს მიახლოებაზე — მაგრამ მხოლოდ ერთ კონტაქტთან მიმოწერისას' },
        { en: 'Mood swings tied to one person’s messages: elated, anxious, or withdrawn after chatting', ka: 'განწყობის ცვლილებები, რომლებიც ერთი ადამიანის შეტყობინებებს მიჰყვება: აღფრთოვანება, შფოთვა ან ჩაკეტვა მიმოწერის შემდეგ' },
      ],
    },
    {
      type: 'p',
      text: {
        en: 'One sign alone proves nothing — teens guard their privacy, and that’s healthy. What matters is the pattern, and the pattern circling around one particular person. That is the moment for a calm conversation, not for an interrogation.',
        ka: 'ერთი ნიშანი ცალკე აღებული არაფერს ამტკიცებს — მოზარდები პირად სივრცეს იცავენ და ეს ჯანსაღია. მნიშვნელოვანია ნიშნების ერთობლიობა, რომელიც ერთ კონკრეტულ ადამიანს უტრიალებს. სწორედ ეს არის მშვიდი საუბრის მომენტი — და არა დაკითხვის.',
      },
    },
    { type: 'h2', text: { en: 'What to do — without blame', ka: 'რა უნდა გააკეთოთ — დადანაშაულების გარეშე' } },
    {
      type: 'p',
      text: {
        en: 'Start from this fact and hold onto it: the child is never at fault. Grooming works precisely because an adult deliberately manipulated a child’s completely normal needs — friendship, attention, being taken seriously. Shame is the groomer’s best ally: a child who feels ashamed stays silent, and silence is exactly what the offender needs. Your calm is what breaks the scheme.',
        ka: 'დაიწყეთ ამ ფაქტით და მყარად დაიმახსოვრეთ: ბავშვი არასოდეს არის დამნაშავე. გრუმინგი სწორედ იმიტომ მუშაობს, რომ უფროსმა განზრახ იმანიპულირა ბავშვის სრულიად ნორმალური მოთხოვნილებებით — მეგობრობით, ყურადღებით, სერიოზულად აღქმის სურვილით. სირცხვილი გრუმერის საუკეთესო მოკავშირეა: შერცხვენილი ბავშვი დუმს, დუმილი კი ზუსტად ის არის, რაც დამნაშავეს სჭირდება. თქვენი სიმშვიდე არის ის, რაც ამ სქემას ამსხვრევს.',
      },
    },
    {
      type: 'callout',
      variant: 'script',
      title: { en: 'A non-accusatory opener', ka: 'საუბრის დასაწყისი დადანაშაულების გარეშე' },
      ps: [
        {
          en: '"I’ve noticed you’ve been chatting a lot with someone new lately. I’m not angry and you’re not in trouble — I’m just interested in your life. Who are they? How did you two meet?"',
          ka: '„შევამჩნიე, რომ ბოლო დროს ვიღაც ახალ ადამიანთან ბევრს მიმოწერ. არ ვბრაზობ და არაფერს გისაყვედურებ — უბრალოდ შენი ცხოვრება მაინტერესებს. ვინ არის? როგორ გაიცანით ერთმანეთი?“',
        },
      ],
    },
    {
      type: 'callout',
      variant: 'emergency',
      title: { en: 'If the red flags are real', ka: 'თუ საგანგაშო ნიშნები დადასტურდა' },
      ordered: true,
      items: [
        {
          en: 'Keep the conversation calm and thank your child for talking to you. Repeat that they did nothing wrong — the person on the other side did.',
          ka: 'ისაუბრეთ მშვიდად და მადლობა უთხარით შვილს გულახდილობისთვის. გაუმეორეთ, რომ მას არაფერი დაუშავებია — დამნაშავე ხაზის მეორე მხარეს მყოფი ადამიანია.',
        },
        {
          en: 'Never shame them for having trusted someone. Trust is not a mistake; it was used against them.',
          ka: 'არასოდეს შეარცხვინოთ იმის გამო, რომ ვინმეს ენდო. ნდობა შეცდომა არ არის — ის მის წინააღმდეგ გამოიყენეს.',
        },
        {
          en: 'Save the evidence before blocking: screenshots of the profile, username, and messages.',
          ka: 'დაბლოკვამდე შეინახეთ მტკიცებულებები: პროფილის, მომხმარებლის სახელისა და მიმოწერის სქრინშოტები.',
        },
        {
          en: 'Report the account to the platform, and report the case to the police — call 112 or contact the cyber-crime division of the Ministry of Internal Affairs of Georgia.',
          ka: 'ანგარიშის შესახებ შეატყობინეთ პლატფორმას, საქმის შესახებ კი პოლიციას — დარეკეთ 112-ზე ან მიმართეთ საქართველოს შინაგან საქმეთა სამინისტროს კიბერდანაშაულის სამმართველოს.',
        },
        {
          en: 'If your child agrees, involve the school psychologist so they have support in the weeks after.',
          ka: 'შვილის თანხმობით ჩართეთ სკოლის ფსიქოლოგი, რომ მომდევნო კვირებში მხარდაჭერა ჰქონდეს.',
        },
      ],
    },
    {
      type: 'callout',
      variant: 'dont',
      title: { en: 'What not to do', ka: 'რას არ უნდა აკეთებდეთ' },
      items: [
        {
          en: 'Don’t confront or message the groomer yourself — you may destroy evidence and warn them.',
          ka: 'თავად ნუ დაუპირისპირდებით და ნუ მისწერთ გრუმერს — შეიძლება მტკიცებულებები გაანადგუროთ და ის გააფრთხილოთ.',
        },
        {
          en: 'Don’t punish the child by taking away the internet — it confirms the groomer’s story that "your parents won’t understand".',
          ka: 'ნუ დასჯით ბავშვს ინტერნეტის აკრძალვით — ეს ადასტურებს გრუმერის ნათქვამს, რომ „მშობლები ვერ გაგიგებენ“.',
        },
        {
          en: 'Don’t ask "how could you not see it?" — adults fall for the very same manipulation every day.',
          ka: 'ნუ ჰკითხავთ „როგორ ვერ მიხვდი?“ — ზუსტად ამავე მანიპულაციას ყოველდღე უფროსებიც ებმებიან.',
        },
      ],
    },
    { type: 'h2', text: { en: 'Talk about the script before it appears', ka: 'ისაუბრეთ ამ სცენარზე მანამ, სანამ გამოჩნდება' } },
    {
      type: 'p',
      text: {
        en: 'The best protection is not surveillance — it is a child who knows the script and knows they can tell you anything. Explain the pattern once, calmly: some people online pretend to be friends in order to use kids; they always ask for secrets; and a request to keep something secret from parents is the biggest warning sign of all. A teen who has heard that from you, in your voice, is a very hard target.',
        ka: 'საუკეთესო დაცვა თვალთვალი კი არა, ბავშვია, რომელმაც ეს სცენარი იცის და იცის, რომ ყველაფერს გაგანდობთ. ერთხელ, მშვიდად აუხსენით სქემა: ონლაინ ზოგი ადამიანი მეგობრობას თამაშობს, რომ ბავშვები გამოიყენოს; ისინი ყოველთვის საიდუმლოს ითხოვენ; ხოლო თხოვნა, რაღაც მშობლებს დაუმალო, ყველაზე დიდი განგაშის ნიშანია. მოზარდი, რომელსაც ეს თქვენგან, თქვენი ხმით აქვს მოსმენილი, ძალიან რთული სამიზნეა.',
      },
    },
  ],
  sources: [
    'NCMEC — Online enticement & grooming: missingkids.org',
    'Child Mind Institute — monitoring teens’ social media: childmind.org/article/how-much-should-you-monitor-your-teens-social-media',
    'Common Sense Media — Digital Citizenship Curriculum: commonsense.org/education/digital-citizenship',
  ],
}
