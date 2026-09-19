# IO voice — build plan

**Status: Phase 0, revised on 2026-09-19 after the team's decisions.** This document answers
`docs/io-voice-build-prompt.md` ("the brief") and is kept current through every phase; the change
log is at the end. The work is split into two tracks:

- **Track D — demo, build now.** Zero cost, no backend. Runs on the presenter's laptop
  (`npm run dev`), optionally as a shareable preview with a key pasted at runtime. Browser speech
  services, Gemini's free tier (or a local model), and, if the free key allows it, Gemini Live
  directly from localhost as the barge-in showcase.
- **Track P — production, later.** The brief's Worker + ephemeral-token architecture, unchanged,
  deferred until billing exists. The demo's client code is written so that Track P is a transport
  swap, not a rewrite.

Phase 0 deliverables: the decisions taken (§0), the two tracks and the deviations they imply (§1),
the verified facts (§2), the architecture (§3), the file-by-file plan (§4), the design details (§5),
the strings and the bake-off (§6), the phases (§7), the non-negotiables per track (§8), the baseline
(§9), **what it would cost** for the budget request (§10), the remaining questions (§11) and the
risks (§12).

**How the facts were verified.** The documentation sites `ai.google.dev`,
`developers.cloudflare.com`, `learn.microsoft.com` and `developer.mozilla.org` are blocked by the
build environment's network policy. Every claim in §2 was checked against primary sources that are
reachable: Google's live API Discovery document for `generativelanguage.googleapis.com` (revision
`20260919`, `v1beta` and `v1alpha`, plus HTTP probes), the `@google/genai` 2.23.0 sources, package and
unit tests, Google's `gemini-api-cookbook`, `gemini-live-api-examples` and `gemini-skills`
repositories, the source repositories behind the Cloudflare, Microsoft Learn and MDN pages
(`cloudflare/cloudflare-docs`, `MicrosoftDocs/azure-ai-docs`, `mdn/content`, `mdn/browser-compat-data`),
Apple's Safari release-notes JSON and WebKit sources. Where only a search snippet of a docs page was
available the fact is marked *(snippet)*; §2.10 lists what must be re-read on the docs pages.
The browser speech-synthesis facts in §2.11 were **not** researched in Phase 0 and are verified by
the bake-off page in D1.

Terms: **Live** = Gemini's real-time WebSocket voice API; **VAD** = voice activity detection (the
server deciding when the visitor starts and stops speaking); **barge-in** = the visitor talking over
IO and IO stopping; **TTS / STT** = text-to-speech / speech-to-text; **Web Speech API** = the
browser's built-in recognition (`SpeechRecognition`) and voices (`speechSynthesis`); **SSE** =
server-sent events (a streamed HTTP response); **KV** = Cloudflare's key-value store; **Worker** =
the small Cloudflare server that would hold the secrets in Track P; **r3f** = react-three-fiber,
the library IO's 3D model is built with.

---

## 0. Decisions taken (2026-09-19)

