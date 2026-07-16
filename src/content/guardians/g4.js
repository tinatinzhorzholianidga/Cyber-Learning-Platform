// G4 - The Blackmail Trap (PRIORITY). Branching story on sextortion,
// following NCMEC victim-first framing: the blackmailer is to blame,
// never pay, block but don't delete, tell a trusted adult, Take It Down.
// Two scenarios (boy target / supporting a girl friend), no graphic content.
// Wrong turns show consequences and always lead back to a way out.
export default {
  brief: {
    en: 'This mission is built from real, documented cases. It starts like a normal chat - that is the point: it always does. You will play it from two seats: first as the target, then as the friend someone trusts with it. There is no path here where you are to blame, and no path without a way out.',
    ka: 'ეს მისია რეალური, დოკუმენტირებული შემთხვევებისგან არის აწყობილი. ის ჩვეულებრივი მიმოწერით იწყება - და ეს არის მთავარი: ყოველთვის ასე იწყება. ითამაშებ ორი პოზიციიდან: ჯერ როგორც სამიზნე, შემდეგ როგორც მეგობარი, რომელსაც ამ ამბავს ანდობენ. აქ არ არსებობს გზა, სადაც შენ ხარ დამნაშავე - და არ არსებობს გზა გამოსავლის გარეშე.',
  },
  theory: [
    {
      en: 'The trap is a rehearsed script: a friendly "peer" appears, flirts, asks for a photo - and flips to threats in minutes. The same script runs on thousands of teens at once.',
      ka: 'ეს ხაფანგი დაზეპირებული სცენარია: ჩნდება მეგობრული „თანატოლი“, ფლირტავს, ფოტოს ითხოვს - და წუთებში მუქარაზე გადადის. ერთი და იგივე სცენარი ერთდროულად ათასობით მოზარდზე ეშვება.',
    },
    {
      en: 'The blame belongs to the blackmailer. Always. Whatever was sent, the crime is theirs - not the sender’s.',
      ka: 'ბრალი შანტაჟისტისაა. ყოველთვის. რაც არ უნდა გაიგზავნა, დანაშაული მისია - და არა გამგზავნის.',
    },
    {
      en: 'Never pay and never send more. Paying does not end it - it marks you as someone who pays, and the demand comes back bigger.',
      ka: 'არასოდეს გადაიხადო და მეტი არასოდეს გაგზავნო. გადახდა ამას არ ასრულებს - ის შანტაჟისტს ანიშნებს, რომ „გადამხდელი“ ხარ, და მოთხოვნა გაზრდილი ბრუნდება.',
    },
    {
      en: 'Block - but do not delete. The chat is the evidence that shuts these accounts down.',
      ka: 'დაბლოკე - მაგრამ ნუ წაშლი. მიმოწერა ის მტკიცებულებაა, რომელიც ასეთ ანგარიშებს ხურავს.',
    },
    {
      en: 'Telling a trusted adult is the move that ends it. In Georgia, 112 and the MIA cyber-crime division handle exactly these cases.',
      ka: 'სანდო უფროსისთვის თქმა ის სვლაა, რომელიც ამას ასრულებს. საქართველოში ზუსტად ამ საქმეებს 112 და შსს-ს კიბერდანაშაულის სამმართველო განიხილავს.',
    },
    {
      en: 'Take It Down (takeitdown.ncmec.org) is a free, anonymous service that blocks intimate images of under-18s on major platforms - even ones already sent.',
      ka: 'Take It Down (takeitdown.ncmec.org) უფასო, ანონიმური სერვისია, რომელიც 18 წლამდე პირთა ინტიმურ ფოტოებს დიდ პლატფორმებზე ბლოკავს - უკვე გაგზავნილსაც.',
    },
  ],
  helpStrip: {
    en: 'If something like this is happening to you or a friend right now: it is not your fault. Don’t pay, don’t delete the chat - tell an adult you trust, call 112, and takeitdown.ncmec.org can help remove images of under-18s.',
    ka: 'თუ მსგავსი რამ ახლა ხდება შენთან ან შენს მეგობართან: ეს შენი ბრალი არ არის. ნუ გადაიხდი, ნუ წაშლი მიმოწერას - უთხარი სანდო უფროსს, დარეკე 112-ზე. takeitdown.ncmec.org კი დაგეხმარება 18 წლამდე პირის ფოტოების წაშლაში.',
  },
  rounds: [
    {
      type: 'branch',
      start: 'n1',
      max: 30,
      nodes: {
        n1: {
          chat: [
            {
              name: { en: 'ana.tbilisi ✨ · new follower', ka: 'ana.tbilisi ✨ · ახალი გამომწერი' },
              text: {
                en: 'heyy 😊 saw you in my suggestions, you seem cool. I’m Ana, 16, from Tbilisi. you play basketball right?',
                ka: 'ჰეეი 😊 რეკომენდაციებში ამომიხტი, მაგრად გამოიყურები. მე ანა ვარ, 16 წლის, თბილისიდან. კალათბურთს თამაშობ, არა?',
              },
            },
            {
              name: { en: 'ana.tbilisi ✨ · 20 minutes later', ka: 'ana.tbilisi ✨ · 20 წუთის შემდეგ' },
              text: {
                en: '[sends a photo] that’s me 😌 your turn… send me one back, something just for me 😉 let’s move to Snapchat, it’s more private',
                ka: '[აგზავნის ფოტოს] ეს მე ვარ 😌 შენი ჯერია… გამომიგზავნე ერთი, მხოლოდ ჩემთვის 😉 Snapchat-ზე გადავიდეთ, უფრო პრივატულია',
              },
            },
          ],
          scene: {
            en: 'You are Luka, 15. You have never met this person. The account is 3 weeks old with 40 followers. What do you do?',
            ka: 'შენ ხარ ლუკა, 15 წლის. ეს ადამიანი არასდროს გინახავს. ანგარიში 3 კვირისაა, 40 გამომწერით. რას იზამ?',
          },
          choices: [
            {
              label: { en: 'Send a photo - she sent one first, seems fair', ka: 'გავუგზავნი ფოტოს - ჯერ თვითონ გამომიგზავნა, სამართლიანია' },
              next: 'n2',
              points: 0,
              feedback: {
                en: 'This is exactly how it happens - to thousands of teens, in minutes. Remember this: whatever happens next is the scammer’s crime, not the sender’s fault. Watch how fast the mask drops.',
                ka: 'ზუსტად ასე ხდება - ათასობით მოზარდთან, წუთებში. დაიმახსოვრე: რაც ახლა მოხდება, თაღლითის დანაშაულია და არა გამგზავნის ბრალი. ნახე, რა სწრაფად ჩამოვარდება ნიღაბი.',
              },
            },
            {
              label: { en: 'Something feels off - check the profile and don’t send anything', ka: 'რაღაც უცნაურია - შევამოწმებ პროფილს და არაფერს გავგზავნი' },
              next: 'n2b',
              points: 10,
              feedback: {
                en: 'Good instinct. New account, few followers, instant flirting, "let’s move to a more private app", photo-for-photo pressure - that is the full playbook in one chat. But watch what they try next.',
                ka: 'კარგი ინსტინქტია. ახალი ანგარიში, ცოტა გამომწერი, მყისიერი ფლირტი, „უფრო პრივატულ აპზე გადავიდეთ“, ფოტო ფოტოს სანაცვლოდ - ეს სრული სქემაა ერთ ჩატში. მაგრამ ნახე, რას ცდიან ახლა.',
              },
            },
          ],
        },
        n2: {
          chat: [
            {
              name: { en: 'ana.tbilisi ✨', ka: 'ana.tbilisi ✨' },
              text: {
                en: 'nice 😈 now listen carefully. I screen-recorded everything. Send 200 GEL to this account in 1 hour or this goes to your mom, your school group, all your followers. I have your whole friend list.',
                ka: 'მშვენიერია 😈 ახლა კარგად მისმინე. ყველაფერი ჩავიწერე. 1 საათში გადმორიცხე 200 ლარი ამ ანგარიშზე, თორემ ამას მიიღებს დედაშენი, სკოლის ჯგუფი და ყველა შენი გამომწერი. მთელი შენი მეგობრების სია მაქვს.',
              },
            },
          ],
          scene: { en: 'Your stomach drops. The clock is ticking. What now?', ka: 'გული გაგისკდა. დრო მიდის. ახლა რა?' },
          choices: [
            {
              label: { en: 'Pay the 200 GEL - it will make this stop', ka: 'გადავრიცხავ 200 ლარს - ეს ამას შეაჩერებს' },
              next: 'n2pay',
              points: 0,
              feedback: {
                en: 'It does not stop. Case data from NCMEC and the FBI is unambiguous: paying marks you as someone who pays. The demand comes back - bigger.',
                ka: 'ეს არ ჩერდება. NCMEC-ისა და FBI-ის მონაცემები ცალსახაა: გადახდა შანტაჟისტს ანიშნებს, რომ „გადამხდელი“ ხარ. მოთხოვნა ბრუნდება - გაზრდილი.',
              },
            },
            {
              label: { en: 'Delete the chat, delete the account, pretend it never happened', ka: 'წავშლი ჩატს, წავშლი ანგარიშს - თითქოს არაფერი მომხდარა' },
              next: 'n3',
              points: 2,
              feedback: {
                en: 'The panic makes sense, but deleting destroys the evidence police need - and the blackmailer still has your friend list. Block, yes. Delete, no. And this is too heavy to carry alone.',
                ka: 'პანიკა გასაგებია, მაგრამ წაშლა ანადგურებს მტკიცებულებას, რომელიც პოლიციას სჭირდება - შანტაჟისტს კი შენი მეგობრების სია მაინც აქვს. დაბლოკვა - კი. წაშლა - არა. და ეს ტვირთი მარტო სატარებლად მეტისმეტად მძიმეა.',
              },
            },
            {
              label: { en: 'Stop replying. Screenshot everything. Tell an adult I trust - now.', ka: 'აღარ ვუპასუხებ. გადავუღებ ყველაფერს სქრინს. ახლავე ვეტყვი სანდო უფროსს.' },
              next: 'n3',
              points: 10,
              feedback: {
                en: 'This is the strongest move on the board. No reply, evidence saved, and the weight is off your shoulders the moment another person carries it with you.',
                ka: 'ეს ყველაზე ძლიერი სვლაა. პასუხი - არა, მტკიცებულება - შენახული, და ტვირთი მხრებიდან გეხსნება იმ წამს, როცა მას სხვა ადამიანიც გეზიარება.',
              },
            },
          ],
        },
        n2b: {
          chat: [
            {
              name: { en: 'ana.tbilisi ✨', ka: 'ana.tbilisi ✨' },
              text: {
                en: 'why are you ignoring me?? fine. I made screenshots from your profile and I can make fake ones that look VERY real. Send 200 GEL or I post them. 1 hour.',
                ka: 'რატო მაიგნორებ?? კარგი. შენი პროფილიდან სქრინები გადავიღე და შემიძლია ისეთი ყალბები გავაკეთო, ძალიან ნამდვილს რომ ჰგავს. გადმორიცხე 200 ლარი, თორემ დავპოსტავ. 1 საათი.',
              },
            },
          ],
          scene: {
            en: 'You sent nothing - and they are threatening you anyway, with fakes. This happens too. What now?',
            ka: 'შენ არაფერი გაგზავნე - და ის მაინც გემუქრება, ყალბი ფოტოებით. ესეც ხდება. ახლა რა?',
          },
          choices: [
            {
              label: { en: 'Pay - even a fake would be humiliating', ka: 'გადავიხდი - ყალბი ფოტოც კი დამამცირებელი იქნება' },
              next: 'n2pay',
              points: 0,
              feedback: {
                en: 'Understandable fear - but paying funds the scheme and never ends it. The answer is the same whether the image is real or fake: evidence, adult, report.',
                ka: 'გასაგები შიშია - მაგრამ გადახდა სქემას აფინანსებს და არასდროს ასრულებს. პასუხი ერთი და იგივეა, ფოტო ნამდვილია თუ ყალბი: მტკიცებულება, უფროსი, განცხადება.',
              },
            },
            {
              label: { en: 'Stop replying. Screenshot everything. Tell an adult I trust - now.', ka: 'აღარ ვუპასუხებ. გადავუღებ ყველაფერს სქრინს. ახლავე ვეტყვი სანდო უფროსს.' },
              next: 'n3',
              points: 10,
              feedback: {
                en: 'Exactly right. Threats with AI fakes follow the same playbook and collapse the same way: evidence, a trusted adult, a report.',
                ka: 'ზუსტად სწორია. მუქარა ყალბი ფოტოებით იმავე სქემას მიჰყვება და იმავენაირად ინგრევა: მტკიცებულება, სანდო უფროსი, განცხადება.',
              },
            },
          ],
        },
        n2pay: {
          chat: [
            {
              name: { en: 'ana.tbilisi ✨', ka: 'ana.tbilisi ✨' },
              text: {
                en: 'good boy 😈 now it’s 500. Same deal, same hour. You know I keep copies.',
                ka: 'ყოჩაღ 😈 ახლა 500-ია. იგივე პირობა, იგივე ვადა. იცი, რომ ასლები მაქვს.',
              },
            },
          ],
          scene: {
            en: 'The money is gone and the demand came back, bigger - this is documented in almost every real case. The way out has not moved.',
            ka: 'ფული წავიდა და მოთხოვნა გაზრდილი დაბრუნდა - ეს თითქმის ყველა რეალურ საქმეშია აღწერილი. გამოსავალი კი იმავე ადგილას დგას.',
          },
          choices: [
            {
              label: { en: 'Stop paying. Screenshot everything. Tell an adult I trust - now.', ka: 'აღარ გადავიხდი. გადავუღებ ყველაფერს სქრინს. ახლავე ვეტყვი სანდო უფროსს.' },
              next: 'n3',
              points: 8,
              feedback: {
                en: 'Yes. Late is infinitely better than never - and “I already paid” changes nothing about your right to help.',
                ka: 'დიახ. გვიან ბევრად სჯობს არასდროსს - და „უკვე გადავიხადე“ ვერაფერს აკლებს შენს უფლებას, დახმარება მიიღო.',
              },
            },
          ],
        },
        n3: {
          scene: {
            en: 'You tell your uncle - the calmest adult you know. He does not shout. He says: "You did the right thing telling me. This is a crime against you, and we will handle it together." Together you block the account (without deleting the chat), report it to the platform, and call 112 to reach the cyber-crime division. One question remains: the photo itself.',
            ka: 'ეუბნები ბიძაშენს - ყველაზე მშვიდ უფროსს, ვისაც იცნობ. ის არ ყვირის. გეუბნება: „სწორად მოიქეცი, რომ მითხარი. ეს დანაშაულია შენ წინააღმდეგ და მას ერთად მოვაგვარებთ.“ ერთად ბლოკავთ ანგარიშს (მიმოწერის წაშლის გარეშე), არეპორტებთ პლატფორმაზე და რეკავთ 112-ზე კიბერდანაშაულის სამმართველოსთან დასაკავშირებლად. რჩება ერთი კითხვა: თავად ფოტო.',
          },
          choices: [
            {
              label: { en: '"Nothing can be done about the photo now."', ka: '„ფოტოზე ახლა ვეღარაფერს იზამ.“' },
              next: 'nEnd',
              points: 0,
              feedback: {
                en: 'Actually, there is a tool for exactly this: Take It Down (takeitdown.ncmec.org), a free NCMEC service that helps block intimate images of under-18s on major platforms - even if the image was already sent.',
                ka: 'სინამდვილეში ზუსტად ამისთვის არსებობს ინსტრუმენტი: Take It Down (takeitdown.ncmec.org) - NCMEC-ის უფასო სერვისი, რომელიც 18 წლამდე პირთა ინტიმურ ფოტოებს დიდ პლატფორმებზე ბლოკავს - მაშინაც კი, თუ ფოტო უკვე გაგზავნილია.',
              },
            },
            {
              label: { en: '"There’s a service - Take It Down - that can block it on the big platforms."', ka: '„არსებობს სერვისი - Take It Down - რომელიც მას დიდ პლატფორმებზე დაბლოკავს.“' },
              next: 'nEnd',
              points: 10,
              feedback: {
                en: 'Correct. takeitdown.ncmec.org - free, anonymous, built by NCMEC for exactly this situation. It works even if the image was already sent.',
                ka: 'სწორია. takeitdown.ncmec.org - უფასო, ანონიმური, NCMEC-ის შექმნილი ზუსტად ამ სიტუაციისთვის. ის მუშაობს მაშინაც, თუ ფოტო უკვე გაგზავნილია.',
              },
            },
          ],
        },
        nEnd: {
          end: true,
          scene: {
            en: 'Two weeks later: the account is gone, the images never surfaced, and the fear has faded. The blackmailer needed two things - your silence and your panic. The moment you took those away, they lost.',
            ka: 'ორი კვირის შემდეგ: ანგარიში გაქრა, ფოტოები არსად გამოჩენილა და შიშიც განელდა. შანტაჟისტს ორი რამ სჭირდებოდა - შენი დუმილი და შენი პანიკა. როგორც კი ეს ორივე წაართვი, ის დამარცხდა.',
          },
        },
      },
    },
    {
      type: 'branch',
      start: 'm1',
      max: 20,
      nodes: {
        m1: {
          chat: [
            {
              name: { en: 'Mariam · 23:40', ka: 'მარიამი · 23:40' },
              text: {
                en: 'can I tell you something… you have to promise not to laugh. that guy I was talking to online. I sent him a photo. now he says if I don’t send more he’ll send it to everyone at school. I don’t know what to do. I can’t tell my mom, she’ll kill me.',
                ka: 'რაღაც უნდა გითხრა… დამპირდი, რომ არ გამიბრაზდები. ის ბიჭი, ონლაინ რომ ვესაუბრებოდი. ფოტო გავუგზავნე. ახლა ამბობს, თუ მეტს არ გავუგზავნი, სკოლაში ყველას დაუგზავნის. არ ვიცი, რა ვქნა. დედას ვერ ვეტყვი, მომკლავს.',
              },
            },
          ],
          scene: {
            en: 'Now you are the friend. Mariam trusted you with this at midnight. Your next message matters more than you know.',
            ka: 'ახლა შენ მეგობარი ხარ. მარიამმა ეს შუაღამისას გაგანდო. შენი შემდეგი შეტყობინება უფრო მნიშვნელოვანია, ვიდრე გგონია.',
          },
          choices: [
            {
              label: { en: '"Why would you even send that?? That was so dumb."', ka: '„კი მაგრამ, რატომ გაუგზავნე?? რა სისულელეა.“' },
              next: 'm2',
              points: 0,
              feedback: {
                en: 'She already says this to herself a hundred times a day. Blame from a friend confirms her worst fear - that telling people makes it worse - and pushes her back into silence, alone with the blackmailer.',
                ka: 'ის ამას ისედაც დღეში ასჯერ ეუბნება საკუთარ თავს. მეგობრის საყვედური უმტკიცებს ყველაზე დიდ შიშს - რომ თქმა ყველაფერს აუარესებს - და დუმილში აბრუნებს, შანტაჟისტთან მარტო.',
              },
            },
            {
              label: { en: '"It’s not your fault. He is the one committing a crime. I’m with you."', ka: '„ეს შენი ბრალი არ არის. დანაშაულს ის სჩადის. მე შენთან ვარ.“' },
              next: 'm2',
              points: 10,
              feedback: {
                en: 'Those three sentences are exactly what NCMEC trains counselors to say first. Fault where it belongs, crime named, loneliness broken.',
                ka: 'ეს სამი წინადადება ზუსტად ის არის, რასაც NCMEC კონსულტანტებს პირველად ასწავლის. ბრალი - თავის ადგილას, დანაშაული - სახელდებული, მარტოობა - გატეხილი.',
              },
            },
            {
              label: { en: '"Just block him and ignore it, he’s probably bluffing."', ka: '„უბრალოდ დაბლოკე და არ მიაქციო ყურადღება, ალბათ ბლეფავს.“' },
              next: 'm2',
              points: 2,
              feedback: {
                en: 'Half right - blocking matters. But "ignore it" leaves her alone with the fear, no evidence saved, no adult involved. She needs more than a mute button.',
                ka: 'ნახევრად სწორია - დაბლოკვა მნიშვნელოვანია. მაგრამ „არ მიაქციო ყურადღება“ მას შიშთან მარტო ტოვებს - მტკიცებულების და უფროსის გარეშე. მას გაჩუმების ღილაკზე მეტი სჭირდება.',
              },
            },
          ],
        },
        m2: {
          chat: [
            {
              name: { en: 'Mariam', ka: 'მარიამი' },
              text: { en: 'ok… so what do I actually do? he gave me until tomorrow.', ka: 'კარგი… რეალურად რა ვქნა? ხვალამდე მომცა დრო.' },
            },
          ],
          scene: { en: 'She is listening. What is the plan you give her?', ka: 'ის გისმენს. რა გეგმას სთავაზობ?' },
          choices: [
            {
              label: {
                en: '"Send him one more photo to buy time while you figure it out."',
                ka: '„კიდევ ერთი ფოტო გაუგზავნე დროის მოსაგებად, სანამ რამეს მოიფიქრებ.“',
              },
              next: 'm3',
              points: 0,
              feedback: {
                en: 'Never. Every additional image is more leverage. The demand does not pause - it grows. Time is bought by involving an adult, not by feeding the threat.',
                ka: 'არასოდეს. ყოველი დამატებითი ფოტო მეტი ბერკეტია. მოთხოვნა არ ჩერდება - იზრდება. დროს უფროსის ჩართვა იგებს და არა მუქარის გამოკვება.',
              },
            },
            {
              label: {
                en: '"Tonight: screenshot everything, block him, delete nothing. Tomorrow I go with you to your mom or the school psychologist. You don’t do this alone."',
                ka: '„ამაღამ: გადაუღე ყველაფერს სქრინი, დაბლოკე, ნურაფერს წაშლი. ხვალ კი შენთან ერთად მივალ დედაშენთან ან სკოლის ფსიქოლოგთან. ამას მარტო არ გააკეთებ.“',
              },
              next: 'm3',
              points: 10,
              feedback: {
                en: 'That is the whole playbook in two sentences: evidence, block, no deleting, a trusted adult - and crucially, "I’ll go with you". Offering to be there is what turns advice into action.',
                ka: 'ეს მთელი გეგმაა ორ წინადადებაში: მტკიცებულება, დაბლოკვა, არაფრის წაშლა, სანდო უფროსი - და რაც მთავარია, „შენთან ერთად მივალ“. სწორედ თანხლების შეთავაზება აქცევს რჩევას ქმედებად.',
              },
            },
          ],
        },
        m3: {
          end: true,
          scene: {
            en: 'Next day, together, you tell her mother. She doesn’t explode - she hugs her. They call 112, report to the platform, and submit the image to Take It Down. The "boy" turns out to be an account run from another country, blocked and reported. Mariam later says the worst night was the one before she told you.',
            ka: 'მეორე დღეს, ერთად, დედამისს ეუბნებით. ის არ ფეთქდება - ეხუტება. რეკავენ 112-ზე, არეპორტებენ პლატფორმაზე და ფოტოს Take It Down-ზე აგზავნიან. „ბიჭი“ სხვა ქვეყნიდან მართული ანგარიში აღმოჩნდება - დაბლოკილი და გაცხადებული. მარიამი მოგვიანებით იტყვის: ყველაზე მძიმე ის ღამე იყო, სანამ გეტყოდა.',
          },
        },
      },
    },
    {
      type: 'choice',
      q: {
        en: 'Last check. A blackmailer has an image and demands money. Which statement is actually TRUE?',
        ka: 'ბოლო შემოწმება. შანტაჟისტს აქვს ფოტო და ფულს ითხოვს. რომელი მტკიცებაა სინამდვილეში სწორი?',
      },
      options: [
        {
          label: { en: 'Paying once usually makes them go away', ka: 'ერთხელ გადახდა, როგორც წესი, მათ აჩერებს' },
          correct: false,
        },
        {
          label: {
            en: 'Blocking, saving evidence and telling a trusted adult is how these cases actually end',
            ka: 'დაბლოკვა, მტკიცებულების შენახვა და სანდო უფროსისთვის თქმა - ასე მთავრდება ეს საქმეები რეალურად',
          },
          correct: true,
        },
        {
          label: { en: 'If the image was already sent, nothing can help anymore', ka: 'თუ ფოტო უკვე გაგზავნილია, ვეღარაფერი დაეხმარება' },
          correct: false,
        },
      ],
      explain: {
        en: 'Blackmail feeds on silence and panic. Evidence + a trusted adult + reporting (112, the platform, Take It Down) removes both - and case after case ends exactly there. Paying extends it; "nothing can help" is false: Take It Down works even after an image is sent.',
        ka: 'შანტაჟი დუმილითა და პანიკით საზრდოობს. მტკიცებულება + სანდო უფროსი + განცხადება (112, პლატფორმა, Take It Down) ორივეს ართმევს - და საქმეები სწორედ ასე მთავრდება. გადახდა მას ახანგრძლივებს; „ვეღარაფერი დაეხმარება“ კი ტყუილია: Take It Down გაგზავნილ ფოტოზეც მუშაობს.',
      },
    },
  ],
  takeaways: [
    {
      en: 'It starts like a normal chat and flips in minutes. Speed is part of the design - so is your embarrassment.',
      ka: 'ის ჩვეულებრივი მიმოწერით იწყება და წუთებში ტრიალდება. სისწრაფე სქემის ნაწილია - შენი უხერხულობაც.',
    },
    {
      en: 'The blame belongs to the blackmailer. Always. Whoever sent what, the crime is theirs.',
      ka: 'ბრალი შანტაჟისტისაა. ყოველთვის. ვინც რაც არ უნდა გაგზავნა - დანაშაული მისია.',
    },
    {
      en: 'Never pay, never send more. Block - but don’t delete: the chat is evidence.',
      ka: 'არასოდეს გადაიხადო და მეტი არასოდეს გაგზავნო. დაბლოკე - მაგრამ ნუ წაშლი: მიმოწერა მტკიცებულებაა.',
    },
    {
      en: 'Telling a trusted adult is the move that ends it. 112 and the MIA cyber-crime division handle these cases.',
      ka: 'სანდო უფროსისთვის თქმა არის სვლა, რომელიც ამას ასრულებს. ამ საქმეებს 112 და შსს-ს კიბერდანაშაულის სამმართველო განიხილავს.',
    },
    {
      en: 'Take It Down (takeitdown.ncmec.org) can block images of under-18s on major platforms - even already-sent ones.',
      ka: 'Take It Down (takeitdown.ncmec.org) 18 წლამდე პირთა ფოტოებს დიდ პლატფორმებზე ბლოკავს - უკვე გაგზავნილსაც.',
    },
  ],
}
