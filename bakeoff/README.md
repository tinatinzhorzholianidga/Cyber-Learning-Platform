# IO voice bake-off (Gate G1)

Which voice speaks for IO? Three free candidates (docs/io-voice-plan.md §6.2, decision A7), rated
by ear on the same seven lines from `src/content/hints.js`. Audio files in this folder are
gitignored; only this sheet is committed.

## The lines

| # | Key | Georgian | Sounds exercised |
|---|---|---|---|
| 1 | `greeting[0]` | მე იო ვარ, თქვენი გზამკვლევი კიბერუსაფრთხოების სამყაროში. კეთილი იყოს თქვენი მობრძანება! | ქ ×2, ყ ×2, -რთხ-, -ბრძ- |
| 2 | `basicCourse[3]` | კურსის ბოლოს 100-კითხვიანი ტესტია. 70 სწორი პასუხი — და სერტიფიკატი თქვენია. სამი ცდა გაქვთ. | წ, ქ ×2, numerals, em-dash pause |
| 3 | `kidsPlatform[3]` | კიბერგმირზე მეც ვცხოვრობ — მისიებში ბავშვებს გვერდით ვუდგავარ. ბოლოს კი ამოსაბეჭდი სერტიფიკატია. | ჭ, ვცხ-, -ვშვ- |
| 4 | `certificate[0]` | საბაზისო კურსის სერტიფიკატს ტესტში 100-დან 70 სწორი პასუხით მიიღებთ. სამი ცდა გაქვთ — ნუ იჩქარებთ. | წ, ღ, ქ ×2, `100-დან` |
| 5 | `encouragement[3]` | აქ არასწორი არჩევანი არ არსებობს — ორივე გზა კარგ ადგილას მიგიყვანთ. | ქ, წ, ყ |
| 6 | `farewell[0]` | მალე შევხვდებით! რობოტს არც სახე ავიწყდება, არც სტუმარი. 👋 | წ, ყ, -ვხვდ-; the emoji is stripped before synthesis |
| 7 | `evening[0]` | საღამო მშვიდობისა! დღე იწურება, სწავლისთვის კი არასდროსაა გვიან. მე აქ ვარ. | ღ ×2 (optional) |

The exact text each candidate reads is `BAKEOFF_LINES[n].speak.ka` in `src/voice/dev/bakeoffLines.js`
(emoji and markup removed, nothing else changed).

## How to produce the candidates

1. **Browser voices (Edge: Giorgi, Eka)** — `npm run dev`, open
   `http://localhost:5173/IO-for-main-page/?bakeoff=1` in **Edge** (then Chrome). The page lists the
   voices, speaks the seven lines per voice, and measures word-boundary events (the mouth sync of
   D2 depends on them), the first-boundary latency, the duration and any errors. *Copy sheet rows*
   puts the measured columns on the clipboard in the table format below; *Download JSON* keeps the
   raw log. Browser audio cannot be captured to a file from the page; rate it live or record the
   laptop's output with the OS recorder.
2. **Gemini TTS voices** — with `IO_GEMINI_KEY` in `.env.local`: `npm run bakeoff` writes
   `bakeoff/gemini-<voice>-<n>.wav` and `…-hint.wav` (the same line with the language named in the
   prompt) for Charon, Puck, Orus, Achird and Iapetus; `-- --extra` adds Umbriel and Fenrir;
   `-- --lang=en` does the English lines. Run `npm run smoke:voice` first: it prints which models
   the key can use and the quota text of any 429.
3. **The Live model's own voice** — `npm run bakeoff -- --only-live` (or `--live` together with
   TTS) opens one Live session per voice, sends each line as a text turn and writes
   `bakeoff/live-<voice>-<n>.wav` with the transcript match printed (how much of the line the
   model actually read). If every connect fails with a quota error, the key has no Live quota: G1(c)
   is "no".

## Rating sheet

Scores 1–5 (5 = best). *Boundaries*, *first boundary* and *duration* come from the `?bakeoff=1` page
for browser voices (leave them empty for Gemini files). One row per voice and line; add the
candidate's source in the voice name, e.g. `Giorgi (Edge)`, `Charon (TTS)`, `Charon (Live)`.

| Voice | Line | Boundaries (word/all) | First boundary ms | Duration ms | Errors | Naturalness | ქ/ყ/წ/ჭ/ღ | Pace | Warmth | Comments |
|---|---|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |  |  |  |

Per voice, after all lines (average the four scores, then decide):

| Voice | Naturalness | ქ/ყ/წ/ჭ/ღ | Pace | Warmth | Verdict |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## Decision (Gate G1)

Fill in, then set the values in `.env.local` (and the repository variable `VITE_IO_VOICE_DEFAULT`
for the deployed preview).

- **G1(a) browser voice:** `VITE_IO_VOICE_NAME=` ______ (Giorgi / Eka / other). Word boundaries
  fire for it: yes / no (no → the mouth uses the sine fallback, §5.5).
- **G1(b) Gemini voice:** `VITE_IO_GEMINI_VOICE=` ______ (or "none usable"). With or without the
  language hint in the prompt: ______.
- **G1(c) the key has Live quota:** yes / no → `VITE_IO_LIVE_OK=` ______.
- **G1(d) Live's Georgian is good enough for the Georgian default:** yes / no →
  `VITE_IO_VOICE_DEFAULT=` ______ (`browser`, `live`, `turn`, or per language such as
  `ka=browser,en=live`).
- Chat model with a usable free quota (from the smoke test): `VITE_IO_CHAT_MODEL=` ______.
- Rated by: ______ · date: ______ · machine and browser versions: ______