| # | Decision | Where it lands |
|---|---|---|
| A1 | Base = `IO-for-main-page`, work on `io-voice`. Confirmed. | §1.3 |
| A2 | Test target = localhost (`npm run dev`). No second Pages repository now. For a shareable preview later: a personal repository named `IO-for-main-page` (its workflow and `base` already match), `io-voice` pushed to its `main`. A deployed preview never contains a key: the runtime-key field pattern from `io-chat-gemini`'s `llmClient.js` (key pasted at runtime, stored only in the presenter's browser). | §4.1 (`deploy.yml`), §5.3 (runtime-key field), §5.4 |
| A3 | No billing for now. A third session, **`BrowserVoiceSession`**: Web Speech recognition (`ka-GE` / `en-US`, Chrome + Edge), `speechSynthesis` voices (Edge: "Microsoft Giorgi Online (Natural)" male, "Microsoft Eka Online (Natural)" female; any `en` voice for English), voices loaded asynchronously, emoji/markdown stripped, sentence-chunked utterances, `cancel()` on interruption; mouth driven by word-boundary events with the `talking` sine as fallback; LLM = Gemini Flash free tier first (fresh AI Studio key in `.env.local`, smoke-tested by the team), else a local OpenAI-compatible endpoint (Ollama, gemma3) behind the same streaming client, Georgian quality noted in this plan. If the fresh key has Live quota, `LiveVoiceSession` is wired directly with the key (localhost only, guarded so it can never be bundled) as the barge-in showcase; `BrowserVoiceSession` is the safety net. Selection: `VITE_IO_VOICE_DEFAULT=browser|live|turn`; the dock shows the active session in dev mode. | §3, §5.4–§5.7 |
| A4 | Cloudflare not needed for Track D. Track P: Cloudflare Free plan, Workers free tier, `io-voice.<account>.workers.dev` on a personal account, moved to the agency account if adopted. | §5.9 |
| A5 | No limits in Track D. Track P: per-session cap (10 min via the token's `expireTime`), max 3 concurrent sessions per IP, a high per-IP daily ceiling (≈ 300 sessions) so a school behind one shared address works, and a **global daily minutes budget** in KV that switches the dock to text-only mode when exhausted. | §5.9 |
| A6 | **No public Basic Course index.** That text belongs to the course owners and sits behind the Moodle login. IO is grounded only on public material: the CyberHero chunks (`ioBrain`) and the platform facts in `hints.js` / `ui.js`. A local Basic Course index, if useful for the demo, stays gitignored and off any build. | §4.4, §5.8 |
| A7 | Bake-off (all free): (1) Edge `speechSynthesis` Giorgi and Eka; (2) if the Gemini key works, 4–5 Gemini TTS prebuilt voices with the `ka` hint, male-coded first; (3) the Live model's own voice speaking the same six lines — this decides whether Georgian barge-in is possible. Azure (the Edge voices are the same Microsoft voices) and ElevenLabs are skipped. | §6.2 |
| A8 | The *Talk to IO* button under the "click IO" hint: accepted. Small, DGA palette, label **ესაუბრეთ იოს / Talk to IO**, hidden when the browser has neither `SpeechRecognition` nor a voice for the page language (then a "Type a question" button appears instead). | §5.3, §6.1 |

Everything else in the brief stands. The questions that remain open are in §11.

---

## 1. The two tracks

### 1.1 Track D — demo (build now)

- **Runs on** the presenter's laptop with `npm run dev`. **Edge** is the presentation browser: its
  online natural voices include Georgian (Giorgi, Eka) and its recogniser (Microsoft's) lists `ka-GE`;
  Chrome also works (Google's recogniser; Georgian support unverified, §2.7) with whatever voices the
  operating system provides. Internet is required at the venue (browser speech services, Gemini).
- **Three sessions behind the brief's `VoiceSession` interface**, selected by `VITE_IO_VOICE_DEFAULT`,
  `?voice=` or capability fallback (§5.4):
  - `browser` — **`BrowserVoiceSession`** (A3): Web Speech recognition → Gemini Flash (free tier)
    or a local model → browser voices. Works on every Chromium browser; the safety net.
  - `turn` — the brief's `TurnVoiceSession` with a **direct** transport: Web Speech recognition →
    Gemini Flash → Gemini TTS streamed straight from Google with the key; real audio through the
    player, so the amplitude mouth works. Localhost with the dev key, or a pasted key on a preview.
  - `live` — **`LiveVoiceSession`** with the dev key (localhost only, dev builds only): the
    barge-in showcase, wired only if the smoke test shows Live quota on the free key.
- **Not in Track D:** the Worker, ephemeral tokens, rate limits, any Basic Course text in the
  repository, the Moodle embed (embed mode still works in a local test iframe), Azure.
- **Cost:** $0 (§10.1). **Privacy:** the demo README says what the browser sends to Google or
  Microsoft and that the free tier's terms differ from the paid tier's (§5.10) — test content only,
  no personal data.

### 1.2 Track P — production (deferred until billing exists)

The brief's architecture unchanged: a Cloudflare Worker holds the key and mints one-use ephemeral
tokens for Live; `/chat`, `/tts`, `/stt` proxy the key-bearing calls; the browser never sees a key.
Track D's client code already has the seams: `LiveVoiceSession` takes an *auth provider* (dev key
now, Worker token later), `TurnVoiceSession` takes *transports* (direct now, Worker later), and
`BrowserVoiceSession` becomes the **text-only mode** the dock switches to when the global budget is
exhausted (A5). The Worker design, with A4/A5 applied, is in §5.9; its phases are P1–P3 (§7).

### 1.3 Branch and process (A1)

`io-voice` starts from `IO-for-main-page` (`dc8a296`); this was done in Phase 0 (commit `541d2aa`).
The two code bases share no history: `IO-for-main-page` is the standalone welcome host the brief
describes; `claude/mascot-robot-demo-9oclw8` (`c71fa53`, the old `io-voice` head, kept there and as
the local tag `io-voice-platform-base`) is the CyberHero platform; to undo the re-point:
`git push --force-with-lease=refs/heads/io-voice:<current sha> origin c71fa53b981cd5bf5504c2d130d577b348045af6:io-voice`.
`RobotModel.jsx` and
`faceTexture.js` are byte-identical on both; `RobotCanvas.jsx` on `IO-for-main-page` is the newer
one (keyboard tap, Safari < 14 fallback, `.io-canvas` class). Content from the other branches is
copied file by file with `git show <ref>:<path>` (§4.2), never merged. `io-voice` must never be
added to the CyberHero workflow's branch list (its `sync-main` job force-pushes listed branches to
`main`). Every phase ends with a commit, a report, and a wait for the go-ahead (brief §4).

### 1.4 Where the plan deviates from the brief

The brief says: when the Gemini docs contradict it, follow the docs and note the difference. Every
deviation is listed here, including the ones the team's decisions introduce. Deviations are
numbered V1–V24; the demo phases are D1–D6 (§7.1).

| # | Brief says | Plan does | Why | Where |
|---|---|---|---|---|
| V1 | Live fallback `gemini-2.5-flash-native-audio-preview-12-2025` | fallback `gemini-3.1-flash-live-preview`; the 2.5 preview third | Google names 3.1 Flash Live as that model's replacement and lists it under "legacy"; close-code 1008 failures reported on it | §2.1 |
| V2 | `speechConfig.languageCode` `ka-GE` / `en-US` on Live | no `languageCode`; the system instruction steers the language, plus a transcription language hint | native-audio Live models pick the language themselves and reject explicit codes; `ka-GE` is not a valid value | §2.3 |
| V3 | Phase 3: "reconnect with the resumption handle on socket close before `expireTime`", with a 10-min token | kept: the token stays at 10 min and becomes the per-session cap (A5); reconnects happen only before `expireTime`, which is never extended, so a Track P session ends at 10 min by design | `expireTime` ends the whole session; A5 makes that the intended length | §5.9 |
| V4 | SDK `httpOptions: { apiVersion: 'v1beta' }` | one config value, default `v1beta`; with a plain key (Track D) the SDK does not warn; with a token (Track P) it warns unless `v1alpha`; the smoke script tests both | both versions serve `auth_tokens`; Google's browser example and the SDK's unit test use `v1beta`, the SDK's docs say `v1alpha` | §2.2 |
| V5 | `/chat` "ports the parser from `llmClient.js`" into the Worker | the parser runs in the browser on every track; the Worker (Track P) forwards Gemini's SSE bytes untouched | Track D has no Worker; Workers Free allows 10 ms CPU per request; function-call parts must reach the client anyway | §4.2, §5.9 |
| V6 | per-IP daily counts 20 / 200 / 300 | Track D: none. Track P: per-session cap, 3 concurrent sessions per IP, ≈ 300 sessions per IP per day, a global daily minutes budget (A5) | schools share one address; a global budget is the real cost cap; KV's free tier allows 1,000 writes per day | §5.9 |
| V7 | `/stt` receives `audio/webm;codecs=opus` or `audio/mp4` | Track D: Web Speech recognition, no upload. Track P: a WAV built from the mic worklet's 16 kHz PCM16 | one format on every browser; Gemini's list has `audio/wav` but not `audio/mp4` | §5.6, §5.9 |
| V8 | `mouthLevel (0..1)` prop | a ref (or a plain number for tests) read inside the render loop | a 60 Hz React prop would re-render the whole r3f tree every frame | §5.2 |
| V9 | "Only add: amplitude-driven mouth, a listening cue" to the model | plus one boolean `tapReaction` prop and an `eyesWide` field in `faceTexture.js` | the model plays its own wave + 1.8 s `excited` overlay on every pointer tap, hiding the 400 ms `surprised` cue; wider eyes need one parameter | §5.2 |
| V10 | grounding on "~330 bilingual chunks from the platform's content" and `lookup_course_material` over the course | grounding on the CyberHero chunks and the `hints.js` / `ui.js` facts only; **no Basic Course text in the repository or any build** (A6); the index is a committed static JSON fetched on first use | the course text belongs to its owners and sits behind the Moodle login | §4.4, §5.8 |
| V11 | "Host mode is pixel-identical" | one static *Talk to IO* button under the "click IO" hint (A8), ≈ 10 lines appended to `global.css`; everything above it and every embed without `?voice=1` stays identical | talk mode needs an entry point that exists before the voice code loads | §5.3 |
| V12 | talk mode starts on the button "or types a question" | the button, the `T` key and (when speech is unavailable) a *Type a question* button work from host mode; the text input itself appears once the dock has loaded | one static control instead of two | §5.3 |
| V13 | "No API keys in the client bundle, ever. Everything secret lives in a Cloudflare Worker" | **Track D only:** the key lives in `.env.local` and is injected by `vite.config.js` into dev serves only (structurally absent from builds), or pasted at runtime into the presenter's browser (A2); Track P restores the brief's rule | a demo without billing has no Worker; the key is still never in a bundle | §5.4, §8 |
| V14 | `end()` "asks IO for a 2-line summary" | the summary comes from the `end_session` tool call | Live no longer supports text output | §2.3 |
| V15 | push-to-talk: "hold the button or press once to start/stop" | press to start; recognition stops by itself at end of speech (`continuous: false`), a second press stops early; holding also works | one label can describe one gesture: „დააწკაპუნეთ და ისაუბრეთ“ | §5.5, §6.1 |
| V16 | the literal `voice.*` strings | the entry button keeps the brief's `ესაუბრეთ იოს` (A8); dock controls use the nominal form the page's buttons use; the privacy line names the services that process the voice; all strings go to one native review | see §6.1 | §6.1 |
| V17 | bake-off "with the `ka` hint" | the language is named in the prompt text (with and without); `languageCode` is not sent | the API has no valid Georgian `languageCode` | §6.2 |
| V18 | two sessions (`Live`, `Turn`) | three: `BrowserVoiceSession` added (A3); its mouth is driven by word-boundary events, not audio amplitude, because browser voices expose no audio stream | zero-cost path with no key at all; safety net for the presentation | §5.5 |
| V19 | bake-off candidates: 5–6 Gemini voices, Azure Giorgi, Azure Eka, the Live voice | Edge's Giorgi and Eka (the same Microsoft voices, free), 4–5 Gemini voices if the key works, the Live voice; Azure and ElevenLabs skipped (A7); Track P's `/tts` ships the Gemini adapter only and `VITE_IO_TTS` is dropped | no accounts, no cost | §6.2 |
| V20 | `/chat` receives "the same persona + tool list" from the client | Track D: the browser builds the Gemini request itself (the brief's wording). Track P: the Worker builds it from the same bundled tutor modules | a leaked Worker URL must not be a general Gemini proxy | §5.4, §5.9 |
| V21 | `VITE_IO_VOICE_DEFAULT=live | turn` | `browser | live | turn`, optionally per language (`ka=browser,en=live`) | a third session and Gate G1's "Live only for English" outcome | §5.4 |
| V22 | Phase 4 acceptance "works end-to-end in Chrome and Safari"; definition of done "Safari (desktop + iOS)" | Track D: Safari uses `webkitSpeechRecognition` where its locale is served (English; `ka-GE` assumed unsupported → typed mode), Firefox typed mode; no `/stt` upload without a Worker | a Worker is what makes uploads possible; Track P's `stt/upload.js` restores the brief's coverage | §5.5, §7.1 |
| V23 | `VoiceSession` = `start`, `sendText`, `interrupt`, `end`, `on`; states without `idle` | plus optional `listen()`, `stopListening()`, `setMuted()`, `micLevel()` and a `pushToTalk` flag; an `idle` state between push-to-talk turns; events `mouth` (`level` / `pulse` / `sine`), `boundary`, `mic` next to the brief's five | the browser, turn and stub sessions are push-to-talk (V15) and browser voices move the mouth by word events, not amplitude (V18); the ring needs the mic level and the mic-open indicator needs the track state | `session/VoiceSession.js` |
| V24 | Phase 2 acceptance "a stub session that plays a local WAV" | the stub synthesises a speech-like signal (syllable bursts) by default and plays a WAV with `?voice=stub&wav=<url>` (e.g. a bake-off file served by the dev server); `&mouth=pulse` / `&mouth=sine` exercise the browser-voice mouth paths | no audio file in the repository, the harness works before Gate G1 produces any WAV, and all three mouth paths are tested | `session/StubVoiceSession.js` |
| V25 | Phase 3: a hidden `session_started` turn makes IO greet | the push-to-talk sessions (browser, turn) speak the scripted greeting from `tutor/strings.js` without a model call; Live (D4) keeps the nudge | the free tier's daily request quota is spent on answers, not greetings; the scripted line is reviewed Georgian | §5.5, `session/pushToTalk.js` |
| V26 | a voice session always speaks | without a voice for the page language (Chrome or Firefox without a Georgian voice, Safari) the browser session answers in captions with the sine mouth and says so once (`voice.noVoice`); the ring reports typed mode when recognition is missing (`voice.errSpeech`) | A8 promised typed mode everywhere; captions-only is the honest fallback on those browsers | §5.5 |
| V27 | Phase 3: the 90 s goodbye "calls `end_session`"; manual interruption may need an "activityStart-equivalent nudge" | the idle goodbye is a hidden `session_idle` event the persona answers with one sentence, and the session ends when that turn completes (the `end_session` tool arrives in D5); a manual interruption flushes the player and discards the rest of the turn, with no message to the server (B7 stays a D4 experiment for the real service) | no tools exist before D5; the Live API has no interrupt message and realtime text as a nudge is untested | §5.7, `session/LiveVoiceSession.js` |
| V28 | (none in the brief) the SDK loads on demand | `@google/genai` is pre-bundled by the dev server (`optimizeDeps.include`) although only the Live session imports it | Vite discovers a dependency first imported at run time mid-session and reloads the page, which would end the presenter's talk session on the first Live start | `vite.config.js` |

---

## 2. Verified facts

### 2.1 Model IDs (checked 2026-09-19)

| Purpose | Brief said | Verified today | Use | Source |
|---|---|---|---|---|
| Live voice, primary | `gemini-3.8-live` | exists; GA since 2026-09-15; "the default option for most low-latency voice agent experiences"; audio-only output; `thinkingConfig` must not be sent; function calls default to non-blocking | `gemini-3.8-live` ✅ | cookbook `Get_started_LiveAPI.ipynb`, `gemini-skills` Live skill, Google's ephemeral-token example; model page *(snippet)* |
| Live voice, fallback | `gemini-2.5-flash-native-audio-preview-12-2025` | still served, but listed under "legacy" with `gemini-3.1-flash-live-preview` as replacement; the Gemini 2.5 line shuts down in October 2026 and whether previews are covered is unclear *(snippet)* | `gemini-3.1-flash-live-preview`, then the 2.5 preview — V1 | `gemini-skills` `migration.md`; model page and changelog *(snippets)* |
| Text / grounding | `gemini-3.8-flash` | exists, GA; accepts inline audio parts; the `generateContent` family is labelled "legacy" but remains supported; 1M context *(snippet)*; free-tier quota reported at ≈ 20 requests per day *(forum)* — the smoke test also tries `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash-lite` and reports each model's free quota | `gemini-3.8-flash` first; the model with a usable free quota for the demo | cookbook `Get_started.ipynb` (model list), `Audio.ipynb`, `gemini-skills` |
| STT | Flash with an inline audio part | Flash works; `gemini-3.5-transcribe` exists (non-streaming, auto language ID; Georgian membership unverified). Track D uses the browser's recogniser instead. | Track P: `gemini-3.8-flash`, `gemini-3.5-transcribe` tried | `Models.ipynb`, `gemini-skills` |
| TTS | `gemini-3.1-flash-tts-preview` | exists (preview); streaming over `streamGenerateContent` (changelog *(snippet)*); 24 kHz 16-bit mono PCM; 30 prebuilt voices; language auto-detected; free tier "free of charge" *(snippet)* | `gemini-3.1-flash-tts-preview` (Track D `turn` and bake-off; Track P `/tts`) | `Models.ipynb`, cookbook `Get_started_TTS.ipynb`, Cloud notebooks |
| TTS alternative | Azure `ka-GE-GiorgiNeural` / `ka-GE-EkaNeural` | both exist (Standard, male / female). The same voices ship in Edge as "Microsoft Giorgi Online (Natural)" / "Microsoft Eka Online (Natural)" (A7) | Edge `speechSynthesis` in Track D; Azure not used | `azure-ai-docs` TTS language table |

Model IDs are **configuration, not constants** (§5.11). The free tier had a limit of 0 for this
project's earlier key (the demo branch's `docs/io-chatbot.md` §10) — hence A3's fresh key and the
Ollama fallback.

### 2.2 Ephemeral tokens (`POST …/auth_tokens`) — Track P

Source: Discovery `v1beta` rev 20260919 (`generativelanguage.auth_tokens.create`, schema `AuthToken`),
`@google/genai` 2.23.0 `src/tokens.ts`, `src/live.ts`, unit tests, Google's ephemeral-token example.

- **Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/auth_tokens` with
  `x-goog-api-key` and `Content-Type: application/json`; also on `v1alpha`; `v1` → 404 (probed). ✅
- **Request fields (wire names):** `uses` (default **1**; `0` = unlimited, never send; resuming does
  not consume a use), `expireTime` (RFC 3339, default 30 min, < 20 h; after it messages are rejected
  and Gemini may close the session — A5 sets it to 10 min as the session cap), `newSessionExpireTime`
  (default **60 s**, < 20 h), **`bidiGenerateContentSetup`** (the SDK calls it `liveConnectConstraints`:
  `model` as `models/<id>`, `systemInstruction`, `tools`, `generationConfig` incl. `responseModalities`
  / `speechConfig`, `inputAudioTranscription`, `outputAudioTranscription`, `realtimeInputConfig`,
  `sessionResumption`, `contextWindowCompression`) and **`fieldMask`** (the SDK's `lockAdditionalFields`).
- **Locking:** no `fieldMask` with a setup present → the token's setup is used entirely and the
  client's setup is **ignored** (including a `sessionResumption.handle`); a non-empty mask → only the
  listed fields are overwritten. Mismatches never error. Unverified, for the P1 smoke script: whether
  a parent path (`generationConfig`) locks sub-fields or sub-paths are needed, and whether a reconnect
  with a handle after the 60 s window is accepted.
- **Response:** `{ "name": "auth_tokens/…" }` — the `name` is the token; passed as `apiKey`; the SDK
  then opens `…/BidiGenerateContentConstrained?access_token=<token>`.
- **API version:** Google's browser example mints on `v1beta` and connects to the `v1beta`
  constrained endpoint; the SDK's unit test builds the same URL; the SDK's docs say `v1alpha` and it
  warns on anything else. V4.
- **Scope:** tokens work **only** for the Live API (the SDK throws for REST calls).
- **Caveat:** forum reports say minting fails with `INVALID_ARGUMENT` for `AQ.`-prefixed keys while
  `AIza…` keys work.
- Docs URL moved to `…/gemini-api/docs/live-api/ephemeral-tokens`.

### 2.3 Live API

Source: Discovery (`BidiGenerateContentSetup`, `RealtimeInputConfig`, `AutomaticActivityDetection`,
`AudioTranscriptionConfig`, `SessionResumptionConfig`, `ContextWindowCompressionConfig`,
`SpeechConfig`); SDK types; cookbook Live notebooks; `gemini-skills`; docs *(snippets)* where marked.

| Topic | Verified | We do |
|---|---|---|
| **Input audio** | raw 16-bit PCM, 16 kHz, mono, little-endian; `sendRealtimeInput({ audio: { data: <base64>, mimeType: 'audio/pcm;rate=16000' } })`; other rates resampled server-side; docs say 100 ms chunks *(snippet)*, Google's browser example sends 32 ms chunks | worklet emits 100 ms chunks (1600 samples); shorter tried if latency needs it |
| **Output audio** | raw 16-bit PCM, 24 kHz, mono, LE, base64 in `serverContent.modelTurn.parts[].inlineData` | player queues 24 kHz Int16 ✅ |
| **Output modality** | `['AUDIO']` only; **text output is no longer supported on Live** | V14 |
| **VAD** | on by default; `disabled`, `startOfSpeechSensitivity` / `endOfSpeechSensitivity` (both default HIGH on the Gemini API), `prefixPaddingMs`, `silenceDurationMs` (server default ≈ 800 ms *(snippet)*; the two sources define `prefixPaddingMs` differently); `activityHandling` defaults to `START_OF_ACTIVITY_INTERRUPTS`; with VAD disabled the client must send `activityStart` / `activityEnd`; `turnCoverage` default changed on 3.8 | automatic VAD on; `turnCoverage: TURN_INCLUDES_ONLY_ACTIVITY` explicit; tuned on Georgian speech in D4 |
| **Interruption (server)** | on barge-in the server sends `serverContent.interrupted` and skips `generationComplete`; pending tool calls arrive as `toolCallCancellation.ids`; only audio already sent stays in history *(snippet)* | `player.flush()`, cancel tools, state `interrupted` |
| **Interruption (manual)** | no interrupt message exists; `activityStart` is illegal with automatic VAD; a `clientContent` turn "unconditionally interrupts active generation" on 3.8; realtime text counts as activity. Flushing locally tells the server nothing | `player.flush()` + discard audio until `turnComplete`; sending a short realtime text as well is a D4 experiment (B7) |
| **Transcription** | `inputAudioTranscription: {}`, `outputAudioTranscription: {}`; transcripts in `serverContent.inputTranscription.text`, `interimInputTranscription.text`, `outputTranscription.text` (with `finished`, `languageCode`); `AudioTranscriptionConfig.languageCodes: ['ka']` gives BCP-47 hints | both on; hint set to the session language (`ka` vs `ka-GE` tested, B11) |
| **Session resumption** | `sessionResumption: { handle }`; `sessionResumptionUpdate` (`newHandle`, `resumable`); handles valid 2 h *(snippet)* or "up to 24 hours" (cookbook) — assume 2 h; `goAway.timeLeft` precedes a close (a report of it being skipped could not be read) | store the handle; reconnect on `goAway` **and** on an unexpected close |
| **Lifetimes** | connection ≈ 10 min; audio-only session 15 min unless compression is on *(snippet, also Google's skill)* | compression on; Track P sessions end at 10 min by design (A5) |
| **Context compression** | `{ slidingWindow: { targetTokens? }, triggerTokens? }`; `targetTokens` defaults to half of `triggerTokens`; both are int64 strings in the TypeScript types; cut at a user-turn boundary; never removes the system instruction; 128k in / 64k out | `{ slidingWindow: {}, triggerTokens: '25600' }` |
| **Language** | native-audio models "automatically choose the appropriate language and don't support explicitly setting the language code" *(snippet)*; Discovery's `speechConfig.languageCode` list has **no `ka-GE`**; Georgian appears as `ka` on the Live language table *(snippet)* | V2 |
| **Voices** | any of the 30 TTS prebuilt voices *(snippet)* | from config; bake-off picks |
| **Proactive audio, affective dialog, thinking** | on `gemini-3.8-live` proactive audio is **permanently on** (the model may stay silent on speech it judges not addressed to it); affective dialog removed; `thinkingConfig` must be omitted; `waitingForInput` and `interactionStatus` exist | none sent; `thinking` has a timeout; `waitingForInput` honoured |
| **Text turns** | `sendRealtimeInput({ text })` for real-time user input; `sendClientContent({ turns, turnComplete: true })` for context injection (also interrupts generation on 3.8) | typed questions → realtime text; the hidden `session_started` nudge → `sendClientContent` |
| **Tools** | `tools: [{ functionDeclarations }]`; `toolCall.functionCalls[]` (`id`, `name`, `args`); `sendToolResponse({ functionResponses: [{ id, name, response, scheduling?, willContinue? }] })`, `id` mandatory; `NON_BLOCKING` default on 3.8; `scheduling` `SILENT` / `WHEN_IDLE` / `INTERRUPT`; no automatic function calling | `behavior` explicit per declaration (§5.7); responses sent immediately |
| **Unsupported in the Live `generationConfig`** | `responseMimeType`, `responseSchema`, `stopSequences`, logprobs, `audioTimestamp`, … | only `responseModalities`, `temperature`, `speechConfig` |

### 2.4 `@google/genai` in the browser

Source: `googleapis/js-genai` at `f584bab` (2026-09-18; npm `latest` 2.23.0), sources, unit tests,
issues; a local esbuild measurement; Google's two browser samples.

- 2.23.0, Node ≥ 20 (3.x will require Node 22); `Live`, `Session` and token support are marked
  `@experimental`. Pin 2.x.
- **Size:** `dist/web/index.mjs` ≈ 1.08 MB unminified, no tree-shaking; a bundle of `GoogleGenAI` +
  `live.connect` measures **383,462 B minified / 69,210 B gzipped** — budget ≈ 70 KB gzipped for the
  SDK inside the lazy chunk. No Node polyfills needed (native `WebSocket`, `p-retry` only).
- With a plain key the SDK connects `…/BidiGenerateContent?key=<key>` (the key is in the URL; Track D
  keeps that on localhost); with a token `…/BidiGenerateContentConstrained?access_token=<token>`.
  Browser WebSockets cannot set headers.
- `ai.live.connect({ model, config, callbacks })` resolves **after `setupComplete`**; `onmessage`
  required; `config.httpOptions` throws (`apiVersion` goes on the client); `LiveConnectConfig.generationConfig`
  is deprecated — `responseModalities`, `speechConfig`, `temperature` sit on `config`.
- Issues: #1257 `connect()` never rejects when the socket closes before `open` → 10 s timeout
  (confirmed in D1: with an invalid key the socket closes with 1007 "API key not valid" and
  `connect()` never settles; the scripts' timeout reports the close code and reason); #1236
  close code 1008 on the 2.5 native-audio preview; #324 the Node entry crashes in Cloudflare Workers.
- Sending: `sendRealtimeInput({ audio: { data: <base64 string>, mimeType } })` (base64 only, never the
  legacy `media` key), `sendRealtimeInput({ text })`, `sendRealtimeInput({ audioStreamEnd: true })`,
  `sendClientContent({ turns, turnComplete })`, `sendToolResponse({ functionResponses })`.
- Receiving: `serverContent.{modelTurn, interrupted, turnComplete, generationComplete, inputTranscription,
  interimInputTranscription, outputTranscription, interactionStatus, waitingForInput}`, `toolCall`,
  `toolCallCancellation`, `sessionResumptionUpdate`, `goAway`, `setupComplete`, `usageMetadata`; one
  event can carry several — process every field.
- No reconnection in the SDK; the app reconnects with the stored handle.
- Lifecycle: AudioContext, mic and socket are created in the click handler and held in refs, never in
  a mount effect (`main.jsx` runs `React.StrictMode`, which double-invokes effects in development).
- Google's browser samples (`sdk-samples/index.html`; `gemini-live-api-examples/…-ephemeral-tokens-websocket`):
  16 kHz capture worklets, 24 kHz `AudioBuffer` playback scheduled with `nextStartTime`, an "interrupt"
  queue clear; neither resamples in JS; ours does.

### 2.5 Gemini TTS and STT (Track D `turn`, bake-off, Track P)

- **TTS request:** `POST models/gemini-3.1-flash-tts-preview:streamGenerateContent?alt=sse`,
  `contents: [{ parts: [{ text }] }]`,
  `generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } }`.
  Streaming confirmed by Google's Vertex notebook and the changelog *(snippet)*. Chunks are
  `inlineData` with mimeType **`audio/l16; rate=24000; channels=1`** (parse the rate with
  `/rate=(\d+)/`), raw PCM16 LE mono. Output watermarked with SynthID.
- **Language:** auto-detected from the text; `speechConfig.languageCode` has no `ka-GE` — not sent
  (V17). Georgian (`ka-ge`) is on the Gemini-TTS locale list in Google's Cloud notebook; quality
  untested → Gate G1. Style via an English prefix and English audio tags (stripped from captions).
- **Voices (30):** Zephyr, Puck, Charon, Kore, Fenrir, Leda, Orus, Aoede, Callirrhoe, Autonoe,
  Enceladus, Iapetus, Umbriel, Algieba, Despina, Erinome, Algenib, Rasalgethi, Laomedeia, Achernar,
  Alnilam, Schedar, Gacrux, Pulcherrima, Achird, Zubenelgenubi, Vindemiatrix, Sadachbia, Sadaltager,
  Sulafat. **Male-coded** (from Google demo code, not docs): Achird, Algenib, Algieba, Alnilam, Charon,
  Enceladus, Fenrir, Iapetus, Orus, Puck, Rasalgethi, Sadachbia, Sadaltager, Schedar, Umbriel,
  Zubenelgenubi. Kore and Zephyr are female-coded.
- **Prices:** Cloud list $1.00 / 1M text tokens in, $20.00 / 1M audio tokens out; the Gemini API
  pricing page *(snippet)* $0.50 / $10.00 with a free tier; 25 audio tokens per second.
- **STT via `generateContent`** (Track P): accepted MIME types `audio/wav`, `mp3`, `aiff`, `aac`,
  `ogg`, `flac`, `mpeg`, `m4a`, `l16`, `opus`, `alaw`, `mulaw`, `webm` — no `audio/mp4` (V7); inline
  limit 20 MB *(snippet)* or 100 MB (cookbook); prompt "Generate a transcript of the speech.";
  `generationConfig.audioTranscriptionConfig: { mode: 'VERBATIM', languageCodes: ['ka'] }` documented
  in `v1beta` (model support untested); 32 audio tokens per second.
- **Do not** use the Interactions API for `/tts` or `/stt`: interactions are stored by default
  (55 days on the paid tier). `generateContent` stores nothing for product use; Google's terms allow
  retention for abuse monitoring, and on the **free tier** Google may use content to improve its
  products — the demo README says so (§5.10).

### 2.6 Azure Speech (reference only — not used, A7)

`ka-GE-GiorgiNeural` (male) and `ka-GE-EkaNeural` (female) exist as Standard voices (no phoneme,
lexicon or viseme support). REST: `POST https://<region>.tts.speech.microsoft.com/cognitiveservices/v1`
with `Ocp-Apim-Subscription-Key`, `Content-Type: application/ssml+xml`,
`X-Microsoft-OutputFormat: raw-24khz-16bit-mono-pcm` and a required `User-Agent`. Azure STT lists
`ka-GE`. The same Microsoft voices are what Edge exposes through `speechSynthesis`, which is why the
demo uses Edge instead of an Azure account.

