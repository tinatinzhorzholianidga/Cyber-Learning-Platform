// G6 - Upstander. Group-chat cyberbullying simulator (spec section 3),
// victim-first per spec section 4: the target is never blamed, no slurs or
// graphic insults, competence over fear. Branch: every path reaches the end
// node; wrong turns get consequence feedback, never a dead end.
export default {
  brief: {
    en: 'The class chat "10b 🔥" has 31 people in it, and right now all of them are looking at the same video: your classmate Dato falling in PE. The jokes are stacking fast, and Dato is online - he sees every message. You are not watching this story. You are in it, and it will go where you push it.',
    ka: 'საკლასო ჩატში „10ბ 🔥“ 31 ადამიანია და ახლა ყველა ერთსა და იმავე ვიდეოს უყურებს: შენი თანაკლასელი დათო ფიზკულტურაზე ეცემა. ხუმრობები სწრაფად გროვდება, დათო კი ონლაინაა - ის ყველა შეტყობინებას ხედავს. შენ ამ ამბავს არ უყურებ. შენ მის შიგნით ხარ - და ის იქით წავა, საითაც შენ წასწევ.',
  },
  theory: [
    {
      en: 'The line between banter and bullying is three questions: does it repeat after "stop", is it a group against one, are both sides laughing? Banter is symmetric - bullying has a target.',
      ka: 'ხუმრობასა და ბულინგს შორის ზღვარი სამი კითხვაა: მეორდება „შეწყვიტეს“ შემდეგ? ჯგუფია ერთის წინააღმდეგ? ორივე მხარე იცინის? ხუმრობა სიმეტრიულია - ბულინგს კი სამიზნე ჰყავს.',
    },
    {
      en: 'Pile-ons run on audience. Every laughing emoji is fuel, and one message that changes the subject can take the air out of the whole thing.',
      ka: 'ჯგუფური დაცინვა აუდიტორიაზე მუშაობს. ყოველი მოცინარი ემოჯი საწვავია, ერთ თემის შემცვლელ შეტყობინებას კი მთელი ამბისთვის ჰაერის გამოცლა შეუძლია.',
    },
    {
      en: 'Silence is not neutral: the bully reads it as approval, and the target reads it as the whole class.',
      ka: 'დუმილი ნეიტრალური არ არის: მჩაგვრელი მას მოწონებად კითხულობს, სამიზნე კი - მთელ კლასად.',
    },
    {
      en: 'A private "I am with you, this is not ok" is what targets remember years later. Support does not have to be public to work.',
      ka: 'პირადი „მე შენთან ვარ, ეს ნორმალური არ არის“ ის არის, რაც სამიზნეებს წლების შემდეგაც ახსოვთ. მხარდაჭერა საჯარო არ უნდა იყოს იმისთვის, რომ იმუშაოს.',
    },
    {
      en: 'When it escalates, the ladder is: screenshot, block, report, support - plus a trusted adult. Evidence first, because screenshots survive deleted accounts.',
      ka: 'როცა საქმე მწვავდება, კიბე ასეთია: სქრინი, დაბლოკვა, დარეპორტება, მხარდაჭერა - და სანდო უფროსი. ჯერ მტკიცებულება, რადგან სქრინები წაშლილ ანგარიშებსაც გადაურჩება.',
    },
  ],
  helpStrip: {
    en: 'If a chat is targeting you right now: screenshot it, block them, and tell an adult you trust - a teacher, a parent, the school psychologist. You don’t have to handle this alone.',
    ka: 'თუ ახლა რომელიმე ჩატში სამიზნე შენ ხარ: გადაუღე სქრინი, დაბლოკე და უთხარი უფროსს, რომელსაც ენდობი - მასწავლებელს, მშობელს, სკოლის ფსიქოლოგს. ამის მარტო გამკლავება არ გიწევს.',
  },
  rounds: [
    {
      type: 'branch',
      start: 'b1',
      max: 30,
      nodes: {
        b1: {
          chat: [
            {
              name: { en: '10b 🔥 · Gio', ka: '10ბ 🔥 · გიო' },
              text: { en: '[video] DATO IN PE TODAY 💀💀 watch till the end', ka: '[ვიდეო] დათო დღეს ფიზკულტურაზე 💀💀 ბოლომდე ნახეთ' },
            },
            {
              name: { en: 'Sandro', ka: 'სანდრო' },
              text: { en: '😂😂 what a legend', ka: '😂😂 რა ლეგენდაა' },
            },
            {
              name: { en: 'Tekla', ka: 'თეკლა' },
              text: { en: 'someone turn it into a sticker 😭', ka: 'ვინმემ სტიკერად აქციოს 😭' },
            },
            {
              name: { en: 'Gio', ka: 'გიო' },
              text: { en: 'he’s such an embarrassment 💀 video of the year', ka: 'რა სასირცხვილოა 💀 წლის ვიდეო' },
            },
          ],
          scene: {
            en: 'You are in this chat. So is Dato - his online dot is lit. The messages keep coming. Your move.',
            ka: 'შენ ამ ჩატში ხარ. დათოც - მისი ონლაინის წერტილი ანთია. შეტყობინებები მოდის და მოდის. შენი სვლაა.',
          },
          choices: [
            {
              label: { en: 'Reply "😂😂" and add a joke - everyone else is', ka: 'ვუპასუხებ „😂😂“ და ხუმრობას დავამატებ - ყველა ამას აკეთებს' },
              next: 'b2',
              points: 0,
              feedback: {
                en: 'A pile-on is a performance, and performances need an audience. Your laugh was not "just one emoji" - it was fuel. And from Dato’s screen it merged into a single wall: the whole class, laughing at him as one.',
                ka: 'ჯგუფური დაცინვა წარმოდგენაა, წარმოდგენას კი მაყურებელი სჭირდება. შენი სიცილი „უბრალოდ ერთი ემოჯი“ არ ყოფილა - საწვავი იყო. დათოს ეკრანიდან კი ის ერთ კედელს შეერწყა: მთელი კლასი, ერთხმად რომ დასცინის.',
              },
            },
            {
              label: { en: 'Say nothing - I’m not laughing, but it’s not my business', ka: 'არაფერს ვიტყვი - არ ვიცინი, მაგრამ ჩემი საქმე არ არის' },
              next: 'b2',
              points: 2,
              feedback: {
                en: 'You added no fuel - that counts for something. But silence gets read twice: Gio counts you as audience, and Dato counts you as everyone else. The story is not over. You will get another chance.',
                ka: 'საწვავი არ დაუმატე - ეს რაღაცად ღირს. მაგრამ დუმილი ორჯერ იკითხება: გიო შენ მაყურებლად გთვლის, დათო კი - „ყველა დანარჩენად“. ამბავი არ დასრულებულა. კიდევ გექნება შანსი.',
              },
            },
            {
              label: { en: 'Write in the chat: "ok this got old 😴 did anyone watch the match yesterday?"', ka: 'ჩატში დავწერ: „კარგი რა, მოძველდა 😴 გუშინდელი მატჩი ნახა ვინმემ?“' },
              next: 'b2',
              points: 8,
              feedback: {
                en: 'Deflation works. Pile-ons die without laughter, and one person changing the subject gives everyone who was silently uncomfortable permission to stop. No fight, no drama - the joke just lost its air.',
                ka: 'ჰაერის გამოშვება მუშაობს. დაცინვა სიცილის გარეშე კვდება, ერთი თემის შემცვლელი კი ყველას, ვინც ჩუმად უხერხულობას გრძნობდა, გაჩერების უფლებას აძლევს. არც ჩხუბი, არც დრამა - ხუმრობას უბრალოდ ჰაერი გამოეცალა.',
              },
            },
            {
              label: { en: 'Message Dato privately: "saw the chat. it’s not funny, and you’re not alone - I’m with you"', ka: 'დათოს პირადში მივწერ: „ჩატი ვნახე. სასაცილო არ არის და მარტო არ ხარ - მე შენთან ვარ“' },
              next: 'b2',
              points: 10,
              feedback: {
                en: 'This is the message targets remember years later. In the main chat Dato sees a wall; your DM is the crack in it - proof that "everyone" was never actually everyone. Private support changes how a target survives the day more than anything posted publicly.',
                ka: 'ეს ის შეტყობინებაა, რომელიც სამიზნეებს წლების შემდეგაც ახსოვთ. საერთო ჩატში დათო კედელს ხედავს; შენი პირადი წერილი ამ კედლის ბზარია - მტკიცებულება, რომ „ყველა“ სინამდვილეში არასდროს ყოფილა ყველა. პირადი მხარდაჭერა სამიზნის დღეს უფრო ცვლის, ვიდრე ნებისმიერი საჯარო პოსტი.',
              },
            },
          ],
        },
        b2: {
          chat: [
            {
              name: { en: 'Tekla', ka: 'თეკლა' },
              text: {
                en: 'guys… someone made an account. @dato_fails - the video, memes, new posts every day 💀 kids from 10a are following it too',
                ka: 'ხალხო… ვიღაცამ ანგარიში შექმნა. @dato_fails - ის ვიდეო, მემები, ყოველდღე ახალი პოსტები 💀 10ა-დანაც მიჰყვებიან',
              },
            },
          ],
          scene: {
            en: 'It did not stop - it upgraded. A fake meme account of Dato, gaining followers from other classes. Dato was not at school today. What now?',
            ka: 'არ შეჩერდა - გაიზარდა. დათოს ყალბი მემების ანგარიში, რომელიც სხვა კლასებიდანაც იმატებს გამომწერებს. დათო დღეს სკოლაში არ იყო. ახლა რა?',
          },
          choices: [
            {
              label: { en: 'Report the account - and go WITH Dato to a teacher he trusts', ka: 'დავარეპორტებ ანგარიშს - და დათოსთან ერთად მივალ მასწავლებელთან, რომელსაც ის ენდობა' },
              next: 'b3',
              points: 10,
              feedback: {
                en: 'The right ladder, both rungs. Impersonation accounts break platform rules - reports take them down fast. And a fake account targeting a student is a school matter, not "drama". Going WITH Dato - not instead of him, not behind his back - keeps him in control of his own story.',
                ka: 'სწორი კიბეა, ორივე საფეხურით. ყალბი ანგარიშები პლატფორმის წესებს არღვევს - რეპორტები მათ სწრაფად შლის. მოსწავლის წინააღმდეგ შექმნილი ყალბი ანგარიში კი სკოლის საქმეა და არა „დრამა“. დათოსთან ერთად წასვლა - არა მის მაგივრად და არა მის ზურგსუკან - მას საკუთარი ამბის კონტროლს უტოვებს.',
              },
            },
            {
              label: { en: 'Tell Dato: "just ignore it, they’ll get bored"', ka: 'დათოს ვეტყვი: „უბრალოდ არ მიაქციო ყურადღება, მოსწყინდებათ“' },
              next: 'b3',
              points: 2,
              feedback: {
                en: '"Ignore it" works on one rude comment. It does not work on an account producing fresh content daily for a growing audience. That advice leaves Dato alone with it - and from the inside, that feels exactly like being abandoned. The account needs reporting, and adults need to know.',
                ka: '„არ მიაქციო ყურადღება“ ერთ უხეშ კომენტარზე მუშაობს. ის არ მუშაობს ანგარიშზე, რომელიც ყოველდღე ახალ კონტენტს უშვებს მზარდი აუდიტორიისთვის. ეს რჩევა დათოს ამასთან მარტო ტოვებს - შიგნიდან კი ეს ზუსტად მიტოვებას ჰგავს. ანგარიშს რეპორტი სჭირდება, უფროსებმა კი უნდა იცოდნენ.',
              },
            },
            {
              label: { en: 'Screenshot everything as evidence and offer to go with him to the school psychologist', ka: 'ყველაფერს სქრინებად შევინახავ მტკიცებულებად და შევთავაზებ, ერთად მივიდეთ სკოლის ფსიქოლოგთან' },
              next: 'b3',
              points: 8,
              feedback: {
                en: 'Strong: evidence saved before posts vanish, and a trained adult in the loop who knows how the school handles this. One rung missing - report the account to the platform too. Impersonation accounts come down fast once reported.',
                ka: 'ძლიერია: მტკიცებულება შენახულია, სანამ პოსტები გაქრება, საქმეში კი ჩართულია მომზადებული უფროსი, რომელმაც იცის, როგორ უმკლავდება ამას სკოლა. ერთი საფეხური აკლია - ანგარიში პლატფორმაზეც დაარეპორტე. ყალბი ანგარიშები რეპორტის შემდეგ სწრაფად იშლება.',
              },
            },
          ],
        },
        b3: {
          chat: [
            {
              name: { en: 'Gio', ka: 'გიო' },
              text: {
                en: 'lol the account got deleted. who reported it? 🙄 nobody can take a joke anymore',
                ka: 'ხახა, ანგარიში წაშლილა. ვინ დაარეპორტა? 🙄 ხალხს ხუმრობა აღარ ესმის',
              },
            },
          ],
          scene: {
            en: 'The chat goes quiet. Everyone sees the message. A few start typing… then stop. What do you do?',
            ka: 'ჩატი ჩუმდება. შეტყობინებას ყველა ხედავს. რამდენიმე იწყებს წერას… მერე ჩერდება. შენ რას იზამ?',
          },
          choices: [
            {
              label: { en: 'Answer calmly: "it stopped being a joke when only one person wasn’t laughing. leave it."', ka: 'მშვიდად ვუპასუხებ: „ხუმრობა მაშინ დამთავრდა, როცა მხოლოდ ერთი აღარ იცინოდა. საკმარისია.“' },
              next: 'bEnd',
              points: 10,
              feedback: {
                en: 'One calm sentence and the "just a joke" defense collapses - a joke needs everyone laughing, including the person in it. No insult, no new fight: a boundary, stated once. That is what changes a chat’s rules for good.',
                ka: 'ერთი მშვიდი წინადადება - და „უბრალოდ ხუმრობის“ დაცვა ინგრევა: ხუმრობას ყველას სიცილი სჭირდება, მათ შორის იმისი, ვისზეც ხუმრობენ. არც შეურაცხყოფა, არც ახალი ჩხუბი: ერთხელ ნათქვამი ზღვარი. სწორედ ეს ცვლის ჩატის წესებს სამუდამოდ.',
              },
            },
            {
              label: { en: 'Say nothing - the account is gone, it’s over', ka: 'არაფერს ვიტყვი - ანგარიში წაიშალა, დასრულდა' },
              next: 'bEnd',
              points: 2,
              feedback: {
                en: 'Survivable - the account is down. But "nobody can take a joke" is still standing as the chat’s official story, ready for the next target. Naming it once, calmly, is what retires it.',
                ka: 'ასატანია - ანგარიში წაშლილია. მაგრამ „ხალხს ხუმრობა აღარ ესმის“ ისევ დგას, როგორც ჩატის ოფიციალური ვერსია - მზად შემდეგი სამიზნისთვის. ერთხელ, მშვიდად მისი დასახელება - აი, რა გააუქმებდა მას.',
              },
            },
            {
              label: { en: 'Go at Gio: "you’re pathetic, and everyone here thinks so"', ka: 'გიოს დავესხმები: „საცოდავი ხარ და აქ ყველა ასე ფიქრობს“' },
              next: 'bEnd',
              points: 0,
              feedback: {
                en: 'Now the chat has a new pile-on with a new target - the name changed, the game did not. The goal was never to humiliate Gio; it was to make humiliation stop being the game. Hold the line without becoming the thing you are stopping.',
                ka: 'ახლა ჩატში ახალი დაცინვაა, ახალი სამიზნით - სახელი შეიცვალა, თამაში კი არა. მიზანი გიოს დამცირება არასდროს ყოფილა; მიზანი ის იყო, რომ დამცირება თამაშად აღარ ყოფილიყო. ზღვარი ისე დაიცავი, რომ თავად არ იქცე იმად, რასაც აჩერებ.',
              },
            },
          ],
        },
        bEnd: {
          end: true,
          scene: {
            en: 'A week later the chat is back to homework, match memes and normal noise. The account never came back. On the way home, Dato catches up with you. "You know what helped most? The messages people sent me privately that night. In the chat it looked like the whole class was laughing. Privately it turned out - it was never the whole class."',
            ka: 'ერთი კვირის შემდეგ ჩატი ისევ დავალებებს, მატჩის მემებსა და ჩვეულებრივ ხმაურს დაუბრუნდა. ის ანგარიში აღარ დაბრუნებულა. სახლისკენ მიმავალს დათო გეწევა: „იცი, რა დამეხმარა ყველაზე მეტად? პირადი შეტყობინებები, იმ საღამოს რომ მომწერეს. ჩატში ისე ჩანდა, თითქოს მთელი კლასი იცინოდა. პირადში აღმოჩნდა - მთელი კლასი არასდროს ყოფილა.“',
          },
        },
      },
    },
    {
      type: 'choice',
      q: {
        en: 'Different day, different chat. This time the one posting the mocking edits is Nika - your close friend. The target is a quiet kid from the parallel class. What is the strongest move?',
        ka: 'სხვა დღე, სხვა ჩატი. ამჯერად დამცინავ სურათებს ნიკა დებს - შენი ახლო მეგობარი. სამიზნე პარალელური კლასის ჩუმი ბიჭია. რომელია ყველაზე ძლიერი სვლა?',
      },
      options: [
        { label: { en: 'Message Nika privately: "not cool, man. delete it - this isn’t you"', ka: 'ნიკას პირადში მივწერ: „კარგი არ არის, ძმაო. წაშალე - ეს შენ არ გგავს“' }, correct: true },
        { label: { en: 'Shame him in front of the whole chat, so he feels what it’s like', ka: 'მთელი ჩატის წინაშე შევარცხვენ, რომ თავად იგრძნოს, როგორია' }, correct: false },
        { label: { en: 'Stay out of it - he’s my friend, and it’s not my fight', ka: 'არ ჩავერევი - ჩემი მეგობარია და ეს ჩემი ჩხუბი არ არის' }, correct: false },
      ],
      explain: {
        en: 'Calling IN beats calling out. A private "not cool, delete it" gives Nika a way to back down without losing face - which is exactly why it works. Public shaming forces him to defend the joke to save status, and the pile-on just gets a second front. Silence tells him his closest friend signed off on it. If the private message fails, THEN escalate - but you start with the door, not the wall. Friends are the only people a bully actually listens to.',
        ka: 'მეგობრის გვერდზე გამოხმობა ჯობს მის საჯარო შერცხვენას. პირადი „კარგი არ არის, წაშალე“ ნიკას აძლევს გზას, უკან დაიხიოს სახის დაკარგვის გარეშე - და სწორედ ამიტომ მუშაობს. საჯარო შერცხვენა აიძულებს, ხუმრობა სტატუსის გადასარჩენად დაიცვას - და დაცინვას მეორე ფრონტი ემატება. დუმილი კი ეუბნება, რომ უახლოესმა მეგობარმა მოუწონა. თუ პირადი შეტყობინება არ გაჭრის, მაშინ აწიე საფეხური - მაგრამ იწყებ კარით და არა კედლით. მეგობრები ერთადერთი ხალხია, რომელსაც მჩაგვრელი ნამდვილად უსმენს.',
      },
    },
    {
      type: 'flags',
      prompt: {
        en: 'Five messages from different chats. Flag the ones that are bullying - and leave the banter alone. The line is real; find it.',
        ka: 'ხუთი შეტყობინება სხვადასხვა ჩატიდან. მონიშნე ის, რაც ბულინგია - ხუმრობას კი ნუ შეეხები. ზღვარი ნამდვილად არსებობს; იპოვე.',
      },
      items: [
        {
          text: {
            en: '(main chat, third day in a row, after Sandro asked them to stop) "aand here’s Sandro with the museum-piece phone again 😂 does it run Snake?"',
            ka: '(საერთო ჩატი, ზედიზედ მესამე დღე, მას შემდეგ, რაც სანდრომ სთხოვა, შეეწყვიტათ) „ისევ სანდრო თავისი მუზეუმის ექსპონატი ტელეფონით 😂 „გველი“ თუ ეშვება მაგაზე?“',
          },
          flag: true,
          explain: {
            en: 'The joke ended the day Sandro said stop. Continuing after that - daily, in front of the group - is repetition aimed at one person: the definition of bullying, no slur required.',
            ka: 'ხუმრობა იმ დღეს დასრულდა, როცა სანდრომ თქვა „შეწყვიტეთ“. ამის შემდეგ გაგრძელება - ყოველდღე, მთელი ჯგუფის წინაშე - ერთ ადამიანზე მიმართული გამეორებაა: ბულინგის განმარტება, უხეში სიტყვების გარეშეც.',
          },
        },
        {
          text: {
            en: 'Side chat: "I’ve got a photo of Tekla asleep in class 😂 should I post it in the main group?"',
            ka: 'გვერდითი ჩატი: „თეკლას ფოტო მაქვს, გაკვეთილზე რომ ჩაეძინა 😂 საერთო ჯგუფში დავპოსტო?“',
          },
          flag: true,
          explain: {
            en: 'Tekla has not seen the photo and cannot say no to it. Sharing someone’s embarrassing moment without their consent is the attack itself - the friendly tone changes nothing.',
            ka: 'თეკლას ეს ფოტო არ უნახავს და უარს ვერ იტყვის. ვინმეს უხერხული მომენტის მისივე თანხმობის გარეშე გავრცელება თავად თავდასხმაა - მეგობრული ტონი ვერაფერს ცვლის.',
          },
        },
        {
          text: {
            en: 'New group created: "everyone except Gio" - "don’t tell him about Saturday, let him find out from the stories after"',
            ka: 'შექმნილია ახალი ჯგუფი: „ყველა გიოს გარდა“ - „შაბათზე არაფერი უთხრათ, მერე სთორებიდან გაიგოს“',
          },
          flag: true,
          explain: {
            en: 'Not a single insult - and still bullying. Organized exclusion turns the group itself into the weapon: everyone against one, by design.',
            ka: 'არც ერთი შეურაცხყოფა - და მაინც ბულინგია. ორგანიზებული გარიყვა თავად ჯგუფს აქცევს იარაღად: ყველა ერთის წინააღმდეგ, განზრახ.',
          },
        },
        {
          text: {
            en: 'After a FIFA match: Dato - "you’re hopeless at this game 😂", Nika - "rematch right now, I’ll destroy you 😂"',
            ka: 'FIFA-ს მატჩის შემდეგ: დათო - „უიმედო ხარ ამ თამაშში 😂“, ნიკა - „ახლავე რევანში, გაგანადგურებ 😂“',
          },
          flag: false,
          explain: {
            en: 'Both are laughing, both throw the same punches, and either one could stop it any time. Banter is symmetric - no target, no crowd, no fear.',
            ka: 'ორივე იცინის, ორივე ერთნაირად პასუხობს და ნებისმიერს ნებისმიერ დროს შეუძლია გაჩერება. ხუმრობა სიმეტრიულია - არც სამიზნეა, არც ბრბო, არც შიში.',
          },
        },
        {
          text: {
            en: 'Mid-argument about the match, between two friends who argue like this every week: "wow, a true football professor 🙄"',
            ka: 'კამათის შუაგულში მატჩზე, ორ მეგობარს შორის, რომლებიც ასე ყოველ კვირას კამათობენ: „ვაუ, ნამდვილი ფეხბურთის პროფესორი 🙄“',
          },
          flag: false,
          explain: {
            en: 'Sharp and sarcastic - and fair. A one-on-one argument between equals, where both give as good as they get, is conflict, not bullying. Calling every conflict "bullying" wears the word out for when it is real.',
            ka: 'მწარეა და სარკასტული - მაგრამ თანაბარი. კამათი ორ თანასწორს შორის, სადაც ორივე ერთნაირად პასუხობს, კონფლიქტია და არა ბულინგი. თუ ყველა კონფლიქტს ბულინგს დავარქმევთ, სიტყვა გაცვდება სწორედ მაშინ, როცა ნამდვილად დაგვჭირდება.',
          },
        },
      ],
      explain: {
        en: 'The line is three questions. Repetition: does it continue after "stop"? Power: is it a group against one, or someone who cannot answer back? Consent: are both laughing, or is one being laughed at? A yes on either of the first two - or a no on the last - and it stopped being banter.',
        ka: 'ზღვარი სამი კითხვაა. გამეორება: გრძელდება „შეწყვიტეს“ შემდეგ? ძალა: ჯგუფია ერთის წინააღმდეგ, ან ისეთი ვინმეს წინააღმდეგ, ვინც პასუხს ვერ სცემს? თანხმობა: ორივე იცინის თუ ერთზე იცინიან? თუ პირველ ორზე პასუხი „კი“ არის - ან ბოლოზე „არა“ - ეს ხუმრობა აღარ არის.',
      },
    },
    {
      type: 'choice',
      q: {
        en: 'Last one. The pile-on is aimed at you - or at someone you’re helping. Which sequence actually works?',
        ka: 'ბოლო. სამიზნე შენ ხარ - ან ის, ვისაც ეხმარები. რომელი თანმიმდევრობა მუშაობს რეალურად?',
      },
      options: [
        {
          label: {
            en: 'Screenshot → block → report → support (and tell a trusted adult)',
            ka: 'სქრინი → დაბლოკვა → დარეპორტება → მხარდაჭერა (და სანდო უფროსისთვის თქმა)',
          },
          correct: true,
        },
        {
          label: {
            en: 'Delete every message so nobody ever sees them, then block',
            ka: 'ყველა შეტყობინების წაშლა, რომ ვერავინ ნახოს, და მერე დაბლოკვა',
          },
          correct: false,
        },
        {
          label: {
            en: 'First reply with everything they deserve - you can screenshot the fight later',
            ka: 'ჯერ ვუპასუხო ყველაფერი, რასაც იმსახურებენ - ჩხუბის სქრინს მერეც მოვასწრებ',
          },
          correct: false,
        },
      ],
      explain: {
        en: 'Evidence first: screenshots survive deleted accounts and "I never said that". Then block - contact ends on your terms. Then report, to the platform and to an adult at school: harassment and fake accounts break the rules of both. Support runs through all of it - the target’s day matters more than the bully’s punishment. Deleting destroys the proof; raging first hands them the reaction they wanted and muddies the record you will need.',
        ka: 'ჯერ მტკიცებულება: სქრინები გადაურჩება წაშლილ ანგარიშებსაც და „მე ეგ არ მითქვამს“-საც. მერე დაბლოკვა - კონტაქტი შენი პირობებით სრულდება. მერე დარეპორტება პლატფორმაზე და სკოლაში უფროსთან: შევიწროება და ყალბი ანგარიშები ორივეს წესებს არღვევს. მხარდაჭერა კი ყველაფერს გასდევს - სამიზნის დღე უფრო მნიშვნელოვანია, ვიდრე მჩაგვრელის დასჯა. წაშლა მტკიცებულებას ანადგურებს; ჯერ აფეთქება კი მათ სწორედ იმ რეაქციას აძლევს, რომელსაც ელოდნენ, და შლის კვალს, რომელიც შენ დაგჭირდება.',
      },
    },
  ],
  takeaways: [
    {
      en: 'Pile-ons run on audience. Take away the laughter and they die - one message that changes the subject is often enough.',
      ka: 'ჯგუფური დაცინვა აუდიტორიით საზრდოობს. წაართვი სიცილი - და კვდება. ერთი თემის შემცვლელი შეტყობინებაც ხშირად საკმარისია.',
    },
    {
      en: 'The private message is what targets remember years later. "I’m with you, this isn’t ok" costs thirty seconds.',
      ka: 'პირადი შეტყობინება ის არის, რაც სამიზნეებს წლების შემდეგაც ახსოვთ. „მე შენთან ვარ, ეს ნორმალური არ არის“ ოცდაათი წამი ღირს.',
    },
    {
      en: 'Silence is not neutral: the bully reads it as approval, and the target reads it as the whole class.',
      ka: 'დუმილი ნეიტრალური არ არის: მჩაგვრელი მას მოწონებად კითხულობს, სამიზნე კი - მთელ კლასად.',
    },
    {
      en: 'Banter vs bullying is three questions: does it repeat after "stop", is the power equal, are both laughing?',
      ka: 'ხუმრობასა და ბულინგს სამი კითხვა მიჯნავს: მეორდება „შეწყვიტეს“ შემდეგ? ძალები თანაბარია? ორივე იცინის?',
    },
    {
      en: 'When it escalates: screenshot, block, report, support. And a friend who is the bully gets a private "delete it" before a public war.',
      ka: 'როცა საქმე მწვავდება: სქრინი, დაბლოკვა, დარეპორტება, მხარდაჭერა. მეგობარი კი, რომელიც თავად ჩაგრავს, ჯერ პირად „წაშალეს“ იმსახურებს და არა საჯარო ომს.',
    },
  ],
}
