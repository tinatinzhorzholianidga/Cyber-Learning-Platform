// B5 — Emergency playbook: "It already happened". Georgia-specific contacts.
export default {
  id: 'b5',
  shelf: 'B',
  order: 5,
  emoji: '🆘',
  color: '#e05780',
  priority: true,
  minutes: 8,
  mission: 'g4',
  title: {
    en: 'Emergency playbook: "It already happened"',
    ka: 'საგანგებო გეგმა: „უკვე მოხდა“',
  },
  teaser: {
    en: 'Numbered steps for the five worst moments — bullying, blackmail, a hacked account, a stranger — with the exact contacts in Georgia.',
    ka: 'ნაბიჯ-ნაბიჯ გეგმა ხუთი ყველაზე მძიმე სიტუაციისთვის — ბულინგი, შანტაჟი, გატეხილი ანგარიში, უცნობი — საქართველოს ზუსტი საკონტაქტო ინფორმაციით.',
  },
  lead: {
    en: 'Something bad has happened online and your child just told you — or you just found out. This page is deliberately short and numbered. Follow it from the top. You do not need to be a tech expert to do every step here well.',
    ka: 'ინტერნეტში რაღაც ცუდი მოხდა და შვილმა ახლახან გითხრათ — ან თავად გაიგეთ. ეს გვერდი განგებ არის მოკლე და დანომრილი. მიჰყევით თავიდან. აქ არცერთი ნაბიჯი არ საჭიროებს ტექნიკურ ცოდნას.',
  },
  body: [
    { type: 'h2', text: { en: 'Three rules that apply to everything', ka: 'სამი წესი, რომელიც ყველაფერზე ვრცელდება' } },
    {
      type: 'list',
      items: [
        {
          en: 'React calmly first, investigate second. "Thank you for telling me. We will fix this together" — then breathe.',
          ka: 'ჯერ მშვიდი რეაქცია, მერე გარკვევა. „მადლობა, რომ მითხარი. ერთად მოვაგვარებთ“ — და ამოისუნთქეთ.',
        },
        {
          en: 'Preserve evidence before anything is deleted: screenshots of messages, profiles, usernames, dates.',
          ka: 'შეინახეთ მტკიცებულებები, სანამ რამე წაიშლება: მიმოწერის, პროფილების, მომხმარებლის სახელების და თარიღების სქრინშოტები.',
        },
        {
          en: 'The child is not in trouble. Whatever they clicked, sent, or shared — the adult response that keeps them safe is support, not punishment.',
          ka: 'ბავშვი დამნაშავე არ არის. რაზეც არ უნდა დაეჭირა, რაც არ უნდა გაეგზავნა — მისი უსაფრთხოებისთვის სწორი პასუხი მხარდაჭერაა და არა დასჯა.',
        },
      ],
    },
    { type: 'h2', text: { en: 'If your child is being bullied online', ka: 'თუ თქვენს შვილს ონლაინ აბულინგებენ' } },
    {
      type: 'callout',
      variant: 'emergency',
      title: { en: 'Steps', ka: 'ნაბიჯები' },
      ordered: true,
      items: [
        { en: 'Screenshot the messages or posts, including usernames and dates.', ka: 'გადაუღეთ სქრინშოტები შეტყობინებებს ან პოსტებს — მომხმარებლის სახელებითა და თარიღებით.' },
        { en: 'Block the accounts and report them inside the app (every major platform has a report button).', ka: 'დაბლოკეთ ანგარიშები და დაარეპორტეთ აპშივე (ყველა დიდ პლატფორმას აქვს რეპორტის ღილაკი).' },
        { en: 'Do not reply and do not retaliate — replies feed it and muddy the evidence.', ka: 'ნუ უპასუხებთ და ნუ იძიებთ შურს — პასუხები აძლიერებს ბულინგს და აზიანებს მტკიცებულებას.' },
        { en: 'If classmates are involved, inform the class teacher or school administration with the screenshots.', ka: 'თუ თანაკლასელები არიან ჩართული, სქრინშოტებით მიმართეთ დამრიგებელს ან სკოლის ადმინისტრაციას.' },
        { en: 'If there are threats of violence, report to police: 112.', ka: 'თუ ძალადობის მუქარაა, შეატყობინეთ პოლიციას: 112.' },
      ],
    },
    { type: 'h2', text: { en: 'If your child is being blackmailed with an image', ka: 'თუ თქვენს შვილს ფოტოთი აშანტაჟებენ' } },
    {
      type: 'callout',
      variant: 'emergency',
      title: { en: 'Steps', ka: 'ნაბიჯები' },
      ordered: true,
      items: [
        { en: 'Say it out loud first: "This is not your fault." It is the single most protective sentence.', ka: 'ჯერ ხმამაღლა თქვით: „ეს შენი ბრალი არ არის.“ ეს ყველაზე დამცავი წინადადებაა.' },
        { en: 'Never pay and send nothing more — demands escalate after payment.', ka: 'არასოდეს გადაიხადოთ და აღარაფერი გააგზავნოთ — გადახდის შემდეგ მოთხოვნები იზრდება.' },
        { en: 'Screenshot everything, then block. Do not delete the conversation.', ka: 'გადაუღეთ ყველაფერს სქრინშოტი, შემდეგ დაბლოკეთ. მიმოწერას ნუ წაშლით.' },
        { en: 'Report to police (112 / MIA cyber-crime division) and to the platform. For under-18 images, use Take It Down: takeitdown.ncmec.org.', ka: 'შეატყობინეთ პოლიციას (112 / შსს კიბერდანაშაულის სამმართველო) და პლატფორმას. 18 წლამდე პირის ფოტოსთვის გამოიყენეთ Take It Down: takeitdown.ncmec.org.' },
        { en: 'Read the full sextortion guide on this site — it covers the next days, not just the first hour.', ka: 'წაიკითხეთ ამ საიტის სრული გზამკვლევი სექსტორციაზე — ის მომდევნო დღეებსაც მოიცავს და არა მხოლოდ პირველ საათს.' },
      ],
    },
    { type: 'h2', text: { en: 'If an account has been hacked', ka: 'თუ ანგარიში გატეხეს' } },
    {
      type: 'callout',
      variant: 'emergency',
      title: { en: 'Steps', ka: 'ნაბიჯები' },
      ordered: true,
      items: [
        { en: 'Try the platform’s account-recovery page immediately ("Forgot password" → "My account was hacked").', ka: 'მაშინვე სცადეთ პლატფორმის აღდგენის გვერდი („დაგავიწყდათ პაროლი“ → „ჩემი ანგარიში გატეხეს“).' },
        { en: 'Change the password on the linked email account first — that is the master key.', ka: 'ჯერ დაკავშირებული ელფოსტის პაროლი შეცვალეთ — ის მთავარი გასაღებია.' },
        { en: 'Turn on two-factor authentication as soon as access is back.', ka: 'წვდომის დაბრუნებისთანავე ჩართეთ ორფაქტორიანი ავთენტიფიკაცია.' },
        { en: 'Warn contacts: the hacker may message friends asking for money or codes.', ka: 'გააფრთხილეთ კონტაქტები: ჰაკერმა შესაძლოა მეგობრებს ფული ან კოდები სთხოვოს.' },
        { en: 'If money was stolen or the account is used for fraud, report to 112 / MIA cyber-crime division.', ka: 'თუ ფული მოიპარეს ან ანგარიშს თაღლითობისთვის იყენებენ, შეატყობინეთ 112-ზე / შსს კიბერდანაშაულის სამმართველოს.' },
      ],
    },
    { type: 'h2', text: { en: 'If an adult stranger has been messaging your child', ka: 'თუ უცნობი ზრდასრული სწერდა თქვენს შვილს' } },
    {
      type: 'callout',
      variant: 'emergency',
      title: { en: 'Steps', ka: 'ნაბიჯები' },
      ordered: true,
      items: [
        { en: 'Stay calm — your child did nothing wrong by being targeted.', ka: 'შეინარჩუნეთ სიმშვიდე — ის, რომ თქვენი შვილი სამიზნე გახდა, მისი ბრალი არ არის.' },
        { en: 'Save the conversation and the profile (screenshots, username, links).', ka: 'შეინახეთ მიმოწერა და პროფილი (სქრინშოტები, მომხმარებლის სახელი, ბმულები).' },
        { en: 'Do not let anyone confront or bait the stranger — not you, not older siblings.', ka: 'არავინ დაუპირისპირდეს და არ „გამოიჭიროს“ უცნობი — არც თქვენ, არც უფროსმა და-ძმამ.' },
        { en: 'Report the profile to the platform and to police (112 / MIA cyber-crime division), especially if meetings were suggested or images requested.', ka: 'დაარეპორტეთ პროფილი პლატფორმაზე და შეატყობინეთ პოლიციას (112 / შსს კიბერდანაშაულის სამმართველო) — განსაკუთრებით, თუ შეხვედრას სთავაზობდა ან ფოტოებს ითხოვდა.' },
        { en: 'If a meeting was arranged or took place, call 112 now.', ka: 'თუ შეხვედრა დაგეგმილი იყო ან შედგა, ახლავე დარეკეთ 112-ზე.' },
      ],
    },
    { type: 'h2', text: { en: 'Who to contact in Georgia', ka: 'ვის მიმართოთ საქართველოში' } },
    {
      type: 'list',
      items: [
        { en: '112 — the national emergency number; works for police, including online crimes against children.', ka: '112 — საგანგებო სიტუაციების ერთიანი ნომერი; მუშაობს პოლიციისთვის, მათ შორის ბავშვების წინააღმდეგ ჩადენილ ონლაინ დანაშაულებზე.' },
        { en: 'MIA cyber-crime division — the Ministry of Internal Affairs unit for online fraud, hacking, and blackmail (reachable via 112 or police.ge).', ka: 'შსს კიბერდანაშაულის სამმართველო — შინაგან საქმეთა სამინისტროს დანაყოფი ონლაინ თაღლითობაზე, გატეხვასა და შანტაჟზე (მიმართეთ 112-ის ან police.ge-ის მეშვეობით).' },
        { en: 'The platform itself — in-app "Report" is faster than most people expect for accounts targeting minors.', ka: 'თავად პლატფორმა — აპშივე „Report“ ღილაკი არასრულწლოვნებზე ორიენტირებული ანგარიშების შემთხვევაში მოსალოდნელზე სწრაფად მუშაობს.' },
        { en: 'Take It Down (takeitdown.ncmec.org) — free NCMEC service that blocks intimate images of under-18s on major platforms.', ka: 'Take It Down (takeitdown.ncmec.org) — NCMEC-ის უფასო სერვისი, რომელიც 18 წლამდე პირთა ინტიმურ ფოტოებს დიდ პლატფორმებზე ბლოკავს.' },
        { en: 'The school psychologist — for the weeks after; recovery is emotional, not just technical.', ka: 'სკოლის ფსიქოლოგი — მომდევნო კვირეებისთვის; აღდგენა ემოციური პროცესია და არა მხოლოდ ტექნიკური.' },
      ],
    },
    {
      type: 'callout',
      variant: 'dont',
      title: { en: 'What never to do', ka: 'რა არასოდეს გააკეთოთ' },
      items: [
        { en: 'Never pay a blackmailer, "just this once".', ka: 'არასოდეს გადაუხადოთ შანტაჟისტს — არც „ერთხელ, გამონაკლისად“.' },
        { en: 'Never delete evidence in anger or embarrassment.', ka: 'არასოდეს წაშალოთ მტკიცებულება ბრაზისა თუ უხერხულობის გამო.' },
        { en: 'Never confiscate the phone as the first response — it punishes the victim and hides the next incident.', ka: 'პირველ საპასუხო ნაბიჯად არასოდეს ჩამოართვათ ტელეფონი — ეს მსხვერპლს სჯის და შემდეგ ინციდენტს მალავს.' },
        { en: 'Never promise to keep a serious disclosure secret from everyone — say instead: "We will only involve the people who can help."', ka: 'არასოდეს დაპირდეთ, რომ სერიოზულ ამბავს ყველასგან საიდუმლოდ შეინახავთ — თქვით: „ჩავრთავთ მხოლოდ მათ, ვინც დაგვეხმარება.“' },
      ],
    },
  ],
  sources: [
    'NCMEC — Sextortion & Take It Down: missingkids.org, takeitdown.ncmec.org',
    'UNICEF Georgia — keeping children safe online: unicef.org/georgia',
    'Ministry of Internal Affairs of Georgia: police.ge · Emergency: 112',
  ],
}