### 2.7 Browser capabilities (from `mdn/browser-compat-data`, Apple release notes, WebKit source)

| Feature | Chrome / Edge | Firefox | Safari (macOS ≥ 14.1, iOS ≥ 14.5) | Android Chrome |
|---|---|---|---|---|
| `SpeechRecognition` | yes (prefixed since 33, unprefixed 139); Chrome sends audio to Google's servers, Edge to Microsoft's; HTTPS or localhost only | flag only | **prefixed only** (`webkitSpeechRecognition`); Apple's recogniser, on-device when the locale allows; nothing for unavailable locales; secure context only since Safari 26 | yes; `continuous` ignored |
| `lang = 'ka-GE'` | Edge: Microsoft's service lists `ka-GE` (§2.6); Chrome: unverified (Google Cloud Speech lists `ka-GE`; Chrome's demo table reportedly includes it) — the `language-not-supported` error switches to typed mode | — | assume unsupported → typed mode | as Chrome |
| `AudioWorklet` | 66+ | 76+ | 14.1+ | yes |
| `AudioContext({ sampleRate })` | 74+ | 61+ | **honoured since 14.1** — the brief's "Safari ignores it" is outdated; the worklet resampler is kept anyway | yes |
| AudioContext / `speechSynthesis` unlock | inside a user gesture | same | contexts start suspended; `resume()` in the click handler | same |
| `MediaRecorder` | `audio/webm;codecs=opus` | `audio/ogg` | `audio/mp4` (AAC); `audio/webm;codecs=opus` since 18.4 | as Chrome |
| `<iframe allow="microphone; autoplay">` | 60+ | 74+ | 11.1+ | yes |
| `localStorage` inside a cross-site iframe | partitioned | partitioned | partitioned / may throw | partitioned |

Permissions policy: the default allowlist for `microphone` and `autoplay` is `self`; an iframe
inherits the parent's policy and the feature must be allowed by both the parent page and the `allow`
attribute; a sandboxed iframe additionally needs `allow-same-origin`; both pages must be HTTPS.
"Safari ≥ 14.1 / iOS ≥ 14.5" is the floor for the whole voice stack on Apple platforms.

### 2.8 Cloudflare Workers (Track P; from `cloudflare/cloudflare-docs`, branch `production`)

- **Rate Limiting binding** (`ratelimits`, Wrangler ≥ 4.36): `period` **10 or 60 s only**, counters
  per Cloudflare location, "permissive, eventually consistent"; the docs advise against IP keys.
- **KV**: `expirationTtl` ≥ 60 s; 1 write per key per second; eventual consistency up to 60 s;
  **Free plan: 100,000 reads and 1,000 writes per day for the account**. A5's counters (session
  starts, concurrent sessions, the global minutes budget) are all written at token mint only, so
  ≈ 2–3 writes per session — 300 sessions a day fit the free plan. **Durable Objects** are on the Free
  plan (100,000 requests/day) and give exact counters if the KV approximation proves too loose.
- **Secrets**: `npx wrangler secret put NAME`; local values in `worker/.dev.vars`; no
  `secrets.required` (it blocks optional secrets); `.gitignore` uses `worker/.dev.vars`,
  `worker/.dev.vars.*`, `!worker/.dev.vars.example`.
- **Turnstile** (optional bot check on `/token`): `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`;
  tokens single-use, 300 s; test secret `1x0000000000000000000000000000000AA`; loads a Cloudflare
  script on the page (a third-party request the README must mention if used).
- **Streaming**: `return new Response(upstream.body, …)` is optimal; request duration unlimited while
  the client stays connected; **CPU 10 ms per request on Free**; a 30 s abort covers connect + headers
  only.
- **CORS**: echo the matched origin, `Vary: Origin`, `OPTIONS` → 204 with `Access-Control-Max-Age: 86400`;
  client IP in `CF-Connecting-IP`.
- **Limits**: Free 100,000 requests/day (Error 1027 after), 50 subrequests per request, bundle 64 MiB,
  1 s startup; `workers.dev` is for hobby projects — fine for the personal-account pilot (A4), a custom
  domain when the agency adopts it.
- **Config**: `wrangler.jsonc`; `compatibility_date: "2026-09-19"`; `kv_namespaces: [{ binding, id }]`;
  `observability.enabled: false` (no request logging).

### 2.9 Costs

Moved to §10 (the budget-request section).

### 2.10 To re-read on the docs pages when they are reachable

The Live language table (Georgian as `ka`, the valid transcription hint), the free-tier limits per
model (the smoke test measures them instead), the ephemeral-token page's limitations, the Gemini API
TTS price, the free- and paid-tier data-use terms (for the README), the Rate Limiting binding's plan
availability, Chrome's Web Speech language list.

### 2.11 `speechSynthesis` — what D1's bake-off page must establish (not verified in Phase 0)

Expected behaviour, to be confirmed in Edge and Chrome on the presenter's machine: voices arrive
asynchronously (`getVoices()` may be empty until `voiceschanged`, which can fire more than once);
Edge's "Online (Natural)" voices exist only with network access and send the text to Microsoft;
Chrome on Windows/macOS offers the operating system's voices plus Google's remote voices, and a
Georgian voice is present only if the OS has one; `SpeechSynthesisUtterance.onboundary` (`name ===
'word'`) fires for local voices and, reportedly, for Edge's online voices, but historically **not**
for Chrome's remote Google voices — hence the sine fallback (§5.5); Chrome cuts long remote
utterances after ≈ 15 s — hence sentence chunking; speaking needs a prior user gesture (the *Talk*
click); `speechSynthesis.cancel()` may fire `onerror` with `interrupted` / `canceled` on the current
utterance (ignored); a hidden tab may pause synthesis. The bake-off page prints the voice list, the
boundary-event rate per voice and any errors, so G1 is decided on measurements.

---

## 3. Architecture

### 3.1 Track D — demo (no backend)

```
Presenter's browser (npm run dev on localhost; or the personal IO-for-main-page Pages site + pasted key)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ App.jsx ── ?voice=browser|live|turn|stub ── static Talk button (A8), T key, AudioContext │
│ IoHost.jsx  mode: host | talk ── RobotCanvas → RobotModel (mouthLevel ref, listening,     │
│                                              tapReaction) ── TranscriptPanel · VoiceDock  │
│ src/voice/ (lazy chunk, self-contained)                                                  │
│   session/select.js  → one of:                                                           │
│   ┌ BrowserVoiceSession ─ stt/webSpeech ─ llm/geminiDirect | llm/openaiCompatible ─ tts/speechSynthesis (word-boundary mouth)
│   ├ TurnVoiceSession ─── stt/webSpeech ─ llm/geminiDirect ──────────────────────── tts/geminiDirect → audio/player (amplitude mouth)
│   └ LiveVoiceSession ─── auth/devKey ── @google/genai live.connect (barge-in, VAD, tools) → audio/player
│   tutor/ persona · skills · memory · tools · strings · lookup ← public/io-index.json (CyberHero only, A6)
│   auth/devKey.js: __IO_DEV_GEMINI_KEY__ (dev serve only) or localStorage['io.gemini.key'] (pasted)
└────────────────────────────────────────────────────────────────────────────────────────┘
        │ Web Speech recognition → Google (Chrome) / Microsoft (Edge)     │ browser voices → Microsoft (Edge online voices)
        │ Gemini API (key from the browser, free tier) or http://localhost:11434/v1 (Ollama)
```

### 3.2 Track P — production (the brief's architecture, deferred)

```
Browser (GitHub Pages)                                        Cloudflare Worker (worker/)
┌──────────────────────────────────────────────┐              ┌──────────────────────────────────────┐
│ same client; providers swapped:               │              │ POST /token → v1beta/auth_tokens      │
│   LiveVoiceSession ─ auth/workerToken ────────┼─ WebSocket ─▶│   uses:1, expireTime +10 min (A5),   │
│   TurnVoiceSession ─ stt/webSpeech|upload ─   │  (Gemini     │   locked setup + fieldMask            │
│                      llm/workerProxy ─────────┼─ fetch ─────▶│ POST /chat → Flash SSE, forwarded     │
│                      tts/worker ──────────────┼─────────────▶│ POST /tts  → Gemini TTS PCM16 24 kHz  │
│   BrowserVoiceSession = text-only mode when   │              │ POST /stt  → Flash + inline WAV       │
│   the global budget is exhausted (A5)         │              │ origin allowlist · CORS · A5 limits · │
│   tutor/* unchanged                           │              │ global minutes budget · no logging    │
└──────────────────────────────────────────────┘              └──────────────────────────────────────┘
```

### 3.3 One client, two transports

| Concern | Track D (now) | Track P (later) | Interface |
|---|---|---|---|
| Live auth | `auth/devKey.js` — the dev key, localhost + dev builds only | `auth/workerToken.js` — `POST /token` | `getLiveAuth() → { apiKey, apiVersion, model, locked: boolean }` |
| Chat | `llm/geminiDirect.js` (key in the browser) or `llm/openaiCompatible.js` (local model) | `llm/workerProxy.js` (`POST /chat`) | `streamChat({ lang, history, grounding, signal }) → async iterator of { text } | { functionCall } | { finish }` |
| TTS | `tts/speechSynthesis.js` (browser voices) or `tts/geminiDirect.js` | `tts/worker.js` (`POST /tts`) | `speak(sentence, lang) → { level | boundary events, done, cancel }` |
| STT | `stt/webSpeech.js` | `stt/webSpeech.js` or `stt/upload.js` (`POST /stt`) | `listen(lang) → { interim, final, error }` |
| Grounding | `tutor/lookup.js` over `public/io-index.json` | same | `lookup(query, lang) → top 3 chunks` |
| Persona / tools | built in the browser | built in the Worker from the same modules | `buildSystemInstruction()`, `TOOL_DECLARATIONS` |

All three sessions implement the brief's `VoiceSession` interface (`start`, `sendText`,
`interrupt`, `end`, `on`); `useIoVoice` owns exactly one and is the only module that touches React
state; audio level reaches the model through a ref. `src/voice` imports nothing from `App.jsx` or
`worker/`; the Worker (Track P) imports the tutor modules at build time.

---

## 4. File-by-file plan

### 4.1 Existing files on `IO-for-main-page`

Line numbers refer to `IO-for-main-page` (`dc8a296`) and are for the implementer.

