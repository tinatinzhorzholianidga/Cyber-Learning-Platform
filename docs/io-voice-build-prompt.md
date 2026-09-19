# Build prompt: IO (იო) as a voice AI assistant / tutor

You are working in the repository `tinatinzhorzholianidga/Cyber-Learning-Platform`.
Start from branch **`IO-for-main-page`**  **`claude/mascot-robot-demo-9oclw8`** read, analyze and Do all work on a new branch `io-voice`. Commit after every phase with a clear message.

## 0. Read first (do not skip)

Before writing any code, read these files and summarise, in `docs/io-voice-plan.md`, how each one will be touched:

| File | Why it matters |
|---|---|
| `README.md` | The product rules for IO on the main page (host role, embed mode, privacy, deploy). |
| `src/App.jsx` | The page. `IoHost` is mounted here with a `ref` (`hover / unhover / farewell`). Embed mode (`?embed=1`). |
| `src/mascot/IoHost.jsx` | IO + speech bubble. Entrance, typewriter, click cycle, `useImperativeHandle` API. **This is where the voice layer plugs in.** |
| `src/mascot/hostBrain.js` | Which scripted line IO says when, and the `MOOD` map (happy, wink, thinking, excited, celebrate, sleepy). |
| `src/mascot/RobotCanvas.jsx` | The 3D stage: WebGL check + fallback, `prefers-reduced-motion`, window pointer, keyboard tap. |
| `src/mascot/RobotModel.jsx` | The model. Props: `emotion`, `gesture {id,type:'wave'|'bounce'|'spin'}`, `talking` (mouth is currently a sine wave — line ~340: `mouthOpen = talking ? 0.25 + 0.35*(…sin(t*11)) : 0`), `follow`, `idle`, `reducedMotion`, `skin`, `variant`, `holdup`, `onTap`. |
| `src/mascot/faceTexture.js` | `drawFace()` paints eyes/mouth per emotion with `mouthOpen 0..1`. |
| `src/content/hints.js` | Everything IO says on this page (KA/EN), with typography and register rules (თქვენ, ≤110 chars, one emoji, „…“ quotes, spaced em dash). |
| `src/i18n/ui.js` | UI strings KA/EN; `initialLang()`; `?lang=`. |
| `src/styles/global.css` | DGA palette tokens (`--navy --blue --coral --kids …`), `.io-host .io-bubble .io-canvas`. |
| `scripts/check-hints.mjs` | Content checks that run in CI (`npm run check`). |

Also read, from branch **`io-chat-gemini`** of the same repository (use `git show io-chat-gemini:<path>`):

| File | Why |
|---|---|
| `src/chat/llmClient.js` | Working SSE streaming client for Gemini (`streamGenerateContent?alt=sse`), error mapping, safety-block handling. Port the streaming logic to the Worker; **do not** port the browser-side API-key handling. |
| `src/chat/useIoChat.js` | Chat state hook with a rolling 8-turn window. Reuse the shape. |
| `src/mascot/ioBrain.js` | RAG: builds ~330 bilingual chunks from the platform's content and assembles a grounded system prompt. Reuse the retrieval for `lookup_course_material`. |
| `docs/io-chatbot.md` | Architecture notes and persona/guardrail rules already agreed for IO Chat. |

Verify the current Gemini model IDs on https://ai.google.dev/gemini-api/docs/models before wiring anything; the IDs below were correct at the time of writing and are the defaults to try first.

---

## 1. Goal

Turn IO from a scripted host into a **voice AI assistant and tutor** — the same idea as Aristotle (heyaristotle.com), but with IO's existing 3D character, bilingual **Georgian-first / English**, on the elearning.gov.ge welcome page and embeddable in Moodle.

What "like Aristotle" means for us, concretely:

1. **Talk to IO out loud, hear IO answer in his own voice, and interrupt him at any time** (real barge-in, not push-to-talk only).
2. **Questions before answers.** IO teaches Socratically: for scenarios and problems he asks first; for a plain definition he gives a one-sentence anchor and then checks understanding with a question. He never dumps a lecture.
3. **A tutor that knows you.** IO remembers previous sessions (what was covered, what was hard) and picks up where the learner left off — without accounts, stored only in the learner's browser.
4. **Skills, not chats.** The subject (cybersecurity) is broken into a small skill taxonomy; IO tracks mastery per skill and offers practice tailored to weak skills.
5. **Practice problems.** IO can run short scenario quizzes ("you receive this message — what do you do?") spoken aloud and shown as a card.
6. **A board, not just a bubble.** IO can show steps, checklists and a simple diagram beside himself when speaking is not enough.
7. **Text is always an alternative.** Every voice feature has a typed equivalent; captions are always on.

