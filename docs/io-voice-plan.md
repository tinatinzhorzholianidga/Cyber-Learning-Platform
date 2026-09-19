# IO voice — build plan

**Status: Phase 0 (plan, no product code).** This document answers `docs/io-voice-build-prompt.md`
("the brief") and is kept current through every phase; the change log is at the end.

Phase 0 deliverables: a file-by-file plan (§4), model IDs verified (§2.1), the Gemini facts the
brief asks to confirm (§2.2–§2.4), a cost estimate (§2.9) and the decisions the team must take
before Phase 1 (§10, part A). Part B of §10 lists technical choices already made; object if you
disagree with any of them.

**How the facts were verified (2026-09-19).** The documentation sites `ai.google.dev`,
`developers.cloudflare.com`, `learn.microsoft.com` and `developer.mozilla.org` are blocked by the
build environment's network policy. Every claim below was therefore checked against primary sources
that are reachable: Google's live API Discovery document for `generativelanguage.googleapis.com`
(revision `20260919`, both `v1beta` and `v1alpha`, plus HTTP probes of the endpoints), the
`@google/genai` 2.23.0 sources, package and unit tests, Google's `gemini-api-cookbook`,
`gemini-live-api-examples` and `gemini-skills` repositories, the source repositories behind the
Cloudflare, Microsoft Learn and MDN pages (`cloudflare/cloudflare-docs`, `MicrosoftDocs/azure-ai-docs`,
`mdn/content`, `mdn/browser-compat-data`), Apple's Safari release-notes JSON and WebKit sources.
Where only a search snippet of a docs page was available the fact is marked *(snippet)*; §2.10 lists
what must be re-read on the docs pages before Phase 3.

Terms used below: **Live** = Gemini's real-time WebSocket voice API; **VAD** = voice activity
detection (the server deciding when the visitor starts and stops speaking); **barge-in** = the
visitor talking over IO and IO stopping; **TTS / STT** = text-to-speech / speech-to-text;
**SSE** = server-sent events (a streamed HTTP response); **KV** = Cloudflare's key-value store;
**Worker** = the small Cloudflare server that holds the secrets; **r3f** = react-three-fiber,
the library IO's 3D model is built with.

---

## 1. Decisions taken in Phase 0

### 1.1 `io-voice` is built on `IO-for-main-page` (done)

Two code bases exist in this repository with **no shared git history**:

| Branch | What it is | Used for |
|---|---|---|
| `IO-for-main-page` (`dc8a296`, 6 commits) | The standalone welcome host for elearning.gov.ge: `App.jsx`, `IoHost.jsx`, `hostBrain.js`, `hints.js`, `ui.js`, `check-hints.mjs`, `deploy.yml`. This is the branch the brief's file table, the README rules and the definition of done ("host mode pixel-identical to `IO-for-main-page`", "`npm run check` must keep passing") describe. | the base of `io-voice` |
| `claude/mascot-robot-demo-9oclw8` (`c71fa53`) — where `origin/io-voice` pointed when this session started | The CyberHero platform (missions, parents hub, games, the hidden IO Chat page on WebLLM, `src/content/ioCourse.js`). No `IoHost.jsx`, no `hints.js`, no `check` script; its `RobotCanvas.jsx` lacks the keyboard tap the brief requires. | content only (§4.2) |

`RobotModel.jsx` and `faceTexture.js` are **byte-identical** on both branches and on `main` (blobs
`1a3b7cd6`, `e66bb64f`), so IO looks the same either way; `RobotCanvas.jsx` on `IO-for-main-page` is
the newer one (keyboard tap, Safari < 14 `matchMedia` fallback, `.io-canvas` class).

The remote `io-voice` had zero commits of its own (same SHA as `claude/mascot-robot-demo-9oclw8`,
which still holds it), so re-pointing it lost nothing. **This was done in Phase 0** (commit `541d2aa`):

```bash
git tag io-voice-platform-base c71fa53b981cd5bf5504c2d130d577b348045af6   # local marker of the old head
git checkout -B io-voice --no-track origin/IO-for-main-page
rm -rf node_modules && npm ci                                              # different lockfile
git push --force-with-lease=refs/heads/io-voice:c71fa53b981cd5bf5504c2d130d577b348045af6 -u origin io-voice
```

To undo it (if the team answers A1 with "no"): `git push --force-with-lease origin c71fa53b981cd5bf5504c2d130d577b348045af6:io-voice`.
Anyone with a stale local `io-voice` should `git fetch && git reset --hard origin/io-voice` rather than
pull. Everything the voice build needs from the other branches is copied file by file with
`git show <ref>:<path>` (§4.2), never merged. `io-voice` must never be added to the CyberHero
workflow's branch list: its `sync-main` job force-pushes listed branches to `main` and would replace
the live CyberHero site.

### 1.2 Modes (unchanged from the brief)

**Host mode** is today's behaviour: greeting by time of day, intro, click cycle, hover reactions,
farewell, no cyber tips. **Talk mode** starts on *Talk to IO*, the `T` key, or a typed question; IO
may teach cybersecurity grounded in the platform's own content and route to the right course.
Leaving talk mode returns to host mode. The README will describe this split (§5.8).

### 1.3 Where the plan deviates from the brief

The brief says: when the Gemini docs contradict it, follow the docs and note the difference. Every
deviation the plan makes is listed here.

| # | Brief says | Plan does | Why | Where |
|---|---|---|---|---|
| D1 | Live fallback `gemini-2.5-flash-native-audio-preview-12-2025` | fallback `gemini-3.1-flash-live-preview`; the 2.5 preview as third choice only | Google names 3.1 Flash Live as that model's replacement and lists it under "legacy"; the SDK issue tracker shows close-code 1008 failures on it | §2.1 |
| D2 | `speechConfig.languageCode` `ka-GE` / `en-US` on Live | no `languageCode` on Live; language is steered by the system instruction, plus a transcription language hint | native-audio Live models pick the language themselves and reject explicit codes; `ka-GE` is not in the API's `languageCode` value list | §2.3 |
| D3 | token `expireTime = now + 10 min` | `now + 30 min` (the API default), `newSessionExpireTime = now + 60 s` | `expireTime` caps the whole session, not the redeem window; 10 min would end every conversation at 10 min | §2.2 |
| D4 | SDK `httpOptions: { apiVersion: 'v1beta' }` | one config value on both sides (`GEMINI_API_VERSION` in the Worker, returned to the browser by `/token`), default `v1beta`; the Phase 1 smoke script mints and connects on both versions and the default follows the result | both versions serve `auth_tokens` (probed); Google's current browser example and the SDK's unit test use `v1beta`; the SDK's docs and warning say `v1alpha`; the two docs snippets found contradict each other | §2.2 |
| D5 | `/chat` "ports the parser from `llmClient.js`" into the Worker | Worker forwards Gemini's SSE bytes untouched; the parser (fixed and extended for function-call parts) runs in the browser | Workers Free allows 10 ms CPU per request; parsing a 30 s stream in the Worker risks Error 1102; function-call parts must reach the client anyway | §5.4 |
| D6 | KV daily counters on every route (20/200/300 per IP) | native rate-limit bindings for bursts on every route; a KV daily cap on `/token`; daily caps on `/chat` `/tts` `/stt` only on Workers Paid | Workers Free allows 1,000 KV writes per day for the whole account | §2.8, A4 |
| D7 | `/stt` receives `audio/webm;codecs=opus` or `audio/mp4` | `/stt` receives a WAV built in the browser from the same 16 kHz PCM16 the mic worklet already produces | one format on every browser; Gemini's list has `audio/wav` but not `audio/mp4`; WAV is one of the two formats Azure STT accepts | §5.6 |
| D8 | `mouthLevel (0..1)` prop | a ref (or a plain number for tests) read inside the render loop | a 60 Hz React prop would re-render the whole r3f tree every frame; `windowPointer` already uses the ref pattern | §5.2 |
| D9 | "Only add: amplitude-driven mouth, a listening cue" to the model | plus one boolean `tapReaction` prop and an `eyesWide` field in `faceTexture.js` | the model plays its own wave + 1.8 s `excited` overlay on every pointer tap; in talk mode that would hide the 400 ms `surprised` interruption cue; the wider eyes need one parameter in the face painter | §5.2 |
| D10 | grounding "retrieved client-side with the ported `ioBrain` retrieval" | same, over a generated static JSON index fetched on first use; retrieval improved (length normalisation, synonyms) | the content lives on other branches; importing it would put ≈ 219 KB (gzipped) of game data in the voice chunk and tie `src/voice` to CyberHero's modules | §4.4, A6 |
| D11 | "Host mode is pixel-identical" | host mode gains one static *Talk to IO* button under the "click IO" hint, styled by ≈ 10 lines appended to `global.css`; everything above it and every embed without `?voice=1` stays identical | talk mode needs an entry point that exists before the voice code loads | §5.3, A8 |
| D12 | talk mode starts on the button "or types a question" | the `T` key and the button work from host mode; the text input appears once the dock has loaded (one click later) | a static input would add a second visible host-mode element | §4.1 |
| D13 | `/chat` receives "the same persona + tool list" from the client | the Worker builds the Gemini request (persona, tools, generation config) from the same `src/voice/tutor` modules it bundles; the client sends only language, history and grounding | a leaked Worker URL cannot then be used as a general Gemini proxy; persona and tools cannot drift between the two sessions | §5.4 |
| D14 | `end()` "asks IO for a 2-line summary" | the summary comes from the `end_session` tool call | Live no longer supports text output; the tool already carries `summary_ka` / `summary_en` | §2.3 |
| D15 | push-to-talk: "hold the button or press once to start/stop" | press to start, press again to stop; holding also works (release stops) | one label can only describe one gesture; the label describes the toggle | §5.6, §6.1 |
| D16 | the literal `voice.*` strings in the brief | button labels in the nominal form the page already uses; the privacy line states that Google processes the voice; all strings go to one native review | see §6.1 | §6.1, B9 |
| D17 | bake-off "with the `ka` hint" | the language is named in the prompt text (with and without); `languageCode` is not sent | the API has no valid Georgian value for `languageCode` | §6.2 |

---

## 2. Verified facts

### 2.1 Model IDs (checked 2026-09-19)

| Purpose | Brief said | Verified today | Use | Source |
|---|---|---|---|---|
| Live voice, primary | `gemini-3.8-live` | exists; GA since 2026-09-15; "the default option for most low-latency voice agent experiences"; audio-only output; `thinkingConfig` must not be sent; function calls default to non-blocking | `gemini-3.8-live` ✅ | cookbook `Get_started_LiveAPI.ipynb`, `gemini-skills` Live skill, Google's ephemeral-token example (default model); model page *(snippet)* |
| Live voice, fallback | `gemini-2.5-flash-native-audio-preview-12-2025` | still served, but Google lists it under "legacy" with `gemini-3.1-flash-live-preview` as replacement; the Gemini 2.5 line is scheduled to shut down in October 2026 and whether previews are covered is unclear *(snippet)* | `gemini-3.1-flash-live-preview`, then the 2.5 preview — D1 | `gemini-skills` `migration.md`; model page and changelog *(snippets)* |
| Text / grounding | `gemini-3.8-flash` | exists, GA; accepts inline audio parts; the `generateContent` family is now labelled "legacy" but remains supported and documented; 1M context *(snippet)* | `gemini-3.8-flash` ✅ | cookbook `Get_started.ipynb`, `Audio.ipynb`, `gemini-skills`; model page *(snippet)* |
| STT (`/stt`) | Flash with an inline audio part | Flash works; a purpose-built `gemini-3.5-transcribe` model exists (non-streaming, auto language ID; "85+ languages" is press wording, Georgian membership unverified) | `gemini-3.8-flash` first; `gemini-3.5-transcribe` tried in the bake-off | `Models.ipynb` listing, `gemini-skills` |
| TTS (`/tts`) | `gemini-3.1-flash-tts-preview` | exists (preview); streaming over `streamGenerateContent` (changelog dates it 2026-06-17 *(snippet)*); 24 kHz 16-bit mono PCM; 30 prebuilt voices; language auto-detected | `gemini-3.1-flash-tts-preview` ✅ | `Models.ipynb`, cookbook `Get_started_TTS.ipynb`, Cloud notebooks, Cloud blog |
| TTS alternative | Azure `ka-GE-GiorgiNeural` / `ka-GE-EkaNeural` | both exist (type Standard, male / female); no phoneme, lexicon or viseme support; served from every region | Azure adapter, default Giorgi ✅ | `MicrosoftDocs/azure-ai-docs` TTS language table |
| Extended-thinking Live | — | `gemini-3.8-live-extended-thinking` (GA) exists; requires every tool to be non-blocking | not used (latency) | cookbook `Get_started_Live_Thinking.ipynb` |