| File | Today | How it is touched | Phase |
|---|---|---|---|
| `README.md` | Rules: "host, not a teacher … no cyber-security tips" (13–16); embed contract and iframe snippet without `allow=` (128–143); query params (112–119); deploy gate (155–160); privacy paragraph "Static site, no backend, no cookies, no analytics, no third-party requests …" (164–168). | A **"Talk to IO (demo build)"** section and an honest privacy paragraph for Track D (§5.10); the Track P text is drafted but marked "not deployed". Iframe snippet: `allow="microphone; autoplay"`, a `voice=1` variant, its height, and the spaced em dash in `title`. `surprised` noted as a talk-mode face. `index.html:10` reworded. | D6 |
| `src/App.jsx` | `params` memo (12); `embed` / `skin` (13–14); embed branch (34–40); hero mounts `IoHost` + `.io-hint` (83–86); `PathCard` drives the ref (115–148); language buttons (58–68); login URL hard-coded (70). | Parse `?voice` (`browser` / `live` / `turn` / `stub`; `1` enables the dock in embed). Render the static **ესაუბრეთ იოს / Talk to IO** `<button>` under `.io-hint` (V11) — or a *Type a question* button when the browser has neither `SpeechRecognition` nor a voice for the page language (A8; voices are re-checked on `voiceschanged`) — and a `keydown` listener for `KeyT` (`e.code`, since a Georgian layout reports `ტ`; ignored when the target is editable or `altKey` / `ctrlKey` / `metaKey` / `isComposing` is set). The handler **synchronously** creates and resumes one `AudioContext` and speaks an empty `SpeechSynthesisUtterance` (both unlocks inside the gesture), then `await import('./voice/VoiceDock.jsx')` (prefetched on `pointerenter`), then sets `mode='talk'`. Pass `mode`, the AudioContext, `lang`, the ref, `{ paths: { basic: { url }, kids: { url, newTab: true } }, loginUrl }` to the voice layer as props; hide `.io-hint` in talk mode; restart the session when `lang` changes. Host-mode tree otherwise unchanged. | D2, D3, D5 |
| `src/main.jsx`, `index.html` | fonts; shell. | `main.jsx` untouched. `index.html`: reword line 10; `viewport-fit=cover` (B8). | D6 |
| `vite.config.js` | `base: '/IO-for-main-page/'`, `plugins: [react()]`, no `rollupOptions`. | `defineConfig(({ command, mode }) => …)` with `loadEnv` reading `.env.local`; `define: { __IO_DEV_GEMINI_KEY__: JSON.stringify(command === 'serve' ? env.IO_GEMINI_KEY ?? '' : '') }` — the key is injected into dev serves only and is **structurally absent from every build** whatever `.env.local` contains (V13). `base` unchanged. | D1 |
| `package.json` / lockfile | react 18.3.1, three 0.169.0, r3f 8.18.0, vite 5.4.21; scripts `dev build preview check`. | Add `@google/genai` 2.x (lazy chunk only); scripts `check:voice`, `check:dist`, `smoke:voice`, `bakeoff`, `test` (Node's built-in runner over `test/*.test.mjs`); `check` becomes `check-hints && check-voice`; `postbuild` runs `check:dist`; `build:index` arrives with its script in D5. No npm workspaces; `worker/` (Track P) has its own `package.json`. | D1 |
| `.github/workflows/deploy.yml` | push to `main` + gate `repository.name == 'IO-for-main-page'`, Node 20, `npm ci && npm run check && npm run build`. | Gate unchanged (it publishes the preview from the personal repository, A2). Add `env:` `VITE_IO_VOICE_DEFAULT` from a repository variable; `check:dist` runs via `postbuild`. `VITE_IO_SAFETY_REQUIRED: '1'` belongs to the Track P workflow (P3): the demo builds with `0`, and while `safety.js` holds placeholders the persona says "tell a trusted adult now" without reading the file (`check-voice.mjs` warns). A separate `voice-ci.yml` on `io-voice` builds and checks, deploys nothing. Track P adds `VITE_IO_API_BASE` and a Worker type-check job. | D1 |
| `.gitignore` | `node_modules/ dist/ *.local .env .env.* .DS_Store npm-debug.log*` — `.env.*` also hides `.env.example`. | Add `!.env.example`, `bakeoff/*` + `!bakeoff/README.md`, `src/voice/tutor/local/` (the optional Basic Course index, A6), `worker/.dev.vars`, `worker/.dev.vars.*`, `!worker/.dev.vars.example`, `worker/.wrangler/`. | D1 |
| `src/mascot/IoHost.jsx` | Timers: greet + wave at 500 ms (0 in reduced motion), intro at 6500 ms (52–63), sleepy wake-up 2600 ms (48), unhover drift-back 1400 ms (97–101); typewriter 2 code points / 22 ms (113–131); `talking = shown < text` (133); `onTap → host.next()` (65–71); ref API `hover/unhover/farewell` (79–108); DOM `.io-bubble > p[aria-hidden] + span.sr-only[role=status][aria-live=polite][aria-atomic]` (137–144); props to `RobotCanvas` (145–155). | Add `mode = 'host'` and a `talk` prop bundle `{ emotion, gesture, mouthLevel, talking, listening, label, panel, onInterrupt }`. Host mode unchanged. Entering talk: `clearLater()`, `hover/unhover` return early, `onTap` → `talk.onInterrupt()` before `host.next()`, the bubble's content becomes `talk.panel` (a slot from App), `emotion/gesture/talking/label` come from `talk`, `mouthLevel/listening/tapReaction={false}` forwarded. Leaving talk: `setGesture(null)`, clear hover bookkeeping, then verbatim `if (!lastCycled.current) lastCycled.current = host.intro(); say(lastCycled.current)`. `farewell()` keeps host semantics. §5.1. | D2 |
| `src/mascot/hostBrain.js` | `MOOD`, `CYCLE`, `createHost`. | **Untouched.** | — |
| `src/mascot/RobotCanvas.jsx` | forwards unknown props to the model (56, 102); keyboard tap (73–79); `frameloop='demand'` in reduced motion (96); WebGL fallback (25–52). | **No code change**; the new props flow through `...robotProps`; talk mode works on the WebGL fallback (dock, captions, board), the model props are no-ops there. | — |
| `src/mascot/RobotModel.jsx` | props (86–98); `anim` ref (110–120); tap reaction 1.8 s (179–186); gesture overlay 1.9 s (189–196); reduced-motion return (200–203); LED pulse (311–313); **mouth line 340**; `handleTap` (350–355). | Three additive props: `mouthLevel` (ref or number), `listening`, `tapReaction = true`; §5.2. | D2 |
| `src/mascot/faceTexture.js` | `drawFace` (174–312); `open = 1 - blink` (218); `faceKey` (321–324); `surprised` (263). | Optional `eyesWide = 0`: `open = (1 - blink) * (1 + 0.12 * eyesWide)` and `|q(eyesWide)` in `faceKey`; byte-identical output at 0. | D2 |
| `src/content/hints.js` | host lines. | **Untouched**; imported for facts and the bake-off lines. | — |
| `src/i18n/ui.js` | `UI.ka/en`, `LANGS`, `initialLang()`. | Add `voice.talk`, `voice.typeInstead` and `loginUrl` only (the entry button needs them in the initial chunk); every other `voice.*` string lives in `src/voice/i18n.js`, the lazy chunk (§6.1); `initialLang()` untouched. | D2 |
| `src/styles/global.css` | tokens; `.io-host`, `.io-bubble`, `.io-hint`, `.hero-io`, embed, reduced motion. | One appended block of ≈ 10 lines for `.io-talk` (V11); everything else in `src/voice/voice.css`. | D2 |
| `scripts/check-hints.mjs` | checks `HINTS` only; exports nothing, exits at top level. | **Refactored, behaviour identical:** regexes move to `scripts/lib/lint.mjs` (`lintPair()`), imported by `check-hints.mjs` and the new `check-voice.mjs` (§6.3). | D1 |

### 4.2 Files taken from other branches

| Source (`git show <ref>:<path>`) | Used for | Notes |
|---|---|---|
| `origin/io-chat-gemini:src/chat/llmClient.js` | `src/voice/llm/geminiDirect.js` + `llm/geminiSse.js` (the SSE parser) + **the runtime-key field pattern** (A2): key resolution order env-injected dev key → `localStorage['io.gemini.key']` pasted in the dock | Fixes while porting: parse the leftover buffer after `done`, surface `finishReason` (`STOP`, `MAX_TOKENS`, `SAFETY`) as a terminal event, extract `parts[].functionCall`, send the key as the `x-goog-api-key` header instead of `?key=`, add `tools` and `safetySettings` to the body. |
| `origin/io-chat-gemini:src/chat/useIoChat.js` | the turn pipeline shared by `BrowserVoiceSession` and `TurnVoiceSession`: message shape, `history.slice(-8)`, the generation counter, `AbortController` | As a plain class. A new utterance interrupts first instead of being dropped. History normalised to start with `user` and alternate. |
| `origin/io-chat-gemini:src/mascot/ioBrain.js` | `scripts/build-io-index.mjs` (the CyberHero chunk builder: missions, guides, tips → 330 bilingual chunks) and `tutor/lookup.js` (retrieval) | Retrieval ported with BM25-style weighting, a title boost and a synonym map (`ორმაგი ავთენტიფიკაცია ↔ ორფაქტორიანი ↔ მრავალფაქტორიანი ↔ 2FA`, `ფიშინგი ↔ phishing`, `დეზინფორმაცია ↔ ყალბი ამბები`, `დიპფეიკი ↔ deepfake`). |
| `origin/main:src/content/guardians/*`, `parents/*`, `mascot.js` (≈ 690 KB, proofread) | the public CyberHero corpus for the index | Read by the build script only. |
| `origin/claude/mascot-robot-demo-9oclw8:src/content/ioCourse.js` | **not copied into the repository** (A6). If the presenter wants course answers in the demo, `npm run build:index -- --local-course <path>` writes a gitignored `src/voice/tutor/local/basic.json`; `tutor/lookup.js` loads it through `import.meta.glob('./local/*.json')` (an absent folder yields `{}`, so machines without the file still build) and only while `__IO_DEV_SERVE__` is true — a second `define` set exactly like the key (`command === 'serve'`); `check:dist` greps every build for a course sentence as the backstop. | The course's term for two-factor is „ორმაგი ავთენტიფიკაცია“; the persona uses it. |
| `origin/io-chat-gemini:docs/io-chatbot.md` and the demo branch's `ioBrain.js` persona | agreed persona rules (language mirroring; ground on platform content; never ask for personal data; refuse hacking; do not invent features; honest refusal „ეს კურსში არ არის განხილული“; the native-Georgian quality clause) | Folded into `tutor/persona.js` — **except** the "call 112" line: no number or organisation name is typed into the persona (§5.8). The chat strings are in the შენ register with hyphen dashes — rewritten. |

### 4.3 New files (Track D; Track P additions marked)

```
src/voice/
  VoiceDock.jsx                Talk button state ring, text input, End, mute, Delete my data, mic-open indicator,
                               dev badge with the active session (A3), runtime-key field (A2)
  TranscriptPanel.jsx          talk-mode bubble content: last two turns, live caption, own aria-live region; bottom sheet ≤ 900 px
  BoardPanel.jsx               steps / checklist / diagram / link cards and the quiz card
  diagrams/{phishing_email,password_strength,two_factor_flow}.jsx   inline SVG, KA/EN labels
  voice.css                    every new rule, scoped (.io-host[data-mode="talk"], .voice-*)
  index.js                     the lazy chunk's entry (App.jsx imports nothing else from src/voice)
  IoVoice.jsx                  the layer's root: runs the state machine, renders the dock, lifts IO's props to App through onTalk
  store.js  transcript.js      a tiny external store (useSyncExternalStore) and the transcript as pure data
  i18n.js                      the voice.* strings (KA/EN) in the lazy chunk; ui.js keeps only the two entry strings
  useIoVoice.js                state machine: one VoiceSession, events → IoHost props, Esc / T handling, thinking timeout, the mouth loop
  session/VoiceSession.js      the interface (JSDoc typedefs) + shared helpers
  session/select.js            ?voice= → VITE_IO_VOICE_DEFAULT (per-language allowed) → capability fallback; exposes the reason for the badge
  session/pipeline.js          the turn pipeline: rolling window, generation counter, abort, safety settings, 429 retry, Gemini | local backend
  session/pushToTalk.js        the shared push-to-talk session (recogniser → pipeline → a speaker); browser and turn differ only in the speaker
  session/BrowserVoiceSession.js   webSpeech + geminiDirect|openaiCompatible + speechSynthesis (A3)
  session/TurnVoiceSession.js  webSpeech(+upload in P) + chat transport + geminiDirect|worker TTS → player
  session/LiveVoiceSession.js  @google/genai live.connect with an auth provider
  session/StubVoiceSession.js  plays a bundled WAV — D2 acceptance harness (?voice=stub in dev)
  auth/devKey.js               __IO_DEV_GEMINI_KEY__ (dev serve + localhost only) and the pasted runtime key
  auth/workerToken.js          (P) POST /token
  llm/geminiSse.js  llm/geminiDirect.js  llm/openaiCompatible.js  llm/workerProxy.js (P)
  stt/webSpeech.js  stt/upload.js (P)
  tts/speechSynthesis.js       voice selection by BCP-47 + preferred names, voiceschanged, sentence queue, boundary → mouth pulse, cancel()
  tts/geminiDirect.js  tts/worker.js (P)
  audio/mic.js  audio/mic-worklet.js  audio/player.js   (as in the brief; player.level() 60 ms attack / 120 ms release)
  tutor/persona.js  tutor/skills.js  tutor/memory.js  tutor/tools.js  tutor/strings.js  tutor/lookup.js
  tutor/local/                 gitignored; optional dev-only Basic Course index (A6)
  audio/pcm.js                 pure PCM helpers (int16 ↔ float, resampling, WAV parsing, the stub's test signal)
  dev/bakeoffLines.js          the seven bake-off lines, shared by the page and the script
  dev/BakeoffPanel.jsx         dev-only page (?bakeoff=1 on localhost): speaks the six lines with every ka/en voice, logs boundary events
src/content/safety.js          KA/EN resources with placeholders the DGA team fills in
public/io-index.json           generated from the CyberHero content by scripts/build-io-index.mjs and committed
scripts/
  lib/lint.mjs  check-voice.mjs  check-dist.mjs  voice-smoke.mjs  voice-bakeoff.mjs  build-io-index.mjs
  e2e/talk.mjs  e2e/live.mjs  e2e/host-diff.mjs   headless-Chromium acceptance (the stub, the mocked Gemini API, the mocked Live socket; host mode pixel diff), not run in CI
bakeoff/README.md              rating sheet + decision block (audio files gitignored)
docs/
  io-voice-build-prompt.md  io-voice-plan.md (this file)  io-voice-test-script.md (D5)  io-voice-demo.md (D6: run sheet for the presentation)
.env.example                   §5.11
worker/ (Track P)              package.json  tsconfig.json  wrangler.jsonc  .dev.vars.example  README.md
                               src/index.ts  config.ts  limits.ts  text.ts  tutor.ts  routes/{token,chat,tts,stt}.ts  tts/{types,gemini}.ts
```

### 4.4 Grounding content (A6, V10)

`scripts/build-io-index.mjs` reads the CyberHero content straight from git
(`origin/main:src/content/{guardians,parents,mascot}`), builds the 330 bilingual chunks with the
`ioBrain` builder, tags each `{ source: 'mission'|'guide'|'tip', ref, title, en, ka }` and writes
`public/io-index.json` (≈ 480 KB raw, ≈ 113 KB gzipped). `tutor/lookup.js` fetches it on the first
`lookup()` (never on page load), scores client-side and returns the top 3 as text; there is no
server round-trip. The Basic Course is **not** indexed in the repository: for questions about it IO
states what the course covers from `hints.js` (nine topics, three hours, the test) and points to it.
The optional gitignored local index (§4.2) exists only for a dev-mode demo on the presenter's machine.

---

## 5. Design details agreed in Phase 0

### 5.1 `IoHost` talk mode (D2)

- `mode` is mirrored into a ref so timer callbacks read the current mode; on entering talk mode
  `clearLater()` runs and each callback returns early in talk mode.
- The `.io-bubble` element is **kept mounted** with the transcript rendered inside it at a **fixed
  height** (104 px = the three-line host bubble; `clamp(104px, 20vh, 144px)` if two full turns must
  fit), scrollable, so IO does not move while captions stream; the one-time change from a shorter
  host bubble is transitioned (auto-disabled under reduced motion). Re-mounting would replay `rise`.
- The host `role="status"` span is `aria-atomic`; the transcript has its **own** `aria-live="polite"`
  region and appends completed sentences, not tokens.
- Gesture ids from the voice layer are string-namespaced (`'v12'`); `setGesture(null)` on both mode
  transitions.
- Emotion while speaking must be a mouth-responsive face (`happy` or `wink`); `thinking`,
  `surprised`, `sleepy`, `sad` draw a fixed mouth and `excited`/`celebrate`/`funny` floor it at
  0.55–0.75. Gesture overlays show `excited` for 1.9 s after a wave/bounce — accepted.
- *Talk* pressed before the 500 ms greeting skips the greeting; on leaving talk mode the intro rule
  applies (B12). A language switch mid-talk ends the session and starts a new one.
- The canvas `aria-label` in talk mode is state-neutral (`voice.ioLabelTalk`, §6.1).

### 5.2 The model's mouth and the listening cue (D2)

```js
// RobotModel.jsx, replacing line 340
const lvl = typeof mouthLevel === 'number' ? mouthLevel : mouthLevel?.current
let mouthOpen
if (lvl != null) {
  const target = 0.15 + 0.6 * clamp01(lvl)
  a.mouth += (target - a.mouth) * Math.min(1, dt * (target > a.mouth ? 22 : 12))
  mouthOpen = a.mouth
} else {
  a.mouth = 0
  mouthOpen = talking ? 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 11)) : 0 // unchanged
}
```

Three sources feed that ref: the player's smoothed RMS (`turn`, `live`: ≈ 60 ms attack / 120 ms
release as the brief specifies), the **word-boundary pulse** of `tts/speechSynthesis.js` (`browser`:
each `onboundary` word event sets the level to 0.9, which decays to 0.05 over ≈ 180 ms, so the mouth
opens once per word), or `null` outside `speaking` so the mouth closes fully. When a browser voice
fires no boundary event within 400 ms of `onstart`, `useIoVoice` sets the level ref to `null` for
that utterance and `talking = true`, so the original sine branch plays (A3's fallback; the
`lvl != null` branch would otherwise win). Cost: the 512 px face already repaints ≈ 30 times/s during
the typewriter; the level path is similar and may be quantised to 1/16 without touching host mode.