Out of scope for this build: file uploads, parent reports, user accounts, server-side storage of anything personal.

### Modes (decision — keep unless told otherwise)

- **Host mode** = today's behaviour, unchanged: greeting by time of day, intro, click cycle, hover reactions, farewell. No cyber tips (README rule).
- **Talk mode** = starts when the visitor presses *Talk to IO* or types a question. In talk mode IO **may** teach cybersecurity (grounded in the platform's own course content) and route to the right course. Leaving talk mode returns to host mode. Update the README to describe this split honestly.

---

## 2. Non-negotiables

- **No API keys in the client bundle, ever.** Everything secret lives in a Cloudflare Worker (`wrangler secret`). The site stays a static GitHub Pages build.
- **Do not change how IO looks**: same model, proportions, colours, skins (`classic` / `metal`), DGA plate, palette, fonts. Only add: amplitude-driven mouth, a "listening" cue, and the voice UI around him.
- **Keep every existing behaviour** (host mode, embed mode, `?lang= ?skin= ?size=`, keyboard tap, reduced motion, WebGL fallback, `aria-live` announcements). `npm run check` must keep passing; add checks, do not weaken them.
- **Georgian first.** Georgian is the default; everything IO says or shows exists in both KA and EN; new Georgian lines follow the `hints.js` rules (თქვენ register, „…“ quotes, spaced em dash, no Latin leaks, native phrasing — no calques).
- **Privacy**: no voice recordings stored anywhere; the Worker logs no request bodies; transcripts and the learner profile live only in `localStorage`; a visible *delete my data* control; a visible "IO is listening" indicator whenever the mic is open; mic permission is requested only after a click, never on load.
- **Performance**: the welcome page must not get heavier. All voice code (`src/voice/**`, the `@google/genai` SDK, audio worklets) is a lazy chunk loaded on the first press of *Talk to IO*.
- **Accessibility**: the mic control is a real `<button>` with a state label; captions of what IO says and what the learner said are in the DOM; the transcript region is `aria-live="polite"`; keyboard: `T` or the button starts/ends talking, `Esc` interrupts; `prefers-reduced-motion` → no mouth animation, still face, captions only.
- **Embed mode must work** inside the Moodle iframe: document that the iframe needs `allow="microphone; autoplay"`; add `?voice=1` to enable the talk button in embed mode.
- Keep `src/voice/` **self-contained** (no imports from `App.jsx`), so the same module can be dropped into the CyberHero site later.

---

## 3. Architecture

```
Browser (GitHub Pages, static)                          Cloudflare Worker (worker/)
┌──────────────────────────────────────────┐            ┌───────────────────────────────┐
│ IoHost.jsx  ── mode: host | talk         │            │ POST /token  → Gemini          │
│   RobotCanvas / RobotModel (mouthLevel)  │  fetch     │   ephemeral token (uses:1,     │
│   VoiceDock.jsx (button, state, captions)│◀──────────▶│   expireTime, constraints)     │
│                                          │            │ POST /chat   → Gemini Flash    │
│ src/voice/                               │            │   (SSE stream, RAG context)    │
│   useIoVoice.js  (state machine)         │            │ POST /tts    → Gemini TTS      │
│   session/LiveVoiceSession.js  ──────────┼─WebSocket─▶│   or Azure ka-GE (adapter)     │
│   session/TurnVoiceSession.js            │  (Gemini   │ POST /stt    → Gemini Flash    │
│   audio/mic.js (worklet → PCM16 16 kHz)  │   Live API,│   audio-in transcription       │
│   audio/player.js (24 kHz queue+analyser)│   direct)  │ origin allowlist · KV rate     │
│   tutor/persona.js  tutor/skills.js      │            │ limits · no body logging       │
│   tutor/memory.js   tutor/tools.js       │            └───────────────────────────────┘
└──────────────────────────────────────────┘
```

Two interchangeable voice sessions behind one interface:

- **`LiveVoiceSession`** (primary): Gemini **Live API** over WebSocket from the browser, authenticated with a **one-use ephemeral token** minted by the Worker. Gives native VAD, barge-in, input/output transcription and function calling in one stream. Georgian (`ka`) is on the Live API language list.
- **`TurnVoiceSession`** (fallback + typed questions): STT → Worker `/chat` (streamed text) → Worker `/tts` (streamed audio), sentence-chunked so the first audio plays while the rest is still generating. Used when Live cannot connect (network, browser, quota) or when Gate G1 (below) says Live's Georgian voice is not good enough.

Both implement:

```ts
interface VoiceSession {
  start(opts: { lang: 'ka'|'en', learner: LearnerSummary, page: PageContext }): Promise<void>
  sendText(text: string): void            // typed question, or the hidden "session_started" nudge
  interrupt(): void                        // stop IO mid-sentence (click on IO, Esc, or VAD)
  end(): Promise<SessionSummary>           // asks IO for a 2-line summary, then closes
  on(event: 'state'|'userCaption'|'ioCaption'|'level'|'tool'|'error', cb): () => void
}
// state: 'connecting'|'listening'|'thinking'|'speaking'|'interrupted'|'ended'|'error'
// level: 0..1 output amplitude, ~60 Hz, for the mouth
```

### Models (verify on the models page; these are the first choices)

| Purpose | Model | Notes |
|---|---|---|
| Live voice (primary) | `gemini-3.8-live` | default low-latency Live model; fallback `gemini-2.5-flash-native-audio-preview-12-2025` |
| Text / grounding / STT fallback | `gemini-3.8-flash` (or the current Flash) | accepts audio parts for transcription |
| TTS (turn pipeline) | `gemini-3.1-flash-tts-preview` | streaming TTS; language hint `ka` / `en` |
| TTS alternative | Azure Speech `ka-GE-GiorgiNeural` (male) / `ka-GE-EkaNeural` (female) | mature native Georgian voices; SSML prosody control |

IO is referred to as "he" throughout the project → default to a male-coded voice. Make the voice a config value, not a constant.

---

## 4. Phases, with acceptance criteria

Stop at the end of each phase, report what was built and what is uncertain, and wait for a go-ahead.

### Phase 0 — Plan (no code)
- `docs/io-voice-plan.md`: file-by-file plan, model IDs verified, open questions.
- Confirm from the docs: ephemeral-token endpoint (`POST https://generativelanguage.googleapis.com/v1beta/auth_tokens`, `uses`, `expireTime`, `newSessionExpireTime`, `liveConnectConstraints`), Live audio formats (**input PCM16 16 kHz mono little-endian, output 24 kHz**), VAD/interruption semantics, session resumption (~10-minute reconnect), `@google/genai` JS SDK usage of a token in place of the key with `httpOptions: { apiVersion: 'v1beta' }`.

### Phase 1 — Worker + Georgian voice bake-off
Create `worker/` (TypeScript, `wrangler`):
- `POST /token` → mints an ephemeral Live token: `uses: 1`, `expireTime: now+10 min`, `newSessionExpireTime: now+1 min`, `liveConnectConstraints` pinned to the Live model, our system instruction and tool list (so a leaked token cannot be repurposed). Returns `{ token, expiresAt }`.
- `POST /chat` → SSE proxy to `models/<flash>:streamGenerateContent?alt=sse` (port the parser from `llmClient.js`; key from `env.GEMINI_API_KEY`; `maxOutputTokens` 400; temperature 0.6).
- `POST /tts` → body `{ text, lang, voice }` → streams audio back. Adapter interface `synthesize({text, lang, voice}) → ReadableStream<PCM16 24 kHz>`; implementations `gemini.ts` and `azure.ts` (`AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, SSML with `<voice name="ka-GE-GiorgiNeural">`). Emoji and markdown are stripped before synthesis.
- `POST /stt` → body: audio blob (`audio/webm;codecs=opus` or `audio/mp4`) + `lang` → Flash with an inline audio part and the instruction "Transcribe verbatim in <language>; output only the transcript" → `{ text }`.
- Cross-cutting: `Origin` allowlist (`https://tinatinzhorzholianidga.github.io`, `https://elearning.gov.ge`, `http://localhost:5173`), CORS, **KV rate limits** (per IP: 20 tokens/day, 200 chat/day, 300 tts/day — constants in one place), 30 s timeouts, no body logging, `Cache-Control: no-store`. Optional hardening toggle: Cloudflare Turnstile on `/token`.
- `worker/README.md`: `wrangler secret put GEMINI_API_KEY`, optional Azure secrets, `wrangler dev`, deploy, how to change limits.
- `scripts/voice-smoke.mjs`: hits all four routes against a base URL and prints latency.
- `scripts/voice-bakeoff.mjs`: synthesises six fixed Georgian lines from `hints.js` (pick: one greeting, one `basicCourse`, one `kidsPlatform`, one `certificate`, one `encouragement`, one `farewell`) with **each candidate**: 5–6 Gemini TTS voices with the `ka` hint, Azure Giorgi, Azure Eka, and — via a tiny Live session — the Live model's own voice speaking the same lines. Writes `bakeoff/<voice>-<n>.wav` plus a `bakeoff/README.md` rating sheet (naturalness, pronunciation of ქ/ყ/წ/ჭ/ღ, pace, warmth; 1–5) for a native speaker to fill in.

**Gate G1 (human decision, do not guess):** the team listens to `bakeoff/` and picks (a) the voice, and (b) whether the Live model's Georgian is good enough to be primary. If it is not, `TurnVoiceSession` + the chosen TTS becomes primary for Georgian and Live is used only for English. Build both sessions regardless; the gate only sets the default.

Acceptance: `wrangler dev` serves all routes; smoke script green; unauthorised origin → 403; rate limit → 429 with a KA/EN error message the UI can show; bake-off folder produced.

### Phase 2 — Audio plumbing + the model's mouth
- `src/voice/audio/mic.js`: `getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } })`, an `AudioWorklet` that converts Float32 → Int16 and resamples to 16 kHz (do not rely on `AudioContext({sampleRate:16000})` — Safari ignores it), emits ~100 ms chunks (1600 samples) as `ArrayBuffer`. Exposes a live input level for the "listening" ring.
- `src/voice/audio/player.js`: queue of Int16 24 kHz chunks → `AudioBuffer`s scheduled gap-free (`nextStartTime`), through `GainNode → AnalyserNode → destination`. `level()` = RMS of the analyser, smoothed (≈60 ms attack / 120 ms release), mapped 0..1. `flush()` stops every scheduled source instantly (used on interruption). All `AudioContext` creation/`resume()` happens inside the click handler (iOS unlock).
- `RobotModel.jsx`: add `mouthLevel` (0..1). When `mouthLevel != null` it drives `mouthOpen` (`0.15 + 0.6*level`, lightly smoothed) instead of the sine wave; `talking` keeps working for the typewriter. Add `listening` (boolean): eyes slightly wider and a soft LED pulse — small, no new geometry, nothing in reduced motion.
- `IoHost.jsx`: accepts `mode` and passes `mouthLevel / listening / emotion / gesture` through; in talk mode the bubble becomes a **transcript panel** (last two turns visible, scrollable, IO's live caption typed as it arrives, learner's words in a second style). On phones it is a bottom sheet. Reduced motion: text appears at once.
- `src/voice/VoiceDock.jsx`: the *Talk to IO* button with a state ring (idle / connecting / listening / thinking / speaking), a text input ("Type a question"), *End*, mute, and *Delete my data*. Strings in `ui.js` under `voice.*` (KA/EN), for example: `ესაუბრეთ იოს` / `Talk to IO`, `იო გისმენთ…` / `IO is listening…`, `იო ფიქრობს…` / `IO is thinking…`, `იო საუბრობს` / `IO is speaking`, `დაწერეთ კითხვა` / `Type a question`, `საუბრის დასრულება` / `End conversation`, `წაშალეთ ჩემი მონაცემები` / `Delete my data`, `მიკროფონზე წვდომა არ არის. შეგიძლიათ კითხვა დაწეროთ.` / `No microphone access. You can type your question instead.`, `იო არ ინახავს ხმის ჩანაწერებს. საუბრის ტექსტი მხოლოდ თქვენს ბრაუზერში რჩება.` / `IO does not store voice recordings. The conversation text stays only in your browser.`
- `src/voice/useIoVoice.js`: the state machine that owns one `VoiceSession`, maps session events to `IoHost` props: `listening → emotion 'thinking' + listening cue`, `thinking → 'thinking' + dots`, `speaking → mouthLevel from player`, `interrupted → 'surprised' overlay for 400 ms then listening`, tool `set_mood` → emotion, `gesture` on session start (`wave`), on a correct answer (`bounce`), on a mastered skill (`celebrate` + `bounce`).

Acceptance: with a stub session that plays a local WAV, IO's mouth follows the audio; the ring follows the mic; clicking IO or pressing Esc cuts the audio instantly; everything still works with `prefers-reduced-motion`; the host mode click cycle is untouched.

### Phase 3 — `LiveVoiceSession`
- `start()`: `POST /token` → `new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1beta' } })` → `ai.live.connect({ model, config, callbacks })` with config: `responseModalities: ['AUDIO']`, `speechConfig` (chosen voice, `languageCode` `ka-GE`/`en-US`), `systemInstruction` from `tutor/persona.js`, `tools` from `tutor/tools.js`, `inputAudioTranscription: {}` and `outputAudioTranscription: {}` (captions for both sides), automatic VAD on, `contextWindowCompression` on, session resumption on.
- After `setupComplete`, send one hidden text turn: `session_started { lang, page: 'welcome', learner: <compact profile summary> }` so IO greets in the right language and, for a returning learner, refers to last time.
- Stream mic chunks as `sendRealtimeInput({ audio: { data: base64, mimeType: 'audio/pcm;rate=16000' } })`; play `serverContent.modelTurn` audio parts through the player; on `serverContent.interrupted` → `player.flush()` and state `interrupted`; captions from the transcription messages; `toolCall` → run the handler from `tutor/tools.js` and reply with `sendToolResponse`.
- Manual interruption (click on IO / Esc): `player.flush()` and send an `activityStart`-equivalent nudge only if VAD is disabled; with automatic VAD just flushing is enough — verify.
- Keep-alive/idle: end the session after 90 s of silence with a spoken goodbye; on tab hide for > 30 s, pause the mic (visible state) and resume on return; reconnect with the resumption handle on socket close before `expireTime`.
- Failure paths → typed KA/EN messages: mic denied, token 429, socket failed (offer typed mode / fall back to `TurnVoiceSession` automatically after one retry).

Acceptance: from a fresh load — press *Talk to IO* → IO waves, greets in Georgian, listens; a Georgian question gets a Georgian spoken answer with captions; speaking over IO cuts him off within ~300 ms and he responds to the new utterance; switching the page language to English gives an English session; refresh → returning-learner greeting.

### Phase 4 — `TurnVoiceSession` (fallback and typed questions)
- STT: `window.SpeechRecognition || webkitSpeechRecognition` with `lang = 'ka-GE' | 'en-US'`, `interimResults` for live captions, `continuous: false`; auto-stop on end-of-speech. If unavailable (Safari/Firefox): `MediaRecorder` → `POST /stt`. Push-to-talk UI (hold the button or press once to start/stop) — say so in the ring label.
- LLM: `POST /chat` with the same persona + tool list expressed as JSON function declarations; rolling 8-turn window (from `useIoChat.js`); grounding chunks retrieved client-side with the ported `ioBrain` retrieval and injected per question.
- TTS: split the streamed reply at sentence boundaries (`. ! ? …` and Georgian `.`), request `/tts` per sentence as soon as the sentence closes, play in order; first audio must start before the full reply is generated. The mouth uses the same player level.
- Interrupt = abort in-flight fetches + `player.flush()`.

Acceptance: with the Live path disabled by a query flag (`?voice=turn`), the same conversation works end-to-end in Chrome and Safari; first audio ≤ 3 s after the learner stops speaking on a normal connection (measure and print in dev console).

### Phase 5 — The tutor brain
`src/voice/tutor/persona.js` — one function `buildSystemInstruction({ lang, learner, page, mode })` returning the instruction. Contents (write it in English, with the Georgian examples verbatim):

- **Identity**: „მე იო ვარ“ — IO (იო), the friendly robot guide of the Digital Governance Agency's learning platform; lives on CyberHero too. Warm, curious, a little playful, never sarcastic, never scary. Speaks Georgian by default (თქვენ register), English when the page is in English; answers in the language the learner speaks even if it differs from the page.
- **Spoken style**: every turn ≤ 2 sentences / ~35 words unless the learner asks for more; no lists, no markdown, no emoji in speech; say Georgian names for things (`კიბერგმირი`, `ციფრული მმართველობის სააგენტო`, `ორფაქტორიანი ავთენტიფიკაცია`), never spell Latin abbreviations letter by letter unless asked; numbers as words when small.
- **Teaching rules (Aristotle-style)**: for a scenario/problem, ask a guiding question before giving the answer; for a definition, one-sentence anchor **then** a check question; after a wrong answer, never say „არასწორია“ flatly — narrow the problem („ახლოს ხართ! დავფიქრდეთ: ბმულზე დაწკაპუნებამდე რას შეამოწმებდით?“); after a right answer, confirm briefly („ზუსტად ასეა!“) and raise the difficulty one notch; end every topic with a one-line takeaway the learner said themselves, if possible.
- **Example exchange (KA)** — learner: „რა არის ფიშინგი?“ → IO: „ფიშინგი თაღლითობაა: ვინმე სანდო ორგანიზაციად ასაღებს თავს, რომ პაროლი ან ფული გამოგტყუოთ. თქვენ თუ მიგიღიათ წერილი, სადაც სასწრაფოდ რაღაცის გაკეთებას გთხოვდნენ?“ — and the EN equivalent.
- **Scope**: cybersecurity for everyday people, the platform's courses, and how to use this page. Off-topic → one friendly sentence and an offer („ამაზე ვერ დაგეხმარებით — მე კიბერუსაფრთხოების გზამკვლევი ვარ. სამაგიეროდ, თუ გსურთ, უსაფრთხო პაროლებზე ვისაუბროთ?“). No homework in other subjects, no medical/legal/financial advice, no politics.
- **Facts about the platform** come only from `hints.js` / `ui.js` (import them; do not retype: 9 topics, ~3 hours, 100-question test, 70 to pass, 3 attempts, CyberHero free & bilingual, ages 13–18, 10 missions, guides for parents and teachers, printable certificate). For course specifics call `lookup_course_material` instead of guessing; if it returns nothing, say you are not sure and point to the course.
- **Young learners and safety**: assume the learner may be a child. Never ask for surname, school, address, phone, passwords or codes — if offered, say you do not need it and do not store it. If a learner describes being bullied, threatened, blackmailed or contacted by a stranger online: stay calm, say it is not their fault, say to tell a trusted adult now, and read the resources from `src/content/safety.js` (a file the DGA team fills in — **do not invent hotline numbers**; ship it with placeholders and a check that fails the build if a placeholder is still there when `VITE_IO_SAFETY_REQUIRED=1`). Never role-play as anyone else; never help with hacking, bypassing controls, or phishing others — refuse gently and pivot to the defensive view.
- **Memory etiquette**: refer to previous sessions naturally („გასულ ჯერზე ფიშინგზე ვისაუბრეთ…“), never read the profile aloud, never mention "localStorage".

`src/voice/tutor/skills.js` — derive the taxonomy from the platform content (basic-course topics in `hints.js`/`ioBrain` chunks and the CyberHero missions in `src/content/guardians/*` on `main`), 10–14 skills, each `{ id, ka, en, courseRef }` (e.g. `passwords`, `phishing`, `two_factor`, `updates`, `privacy_settings`, `social_engineering`, `safe_browsing`, `disinformation`, `ai_threats`, `device_security`, `backups`, `incident_reporting`). Mastery 0–3 per skill.

`src/voice/tutor/memory.js` — `localStorage['io.learner.v1']`:
```json
{ "v": 1, "name": null, "lang": "ka", "createdAt": "...", "lastSeenAt": "...",
  "skills": { "phishing": { "level": 2, "lastSeen": "...", "evidence": "spotted the fake sender" } },
  "sessions": [ { "at": "...", "summary_ka": "...", "summary_en": "...", "skills": ["phishing"] } ] }
```
Keep at most 10 sessions; `summarise()` returns the ≤300-character profile text injected into the system instruction; `forget()` wipes it (wired to *Delete my data*). First name only, and only if the learner volunteers it.

`src/voice/tutor/tools.js` — function declarations + handlers, shared by both sessions:
- `set_mood(mood: happy|wink|thinking|excited|celebrate|surprised)` → IO's face.
- `show_card({ kind: 'steps'|'checklist'|'diagram'|'link', title, items?, diagram?: 'phishing_email'|'password_strength'|'two_factor_flow', url? })` → renders in the board panel beside IO (inline SVG diagrams shipped with the site; no external images).
- `ask_quiz({ scenario, options[3], correctIndex, skill })` → card with three options; the learner answers by voice or click; the answer goes back to the model as a tool response so IO can react.
- `record_skill({ skill, level, evidence })` → memory.
- `lookup_course_material({ query, lang })` → ported `ioBrain` retrieval → top 3 chunks as text.
- `navigate_to_path({ path: 'basic'|'kids' })` → highlights the card, plays the existing `farewell`, then follows the link (new tab for kids).
- `end_session({ summary_ka, summary_en, skills })` → saved to memory, then close.

Acceptance: a scripted 6-turn test conversation (in `docs/io-voice-test-script.md`, KA and EN) passes by hand: definition → check question → quiz → wrong answer handled → right answer celebrated → session summary spoken and stored; reload shows the returning-learner greeting; *Delete my data* resets it. Off-topic and a "help me hack my friend's account" request are both refused as specified.

### Phase 6 — Polish, safety, docs
- Accessibility pass (keyboard-only run-through, screen reader announces both sides, focus visible, contrast AA on the new UI, reduced-motion run-through).
- Mobile: Android Chrome and iOS Safari (AudioContext unlock, bottom-sheet transcript, no layout jump when the panel opens).
- Embed mode: `?embed=1&voice=1` inside a test iframe with `allow="microphone; autoplay"`; document in README.
- Bundle: confirm the initial page chunk did not grow; voice chunk loads on first click only.
- Extend `scripts/check-hints.mjs` (or add `check-voice.mjs`) to lint all new KA/EN strings with the same typography rules, plus: safety placeholders, tool schema validity, skill ids referenced by quizzes exist.
- README: new "Talk to IO" section (modes, browsers, what is sent where, what is stored, how to delete it, Worker setup, cost limits), and correct the privacy paragraph: the page now makes requests to the Worker and, in talk mode only, to Google's Live API — still no cookies, no analytics, no recordings.
- Latency numbers in the plan doc (time to first audio, Live vs turn, KA vs EN) measured on one laptop and one phone.

---

## 5. Environment and config

```
# client (.env.local, gitignored; VITE_ vars are public — nothing secret here)
VITE_IO_API_BASE=https://io-voice.<account>.workers.dev
VITE_IO_VOICE_DEFAULT=live        # live | turn  (set after Gate G1)
VITE_IO_TTS=gemini                # gemini | azure (turn pipeline)
VITE_IO_VOICE_NAME=<chosen voice>

# worker (wrangler secrets — never in git)
GEMINI_API_KEY, AZURE_SPEECH_KEY?, AZURE_SPEECH_REGION?, TURNSTILE_SECRET?
```

Provide `.env.example` and `worker/.dev.vars.example`. Do not commit `bakeoff/` audio (gitignore it); commit the rating sheet.

---

## 6. Definition of done

- `io-voice` branch builds and deploys with the existing workflow; `npm run check` green; no secrets in git history.
- Host mode is pixel-identical to `IO-for-main-page`.
- Talk mode works in Chrome, Edge, Safari (desktop + iOS) and Android Chrome, in Georgian and English, with real interruption on the Live path and push-to-talk on the fallback path.
- The scripted test conversation passes; memory, skills, quiz cards, board cards, safety refusals verified.
- Docs: `docs/io-voice-plan.md` (kept current), `docs/io-voice-test-script.md`, `worker/README.md`, README updates, `bakeoff/README.md` with the voice decision recorded.

When something in the Gemini docs contradicts this brief (renamed model, changed token API, different audio format), follow the docs, note the difference in the plan doc, and continue.
