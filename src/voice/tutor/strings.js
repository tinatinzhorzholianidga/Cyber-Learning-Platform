/* Scripted talk-mode lines IO speaks (docs/io-voice-plan.md §6.1, B10):
   the greeting on entering talk mode, the goodbye, the mic-denied line
   and the stub session's test lines. Same rules as hints.js (თქვენ
   register, ≤ 110 characters, no emoji), linted by check-voice.mjs. IO's
   generated answers come from the tutor brain (D5), not from here. */
export const STRINGS = {
  ka: {
    greeting: 'გამარჯობა! მე იო ვარ. რა გაინტერესებთ კიბერუსაფრთხოების შესახებ?',
    returning: 'ისევ თქვენ! წინა ჯერზე {topic} ვისაუბრეთ — იქიდანვე გავაგრძელოთ?',
    returningPlain: 'ისევ თქვენ! მიხარია, რომ დაბრუნდით. რაზე ვისაუბროთ დღეს?',
    goodbye: 'კარგი, დღეს ამით დავასრულოთ. როცა მოგინდებათ, ისევ აქ ვარ.',
    micDenied: 'მიკროფონი ვერ ჩავრთე. დაწერეთ კითხვა და გიპასუხებთ.',
    stubReply: 'ეს საცდელი რეჟიმია — ხმა და პირი ერთად მოძრაობს, ნამდვილი პასუხები მოგვიანებით დაემატება.',
    stubHeard: 'ხმა მივიღე — საცდელ რეჟიმში ტექსტი არ იწერება.',
    stubSilence: 'ვერაფერი გავიგონე. სცადეთ კიდევ ერთხელ ან დაწერეთ კითხვა.',
  },
  en: {
    greeting: "Hi! I'm IO. What would you like to know about cybersecurity?",
    returning: 'Welcome back! Last time we talked about {topic} — shall we pick up from there?',
    returningPlain: "Welcome back! Good to see you again. What shall we talk about today?",
    goodbye: "All right, let's stop here for today. I'm here whenever you need me.",
    micDenied: "I couldn't turn the microphone on. Type your question and I'll answer.",
    stubReply: 'This is test mode — the voice and the mouth move together; real answers come later.',
    stubHeard: 'I heard you — test mode does not write down the words.',
    stubSilence: 'I heard nothing. Try again or type your question.',
  },
}