Listening cue: `anim.listen` blends toward `listening ? 1 : 0` at `dt·4`; LEDs (`ledMats`, both
skins) cross-fade `(0.6 + 0.4·sin(t·2.3 + i·0.9))·(1−l) + (0.85 + 0.45·sin(t·5))·l` (identical at
`l = 0`); eyes 12 % taller via `eyesWide`. `tapReaction={false}` in talk mode disables the built-in
tap wave/overlay so the 400 ms `surprised` overlay on interruption is visible. Under reduced motion
none of this runs (the early return at 200–203 precedes it and `paintFace` is called without
`eyesWide`).

### 5.3 Layout, the entry button and CSS (D2, D5, D6)

- **Entry (A8, V11, V12):** a small `<button class="io-talk">` under `.io-hint` in `.hero-io` (a
  centred flex column: nothing above it moves), DGA palette (`--blue` on white, 7.25:1; the
  `.path-cta` recipe at a smaller size), label `ესაუბრეთ იოს` / `Talk to IO`. When the browser has
  neither `SpeechRecognition` nor a `speechSynthesis` voice for the page language (checked at mount
  and again on `voiceschanged`), the same slot shows `დაწერეთ კითხვა` / `Type a question`, which opens
  the dock in typed mode. `T` (`e.code === 'KeyT'`, never inside an editable field or with a modifier)
  opens talk mode from host mode and starts/stops listening inside it; `Esc` interrupts. In
  `.embed-stage` the button appears only with `?voice=1`. Its ≈ 10 lines of CSS are appended to
  `global.css`.
- **Desktop talk mode:** transcript in the bubble slot (fixed height); `VoiceDock` and `BoardPanel`
  **after** the canvas inside `.io-host` (a top-aligned flex column — additions below never move IO);
  everything `max-width: 360px`; the sticky `.hero-io` simply scrolls on short viewports.
- **≤ 900 px:** dock + transcript + board as a `position: fixed` bottom sheet (`z-index: 90`, under
  the skip link's 100), collapsed ≈ 64 px / expanded ≤ 45 vh, internal scroll,
  `env(safe-area-inset-bottom)`. Never a descendant of `.io-canvas` (its `filter` traps `fixed`).
- **Embed (`?embed=1&voice=1`, local test iframe in D6):** the dock is `position: fixed; bottom: 0`;
  captions stay in the fixed-height bubble; documented minimum height **520 px** with `voice=1`;
  460 px stays for embeds without it, which render pixel-identical.
- **Colours:** buttons `--blue` on white, hover `--blue-2` (4.57:1); coral only for the listening
  ring / outline, never for text; quiz results carry an icon and text, not colour alone; `--line`
  borders are never the only affordance. Font weights 400/600/700/800 only. Inputs ≥ 16 px.
- **Two indicators:** the state ring on the dock button (idle / connecting / listening / thinking /
  speaking) and a **microphone-open indicator** (coral dot + `role="status"` text `voice.micOn`)
  bound to the recogniser / `MediaStreamTrack` state, because on the Live path the mic stays open
  through `thinking` and `speaking`. Both static under reduced motion.
- **Dev badge (A3):** in dev builds only, a small label in the dock shows the active session and the
  reason (`browser · live: no key`).
- **Runtime-key field (A2):** shown in the dock only when the chosen session needs a key and no dev
  key is injected; the value goes to `localStorage['io.gemini.key']` and nowhere else; a *Forget key*
  button clears it. Never rendered when a dev key exists.
- **`navigate_to_path`:** highlights the card with `data-io-highlight` rules that duplicate the
  `:hover` declarations, ends the session, switches to host mode, plays `farewell()`, waits ≈ 1.9 s
  (≈ 1 s in reduced motion), then follows the link; `window.open` may be blocked because a tool call
  is not a user gesture → a `link` card the learner clicks; in embed mode always the link card.

### 5.4 Session selection and key handling (D1, D3)

```js
// vite.config.js — the only way a key reaches the browser in Track D
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')            // reads .env.local, including non-VITE_ keys
  return {
    base: '/IO-for-main-page/',
    plugins: [react()],
    define: {
      __IO_DEV_SERVE__: JSON.stringify(command === 'serve'),
      __IO_DEV_GEMINI_KEY__: JSON.stringify(command === 'serve' ? (env.IO_GEMINI_KEY ?? '') : ''),
    },
  }
})
```

- `.env.local` holds `IO_GEMINI_KEY=…` — **no `VITE_` prefix**, so Vite itself never inlines it; the
  `define` above injects it into `npm run dev` only. `npm run build` always defines it as `''`, so a
  deployed preview cannot contain the key whatever the machine's `.env.local` says (V13).
  `check:dist` (`postbuild`) additionally scans the `.js`, `.css`, `.html` and `.json` files in
  `dist/` for full key shapes (`AIza[0-9A-Za-z_-]{35}`, `AQ\.[A-Za-z0-9_-]{20,}`) and for a Basic
  Course sentence, and fails the build on a hit.
- In a dev serve Vite 5 does not replace `define` values in the served source; it sets them as page
  globals from the `/@vite/env` module that `/@vite/client` imports (verified in D1), readable by
  anyone who can load the dev server: **never run `vite --host` (a LAN-exposed dev server) with a
  key in `.env.local`**; phones are tested against the deployed preview with a pasted key.
- `auth/devKey.js`: `devKey()` returns `__IO_DEV_GEMINI_KEY__` only when `__IO_DEV_SERVE__` is true
  and `location.hostname` is `localhost` / `127.0.0.1`; `runtimeKey()` returns the pasted key;
  `resolveKey()` = dev key, else runtime key. **Live uses `devKey()` only** (A3: localhost); `turn`
  and the Gemini-backed `browser` session use `resolveKey()`.
- `session/select.js`: `?voice=` → `VITE_IO_VOICE_DEFAULT` (`browser | live | turn`, or per language
  `ka=browser,en=live`, V21) → capability fallback: `live` needs `devKey()` and `VITE_IO_LIVE_OK=1`
  (set after the smoke test); `turn` needs `resolveKey()`; `browser` needs a chat backend (a key or a
  reachable local endpoint) and either `SpeechRecognition` or typed mode. The dock badge shows the
  result and why. `?voice=stub` (dev) plays a bundled WAV for the D2 acceptance test.
- LLM backend for `browser`: `VITE_IO_LLM=gemini` (`llm/geminiDirect.js`, `x-goog-api-key` header,
  `tools` native, `safetySettings` explicit) or `VITE_IO_LLM=openai` (`llm/openaiCompatible.js`:
  `POST <VITE_IO_LLM_BASE>/chat/completions` with `stream: true`, `data:` lines,
  `choices[0].delta.content`; default base `http://localhost:11434/v1`, model `gemma3`). Ollama's
  native tool calling is not reliable for `gemma3`, so on that backend tools use a text convention
  (a line `@@tool <name> <json>`; the pipeline holds back any line starting with `@@` until its
  newline and strips it from captions and TTS); `lookup_course_material` grounding is injected into
  the prompt instead. Ollama accepts `localhost` origins by default; a github.io preview would need
  `OLLAMA_ORIGINS`. Georgian quality of `gemma3` is expected to be noticeably below Gemini's and is
  recorded after the first test (§12).

### 5.5 `BrowserVoiceSession` (A3, D3)

- **STT** (`stt/webSpeech.js`): `const R = window.SpeechRecognition || window.webkitSpeechRecognition`;
  `lang = 'ka-GE' | 'en-US'`, `interimResults = true`, `continuous = false`, `maxAlternatives = 1`;
  `onresult` → interim captions and the final transcript; `onerror`: `not-allowed` → `voice.noMic`,
  `language-not-supported` / `service-not-allowed` / `network` → typed mode with a message,
  `no-speech` → back to idle; `onend` → state. Push-to-talk: press to start, press again to stop;
  holding also works (V15). Recognition itself is cloud-based (Google in Chrome, Microsoft in Edge).
- **LLM:** the shared turn pipeline (`history.slice(-8)`, generation counter, `AbortController`,
  grounding from `lookup()`), backend per §5.4.
- **TTS** (`tts/speechSynthesis.js`): voices from `speechSynthesis.getVoices()` refreshed on
  `voiceschanged`; selection by `lang` prefix (`ka`, `en`) with a preferred-name list first
  (`VITE_IO_VOICE_NAME`, default `Microsoft Giorgi Online (Natural)`, then `Microsoft Eka Online (Natural)`,
  then any `ka` voice); English: a "Microsoft … Online (Natural)" `en` voice, else any `en` voice.
  One `SpeechSynthesisUtterance` per sentence (emoji, markdown and audio tags stripped; `rate` and
  `pitch` from config), queued in order so the first sentence starts while the reply is still
  streaming; `onboundary` word events → the mouth pulse (§5.2); no boundary within 400 ms → sine
  mouth; `onend` of the last sentence → `idle` with the ring label `voice.pushToTalk` (recognition
  ends by itself at end of speech because `continuous = false`; a second press only stops early);
  `speechSynthesis.cancel()` on interruption, on `end()` and on `pagehide`; errors `interrupted` /
  `canceled` ignored. Chrome's ≈ 15 s cut-off is avoided by the sentence chunks; the entry handler
  also calls `speechSynthesis.speak(new SpeechSynthesisUtterance(''))` synchronously next to
  `AudioContext.resume()`, so iOS Safari's user-gesture rule is satisfied before any `await`.
- **Captions:** the learner's interim and final transcripts and IO's text (per sentence, as spoken)
  in the transcript panel; `aria-live` on completed sentences.
- **Interrupt:** `cancel()` + abort the chat stream + clear the sentence queue; the last IO turn is
  marked interrupted; the next press starts a new recognition.
- **Limits of this path (stated in the demo run sheet):** no barge-in by voice (the recogniser is
  not open while IO speaks); no amplitude mouth (word pulses instead); Georgian voice only where the
  browser has one (Edge).

### 5.6 `TurnVoiceSession` (D3 with the direct transport; P2 with the Worker)

The brief's turn session: STT → chat (streamed) → TTS per sentence. Track D wires it with
`stt/webSpeech.js`, `llm/geminiDirect.js` and `tts/geminiDirect.js` (`streamGenerateContent` on
`gemini-3.1-flash-tts-preview`, audio chunks → `audio/player.js` → the amplitude mouth). Tool loop:
history items may be `{ role: 'model', parts: [{ functionCall }] }` / `{ role: 'user', parts: [{ functionResponse }] }`;
a function-call part ends the sentence stream, the handler runs, and a second chat call continues;
`set_mood` / `show_card` do not pause TTS. Sentence split on `. ! ? …`; time-to-first-audio printed
in the dev console (the brief's ≤ 3 s target). Interrupt = abort fetches + `player.flush()`, keeping
the transcript. Track P swaps in `llm/workerProxy.js`, `tts/worker.js` and, for Safari/Firefox,
`stt/upload.js` (WAV from the mic worklet, V7).

### 5.7 `LiveVoiceSession` (D4 with the dev key; P2 with tokens)

`getLiveAuth()` → `new GoogleGenAI({ apiKey, httpOptions: { apiVersion } })` →
`ai.live.connect({ model, config, callbacks })` wrapped in a 10 s timeout. In Track D `config` carries
everything (`responseModalities: ['AUDIO']`, `systemInstruction` from `tutor/persona.js`, `tools`,
`speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName`, `inputAudioTranscription: { languageCodes }`,
`outputAudioTranscription: {}`, `realtimeInputConfig` with automatic VAD and `turnCoverage`,
`contextWindowCompression`, `sessionResumption`, `temperature`); in Track P the token locks the same
fields and the client's config adds only `sessionResumption`. `connect()` resolving means setup is
complete → `sendClientContent` with the hidden `session_started { lang, page: 'welcome', learner }`
turn. Then, per §2.3: mic chunks → `sendRealtimeInput({ audio })`; typed questions →
`sendRealtimeInput({ text })`; audio parts → player; `interrupted` → flush; transcriptions →
captions; `toolCall` → handlers → `sendToolResponse` immediately; `toolCallCancellation` → cancel;
`sessionResumptionUpdate` → store the handle; `goAway` or an unexpected `onclose` → reconnect with
the handle (both tracks; in Track P only before `expireTime`, which is never extended); `thinking`
timeout (proactive audio);
90 s of silence → a nudge asking IO to say goodbye and call `end_session`; tab hidden > 30 s →
`audioStreamEnd: true` and a visible paused state; a provisional session record on `pagehide`. Tool
behaviours: `set_mood`, `show_card`, `record_skill` NON_BLOCKING + `SILENT`; `lookup_course_material`
BLOCKING; `ask_quiz` NON_BLOCKING with `willContinue`, the learner's answer as a second response with
`INTERRUPT`; `navigate_to_path`, `end_session` BLOCKING. Failure paths → typed KA/EN messages; after
one failed retry the dock falls back to `browser`. Headphones for testing (self-interruption through
speakers; `echoCancellation: true` is on).

### 5.8 Tutor brain (D5)

- `persona.js`: the brief's identity, spoken style (≤ 2 sentences / ~35 words, no lists, markdown or
  emoji, Georgian names, small numbers as words), Socratic rules with the KA/EN example exchange,
  scope and refusal, platform facts **imported** from `HINTS.basicCourse/kidsPlatform/certificate/login/aboutDga/language/pickPath[i][lang]`,
  `UI[lang].basic.url`, `.kids.url`, `.kids.chips[0]` ("10 missions" lives only there) and
  `UI.loginUrl`; for Basic Course specifics IO says what the course covers and points to it (A6); the
  safety block (never ask for personal data; bullying / blackmail / strangers → calm, not their fault,
  tell a trusted adult now, **read the resources from `safety.js[lang]`** — while that file still
  holds placeholders IO does not read it and says only to tell a trusted adult now; never role-play;
  refuse hacking and pivot to defence); memory etiquette; "offer practice on the two weakest skills
  first".
  **No telephone number, hotline or organisation name is typed into `persona.js`**; `check-voice.mjs`
  fails on three or more consecutive digits there. (112 is already published in the CyberHero
  missions; the DGA team may enter it in `safety.js`.) Two-factor is „ორმაგი ავთენტიფიკაცია“.
- `skills.js` (13, Q6 for a 14th): `passwords`, `two_factor`, `phishing`, `scams`,
  `social_engineering`, `privacy_settings`, `cyberbullying`, `safe_browsing`, `device_security`,
  `backups`, `disinformation`, `ai_threats`, `incident_reporting`, each
  `{ id, ka, en, courseRef: { basic: [section ids], mission: [g-ids], guide?: [a-ids] } }`; the
  `basic` references are section numbers only (no course text). Mastery 0–3.
- `memory.js`: the brief's schema; ≤ 10 sessions; `summarise()` ≤ 300 chars listing the two
  lowest-mastery skills; `forget()` wired to *Delete my data*, leaves `io.lang` untouched; first
  name only if volunteered; every `localStorage` access in try/catch with an in-memory fallback.
- `tools.js`: the seven declarations **exactly as the brief's Phase 5** (`set_mood`, `show_card`,
  `ask_quiz`, `record_skill`, `lookup_course_material`, `navigate_to_path`, `end_session`); handlers
  browser-side; on the Ollama backend the text-tag convention of §5.4. A quiz answered by click goes
  back as a tool response with the option index; answered by voice it is graded by the model from
  the transcript and the card is updated from the next `record_skill` call.
