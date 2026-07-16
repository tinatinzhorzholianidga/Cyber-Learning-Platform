// G1 — Phishing Hunter. Inbox simulator: real-or-phish on realistic
// emails, DMs and SMS (spec section 3). Georgian bank-SMS scam included.
export default {
  brief: {
    en: 'Six messages just landed on your phone. Some are real. Some are traps built to steal your passwords or money. Read each one like a hunter: who sent it, what do they want, and why right now? Decide — then see what you caught.',
    ka: 'შენს ტელეფონზე ექვსი შეტყობინება მოვიდა. ზოგი ნამდვილია. ზოგი — ხაფანგი, რომელიც შენი პაროლების ან ფულის მოსაპარად შეიქმნა. წაიკითხე თითოეული მონადირესავით: ვინ გამოგზავნა, რა უნდა და რატომ ახლავე? გადაწყვიტე — და ნახე, რა დაიჭირე.',
  },
  rounds: [
    {
      type: 'choice',
      card: {
        from: { en: 'SMS · +995 5XX 11 22 33', ka: 'SMS · +995 5XX 11 22 33' },
        body: {
          en: 'BANK ALERT: Your card has been BLOCKED for security reasons. Verify your identity within 2 hours or lose access: bank-secure-ge.com/verify',
          ka: 'ბანკის გაფრთხილება: თქვენი ბარათი დაიბლოკა უსაფრთხოების მიზეზით. გაიარეთ ვერიფიკაცია 2 საათში, თორემ დაკარგავთ წვდომას: bank-secure-ge.com/verify',
        },
      },
      q: { en: 'Real or phish?', ka: 'ნამდვილია თუ ფიშინგი?' },
      options: [
        { label: { en: 'Real — better verify quickly', ka: 'ნამდვილია — სჯობს სწრაფად გავიარო ვერიფიკაცია' }, correct: false },
        { label: { en: 'Phish — fake urgency and a fake bank link', ka: 'ფიშინგია — ყალბი პანიკა და ყალბი საბანკო ბმული' }, correct: true },
      ],
      explain: {
        en: 'Classic Georgian fake-bank SMS. Real banks never send "verify in 2 hours or else" links. The domain bank-secure-ge.com is not your bank — it is a login-stealing page. When a message pushes urgency, that urgency IS the attack. Call the number on the back of your card instead.',
        ka: 'კლასიკური ყალბი საბანკო SMS. ნამდვილი ბანკი არასდროს გიგზავნის ბმულს „2 საათში გაიარე ვერიფიკაცია, თორემ…“. დომენი bank-secure-ge.com შენი ბანკი არ არის — ეს პაროლის მოსაპარი გვერდია. როცა შეტყობინება გაჩქარებს, სწორედ ეს აჩქარება არის თავდასხმა. ამის ნაცვლად დარეკე ბარათის უკანა მხარეს მითითებულ ნომერზე.',
      },
    },
    {
      type: 'choice',
      card: {
        from: { en: 'Email · security@mail.instagram.com', ka: 'ელფოსტა · security@mail.instagram.com' },
        meta: { en: 'Subject: New login to your account', ka: 'თემა: ახალი შესვლა თქვენს ანგარიშზე' },
        body: {
          en: 'We noticed a new login from Berlin, Germany on a Windows device. If this was you, ignore this message. If not, open the Instagram app → Settings → Security to review your logins.',
          ka: 'შევამჩნიეთ ახალი შესვლა ბერლინიდან (გერმანია), Windows მოწყობილობიდან. თუ ეს თქვენ იყავით, უგულებელყავით ეს წერილი. თუ არა — გახსენით Instagram აპი → პარამეტრები → უსაფრთხოება და გადაამოწმეთ შესვლები.',
        },
      },
      q: { en: 'Real or phish?', ka: 'ნამდვილია თუ ფიშინგი?' },
      options: [
        { label: { en: 'Real — and it even tells me to check inside the app', ka: 'ნამდვილია — თან აპში შემოწმებას მთხოვს' }, correct: true },
        { label: { en: 'Phish — all security emails are fake', ka: 'ფიშინგია — ყველა ასეთი წერილი ყალბია' }, correct: false },
      ],
      explain: {
        en: 'This one is legitimate: the sender domain is Instagram’s real mail domain, and — the biggest tell — it does not ask you to click a link and type your password. It sends you to the app you already have. Real security messages give you a safe route; phish gives you a link and a countdown.',
        ka: 'ეს ნამდვილია: გამომგზავნის დომენი Instagram-ის რეალური საფოსტო დომენია და — მთავარი ნიშანი — ის არ გთხოვს ბმულზე გადასვლას და პაროლის ჩაწერას. ის გიშვებს აპში, რომელიც ისედაც გაქვს. ნამდვილი უსაფრთხოების წერილი უსაფრთხო გზას გაძლევს; ფიშინგი — ბმულს და ათვლის ტაიმერს.',
      },
    },
    {
      type: 'choice',
      card: {
        from: { en: 'Game DM · EpicSupport_Team', ka: 'თამაშის DM · EpicSupport_Team' },
        body: {
          en: 'Hello! Suspicious activity was detected on your account. You will be BANNED in 24h unless you confirm your username and password here: epic-verify.net. We apologize for the inconvenience.',
          ka: 'გამარჯობა! თქვენს ანგარიშზე საეჭვო აქტივობა დაფიქსირდა. 24 საათში დაიბლოკებით, თუ არ დაადასტურებთ მომხმარებელს და პაროლს აქ: epic-verify.net. ბოდიშს გიხდით უხერხულობისთვის.',
        },
      },
      q: { en: 'Real or phish?', ka: 'ნამდვილია თუ ფიშინგი?' },
      options: [
        { label: { en: 'Phish — support never asks for your password', ka: 'ფიშინგია — მხარდაჭერა პაროლს არასდროს გთხოვს' }, correct: true },
        { label: { en: 'Real — support accounts message players', ka: 'ნამდვილია — მხარდაჭერა თამაშშივე წერს ხოლმე' }, correct: false },
      ],
      explain: {
        en: 'No game company asks for your password — ever, anywhere, for any reason. That single rule kills this whole category of scam. "You will be banned in 24h" is the same urgency trick as the fake bank SMS, just wearing a gamer skin.',
        ka: 'არცერთი თამაშის კომპანია არ გთხოვს პაროლს — არასდროს, არსად, არავითარი მიზეზით. ეს ერთი წესი მთელ ამ ტიპის თაღლითობას კლავს. „24 საათში დაიბლოკები“ იგივე აჩქარების ხრიკია, რაც ყალბი საბანკო SMS — უბრალოდ გეიმერულ სამოსში.',
      },
    },
    {
      type: 'choice',
      card: {
        from: { en: 'Email · prizes@giveaway-winners.club', ka: 'ელფოსტა · prizes@giveaway-winners.club' },
        meta: { en: 'Subject: 🎉 CONGRATULATIONS — AirPods Pro!', ka: 'თემა: 🎉 გილოცავთ — AirPods Pro!' },
        body: {
          en: 'Your number was selected from 10,000 participants! Your AirPods Pro are reserved. To receive them, just pay the 5 GEL delivery fee with your card here: claim-gift.top',
          ka: 'თქვენი ნომერი შეირჩა 10 000 მონაწილიდან! თქვენი AirPods Pro დაჯავშნილია. მისაღებად მხოლოდ გადაიხადეთ 5 ლარი მიტანის საფასური ბარათით აქ: claim-gift.top',
        },
      },
      q: { en: 'Real or phish?', ka: 'ნამდვილია თუ ფიშინგი?' },
      options: [
        { label: { en: 'Phish — the "prize" exists to get my card number', ka: 'ფიშინგია — „პრიზი“ ჩემი ბარათის ნომრისთვის არსებობს' }, correct: true },
        { label: { en: 'Real — it is only 5 GEL, low risk', ka: 'ნამდვილია — სულ 5 ლარია, დიდი რისკი არაა' }, correct: false },
      ],
      explain: {
        en: 'You cannot win a contest you never entered. The 5 GEL is not the point — your full card details are. Once entered on claim-gift.top, the card can be drained. "Small fee to claim a big prize" is one of the oldest scams on the internet.',
        ka: 'ვერ მოიგებ კონკურსში, რომელშიც არ მიგიღია მონაწილეობა. 5 ლარი მთავარი არ არის — მთავარი შენი ბარათის სრული მონაცემებია. claim-gift.top-ზე შეყვანის შემდეგ ბარათი შეიძლება დაცარიელდეს. „მცირე გადასახადი დიდი პრიზისთვის“ ინტერნეტის ერთ-ერთი უძველესი თაღლითობაა.',
      },
    },
    {
      type: 'choice',
      card: {
        from: { en: 'Class group · Sandro', ka: 'საკლასო ჯგუფი · სანდრო' },
        body: {
          en: 'Guys, Ms. Nino posted tomorrow’s homework in the school portal — the essay moved to Friday. Check when you can.',
          ka: 'ხალხო, ქალბატონმა ნინომ ხვალინდელი დავალება სასკოლო პორტალზე დადო — ესეი პარასკევზე გადავიდა. ნახეთ, როცა შეძლებთ.',
        },
      },
      q: { en: 'Real or phish?', ka: 'ნამდვილია თუ ფიშინგი?' },
      options: [
        { label: { en: 'Real — a known person, no link, no ask', ka: 'ნამდვილია — ნაცნობი ადამიანი, არც ბმული, არც მოთხოვნა' }, correct: true },
        { label: { en: 'Phish — everything in group chats is suspicious', ka: 'ფიშინგია — ჯგუფურ ჩატში ყველაფერი საეჭვოა' }, correct: false },
      ],
      explain: {
        en: 'A hunter who shoots everything catches nothing. This is a classmate you know, telling you something checkable, asking for nothing — no link, no login, no money, no urgency. Healthy skepticism means checking signals, not distrusting everyone.',
        ka: 'მონადირე, რომელიც ყველაფერს ესვრის, ვერაფერს დაიჭერს. ეს შენი ნაცნობი თანაკლასელია, გეუბნება გადამოწმებად ამბავს და არაფერს გთხოვს — არც ბმულს, არც პაროლს, არც ფულს, არც სისწრაფეს. ჯანსაღი ეჭვი ნიშნავს ნიშნების შემოწმებას და არა ყველას უნდობლობას.',
      },
    },
    {
      type: 'flags',
      prompt: {
        en: 'Last one is harder. This email got past your spam filter. Tap every red flag you can find in it.',
        ka: 'ბოლო უფრო რთულია. ეს წერილი სპამ-ფილტრს გაუძვრა. მონიშნე ყველა საგანგაშო ნიშანი, რომელსაც იპოვი.',
      },
      items: [
        {
          text: { en: 'From: StreamFlix Support <billing@streamf1ix-pay.com>', ka: 'გამომგზავნი: StreamFlix Support <billing@streamf1ix-pay.com>' },
          flag: true,
          explain: { en: 'Look closely: streamf1ix with the digit 1. Lookalike domains are the #1 phishing tell.', ka: 'დააკვირდი: streamf1ix ციფრით 1. მსგავსი დომენები ფიშინგის №1 ნიშანია.' },
        },
        {
          text: { en: '"Dear customer" — no name', ka: '„ძვირფასო მომხმარებელო“ — სახელის გარეშე' },
          flag: true,
          explain: { en: 'Your real provider knows your name. Mass phish emails do not.', ka: 'ნამდვილმა სერვისმა შენი სახელი იცის. მასობრივმა ფიშინგმა — არა.' },
        },
        {
          text: { en: '"Your payment failed. Update your card within 24 hours or your account will be deleted."', ka: '„გადახდა ვერ შესრულდა. განაახლეთ ბარათი 24 საათში, თორემ ანგარიში წაიშლება.“' },
          flag: true,
          explain: { en: 'Deadline + threat = manufactured panic. Real billing issues do not delete accounts in a day.', ka: 'ვადა + მუქარა = ხელოვნური პანიკა. ნამდვილი გადახდის პრობლემა ანგარიშს ერთ დღეში არ შლის.' },
        },
        {
          text: { en: 'The email footer shows the company’s real office address', ka: 'წერილის ბოლოში კომპანიის რეალური მისამართია' },
          flag: false,
          explain: { en: 'Scammers copy footers, logos and addresses freely — their presence proves nothing either way.', ka: 'თაღლითები თავისუფლად აკოპირებენ ლოგოებსა და მისამართებს — მათი არსებობა არაფერს ამტკიცებს.' },
        },
        {
          text: { en: 'Button: "Update payment" → hover shows http://stream-pay-renew.top', ka: 'ღილაკი: „ბარათის განახლება“ → კურსორი აჩვენებს http://stream-pay-renew.top' },
          flag: true,
          explain: { en: 'The link’s real destination is a random .top domain, not the service’s site. Always hover before you click.', ka: 'ბმულის ნამდვილი მისამართი შემთხვევითი .top დომენია და არა სერვისის საიტი. სანამ დააჭერ, ყოველთვის შეამოწმე ბმულის მისამართი.' },
        },
      ],
      explain: {
        en: 'Four red flags: a lookalike sender domain, no name, a panic deadline, and a link that goes somewhere else entirely. Any ONE of these is reason enough to go to the real site yourself instead of clicking.',
        ka: 'ოთხი საგანგაშო ნიშანი: მსგავსი ყალბი დომენი, უსახელო მიმართვა, პანიკური ვადა და ბმული, რომელიც სულ სხვაგან მიდის. თითო მათგანიც საკმარისია, რომ ბმულზე დაჭერის ნაცვლად თავად შეხვიდე ნამდვილ საიტზე.',
      },
    },
  ],
  takeaways: [
    {
      en: 'Urgency is the weapon. Any message that rushes you ("2 hours!", "24h ban!") earns extra suspicion, not extra speed.',
      ka: 'აჩქარება იარაღია. ნებისმიერი შეტყობინება, რომელიც გაჩქარებს („2 საათი!“, „24 საათში ბანი!“), იმსახურებს მეტ ეჭვს და არა მეტ სისწრაფეს.',
    },
    {
      en: 'Check the real sender: the exact domain, not the display name. streamf1ix ≠ streamflix.',
      ka: 'შეამოწმე ნამდვილი გამომგზავნი: ზუსტი დომენი და არა გამოსახული სახელი. streamf1ix ≠ streamflix.',
    },
    {
      en: 'No legitimate service — bank, game, or app — ever asks for your password through a link.',
      ka: 'არცერთი ნამდვილი სერვისი — ბანკი, თამაში თუ აპი — არასდროს გთხოვს პაროლს ბმულით.',
    },
    {
      en: 'When in doubt, go direct: open the app or type the site address yourself.',
      ka: 'ეჭვის დროს იმოქმედე პირდაპირ: გახსენი აპი ან თავად აკრიფე საიტის მისამართი.',
    },
  ],
}
