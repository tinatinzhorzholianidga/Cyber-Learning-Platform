// C1 - Classroom mode: run any Guardian mission on one projector.
// Teacher-facing. Ten ready discussion questions, one per mission G1-G10.
export default {
  id: 'c1',
  shelf: 'C',
  order: 1,
  emoji: '📽️',
  color: '#5b8cff',
  minutes: 5,
  mission: 'g1',
  title: {
    en: 'Classroom mode: run any mission on a projector',
    ka: 'საკლასო რეჟიმი: ჩაატარეთ ნებისმიერი მისია პროექტორით',
  },
  teaser: {
    en: 'One computer, one projector, one class that votes on every choice. No lab, no student accounts, no grading - just fifteen well-spent minutes.',
    ka: 'ერთი კომპიუტერი, ერთი პროექტორი და კლასი, რომელიც ყველა არჩევანზე კენჭს უყრის. არც კომპიუტერული ლაბორატორია, არც მოსწავლეთა ანგარიშები, არც ნიშნები - მხოლოდ თხუთმეტი კარგად დახარჯული წუთი.',
  },
  lead: {
    en: 'Every Guardian mission was designed to work on the oldest projector in the school. You need one computer, one screen the class can see, and a piece of chalk for counting votes. This article gives you the format, a rhythm that fits a fifteen-minute slot, and one ready-made discussion question for each of the ten missions.',
    ka: 'დამცველის ყველა მისია ისეა შექმნილი, რომ სკოლის ყველაზე ძველ პროექტორზეც იმუშაოს. გჭირდებათ ერთი კომპიუტერი, ერთი ეკრანი, რომელსაც კლასი ხედავს, და ცარცი ხმების დასათვლელად. ეს სტატია მოგცემთ ფორმატს, რიტმს, რომელიც თხუთმეტწუთიან მონაკვეთში ეტევა, და თითო მზა სადისკუსიო შეკითხვას ათივე მისიისთვის.',
  },
  body: [
    { type: 'h2', text: { en: 'The format: one screen, many voices', ka: 'ფორმატი: ერთი ეკრანი, ბევრი ხმა' } },
    {
      type: 'p',
      text: {
        en: 'Open any mission on the teacher computer and put it on the projector. Read each scenario aloud - or better, hand the reading to a student. When the mission asks for a decision, stop. The class votes on each choice before you click: a show of hands works, or write the option letters on the board and tally. Only then click the winning answer and let the mission react. The vote is the whole trick: students who have publicly committed to an answer actually care what happens next.',
        ka: 'გახსენით ნებისმიერი მისია მასწავლებლის კომპიუტერზე და გაუშვით პროექტორზე. წაიკითხეთ თითოეული სცენარი ხმამაღლა - ან, კიდევ უკეთესი, კითხვა მოსწავლეს მიანდეთ. როცა მისია გადაწყვეტილებას მოითხოვს, შეჩერდით. სანამ დააწკაპუნებთ, კლასმა თითოეულ არჩევანზე კენჭი უნდა იყაროს: ხელის აწევა საკმარისია, ან დაფაზე დაწერეთ ვარიანტების ასოები და დაითვალეთ ხმები. მხოლოდ ამის შემდეგ დააწკაპუნეთ გამარჯვებულ პასუხზე და მიეცით მისიას რეაგირების საშუალება. კენჭისყრა მთელი ხრიკის გულია: მოსწავლეებს, რომლებმაც პასუხი საჯაროდ აირჩიეს, ნამდვილად აინტერესებთ, რა მოხდება შემდეგ.',
      },
    },
    {
      type: 'p',
      text: {
        en: 'When the class votes wrong, do not hurry past it. A wrong majority vote is the best material you will get all lesson: it shows you exactly which trick works on your students, live, with no test needed. Say so out loud - "this fooled most of us, and that is exactly why it works on adults too" - and spend a minute on why it was convincing. Wrong answers are discussion gold. The one rule that protects this: never shame or name the students who voted for the losing option. The moment a wrong vote becomes embarrassing, voting becomes acting, and you learn nothing real about your class.',
        ka: 'როცა კლასი არასწორ პასუხს აძლევს ხმას, ნუ აუვლით გვერდს ნაჩქარევად. უმრავლესობის მცდარი არჩევანი საუკეთესო მასალაა, რასაც მთელი გაკვეთილის განმავლობაში მიიღებთ: ის პირდაპირ, ყოველგვარი ტესტის გარეშე გაჩვენებთ, რომელი ხრიკი ჭრის თქვენს მოსწავლეებზე. თქვით ეს ხმამაღლა - „ამან უმეტესობა მოგვატყუა, და სწორედ ამიტომ ჭრის ის უფროსებზეც“ - და ერთი წუთი დაუთმეთ იმას, თუ რატომ იყო დამაჯერებელი. მცდარი პასუხები დისკუსიის ოქროა. ერთი წესი, რომელიც ამას იცავს: არასოდეს შეარცხვინოთ და სახელით არ გამოარჩიოთ მოსწავლეები, რომლებმაც წაგებულ ვარიანტს მისცეს ხმა. როგორც კი მცდარი ხმა სამარცხვინო გახდება, კენჭისყრა თამაშად იქცევა და თქვენს კლასზე ვეღარაფერს გაიგებთ ნამდვილს.',
      },
    },
    { type: 'h2', text: { en: 'A rhythm for a fifteen-minute slot', ka: 'რიტმი თხუთმეტწუთიანი მონაკვეთისთვის' } },
    {
      type: 'list',
      items: [
        {
          en: 'One mission per slot, never two. Depth beats coverage - a mission you discuss is worth three you rush through.',
          ka: 'ერთ მონაკვეთში - ერთი მისია, არასოდეს ორი. სიღრმე ჯობია მოცვას: ერთი განხილული მისია სამ ნაჩქარევად გავლილს უდრის.',
        },
        {
          en: 'Pause at every decision point for the vote and one sentence of reasoning from each camp. About a minute per decision.',
          ka: 'ყოველ გადაწყვეტილებასთან შეჩერდით კენჭისყრისთვის და თითო წინადადება მოისმინეთ თითოეული ბანაკის არგუმენტად. დაახლოებით ერთი წუთი თითო გადაწყვეტილებაზე.',
        },
        {
          en: 'Keep two minutes at the end for the debrief. One good question, discussed properly, is the part students remember - the list below gives you one per mission.',
          ka: 'ბოლოსთვის ორი წუთი შეინახეთ შეჯამებისთვის. ერთი კარგი შეკითხვა, რომელსაც ჯეროვნად განიხილავთ, სწორედ ის ნაწილია, რომელიც მოსწავლეებს ამახსოვრდებათ - ქვემოთ მოცემული სია თითო ასეთ შეკითხვას გაძლევთ ყველა მისიაზე.',
        },
      ],
    },
    {
      type: 'callout',
      variant: 'note',
      title: { en: 'One discussion question per mission', ka: 'თითო სადისკუსიო შეკითხვა თითოეულ მისიაზე' },
      items: [
        {
          en: 'G1 · Phishing Hunter - "What was the one detail that gave the phish away?"',
          ka: 'G1 · „ფიშინგზე მონადირე“ - „რომელმა ერთმა დეტალმა გასცა ფიშინგი?“',
        },
        {
          en: 'G2 · Footprint Detective - "What did a complete stranger learn about the profile owner from public posts alone?"',
          ka: 'G2 · „კვალის დეტექტივი“ - „რა გაიგო სრულიად უცნობმა პროფილის მფლობელზე მხოლოდ საჯარო პოსტებიდან?“',
        },
        {
          en: 'G3 · Fort Knox - "Why does a long passphrase beat a short password full of symbols?"',
          ka: 'G3 · „ფორტ ნოქსი“ - „რატომ ჯობია გრძელი ფრაზა-პაროლი სიმბოლოებით გადატვირთულ მოკლე პაროლს?“',
        },
        {
          en: 'G4 · The Blackmail Trap - "Why is silence the blackmailer’s strongest weapon - and what breaks it?"',
          ka: 'G4 · „შანტაჟის ხაფანგი“ - „რატომ არის დუმილი შანტაჟისტის ყველაზე ძლიერი იარაღი - და რა ამსხვრევს მას?“',
        },
        {
          en: 'G5 · Scam Radar - "What exactly made the offer too good to be true?"',
          ka: 'G5 · „თაღლითობის რადარი“ - „კონკრეტულად რამ აქცია შეთავაზება ზედმეტად კარგად იმისთვის, რომ სიმართლე ყოფილიყო?“',
        },
        {
          en: 'G6 · Upstander - "What changes in a group chat the moment one person stands up for the target?"',
          ka: 'G6 · „მხარში მდგომი“ - „რა იცვლება ჯგუფურ ჩატში იმ წამს, როცა ერთი ადამიანი სამიზნეს მხარში ამოუდგება?“',
        },
        {
          en: 'G7 · Reality Check - "Before sharing that post, what two things would you check - and how long would it really take?"',
          ka: 'G7 · „რეალობის შემოწმება“ - „ამ პოსტის გაზიარებამდე რომელ ორ რამეს გადაამოწმებდი - და სინამდვილეში რამდენი დრო დაგჭირდებოდა?“',
        },
        {
          en: 'G8 · Stranger Signals - "Which message was the first red flag - and why does the stranger always suggest moving to another app?"',
          ka: 'G8 · „უცნობის სიგნალები“ - „რომელი შეტყობინება იყო პირველი წითელი დროშა - და რატომ გვთავაზობს უცნობი ყოველთვის სხვა აპლიკაციაში გადასვლას?“',
        },
        {
          en: 'G9 · Balance Boss - "What is one change you could make tonight that your sleep would actually notice?"',
          ka: 'G9 · „ბალანსის ოსტატი“ - „რა ერთი ცვლილება შეგიძლია დღესვე საღამოს, რომელსაც შენი ძილი ნამდვილად შეამჩნევდა?“',
        },
        {
          en: 'G10 · Guardian Exam - "Which question split the class the most - and who convinced whom?"',
          ka: 'G10 · „დამცველის გამოცდა“ - „რომელმა შეკითხვამ გაყო კლასი ყველაზე მეტად - და ვინ ვის გადაარწმუნა?“',
        },
      ],
    },
    { type: 'h2', text: { en: 'Let a student play the scammer', ka: 'მიეცით მოსწავლეს თაღლითის როლი' } },
    {
      type: 'p',
      text: {
        en: 'After the mission, ask for a volunteer to explain the scenario from the attacker’s side: "You are the scammer. Walk us through your plan - why did you write it that way, why the deadline, why the flattery?" This flip is the strongest inoculation we know of: a student who can explain the attacker’s playbook has stopped being an easy target for it. It also solves the classic teenage blind spot - research shows teens readily see online risks for their peers but not for themselves, so lecturing them about their own risk bounces off. Analyzing the trick from the inside does not.',
        ka: 'მისიის დასრულების შემდეგ სთხოვეთ მოხალისეს, სცენარი თავდამსხმელის მხრიდან ახსნას: „შენ თაღლითი ხარ. აგვიხსენი შენი გეგმა - რატომ დაწერე ასე, რისთვის იყო ვადა, რისთვის - ქათინაურები?“ ეს შებრუნება ყველაზე ძლიერი აცრაა, რაც კი ვიცით: მოსწავლე, რომელსაც თავდამსხმელის სამოქმედო გეგმის ახსნა შეუძლია, მისთვის ადვილი სამიზნე აღარ არის. ის მოზარდობის კლასიკურ ბრმა წერტილსაც ხსნის - კვლევები აჩვენებს, რომ მოზარდები ონლაინ რისკებს თანატოლებში ადვილად ხედავენ, საკუთარ თავში კი ვერა, ამიტომ საკუთარ რისკზე ლექცია მათ ზედაპირს ეხეთქება და სცილდება. ხრიკის შიგნიდან გაანალიზება კი - არა.',
      },
    },
    { type: 'h2', text: { en: 'Points, not grades', ka: 'ქულები და არა ნიშნები' } },
    {
      type: 'p',
      text: {
        en: 'Do not grade missions - not the class votes, not the points students collect if they replay missions at home. Mission points exist to motivate, not to assess. The subject matter is exactly the kind where honesty matters more than performance: a student who admits "I would have clicked that link" has just learned something, and a student worried about a grade will never admit it. If you need something for your records, use the discussion itself or the exit-ticket ideas in the lesson-plans article - never the score on the screen.',
        ka: 'ნუ შეაფასებთ მისიებს ნიშნებით - ნურც კლასის კენჭისყრებს, ნურც ქულებს, რომლებსაც მოსწავლეები აგროვებენ, თუ მისიებს სახლში ხელახლა თამაშობენ. მისიის ქულები მოტივაციისთვის არსებობს და არა შეფასებისთვის. ეს ზუსტად ის საგანია, სადაც გულწრფელობა შედეგზე მეტად ფასობს: მოსწავლემ, რომელიც აღიარებს - „მე იმ ბმულზე დავაწკაპუნებდი“ - ახლახან რაღაც ისწავლა, ნიშანზე მღელვარე მოსწავლე კი ამას არასოდეს აღიარებს. თუ ჩანაწერებისთვის რამე გჭირდებათ, გამოიყენეთ თავად დისკუსია ან „გასასვლელი ბილეთის“ იდეები გაკვეთილის გეგმების სტატიიდან - და არასოდეს ეკრანზე გამოსახული ქულა.',
      },
    },
  ],
  sources: [
    'Pew Research (Apr 2025) - Teens, Social Media & Mental Health: pewresearch.org/internet/2025/04/22/teens-social-media-and-mental-health',
    'Common Sense Media - Digital Citizenship Curriculum (9-12): commonsense.org/education/digital-citizenship',
  ],
}