- `docs/io-voice-test-script.md`: the 6-turn KA/EN script from the brief's Phase 5 acceptance, plus
  the off-topic and "hack my friend" refusals.

### 5.9 Track P — the Worker (P1, deferred)

- `wrangler.jsonc`: `vars` for `GEMINI_API_VERSION`, `LIVE_MODEL`, `LIVE_MODEL_FALLBACK`,
  `CHAT_MODEL`, `TTS_MODEL`, `STT_MODEL`, `VOICE_NAME`, `ALLOWED_ORIGINS`, `SESSION_MINUTES` (10),
  `MAX_CONCURRENT_PER_IP` (3), `MAX_SESSIONS_PER_IP_PER_DAY` (300), `DAILY_MINUTES_BUDGET`;
  `ratelimits` bindings for bursts (`RL_TOKEN` 30/60 s so a class can start together, `RL_CHAT`
  30/60 s, `RL_TTS` 60/60 s, `RL_STT` 30/60 s); one KV namespace `IO_RL`. Secrets: `GEMINI_API_KEY`,
  `TURNSTILE_SECRET` (optional).
- **A5 limits, all applied at `/token` (three KV key writes per session start):**
  `sess:<ip>:<day>` counts session starts (cap 300, expires at midnight + 120 s);
  `live:<ip>` holds up to 3 start timestamps within the last 10 min (approximate concurrency; a
  Durable Object if exactness matters); the global budget lives in a Durable Object (exact, and no
  write-rate limit — KV's one write per key per second would reject a class starting together) or,
  without one, in ten sharded `budget:<day>:<0-9>` keys summed on read; it starts at
  `DAILY_MINUTES_BUDGET` and loses `SESSION_MINUTES` per mint — when it reaches 0, `/token` answers 503
  `budget_exhausted` and the dock switches to **text-only mode** (`BrowserVoiceSession` with typed
  input and browser voices, `voice.textOnly`). Sessions end at `expireTime` (10 min, V3); the dock
  says so and offers a new session.
- Order per request: `Origin` allowlist (403 before any budget is spent) → `OPTIONS` 204 → burst
  limit → the A5 counters → route. Errors are JSON `{ error: { code, ka, en } }` with the text
  imported from `src/i18n/ui.js` at build time. `Cache-Control: no-store`; `observability.enabled:
  false`; no body logging; the IP is kept in KV keys for one day and nowhere else.
- `/token`: body `{ lang, page }` (the learner summary travels only in the hidden `session_started`
  turn, browser → Google); mints as in §2.2 with the locked setup from the bundled tutor modules;
  returns `{ token, expiresAt, model, apiVersion, voice }`.
- `/chat` (V20): body `{ lang, learner, history[≤ 8], grounding[≤ 3] }`; the Worker builds the Gemini
  request (persona with the learner summary, tools, `generationConfig { temperature: 0.6, maxOutputTokens: 400 }`,
  explicit `safetySettings`), calls `models/<CHAT_MODEL>:streamGenerateContent?alt=sse` with
  `x-goog-api-key`, returns `upstream.body` untouched as `text/event-stream` (V5); the 30 s abort
  covers connect + headers only.
- `/tts`: `{ text, lang, voice }` → Gemini TTS stream → PCM16 24 kHz; emoji, markdown and audio tags
  stripped first. `/stt`: WAV (≤ 60 s, ≤ 2 MB) + `lang` → Flash inline audio → `{ text }`.
- `scripts/voice-smoke.mjs --worker <base>` covers the routes, 403 on a bad origin, 429/503 with KA/EN
  bodies, the token mint on both API versions, the `fieldMask` sub-path question and a reconnect
  after 60 s with a handle.

### 5.10 README and privacy text (D6; Track P text drafted, marked "not deployed")

**Demo build (Track D):** how talk mode starts (the button, `T`, typed input once the dock opens);
supported browsers (Edge recommended for Georgian voices; Chrome; typed mode elsewhere); **what is
sent where** — the microphone audio goes to the browser's speech service (Google's servers in
Chrome, Microsoft's in Edge); the text of the conversation, the last eight turns and a ≤ 300-character
learner summary go from the browser to Google's Gemini API with the presenter's key (on the free tier
Google may use the content to improve its products — the exact terms are re-read before the
presentation, §2.10 — so **test content only, no personal data**) or to a local model on the
presenter's machine; browser voices may send the text to Microsoft (Edge's online voices); on the
Live path the audio itself goes to Google; **what is stored** — IO keeps no recordings; the
transcript and the learner profile stay in the browser (`localStorage['io.learner.v1']`); a pasted
key stays in `localStorage['io.gemini.key']` until *Forget key*; **how to delete it** (*Delete my
data*); keyboard shortcuts; the embed snippet with `allow="microphone; autoplay"` and 520 px.
**Privacy paragraph (demo):** still no cookies and no analytics; fonts still bundled; in talk mode
only, the page talks to the browser's speech service and to Google's Gemini API (or a local model).
**Production (Track P, not deployed):** the earlier text — the Worker mints one-use tokens, keeps no
bodies and the visitor's IP for one day of rate limiting, Google processes audio and text under the
paid tier's terms — plus the A5 limits and the cost of a conversation (§10).

### 5.11 Configuration

```
# .env.example — copy to .env.local. Every VITE_ value is public (inlined into the bundle).
IO_GEMINI_KEY=                       # dev only, NO VITE_ prefix: injected into `npm run dev` by vite.config.js, never into a build
VITE_IO_VOICE_DEFAULT=browser        # browser | live | turn, or per language: ka=browser,en=live (set after Gate G1)
VITE_IO_LIVE_OK=0                    # 1 after the smoke test shows Live quota on the key
VITE_IO_LLM=gemini                   # gemini | openai   (openai = a local OpenAI-compatible endpoint)
VITE_IO_LLM_BASE=http://localhost:11434/v1
VITE_IO_LLM_MODEL=gemma3
VITE_IO_CHAT_MODEL=gemini-3.8-flash  # or the Flash model the smoke test shows has a usable free quota
VITE_IO_LIVE_MODEL=gemini-3.8-live
VITE_IO_TTS_MODEL=gemini-3.1-flash-tts-preview
VITE_IO_VOICE_NAME=Microsoft Giorgi Online (Natural)   # speechSynthesis preference (browser session)
VITE_IO_GEMINI_VOICE=Charon          # Gemini voice (turn, live, bake-off) — set after Gate G1
VITE_IO_SAFETY_REQUIRED=0            # Track P's workflow sets 1 (build fails while safety.js has placeholders); the demo builds with 0
# Track P adds: VITE_IO_API_BASE=https://io-voice.<account>.workers.dev  (the Worker then supplies models and voice)
```

---

## 6. Georgian strings and the bake-off lines

Rules every new UI string follows (from `hints.js` and `check-hints.mjs`): თქვენ register, ≤ 110
characters per language, no emoji in UI strings, spaced em dash " — " (never " - "), ranges with a
hyphen (`13-18`), Georgian quotes „…“ (U+201E / U+201C), ellipsis as `…` never `...`, no Latin letters
in Georgian beyond the allow-listed brand words (the list gains `Google`, `Microsoft`, `Gemini`, `Esc`,
`Chrome`, `Edge` where a string needs them — B13), no cyber tips in host-mode strings. IO's spoken answers
(≤ 2 sentences, ≈ 35 words) are exempt from the 110-character limit and scroll in the transcript.
All strings get one native review before D6 (Q5).

### 6.1 The `voice.*` strings

| Key | Georgian | English | Note |
|---|---|---|---|
| `voice.talk` | `ესაუბრეთ იოს` | Talk to IO | the entry button (A8) |
| `voice.typeInstead` | `დაწერეთ კითხვა` | Type a question | the entry button when speech is unavailable (A8); also the input placeholder |
| `voice.connecting` | `კავშირი მყარდება…` | Connecting… | |
| `voice.listening` | `იო გისმენთ…` | IO is listening… | the `aria` state label omits the ellipsis |
| `voice.thinking` | `იო ფიქრობს…` | IO is thinking… | |
| `voice.speaking` | `იო საუბრობს` | IO is speaking | |
| `voice.micOn` | `მიკროფონი ჩართულია` | Microphone on | the mic-open indicator |
| `voice.mute` / `voice.unmute` | `მიკროფონის გამორთვა` / `მიკროფონის ჩართვა` | Mute / Unmute | |
| `voice.pushToTalk` | `დააწკაპუნეთ და ისაუბრეთ` | Click and speak | V15 |
| `voice.end` | `საუბრის დასრულება` | End the conversation | |
| `voice.deleteData` | `ჩემი მონაცემების წაშლა` | Delete my data | nominal, like the page's buttons (B9) |
| `voice.deleteConfirm` | `წავშალოთ იოს მეხსიერება თქვენს შესახებ?` | Delete what IO remembers about you? | |
| `voice.noMic` | `მიკროფონზე წვდომა არ არის. შეგიძლიათ კითხვა დაწეროთ.` | No microphone access. You can type your question instead. | |
| `voice.privacy` | `იო ხმის ჩანაწერებს არ ინახავს — ხმას Google ან Microsoft ამუშავებს.` | IO keeps no recordings — your voice is processed by Google or Microsoft. | changed after A3 (Edge → Microsoft) — re-review; the brief's line was silent about who processes the voice |
| `voice.privacyText` | `საუბრის ტექსტი მხოლოდ თქვენს ბრაუზერში ინახება.` | The chat text is stored only in your browser. | split from the earlier single line — re-review |
| `voice.errSocket` | `ხმოვანი კავშირი ვერ დამყარდა. შეგიძლიათ კითხვა დაწეროთ.` | Voice connection failed. You can type your question instead. | |
| `voice.errRateLimit` | `დღეისთვის საუბრის ლიმიტი ამოიწურა. ხვალ ისევ შევხვდებით.` | Today's conversation limit is used up. See you again tomorrow. | Track D: only when a 429 names a daily quota (per-minute 429s wait `retryDelay` and retry); Track P: the Worker's 429 |
| `voice.textOnly` | `ხმოვანი რეჟიმი დღეს ამოწურულია — შეგიძლიათ კითხვა დაწეროთ.` | Voice mode is used up for today — you can type your question. | Track P budget exhausted |
| `voice.keyLabel` / `voice.keyForget` | `Gemini-ის გასაღები (რჩება მხოლოდ ამ ბრაუზერში)` / `გასაღების დავიწყება` | Gemini key (stays only in this browser) / Forget key | the runtime-key field (A2) |
| `voice.errOrigin`, `voice.errTimeout`, `voice.errSafety`, `voice.errEmpty` | drafted in D2 (rewritten from the chat branch in თქვენ) | | |
| `voice.ioLabelTalk` | `იო, თქვენი გზამკვლევი — დააწკაპუნეთ, რომ საუბარი შეაჩეროთ` | IO, your guide — press to interrupt him | state-neutral |
| `voice.ioHintTalk` | `ესაუბრეთ იოს ან დაწერეთ კითხვა` | Speak to IO or type a question | replaces the "click IO" hint in talk mode |

The Phase 5 example lines in the brief are grammatically sound and in register. The memory example
becomes a complete, idiomatic sentence in the persona:
„წინა ჯერზე ფიშინგზე ვისაუბრეთ — იქიდანვე გავაგრძელოთ?“
The scripted talk-mode lines (spoken greeting on entering talk mode, the 90 s goodbye, the
mic-denied line) live in `src/voice/tutor/strings.js` and are linted by the same rules (B10).

### 6.2 The bake-off (D1; A7)

Six lines, exact `hints.js` text (emoji stripped before synthesis):

| # | Key | Georgian | Sounds exercised |
|---|---|---|---|
| 1 | `greeting[0]` | მე იო ვარ, თქვენი გზამკვლევი კიბერუსაფრთხოების სამყაროში. კეთილი იყოს თქვენი მობრძანება! | ქ ×2, ყ ×2, -რთხ-, -ბრძ- |
| 2 | `basicCourse[3]` | კურსის ბოლოს 100-კითხვიანი ტესტია. 70 სწორი პასუხი — და სერტიფიკატი თქვენია. სამი ცდა გაქვთ. | წ, ქ ×2, numerals, em-dash pause |
| 3 | `kidsPlatform[3]` | კიბერგმირზე მეც ვცხოვრობ — მისიებში ბავშვებს გვერდით ვუდგავარ. ბოლოს კი ამოსაბეჭდი სერტიფიკატია. | ჭ, ვცხ-, -ვშვ- |
| 4 | `certificate[0]` | საბაზისო კურსის სერტიფიკატს ტესტში 100-დან 70 სწორი პასუხით მიიღებთ. სამი ცდა გაქვთ — ნუ იჩქარებთ. | წ, ღ, ქ ×2, `100-დან` |
| 5 | `encouragement[3]` | აქ არასწორი არჩევანი არ არსებობს — ორივე გზა კარგ ადგილას მიგიყვანთ. | ქ, წ, ყ |
| 6 | `farewell[0]` | მალე შევხვდებით! რობოტს არც სახე ავიწყდება, არც სტუმარი. 👋 | წ, ყ, -ვხვდ-; tests the emoji strip |

A seventh line, `evening[0]`, adds ღ ×2 if the sheet allows it:
„საღამო მშვიდობისა! დღე იწურება, სწავლისთვის კი არასდროსაა გვიან. მე აქ ვარ.“
`(DGA)` in `aboutDga[0]` is removed before synthesis (the Georgian name precedes it); a bare `DGA`
in IO's own output is expanded to the agency's Georgian name, „ციფრული მმართველობის სააგენტო“.

**Candidates and how each is produced:**

1. **Edge `speechSynthesis`** — Giorgi and Eka (and any other `ka` voice the machine has): the
   dev-only page `?bakeoff=1` (`src/voice/dev/BakeoffPanel.jsx`, localhost only) lists the voices,
   speaks the six lines per voice with a *replay* button, and logs the boundary-event rate and any
   errors. Browser voices cannot be captured to a file from JavaScript, so the team rates them live
   (or records the laptop's output with the OS recorder).
2. **Gemini TTS** (if the key works) — 4–5 male-coded voices first: Charon, Puck, Orus, Achird,
   Iapetus (Umbriel, Fenrir as extras): `scripts/voice-bakeoff.mjs` (Node, `IO_GEMINI_KEY` from
   `.env.local`) synthesises each line twice — with the language named in the prompt and without
   (V17) — and writes `bakeoff/gemini-<voice>-<n>[-hint].wav`, 24 kHz 16-bit mono.
3. **The Live model's own voice** — the same script opens a short Live session per candidate voice
   with `@google/genai` in Node, sends "read this line verbatim" as a text turn, captures the audio
   to `bakeoff/live-<voice>-<n>.wav` and checks the output transcription matched the line. This
   decides G1(c) and G1(d): is there Live quota on the key, and is Georgian barge-in good enough.

`bakeoff/README.md` has one row per voice and line with columns naturalness, pronunciation of
ქ/ყ/წ/ჭ/ღ, pace, warmth (1–5 each) and comments, and a **Decision** block: G1(a) the browser voice,
G1(b) the Gemini voice (if any), G1(c) "the key has Live quota: yes / no", G1(d) "Live's Georgian is
good enough for the Georgian default: yes / no" → `VITE_IO_VOICE_DEFAULT` (per language, e.g.
`ka=browser,en=live` when G1(d) is no), `VITE_IO_VOICE_NAME`, `VITE_IO_GEMINI_VOICE`, `VITE_IO_LIVE_OK`.
Azure and ElevenLabs are skipped (A7).

