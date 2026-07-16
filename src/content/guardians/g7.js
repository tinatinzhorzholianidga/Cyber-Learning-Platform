// G7 - Reality Check. "Real or fake?" feed with reveal explanations
// (spec section 3): fake news, AI images, recontextualized footage,
// voice deepfakes, confirmation bias - plus one real item, because a
// radar that flags everything is as broken as one that flags nothing.
export default {
  brief: {
    en: 'Your feed just refreshed. News, photos, a voice message, an announcement - some real, some engineered to fool anyone, and one built to fool specifically you. Call each one, then see the reveal. Your goal is not paranoia: it is a radar that also lets true things through.',
    ka: 'შენი ლენტა ახლახან განახლდა. ამბები, ფოტოები, ხმოვანი შეტყობინება, განცხადება - ზოგი ნამდვილია, ზოგი ნებისმიერის მოსატყუებლად არის აწყობილი, ერთი კი კონკრეტულად შენს მოსატყუებლად. გამოიტანე ვერდიქტი თითოეულზე და ნახე პასუხი. შენი მიზანი პარანოია არ არის: მიზანია რადარი, რომელიც ნამდვილ ამბებსაც ატარებს.',
  },
  theory: [
    {
      en: 'Feeds are ranked by engagement, not truth. Posts that make you angry or scared travel further - by design, not by accident.',
      ka: 'ლენტა ჩართულობით ლაგდება და არა სიმართლით. პოსტები, რომლებიც გაბრაზებს ან გაშინებს, უფრო შორს მიდის - განზრახ და არა შემთხვევით.',
    },
    {
      en: 'The strongest tool is the 30-second lateral check: leave the post, search the claim in a new tab, and see whether one real outlet confirms it.',
      ka: 'ყველაზე ძლიერი ინსტრუმენტი 30-წამიანი გვერდითი შემოწმებაა: დატოვე პოსტი, მოძებნე მტკიცება ახალ ფანჯარაში და ნახე, ადასტურებს თუ არა ერთი ნამდვილი გამოცემა მაინც.',
    },
    {
      en: 'AI images and cloned voices are cheap now. Tells like melted hands vanish with every update - checking the source outlives checking the pixels.',
      ka: 'ხელოვნური ინტელექტის ფოტოები და კლონირებული ხმები დღეს იაფია. ნიშნები, როგორიცაა „გამდნარი“ ხელები, ყოველ განახლებასთან ერთად ქრება - წყაროს შემოწმება პიქსელების შემოწმებაზე მეტხანს ცოცხლობს.',
    },
    {
      en: 'The most common fake of all is real footage with a false caption. Ask "when and where was this filmed" - not just "is it real".',
      ka: 'ყველაზე გავრცელებული სიყალბე ნამდვილი კადრებია ყალბი წარწერით. იკითხე „როდის და სად არის გადაღებული“ - და არა მხოლოდ „ნამდვილია თუ არა“.',
    },
    {
      en: 'Popularity is not evidence: a viral lie shows the same share counter as a viral truth. And the more you WANT a post to be true, the more it needs checking first.',
      ka: 'პოპულარობა მტკიცებულება არ არის: ვირუსულ ტყუილს ისეთივე გაზიარების მთვლელი აქვს, როგორიც ვირუსულ სიმართლეს. და რაც უფრო გინდა, პოსტი სიმართლე იყოს, მით მეტად სჭირდება ჯერ შემოწმება.',
    },
  ],
  rounds: [
    {
      type: 'choice',
      card: {
        from: { en: 'Feed · tbilisi_news_24', ka: 'ლენტა · tbilisi_news_24' },
        meta: {
          en: 'Account created 2 months ago · no posts before this week',
          ka: 'ანგარიში შეიქმნა 2 თვის წინ · ამ კვირამდე არცერთი პოსტი',
        },
        body: {
          en: 'BREAKING 🚨 Confirmed: ALL schools closed next week nationwide! Attached: a screenshot of a news-site headline. Share so every parent finds out in time!',
          ka: 'სასწრაფო 🚨 დადასტურდა: მომავალ კვირას ყველა სკოლა დაკეტილია მთელი ქვეყნის მასშტაბით! თან ერთვის საინფორმაციო საიტის სათაურის სქრინი. გააზიარე, ყველა მშობელმა რომ დროულად გაიგოს!',
        },
      },
      q: { en: 'Real or fake?', ka: 'ნამდვილია თუ ყალბი?' },
      options: [
        {
          label: {
            en: 'Real - it even has a screenshot of a headline',
            ka: 'ნამდვილია - სათაურის სქრინიც კი ახლავს',
          },
          correct: false,
        },
        {
          label: {
            en: 'Fake - a two-month-old account "breaking" news that no official source reports',
            ka: 'ყალბია - ორი თვის ანგარიში „ავრცელებს“ ამბავს, რომელსაც არცერთი ოფიციალური წყარო არ ადასტურებს',
          },
          correct: true,
        },
      ],
      explain: {
        en: 'A screenshot proves nothing - anyone can fabricate one in a browser in a minute. The tool that catches this is the 30-second lateral check: leave the post, search the claim in a new tab, look at the ministry site or one major outlet. If schools were really closing nationwide, every newsroom in the country would have it within minutes. Total silence from all of them IS the verdict.',
        ka: 'სქრინი არაფერს ამტკიცებს - მის „დამზადებას“ ბრაუზერში ერთი წუთი სჭირდება. ამას იჭერს 30-წამიანი გვერდითი შემოწმება: დატოვე პოსტი, მოძებნე ეს ამბავი ახალ ფანჯარაში, ნახე სამინისტროს საიტი ან ერთი დიდი გამოცემა მაინც. სკოლები მთელი ქვეყნის მასშტაბით რომ იკეტებოდეს, ამას ყველა რედაქცია წუთებში დაწერდა. ყველა მათგანის სრული დუმილი - ეს არის ვერდიქტი.',
      },
    },
    {
      type: 'choice',
      card: {
        from: { en: 'Feed · celeb.leaks.daily', ka: 'ლენტა · celeb.leaks.daily' },
        body: {
          en: '"ARRESTED LAST NIGHT!" - a photo of a world-famous singer in handcuffs. Look closer, though: one hand has six fingers melting into each other, the police badge reads "POLIICE DEPARMENT", and the shadows on the face fall in two different directions.',
          ka: '„წუხელ დააკავეს!“ - მსოფლიოში ცნობილი მომღერლის ფოტო ხელბორკილებით. მაგრამ დააკვირდი: ერთ ხელზე ექვსი თითია და ერთმანეთში „დნება“, პოლიციელის სამკერდე ნიშანზე უაზრო ასოებია, სახეზე ჩრდილები კი ორ სხვადასხვა მხარეს ეცემა.',
        },
      },
      q: { en: 'Real or fake?', ka: 'ნამდვილია თუ ყალბი?' },
      options: [
        {
          label: { en: 'Real - photos don’t lie', ka: 'ნამდვილია - ფოტო არ იტყუება' },
          correct: false,
        },
        {
          label: {
            en: 'Fake - the hands, the gibberish badge text and the lighting are AI tells',
            ka: 'ყალბია - ხელები, უაზრო წარწერა და განათება ხელოვნური ინტელექტის ნიშნებია',
          },
          correct: true,
        },
      ],
      explain: {
        en: 'Classic AI-image tells: melted hands and fingers, gibberish text inside the image, lighting that contradicts itself. Now the uncomfortable part: generators improve every month, and these tells are disappearing. Pixel-hunting is a losing game long-term - source-checking is not. Who posted it first? Does a single real outlet report the arrest? That check still works when the hands look perfect.',
        ka: 'ხელოვნური ინტელექტის ფოტოს კლასიკური ნიშნები: „გამდნარი“ ხელები და თითები, უაზრო ტექსტი გამოსახულებაზე, ურთიერთსაწინააღმდეგო განათება. ახლა უსიამოვნო ნაწილი: გენერატორები ყოველთვიურად უმჯობესდება და ეს ნიშნები ქრება. პიქსელებზე ნადირობა გრძელვადიანად წაგებული თამაშია - წყაროს შემოწმება კი არა. ვინ დაპოსტა პირველად? წერს თუ არა დაკავებაზე ერთი ნამდვილი გამოცემა მაინც? ეს შემოწმება მაშინაც მუშაობს, როცა თითები უნაკლოდ გამოიყურება.',
      },
    },
    {
      type: 'choice',
      card: {
        from: { en: 'Feed · storm_alerts_geo', ka: 'ლენტა · storm_alerts_geo' },
        body: {
          en: 'Video: cars floating down a flooded street, people climbing onto rooftops. Caption: "HAPPENING NOW in our city - and the news is HIDING it!!" The footage looks completely genuine. One commenter posts a link: the exact same video on a foreign news site, dated three years ago.',
          ka: 'ვიდეო: დატბორილ ქუჩაზე მანქანები მიცურავს, ხალხი სახურავებზე ადის. წარწერა: „ახლა ხდება ჩვენს ქალაქში - და ამბებში მალავენ!!“ კადრები სრულიად ნამდვილი ჩანს. ერთი კომენტატორი ბმულს დებს: ზუსტად იგივე ვიდეო უცხოური საინფორმაციო საიტზეა, სამი წლის წინანდელი თარიღით.',
        },
      },
      q: { en: 'What is the right call here?', ka: 'რომელია სწორი ვერდიქტი?' },
      options: [
        {
          label: {
            en: 'Fake - the video must be AI-generated',
            ka: 'ყალბია - ვიდეო, ალბათ, ხელოვნური ინტელექტით არის შექმნილი',
          },
          correct: false,
        },
        {
          label: {
            en: 'Real video, fake context - genuine footage from another country, three years ago',
            ka: 'ვიდეო ნამდვილია, კონტექსტი - ყალბი: რეალური კადრებია სხვა ქვეყნიდან, სამი წლის წინანდელი',
          },
          correct: true,
        },
        {
          label: {
            en: 'Real - the footage is genuine, so the post must be true',
            ka: 'ნამდვილია - კადრები ხომ ნამდვილია, ესე იგი პოსტიც სიმართლეა',
          },
          correct: false,
        },
      ],
      explain: {
        en: 'This is recontextualization - the most common trick in the fake-news toolbox, precisely because nothing has to be faked. Real, dramatic footage gets a new caption and becomes "proof" of whatever someone needs today. The question that catches it is not "is this video real?" but "when and where was it filmed?" A reverse search - or one skeptical commenter - usually answers that in seconds.',
        ka: 'ეს რეკონტექსტუალიზაციაა - ყალბი ამბების ყველაზე გავრცელებული ხრიკი, სწორედ იმიტომ, რომ არაფრის გაყალბება არ სჭირდება. ნამდვილ, დრამატულ კადრებს ახალი წარწერა ედება და ის იმის „მტკიცებულებად“ იქცევა, რაც დღეს ვიღაცას სჭირდება. ხრიკს იჭერს არა კითხვა „ვიდეო ნამდვილია?“, არამედ - „როდის და სად არის გადაღებული?“ კადრის უკუძიება - ან ერთი სკეპტიკური კომენტატორი - ამას, როგორც წესი, წამებში პასუხობს.',
      },
    },
    {
      type: 'choice',
      card: {
        from: {
          en: 'WhatsApp · voice message, forwarded into the class group',
          ka: 'WhatsApp · ხმოვანი შეტყობინება, გადმოგზავნილი საკლასო ჯგუფში',
        },
        body: {
          en: 'A voice message that sounds exactly like your class teacher: "Kids, today is the deadline for the trip deposit. Send 50 GEL to this number - it’s my personal one, it’s faster than the school account." The voice, the intonation, even her usual little phrases - all perfect.',
          ka: 'ხმოვანი შეტყობინება, რომელიც ზუსტად შენი დამრიგებლის ხმას ჰგავს: „ბავშვებო, დღეს ექსკურსიის თანხის ბოლო ვადაა. გადმორიცხეთ 50 ლარი ამ ნომერზე - ჩემი პირადია, სკოლის ანგარიშზე სწრაფია.“ ხმა, ინტონაცია, მისი ჩვეული ფრაზებიც კი - ყველაფერი ზუსტია.',
        },
      },
      q: { en: 'Real or fake?', ka: 'ნამდვილია თუ ყალბი?' },
      options: [
        {
          label: {
            en: 'Real - nobody can fake a voice that well',
            ka: 'ნამდვილია - ხმას ასე ზუსტად ვერავინ გააყალბებს',
          },
          correct: false,
        },
        {
          label: {
            en: 'Fake until verified - call the teacher yourself, on the number you already have',
            ka: 'ყალბია, სანამ არ გადამოწმდება - თავად დაურეკე მასწავლებელს იმ ნომერზე, რომელიც უკვე გაქვს',
          },
          correct: true,
        },
      ],
      explain: {
        en: 'Voice cloning now needs a few seconds of sample audio and costs almost nothing - a teacher who posts videos or speaks at school events is trivially clonable. A perfectly familiar voice is no longer proof of anything. The rule: any request for money gets verified through a channel YOU initiate - call the teacher’s known number, ask her in person, check with the school. Never verify through the same channel the request arrived on.',
        ka: 'ხმის კლონირებას დღეს რამდენიმე წამის ჩანაწერი სჭირდება და თითქმის არაფერი ღირს - მასწავლებელი, რომელიც ვიდეოებს დებს ან სკოლის ღონისძიებებზე საუბრობს, ადვილად კლონირებადია. სრულიად ნაცნობი ხმა უკვე აღარაფრის მტკიცებულებაა. წესი ასეთია: ფულის ნებისმიერი თხოვნა მოწმდება არხით, რომელსაც შენ იწყებ - დაურეკე დამრიგებელს შენთვის ცნობილ ნომერზე, ჰკითხე პირადად, გადაამოწმე სკოლაში. არასდროს გადაამოწმო იმავე არხით, საიდანაც თხოვნა მოვიდა.',
      },
    },
    {
      type: 'choice',
      card: {
        from: {
          en: 'Feed · City Hall ✔ verified account',
          ka: 'ლენტა · მერია ✔ დადასტურებული ანგარიში',
        },
        body: {
          en: '"On Saturday from 09:00 to 14:00, Pekini Avenue will be partially closed for road resurfacing. Buses 310 and 351 will run on altered routes." Two local news outlets carry the same story. No drama, no countdown, nobody asks you to share anything.',
          ka: '„შაბათს, 09:00-დან 14:00 საათამდე, პეკინის გამზირი ნაწილობრივ დაიკეტება გზის საფარის შეკეთების გამო. 310 და 351 ავტობუსები შეცვლილი მარშრუტით ივლიან.“ ორი ადგილობრივი გამოცემა იმავე ამბავს წერს. არც დრამა, არც ათვლის ტაიმერი, გაზიარებას არავინ გთხოვს.',
        },
      },
      q: { en: 'Real or fake?', ka: 'ნამდვილია თუ ყალბი?' },
      options: [
        {
          label: {
            en: 'Real - verified official source, boring checkable details, independent confirmation',
            ka: 'ნამდვილია - დადასტურებული ოფიციალური წყარო, მოსაწყენი გადამოწმებადი დეტალები, დამოუკიდებელი დადასტურება',
          },
          correct: true,
        },
        {
          label: {
            en: 'Fake - you can never trust anything online',
            ka: 'ყალბია - ინტერნეტში ვერაფერს ენდობი',
          },
          correct: false,
        },
      ],
      explain: {
        en: 'Real. A radar that flags everything is as useless as one that flags nothing. Notice what genuine information looks like: a verified official source, specific details you could check (street, hours, bus numbers), independent outlets reporting the same thing - and zero pressure. Nobody screams at you to share road works before "they" delete them.',
        ka: 'ნამდვილია. რადარი, რომელიც ყველაფერზე რეკავს, ისეთივე უვარგისია, როგორც ის, რომელიც არაფერზე რეკავს. დააკვირდი, როგორ გამოიყურება ნამდვილი ინფორმაცია: დადასტურებული ოფიციალური წყარო, კონკრეტული გადამოწმებადი დეტალები (ქუჩა, საათები, ავტობუსების ნომრები), ერთი და იმავე ამბის დამოუკიდებელი გამოცემები - და ნულოვანი ზეწოლა. გზის სამუშაოების გაზიარებას „სანამ წაშლიან“ არავინ გთხოვს ყვირილით.',
      },
    },
    {
      type: 'choice',
      card: {
        from: {
          en: 'Feed · gamer.facts.daily - already shared by three of your friends',
          ka: 'ლენტა · gamer.facts.daily - უკვე გააზიარა შენმა სამმა მეგობარმა',
        },
        body: {
          en: '"HARVARD STUDY PROVES: gamers have 23% higher IQ than non-gamers 🧠🔥 They don’t want you to know this. SHARE!" No link to any study, no date, no researcher’s name. You have been arguing exactly this with your cousin for years - and you are a gamer.',
          ka: '„ჰარვარდის კვლევამ დაამტკიცა: გეიმერებს 23%-ით მაღალი IQ აქვთ 🧠🔥 არ უნდათ, რომ ეს იცოდე. გააზიარე!“ კვლევის ბმული არსად ჩანს, არც თარიღი, არც მკვლევრის სახელი. ზუსტად ამაზე წლებია ედავები ბიძაშვილს - და თანაც გეიმერი ხარ.',
        },
      },
      q: { en: 'What do you do?', ka: 'რას იზამ?' },
      options: [
        {
          label: {
            en: 'Share it - finally, proof that you were right all along',
            ka: 'გავაზიარებ - ბოლოს და ბოლოს, მტკიცებულება, რომ მართალი ვიყავი',
          },
          correct: false,
        },
        {
          label: {
            en: 'Check it first - precisely BECAUSE you want it to be true',
            ka: 'ჯერ გადავამოწმებ - ზუსტად იმიტომ, რომ მინდა სიმართლე იყოს',
          },
          correct: true,
        },
        {
          label: {
            en: 'It says Harvard, so it’s credible enough',
            ka: 'ჰარვარდი წერია, ესე იგი საკმარისად სანდოა',
          },
          correct: false,
        },
      ],
      explain: {
        en: 'This is confirmation bias: the more a claim flatters your side, the less your brain wants to check it - and that is exactly what turns you into a spreading machine. There is no linked study, no date, no author; "Harvard" is just a borrowed costume. Flip the test: if this post said gamers had LOWER IQ, you would demand a source in one second. Give claims you like the same treatment as claims you hate.',
        ka: 'ეს დადასტურების მიკერძოებაა: რაც უფრო ესიამოვნება მტკიცება შენს პოზიციას, მით ნაკლებად უნდა შენს ტვინს მისი შემოწმება - და სწორედ ეს გაქცევს გავრცელების მანქანად. კვლევის ბმული არ არსებობს, არც თარიღი, არც ავტორი; „ჰარვარდი“ უბრალოდ ნათხოვარი კოსტიუმია. შეატრიალე ტესტი: ეს პოსტი რომ ამბობდეს, გეიმერებს დაბალი IQ აქვთო, წყაროს ერთ წამში მოითხოვდი. სასიამოვნო მტკიცებას ისეთივე შემოწმება მოუწყვე, როგორსაც უსიამოვნოს მოუწყობდი.',
      },
    },
    {
      type: 'flags',
      prompt: {
        en: 'One more post is going viral in your feed right now. Tap every manipulation signal you can find in it.',
        ka: 'კიდევ ერთი პოსტი სწორედ ახლა ვრცელდება შენს ლენტაში ვირუსულად. მონიშნე ყველა მანიპულაციის ნიშანი, რომელსაც იპოვი.',
      },
      items: [
        {
          text: {
            en: '"WAKE UP!!! THEY DON’T WANT YOU TO SEE THIS 😱🚨"',
            ka: '„გამოიღვიძეთ!!! არ უნდათ, რომ ეს ნახოთ 😱🚨“',
          },
          flag: true,
          explain: {
            en: 'Manufactured emotion. All-caps, sirens and outrage exist to switch your checking brain off - angry, scared people share first and think later.',
            ka: 'ხელოვნური ემოცია. ერთიანად მთავრული ასოები, სირენები და აღშფოთება იმისთვის არსებობს, რომ შენი შემმოწმებელი ტვინი გამორთოს - გაბრაზებული და შეშინებული ადამიანი ჯერ აზიარებს და მერე ფიქრობს.',
          },
        },
        {
          text: {
            en: '"Share before they delete it!"',
            ka: '„გააზიარე, სანამ წაშლიან!“',
          },
          flag: true,
          explain: {
            en: 'The classic pressure line. Real information does not expire in minutes - the rush exists to outrun your doubt. "Before they delete it" also plants a conspiracy no one has to prove.',
            ka: 'კლასიკური ზეწოლის ფრაზა. ნამდვილ ინფორმაციას წუთებში ვადა არ გასდის - აჩქარება იმისთვისაა, რომ შენს ეჭვს გადაასწროს. „სანამ წაშლიან“ კი შეთქმულების თესლს თესავს, რომლის მტკიცება არავის სჭირდება.',
          },
        },
        {
          text: {
            en: 'No source, no author, no date anywhere in the post',
            ka: 'პოსტში არსად ჩანს წყარო, ავტორი ან თარიღი',
          },
          flag: true,
          explain: {
            en: 'Checkable information tells you where it came from and when. A claim with no source, author or date cannot be verified - and usually that is the point.',
            ka: 'გადამოწმებადი ინფორმაცია გეუბნება, საიდან მოვიდა და როდის. მტკიცება წყაროს, ავტორისა და თარიღის გარეშე ვერ გადამოწმდება - და, როგორც წესი, სწორედ ეს არის მიზანი.',
          },
        },
        {
          text: {
            en: 'A cropped screenshot of a headline - with no link to the actual article',
            ka: 'სათაურის მოჭრილი სქრინი - თავად სტატიის ბმულის გარეშე',
          },
          flag: true,
          explain: {
            en: 'A cropped headline hides the date, the outlet, and sometimes the very next sentence that changes everything. If they had the article, they would link the article.',
            ka: 'მოჭრილი სათაური მალავს თარიღს, გამოცემას და ზოგჯერ ზუსტად იმ მომდევნო წინადადებას, რომელიც ყველაფერს ცვლის. სტატია რომ ჰქონდეთ, სტატიას დადებდნენ.',
          },
        },
        {
          text: {
            en: '128,000 shares and climbing',
            ka: '128 000 გაზიარება და მატულობს',
          },
          flag: false,
          explain: {
            en: 'Popularity is not evidence either way. False posts often outrun true ones precisely because they are engineered to be shared. The counter tells you a post is spreading - not that it is true.',
            ka: 'პოპულარობა არც ერთი მიმართულებით არ არის მტკიცებულება. ყალბი პოსტები ხშირად უსწრებენ ნამდვილებს სწორედ იმიტომ, რომ გასაზიარებლად არის აწყობილი. მთვლელი გეუბნება, რომ პოსტი ვრცელდება - და არა იმას, რომ ის სიმართლეა.',
          },
        },
      ],
      explain: {
        en: 'Four tells: manufactured emotion, share-now pressure, a sourceless claim, and cropped "proof". The share counter was the trap answer - a viral lie shows exactly the same numbers as a viral truth, so popularity can never be your reliability signal.',
        ka: 'ოთხი ნიშანი: ხელოვნური ემოცია, ზეწოლა „ახლავე გააზიარე“, უწყარო მტკიცება და მოჭრილი „მტკიცებულება“. გაზიარებების მთვლელი ხაფანგი იყო - ვირუსულ ტყუილს ზუსტად ისეთივე ციფრები აქვს, როგორიც ვირუსულ სიმართლეს, ამიტომ პოპულარობა სანდოობის ნიშნად ვერასდროს გამოდგება.',
      },
    },
  ],
  takeaways: [
    {
      en: 'Check the source before the content: who is saying it, and does at least one official or independent outlet confirm it? That is a 30-second habit.',
      ka: 'ჯერ წყარო შეამოწმე, მერე შინაარსი: ვინ ამბობს და ადასტურებს თუ არა ერთი ოფიციალური ან დამოუკიდებელი წყარო მაინც? ეს 30-წამიანი ჩვევაა.',
    },
    {
      en: 'AI tells - hands, text inside the image, lighting - work today and vanish tomorrow. Source-checking outlives pixel-hunting.',
      ka: 'ხელოვნური ინტელექტის ნიშნები - ხელები, ტექსტი გამოსახულებაზე, განათება - დღეს მუშაობს და ხვალ ქრება. წყაროს შემოწმება პიქსელებზე ნადირობაზე მეტხანს ცოცხლობს.',
    },
    {
      en: 'Real footage with a false caption is the most common fake of all. Always ask when and where - not just "is it real".',
      ka: 'ნამდვილი კადრები ყალბი წარწერით - ყველაზე გავრცელებული სიყალბეა. ყოველთვის იკითხე „როდის და სად“ - და არა მხოლოდ „ნამდვილია თუ არა“.',
    },
    {
      en: 'A familiar voice is no longer proof. Any request for money gets verified through a channel YOU initiate.',
      ka: 'ნაცნობი ხმა მტკიცებულება აღარ არის. ფულის ნებისმიერი თხოვნა მოწმდება არხით, რომელსაც შენ იწყებ.',
    },
    {
      en: 'The more you want it to be true - and the louder it demands a share RIGHT NOW - the more it needs checking first.',
      ka: 'რაც უფრო გინდა, რომ სიმართლე იყოს - და რაც უფრო ხმამაღლა ითხოვს პოსტი ახლავე გაზიარებას - მით მეტად სჭირდება ჯერ შემოწმება.',
    },
  ],
}
