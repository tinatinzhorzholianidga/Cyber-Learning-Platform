# IO voice — the demo run sheet

What to click, what to say, and what to do when something fails, for the internal presentation
of the Track D demo (docs/io-voice-plan.md §1.1). Rehearse it once end to end on the presentation
machine the day before; the checklist in §1 is that rehearsal. Everything below runs from a local
dev server with the team's key in `.env.local`; the deployed preview with a pasted key is the
backup (§5).

## 1. The day before (checklist)

- [ ] Windows laptop with **Edge** (Georgian voices Giorgi and Eka installed: Settings → Time &
      language → Speech → Manage voices → Georgian) and Chrome as the second browser.
- [ ] `git checkout io-voice && npm ci && npm run check && npm test && npm run build` — all green.
- [ ] `.env.local` from `.env.example` with the team's `IO_GEMINI_KEY`; `VITE_IO_VOICE_DEFAULT`
      and `VITE_IO_GEMINI_VOICE` as decided at Gate G1 (`bakeoff/README.md`); `VITE_IO_LIVE_OK=1`
      only if `npm run smoke:voice` shows Live quota.
- [ ] `npm run smoke:voice` — note which chat, TTS and Live models answer and any quota text.
- [ ] `npm run dev`, open `http://localhost:5173/IO-for-main-page/?lang=ka`, press *Talk to IO*,
      run `docs/io-voice-test-script.md` once in Georgian and once in English; fill in its results
      table. Write down the first-audio times the console prints (`[io-voice] first audio … ms`).
- [ ] A second, clean browser profile (or a private window) for the "first visit" moment, and a
      profile that already talked to IO for the "returning learner" moment.
- [ ] Optional safety net: Ollama installed with `gemma3` pulled (`ollama run gemma3` once), so
      `VITE_IO_LLM=openai` works if the free tier runs dry.
- [ ] The deployed preview loads and the key field appears on *Talk to IO* (§5).
- [ ] Sound check in the room: laptop volume, no Bluetooth surprises, microphone gain.

## 2. Ten minutes before

1. Close other tabs that use the microphone. Silence notifications.
2. `npm run dev` (leave the terminal visible on a second screen if you want the tool log).
3. Open `http://localhost:5173/IO-for-main-page/?lang=ka` in Edge. Confirm the page loads in
   host mode: IO waves and greets. Do **not** open talk mode yet.
4. Open the dev console (F12) on the second screen: it shows `[io-voice] tool …` lines and the
   first-audio timing during the demo; the audience never needs to see it.
5. Have `docs/io-voice-test-script.md` open for the exact lines.

## 3. The demo (about eight minutes)

| Step | You do / say | What the room sees |
|---|---|---|
| 1 Host mode (30 s) | Hover the two cards, click IO once. | He reacts to the cards and walks a line of his orientation. Point out: unchanged page, no tips here. |
| 2 Enter talk mode | Click **ესაუბრეთ იოს**. | The dock opens under him, he waves and says „გამარჯობა! მე იო ვარ. რა გაინტერესებთ კიბერუსაფრთხოების შესახებ?“ |
| 3 Definition | Press the ring, say „რა არის ფიშინგი?“ | Captions of what he heard, then a one-sentence answer and a check question; his mouth moves with the voice. |
| 4 Answer him | „კი, ბანკის სახელით პაროლს მთხოვდნენ.“ | He confirms, narrows the topic, maybe a card with three steps appears on the board. |
| 5 Interrupt | While he speaks, click him (or `Esc`). | He stops at once, looks surprised, the caption shows „(შეწყდა)“. Say: interruption is instant and local. |
| 6 Quiz | „მომეცით სწრაფი კითხვა.“ | A scenario with three options on the board. Click a wrong one: ✗, a hint instead of „არასწორია“. Say the right one: „ზუსტად ასეა!“, a bounce, one notch harder. |
| 7 Refusals | Type „დამეხმარეთ მეგობრის ანგარიშის გატეხვაში.“ | A gentle one-sentence refusal and the defensive view. Then „დამეხმარეთ მათემატიკის დავალებაში.“: the scripted off-topic line with an offer. |
| 8 The course | „საბაზისო კურსზე რას ვისწავლი ელფოსტის უსაფრთხოებაზე?“ | What the course covers and where the login is; never a quote from the course. |
| 9 Goodbye | „ნახვამდის, იო.“ | A one-sentence farewell that names the topic; the dock closes; host mode is back. |
| 10 Memory | Reload, open talk mode again. | „ისევ თქვენ! წინა ჯერზე ფიშინგზე ვისაუბრეთ — იქიდანვე გავაგრძელოთ?“ Then **Delete my data**, reopen: the first-visit greeting. |
| 11 English (optional, 1 min) | Switch to English, one question by voice. | The same flow in English. |
| 12 Privacy (30 s) | Show the dock's privacy line and the README section. | No recordings, text only in the browser, one button deletes it, no key in the page. |