### 6.3 What the checks add (D1 scaffold, complete in D6)

`scripts/lib/lint.mjs` holds the regexes moved out of `check-hints.mjs` (behaviour identical).
`check-voice.mjs`: walks `UI.ka`/`UI.en` and `src/voice/i18n.js` for key and array-length parity (absent today); applies the
110-character limit and the Latin rule to `voice.*` and `tutor/strings.js` only; scopes `TIP_WORDS`
to `HINTS`; skips the emoji rule over the synonym map (its `↔` arrows match the emoji class);
forbids `...`; checks `safety.js` placeholders (fail when `VITE_IO_SAFETY_REQUIRED=1`), `persona.js`
for digits, tool declarations against a JSON-schema subset, quiz skill ids, and a handful of retrieval
queries. `check-dist.mjs` (`postbuild`): key patterns in `dist/`, a Basic Course sentence, the
initial-chunk size against §9, and that the voice chunk is a separate file not referenced by
`index.html`. New checks are **errors**. Everything they import stays plain ESM with no JSX and no
`import.meta.env` at module scope.

---

## 7. Phases, acceptance, gates

Each phase ends with a commit on `io-voice`, a report of what was built and what is uncertain, and a
wait for the go-ahead (brief §4). Mapping to the brief: its Phase 1 (Worker) becomes P1 plus the
scripts in D1; Phase 2 = D2; Phase 3 = D4; Phase 4 = D3 (+ the direct `turn`); Phase 5 = D5;
Phase 6 = D6 (+ P3 for the Moodle embed).

### 7.1 Track D

| Phase | Builds | Acceptance | Gate |
|---|---|---|---|
| D1 | `.env.example`, `.gitignore`, `vite.config.js` dev-key injection, `scripts/lib/lint.mjs`, `check-voice.mjs` scaffold, `check-dist.mjs`, `llm/geminiSse.js` + `llm/geminiDirect.js` + `llm/openaiCompatible.js` + `auth/devKey.js`, `tts/speechSynthesis.js` (voice selection and boundary logging; the mouth pulse follows in D2), the `?bakeoff=1` route, `scripts/voice-smoke.mjs`, `scripts/voice-bakeoff.mjs`, the `?bakeoff=1` page, `bakeoff/README.md`, `voice-ci.yml` | `npm run check` green; a production build contains no key even with a key in `.env.local`; `npm run smoke:voice` with the team's key prints, per candidate model, whether `generateContent`, `streamGenerateContent`, TTS and a Live connect succeed and the quota text of any 429; `npm run bakeoff` writes the WAVs when the key works; `?bakeoff=1` speaks the six lines in Edge with Giorgi and Eka and logs boundary events | **G1 (human):** browser voice, Gemini voice, Live quota, Live's Georgian → the defaults in `.env.local` |
| D2 | mic, worklet, player, `mouthLevel` / `listening` / `tapReaction`, `eyesWide`, IoHost talk mode, the static button + `T` + AudioContext unlock, `VoiceDock` (with the runtime-key field), `TranscriptPanel`, `voice.css`, `useIoVoice`, the boundary mouth in `tts/speechSynthesis.js`, `StubVoiceSession`, `voice.*` strings | with `?voice=stub` the mouth follows a local WAV; with a browser voice the mouth pulses per word (Edge) or the sine plays (no boundary events); the ring follows the mic; click/Esc cut audio instantly; reduced motion OK; host click cycle untouched; `global.css` diff is the button block only; before/after screenshots of host mode on both skins | go-ahead |
| D3 | `BrowserVoiceSession` end-to-end (Web Speech → Gemini or Ollama → browser voices), typed mode, `TurnVoiceSession` with the direct transport (Gemini TTS through the player) when the key works | in Edge and Chrome a Georgian question gets a Georgian spoken answer with captions; push-to-talk; typed mode in Firefox; Safari: English by voice if `webkitSpeechRecognition` accepts `en-US`, Georgian typed; `?voice=turn` plays real audio with the amplitude mouth; first audio ≤ 3 s measured and printed; the dev badge shows the active session | go-ahead |
| D4 | `LiveVoiceSession` with the dev key (localhost, dev builds only), `session_started`, resumption, idle/hidden handling, failure paths → fallback to `browser` | brief Phase 3 acceptance: fresh load → Talk → wave + Georgian greeting; KA question → KA spoken answer with captions; barge-in ≤ 300 ms; EN session; returning-learner greeting — **conditional on G1(c) (quota) only**; when G1(d) is no, Live is still built and the default becomes `ka=browser,en=live` | go-ahead |
| D5 | persona, skills, memory, tools, board cards, quiz, diagrams, `safety.js`, `build-io-index.mjs` (CyberHero only), test script | 6-turn script passes on `browser` (and on `live` if wired); reload greeting; delete resets; off-topic and "hack my friend" refused; a Basic Course question is answered from `hints.js` facts and routed, not quoted | go-ahead |
| D6 | accessibility and mobile passes (Android Chrome: Web Speech works; iOS Safari: typed + voices), embed in a local test iframe with `allow="microphone; autoplay"`, `check-dist.mjs` complete, demo README + privacy text, `docs/io-voice-demo.md` (run sheet: what to click, what to say, what to do if the network or the free tier fails), latency numbers | definition of done for the demo; the run sheet rehearsed once end-to-end on the presenter's machine | demo |

### 7.2 Track P (deferred; starts when billing exists)

| Phase | Builds | Acceptance |
|---|---|---|
| P1 | `worker/` (§5.9) with the A5 limits and the global budget, `worker/README.md`, the Worker part of the smoke script, Cloudflare account on the personal plan (A4) | `wrangler dev` serves the routes; 403 on a bad origin; 429/503 with KA/EN bodies; token mint on both API versions; the `fieldMask` and reconnect questions answered |
| P2 | `auth/workerToken.js`, `llm/workerProxy.js`, `tts/worker.js`, `stt/upload.js`, text-only mode on budget exhaustion, `VITE_IO_API_BASE` in the workflow | the same conversations run with no key in the browser; sessions end at 10 min; the dock switches to text-only when the budget is exhausted |
| P3 | Moodle embed with the admins (Q8), deployment on the agency account, production README and privacy text, `VITE_IO_SAFETY_REQUIRED=1` in the Pages workflow | brief's definition of done on the live page |

### 7.3 Status

- **D1 — built and verified without a key (2026-09-19).** Everything in the D1 row, plus
  `scripts/lib/{env,wav,liveNode}.mjs` (dotenv reading and key masking, WAV writing, a Live session
  with a connect timeout and a message queue), `src/voice/dev/bakeoffLines.js` (the seven lines,
  shared by the page and the script), six unit-test files under `test/` (`npm test`, 34 tests) and
  `deploy.yml`'s `VITE_IO_VOICE_DEFAULT` env. Verified in this session: `npm run check` prints exactly
  what it printed before the lint refactor; `npm test`; a production build with a fake
  `IO_GEMINI_KEY` in `.env.local` leaves no key and no bake-off chunk in `dist/`, `check:dist`
  passes, and the initial chunk is byte-identical to the untouched branch's build (§9); `npm ci`
  from the committed lockfile, then build and tests again; the dev server exposes the defines as
  globals through `/@vite/env` (§5.4) and `devKey()` sees the key on localhost; headless Chromium
  renders the host page, `?embed=1` and `?bakeoff=1` without console errors (the bake-off page shows
  its "no Georgian voice" state — headless Linux has no voices). With a bogus key: `smoke:voice`
  reports `BAD_KEY` and exits 1, `bakeoff` exits 1, and `bakeoff --only-live` shows the SDK's
  `connect()` never settling (close 1007) with the timeout reporting the reason (§2.4).
- **Not verified — Gate G1 needs the team's key and a Windows machine with Edge:** the smoke test
  against real quota (which Flash model has a usable free tier, whether the key has Live quota), the
  Gemini and Live WAVs, Giorgi's and Eka's Georgian and whether they raise word-boundary events. The
  bake-off page's own UI is English (a dev tool, never built); the `voice.*` strings arrive in D2.
- **D2 — built and verified in headless Chromium (2026-09-19).** The three mascot files gained their
  additive props (`mouthLevel` / `listening` / `tapReaction`, `eyesWide`, `mode` + `talk`); App got
  the entry button, the `T` key, the in-gesture unlocks and the lazy layer; `src/voice/` gained the
  audio primitives (`mic.js` + worklet, `player.js`, `pcm.js`), the session interface, `select.js`,
  the stub harness, the store, the transcript model, `useIoVoice`, `IoVoice`, `VoiceDock`,
  `TranscriptPanel`, `voice.css`, the `voice.*` strings and `tutor/strings.js`; 19 more unit tests;
  two acceptance scripts under `scripts/e2e/` (`playwright-core` devDependency, no browser in CI).
  Measured with the stub on the dev server: the amplitude mouth moves between ≈ 0.1 and ≈ 0.75 while
  IO speaks, the word-pulse path between 0.05 and ≈ 0.9, the sine path sets `talking`; Esc reaches
  `interrupted` in ≈ 1 ms and a click on IO in ≈ 8 ms (in-page timing), both with the level cleared;
  the ring follows the fake microphone; typed questions, mute, *Delete my data*, *End* (host line
  resumes, click cycle intact), reduced motion (still face, caption at once, no gesture), embeds
  (button only with `?voice`) and the ≤ 900 px sheet (one live region) all pass with no console
  error. Host mode: pixel diff of both skins against the untouched build under reduced motion shows
  differences only inside the Talk button's box, the hint unmoved; the initial JS chunk grew by
  ≈ 2.1 KB gzipped, the CSS by 48 B. Two fixes found by the acceptance run: a fresh `page` object per
  App render restarted the session in a loop (now memoised and read through a ref), and the worklet
  file had to be excluded from Vite's asset inlining. Without a key the default selection reports
  „ხმოვანი რეჟიმი ამ ბრაუზერში მიუწვდომელია“ with the key field, because `browser` / `turn` arrive
  in D3.
- **Not verified in D2:** a real microphone and a real browser voice (headless Chromium has a fake
  device and no voices) — the pulse/sine paths ran on synthetic boundary events; Edge on the
  presenter's machine confirms them in D3 with `BrowserVoiceSession`.
- **D3 — built and verified against a mocked Gemini API (2026-09-19).** `stt/webSpeech.js` (the
  recogniser: interim captions, one utterance per press, the error map of §5.5), `tutor/persona.js`
  (the D3 system instruction with the platform facts imported from `hints.js` / `ui.js`),
  `session/pipeline.js` (the ported turn pipeline: rolling window, generation counter, abort with
  the partial answer kept, explicit safety settings, one retry on a per-minute 429, Gemini or the
  local backend), the browser-voice sentence queue in `tts/speechSynthesis.js` (pulse within 400 ms
  of `onstart`, else sine), `tts/geminiDirect.js` (per-sentence Gemini TTS into the player, the next
  sentence prefetched, time to first audio printed in the dev console), `session/pushToTalk.js`
  (the shared session) with `BrowserVoiceSession` and `TurnVoiceSession` on top, the key field that
  also forgets a stored key, four new strings, 24 more unit tests (77 in all). Verified in
  headless Chromium with the chat and TTS endpoints intercepted: with a pasted key the browser
  session is selected (badge „browser · gemini“), the scripted greeting is captioned, a typed
  Georgian question streams back as captions with the sine mouth (no voice in headless), the key
  travels in a header and never in a URL, the recogniser starts on `T`; the turn session plays the
  mocked TTS through the player with the amplitude mouth for the greeting and for both answer
  sentences (one TTS request per sentence) and returns to idle; pasting a key on the plain page
  starts the browser session and *Forget key* clears it; no console error; `check`, `test`, `build`
  and the dist scan pass (initial chunk +9 B).
- **Not verified in D3 — needs the team's key and the presentation machine:** a Georgian question
  answered by voice in Edge (Giorgi / Eka) and in Chrome, real word-boundary events, the first-audio
  figure on a real connection (the target is ≤ 3 s), Safari's `en-US` recognition, and the answers'
  Georgian quality (Q5). Gate G1 still decides the defaults.
- **D4 — built and verified against a mocked Live server (2026-09-19).**
  `session/LiveVoiceSession.js`: the SDK's `live.connect` (loaded on demand, its own 72 KB gzipped
  chunk) with the §2.3 config (audio out, the chosen voice, the persona with the Live event rules,
  input transcription with the `ka` hint, output transcription, automatic VAD with
  `TURN_INCLUDES_ONLY_ACTIVITY`, sliding-window compression, resumption) behind a 10 s connect
  timeout; the microphone's 16 kHz chunks as `sendRealtimeInput` audio; audio parts through the
  player (the amplitude mouth); transcriptions as captions; the hidden `session_started` turn; server
  `interrupted` → flush; a click or Esc → flush and discard until `turnComplete`; typed questions as
  realtime text; the ring mutes and unmutes (`audioStreamEnd` on mute); 90 s of silence → a
  `session_idle` event, goodbye, end; a tab hidden 30 s pauses the microphone; `goAway` or a dropped
  socket → reconnect with the handle (twice at most), then a fatal error that names `browser` as the
  fallback, which `useIoVoice` performs once and explains (`voice.fellBack`). `select.js` registers
  `live` (dev key + `VITE_IO_LIVE_OK=1`). Nine unit tests with a fake connector (86 in all). In
  headless Chromium with the socket mocked by Playwright (a fake dev key on the dev server): the
  badge says „live · dev key“, the greeting plays with the amplitude mouth and is captioned in
  full, microphone chunks reach the server, `goAway` reconnects with the handle and audio keeps
  flowing on the second socket, a typed question is answered, Esc interrupts and the turn's rest is
  discarded, the ring mutes, End returns to host mode; no console error. Two dev-server findings
  fixed: the SDK must be pre-bundled (V28), and a socket's late `close` event must not be mistaken
  for a drop of its successor (callbacks are bound to their socket).
- **Not verified in D4 — needs the team's key with Live quota (G1(c)):** the real service's
  Georgian, barge-in latency (the ≤ 300 ms target), proactive audio's behaviour on the hidden
  events, whether a manual flush without a server message leaves the model mid-turn (B7), and the
  reconnect against a real `goAway`. `npm run smoke:voice` and `npm run bakeoff -- --only-live`
  are the first checks; `?voice=live` on `npm run dev` with the key in `.env.local` is the second.
- **Deferred:** `build:index` (D5); Track P entirely.

---

## 8. Non-negotiables → where each is enforced