Model IDs are **configuration, not constants**: `worker/wrangler.jsonc` `vars` hold them; the browser
receives the Live model and API version in the `/token` response and holds no model constants.
Rate limits: per-model tables are no longer published *(snippet)*; the free tier is reported at
≈ 20 Flash requests per day and had a limit of 0 for this project's earlier key (the demo branch's
`docs/io-chatbot.md` §10). **A billed Gemini project is required before Phase 1** (A3).

### 2.2 Ephemeral tokens (`POST …/auth_tokens`)

Source: Discovery `v1beta` rev 20260919 (method `generativelanguage.auth_tokens.create`, schema
`AuthToken`), `@google/genai` 2.23.0 `src/tokens.ts`, `src/live.ts`, unit tests, Google's
`gemini-live-api-examples/gemini-live-ephemeral-tokens-websocket`.

- **Endpoint:** `POST https://generativelanguage.googleapis.com/v1beta/auth_tokens` with headers
  `x-goog-api-key: <key>` and `Content-Type: application/json`. The same method exists on
  `v1alpha`; `v1` returns 404 (probed). ✅ brief confirmed.
- **Request fields (wire names):** `uses` (default **1**; `0` = unlimited — never send 0; resuming a
  session does not consume a use), `expireTime` (RFC 3339, default **30 min**, must be < 20 h; after
  it "messages in BidiGenerateContent sessions will be rejected" and Gemini may close the session),
  `newSessionExpireTime` (default **60 s**, < 20 h), **`bidiGenerateContentSetup`** (the SDK calls it
  `liveConnectConstraints`: `model` as `models/<id>`, `systemInstruction`, `tools`, `generationConfig`
  incl. `responseModalities` / `speechConfig`, `inputAudioTranscription`, `outputAudioTranscription`,
  `realtimeInputConfig`, `sessionResumption`, `contextWindowCompression`) and **`fieldMask`** (the SDK
  calls it `lockAdditionalFields`).
- **Locking semantics:** no `fieldMask` with a setup present → the token's setup is used entirely and
  the client's setup message is **ignored** (including a `sessionResumption.handle` sent on reconnect);
  a non-empty `fieldMask` → only the listed fields are overwritten from the token. Mismatches never
  error. The Worker therefore sends an explicit mask that lists the locked fields and leaves
  `sessionResumption` client-controlled. Two things are unverified and go into the Phase 1 smoke
  script (B1): whether a parent path such as `generationConfig` locks its sub-fields or sub-paths
  (`generationConfig.responseModalities`) are needed (the SDK emits sub-paths), and whether a
  reconnect with a handle after the 60 s `newSessionExpireTime` is accepted (the `uses` text says
  resuming is not a use; the new-session text is ambiguous). If reconnects need a fresh token, the
  ≈ 10-minute reconnects consume one daily token each and D3's arithmetic changes.
- **Response:** `{ "name": "auth_tokens/…" }` — the `name` string **is** the token; the browser passes
  it as `apiKey`. The SDK switches to token mode when `apiKey` starts with `auth_tokens/` and opens
  `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.<apiVersion>.GenerativeService.BidiGenerateContentConstrained?access_token=<token>`.
- **API version:** no report connected a socket. Google's own browser example mints on `v1beta` and
  connects to the `v1beta` constrained endpoint, and the SDK's unit test builds the same `v1beta` URL,
  so `v1beta` is expected to work; the SDK's documentation says `v1alpha` and it prints
  `Warning: The SDK's ephemeral token support is in v1alpha only` on anything else. D4: config value,
  smoke test decides.
- **Scope:** tokens work **only** for the Live API; the SDK throws
  `Ephemeral tokens are only supported by the live API` for any REST call. `/chat`, `/tts`, `/stt`
  keep the real key inside the Worker, as the brief designs.
- **Caveat found:** forum reports (unverifiable here) say minting fails with `INVALID_ARGUMENT` for
  new-format `AQ.`-prefixed API keys while `AIza…` keys work. The first Phase 1 smoke check is a mint.