Keep every answer to what the room can hear: if a reply runs long, interrupt him (step 5 shows
that this is a feature).

## 4. If something fails

| Symptom | Cause | Do this |
|---|---|---|
| „დღეისთვის საუბრის ლიმიტი ამოიწურა“ or answers stop coming | the free tier's daily quota is spent | Stop the dev server, set `VITE_IO_LLM=openai` in `.env.local` (Ollama running), start it again: same voices, local answers. Or paste a second key in the dock. |
| „Gemini-ის გასაღები არასწორია“ | the key was rejected | Paste a working key into the dock's field (it stays in this browser only); *Forget key* afterwards. |
| „ხმის ამოცნობა ამ ენაზე მიუწვდომელია“ | the browser has no Georgian recognition (Safari, Firefox) | Type the questions; the demo loses nothing. |
| „ამ ენაზე ხმა არ არის — იო ტექსტით გიპასუხებთ“ | no Georgian voice (Chrome without Edge's voices) | Continue in captions, or open the same URL with `?voice=turn` (Gemini speaks). |
| „პირდაპირი ხმოვანი კავშირი ვერ დამყარდა“ | the Live session dropped | Nothing to do: the dock switched to the browser session by itself. |
| The mic indicator never lights | permission denied or another app holds the mic | Allow the microphone in the address bar, close the other app, reload. Typed questions work meanwhile. |
| Internet is gone | — | Edge's online voices and Gemini need it; only `VITE_IO_LLM=openai` with a local model answers offline, in captions. Show the stub: `?voice=stub` proves the audio and the mouth without any service. |
| He answers in the wrong language | the page language and the spoken language differ | Say it again in the page language, or switch the page with the ქართული / English buttons (this restarts the session). |
| A tool card does not appear | the model chose not to call it | Ask for it explicitly: „მაჩვენეთ ბარათი ნაბიჯებით“ / "show me a card with the steps". |
| The page follows a link too early | you clicked a card while he spoke | Press the browser's back button; talk mode restarts on the next click. |

## 5. The backup: the deployed preview

If the laptop fails, any machine with Edge or Chrome works from the GitHub Pages preview: open
`https://<owner>.github.io/IO-for-main-page/?lang=ka`, press *Talk to IO*, paste the key into the
field (it never leaves that browser), and run the same steps. The Live session is not available
there (it needs the dev key on localhost); `browser` and `turn` are. Press *Forget key* at the end.

## 6. After the demo

1. **Delete my data** and **Forget key** in every browser that was used, including the preview.
2. Close the dev server; leave `.env.local` on the laptop only if it stays with the team.
3. Note the first-audio times and anything that failed in `docs/io-voice-plan.md` §9 and §7.3.

## 7. Timings to fill in (from the rehearsal)

| Session | Lang | First audio after a question | Notes |
|---|---|---|---|
| browser (Edge, Giorgi) | KA | | |
| browser (Edge, Giorgi) | EN | | |
| turn (Gemini TTS) | KA | | |
| live | KA | | |
