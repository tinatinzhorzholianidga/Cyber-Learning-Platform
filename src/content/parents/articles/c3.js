// C3 - Handling a disclosure. Victim-first framing per spec section 4:
// never blame, never shame, always a concrete next step. Georgia-specific duties.
export default {
  id: 'c3',
  shelf: 'C',
  order: 3,
  emoji: '🤝',
  color: '#e05780',
  minutes: 7,
  title: {
    en: 'Handling a disclosure: when a student tells you something happened',
    ka: 'როგორ მივიღოთ განდობა: როცა მოსწავლე გეუბნებათ, რომ რაღაც მოხდა',
  },
  teaser: {
    en: 'After any online-safety lesson, expect a student at your desk. The first sixty seconds decide everything - here is exactly what to say and do.',
    ka: 'ონლაინ უსაფრთხოების ნებისმიერი გაკვეთილის შემდეგ ელოდეთ მოსწავლეს თქვენს მაგიდასთან. პირველი სამოცი წამი ყველაფერს წყვეტს - აქ ზუსტად წერია, რა თქვათ და რა გააკეთოთ.',
  },
  lead: {
    en: 'This is the most important article on this shelf. A good online-safety lesson does its job: it tells students that what happened to them has a name and that adults can help. So after Upstander, The Blackmail Trap, or Stranger Signals, expect disclosures - bullying, blackmail, an adult who has been messaging them. You do not need to be a psychologist or an investigator. You need to be the first calm adult in the chain, and this article shows you how.',
    ka: 'ეს ამ თაროს ყველაზე მნიშვნელოვანი სტატიაა. კარგი გაკვეთილი ონლაინ უსაფრთხოებაზე თავის საქმეს აკეთებს: მოსწავლეებს ეუბნება, რომ იმას, რაც მათ გადახდათ, სახელი აქვს და რომ უფროსებს დახმარება შეუძლიათ. ამიტომ „მხარში მდგომის“, „შანტაჟის ხაფანგის“ ან „უცნობის სიგნალების“ შემდეგ ელოდეთ განდობებს - ბულინგი, შანტაჟი, უფროსი, რომელიც მოსწავლეს მიწერს. თქვენ არც ფსიქოლოგობა გჭირდებათ და არც გამომძიებლობა. გჭირდებათ, იყოთ პირველი მშვიდი უფროსი ამ ჯაჭვში - და ეს სტატია გაჩვენებთ, როგორ.',
  },
  body: [
    { type: 'h2', text: { en: 'The first sixty seconds', ka: 'პირველი სამოცი წამი' } },
    {
      type: 'p',
      text: {
        en: 'A student who comes to you has usually rehearsed it for days and is watching your face for one thing: will this adult panic, blame me, or help me? So the job of the first minute is small and strict. Stay calm, even if what you hear is alarming. Listen to the end without interrupting or reaching for the phone. Believe them - false disclosures are rare, and doubt in your voice ends the conversation. And thank them, explicitly, because telling you was the hardest step they will take.',
        ka: 'მოსწავლე, რომელიც თქვენთან მოდის, ამას ჩვეულებრივ დღეების განმავლობაში იმეორებდა გუნებაში და ახლა თქვენს სახეს ერთი კითხვით აკვირდება: ეს უფროსი აპანიკდება, დამადანაშაულებს თუ დამეხმარება? ამიტომ პირველი წუთის ამოცანა მცირეა და მკაცრი. შეინარჩუნეთ სიმშვიდე, თუნდაც ის, რასაც ისმენთ, შემაშფოთებელი იყოს. მოუსმინეთ ბოლომდე - შეუწყვეტლად და ტელეფონისკენ ხელის უტაცებლად. დაუჯერეთ - ცრუ განდობები იშვიათია, თქვენს ხმაში გამკრთალი ეჭვი კი საუბარს წყვეტს. და მადლობა უთხარით, პირდაპირ, რადგან თქვენთან მოსვლა ყველაზე რთული ნაბიჯი იყო, რასაც ის გადადგამდა.',
      },
    },
    {
      type: 'callout',
      variant: 'script',
      title: { en: 'Say this, word for word', ka: 'თქვით ეს, სიტყვასიტყვით' },
      ps: [
        {
          en: '"Thank you for telling me. I believe you, and this is not your fault. You did the right thing coming to me. I will only involve people who can help - and we will take the next step together."',
          ka: '„მადლობა, რომ მითხარი. მჯერა შენი, და ეს შენი ბრალი არ არის. სწორად მოიქეცი, რომ ჩემთან მოხვედი. საქმეში მხოლოდ იმ ადამიანებს ჩავრთავ, ვინც დაგეხმარება - და შემდეგ ნაბიჯს ერთად გადავდგამთ.“',
        },
      ],
    },
    { type: 'h2', text: { en: 'Honesty about secrecy', ka: 'გულწრფელობა საიდუმლოს შესახებ' } },
    {
      type: 'p',
      text: {
        en: 'Students often open with "promise you won’t tell anyone." Never promise total secrecy - you cannot keep that promise, and a broken one does more damage than an honest refusal. The honest version is in the script above: "I will only involve people who can help." If they push, explain who that means - the school psychologist, and for crimes, the police - and that it will never mean classmates, the whole staff room, or a public scene. Control over who knows is exactly what was taken from them; give back as much of it as the law and their safety allow.',
        ka: 'მოსწავლეები საუბარს ხშირად ასე იწყებენ: „დამპირდით, რომ არავის ეტყვით“. სრულ საიდუმლოს ნურასოდეს დაჰპირდებით - ამ დაპირების შესრულება არ შეგიძლიათ, გატეხილი დაპირება კი გულწრფელ უარზე მეტ ზიანს აყენებს. გულწრფელი ვერსია ზემოთ, სცენარშია: „საქმეში მხოლოდ იმ ადამიანებს ჩავრთავ, ვინც დაგეხმარება“. თუ დაჟინებით ითხოვს, აუხსენით, ვის ნიშნავს ეს - სკოლის ფსიქოლოგს, დანაშაულის შემთხვევაში კი პოლიციას - და რომ ეს არასოდეს ნიშნავს თანაკლასელებს, მთელ სამასწავლებლოს ან საჯარო სცენას. კონტროლი იმაზე, თუ ვინ იცის, სწორედ ის არის, რაც მას წაართვეს; დაუბრუნეთ ამ კონტროლიდან იმდენი, რამდენსაც კანონი და მისი უსაფრთხოება უშვებს.',
      },
    },
    {
      type: 'callout',
      variant: 'dont',
      title: { en: 'Never do these', ka: 'ეს არასოდეს გააკეთოთ' },
      items: [
        {
          en: 'Never ask "why did you send that?" or any question that starts with why-did-you. Blame - even accidental - guarantees this student, and everyone they talk to, stays silent next time.',
          ka: 'არასოდეს ჰკითხოთ „რატომ გააგზავნე?“ - და საერთოდ არაფერი, რაც „რატომ“-ით იწყება და მოსწავლის ქმედებას ეხება. დადანაშაულება - თუნდაც უნებლიე - გარანტიაა, რომ ეს მოსწავლე და ყველა, ვისაც ის ესაუბრება, შემდეგ ჯერზე დუმილს აირჩევს.',
        },
        {
          en: 'Never promise total secrecy, and never confiscate the phone or delete anything "to make it go away".',
          ka: 'არასოდეს დაჰპირდეთ სრულ საიდუმლოს და არასოდეს ჩამოართვათ ტელეფონი ან წაშალოთ რამე იმ იმედით, რომ „პრობლემა გაქრება“.',
        },
        {
          en: 'Never confront the alleged offender yourself, question other students about it, or mention the case in front of the class - even anonymized, the class will know.',
          ka: 'არასოდეს დაუპირისპირდეთ სავარაუდო დამნაშავეს პირადად, ნუ დაჰკითხავთ ამაზე სხვა მოსწავლეებს და ნუ ახსენებთ შემთხვევას კლასის წინაშე - ანონიმურადაც კი, კლასი მიხვდება.',
        },
        {
          en: 'Never carry it alone. A disclosure is the start of a procedure, not a secret between you and the student.',
          ka: 'არასოდეს ზიდოთ ეს მარტო. განდობა პროცედურის დასაწყისია და არა საიდუმლო თქვენსა და მოსწავლეს შორის.',
        },
      ],
    },
    { type: 'h2', text: { en: 'The steps, in order', ka: 'ნაბიჯები, თანმიმდევრობით' } },
    {
      type: 'callout',
      variant: 'emergency',
      title: { en: 'From first words to follow-up', ka: 'პირველი სიტყვებიდან შემდგომ ზრუნვამდე' },
      ordered: true,
      items: [
        {
          en: 'Listen, believe, thank. Use the script. Do not investigate or interrogate - your role is first contact, not detective.',
          ka: 'მოუსმინეთ, დაუჯერეთ, მადლობა უთხარით. გამოიყენეთ სცენარი. ნუ გამოიძიებთ და ნუ დაჰკითხავთ - თქვენი როლი პირველი კონტაქტია და არა დეტექტივი.',
        },
        {
          en: 'Be honest about confidentiality: "I will only involve people who can help." No promises of total secrecy.',
          ka: 'იყავით გულწრფელი კონფიდენციალურობაზე: „საქმეში მხოლოდ იმ ადამიანებს ჩავრთავ, ვინც დაგეხმარება“. სრული საიდუმლოს დაპირება - არა.',
        },
        {
          en: 'Preserve evidence. Nothing gets deleted - no messages, no photos, no accounts, even if the student is ashamed of them. If appropriate, take screenshots together, with the student present, and note usernames, platforms, and dates. Blocking is fine; deleting destroys the case.',
          ka: 'შეინახეთ მტკიცებულებები. არაფერი წაიშალოს - არც შეტყობინებები, არც ფოტოები, არც ანგარიშები, მაშინაც კი, თუ მოსწავლეს მათი რცხვენია. თუ ეს მიზანშეწონილია, სქრინშოტები ერთად, მოსწავლის თანდასწრებით გადაუღეთ და ჩაინიშნეთ მომხმარებლის სახელები, პლატფორმები და თარიღები. დაბლოკვა შეიძლება; წაშლა საქმეს ანადგურებს.',
        },
        {
          en: 'Inform the school psychologist and the administration the same day, following your school’s child-protection procedure. This is a duty, not an option - and it is also what protects you.',
          ka: 'იმავე დღეს შეატყობინეთ სკოლის ფსიქოლოგსა და ადმინისტრაციას, თქვენი სკოლის ბავშვთა დაცვის პროცედურის შესაბამისად. ეს მოვალეობაა და არა არჩევანი - და ესვე იცავს თქვენც.',
        },
        {
          en: 'If it is a crime - blackmail or sextortion, grooming, threats of violence - it goes to the police: call 112 or contact the cyber-crime division of the Ministry of Internal Affairs of Georgia. If an intimate image of a person under 18 is involved, NCMEC’s free Take It Down service (takeitdown.ncmec.org) can block it on major platforms.',
          ka: 'თუ ეს დანაშაულია - შანტაჟი ან სექსტორცია, გრუმინგი, ძალადობის მუქარა - საქმე პოლიციას გადაეცემა: დარეკეთ 112-ზე ან მიმართეთ საქართველოს შინაგან საქმეთა სამინისტროს კიბერდანაშაულის სამმართველოს. თუ საქმე 18 წლამდე პირის ინტიმურ ფოტოს ეხება, NCMEC-ის უფასო სერვისს Take It Down (takeitdown.ncmec.org) მისი დაბლოკვა დიდ პლატფორმებზე შეუძლია.',
        },
        {
          en: 'Follow up - in a few days, and again in the following weeks. A quiet "how are things now?" in a corridor tells the student the adult who helped has not forgotten them.',
          ka: 'დაინტერესდით შემდგომაც - რამდენიმე დღეში და კიდევ ერთხელ მომდევნო კვირებში. ჩუმი „როგორ არის ახლა საქმეები?“ დერეფანში მოსწავლეს ეუბნება, რომ უფროსს, რომელიც დაეხმარა, ის არ დავიწყებია.',
        },
      ],
    },
    { type: 'h2', text: { en: 'Recovery is not one conversation', ka: 'გამოჯანმრთელება ერთი საუბარი არ არის' } },
    {
      type: 'p',
      text: {
        en: 'The formal steps may be over in a week; the student’s recovery will not be. Watch quietly over the following month: attendance, mood, whether they sit alone. Coordinate with the psychologist about what you should and should not bring up. And keep the classroom a safe place - if the case involved classmates, your steadiness in how you run the room matters more than anything you say about it.',
        ka: 'ფორმალური ნაბიჯები შესაძლოა ერთ კვირაში დასრულდეს; მოსწავლის გამოჯანმრთელება - არა. მომდევნო თვეში ჩუმად დააკვირდით: დასწრებას, განწყობას, იმას, მარტო ზის თუ არა. შეათანხმეთ ფსიქოლოგთან, რა უნდა წამოჭრათ და რა - არა. და შეინარჩუნეთ საკლასო ოთახი უსაფრთხო სივრცედ - თუ საქმეში თანაკლასელები იყვნენ ჩართული, თქვენი სიმშვიდე გაკვეთილის წარმართვისას ბევრად მეტს ნიშნავს, ვიდრე ნებისმიერი ნათქვამი სიტყვა.',
      },
    },
    { type: 'h2', text: { en: 'And you', ka: 'და თქვენ' } },
    {
      type: 'p',
      text: {
        en: 'Hearing a disclosure is heavy, and teachers routinely underestimate what it takes out of them. Talking the case through with the school psychologist is not only allowed, it is good practice - for you, not just for the student. You were the first link in the chain, and being first is enough. You are not required to be the whole chain.',
        ka: 'განდობის მოსმენა მძიმეა, და მასწავლებლები ხშირად ვერ აფასებენ, რამდენ ძალას ართმევს ეს მათ. საქმის განხილვა სკოლის ფსიქოლოგთან არა მხოლოდ დასაშვებია - კარგი პრაქტიკაა, თქვენთვისაც და არა მხოლოდ მოსწავლისთვის. თქვენ ამ ჯაჭვის პირველი რგოლი იყავით, და პირველობა საკმარისია. მთელი ჯაჭვი თქვენ არ უნდა იყოთ.',
      },
    },
  ],
  sources: [
    'NCMEC - Sextortion: missingkids.org/theissues/sextortion',
    'NCMEC - Take It Down: takeitdown.ncmec.org',
    'UNICEF Georgia - keeping children safe online: unicef.org/georgia',
  ],
}