- The current docs URL is `…/gemini-api/docs/live-api/ephemeral-tokens` (the brief's path moved).

### 2.3 Live API

Source: Discovery (`BidiGenerateContentSetup`, `RealtimeInputConfig`, `AutomaticActivityDetection`,
`AudioTranscriptionConfig`, `SessionResumptionConfig`, `ContextWindowCompressionConfig`,
`SpeechConfig`); SDK types; cookbook Live notebooks; `gemini-skills` Live skill and `migration.md`;
docs *(snippets)* where marked.

| Topic | Verified | We do |
|---|---|---|
| **Input audio** | raw 16-bit PCM, 16 kHz, mono, little-endian; `sendRealtimeInput({ audio: { data: <base64>, mimeType: 'audio/pcm;rate=16000' } })`; other rates are resampled server-side; the docs say "send audio in chunks of 100 ms" *(snippet)* while Google's own browser example sends 32 ms chunks "per Gemini best practices (20–40 ms)" | worklet emits 100 ms chunks (1600 samples); shorter chunks tried in Phase 3 if latency needs it |
| **Output audio** | raw 16-bit PCM, 24 kHz, mono, little-endian, base64 in `serverContent.modelTurn.parts[].inlineData` | player queues 24 kHz Int16 ✅ |
| **Output modality** | `responseModalities: ['AUDIO']` only; **text output is no longer supported on Live** ("use AUDIO with output transcription enabled") | D14: `end()` gets its summary through the `end_session` tool |
| **VAD** | `realtimeInputConfig.automaticActivityDetection` is on by default; fields `disabled`, `startOfSpeechSensitivity` / `endOfSpeechSensitivity` (both default HIGH on the Gemini API), `prefixPaddingMs`, `silenceDurationMs` (the server default is ≈ 800 ms *(snippet)*; the SDK types and the docs define `prefixPaddingMs` differently); `activityHandling` defaults to `START_OF_ACTIVITY_INTERRUPTS`; with VAD disabled the client must send `activityStart` / `activityEnd`; `turnCoverage` default changed on 3.8 | automatic VAD on; `turnCoverage: TURN_INCLUDES_ONLY_ACTIVITY` set explicitly; sensitivities tuned on Georgian speech in Phase 3 |
| **Interruption (server)** | on barge-in the server "cuts the model's turn and sends `serverContent.interrupted`" and skips `generationComplete`; pending tool calls arrive as `toolCallCancellation.ids`; only audio already sent stays in the model's history *(snippet)* | `player.flush()`, cancel pending tools, state `interrupted` |
| **Interruption (manual click / Esc)** | no interrupt message exists; `activityStart` is illegal with automatic VAD; a `clientContent` turn "unconditionally interrupts active generation" on 3.8; realtime text counts as activity. Flushing locally tells the server nothing: the rest of the turn keeps streaming and the model treats the utterance as said | `player.flush()` + discard audio until `turnComplete`; whether to also send a short realtime text so the model knows it was cut off is a Phase 3 experiment (B7) |
| **Transcription** | `inputAudioTranscription: {}` and `outputAudioTranscription: {}`; transcripts arrive as `serverContent.inputTranscription.text`, `interimInputTranscription.text` (live partials) and `outputTranscription.text`, with `finished` and `languageCode`; `AudioTranscriptionConfig.languageCodes: ['ka']` gives BCP-47 hints ("defaults to automatic language detection") | both on; the hint is set to the session language (`ka` vs `ka-GE` tested, B11); no other transcription fields are sent |
| **Session resumption** | `sessionResumption: { handle }`; server sends `sessionResumptionUpdate` (`newHandle`, `resumable`); handles valid 2 h after the session ends *(snippet)* or "up to 24 hours" (cookbook) — assume 2 h; a `goAway.timeLeft` message precedes the server closing (a forum report of it being skipped could not be read) | store the latest handle; reconnect on `goAway` **and** on an unexpected close |
| **Lifetimes** | connection ≈ **10 min**; audio-only session **15 min** unless context compression is on *(snippet, also in Google's skill)*; token `expireTime` (30 min) caps the session | compression on; reconnect; 90 s idle → spoken goodbye (brief) |
| **Context compression** | `contextWindowCompression: { slidingWindow: { targetTokens? }, triggerTokens? }`; `targetTokens` defaults to half of `triggerTokens`; both are int64 strings in the TypeScript types (`'25600'`); the window is cut at a user-turn boundary and never removes the system instruction; Live context is 128k in / 64k out | `{ slidingWindow: {}, triggerTokens: '25600' }` |
| **Language** | native-audio models "automatically choose the appropriate language and don't support explicitly setting the language code" *(snippet)*; Discovery's `speechConfig.languageCode` value list has **no `ka-GE`** (de, en, es, fr, hi, pt, ar, id, it, ja, tr, vi, bn, gu, kn, ml, mr, ta, te, nl, ko, cmn, pl, ru, th only); Georgian appears as `ka` on the Live language table *(snippet)* | D2: no `languageCode`; the system instruction fixes the language |
| **Voices** | Live native-audio models accept any of the 30 TTS prebuilt voices *(snippet)*; Google's browser example offers Puck, Charon, Kore, Fenrir, Aoede | voice name from config; bake-off picks it |
| **Proactive audio, affective dialog, thinking** | on `gemini-3.8-live` proactive audio is **permanently on** (`proactiveAudio: false` errors) — the model may stay silent on speech it judges not addressed to it; affective dialog was removed; `thinkingConfig` must be omitted; `serverContent.waitingForInput` and `interactionStatus` (`IDLE` / `IN_PROGRESS`, sent with `turnComplete`) exist | none of the three options is sent; the `thinking` state has a timeout back to `listening`; `waitingForInput` is honoured |
| **Text turns** | Google's guidance: `sendRealtimeInput({ text })` for real-time user input (ordered with the audio by VAD); `sendClientContent({ turns, turnComplete: true })` for context injection, and on 3.8 it also interrupts current generation | typed questions → realtime text; the hidden `session_started` nudge → `sendClientContent` |
| **Tools** | `tools: [{ functionDeclarations }]`; server sends `toolCall.functionCalls[]` (`id`, `name`, `args`); reply `sendToolResponse({ functionResponses: [{ id, name, response, scheduling?, willContinue? }] })`; `id` mandatory; on `gemini-3.8-live` `NON_BLOCKING` is the default and the model keeps talking while a tool runs; `scheduling` is `SILENT` / `WHEN_IDLE` (default) / `INTERRUPT`; no automatic function calling on Live | `behavior` set explicitly on every declaration (§5.5); responses sent immediately, never held until playback drains |
| **Unsupported in the Live setup's `generationConfig`** | `responseMimeType`, `responseSchema`, `stopSequences`, logprobs, `audioTimestamp`, … | the token's `bidiGenerateContentSetup.generationConfig` carries only `responseModalities`, `temperature`, `speechConfig` |

### 2.4 `@google/genai` in the browser

Source: `googleapis/js-genai` at `f584bab` (2026-09-18; npm `latest` = 2.23.0, published 2026-09-16),
`src/live.ts`, `src/types.ts`, `src/tokens.ts`, `src/web/*`, unit tests, issues; a local esbuild
measurement; Google's two official browser samples.

- **Version / status:** 2.23.0, Node ≥ 20 (3.x will require Node 22). The `Live` class, `Session`
  and ephemeral-token support are still marked `@experimental` in the source; the token path prints a
  runtime "experimental" warning. Pin `@google/genai` to 2.x.
- **Size:** the browser entry `dist/web/index.mjs` is ≈ 1.08 MB unminified and does **not**
  tree-shake (no `sideEffects` field; the client constructs every sub-module). A bundle of
  `GoogleGenAI` + `live.connect` measures **383,462 B minified / 69,210 B gzipped** — budget ≈ 70 KB
  gzipped for the SDK inside the lazy chunk, plus `src/voice/**` and `voice.css`. No Node polyfills
  are needed (`p-retry` is the only dependency; the browser adapter uses the native `WebSocket`).
- **Browser auth:** the README cautions against API keys in client code; with a token the SDK opens
  `…/BidiGenerateContentConstrained?access_token=<token>` — the token travels in the URL because
  browser WebSockets cannot set headers. Keep the URL out of logs and error reports.
- **`ai.live.connect({ model, config, callbacks })`** resolves only **after `setupComplete`** (earlier
  messages are queued and replayed), so "after setupComplete" means "after `connect()` resolves".
  `callbacks.onmessage` is required. `config.httpOptions` throws — `apiVersion` goes on the
  `GoogleGenAI` client. `LiveConnectConfig.generationConfig` is deprecated in the SDK:
  `responseModalities`, `speechConfig`, `temperature` sit directly on `config`.
- **Known issues:** #1257 `connect()` never rejects when the socket closes before `open` → wrap it in
  a 10 s timeout; #1236 close code 1008 on the 2.5 native-audio preview (supports D1); #324 the Node
  entry crashes inside Cloudflare Workers → the Worker mints tokens with plain `fetch`.
- **Sending:** `sendRealtimeInput({ audio: { data: <base64 string>, mimeType } })` — base64 only,
  never typed arrays, never the legacy `media` key; `sendRealtimeInput({ text })` for typed input;
  `sendRealtimeInput({ audioStreamEnd: true })` when the mic pauses; `sendClientContent({ turns, turnComplete })`
  (`turnComplete` defaults to `true`); `sendToolResponse({ functionResponses })`.
- **Receiving:** `serverContent.{modelTurn.parts[].inlineData.data, interrupted, turnComplete,
  generationComplete, inputTranscription, interimInputTranscription, outputTranscription,
  interactionStatus, waitingForInput}`, `toolCall.functionCalls`, `toolCallCancellation.ids`,
  `sessionResumptionUpdate.{newHandle, resumable}`, `goAway.timeLeft`, `setupComplete`,
  `usageMetadata`. One event can carry audio, a transcript and flags at once — process every field.
- **Reconnection:** none in the SDK; the app stores `newHandle` (when `resumable`) and calls
  `connect()` again with `config.sessionResumption.handle`.
- **Lifecycle:** the AudioContext, the mic and the socket are created in the click handler and held
  in refs, never in a mount effect — `main.jsx` runs `React.StrictMode`, which double-invokes effects
  in development (two sockets, two token uses).
- **Official browser samples** (neither is "SDK in the browser with a token"): `sdk-samples/index.html`
  (inline AudioWorklet at `AudioContext({ sampleRate: 16000 })`, 24 kHz `AudioBuffer`s scheduled with
  `nextStartTime`, SDK in a Node relay) and `gemini-live-api-examples/…-ephemeral-tokens-websocket`
  (raw WebSocket, 512-sample capture worklet, playback worklet with an "interrupt" queue clear,
  `gemini-3.8-live`, mint on `v1beta`). Neither resamples in JS; our worklet does (§2.7).

### 2.5 Gemini TTS and STT

Source: Discovery `v1beta` (`SpeechConfig`, `VoiceConfig`, `PrebuiltVoiceConfig`,
`AudioTranscriptionConfig`), `google-genai` SDK types, Google's cookbook and Cloud notebooks,
`google-gemini/gemini-skills`, Cloud pricing pages; Gemini API pricing *(snippet)*.

- **TTS request:** `POST models/gemini-3.1-flash-tts-preview:streamGenerateContent?alt=sse` with
  `contents: [{ parts: [{ text }] }]` and
  `generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } }`.
  Streaming is confirmed by Google's Vertex notebook (single request, multiple responses) and by the
  changelog for the Gemini API *(snippet)*. Each chunk is `inlineData` with mimeType
  **`audio/l16; rate=24000; channels=1`** (lower-case, spaces — parse the rate with `/rate=(\d+)/`),
  raw PCM16 LE mono, no header. Output is watermarked with SynthID.
- **Language:** the TTS models detect the language from the text; `speechConfig.languageCode` has
  the same 30-value list as Live (no `ka-GE`) — not sent for Georgian (D17). Georgian (`ka-ge`) is on
  the Gemini-TTS locale list in Google's Cloud notebook; pronunciation quality is untested → Gate G1.
  Style is steered by an English prefix ("Read the following Georgian sentence as IO, a warm, calm
  robot guide…") and English audio tags such as `[curious]`; tags are stripped from captions.
- **Voices (30, case-sensitive):** Zephyr (bright), Puck (upbeat), Charon (informative), Kore (firm),
  Fenrir (excitable), Leda (youthful), Orus (firm), Aoede (breezy), Callirrhoe (easy-going), Autonoe
  (bright), Enceladus (breathy), Iapetus (clear), Umbriel (easy-going), Algieba (smooth), Despina
  (smooth), Erinome (clear), Algenib (gravelly), Rasalgethi (informative), Laomedeia (upbeat), Achernar
  (soft), Alnilam (firm), Schedar (even), Gacrux (mature), Pulcherrima (forward), Achird (friendly),
  Zubenelgenubi (casual), Vindemiatrix (gentle), Sadachbia (lively), Sadaltager (knowledgeable), Sulafat
  (warm). The docs give style words only; the male/female split comes from Google demo code, not docs:
  **male-coded** Achird, Algenib, Algieba, Alnilam, Charon, Enceladus, Fenrir, Iapetus, Orus, Puck,
  Rasalgethi, Sadachbia, Sadaltager, Schedar, Umbriel, Zubenelgenubi. Kore and Zephyr are female-coded.
- **TTS price:** Google Cloud list price $1.00 / 1M text tokens in and $20.00 / 1M audio tokens out;
  the Gemini API pricing page *(snippet)* shows $0.50 / $10.00 and a free tier; 25 audio tokens per
  second either way. Rate limits per tier are not published (read them in AI Studio for the project).
- **STT (`/stt`):** `generateContent` with an inline audio part; accepted MIME types (SDK enum):
  `audio/wav`, `mp3`, `aiff`, `aac`, `ogg`, `flac`, `mpeg`, `m4a`, `l16`, `opus`, `alaw`, `mulaw`,
  `webm` — **`audio/mp4` is not listed** (Safari's `MediaRecorder` label) → D7 sends WAV. Inline
  request limit: 20 MB per the docs *(snippet)*, 100 MB per the 2026 cookbook — the Worker caps bodies
  at 2 MB. Prompt from the cookbook: "Generate a transcript of the speech." plus "Output only the
  verbatim transcript in <language>". `v1beta` also documents
  `generationConfig.audioTranscriptionConfig: { mode: 'VERBATIM' | 'SMART', languageCodes: ['ka'] }`
  (model support to be tested). Audio input costs 32 tokens per second on Flash. Georgian support in
  Flash audio understanding and in `gemini-3.5-transcribe` is untested → bake-off.
- **Do not** switch `/tts` or `/stt` to the newer Interactions API: interactions are **stored by
  default** (55 days on the paid tier) unless `store: false` is set. `generateContent` requests are
  not stored for product use, but Google's API terms allow retention for abuse monitoring — the README
  says exactly that (§5.8), not "stores nothing".

### 2.6 Azure Speech (Georgian)

- Voices `ka-GE-GiorgiNeural` (male) and `ka-GE-EkaNeural` (female): type Standard; "Phonemes, custom
  lexicon, and visemes aren't supported"; no HD or multilingual voice lists Georgian.
- REST: `POST https://<region>.tts.speech.microsoft.com/cognitiveservices/v1`, headers
  `Ocp-Apim-Subscription-Key`, `Content-Type: application/ssml+xml`,
  `X-Microsoft-OutputFormat: raw-24khz-16bit-mono-pcm` (streaming) and a **required `User-Agent`**;
  the body streams; audio over 10 min is truncated; 30 TPS on S0, none on F0.
- SSML: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ka-GE"><voice name="ka-GE-GiorgiNeural"><prosody rate="-5%">…</prosody></voice></speak>`;
  keep `xml:lang` equal to the voice locale.
- Azure STT lists `ka-GE` but its short-audio REST accepts only `audio/wav; codecs=audio/pcm; samplerate=16000`
  or Ogg Opus, ≤ 60 s — another reason for D7. Azure prices were not verified here (A15).

### 2.7 Browser capabilities (from `mdn/browser-compat-data`, Apple release notes, WebKit source)

| Feature | Chrome / Edge | Firefox | Safari (macOS ≥ 14.1, iOS ≥ 14.5) | Android Chrome |
|---|---|---|---|---|
| `SpeechRecognition` | yes (prefixed since 33, unprefixed 139); Google's servers; HTTPS only | flag only | **prefixed only** (`webkitSpeechRecognition`); Apple's recogniser, on-device when the locale allows; nothing for unavailable locales; secure context only since Safari 26 | yes; `continuous` ignored |
| `lang = 'ka-GE'` | unverified (Google Cloud Speech lists `ka-GE`; Chrome's demo table reportedly includes it) — the `language-not-supported` error must trigger the fallback | — | assume unsupported → always the upload fallback | unverified |
| `AudioWorklet` | 66+ | 76+ | 14.1+ | yes |
| `AudioContext({ sampleRate })` | 74+ | 61+ | **honoured since 14.1** (ignored before) — the brief's "Safari ignores it" is outdated; the worklet resampler is kept anyway (one context at the hardware rate for mic and player) | yes |
| AudioContext unlock | `resume()` inside a user gesture | same | contexts start suspended; `resume()` in the click handler | same |
| `MediaRecorder` | `audio/webm;codecs=opus` | `audio/ogg` | `audio/mp4` (AAC) always; `audio/webm;codecs=opus` since 18.4 | as Chrome |
| `<iframe allow="microphone; autoplay">` | 60+ | 74+ | 11.1+ | yes |
| `localStorage` inside a cross-site iframe | partitioned | partitioned | partitioned / may throw | partitioned |

Permissions policy: the default allowlist for `microphone` and `autoplay` is `self`, an iframe
inherits the parent's policy, and the feature must be allowed by **both** the parent page and the
`allow` attribute; a sandboxed iframe additionally needs `allow-same-origin`; both pages must be
HTTPS. The Moodle page must therefore not send `Permissions-Policy: microphone=()` (A10).
"Safari ≥ 14.1 / iOS ≥ 14.5" is the single floor for the whole voice stack on Apple platforms.

### 2.8 Cloudflare Workers (from `cloudflare/cloudflare-docs`, branch `production`)

- **Rate Limiting binding** (`ratelimits` in `wrangler.jsonc`, Wrangler ≥ 4.36): `period` is **10 or
  60 s only**, counters are per Cloudflare location and "permissive, eventually consistent"; the docs
  advise against IP keys ("shared by many users"). It cannot express a daily cap.
- **KV**: `expirationTtl` ≥ 60 s; 1 write per key per second (429 otherwise); eventual consistency up
  to 60 s; **Free plan: 100,000 reads and 1,000 writes per day for the account**; Paid ($5/month):
  1 M writes/month included. A read-modify-write counter costs one write per accepted request → D6.
  **Durable Objects** are on the Free plan (100,000 requests/day) and give exact counters if needed.
- **Secrets**: `npx wrangler secret put NAME` (creates and deploys a new version); local values in
  `worker/.dev.vars`; do not declare `secrets.required` (it stops optional `AZURE_*` /
  `TURNSTILE_SECRET` from loading locally). `.gitignore` uses `worker/.dev.vars`, `worker/.dev.vars.*`,
  `!worker/.dev.vars.example` (Cloudflare's suggested `.dev.vars*` would hide the example).
- **Turnstile** (Cloudflare's bot check, optional on `/token`): `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`
  (`secret`, `response`, `remoteip`, `idempotency_key`) → `{ success, hostname, "error-codes" }`;
  tokens single-use, 300 s; test secret `1x0000000000000000000000000000000AA` always passes. Enabling it
  loads a Cloudflare script on the page — a third-party request the README must mention if used.
- **Streaming**: `return new Response(upstream.body, …)` is "already optimal"; HTTP request duration
  is unlimited while the client stays connected; **CPU is 10 ms per request on Free** (30 s on Paid).
  A 30 s `AbortController` must cover connect + headers only, then be cleared.
- **CORS**: echo the matched origin (never `*`), append `Vary: Origin`, answer `OPTIONS` with `204`
  and `Access-Control-Max-Age: 86400`; the client IP is `CF-Connecting-IP`.
- **Limits**: Free 100,000 requests/day (Error 1027 after), 50 subrequests per request (KV ops
  count), Worker bundle 64 MiB uncompressed, 1 s startup. `workers.dev` is "intended for personal or
  hobby projects"; production for elearning.gov.ge should use a custom domain or route (A4).
- **Config**: `wrangler.jsonc` recommended; `compatibility_date: "2026-09-19"`;
  `kv_namespaces: [{ binding, id }]`; `observability.enabled: false` (no request logging).

### 2.9 What a conversation costs (estimate, for A3–A5)

| Item | Basis | Estimate |
|---|---|---|
| One 10-minute Live conversation (≈ 10 min of microphone in, ≈ 4 min of IO speaking) | Live audio in $3.00 / 1M tokens ≈ $0.005 per minute; audio out $12.00 / 1M ≈ $0.018 per minute *(pricing page snippet)* | **≈ $0.12** |
| One exchange on the turn path (learner speaks 10 s, IO answers 8 s) | STT on Flash: 320 audio tokens ≈ $0.0003; chat: ≈ 3,000 text tokens in / 100 out ≈ $0.003 (introductory $0.75 / $3.75 per 1M until 2026-12-31); TTS: 200 audio tokens ≈ $0.002–0.004 | ≈ $0.006–0.008; a 10-minute conversation of 20 exchanges **≈ $0.12–0.16** |
| Azure Giorgi instead of Gemini TTS | list prices not verified in Phase 0 | to be filled in Phase 1 |
| Monthly, at N conversations per day | N × ≈ $0.15 × 30 | 20/day ≈ $90; 100/day ≈ $450; 500/day ≈ $2,250 |
| Hard ceiling | Google Tier 1 stops spending at $10 per rolling 10 minutes (≈ 80 simultaneous conversations); the Worker's per-IP caps (A5) bound abuse | — |
| Cloudflare | Free plan covers ≈ 100,000 Worker requests/day; Paid $5/month only if daily caps on every route are wanted (D6) | $0–5 / month |

### 2.10 To re-read on the docs pages when they are reachable

The Live language table (Georgian as `ka`, and the valid transcription hint), the ephemeral-token
page's limitations, `gemini-3.5-transcribe`'s language list, free- and paid-tier limits for
`gemini-3.8-live`, the Gemini API TTS price, the retention clause of the Gemini API terms (for the
README), the Rate Limiting binding's plan availability, Chrome's Web Speech language list.

---

## 3. Architecture (as verified)

```
Browser (GitHub Pages, static)                             Cloudflare Worker (worker/)
┌────────────────────────────────────────────────┐          ┌──────────────────────────────────────┐
│ App.jsx ── ?voice=1|turn|live ── mode           │          │ POST /token  → <ver>/auth_tokens      │
│   static Talk button, T key, AudioContext unlock│          │   uses:1, expireTime +30 min,         │
│ IoHost.jsx  mode: host | talk                   │  fetch   │   newSessionExpireTime +60 s,         │
│   RobotCanvas → RobotModel (mouthLevel ref,     │◀────────▶│   bidiGenerateContentSetup + fieldMask│
│                 listening, tapReaction)         │          │   → { token, expiresAt, model, ver }  │
│   TranscriptPanel · VoiceDock · BoardPanel      │          │ POST /chat   → gemini-3.8-flash SSE,  │
│ src/voice/ (lazy chunk, self-contained)         │          │   request built here (D13), bytes     │
│   useIoVoice.js  state machine                  │ WebSocket│   forwarded untouched (D5)            │
│   session/LiveVoiceSession.js ──────────────────┼─────────▶│ POST /tts    → Gemini TTS | Azure     │
│   session/TurnVoiceSession.js                   │ (Gemini  │   PCM16 24 kHz stream                 │
│   audio/mic.js + mic-worklet.js (PCM16 16 kHz)  │  Live,   │ POST /stt    → Flash + inline WAV     │
│   audio/player.js (24 kHz queue + analyser)     │  direct) │ origin allowlist · CORS · burst       │
│   tutor/persona.js skills.js memory.js tools.js │          │ limits · KV daily cap · no logging    │
│   tutor/lookup.js ← public/io-index.json (D10)  │          │ bundles src/voice/tutor/* for persona │
└────────────────────────────────────────────────┘          └──────────────────────────────────────┘
```

Both sessions implement the brief's `VoiceSession` interface (`start`, `sendText`, `interrupt`,
`end`, `on`). `useIoVoice` owns exactly one session and is the only module that touches React
state; audio level reaches the model through a ref, never through state. The Worker imports the
tutor modules (`persona.js`, `tools.js` declarations, `ui.js` strings) at build time; `src/voice`
imports nothing from `worker/` or `App.jsx`.

---

## 4. File-by-file plan

### 4.1 Existing files on `IO-for-main-page`

Line numbers refer to the files on `IO-for-main-page` (`dc8a296`) and are for the implementer.

| File | Today | How it is touched | Phase |
|---|---|---|---|
| `README.md` | Rules: "host, not a teacher … no cyber-security tips" (13–16); embed contract and iframe snippet without `allow=` (128–143); query params (112–119); deploy gate to a repository named `IO-for-main-page` (155–160); privacy paragraph "Static site, no backend, no cookies, no analytics, no third-party requests … The only thing stored is the chosen language" (164–168). | Add a **"Talk to IO"** section and rewrite Privacy — full content in §5.8. Iframe snippet gains `allow="microphone; autoplay"`, a `voice=1` variant, the documented height for it, and its `title` gets the spaced em dash the page title already uses. Mood list: `surprised` is noted as a talk-mode face (host moods unchanged). `index.html:10` ("no third-party requests" comment) is reworded too. | 6; the privacy text ships with the first deployed phase that makes network calls (A11) |
| `src/App.jsx` | `params` memo (12); `embed` / `skin` (13–14); embed branch mounts `IoHost` alone (34–40); hero mounts `IoHost` + `.io-hint` (83–86); `PathCard` drives `io.current.hover/unhover/farewell` and lets the link navigate normally (115–148); language buttons (58–68); login URL hard-coded (70). | Parse `?voice` (`1` enables the dock in embed; `turn` / `live` / `stub` overrides the session). Render the static **Talk to IO** `<button>` under `.io-hint` (D11) and a `keydown` listener for `KeyT` (compared on `e.code`, since a Georgian layout reports `ტ`); both run the same handler, which **synchronously** creates and resumes one `AudioContext` (a 5-line helper in the initial chunk — the iOS unlock must happen inside the gesture, before any `await`), then `await import('./voice/VoiceDock.jsx')` (prefetched on `pointerenter`), then sets `mode='talk'`. Pass `mode`, the AudioContext, `lang`, the ref and `{ paths: { basic: { url }, kids: { url, newTab: true } }, loginUrl }` to the voice layer as props (so `src/voice` never imports `App.jsx`); hide `.io-hint` in talk mode; end and restart the session when `lang` changes; read `loginUrl` from `ui.js`. Host-mode tree otherwise unchanged. | 2, 3, 5 |
| `src/main.jsx`, `index.html`, `vite.config.js` | fonts; shell (`color-scheme: light`, viewport without `viewport-fit`); `base: '/IO-for-main-page/'`, no `rollupOptions`. | `main.jsx` untouched. `index.html`: reword the comment on line 10; `viewport-fit=cover` for the iPhone bottom sheet (B8). `vite.config.js` untouched unless Phase 6 measurements show the SDK needs `manualChunks` (every dynamic `import()` already becomes its own chunk). | 6 |
| `package.json` / lockfile | react 18.3.1, three 0.169.0, r3f 8.18.0, vite 5.4.21; scripts `dev build preview check`. | Add `@google/genai` 2.x (reachable only from the lazy chunk); scripts `check:voice`, `check:dist`, `smoke:voice`, `bakeoff`, `build:index`; `check` becomes `check-hints && check-voice`. No npm workspaces; `worker/` has its own `package.json`. | 1, 2 |
| `.github/workflows/deploy.yml` | push to `main` + gate `repository.name == 'IO-for-main-page'`, Node 20, `npm ci && npm run check && npm run build`, no `env:`. | Gate unchanged. Add `env:` with `VITE_IO_API_BASE`, `VITE_IO_VOICE_DEFAULT` from repository variables and `VITE_IO_SAFETY_REQUIRED: '1'` (without this a Pages build has no Worker URL and the safety gate never runs); add `npm run check:dist` after the build (key-pattern scan of `dist/`, initial-chunk size against §9). A separate `voice-ci.yml` (push to `io-voice`: the same steps plus `cd worker && npm ci && npx tsc --noEmit`) builds but deploys nothing. Verify Node 20 satisfies `wrangler` and `@google/genai` 2.x. | 1 |
| `.gitignore` | `node_modules/ dist/ *.local .env .env.* .DS_Store npm-debug.log*` — `.env.*` also hides `.env.example`. | Add `!.env.example`, `bakeoff/*` + `!bakeoff/README.md`, `worker/.dev.vars`, `worker/.dev.vars.*`, `!worker/.dev.vars.example`, `worker/.wrangler/`. | 1 |
| `src/mascot/IoHost.jsx` | Timers: greet + wave at 500 ms (0 in reduced motion), intro at 6500 ms (52–63), sleepy wake-up 2600 ms (48), unhover drift-back 1400 ms (97–101); typewriter 2 code points / 22 ms (113–131); `talking = shown < text` (133); `onTap → host.next()` (65–71); ref API `hover/unhover/farewell` (79–108); DOM `.io-bubble > p[aria-hidden] + span.sr-only[role=status][aria-live=polite][aria-atomic]` (137–144); props to `RobotCanvas` (145–155). | Add `mode = 'host'` and a `talk` prop bundle `{ emotion, gesture, mouthLevel, listening, label, panel, onInterrupt }`. In host mode every code path is unchanged. Entering talk: `clearLater()` (cancels intro / drift-back / sleepy timers), `hover/unhover` return early, `onTap` → `talk.onInterrupt()` before `host.next()` is reached, the bubble's content is replaced by `talk.panel` (a slot from App, so IoHost imports nothing from `src/voice`), `emotion/gesture/talking/label` come from `talk`, `mouthLevel/listening/tapReaction={false}` are forwarded. Leaving talk: `setGesture(null)`, clear hover bookkeeping, then the existing rule verbatim: `if (!lastCycled.current) lastCycled.current = host.intro(); say(lastCycled.current)`. `farewell()` keeps host semantics; `navigate_to_path` ends the session first. Mechanics in §5.1. | 2 |
| `src/mascot/hostBrain.js` | `MOOD` (11–28), `CYCLE` (33–44), `createHost` (57–92). | **Untouched.** | — |
| `src/mascot/RobotCanvas.jsx` | forwards unknown props to the model (56, 102); keyboard tap (73–79); `frameloop='demand'` in reduced motion (96); WebGL check and emoji fallback (25–52). | **No code change**: `mouthLevel`, `listening`, `tapReaction` flow through `...robotProps`; `label` already carries the talk-mode `aria-label`. When the WebGL fallback renders, talk mode still works (dock, captions, board); the three model props are no-ops there. | — |
| `src/mascot/RobotModel.jsx` | props (86–98); `anim` ref (110–120); tap reaction wave + `excited` overlay 1.8 s (179–186); gesture overlay 1.9 s (189–196); reduced-motion early return (200–203); LED pulse `0.6 + 0.4·sin(t·2.3 + i·0.9)` (311–313); **mouth line 340**; `handleTap` (350–355). | Three additive props: `mouthLevel` (ref or number), `listening`, `tapReaction = true`. Mouth: when a level is present `target = 0.15 + 0.6·level`, lightly smoothed into a new `anim.mouth`; otherwise the original line verbatim. Listening: `anim.listen` blends at `dt·4`; LEDs cross-fade to an in-phase breath (intensity only); `eyesWide: anim.listen` passed to `paintFace`. `tapReaction={false}` skips lines 181–185. Nothing runs under reduced motion. No geometry, material or colour changes. §5.2. | 2 |
| `src/mascot/faceTexture.js` | `drawFace(ctx, { emotion, blink, pupilX, pupilY, mouthOpen, noPlate, metal })` (174–312); `open = 1 - blink` (218); `faceKey` quantises to 1/24 (321–324); emotions incl. `surprised` (263). | Add optional `eyesWide = 0`: `open = (1 - blink) * (1 + 0.12 * eyesWide)` (capsule eyes only) and a trailing `|q(eyesWide)` in `faceKey` (required, else the cue paints late). Byte-identical output when `eyesWide === 0`. | 2 |
| `src/content/hints.js` | host lines, rules in the header comment (6–16). | **Untouched.** The voice layer imports `HINTS` for platform facts (§5.7) and uses six lines for the bake-off (§6.2). | — |
| `src/i18n/ui.js` | `UI.ka/en`, `LANGS`, `initialLang()` (83–93). | Add `voice.*` strings (§6.1) in both languages and a `loginUrl` (today hard-coded in `App.jsx:70`); `initialLang()` untouched; `src/voice/i18n.js` re-exports them. | 2 |
| `src/styles/global.css` | tokens (6–31); `.io-host` (263–268); `.io-bubble` incl. `[data-empty]` and the down-pointing tail (289–324); `.io-hint` (326–330); `.hero-io` sticky (248–255); embed (489–498); reduced motion kills every animation/transition (511–518). | One appended block of ≈ 10 lines for the static `.io-talk` button (D11) — the only host-mode change, reviewed by diff. All other new rules live in `src/voice/voice.css`, imported by the lazy chunk, scoped by `.io-host[data-mode="talk"]` and `.voice-*`. §5.3. | 2 |
| `scripts/check-hints.mjs` | checks `HINTS` only: required keys, ≤ 110 chars, ≤ 1 emoji, tip words (except `basicCourse`), Latin leak with allowlist `English|CyberHero|IO|DGA|elearning.gov.ge`, `" - "` as dash, `„…“` balance; exports nothing and exits at top level. | **Refactored, behaviour identical:** the regexes move to `scripts/lib/lint.mjs` (`lintPair()`), which `check-hints.mjs` and the new `scripts/check-voice.mjs` both import. `check-voice.mjs` is described in §6.3. | 6 (scaffold in 2) |

### 4.2 Files taken from other branches

| Source (`git show <ref>:<path>`) | Used for | Notes |
|---|---|---|
| `origin/io-chat-gemini:src/chat/llmClient.js` | `src/voice/session/geminiSse.js` — the SSE parser (buffer split on `\n`, partial-line carry, `data:` lines, `candidates[0].content.parts[]`, `finishReason === 'SAFETY'` / `promptFeedback.blockReason`) | Fixes while porting: parse the leftover buffer after `done`, surface `finishReason` (`STOP`, `MAX_TOKENS`, `SAFETY`) as a terminal event instead of discarding streamed text, extract `parts[].functionCall`. **Not** ported: `getApiKey()`, the `?key=` query parameter, `localStorage` key handling. |
| `origin/io-chat-gemini:src/chat/useIoChat.js` | `TurnVoiceSession` — message shape `{ role, content, sources? }`, `history.slice(-8)`, the generation counter for superseded sends, `AbortController` | As a plain class, not a hook. `busy` no longer drops input: a new utterance interrupts first. The window is normalised so `contents` starts with `user` and alternates. |
| `origin/io-chat-gemini:src/mascot/ioBrain.js` (CyberHero corpus builder + retrieval) and `origin/claude/mascot-robot-demo-9oclw8:src/mascot/ioBrain.js` (Basic Course corpus builder) | `scripts/build-io-index.mjs` uses the first builder for missions / guides / tips and the second for the course; `tutor/lookup.js` ports the retrieval (`tokens()` = `/[a-z0-9]+|[ა-ჰ]+/g`, stop list, prefix stemming, term-overlap scoring) | Measured weaknesses: no length normalisation (long chunks win), substring matches, 2-char stem; „რა არის ფიშინგი?“ ranks a Passwords chunk first on the course corpus. Ported with BM25-style weighting, a section-title boost and a synonym map: `ორმაგი ავთენტიფიკაცია ↔ ორფაქტორიანი ↔ მრავალფაქტორიანი ↔ 2FA`, `ფიშინგი ↔ phishing`, `დეზინფორმაცია ↔ ყალბი ამბები`, `დიპფეიკი ↔ deepfake` (the course's own term for two-factor is „ორმაგი ავთენტიფიკაცია“, ≈ 20 occurrences). |
| `origin/claude/mascot-robot-demo-9oclw8:src/content/ioCourse.js` (299.7 KB, 48.9 KB gz) | Basic Cybersecurity Course text (elearning.gov.ge course 18): 11 sections (intro, 9 topics, AI chapter), 223 chunks, Georgian only | The course's own facts match `hints.js` (3 hours, 100 questions, 70 to pass, 3 attempts). Generated file — never hand-edited; refresh procedure in that branch's `docs/io-chatbot.md`. |
| `origin/main:src/content/guardians/*`, `parents/*`, `mascot.js` (≈ 690 KB, 171 KB gz; `main` has the proofread versions) | CyberHero missions, parents' guides, IO tips → 330 bilingual chunks (112 mission, 196 guide, 22 tip) | Only read by the index build script; never imported by the site. |
| `origin/io-chat-gemini:docs/io-chatbot.md` and the demo branch's `ioBrain.js` persona | persona rules already agreed: language mirroring; ground on platform content and recommend the mission/guide by name; never ask for or store personal data; refuse hacking ("you defend, not attack"); do not invent features, prices or contacts; honest refusal „ეს კურსში არ არის განხილული“; the native-Georgian quality clause | Folded into `tutor/persona.js` — **except** the "call 112" line: no number or organisation name is typed into the persona (the brief's rule; §5.7). All existing chat strings are in the შენ register with hyphen dashes — rewritten, not reused. |

### 4.3 New files

```
src/voice/
  VoiceDock.jsx                Talk button state ring, text input, End, mute, Delete my data, mic-open indicator
  TranscriptPanel.jsx          talk-mode bubble content: last two turns, live caption, own aria-live region; bottom sheet ≤ 900 px
  BoardPanel.jsx               steps / checklist / diagram / link cards and the quiz card
  diagrams/{phishing_email,password_strength,two_factor_flow}.jsx   inline SVG, KA/EN labels
  voice.css                    every new rule, scoped (.io-host[data-mode="talk"], .voice-*)
  i18n.js                      re-exports ui.js voice.* (keeps src/voice free of App.jsx imports)
  useIoVoice.js                state machine: one VoiceSession, events → IoHost props, Esc handling
  session/VoiceSession.js      the interface (JSDoc typedefs) + shared helpers
  session/LiveVoiceSession.js  Gemini Live over WebSocket with an ephemeral token
  session/TurnVoiceSession.js  STT → /chat (SSE) → /tts (sentence-chunked)
  session/StubVoiceSession.js  plays a bundled WAV — Phase 2 acceptance harness (?voice=stub in dev)
  session/geminiSse.js         the ported SSE parser (text + functionCall + finishReason)
  audio/mic.js                 getUserMedia + AudioWorklet → 100 ms PCM16 16 kHz chunks + input level + WAV builder
  audio/mic-worklet.js         AudioWorkletProcessor (Float32 → Int16, resample to 16 kHz); plain JS, no imports
  audio/player.js              24 kHz PCM16 queue → gap-free AudioBuffers → Gain → Analyser; level() (60 ms attack / 120 ms release), flush()
  tutor/persona.js             buildSystemInstruction({ lang, learner, page, mode }) — no numbers, no hotlines
  tutor/skills.js              13–14 skills { id, ka, en, courseRef }
  tutor/memory.js              localStorage['io.learner.v1'] with an in-memory fallback: record(), summarise(), forget()
  tutor/tools.js               the 7 declarations exactly as the brief's Phase 5 (shared with the Worker) + browser handlers
  tutor/strings.js             scripted talk-mode lines (spoken greeting, 90 s goodbye, mic-denied), KA/EN, linted
  tutor/lookup.js              lookup(query, lang) over public/io-index.json (lazy fetch, cached)
src/content/safety.js          KA/EN resources with placeholders the DGA team fills in (checked by check-voice)
public/io-index.json           generated by scripts/build-io-index.mjs and committed (A6)
worker/
  package.json  tsconfig.json  wrangler.jsonc  .dev.vars.example  README.md
  src/index.ts                 router, origin allowlist, CORS, burst limits, no-store, no body logging
  src/config.ts                reads wrangler vars: models, API version, voice, TTS provider, limits, allowed origins
  src/routes/{token,chat,tts,stt}.ts
  src/tts/{types,gemini,azure}.ts   synthesize({ text, lang, voice }) → ReadableStream<PCM16 24 kHz>
  src/limits.ts                rate-limit bindings + KV daily counter
  src/text.ts                  strip emoji/markdown/audio tags, sentence split, SSML escaping
  src/tutor.ts                 imports ../../src/voice/tutor/persona.js, tools.js (declarations) and ../../src/i18n/ui.js
scripts/
  lib/lint.mjs  check-voice.mjs  check-dist.mjs  voice-smoke.mjs  voice-bakeoff.mjs  build-io-index.mjs
bakeoff/README.md              rating sheet + decision block (audio files gitignored)
docs/
  io-voice-build-prompt.md  io-voice-plan.md (this file)  io-voice-test-script.md (Phase 5)
.env.example                   see §5.9
```

### 4.4 Grounding content (D10)

`scripts/build-io-index.mjs` reads the content files straight from git
(`git show origin/claude/mascot-robot-demo-9oclw8:src/content/ioCourse.js` and
`origin/main:src/content/{guardians,parents,mascot}`), builds the chunks with the two existing
builders, tags each chunk `{ source: 'basic'|'mission'|'guide'|'tip', ref, title, en, ka }` and writes
`public/io-index.json` (measured: 805 KB raw, **162 KB gzipped** for both corpora; 49 KB gzipped for the
course alone). `tutor/lookup.js` fetches it on the first `lookup()` (never on page load), scores
client-side and returns the top 3 as text. There is no Worker round-trip: on the Live path the query
arrives from Google as a tool argument and the top-3 text goes back to Google in the tool response.
The same JSON can back a Worker `/lookup` route later without code changes in `src/voice`.
**Consequence for the team (A6):** the full course text becomes a downloadable file on a public site.

---

## 5. Design details agreed in Phase 0

### 5.1 `IoHost` talk mode (Phase 2)

- `mode` is mirrored into a ref so timer callbacks read the current mode; on entering talk mode
  `clearLater()` runs and each callback additionally returns early in talk mode.
- The `.io-bubble` element is **kept mounted** in talk mode with the transcript rendered inside it at
  a **fixed height** (104 px = the three-line host bubble; `clamp(104px, 20vh, 144px)` if two full
  turns must fit), scrollable, so IO does not move while captions stream. The one-time change from a
  shorter host bubble happens on the visitor's own click and is transitioned (auto-disabled under
  reduced motion). Re-mounting the bubble would replay the `rise` animation.
- The host `role="status"` span is `aria-atomic`; the transcript uses its **own** `aria-live="polite"`
  region and appends completed sentences, not tokens.
- Gesture ids from the voice layer are string-namespaced (`'v12'`) so they never collide with the
  host counter; `setGesture(null)` on both mode transitions.
- Emotion while speaking must be a mouth-responsive face (`happy` or `wink`); `thinking`, `surprised`,
  `sleepy`, `sad` draw a fixed mouth and `excited`/`celebrate`/`funny` floor it at 0.55–0.75. Gesture
  overlays show `excited` for 1.9 s after a wave/bounce — accepted (that is how IO waves today).
- If *Talk* is pressed before the 500 ms greeting fires, the greeting is skipped; on leaving talk mode
  the intro rule above applies (B12). Language switch mid-talk: App ends the session and starts a new
  one in the new language.
- `aria-label` of the canvas in talk mode is state-neutral (`voice.ioLabelTalk`, §6.1).

### 5.2 The model's mouth and the listening cue (Phase 2)

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

The level itself is smoothed in `player.level()` (≈ 60 ms attack / 120 ms release, as the brief
specifies); the lerp above is the brief's "lightly smoothed". `useIoVoice` sets the ref to `null`
outside `speaking` so the mouth closes fully (a level of 0 would leave it ajar at 0.15). Cost: the
512 px face already repaints ≈ 30 times/s during the typewriter; the level path is similar and may be
quantised to 1/16 without touching host mode.

Listening cue: `anim.listen` blends toward `listening ? 1 : 0` at `dt·4`; LEDs (`ledMats`, both
skins) cross-fade `(0.6 + 0.4·sin(t·2.3 + i·0.9))·(1−l) + (0.85 + 0.45·sin(t·5))·l` (identical at
`l = 0`); eyes 12 % taller via `eyesWide`. `tapReaction={false}` in talk mode disables the built-in
tap wave/overlay so the 400 ms `surprised` overlay on interruption is visible. Under reduced motion
none of this runs (the early return at 200–203 precedes it and `paintFace` is called without
`eyesWide`).

### 5.3 Layout and CSS (Phase 2, 5, 6)

- Host mode: the static *Talk to IO* button sits under `.io-hint` in `.hero-io` (a centred flex
  column: nothing above it moves) and in `.embed-stage` only with `?voice=1`. Its ≈ 10 lines of CSS are
  appended to `global.css` (D11) using the `.path-cta` recipe (`--blue` on white, 7.25:1).
- Desktop talk mode: transcript in the bubble slot (fixed height); `VoiceDock` and `BoardPanel`
  **after** the canvas inside `.io-host` (a top-aligned flex column — additions below never move IO);
  everything `max-width: 360px` to match the bubble; the `.hero-io` sticky column may exceed short
  viewports and then simply scrolls.
- ≤ 900 px: dock + transcript + board as a `position: fixed` bottom sheet (`z-index: 90`, under the
  skip link's 100), collapsed ≈ 64 px / expanded ≤ 45 vh, internal scroll, `env(safe-area-inset-bottom)`.
  Never a descendant of `.io-canvas` (its `filter` would trap `fixed` elements).
- Embed (`?embed=1&voice=1`): `.embed-stage` grid-centres IO, so the dock is `position: fixed; bottom: 0`
  and captions stay in the fixed-height bubble; the README documents **520 px** as the minimum iframe
  height with `voice=1` (260 px IO + 104 px bubble + paddings + the dock; confirmed in Phase 6) and keeps
  460 px for embeds without it, which render pixel-identical.
- Colours: buttons `--blue` on white (7.25:1), hover `--blue-2` (4.57:1); coral only for the
  **listening ring / outline** and never for text (white on coral is 3.33:1); quiz results carry an
  icon and text, not colour alone; `--line` borders (1.26:1) are never the only affordance. Font weights
  400/600/700/800 only (those are the shipped `@fontsource` files). Inputs ≥ 16 px (iOS zoom).
- Two indicators, both visible: the **state ring** on the button (idle / connecting / listening /
  thinking / speaking) and a **microphone-open indicator** (coral dot + `role="status"` text) bound to
  the `MediaStreamTrack` state — on the Live path the mic stays open through `thinking` and
  `speaking`, and the brief requires the indicator "whenever the mic is open". Both are static under
  reduced motion.
- Keyboard: `T` toggles talking (`e.code === 'KeyT'`, also from host mode), `Esc` interrupts; both
  ignored while typing in the text input.
- `navigate_to_path` highlights the card with `data-io-highlight` rules that duplicate the `:hover`
  declarations (no edits to `.path-card`), plays `farewell()` after ending the session and switching to
  host mode, waits ≈ 1.9 s (≈ 1 s in reduced motion), then follows the link; `window.open` for the kids
  card may be blocked because a tool call is not a user gesture → fall back to a `link` card the
  learner clicks. In embed mode the iframe cannot navigate the top page; always show the link card there.

### 5.4 Worker (Phase 1)

- `wrangler.jsonc`: `vars` for `GEMINI_API_VERSION`, `LIVE_MODEL`, `LIVE_MODEL_FALLBACK`,
  `CHAT_MODEL`, `TTS_MODEL`, `STT_MODEL`, `TTS_PROVIDER` (`gemini` | `azure`), `VOICE_NAME`,
  `ALLOWED_ORIGINS`; `ratelimits` (`RL_TOKEN` 5/60 s, `RL_CHAT` 30/60 s, `RL_TTS` 60/60 s, `RL_STT`
  30/60 s per IP); one KV namespace `IO_RL` for the per-day counter on `/token`
  (`rl:token:<utc-day>:<ip>`, absolute `expiration` at the next midnight + 120 s, written via
  `ctx.waitUntil`, KV 429s swallowed). Daily caps for the other routes sit behind the same
  `checkDaily()` and are enabled by config on Workers Paid (A4). Secrets: `GEMINI_API_KEY`,
  `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `TURNSTILE_SECRET`.
- Allowed origins: `https://tinatinzhorzholianidga.github.io`, `https://elearning.gov.ge`,
  `http://localhost:5173` (plus the `wrangler dev` origin for the smoke script).
- Order per request: `Origin` allowlist (403 before any budget is spent) → `OPTIONS` 204 → burst limit
  → daily cap → route. Errors are JSON `{ error: { code, ka, en } }`; the Georgian/English text is
  imported from `src/i18n/ui.js` (`voice.err*`) at build time — one source, no copy step.
  `Cache-Control: no-store` everywhere; `observability.enabled: false`; never `console.log` a body.
  The Worker keeps the visitor's IP in KV keys for one day (rate limiting) and nothing else — the
  README says so.
- `/token`: body `{ lang, page }` — the learner summary never reaches the Worker on the Live path; it
  travels only in the hidden `session_started` turn (browser → Google). Mints as in §2.2 with the
  system instruction and tool declarations from the bundled `src/voice/tutor` modules; returns
  `{ token, expiresAt, model, apiVersion, voice }` so the browser holds no model constants. Optional
  Turnstile check when `TURNSTILE_SECRET` is set.
- `/chat` (D13): body `{ lang, learner, history[≤ 8 items, each { role, parts }] , grounding[≤ 3] }`;
  the Worker builds the Gemini request itself (persona with the learner summary, tools,
  `generationConfig { temperature: 0.6, maxOutputTokens: 400 }`, explicit `safetySettings` — A9),
  calls `models/<CHAT_MODEL>:streamGenerateContent?alt=sse` with `x-goog-api-key`, and returns
  `upstream.body` untouched as `text/event-stream` (D5). History items may carry `functionCall` /
  `functionResponse` parts (§5.6). The 30 s abort covers connect + headers only.
- `/tts`: `{ text, lang, voice }` → adapter (`TTS_PROVIDER`) → PCM16 24 kHz stream; emoji, markdown
  and audio tags stripped first. Gemini adapter streams `streamGenerateContent` audio parts; Azure
  adapter streams `raw-24khz-16bit-mono-pcm` with the required `User-Agent`.
- `/stt`: WAV body (≤ 60 s, ≤ 2 MB) + `lang` → Flash with an inline `audio/wav` part and
  "Transcribe verbatim in <language>; output only the transcript" → `{ text }`.
- `worker/README.md`: secrets, `.dev.vars`, `wrangler dev`, deploy, changing limits, custom domain,
  who holds the account (A4).
- `scripts/voice-smoke.mjs`: mints a token first on both API versions (catches the `AQ.` key issue
  and settles D4), connects a Live socket once with and once without a `fieldMask` sub-path and once
  after 60 s with a handle (B1), then hits all routes and prints status + latency.
- `scripts/voice-bakeoff.mjs` and `bakeoff/README.md`: §6.2.

### 5.5 `LiveVoiceSession` (Phase 3)

`POST /token` → `new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion } })` →
`ai.live.connect({ model, config: { responseModalities: ['AUDIO'], sessionResumption: { handle } }, callbacks })`
wrapped in a 10 s timeout (everything else is locked in the token; the token's `fieldMask` decides
what the client's config may add). `connect()` resolving means setup is complete →
`sendClientContent` with the hidden `session_started { lang, page: 'welcome', learner }` turn. Then,
per the rows of §2.3: mic chunks → `sendRealtimeInput({ audio })`; typed questions →
`sendRealtimeInput({ text })`; audio parts → player; `interrupted` → flush; transcriptions →
captions; `toolCall` → handlers → `sendToolResponse` immediately; `toolCallCancellation` → cancel;
`sessionResumptionUpdate` → store the handle; `goAway` or an unexpected `onclose` → reconnect with
the handle; `thinking` has a timeout (proactive audio); 90 s of silence → the client sends a nudge
("the learner has been silent for 90 seconds; say goodbye and call `end_session`"); tab hidden > 30 s
→ `audioStreamEnd: true` and a visible paused state; a provisional session record is written on
`pagehide` so a refresh without *End* still yields the returning-learner greeting. Tool behaviours:
`set_mood`, `show_card`, `record_skill` NON_BLOCKING + `SILENT`; `lookup_course_material` BLOCKING;
`ask_quiz` NON_BLOCKING with `willContinue` and the learner's answer as a second response with
`INTERRUPT`; `navigate_to_path`, `end_session` BLOCKING. Failure paths → typed KA/EN messages; after
one failed retry fall back to `TurnVoiceSession`. Headphones for testing (self-interruption through
speakers is a known effect; `echoCancellation: true` is on).

### 5.6 `TurnVoiceSession` (Phase 4)

STT: Chrome/Edge/Android → `webkitSpeechRecognition` (`lang 'ka-GE'|'en-US'`, `interimResults`,
`continuous: false`); on `language-not-supported` / `service-not-allowed` / `network` → upload
fallback; Safari and Firefox → upload fallback directly (WAV from the worklet's PCM16, `POST /stt`).
Push-to-talk: press to start, press again to stop; holding also works (D15); the state label says so.
LLM: `/chat` with the 8-turn window and top-3 grounding from `lookup()`. Tool loop: history items are
`{ role: 'model', parts: [{ functionCall }] }` / `{ role: 'user', parts: [{ functionResponse }] }`; a
function-call part ends the sentence stream, the browser runs the handler and issues a second `/chat`
call to continue; `set_mood` / `show_card` do not pause TTS. TTS: sentence split on `. ! ? …`, `/tts`
per sentence as soon as it closes, played in order; time-to-first-audio printed in the dev console.
Interrupt = abort fetches + `player.flush()`, keeping the transcript (last IO turn marked interrupted).

### 5.7 Tutor brain (Phase 5)

- `persona.js`: the brief's identity, spoken style (≤ 2 sentences / ~35 words, no lists/markdown/emoji,
  Georgian names, numbers as words when small), Socratic rules and the KA/EN example exchange, scope and
  refusal, platform facts **imported** from `HINTS.basicCourse/kidsPlatform/certificate/login/aboutDga/language/pickPath[i][lang]`
  and `UI[lang].basic.url`, `.kids.url`, `.kids.chips[0]` ("10 missions" lives only there),
  `UI.loginUrl`; the safety block (never ask for personal data; bullying / blackmail / strangers →
  calm, not their fault, tell a trusted adult now, **read the resources from `safety.js[lang]`**;
  never role-play; refuse hacking and pivot to defence); memory etiquette; "offer practice on the two
  weakest skills first". **No telephone number, hotline or organisation name is typed into
  `persona.js`**; `check-voice.mjs` fails if it contains three or more consecutive digits. (112 is
  already published in the CyberHero missions; the DGA team may enter it in `safety.js`.) The course
  text is Georgian-only, so the instruction says material may be in Georgian and the answer follows the
  learner's language; the course's term „ორმაგი ავთენტიფიკაცია“ is used for two-factor.
- `skills.js` (13, A13 for a 14th): `passwords`, `two_factor`, `phishing`, `scams`,
  `social_engineering`, `privacy_settings`, `cyberbullying`, `safe_browsing`, `device_security`,
  `backups`, `disinformation`, `ai_threats`, `incident_reporting`, each
  `{ id, ka, en, courseRef: { basic: [section ids], mission: [g-ids], guide?: [a-ids] } }`. Mastery 0–3.
- `memory.js`: the brief's schema; ≤ 10 sessions; `summarise()` ≤ 300 chars and lists the two
  lowest-mastery skills; `forget()` wired to *Delete my data* and leaves `io.lang` (a UI preference)
  untouched; first name only if volunteered; every `localStorage` access wrapped in try/catch with an
  in-memory fallback (the Moodle iframe is cross-site and browsers partition or block storage there —
  the README says memory may not persist inside Moodle).
- `tools.js`: the seven declarations **exactly as the brief's Phase 5 lists them** (`set_mood(mood)`,
  `show_card({ kind, title, items?, diagram?, url? })`, `ask_quiz({ scenario, options[3], correctIndex, skill })`,
  `record_skill({ skill, level, evidence })`, `lookup_course_material({ query, lang })`,
  `navigate_to_path({ path })`, `end_session({ summary_ka, summary_en, skills })`); handlers
  browser-side. A quiz answered **by click** goes back as a tool response with the option index; a
  quiz answered **by voice** is graded by the model from the transcript (no tool response needed) and
  the card is updated from the model's next `record_skill` call.
- `docs/io-voice-test-script.md`: the 6-turn KA/EN script from the brief's Phase 5 acceptance.

### 5.8 README text to add (Phase 6, draft; privacy paragraph ships with the first deployment)

**Talk to IO** section: what talk mode is and how it starts (button, `T`, typed question after the
dock opens); browsers (Chrome, Edge, Safari 14.1+/iOS 14.5+, Android Chrome; Firefox uses the typed
path with the upload fallback); **what is sent where** — on the Live path the microphone audio goes
straight from the browser to Google's Live API using a one-use token minted by the Worker, together
with the last turns and a ≤ 300-character learner summary (first name only if the learner gave it);
on the typed/fallback path the learner's speech is transcribed by the browser's own speech service
(Google's servers on Chrome/Edge/Android) or uploaded as a short audio clip to the Worker, which
forwards it to Google; the text of the last eight turns and the learner summary go to the Worker and
on to Google; speech synthesis text goes to the Worker and on to Google or Microsoft (whichever voice
was chosen); **what is stored** — IO and the Worker keep no recordings; Google processes audio and
text under the Gemini API terms (retention only for abuse monitoring per those terms — the exact
clause is quoted after it is re-read, §2.10); the Worker keeps the visitor's IP address in a
rate-limit counter for one day and logs no request bodies; the transcript and the learner profile
stay in the visitor's browser (`localStorage['io.learner.v1']`, may not persist inside Moodle);
**how to delete it** (*Delete my data*); Worker setup; the per-IP limits and the cost of a
conversation (§2.9); keyboard shortcuts; the embed snippet with `allow="microphone; autoplay"` and
the 520 px height. **Privacy paragraph:** still no cookies and no analytics; fonts are still bundled,
not fetched from Google; in talk mode only, the page calls the Worker and, on the Live path, Google's
Live API directly; if Turnstile is enabled, a Cloudflare script is loaded on the page.

### 5.9 Configuration

```
# .env.example (public values only — every VITE_ variable is inlined into the bundle)
VITE_IO_API_BASE=https://io-voice.<account>.workers.dev
VITE_IO_VOICE_DEFAULT=live          # live | turn | ka=turn,en=live   (set after Gate G1)
VITE_IO_TTS=gemini                  # informational label for the turn-path UI; the Worker's TTS_PROVIDER decides
VITE_IO_VOICE_NAME=Charon           # informational label; the Worker's VOICE_NAME decides
VITE_IO_SAFETY_REQUIRED=0           # CI sets 1: build fails while safety.js still has placeholders

# worker/.dev.vars.example (copy to worker/.dev.vars; never commit .dev.vars)
GEMINI_API_KEY="AIza…"
AZURE_SPEECH_KEY=""
AZURE_SPEECH_REGION=""
TURNSTILE_SECRET=""                 # empty = Turnstile off; "1x0000000000000000000000000000000AA" = always-pass test secret
# non-secret values live in wrangler.jsonc "vars": GEMINI_API_VERSION, LIVE_MODEL, LIVE_MODEL_FALLBACK,
# CHAT_MODEL, TTS_MODEL, STT_MODEL, TTS_PROVIDER, VOICE_NAME, ALLOWED_ORIGINS, DAILY_LIMITS
```

The Pages workflow sets `VITE_IO_API_BASE` and `VITE_IO_VOICE_DEFAULT` from repository variables and
`VITE_IO_SAFETY_REQUIRED=1` (§4.1). The browser receives the Live model, API version and voice from
`/token`, so per-model values exist in one place only.

---

## 6. Georgian strings and the bake-off lines

Rules every new UI string follows (from `hints.js` and `check-hints.mjs`): თქვენ register, ≤ 110
characters per language, no emoji in UI strings, spaced em dash " — " (never " - "), ranges with a
hyphen (`13-18`), Georgian quotes „…“ (U+201E / U+201C), ellipsis as `…` never `...`, no Latin letters
in Georgian beyond the allow-listed brand words (the list gains `Google`, `Esc`, `Chrome`, `Safari`
where needed — B13), no cyber tips in host-mode strings. Button labels in `ui.js` are nominal
(`კურსის დაწყება`, `კიბერგმირზე გადასვლა`); imperatives are used for placeholders and hints. IO's
spoken answers (≤ 2 sentences, ≈ 35 words) are exempt from the 110-character limit and scroll in the
transcript. All strings get one native review before Phase 6 (A12).

### 6.1 The `voice.*` strings (brief's wording checked; changes are D16)

| Key | Georgian | English | Note |
|---|---|---|---|
| `voice.talk` | `იოსთან საუბარი` (brief: `ესაუბრეთ იოს`) | Talk to IO | brief's form is correct but imperative; nominal matches the page's buttons (B9) |
| `voice.connecting` | `კავშირი მყარდება…` | Connecting… | new |
| `voice.listening` | `იო გისმენთ…` | IO is listening… | keep; the `aria` state label omits the ellipsis |
| `voice.thinking` | `იო ფიქრობს…` | IO is thinking… | keep |
| `voice.speaking` | `იო საუბრობს` | IO is speaking | keep |
| `voice.micOn` | `მიკროფონი ჩართულია` | Microphone on | new — the mic-open indicator |
| `voice.mute` / `voice.unmute` | `მიკროფონის გამორთვა` / `მიკროფონის ჩართვა` | Mute / Unmute | new |
| `voice.pushToTalk` | `დააწკაპუნეთ და ისაუბრეთ` | Click, speak, click again | new; matches D15 and the page's verb „დააწკაპუნეთ“ |
| `voice.typePlaceholder` | `დაწერეთ კითხვა` | Type a question | keep |
| `voice.end` | `საუბრის დასრულება` | End the conversation | EN gains the article, like `Start the course` |
| `voice.deleteData` | `ჩემი მონაცემების წაშლა` (brief: `წაშალეთ ჩემი მონაცემები`) | Delete my data | brief's form is grammatical but imperative; nominal like the page's buttons |
| `voice.deleteConfirm` | `წავშალოთ იოს მეხსიერება თქვენს შესახებ?` | Delete what IO remembers about you? | new |
| `voice.noMic` | `მიკროფონზე წვდომა არ არის. შეგიძლიათ კითხვა დაწეროთ.` | No microphone access. You can type your question instead. | keep |
| `voice.privacy` | `იო ხმის ჩანაწერებს არ ინახავს — ხმას Google ამუშავებს. საუბრის ტექსტი მხოლოდ თქვენს ბრაუზერში ინახება.` (brief: `იო არ ინახავს ხმის ჩანაწერებს. საუბრის ტექსტი მხოლოდ თქვენს ბრაუზერში რჩება.`) | IO keeps no recordings — your voice is processed by Google. The chat text is stored only in your browser. | the brief's line was silent about Google processing the voice; a government site cannot ship that |
| `voice.errSocket` | `ხმოვანი კავშირი ვერ დამყარდა. შეგიძლიათ კითხვა დაწეროთ.` | Voice connection failed. You can type your question instead. | new |
| `voice.errRateLimit` | `დღეისთვის საუბრის ლიმიტი ამოიწურა. ხვალ ისევ შევხვდებით.` | Today's conversation limit is used up. See you again tomorrow. | new; returned by the Worker's 429 |
| `voice.errOrigin`, `voice.errTimeout`, `voice.errSafety`, `voice.errEmpty` | drafted in Phase 2 (rewritten from the chat branch in თქვენ) | | |
| `voice.ioLabelTalk` | `იო, თქვენი გზამკვლევი — დააწკაპუნეთ, რომ საუბარი შეაჩეროთ` | IO, your guide — press to interrupt him | state-neutral, so it is never false when read on focus |
| `voice.ioHintTalk` | `ესაუბრეთ იოს ან დაწერეთ კითხვა` | Speak to IO or type a question | replaces the "click IO" hint in talk mode |

The Phase 5 example lines in the brief are grammatically sound and in register. The memory example
becomes a complete, idiomatic sentence in the persona:
„წინა ჯერზე ფიშინგზე ვისაუბრეთ — იქიდანვე გავაგრძელოთ?“
The scripted talk-mode lines (spoken greeting on entering talk mode, the 90 s goodbye, the
mic-denied line) live in `src/voice/tutor/strings.js` and are linted by the same rules (B10).

### 6.2 The six bake-off lines (exact `hints.js` text; emoji stripped before synthesis)

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

**Candidates** (A7): Gemini TTS Charon, Puck, Orus, Achird, Iapetus, Umbriel (Fenrir and Sadaltager as
extras); Azure Giorgi and Eka; the Live model's own voice (`gemini-3.8-live`, each candidate voice
name) produced by a short Live session that is asked to read each line verbatim, with the output
transcription used to confirm it did. Gemini lines are synthesised twice, with and without the
language named in the prompt (D17). Files: `bakeoff/<voice>-<n>.wav`, 24 kHz 16-bit mono.
`bakeoff/README.md` has one row per voice and line with columns naturalness, pronunciation of
ქ/ყ/წ/ჭ/ღ, pace, warmth (1–5 each) and comments, and a **Decision** block for G1(a) the voice and
G1(b) "Live's Georgian is good enough: yes / no", filled in by the team and copied into §10.

### 6.3 What `check-voice.mjs` adds (Phase 6, scaffolded in Phase 2)

Uses `scripts/lib/lint.mjs` (the regexes moved out of `check-hints.mjs`, behaviour identical); walks
`UI.ka`/`UI.en` for key and array-length parity (absent today); applies the 110-character limit and
the Latin rule to `voice.*` and `tutor/strings.js` only (existing `ui.js` descriptions already exceed
110 and URLs are Latin by design); scopes `TIP_WORDS` to `HINTS`; never runs the emoji rule over the
synonym map (its `↔` arrows match the emoji class); forbids `...`; checks `safety.js` placeholders
(fail when `VITE_IO_SAFETY_REQUIRED=1`), `persona.js` for digits, tool declarations against a
JSON-schema subset, quiz skill ids, and a handful of retrieval queries. `check-dist.mjs` runs after
the build: key patterns in `dist/`, initial-chunk size against §9. New checks are **errors** (today
only the dash and quote rules fail CI; length, emoji, Latin and tip words are warnings). Everything
they import stays plain ESM with no JSX and no `import.meta.env` at module scope.

---

## 7. Phases, acceptance, gates

Each phase ends with a commit on `io-voice`, a report of what was built and what is uncertain, and a
wait for the go-ahead (brief §4).

| Phase | Builds | Acceptance (brief) | Gate |
|---|---|---|---|
| 0 | this plan, `docs/io-voice-build-prompt.md`, branch re-pointed | plan committed, models verified, questions listed | **go-ahead + answers to A1–A8** |
| 1 | `worker/`, `.env.example`, `.gitignore`, `voice-smoke.mjs`, `voice-bakeoff.mjs`, `bakeoff/README.md`, `voice-ci.yml`, deploy `env:` | `wrangler dev` serves 4 routes; smoke green (token mint first, both API versions); 403 on bad origin; 429 with KA/EN body; bake-off folder produced | **G1 (human): voice + is Live's Georgian good enough?** — recorded in `bakeoff/README.md` and here |
| 2 | mic, worklet, player, `mouthLevel`/`listening`/`tapReaction`, `eyesWide`, IoHost talk mode, static button + `T`, `VoiceDock`, `TranscriptPanel`, `voice.css`, `useIoVoice`, stub session, `voice.*` strings, `check-voice.mjs` scaffold | mouth follows a local WAV; ring follows the mic; click/Esc cut audio instantly; reduced motion OK; host click cycle untouched; `global.css` diff is the button block only | go-ahead |
| 3 | `LiveVoiceSession`, `session_started`, resumption, idle/hidden handling, failure paths | fresh load → Talk → wave + Georgian greeting; KA question → KA spoken answer with captions; barge-in ≤ 300 ms; EN session; returning-learner greeting | go-ahead |
| 4 | `TurnVoiceSession`, `geminiSse.js`, STT paths, sentence-chunked TTS, tool loop | `?voice=turn` works end-to-end in Chrome and Safari; first audio ≤ 3 s | go-ahead |
| 5 | persona, skills, memory, tools, board cards, quiz, diagrams, `safety.js`, `build-io-index.mjs`, test script | 6-turn script passes; reload greeting; delete resets; off-topic and "hack my friend" refused | go-ahead |
| 6 | a11y (accessibility) and mobile passes, embed test in an iframe with `allow="microphone; autoplay"` (plus the real Moodle page if the admins can add the attribute), `check-dist.mjs`, README, latency numbers | definition of done | done |

---

## 8. Non-negotiables → where each is enforced

| Rule | Enforced by |
|---|---|
| No API keys in the client bundle | keys only in `wrangler secret`; `.env.example` lists public values only; `check-dist.mjs` scans `dist/` for key patterns; ephemeral tokens are single-use, 30 min, locked to model/instruction/tools |
| IO's look unchanged | `RobotModel.jsx` diff limited to the three props (§5.2); `faceTexture.js` output identical at `eyesWide = 0`; the page gains one static button (D11); Phase 2 before/after screenshots of host mode on both skins |
| Every existing behaviour kept | host-mode code paths untouched (§4.1); `npm run check` kept and extended; query params unchanged; embeds without `?voice=1` unchanged; talk mode works on the WebGL fallback |
| Georgian first | `initialLang()` untouched (defaults to `ka`); every new string KA + EN; `check-voice.mjs` applies the `hints.js` rules |
| Privacy | Worker: no body logging, `no-store`, observability off, IP kept one day for rate limiting only; browser: transcript + profile in `localStorage` only, *Delete my data* → `forget()`; mic only from a click; a mic-open indicator bound to the track; the README says what goes to Google |
| Performance | `src/voice/**`, `@google/genai`, worklet and `voice.css` behind one `import()`; the initial chunk grows only by the static button, the `T` listener and the AudioContext helper; baseline §9 compared by `check-dist.mjs` |
| Accessibility | real `<button>` with state label; own `aria-live="polite"` transcript; `T` / `Esc`; reduced motion → still face, captions only; AA pairs listed in §5.3 |
| Embed mode | `?embed=1&voice=1` shows a fixed dock; README documents `allow="microphone; autoplay"` and 520 px |
| `src/voice/` self-contained | no imports from `App.jsx` or `worker/`; only `../content/hints.js`, `../i18n/ui.js` and props; the Worker imports from `src/voice`, not the reverse |

---

## 9. Baseline (measured 2026-09-19 on `IO-for-main-page` `dc8a296`)

Measured in this session with `npm ci && npm run check && npm run build` (Node 22.22.2, npm 10.9.7,
Vite 5.4.21); CI uses Node 20.

| Item | Value |
|---|---|
| `npm run check` | 0 errors, 0 warnings |
| `dist/assets/index-*.js` | 1,013,041 bytes (281,207 gzipped) |
| `dist/assets/index-*.css` | 62,253 bytes (14,006 gzipped) |
| `dist/` total | 2.5 MB (fonts included) |
| Build time | ≈ 4 s |

`check-dist.mjs` fails Phase 6 if the initial JS chunk grows by more than 3 KB gzipped or the CSS by
more than 1 KB, and confirms the voice chunk is a separate file not referenced by `index.html`.

Latency (Phase 6):

| Path | Lang | Laptop: time to first audio | Phone: time to first audio |
|---|---|---|---|
| Live | KA | | |
| Live | EN | | |
| Turn (Gemini TTS) | KA | | |
| Turn (chosen TTS, if different) | KA | | |
| Turn | EN | | |

---

## 10. Open questions

### A. Decisions the DGA team must take

| # | Question | Options and consequences | Recommendation | Needed |
|---|---|---|---|---|
| A1 | Confirm the branch base (§1.1). | Keep `io-voice` on `IO-for-main-page` (as done) — or revert with the command in §1.1 and re-plan on the CyberHero code base (every file in this plan changes). | keep | before Phase 1 |
| A2 | Where do test builds run? The workflow publishes only from `main` of a repository named `IO-for-main-page`, so `io-voice` cannot be previewed from this repository. | **A** a second Pages repository (e.g. `IO-for-main-page-voice`, `base` from a variable): previews never touch the live page. **B** test on the live page: visitors see the button during test phases and the privacy text must be corrected first (A11). | A | before Phase 1 |
| A3 | Gemini billing. The free tier is far below the brief's limits and this project's earlier key had a limit of 0. Who owns a billed Gemini project, and what monthly budget (§2.9: ≈ $0.15 per 10-minute conversation; 100 conversations a day ≈ $450 a month)? | Tier 1 comes with a hard stop of $10 per rolling 10 minutes (≈ 80 simultaneous conversations). | Tier 1, budget set from expected daily conversations | before Phase 1 |
| A4 | Cloudflare: Free plan (burst limits everywhere, a daily cap only on token minting) or Paid $5/month (daily caps on every route as the brief specifies); `workers.dev` for the pilot or a DGA-controlled domain for production (Cloudflare says `workers.dev` is for hobby projects); who holds the account and the secrets, and is a deploy workflow (with a Cloudflare API token in GitHub) wanted or manual `wrangler deploy`? | Free is enough for a pilot; production needs Paid or a Durable Object for exact daily caps. | Paid; `workers.dev` for the pilot, custom domain before launch; manual deploy until launch | before Phase 1 |
| A5 | Per-IP daily limits. The brief's 20 / 200 / 300 per IP would lock out a school behind one shared internet address by mid-morning. Raise them, and add a random per-browser id to the key (which the README must disclose)? | Higher limits raise the cost ceiling (§2.9); the per-browser id is not tracking but must be described honestly. | 60 / 400 / 600 per IP + per-browser id; numbers published in the README | before Phase 1 |
| A6 | May the Basic Course text be published as a downloadable file (`public/io-index.json`, ≈ 805 KB) on the public site, as the WebLLM demo already did? | If not, retrieval moves into the Worker (`/lookup`), adding a round-trip per lookup and a route to rate-limit. | publish (the demo branch's docs say the owner confirmed it) — please re-confirm | before Phase 1 |
| A7 | Voice bake-off candidates (§6.2): confirm the list, and whether one multilingual Azure voice is added out of curiosity. | Each candidate costs a few minutes of synthesis. | as listed | before Phase 1 |
| A8 | The one visible host-mode change: a *Talk to IO* button under the "click IO" hint (D11). Accept, or prefer a second affordance on IO himself (long-press) with no new element? | A long-press is undiscoverable; the button is one additive element below everything else. | button | before Phase 2 |
| A9 | Safety filters. With Google's default filters IO may refuse or stop mid-sentence when a child describes bullying or blackmail — IO's core topics. Loosening those two filter categories lets IO answer; the risk is harsher wording slipping through. Sexual and hate categories stay at default. | Sign-off by a named person. | loosen the two categories; keep the rest | before Phase 3 |
| A10 | Moodle embed: can the admins add `allow="microphone; autoplay"` to the iframe (the HTML block purifier may strip it), does elearning.gov.ge send a restrictive `Permissions-Policy` header, and is a 520 px iframe acceptable? | Without the attribute the microphone never works inside Moodle; the full page on GitHub Pages is unaffected. | test on the real Moodle in Phase 6; the iframe acceptance test uses a plain test page | before launch |
| A11 | When does the README privacy text change — with the first deployed phase that makes network calls (recommended) or at Phase 6? And who signs off the wording in §5.8? | Deploying an intermediate phase with the old paragraph would be untrue. | first deployment | before Phase 1 |
| A12 | New Georgian UI strings: the same three-writer / native-editor process as `hints.js`, or the typography lint plus one native review? | The lint cannot judge register or idiom. | lint + one native review before Phase 6 | before Phase 6 |
| A13 | Skill taxonomy: the 13 skills in §5.7, plus `screen_balance` (CyberHero mission 9, not in the adult course)? | 14 gives CyberHero parity; 13 keeps the adult course as the spine. | 14 | before Phase 5 |
| A14 | Strictness: answer only from the course (the WebLLM demo's rule) or "grounded when relevant, honest when nothing matches" (the brief's rule)? | Course-only makes IO refuse many everyday questions. | the brief's rule | before Phase 5 |
| A15 | If Azure is chosen at G1: which Azure region (any serves the Georgian voices; latency decides) and who owns the Azure subscription? | — | decide after G1 | after Gate G1 |

### B. Technical choices already made (object if you disagree)

| # | Choice | See |
|---|---|---|
| B1 | Token TTL 30 min, `newSessionExpireTime` 60 s, explicit `fieldMask` leaving `sessionResumption` client-side; the smoke script settles sub-path locking and reconnect-after-60 s | D3, §2.2, §5.4 |
| B2 | API version is a config value, default `v1beta`; smoke script tests both | D4 |
| B3 | `/stt` receives WAV built in the browser | D7 |
| B4 | Desktop transcript in the bubble slot at a fixed 104 px (one-time shift on the visitor's click); bottom sheet ≤ 900 px; fixed dock in embed | §5.1, §5.3 |
| B5 | `RobotModel` gains `tapReaction`; `faceTexture` gains `eyesWide` | D9 |
| B6 | Talk-mode click on IO = interrupt only (VAD keeps listening anyway) | §5.1 |
| B7 | Manual interruption: flush + discard until `turnComplete`; whether to also send a short realtime text is a Phase 3 experiment | §2.3 |
| B8 | `index.html` gains `viewport-fit=cover` (no visible change on desktop) | §4.1 |
| B9 | Dock labels nominal, placeholders and hints imperative | §6.1 |
| B10 | Scripted talk-mode lines live in `src/voice/tutor/strings.js`, not `hints.js` | §6.1 |
| B11 | Transcription language hint `ka` first, `ka-GE` tested | §2.3 |
| B12 | *Talk* pressed before the 500 ms greeting skips the greeting; leaving talk mode applies the existing intro rule | §5.1 |
| B13 | The Latin allowlist for `voice.*` strings gains the tokens those strings need (`Google`, key names, browser names), one by one | §6 |
| B14 | The `/chat` request is built in the Worker from the bundled tutor modules | D13 |
| B15 | The grounding index is committed (`public/io-index.json`) because the source branches are not checked out in CI | §4.4 |

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| Georgian on the Live path is not good enough (voice quality, VAD on Georgian speech, transcription); `ka` is on the Live language table only as a snippet | Gate G1 decides; `TurnVoiceSession` + the chosen TTS is fully built regardless (brief); `VITE_IO_VOICE_DEFAULT=ka=turn,en=live` expresses the "Live only for English" outcome |
| Chrome's Web Speech may not accept `ka-GE`; Safari's recogniser has no Georgian | the upload fallback is mandatory and automatic on `language-not-supported` |
| Token minting fails for `AQ.`-format API keys (forum reports) | first smoke check; if needed create an `AIza…` key |
| Locked token ignores the client's resumption handle, or reconnects need a fresh token after 60 s | explicit `fieldMask`; verified in the Phase 1 smoke script; else mint a new token on reconnect (counts against the daily cap) |
| Proactive audio keeps the model silent on a child's short or quiet utterance | `thinking` timeout back to `listening`; `waitingForInput` honoured; tested with children's speech in Phase 3 |
| Free-tier quotas (Gemini and Workers KV) are far below the brief's limits | A3–A5 |
| Retrieval quality on Georgian (measured mis-rankings) | BM25-style port + synonyms (incl. the course's „ორმაგი ავთენტიფიკაცია“) + retrieval tests in `check-voice.mjs` |
| Safety filters cut mid-sentence on the tutor's core topics | explicit `safetySettings` (A9); streamed captions are kept, not discarded |
| Moodle strips the `allow` attribute or sends a restrictive policy | A10; the full page on GitHub Pages remains the primary surface |
| `localStorage` is partitioned or blocked inside the cross-site Moodle iframe | in-memory fallback; README says memory may not persist there |
| `MAX_TOKENS` at 400 truncates Georgian tool calls (`ask_quiz` with three options) | detect `finishReason`, raise the cap for tool turns, keep option text short |
| Model-internal tap overlay hides the interruption cue | `tapReaction` prop (D9) |
| A 60 Hz level as React state would stall the page; `StrictMode` double-mounts effects in development | ref transport (D8); audio and sockets created in the click handler, never in effects |
| `connect()` hangs when the socket closes before `open` | 10 s timeout around `connect()` |
| A tool call is not a user gesture: `window.open` may be blocked; an iframe cannot navigate the top page | link card fallback (§5.3) |
| CI runs Node 20 while `@google/genai` 3.x will need Node 22 | pin `@google/genai` 2.x; revisit in Phase 6 |
| The CyberHero workflow's `sync-main` job force-pushes listed stage branches to `main` | `io-voice` is never added to that workflow; its own `voice-ci.yml` builds only |
| Google's "legacy" label on `generateContent`; the Interactions API stores interactions by default | stay on `generateContent` for `/chat`, `/tts`, `/stt` |

---

## Change log

- 2026-09-19 — Phase 0: plan written; `io-voice` re-pointed to `IO-for-main-page` and force-pushed
  (old head `c71fa53` kept as `claude/mascot-robot-demo-9oclw8` and the local tag
  `io-voice-platform-base`; revert command in §1.1); brief copied to `docs/io-voice-build-prompt.md`;
  baseline measured; plan reviewed by three adversarial passes (completeness against the brief,
  technical consistency against the research, Georgian text and product rules) and corrected.
