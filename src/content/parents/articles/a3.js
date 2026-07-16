// A3 - Sextortion & blackmail (PRIORITY). NCMEC victim-first framing:
// never blame, never shame, always a concrete next step and a trusted adult.
export default {
  id: 'a3',
  shelf: 'A',
  order: 3,
  emoji: '🚨',
  color: '#e05780',
  priority: true,
  minutes: 7,
  mission: 'g4',
  title: {
    en: 'Sextortion & blackmail: what every parent must know',
    ka: 'სექსტორცია და შანტაჟი: რა უნდა იცოდეს ყველა მშობელმა',
  },
  teaser: {
    en: 'The fastest-growing threat to teens - and the script that saves lives: never pay, don’t delete, it’s not their fault.',
    ka: 'ყველაზე სწრაფად მზარდი საფრთხე მოზარდებისთვის - და სიტყვები, რომლებიც შველის: არასოდეს გადაიხადო, არ წაშალო, ეს მისი ბრალი არ არის.',
  },
  lead: {
    en: 'Sextortion is blackmail with an intimate image: someone tricks a teen into sending a photo, then threatens to share it unless they pay or send more. It is frightening - and it is survivable. Teens get through this when one adult reacts calmly. This guide is how to be that adult.',
    ka: 'სექსტორცია არის შანტაჟი ინტიმური ფოტოთი: ვიღაც მოზარდს მოტყუებით ფოტოს გამოგზავნას აიძულებს, შემდეგ კი ემუქრება გავრცელებით, თუ ფულს არ გადაიხდის ან მეტს არ გაუგზავნის. ეს საშინელებაა - მაგრამ დაძლევადია. მოზარდები ამას გადაურჩებიან, როცა ერთი უფროსი მაინც მშვიდად რეაგირებს. ეს გზამკვლევი გასწავლით, როგორ იყოთ ის უფროსი.',
  },
  body: [
    { type: 'h2', text: { en: 'How it happens - and how fast', ka: 'როგორ ხდება - და რამდენად სწრაფად' } },
    {
      type: 'p',
      text: {
        en: 'The pattern is depressingly consistent. A friendly stranger - usually posing as an attractive peer - adds the teen on Instagram, Snapchat, or in a game chat. They flirt, they seem real, they send a photo "of themselves" first. Then they ask for one back. The moment an image is sent, the tone flips: pay now, or everyone you know sees this.',
        ka: 'სქემა თითქმის ყოველთვის ერთნაირია. „მეგობრული“ უცნობი - ჩვეულებრივ, მიმზიდველი თანატოლის როლში - მოზარდს ამატებს Instagram-ზე, Snapchat-ზე ან თამაშის ჩატში. ეფლირტავება, დამაჯერებლად გამოიყურება, ჯერ თვითონ აგზავნის „საკუთარ“ ფოტოს. შემდეგ სანაცვლოს ითხოვს. როგორც კი ფოტო გაიგზავნება, ტონი მყისიერად იცვლება: გადაიხადე ახლავე, თორემ ყველა ნაცნობი ამას ნახავს.',
      },
    },
    {
      type: 'p',
      text: {
        en: 'Two things surprise most parents. First, the speed: this often goes from "hi" to threats in under an hour - sometimes in minutes. Second, the target: financial sextortion overwhelmingly hits teenage boys, who are least likely to tell anyone. Girls are targeted too, more often for additional images than money.',
        ka: 'ორი რამ აოცებს მშობლების უმეტესობას. პირველი - სისწრაფე: „გამარჯობიდან“ მუქარამდე ხშირად ერთ საათზე ნაკლები გადის, ზოგჯერ - წუთები. მეორე - სამიზნე: ფინანსური სექსტორცია ძირითადად თინეიჯერ ბიჭებს ხვდებათ, რომლებიც ყველაზე იშვიათად უზიარებენ ამას ვინმეს. გოგოებიც სამიზნეები არიან - მათგან უფრო ხშირად დამატებით ფოტოებს ითხოვენ, ვიდრე ფულს.',
      },
    },
    {
      type: 'callout',
      variant: 'note',
      title: { en: 'The scale', ka: 'მასშტაბი' },
      ps: [
        {
          en: 'Reports of financial sextortion to NCMEC rose by more than 300% between 2021 and 2023, and teen boys are now the primary target. Multiple teen deaths have been linked to these schemes - which is exactly why the calm-adult script below matters.',
          ka: 'NCMEC-ში ფინანსური სექსტორციის შეტყობინებები 2021-2023 წლებში 300%-ზე მეტით გაიზარდა, და მთავარი სამიზნე ახლა თინეიჯერი ბიჭები არიან. ამ სქემებს არაერთი მოზარდის სიცოცხლე ემსხვერპლა - სწორედ ამიტომ არის მნიშვნელოვანი ქვემოთ მოცემული „მშვიდი უფროსის“ სცენარი.',
        },
      ],
    },
    { type: 'h2', text: { en: 'Warning signs', ka: 'გამაფრთხილებელი ნიშნები' } },
    {
      type: 'list',
      items: [
        { en: 'Sudden panic, dread, or tears after checking the phone', ka: 'უეცარი პანიკა, შიში ან ცრემლები ტელეფონის შემოწმების შემდეგ' },
        { en: 'Abruptly deleting accounts or going unusually quiet online', ka: 'ანგარიშების მოულოდნელი წაშლა ან უჩვეულო სიჩუმე ონლაინ სივრცეში' },
        { en: 'Asking for money, gift cards, or crypto without a clear reason', ka: 'ფულის, სასაჩუქრე ბარათების ან კრიპტოვალუტის თხოვნა გაუგებარი მიზეზით' },
        { en: 'Withdrawing from friends and family; sleeping badly', ka: 'მეგობრებისა და ოჯახისგან გარიდება; ცუდი ძილი' },
        { en: 'Hints like "I did something stupid" or "you would hate me"', ka: 'ფრაზები, როგორიცაა „სისულელე ჩავიდინე“ ან „შემძულებდი, რომ იცოდე“' },
      ],
    },
    { type: 'h2', text: { en: 'If it has already happened: the playbook', ka: 'თუ უკვე მოხდა: სამოქმედო გეგმა' } },
    {
      type: 'callout',
      variant: 'emergency',
      title: { en: 'Do these five things, in this order', ka: 'გააკეთეთ ეს ხუთი რამ, ამ თანმიმდევრობით' },
      ordered: true,
      items: [
        {
          en: 'Stay calm and thank them for telling you. Your first sentence decides whether they ever come to you again.',
          ka: 'შეინარჩუნეთ სიმშვიდე და მადლობა უთხარით, რომ გაგანდოთ. თქვენი პირველი წინადადება წყვეტს, მოგმართავენ თუ არა ოდესმე კიდევ.',
        },
        {
          en: 'Never pay, and send nothing more. Paying does not stop the threats - NCMEC and FBI case data show demands escalate after payment.',
          ka: 'არასოდეს გადაიხადოთ და აღარაფერი გააგზავნოთ. გადახდა მუქარას არ აჩერებს - NCMEC-ისა და FBI-ის მონაცემებით, გადახდის შემდეგ მოთხოვნები იზრდება.',
        },
        {
          en: 'Block, but do not delete. Screenshot the profile, username, and messages first - this is evidence for police.',
          ka: 'დაბლოკეთ, მაგრამ არ წაშალოთ. ჯერ გადაუღეთ სქრინშოტები პროფილს, მომხმარებლის სახელსა და მიმოწერას - ეს მტკიცებულებაა პოლიციისთვის.',
        },
        {
          en: 'Report it: to the platform, and to the police - call 112 or contact the cyber-crime division of the Ministry of Internal Affairs of Georgia. If the child is under 18, use NCMEC’s free Take It Down service (takeitdown.ncmec.org) to have the image blocked on major platforms.',
          ka: 'შეატყობინეთ: პლატფორმას და პოლიციას - დარეკეთ 112-ზე ან მიმართეთ საქართველოს შინაგან საქმეთა სამინისტროს კიბერდანაშაულის სამმართველოს. თუ ბავშვი 18 წლამდეა, გამოიყენეთ NCMEC-ის უფასო სერვისი Take It Down (takeitdown.ncmec.org), რომელიც ფოტოს დიდ პლატფორმებზე დაბლოკავს.',
        },
        {
          en: 'Get support. Tell the school psychologist if your child agrees; keep repeating that the criminal is the one who did something wrong, not them.',
          ka: 'იზრუნეთ მხარდაჭერაზე. შვილის თანხმობით ესაუბრეთ სკოლის ფსიქოლოგს; გაუმეორეთ, რომ დანაშაული ჩაიდინა შანტაჟისტმა და არა მან.',
        },
      ],
    },
    {
      type: 'callout',
      variant: 'script',
      title: { en: 'Say this, word for word', ka: 'თქვით ეს, სიტყვასიტყვით' },
      ps: [
        {
          en: '"This is not your fault. You are not in trouble. I’m glad you told me - we will handle this together, and it will be okay."',
          ka: '„ეს შენი ბრალი არ არის. არავინ გსაყვედურობს. მიხარია, რომ მითხარი - ამას ერთად მოვაგვარებთ და ყველაფერი კარგად იქნება.“',
        },
      ],
    },
    { type: 'h2', text: { en: 'Why "never pay" is the rule', ka: 'რატომ არის წესი „არასოდეს გადაიხადო“' } },
    {
      type: 'p',
      text: {
        en: 'Paying feels like the fast way out. It isn’t. Offenders run dozens of victims at once; a teen who pays is marked as someone who pays, and the demands continue or grow. The threats themselves are usually bluffs - sharing the image gains the offender nothing once the money stops. Everything improves the moment a trusted adult is involved and the offender is blocked and reported.',
        ka: 'გადახდა სწრაფ გამოსავლად ჩანს. ეს ასე არ არის. შანტაჟისტები ერთდროულად ათეულობით მსხვერპლთან „მუშაობენ“; ვინც ერთხელ გადაიხდის, მას „გადამხდელად“ ინიშნავენ და მოთხოვნები გრძელდება ან იზრდება. მუქარა ხშირად ბლეფია - ფოტოს გავრცელება შანტაჟისტს არაფერს აძლევს, როცა ფული აღარ შემოდის. ყველაფერი უმჯობესდება იმ წუთიდან, როცა საქმეში სანდო უფროსი ერთვება, შანტაჟისტი კი დაბლოკილი და გაცხადებულია.',
      },
    },
    { type: 'h2', text: { en: 'Talk about it before it happens', ka: 'ისაუბრეთ ამაზე მანამ, სანამ მოხდება' } },
    {
      type: 'p',
      text: {
        en: 'One two-minute conversation dramatically changes the odds, because the single biggest risk factor is silence. Teens who know that (a) this scam exists and (b) their parent will not explode, tell someone early - before paying, before sending more.',
        ka: 'ერთი ორწუთიანი საუბარი მკვეთრად ცვლის შანსებს, რადგან ყველაზე დიდი რისკფაქტორი დუმილია. მოზარდები, რომლებმაც იციან, რომ (ა) ასეთი თაღლითობა არსებობს და (ბ) მშობელი არ აფეთქდება, ადრევე ეუბნებიან ვინმეს - გადახდამდე და მეტის გაგზავნამდე.',
      },
    },
    {
      type: 'callout',
      variant: 'script',
      title: { en: 'A no-drama opener', ka: 'მშვიდი დასაწყისი საუბრისთვის' },
      ps: [
        {
          en: '"I read about a scam where someone pretends to be a cute girl or guy, asks for a photo, then demands money. It’s hitting a lot of teens. If anything like that ever happens to you or a friend - even if a photo was already sent - come to me. You will never be in trouble for telling me."',
          ka: '„წავიკითხე თაღლითობაზე, სადაც ვიღაც თავს ლამაზ გოგოდ ან ბიჭად ასაღებს, ფოტოს ითხოვს და მერე ფულს მოითხოვს. ბევრ მოზარდს ემართება. თუ მსგავსი რამ ოდესმე შენ ან შენს მეგობარს დაგემართებათ - ფოტო გაგზავნილიც რომ იყოს - მოდი ჩემთან. იმისთვის, რომ მეტყვი, არასოდეს დაისჯები.“',
        },
      ],
    },
    {
      type: 'callout',
      variant: 'dont',
      title: { en: 'What not to do', ka: 'რას არ უნდა აკეთებდეთ' },
      items: [
        {
          en: 'Don’t punish by confiscating the phone - it teaches them to hide the next crisis.',
          ka: 'ნუ დასჯით ტელეფონის ჩამორთმევით - ეს ასწავლის, რომ შემდეგი კრიზისი დამალოს.',
        },
        {
          en: 'Don’t ask "why would you send that?" - blame guarantees silence next time.',
          ka: 'ნუ ჰკითხავთ „რატომ გააგზავნე?“ - დადანაშაულება მომავალში დუმილის გარანტიაა.',
        },
        {
          en: 'Don’t contact or threaten the blackmailer yourself - preserve evidence and let police work.',
          ka: 'თავად ნუ დაუკავშირდებით და ნუ დაემუქრებით შანტაჟისტს - შეინახეთ მტკიცებულებები და საქმე პოლიციას მიანდეთ.',
        },
      ],
    },
  ],
  sources: [
    'NCMEC - Sextortion: missingkids.org/theissues/sextortion',
    'FBI - Financially motivated sextortion alerts: fbi.gov',
    'NCMEC - Take It Down: takeitdown.ncmec.org',
  ],
}