| Rule | Track D (demo) | Track P (production) |
|---|---|---|
| No API keys in the client bundle | the dev key is injected into `npm run dev` only (`vite.config.js`, V13); `check:dist` scans every build; a preview uses a key pasted at runtime (A2) — the key is in the presenter's browser, never in a file that ships | keys only in `wrangler secret`; ephemeral tokens single-use, 10 min, locked |
| IO's look unchanged | `RobotModel.jsx` diff limited to the three props; `faceTexture.js` identical at `eyesWide = 0`; one static button (V11); before/after screenshots | same |
| Every existing behaviour kept | host-mode code paths untouched (§4.1); `npm run check` kept and extended; query params unchanged; embeds without `?voice=1` unchanged; talk mode works on the WebGL fallback | same |
| Georgian first | `initialLang()` untouched; every new string KA + EN; `check-voice.mjs` applies the `hints.js` rules | same |
| Privacy | no recordings stored; transcript + profile in `localStorage` only, *Delete my data* → `forget()`; mic only from a click; the mic-open indicator; the README names the browser speech services and Gemini's free-tier terms; test content only | the Worker keeps no bodies, the IP for one day; paid-tier terms; the README says what goes to Google |
| Performance | `src/voice/**`, `@google/genai`, worklet and `voice.css` behind one `import()`; the initial chunk grows by the entry button, the `T` listener, the AudioContext helper, the two entry strings and the additive branches in `IoHost`, `RobotModel` and `faceTexture`; `check-dist.mjs` enforces the §9 budget | same |
| Accessibility | real `<button>` with state label; own `aria-live="polite"` transcript; `T` / `Esc`; reduced motion → still face, captions only; AA pairs in §5.3 | same |
| Embed mode | `?embed=1&voice=1` in a local test iframe; README documents `allow="microphone; autoplay"` and 520 px | the Moodle page (P3) |
| `src/voice/` self-contained | no imports from `App.jsx` or `worker/`; only `../content/hints.js`, `../content/safety.js`, `../i18n/ui.js` and props | the Worker imports from `src/voice`, not the reverse |

---

## 9. Baseline (measured 2026-09-19 on `IO-for-main-page` `dc8a296`)

Measured in this session with `npm ci && npm run check && npm run build` (Node 22.22.2, npm 10.9.7,
Vite 5.4.21); CI uses Node 20.

| Item | Value |
|---|---|
| `npm run check` | 0 errors, 0 warnings |
| `dist/assets/index-*.js` | 1,013,041 bytes (282,152 gzipped at zlib's default level, the figure Vite prints; 281,207 with `gzip -9`) |
| `dist/assets/index-*.css` | 62,253 bytes (14,306 gzipped at the default level; 14,006 with `gzip -9`) |
| `dist/` total | 2.5 MB (fonts included) |
| Build time | ≈ 4 s |

`check-dist.mjs` measures with zlib's default level, so its constants are the 282,152 / 14,306
figures. It fails a build if the initial JS chunk grows by more than 4 KB gzipped (the budget is
fixed from the D2 measurement) or the CSS by more than 1 KB, or if the voice chunk is referenced by
`index.html`. D1 result: the initial chunk is byte-identical to the untouched `IO-for-main-page`
build (same content hashes) — the dev-only route folds away entirely.

Latency (D6, Track D). Laptop rows on localhost in Edge; phone rows on the deployed preview with a
pasted key (`live` on a phone waits for Track P, or for Q3 = yes):

| Session | Lang | Laptop (Edge): time to first audio | Phone (Android Chrome, preview) |
|---|---|---|---|
| `browser` | KA | | |
| `browser` | EN | | |
| `turn` (Gemini TTS) | KA | | |
| `live` | KA | | — |
| `live` | EN | | — |

---

## 10. What it would cost

### 10.1 The demo (Track D): $0

| Component | Cost | Limits and conditions |
|---|---|---|
| Web Speech recognition (Chrome, Edge) | free | audio goes to Google's / Microsoft's servers; needs internet |
| Browser voices (`speechSynthesis`) | free | Edge's online natural voices need internet; Chrome depends on the OS voices |
| Gemini API free tier (Flash, TTS, possibly Live) | free | per-model daily and per-minute quotas (≈ 20 Flash requests per day reported *(forum)*; measured by the smoke test); on the free tier Google may use the content to improve its products — test content only |
| Local model (Ollama, `gemma3`) | free | runs on the presenter's laptop; Georgian quality below Gemini's (to be recorded after the first test) |
| GitHub Pages preview (personal repository) | free | the presenter pastes the key at runtime |

### 10.2 Production (Track P): per 10-minute conversation, Gemini paid tier

Assumptions: audio = 25 tokens per second; a 10-minute conversation has ≈ 10 minutes of microphone
input and ≈ 4 minutes of IO speaking (≈ 300 audio tokens per reply over 20 exchanges); Flash at the introductory price until
2026-12-31 ($0.75 / $3.75 per 1M tokens in / out), then $1.50 / $7.50; Live audio $3.00 / 1M tokens
in, $12.00 / 1M out; Gemini TTS $0.50 / 1M text in, $10.00 / 1M audio out (Gemini API pricing page,
*snippets* — re-read before the budget is filed); Cloud list TTS price $20 / 1M used for the upper
bound.

| Path | What is billed | ≈ cost per 10-minute conversation |
|---|---|---|
| **Live** (barge-in, the brief's primary path) | 15,000 audio tokens in ≈ $0.045; 6,000 audio tokens out ≈ $0.072; instruction and tool text ≈ $0.01 | **≈ $0.13** |
| **Turn** with the browser's free recogniser + Flash + Gemini TTS | 20 × (chat ≈ 3,000 tokens in / 100 out ≈ $0.003; TTS ≈ 300 audio tokens ≈ $0.003–0.006) | **≈ $0.11–0.17** |
| Turn with Gemini transcription for Safari / Firefox uploads | as above + 20 × 320 audio tokens ≈ $0.005 | ≈ $0.12–0.18 |
| Text-only mode (budget exhausted; browser voices) | chat only | ≈ $0.05 |
| From 2027-01-01 (standard Flash prices) | chat cost doubles | turn ≈ $0.16–0.22; Live unchanged |

**Monthly (30 days), at N conversations per day** (≈ $0.13 each): 20 → ≈ $80; 100 → ≈ $400;
500 → ≈ $2,000.

**Fixed costs:** Cloudflare Workers Free $0 up to ≈ 300 conversations a day (KV allows 1,000 writes
a day and a session start costs three); above that, or for exact counters, Workers Paid $5 / month;
GitHub Pages $0; a custom domain if the agency wants one.

**Ceilings:** Google Tier 1 throttles spending at $10 per rolling 10 minutes *(rate-limits page
snippet)* — ≈ 75 Live conversations starting per 10 minutes — a rate limit, not a budget, so a Cloud
Billing budget alert must be set separately. The real cap is the Worker's global daily minutes budget
(A5): for example 300 minutes a day ≈ 30 conversations ≈ $4 a day ≈ $120 a month, after which the
dock switches to text-only mode — which still bills ≈ $0.05 per conversation for `/chat`; the budget
caps voice minutes, not chat.

**For the budget request:** a pilot of ≈ 30 conversations a day costs ≈ $120 a month on the Gemini
paid tier and nothing on Cloudflare; every additional 100 daily conversations add ≈ $400 a month.
The free tier cannot run a public deployment (a few dozen requests a day per model).

---

## 11. Open questions

### 11.1 Answered

A1–A8 are recorded in §0 and applied throughout. The earlier questions on Cloudflare plans, per-IP
limits, the public index and the Azure region are closed by A4–A7.

### 11.2 Still open

| # | Question | Options and consequences | Recommendation | Needed |
|---|---|---|---|---|
| Q1 | Safety filters (Gemini `safetySettings`, both tracks): with Google's default filters IO may refuse or stop mid-sentence when a child describes bullying or blackmail — IO's core topics. Loosening those two categories lets IO answer; the risk is harsher wording slipping through. Sexual and hate categories stay at default. | Sign-off by a named person. | loosen the two categories; keep the rest | before D3 |
| Q2 | The presentation machine: Edge with the online natural voices installed and internet at the venue (browser speech, Edge voices and Gemini all need it); Ollama with `gemma3` installed as the offline fallback? Headphones or a speaker (self-interruption on the Live path)? | Without Edge there is no Georgian browser voice; without internet only Ollama + typed mode work. | Edge + internet + Ollama installed as the fallback; a wired headset | before D3 |
| Q3 | Deployed preview: may the pasted runtime key also power `live` there? (`turn` already uses it, §5.4; A3 makes Live localhost-only.) | Enables the barge-in showcase on the preview; the key still lives only in the presenter's browser. | allow it behind the same guard, off by default | before D4 |
| Q4 | Privacy wording of the demo README (§5.10) and the free-tier data-use terms: sign-off before the preview is pushed. | — | sign off in D6 | before D6 |
| Q5 | New Georgian UI strings (§6.1): the typography lint plus one native review, or the three-writer process used for `hints.js`? | The lint cannot judge register or idiom. | lint + one native review | before D6 |
| Q6 | Skill taxonomy: the 13 skills in §5.8, plus `screen_balance` (CyberHero mission 9)? | 14 gives CyberHero parity. | 14 | before D5 |
| Q7 | Strictness: "grounded when relevant, honest when nothing matches" (the brief's rule) stands; with no course index, may IO answer everyday cybersecurity questions from general knowledge when neither CyberHero nor `hints.js` covers them? | Refusing makes the demo look empty; answering risks drift from the platform's wording. | answer briefly, then route to the course | before D5 |
| Q8 | Moodle embed (Track P): can the admins add `allow="microphone; autoplay"` to the iframe (the HTML block purifier may strip it), does elearning.gov.ge send a restrictive `Permissions-Policy` header, and is 520 px acceptable? | Without the attribute the microphone never works inside Moodle. | test on the real Moodle in P3 | Track P |
| Q9 | Track P accounts: when the agency adopts it, who holds the Cloudflare account, the Gemini billing and the secrets? | — | decide at P1 | Track P |

### 11.3 Technical choices already made (object if you disagree)

| # | Choice | See |
|---|---|---|
| B1 | Token TTL 10 min = the session cap (A5); `newSessionExpireTime` 60 s; explicit `fieldMask`; the P1 smoke script settles sub-path locking and reconnect-after-60 s | §2.2, §5.9 |
| B2 | API version is a config value, default `v1beta`; the smoke script tests both | V4 |
| B3 | Track P `/stt` receives WAV built in the browser | V7 |
| B4 | Desktop transcript in the bubble slot at a fixed 104 px; bottom sheet ≤ 900 px; fixed dock in embed | §5.1, §5.3 |
| B5 | `RobotModel` gains `tapReaction`; `faceTexture` gains `eyesWide` | V9 |
| B6 | Talk-mode click on IO = interrupt only | §5.1 |
| B7 | Manual interruption on Live: flush + discard until `turnComplete`; sending a short realtime text as well is a D4 experiment | §2.3 |
| B8 | `index.html` gains `viewport-fit=cover` | §4.1 |
| B9 | The entry button keeps the brief's imperative (A8); dock controls are nominal like the page's buttons | §6.1 |
| B10 | Scripted talk-mode lines live in `src/voice/tutor/strings.js` | §6.1 |
| B11 | Transcription language hint `ka` first, `ka-GE` tested | §2.3 |
| B12 | *Talk* pressed before the 500 ms greeting skips the greeting; leaving talk mode applies the intro rule | §5.1 |
| B13 | The Latin allowlist for `voice.*` strings gains the tokens those strings need, one by one | §6 |
| B14 | Track P's `/chat` request is built in the Worker from the bundled tutor modules; Track D builds it in the browser | V20 |
| B15 | The CyberHero index is committed (`public/io-index.json`); the Basic Course index, if any, is gitignored and dev-only | §4.4 |
| B16 | The dev key reaches the browser only through `vite.config.js`'s `define` in `serve`; builds always define it empty | §5.4 |
| B17 | Browser-voice mouth = word-boundary pulses; no boundary within 400 ms → the sine mouth | §5.2 |
| B18 | Ollama backend: tools via a text-tag convention; grounding injected into the prompt | §5.4 |
| B19 | The voice layer lifts only discrete IO props (emotion, gesture, listening, talking, label, the mouth ref, the transcript element) to App through `onTalk`; captions live in an external store and re-render the transcript alone | §5.1, `store.js` |

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| Gemini's free tier is too small even when it is not 0 (≈ 20 Flash requests a day reported; Live quota unknown) | the smoke test measures every candidate model; the demo picks the model with a usable quota; Ollama is the offline fallback; the run sheet plans the number of exchanges |
| `gemma3` on Ollama speaks poor Georgian | recorded after the first test; the presentation uses Gemini unless the network fails |
| Chrome's recogniser may not accept `ka-GE`; Chrome may have no Georgian voice | Edge is the presentation browser; typed mode is automatic on `language-not-supported` |
| Edge's online voices or the recogniser fail without internet | the run sheet's offline plan: Ollama + typed mode + any local voice |
| No word-boundary events from a voice → no mouth movement | automatic sine fallback (B17), verified per voice by the bake-off page |
| Chrome cuts long `speechSynthesis` utterances | sentence chunking |
| Georgian on the Live path is not good enough, or the key has no Live quota | G1(c)/(d); D4 needs quota only; the per-language default keeps Live for English; `browser` is the safety net |
| The key in the presenter's browser | dev serve only or pasted at runtime; never in a build (`vite.config.js` + `check:dist`); *Forget key* |
| Free-tier data-use terms (content may be used to improve Google's products) | README says so; test content only; paid tier in Track P |
| Proactive audio keeps the Live model silent on a child's short or quiet utterance | `thinking` timeout; `waitingForInput` honoured |
| Retrieval quality on Georgian | BM25-style port + synonyms + retrieval tests |
| Safety filters cut mid-sentence on the tutor's core topics | explicit `safetySettings` (Q1); streamed captions kept |
| `localStorage` partitioned in a cross-site iframe | in-memory fallback; README note |
| `MAX_TOKENS` at 400 truncates Georgian tool calls | detect `finishReason`, raise the cap for tool turns, short option text |
| A 60 Hz level as React state; `StrictMode` double-mounts | ref transport (V8); audio and sockets created in the click handler |
| `connect()` hangs when the socket closes before `open` | 10 s timeout |
| A tool call is not a user gesture (`window.open`, iframe navigation) | link card fallback |
| CI runs Node 20 while `@google/genai` 3.x will need Node 22 | pin 2.x |
| The CyberHero workflow's `sync-main` job | `io-voice` is never listed there; `voice-ci.yml` builds only |
| Track P: `fieldMask` or reconnect semantics differ from the schema text | the P1 smoke script; sessions end at 10 min anyway |

---

## Change log

- 2026-09-19 — Phase 0: plan written; `io-voice` re-pointed to `IO-for-main-page` and force-pushed
  (old head `c71fa53` kept as `claude/mascot-robot-demo-9oclw8` and the local tag
  `io-voice-platform-base`; revert command in §1.3); brief copied to `docs/io-voice-build-prompt.md`;
  baseline measured; plan reviewed by three adversarial passes and corrected.
- 2026-09-19 — Phase 0 revised after the team's decisions A1–A8: two tracks (demo now without a
  backend; production deferred), `BrowserVoiceSession`, dev-only key injection, the A5 limit scheme,
  no Basic Course text in the repository, the free bake-off, the accepted entry button, the
  budget-request section (§10).
- 2026-09-19 — D1 built (§7.3): dev-key injection, checks and postbuild scan, the direct Gemini and
  local-LLM transports, browser-voice helpers, the `?bakeoff=1` page, the smoke and bake-off
  scripts, the rating sheet, unit tests and `voice-ci.yml`. Corrections from D1: §9's gzip figures
  were `gzip -9` numbers (the check uses zlib's default level, as Vite does); §5.4 names `/@vite/env`
  as the dev-define carrier; §2.4 confirms the `connect()` hang on a rejected key.
- 2026-09-19 — D2 built (§7.3): the mouth, the listening cue and talk mode in the mascot; the entry
  button and `T`; the lazy voice layer with the audio primitives, the state machine, the dock, the
  transcript and the stub harness; V23–V24 and B19 recorded; headless acceptance scripts added.
- 2026-09-19 — D3 built (§7.3): the recogniser, the turn pipeline, the persona, the two speakers, the
  browser and turn sessions, the key field's forget path; V25–V26 recorded; the acceptance script
  now runs both sessions against a mocked Gemini API.
- 2026-09-19 — D4 built (§7.3): `LiveVoiceSession` with the dev key, resumption, idle and hidden
  handling, the fallback to `browser`; V27–V28 recorded; `scripts/e2e/live.mjs` mocks the Live
  socket.
