// G8 - Stranger Signals. DM conversation analyzer: grooming red flags,
// gift leverage, platform-hopping, isolation, secrecy (spec section 3).
// Victim-first framing per spec section 4: the target is never at fault,
// no graphic content, every path names a next step and a trusted adult.
export default {
  brief: {
    en: 'Nika is 14 and good at his favorite game. A month ago someone called Alex_Coach messaged him: friendly, generous, always online. Tonight you read the whole conversation from the outside. Your job is to spot the pattern Nika cannot see from the inside - and then decide what happens next.',
    ka: 'ნიკა 14 წლისაა და კარგად თამაშობს თავის საყვარელ თამაშს. ერთი თვის წინ ვიღაც Alex_Coach-მა მისწერა: მეგობრული, ხელგაშლილი, ყოველთვის ონლაინ. ამაღამ მთელ მიმოწერას გარედან წაიკითხავ. შენი საქმეა შენიშნო შაბლონი, რომელსაც ნიკა შიგნიდან ვერ ხედავს - და შემდეგ გადაწყვიტო, რა მოხდება მერე.',
  },
  theory: [
    {
      en: 'Grooming is an adult slowly building trust with a teen in order to use them later. It is a pattern of small moves, not one creepy message - and it works on smart kids too.',
      ka: 'გრუმინგი ის არის, როცა უფროსი მოზარდთან ნდობას ნელ-ნელა აშენებს, რომ მოგვიანებით გამოიყენოს. ეს წვრილი სვლების შაბლონია და არა ერთი საეჭვო შეტყობინება - და ის ჭკვიან ბავშვებზეც მუშაობს.',
    },
    {
      en: '"You are so mature for your age" is a documented grooming line: flattery that dresses up an adult-teen chat as one between equals. It is a lever, not a compliment.',
      ka: '„შენს ასაკზე ბევრად მოწიფული ხარ“ გრუმინგის ცნობილი ფრაზაა: ფერება, რომელიც უფროსსა და მოზარდს შორის მიმოწერას „თანასწორთა“ საუბრად ასაღებს. ეს ბერკეტია და არა კომპლიმენტი.',
    },
    {
      en: 'Gifts from an online stranger are leverage: they build a debt to be cashed in later. You never owe anyone photos - no matter what they gave you.',
      ka: 'ონლაინ უცნობის საჩუქრები ბერკეტია: ისინი ვალის განცდას აშენებენ, რომელსაც მოგვიანებით მოითხოვენ. ფოტოს ვალი არავისთან გაქვს - რაც უნდა ეჩუქებინა შენთვის.',
    },
    {
      en: '"Let us move to a more private app" means fewer moderators, disappearing messages and less evidence. Ask one question: who benefits from the dark?',
      ka: '„უფრო პრივატულ აპზე გადავიდეთ“ ნიშნავს ნაკლებ მოდერატორს, გაქრობად შეტყობინებებს და ნაკლებ მტკიცებულებას. დასვი ერთი კითხვა: ვის აწყობს სიბნელე?',
    },
    {
      en: '"Our secret" and "do not tell your parents" end the discussion: real friendship survives being known about. Cutting you off from your parents is the core move.',
      ka: '„ჩვენი საიდუმლოა“ და „მშობლებს ნუ ეტყვი“ კამათს ასრულებს: ნამდვილი მეგობრობა უძლებს იმას, რომ მის შესახებ იციან. მშობლებისგან შენი მოწყვეტა მთავარი სვლაა.',
    },
    {
      en: 'The target is never at fault - the adult is running the play. If it is happening: stop replying, screenshot, block, tell a trusted adult, and in Georgia call 112.',
      ka: 'სამიზნე არასდროს არის დამნაშავე - თამაშს უფროსი მართავს. თუ ეს უკვე ხდება: აღარ უპასუხო, გადაუღე სქრინი, დაბლოკე, უთხარი სანდო უფროსს, საქართველოში კი დარეკე 112-ზე.',
    },
  ],
  helpStrip: {
    en: 'If an online "friend" asks you for photos, for secrets, or to hide the friendship - that is not friendship. Tell an adult you trust. You will not be in trouble: you are the one being targeted, and none of it is your fault.',
    ka: 'თუ ონლაინ „მეგობარი“ ფოტოებს გთხოვს, საიდუმლოს ან მეგობრობის დამალვას - ეს მეგობრობა არ არის. უთხარი უფროსს, რომელსაც ენდობი. არავინ დაგსჯის: სამიზნე შენ ხარ და ეს შენი ბრალი არ არის.',
  },
  rounds: [
    {
      type: 'flags',
      prompt: {
        en: 'A month of chat between Nika (14) and Alex_Coach, compressed into nine messages. Tap every message that is a grooming move - a step toward control, not friendship.',
        ka: 'ერთი თვის მიმოწერა ნიკასა (14 წლის) და Alex_Coach-ს შორის, ცხრა შეტყობინებაში შეკუმშული. მონიშნე ყველა შეტყობინება, რომელიც გრუმინგის სვლაა - ნაბიჯი კონტროლისკენ და არა მეგობრობისკენ.',
      },
      items: [
        {
          from: { en: 'Alex_Coach', ka: 'Alex_Coach' },
          text: {
            en: 'Your aim is solid, but you peek corners too early. Hold the angle and let them come to you.',
            ka: 'სროლა კარგი გაქვს, მაგრამ კუთხეებს ნაადრევად იჭერ. დაიცადე პოზიციაზე და შენთან თვითონ მოვლენ.',
          },
          flag: false,
          explain: {
            en: 'A normal coaching tip about the game. An older player giving advice is not, by itself, a red flag - the danger is a pattern, and this alone is not one.',
            ka: 'ჩვეულებრივი რჩევა თამაშზე. უფროსი მოთამაშის რჩევა თავისთავად საგანგაშო ნიშანი არ არის - საშიშროება შაბლონია, და მხოლოდ ეს ჯერ შაბლონი არ არის.',
          },
        },
        {
          from: { en: 'Alex_Coach', ka: 'Alex_Coach' },
          text: {
            en: 'Did you see Gio_Streams rage-quit live yesterday? I was crying 😂',
            ka: 'ნახე გუშინ Gio_Streams-მა პირდაპირ ეთერში როგორ მიატოვა თამაში ნერვებზე? სიცილით ვკვდებოდი 😂',
          },
          flag: false,
          explain: {
            en: 'A joke about a streamer - ordinary chat. The real moves hide between many normal messages exactly like this one. That is what makes the pattern hard to see from inside.',
            ka: 'ხუმრობა სტრიმერზე - ჩვეულებრივი საუბარი. ნამდვილი სვლები ზუსტად ასეთ უამრავ ჩვეულებრივ შეტყობინებას შორის იმალება. სწორედ ამიტომ ჭირს შაბლონის დანახვა შიგნიდან.',
          },
        },
        {
          from: { en: 'Alex_Coach', ka: 'Alex_Coach' },
          text: {
            en: 'Honestly, you’re not like other kids. You’re so mature for your age - I talk to you like an equal.',
            ka: 'გულწრფელად, სხვა ბავშვებს არ ჰგავხარ. შენს ასაკზე ბევრად მოწიფული ხარ - შენთან როგორც ტოლთან, ისე ვსაუბრობ.',
          },
          flag: true,
          explain: {
            en: 'Excessive flattery. "Mature for your age" is one of the most documented grooming lines: it flatters you while reframing an adult-teen chat as something between equals. It is not a compliment - it is a lever.',
            ka: 'გადამეტებული ფერება. „შენს ასაკზე მოწიფული ხარ“ გრუმინგის ერთ-ერთი ყველაზე ცნობილი ფრაზაა: გეფერება და პარალელურად უფროსსა და მოზარდს შორის მიმოწერას „თანასწორთა“ ურთიერთობად ასაღებს. ეს კომპლიმენტი არ არის - ეს ბერკეტია.',
          },
        },
        {
          from: { en: 'Alex_Coach', ka: 'Alex_Coach' },
          text: {
            en: 'I sent 5,000 coins to your account. My gift 🎁 Talented players deserve support.',
            ka: 'შენს ანგარიშზე 5 000 ქოინი გადმოვრიცხე. ჩემი საჩუქარია 🎁 ნიჭიერ მოთამაშეს მხარდაჭერა ეკუთვნის.',
          },
          flag: true,
          explain: {
            en: 'Gift leverage. Presents from an online stranger are not generosity - they build a feeling of debt that gets cashed in later ("after everything I gave you…"). The bill always arrives.',
            ka: 'საჩუქრის ბერკეტი. ონლაინ უცნობის საჩუქრები სიკეთე არ არის - ისინი ვალის განცდას აშენებენ, რომელსაც მოგვიანებით მოითხოვენ („ამდენი რომ გაჩუქე…“). ანგარიშსწორების დრო ყოველთვის დგება.',
          },
        },
        {
          from: { en: 'Nika', ka: 'ნიკა' },
          text: {
            en: 'whoa thanks man, you’re the best 🙏',
            ka: 'ვაა, მადლობა, საუკეთესო ხარ 🙏',
          },
          flag: false,
          explain: {
            en: 'Nika reacted the way anyone would react to a gift. Nothing the target says or accepts makes any of this their fault - the adult on the other side is running the play.',
            ka: 'ნიკამ ისე უპასუხა, როგორც საჩუქარს ნებისმიერი უპასუხებდა. ვერაფერი, რასაც სამიზნე ამბობს ან იღებს, ამას მის ბრალად ვერ აქცევს - თამაშს მეორე მხარეს მჯდომი უფროსი მართავს.',
          },
        },
        {
          from: { en: 'Alex_Coach', ka: 'Alex_Coach' },
          text: {
            en: 'This chat is so laggy. Let’s move to Telegram - way better there, more private too.',
            ka: 'ეს ჩატი ძალიან ჭედავს. Telegram-ზე გადავიდეთ - იქ ბევრად უკეთესია, უფრო პრივატულიც.',
          },
          flag: true,
          explain: {
            en: 'Platform-hopping. Game chats and big platforms have moderation, grooming detection and saved history. "Somewhere more private" means fewer moderators, disappearing messages - and far less evidence later. The lag is an excuse.',
            ka: 'პლატფორმიდან პლატფორმაზე გადახტომა. თამაშის ჩატებსა და დიდ პლატფორმებს აქვთ მოდერაცია, გრუმინგის ამომცნობი სისტემები და შენახული ისტორია. „უფრო პრივატული ადგილი“ ნიშნავს ნაკლებ მოდერატორს, გაქრობად შეტყობინებებს - და მოგვიანებით ბევრად ნაკლებ მტკიცებულებას. შეფერხება მხოლოდ საბაბია.',
          },
        },
        {
          from: { en: 'Alex_Coach', ka: 'Alex_Coach' },
          text: {
            en: 'Which school are you in? And when are you usually home alone? Just so I know when we can play with nobody bothering you.',
            ka: 'რომელ სკოლაში ხარ? და როდის ხარ ხოლმე მარტო სახლში? უბრალოდ, რომ ვიცოდე, როდის ვითამაშოთ ისე, რომ არავინ შეგაწუხოს.',
          },
          flag: true,
          explain: {
            en: 'Mapping your life. School, schedule, when you are alone - no gaming buddy needs any of this. Questions about your personal logistics are collection, not conversation.',
            ka: 'შენი ცხოვრების რუკის შედგენა. სკოლა, განრიგი, როდის ხარ მარტო - ამათგან არაფერი სჭირდება თანამოთამაშეს. კითხვები შენს პირად ლოგისტიკაზე ინფორმაციის შეგროვებაა და არა საუბარი.',
          },
        },
        {
          from: { en: 'Alex_Coach', ka: 'Alex_Coach' },
          text: {
            en: 'Don’t tell your parents about me, ok? They wouldn’t get our friendship. Adults ruin everything.',
            ka: 'მშობლებს ნუ ეტყვი ჩემზე, კარგი? ისინი ჩვენს მეგობრობას ვერ გაიგებენ. უფროსები ყველაფერს აფუჭებენ.',
          },
          flag: true,
          explain: {
            en: 'Isolation - the core move. A person who needs you separated from your parents is planning something your parents would stop. Real friendships survive being known about.',
            ka: 'იზოლაცია - მთავარი სვლა. ადამიანი, რომელსაც სჭირდება, რომ მშობლებისგან მოწყვეტილი იყო, გეგმავს იმას, რასაც მშობლები შეაჩერებდნენ. ნამდვილი მეგობრობა უძლებს იმას, რომ მის შესახებ იციან.',
          },
        },
        {
          from: { en: 'Alex_Coach', ka: 'Alex_Coach' },
          text: {
            en: 'What we talk about stays between us. This is our secret 🤝',
            ka: 'რაზეც ვსაუბრობთ, ჩვენს შორის რჩება. ეს ჩვენი საიდუმლოა 🤝',
          },
          flag: true,
          explain: {
            en: 'Secrecy - the seal on all the other moves. "Our secret" quietly makes you the keeper of their safety. The moment a friendship requires hiding from every adult in your life, it is not a friendship.',
            ka: 'საიდუმლოება - ბეჭედი ყველა დანარჩენ სვლაზე. „ჩვენი საიდუმლო“ შეუმჩნევლად შენ გაქცევს მისი უსაფრთხოების მცველად. როგორც კი მეგობრობა შენს ცხოვრებაში ყველა უფროსისგან დამალვას ითხოვს, ის მეგობრობა აღარ არის.',
          },
        },
      ],
      explain: {
        en: 'Six moves, one playbook: flatter ("so mature"), gift, move somewhere darker, map your life, cut out your parents, seal it with secrecy. Each looks small on its own. Together they are a trap being assembled - and it works on smart kids too, because it is built from kindness, not threats.',
        ka: 'ექვსი სვლა, ერთი სქემა: ფერება („ისეთი მოწიფული ხარ“), საჩუქარი, უფრო ბნელ ადგილას გადაყვანა, შენი ცხოვრების რუკა, მშობლების ჩამოშორება და ბოლოს - საიდუმლოების ბეჭედი. ცალ-ცალკე თითოეული წვრილმანი ჩანს. ერთად კი ეს აწყობის პროცესში მყოფი ხაფანგია - და ის ჭკვიან ბავშვებზეც მუშაობს, რადგან სიკეთისგან არის აშენებული და არა მუქარისგან.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'Almost every one of these conversations includes "let’s move to Telegram / Snapchat / another app". Why is that move always there?',
        ka: 'თითქმის ყველა ასეთ მიმოწერაში ჩნდება „Telegram-ზე / Snapchat-ზე / სხვა აპში გადავიდეთ“. რატომ არის ეს სვლა ყოველთვის სქემაში?',
      },
      options: [
        {
          label: {
            en: 'The chat really is better on the other app',
            ka: 'მეორე აპში ჩატი მართლა უკეთესია',
          },
          correct: false,
        },
        {
          label: {
            en: 'Private or disappearing chats, weaker moderation - and out of sight of parents and the platform’s safety systems',
            ka: 'პრივატული ან გაქრობადი მიმოწერა, სუსტი მოდერაცია - და მშობლებისა და პლატფორმის დაცვის სისტემების თვალსაწიერის მიღმა',
          },
          correct: true,
        },
        {
          label: {
            en: 'It’s just a habit - there is no real reason',
            ka: 'უბრალოდ ჩვევაა - რეალური მიზეზი არ არსებობს',
          },
          correct: false,
        },
      ],
      explain: {
        en: 'Game chats and big platforms scan for grooming patterns and keep history that a report can use. A private, encrypted chat with disappearing messages has none of that. The move is not about lag - it is about turning off the lights: fewer moderators, no history, no parents. When someone insists on switching apps, ask one question: who benefits from the dark?',
        ka: 'თამაშის ჩატები და დიდი პლატფორმები გრუმინგის შაბლონებს ეძებენ და ისტორიას ინახავენ, რომელსაც რეპორტი გამოიყენებს. პრივატულ, დაშიფრულ ჩატს გაქრობადი შეტყობინებებით არაფერი ამათგანი აქვს. გადასვლა შეფერხებაზე არ არის - ეს შუქის გამორთვაა: ნაკლები მოდერატორი, არავითარი ისტორია, არავითარი მშობელი. როცა ვინმე დაჟინებით ითხოვს აპის შეცვლას, დასვი ერთი კითხვა: ვის აწყობს სიბნელე?',
      },
    },
    {
      type: 'branch',
      start: 'n1',
      max: 20,
      nodes: {
        n1: {
          chat: [
            {
              name: { en: 'Alex_Coach', ka: 'Alex_Coach' },
              text: {
                en: 'Come on, send me a photo of yourself 😊 and don’t be like that - after all the skins and coins I gifted you, you kind of owe me, no?',
                ka: 'აბა, გამომიგზავნე შენი ფოტო 😊 და ნუ იზამ ეგრე - ამდენი სკინი და ქოინი რომ გაჩუქე, ცოტა ვალში ხარ ჩემთან, არა?',
              },
            },
          ],
          scene: {
            en: 'You are Nika. The message sits on the screen, waiting. What do you do?',
            ka: 'შენ ნიკა ხარ. შეტყობინება ეკრანზე გელოდება. რას იზამ?',
          },
          choices: [
            {
              label: {
                en: 'Send it - he really did spend money on you, it feels fair',
                ka: 'გავუგზავნი - მართლა დახარჯა ჩემზე ფული, სამართლიანი იქნება',
              },
              next: 'n2',
              points: 0,
              feedback: {
                en: 'Stop - this is the gift trap closing. Gifts from online strangers are leverage by design: they exist so this exact moment feels like a debt. Nobody owes anyone images - ever, for anything. And the moment a photo leaves your phone, it becomes material that can be used against you. Watch what he does next.',
                ka: 'შეჩერდი - ეს ის წამია, როცა საჩუქრის ხაფანგი იკეტება. უცნობის საჩუქრები განზრახ არის ბერკეტი: ისინი იმისთვის არსებობს, რომ ზუსტად ეს მომენტი ვალად იგრძნო. ფოტოს ვალი არავის აქვს არავისთან - არასდროს, არაფრის სანაცვლოდ. და როგორც კი ფოტო შენს ტელეფონს ტოვებს, ის შენ წინააღმდეგ გამოსაყენებელ მასალად იქცევა. ნახე, რას იზამს ახლა.',
              },
            },
            {
              label: {
                en: 'Refuse - but keep chatting like nothing happened',
                ka: 'უარს ვეტყვი - მაგრამ ჩატს ისე გავაგრძელებ, თითქოს არაფერი მომხდარა',
              },
              next: 'n2',
              points: 4,
              feedback: {
                en: 'Refusing is exactly right - hold on to that. But look at what just happened: he tried to cash his gifts in for a photo. That is not a friend having an awkward moment; that is the plan surfacing. This person is not a friend, the pattern will repeat - and staying in the chat gives it more chances.',
                ka: 'უარი ზუსტად სწორი ნაბიჯია - ეს დაიმახსოვრე. მაგრამ ნახე, რა მოხდა: მან სცადა საჩუქრების ფოტოში „განაღდება“. ეს არ არის მეგობრის უხერხული წუთი - ეს გეგმის ზედაპირზე ამოსვლაა. ეს ადამიანი მეგობარი არ არის, შაბლონი გამეორდება - ჩატში დარჩენა კი მას მეტ შანსს აძლევს.',
              },
            },
            {
              label: {
                en: 'Stop replying. Screenshot the chat, tell a trusted adult, report the account.',
                ka: 'აღარ ვუპასუხებ. გადავუღებ ჩატს სქრინებს, ვეტყვი სანდო უფროსს და დავარეპორტებ ანგარიშს.',
              },
              next: 'n2',
              points: 10,
              feedback: {
                en: 'The strongest move on the board. Evidence saved, isolation broken, an adult standing between you and him - the three things this whole playbook depends on you not doing.',
                ka: 'ყველაზე ძლიერი სვლა. მტკიცებულება შენახულია, იზოლაცია გატეხილია, შენსა და მას შორის უფროსი დგას - ეს ის სამი რამაა, რომლის არგაკეთებაზეც მთელი ეს სქემაა გათვლილი.',
              },
            },
          ],
        },
        n2: {
          chat: [
            {
              name: { en: 'Alex_Coach', ka: 'Alex_Coach' },
              text: {
                en: 'Oh, so that’s how it is. And I thought you were mature. You do know I know which school you’re in, right? Careful.',
                ka: 'აჰ, ესეც ასე. მე კი მეგონა, მოწიფული იყავი. ხომ იცი, რომ ვიცი, რომელ სკოლაში ხარ? ფრთხილად.',
              },
            },
          ],
          scene: {
            en: 'The friendly mask needed exactly one message to fall off. Now it is threats. What you do next decides how this ends.',
            ka: 'მეგობრულ ნიღაბს ჩამოსავარდნად ზუსტად ერთი შეტყობინება დასჭირდა. ახლა მუქარაა. შენი შემდეგი ნაბიჯი წყვეტს, როგორ დასრულდება ეს.',
          },
          choices: [
            {
              label: {
                en: 'Panic - delete the chat, the account, everything',
                ka: 'პანიკაში წავშლი ყველაფერს - ჩატს, ანგარიშს, ყველაფერს',
              },
              next: 'nEnd',
              points: 2,
              feedback: {
                en: 'The panic is completely understandable - the threat is built to cause exactly that. But deleting destroys the evidence that shuts accounts like his down, and the fear does not delete with it. The move that actually ends this is still available: tell an adult you trust, even with the chat gone. You do - that same evening - and the weight finally lifts.',
                ka: 'პანიკა სავსებით გასაგებია - მუქარა სწორედ ამისთვის არის აწყობილი. მაგრამ წაშლა ანადგურებს მტკიცებულებას, რომელიც ასეთ ანგარიშებს ხურავს - შიში კი მასთან ერთად არ იშლება. სვლა, რომელიც ამას ნამდვილად ასრულებს, ისევ შენს ხელთაა: უთხარი სანდო უფროსს, წაშლილი ჩატის შემდეგაც კი. ამას აკეთებ - იმავე საღამოს - და ტვირთი ბოლოს გეხსნება.',
              },
            },
            {
              label: {
                en: 'Tell your parents - then report the account to the platform and call 112, together',
                ka: 'ვეტყვი მშობლებს - და ერთად დავარეპორტებთ ანგარიშს პლატფორმაზე და დავრეკავთ 112-ზე',
              },
              next: 'nEnd',
              points: 10,
              feedback: {
                en: 'Exactly this. An adult threatening a 14-year-old is a police matter, not a chat problem. Parents, a platform report, 112 - the second real adults enter the room, his power evaporates.',
                ka: 'ზუსტად ასე. უფროსი, რომელიც 14 წლის მოზარდს ემუქრება, პოლიციის საქმეა და არა ჩატის პრობლემა. მშობლები, რეპორტი პლატფორმაზე, 112 - როგორც კი ოთახში ნამდვილი უფროსები შემოდიან, მისი ძალა ქრება.',
              },
            },
          ],
        },
        nEnd: {
          end: true,
          scene: {
            en: 'The report goes in. The platform responds fast: "Alex_Coach" was already flagged - dozens of nearly identical chats with other kids. Same compliments, same gifts, same "let’s move to Telegram". The account is gone and the case is with the police. Nika is okay - not because the threat was empty, but because he told someone. That was the whole difference.',
            ka: 'რეპორტი იგზავნება. პლატფორმა სწრაფად პასუხობს: Alex_Coach უკვე შემჩნეული ჰყავდათ - ათობით თითქმის იდენტური მიმოწერა სხვა ბავშვებთან. იგივე კომპლიმენტები, იგივე საჩუქრები, იგივე „Telegram-ზე გადავიდეთ“. ანგარიში გაქრა, საქმე პოლიციაშია. ნიკა კარგად არის - არა იმიტომ, რომ მუქარა ცარიელი იყო, არამედ იმიტომ, რომ ვიღაცას უთხრა. მთელი განსხვავება ეს იყო.',
          },
        },
      },
    },
    {
      type: 'choice',
      q: {
        en: 'Last check. Three friend requests arrive on your profile. Which one is a groomer most likely hiding behind?',
        ka: 'ბოლო შემოწმება. შენს პროფილზე მეგობრობის სამი მოთხოვნა მოდის. რომლის უკან იმალება გრუმერი ყველაზე მოსალოდნელად?',
      },
      options: [
        {
          label: {
            en: 'An attractive "peer" whose bio matches your exact interests - and zero mutual friends you know in real life',
            ka: 'მიმზიდველი „თანატოლი“, რომლის პროფილიც ზუსტად შენს ინტერესებს ემთხვევა - და არცერთი საერთო მეგობარი, რომელსაც რეალურ ცხოვრებაში იცნობ',
          },
          correct: true,
        },
        {
          label: {
            en: 'A classmate you know offline',
            ka: 'თანაკლასელი, რომელსაც სკოლიდან იცნობ',
          },
          correct: false,
        },
        {
          label: {
            en: 'The official, verified account of an esports team',
            ka: 'ესპორტული გუნდის ოფიციალური, დადასტურებული ანგარიში',
          },
          correct: false,
        },
      ],
      explain: {
        en: 'They build the profile FOR you. First they read your posts - your game, your music, your memes - then they become the perfect fan of all of it. A dream-match profile with zero real-life overlap is the classic costume. A classmate and a verified organization can both be checked in the real world; a "perfect stranger" cannot - and that is by design.',
        ka: 'ისინი პროფილს შენთვის აწყობენ. ჯერ შენს პოსტებს კითხულობენ - შენი თამაში, შენი მუსიკა, შენი მემები - მერე კი ამ ყველაფრის იდეალურ ფანად იქცევიან. საოცნებოდ დამთხვეული პროფილი რეალურ ცხოვრებასთან ნულოვანი კვეთით კლასიკური კოსტიუმია. თანაკლასელიც და დადასტურებული ორგანიზაციაც რეალურ სამყაროში მოწმდება; „იდეალური უცნობი“ - ვერა, და ეს შემთხვევითი არ არის.',
      },
    },
  ],
  takeaways: [
    {
      en: 'Grooming is a pattern, not a moment: flattery, gifts, secrecy, a "more private" app, cutting out your parents. Learn the playbook and you see it early.',
      ka: 'გრუმინგი შაბლონია და არა ერთი წამი: ფერება, საჩუქრები, საიდუმლოება, „უფრო პრივატული“ აპი, მშობლების ჩამოშორება. ისწავლი ამ სქემას - და ადრევე დაინახავ.',
    },
    {
      en: 'Gifts from online strangers are leverage. You never owe anyone photos, secrets or "proof" - no matter what they gave you.',
      ka: 'ონლაინ უცნობის საჩუქრები ბერკეტია. ფოტოების, საიდუმლოს ან „მტკიცების“ ვალი არავისთან გაქვს - რაც უნდა ეჩუქებინა შენთვის.',
    },
    {
      en: '"Don’t tell your parents" and "our secret" end the discussion: anyone who hides a friendship from every adult in your life is not a friend.',
      ka: '„მშობლებს ნუ ეტყვი“ და „ჩვენი საიდუმლოა“ კამათს ასრულებს: ვინც მეგობრობას შენს ცხოვრებაში ყველა უფროსისგან მალავს, მეგობარი არ არის.',
    },
    {
      en: 'Insisting on moving to another app is about escaping moderation and evidence. Always ask: who benefits from the dark?',
      ka: 'სხვა აპზე გადასვლის დაჟინებული მოთხოვნა მოდერაციისა და მტკიცებულებისგან გაქცევაა. ყოველთვის იკითხე: ვის აწყობს სიბნელე?',
    },
    {
      en: 'If it is already happening: stop replying, screenshot, block, tell a trusted adult, report - in Georgia, 112. You will not be in trouble; the target is never at fault.',
      ka: 'თუ ეს უკვე ხდება: აღარ უპასუხო, გადაუღე სქრინი, დაბლოკე, უთხარი სანდო უფროსს, დაარეპორტე - საქართველოში 112. არავინ დაგსჯის; სამიზნე არასდროს არის დამნაშავე.',
    },
  ],
}
