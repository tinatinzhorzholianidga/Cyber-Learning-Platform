# IO for main page 🤖

**IO** (Georgian: **იო**) is the friendly 3D robot of the CyberHero platform. This
repository puts him on the **front door** of the Government of Georgia's
e-learning platform, **elearning.gov.ge** — as a bilingual **welcome host** who
greets visitors and helps them choose where to go:

| Path | Who it's for | Where it leads |
|---|---|---|
| **კიბერუსაფრთხოების საბაზისო კურსი** (Basic Cybersecurity Course) | adults, employees, anyone | `https://elearning.gov.ge/course/view.php?id=18` |
| **კიბერგმირი / CyberHero** | kids, teens, parents, teachers | `https://tinatinzhorzholianidga.github.io/Cyber-Learning-Platform/` |

In **host mode** (the page as it loads) IO is a **host, not a teacher**: he
welcomes, introduces himself, routes you to the right course, reacts when you
hover a path, and explains the small print (login, certificate, language). He
gives **no cyber-security tips** there — those live inside the courses.

Press **ესაუბრეთ იოს / Talk to IO** (or `T`) and he switches to **talk mode**:
a voice tutor who answers everyday cyber-security questions in Georgian or
English, asks back, shows cards and short quizzes, and remembers what you
practised. Talk mode is a **demo build** (see [Talk to IO](#talk-to-io-demo-build)):
it runs without a backend and never ships a key.

This is a standalone project. It does not modify the CyberHero repository; it
reuses IO's 3D character code by copy, and grounds the tutor on CyberHero's
public content.

---

## What's in the page

- **Top bar + band** in the Digital Governance Agency's colours (navy / blue /
  coral), with a **ქართული / English** switch and the **შესვლა** (login) link.
- **IO's stage** — the 3D character with his speech bubble. He waves and greets
  on arrival (a different greeting for morning / afternoon / evening), then
  introduces himself. **Click him** and he walks through his orientation lines
  one by one. His eyes follow your cursor across the page.
- **Two path cards.** Hovering (or keyboard-focusing) a card makes IO react to
  it — hovering CyberHero, where he lives, gets him excited. Choosing a path
  gets a goodbye wave; the link then navigates normally.
- **Talk to IO** — one small button under the hint. It loads the voice code on
  demand (nothing of it is in the initial page), opens a dock with a
  push-to-talk ring, a text field, mute, *End* and *Delete my data*, puts the
  transcript in IO's bubble and a board beside him for cards and quizzes.
- **Embed mode** for dropping IO into the real Moodle page (see below).
- Georgian is the default language; the choice is remembered (`localStorage`)
  and can be forced with `?lang=ka|en`.

Accessibility: every line IO says is announced once through a hidden
`aria-live` region (the visible typewriter is hidden from screen readers), IO
himself is a keyboard-operable button (Enter / Space makes him talk, and in
talk mode interrupts him), cards are real links named by their title + call to
action with a "opens in a new tab" note where relevant, there's a skip link,
colours meet AA contrast, and `prefers-reduced-motion` switches IO to a still,
on-demand render. In talk mode the dock's controls are real buttons with state
labels, the transcript has its own polite live region that announces IO's
completed sentences and what he heard you say, quiz results carry a mark and
text (never colour alone), `T` starts and stops listening, `Esc` interrupts,
and reduced motion means a still face and captions shown at once.

---

## Files

```
index.html                 page shell
src/main.jsx               React entry + self-hosted web fonts (Noto Sans Georgian, Inter)
src/App.jsx                the welcome page (top bar, hero, path cards, footer, embed mode, the Talk button)
src/styles/global.css      DGA palette + layout, responsive, embed styles, the Talk button
src/i18n/ui.js             UI strings (KA/EN): titles, card texts, buttons, the two talk-mode entry strings
src/content/hints.js       IO's SPEECH (KA/EN) in host mode — everything he says on this page
src/content/safety.js      talk mode: the resources IO reads to a learner in trouble (placeholders until the agency fills them in)
src/mascot/hostBrain.js    which line he says when (greeting, cycle, hover, farewell) + his mood per line
src/mascot/IoHost.jsx      IO + bubble: entrance, typewriter, click cycle, hover/farewell API, talk mode
src/mascot/RobotCanvas.jsx 3D stage (three.js / react-three-fiber), WebGL fallback, reduced motion
src/mascot/RobotModel.jsx  IO's 3D model (copied from CyberHero — Original + Metal skins), the mouth and the listening cue
src/mascot/faceTexture.js  IO's face (canvas texture: eyes, moods, DGA plate)
src/voice/                 talk mode, loaded on demand: the dock, transcript and board (IoVoice, VoiceDock,
                           TranscriptPanel, BoardPanel, diagrams/), the state machine (useIoVoice), the sessions
                           (session/: browser, turn, live, stub), speech in and out (stt/, tts/, audio/), the
                           Gemini and local-model transports (llm/), key handling (auth/), the tutor brain
                           (tutor/: persona, skills, memory, tools, lookup, strings) and the strings (i18n.js)
public/io-index.json       the CyberHero passages the tutor searches (built by scripts/build-io-index.mjs)
scripts/check-hints.mjs    sanity checks for hints.js (parity, length, emoji, no cyber tips)
scripts/check-voice.mjs    the same rules for every talk-mode string, plus tools, skills, index and persona checks
scripts/check-dist.mjs     after every build: no key, no course text, the page not heavier, the voice chunk separate
scripts/build-io-index.mjs rebuilds public/io-index.json from the CyberHero content in git
scripts/voice-smoke.mjs    with a key: which Gemini models and quotas work
scripts/voice-bakeoff.mjs  with a key: WAV files for the voice bake-off (bakeoff/README.md)
scripts/e2e/               headless-Chromium acceptance scripts (not run in CI)
test/                      unit tests (node --test)
docs/                      io-voice-plan.md (the plan and its status), io-voice-test-script.md (the six-turn
                           acceptance script), io-voice-demo.md (the run sheet for the presentation)
.github/workflows/         deploy.yml (GitHub Pages from main), voice-ci.yml (checks, tests and a build on io-voice)
```

---

## IO's lines — `src/content/hints.js`

All of IO's host-mode speech is one plain data file. Each category is an array
of `{ en, ka }` lines; the host picks from them round-robin so nothing repeats
until a pool is exhausted.

| Category | When IO says it |
|---|---|
| `morning` / `afternoon` / `evening` | first line on arrival, by the visitor's local time |
| `greeting` | fallback greeting |
| `whoAmI` | second beat after the greeting |
| `pickPath`, `basicCourse`, `kidsPlatform`, `login`, `certificate`, `aboutDga`, `language`, `encouragement` | the cycle he walks when you click him |
| `hoverBasic` / `hoverKids` | while a path card is hovered or focused |
| `farewell` | when a path is chosen |

The order of the click-cycle and IO's **mood** per category (happy, wink,
thinking, excited, celebrate, sleepy; talk mode adds surprised, for the moment
he is interrupted) are in `src/mascot/hostBrain.js`.

The copy was produced with a small design process: three independent writers
(concierge / character / Georgian-first), a native-Georgian editor and a UX
writer as judges, and a final synthesis in one consistent register. Rules every
line follows: ≤ 110 characters per language, at most one emoji, **no
cyber-security advice**, native Georgian (no calques).

Talk mode has its own scripted lines (the greeting, the returning-learner
greeting, the goodbye) in `src/voice/tutor/strings.js` and its UI strings in
`src/voice/i18n.js`; the same rules apply, without emoji, with „…“ quotes and
the spaced em dash. Everything IO *answers* in talk mode comes from the model.

**Editing:** change the text, then run

```bash
npm run check
```

which verifies every category exists in both languages, flags lines that are
too long for the bubble or carry more than one emoji, warns if a host line
looks like a cyber tip or leaks Latin letters into Georgian, and checks the
talk-mode strings, the tool declarations, the skills, the tutor's index and
the safety file.

---

## Running it

```bash
npm install
npm run dev          # local dev server (talk mode reads IO_GEMINI_KEY from .env.local here only)
npm run build        # production build into dist/, then the dist scan (scripts/check-dist.mjs)
npm run preview      # serve the production build
npm run check        # string and content checks (check-hints + check-voice)
npm test             # unit tests
npm run build:index  # rebuild public/io-index.json from origin/main
npm run smoke:voice  # with a key: which models work, quota texts
npm run bakeoff      # with a key: the voice bake-off WAVs
npm run e2e:talk     # headless Chromium against the dev server (talk mode, tools, embed, accessibility, phone)
npm run e2e:live     # the same for the Live session, with a fake key and VITE_IO_LIVE_OK=1
```

Query parameters:

| Param | Effect |
|---|---|
| `?lang=ka` / `?lang=en` | force the language (also remembered) |
| `?embed=1` | render only IO + bubble on a transparent background (for an iframe) |
| `?size=260` | IO's stage size in embed mode (px) |
| `?skin=metal` | the metal-droid IO instead of the original |
| `?voice=browser` / `live` / `turn` / `stub` | which voice session the Talk button starts (see below); in embed mode any value, e.g. `voice=1`, shows the button at all |
| `?bakeoff=1` | dev server only: the browser-voice bake-off page |

---

## Talk to IO (demo build)

### How it starts

The **ესაუბრეთ იოს / Talk to IO** button under the hint, or the `T` key. When
the browser has neither speech recognition nor a voice for the page language,
the same button says **დაწერეთ კითხვა / Type a question** and opens the dock in
typed mode. The voice code is one separate chunk that loads on that click, and
the microphone opens only when you press the ring (or, on the Live session,
after the greeting) — never on page load.

Inside the dock: the **ring** (press to speak; recognition stops by itself when
you pause; press again to stop early), a **text field** for typed questions,
**mute**, **End**, **Delete my data**, and, while a key is needed, a field to
paste one. `Esc` or a click on IO interrupts him; `T` starts and stops
listening. IO's board beside him shows steps, checklists, one of three inline
diagrams, a link, or a three-option quiz you answer by click or by voice.

### Sessions

| `?voice=` | Speech in | Answers | Speech out | Needs |
|---|---|---|---|---|
| `browser` (default) | the browser's speech recognition | Gemini Flash, or a local model (Ollama) | the browser's voices (Edge: Giorgi and Eka for Georgian) | a Gemini key, or Ollama |
| `turn` | the browser's speech recognition | Gemini Flash | Gemini TTS, sentence by sentence | a Gemini key |
| `live` | Gemini Live (the audio itself) | Gemini Live | Gemini Live | the dev key on localhost, `VITE_IO_LIVE_OK=1` |
| `stub` | — | scripted test lines | a synthetic signal | nothing (the audio test harness) |

`VITE_IO_VOICE_DEFAULT` sets the default (`browser`, or per language such as
`ka=browser,en=live`); a session the browser cannot run falls back to the next
one, and the dock names the active session in a small badge on the dev server.

### Browsers

- **Edge on Windows** — recommended: Georgian recognition and the Georgian
  natural voices (both need internet).
- **Chrome** — Georgian recognition; without a Georgian voice IO answers in
  captions (the `turn` session speaks through Gemini instead).
- **Safari, Firefox** — typed questions; captions or the `turn` session for the
  answers. iOS Safari: typed input and the browser's voices.
- **Android Chrome** — as desktop Chrome, with the dock as a bottom sheet.

### Keys

No key is ever in the bundle. For local development put `IO_GEMINI_KEY=…` in
`.env.local` (gitignored, **no `VITE_` prefix**): `vite.config.js` injects it
into `npm run dev` only, and every build defines it as empty whatever the file
says; `scripts/check-dist.mjs` then scans the build for key shapes. Never run
`vite --host` with a key in `.env.local`. On a deployed preview the presenter
pastes the key into the dock's field; it stays in that browser's
`localStorage['io.gemini.key']` until **Forget key**. The Live session uses the
dev key only, on localhost only. `.env.example` lists every setting.

### What is sent where

- Your **voice** goes to the browser's speech service — Google's servers in
  Chrome, Microsoft's in Edge — and, on the Live session, to Google's Gemini
  API as audio.
- The **text** of the conversation (the last eight turns, a learner summary of
  at most 300 characters, and the system instruction) goes from the browser to
  Google's Gemini API with the presenter's key, or to a local model on the
  presenter's machine. On the free tier Google may use the content to improve
  its products: **test content only, no personal data**.
- The browser's online voices may send IO's text to Microsoft (Edge) to
  synthesise it.
- Nothing goes anywhere else. There is no backend, no cookie and no analytics.

### What is stored, and how to delete it

IO keeps **no recordings**. The transcript lives in memory for the session. What
persists is in your browser only: the learner profile
(`localStorage['io.learner.v1']`: the language, at most ten short session
summaries, a level per practised skill, and a first name only if you offered
it), the chosen language (`io.lang`) and a pasted key (`io.gemini.key`).
**Delete my data** in the dock removes the profile and the transcript; **Forget
key** removes the key.

### The tutor

The system instruction (`src/voice/tutor/persona.js`) imports the platform
facts from `hints.js` and `ui.js` instead of retyping them; the Basic Course is
described and pointed to, never quoted (its text is not in this repository and
`check-dist.mjs` fails a build that contains it). Course questions are answered
from `public/io-index.json`, the CyberHero missions, guides and tips, searched
in the browser. Seven tools let the model set IO's mood, show a card or a quiz,
record a skill, look up material, open a course or end the session with a
summary. `src/content/safety.js` holds the resources IO reads to a learner who
is bullied, blackmailed or contacted by a stranger; it ships with placeholders
for the agency to fill in, and until then IO only says to tell a trusted adult
now (`npm run check` warns; a build with `VITE_IO_SAFETY_REQUIRED=1` fails).

`docs/io-voice-test-script.md` is the six-turn acceptance conversation;
`docs/io-voice-demo.md` the run sheet for the presentation.

### Production (not deployed)

The production design keeps the key in a Cloudflare Worker that mints one-use,
ten-minute tokens for the Live session, proxies chat and speech, keeps no
request bodies and only the visitor's address for one day of rate limiting,
and switches the dock to text-only mode when the daily budget is spent; Google
then processes audio and text under the paid tier's terms. It is specified in
`docs/io-voice-plan.md` (§5.9, §10) and is not built or deployed in this
branch.

---

## Embedding IO in the real elearning.gov.ge page

The simplest, theme-independent way is an **iframe** in the Moodle front page
(an HTML block or the theme's front-page region):

```html
<iframe
  src="https://tinatinzhorzholianidga.github.io/IO-for-main-page/?embed=1&lang=ka&size=260"
  title="იო — კიბერუსაფრთხოების გზამკვლევი"
  width="340" height="460"
  style="border:0;background:transparent"
  loading="lazy"
  allowtransparency="true"></iframe>
```

Use `lang=en` for the English page. Keep the height at 460 or more so IO's
longest lines never produce a scrollbar (the embed page hides overflow
anyway). Inside an iframe IO's eyes follow the cursor only while it is over
the iframe.

With talk mode, add `voice=1` (or a session name), give the frame **520 px**
and allow the microphone and audio:

```html
<iframe
  src="https://tinatinzhorzholianidga.github.io/IO-for-main-page/?embed=1&lang=ka&size=260&voice=1"
  title="იო — კიბერუსაფრთხოების გზამკვლევი"
  width="340" height="520"
  style="border:0;background:transparent"
  loading="lazy"
  allow="microphone; autoplay"
  allowtransparency="true"></iframe>
```

The dock then sits as a bottom sheet inside the frame; without `voice` the
embed renders exactly as before. `scripts/e2e/embed-test.html` is a stand-in
page with both frames, driven by `npm run e2e:talk`. The whole welcome page can
also simply be linked, or the redesigned front page can be built on this
project directly (`App.jsx` is the page; `IoHost` is the reusable piece).

---

## Deploying

The included GitHub Actions workflow runs `npm run check`, builds the site
(the `postbuild` step scans `dist/` for key shapes, course text and the size
budget) and publishes it to **GitHub Pages** on every push to `main`. One-time
setup in the repository: **Settings → Pages → Source: GitHub Actions.** The
site then lives at `https://<owner>.github.io/IO-for-main-page/` (`base` in
`vite.config.js` must match the repository name). A repository variable
`VITE_IO_VOICE_DEFAULT` picks the default voice session (`browser` when unset).
A second workflow, `voice-ci.yml`, runs the checks, the unit tests and a build
on every push to `io-voice` and deploys nothing.

The workflow only publishes from a repository **named `IO-for-main-page`**. If
this code lives as a branch inside another repository (for example the
CyberHero repository), the workflow is skipped there on purpose — a repository
can serve only one GitHub Pages site, and that one belongs to CyberHero. To put
IO's welcome page online, create a repository called `IO-for-main-page` and push
this branch to its `main`.

---

## Privacy

Static site, no backend, no cookies, no analytics. The web fonts are bundled
with the site, not loaded from Google. Host mode makes no third-party request
at all. Talk mode, and only after you press the button, sends your voice to the
browser's speech service and the conversation text (or, on the Live session,
the audio) to Google's Gemini API or to a local model, as described under
[What is sent where](#what-is-sent-where). IO keeps no recordings; what is
stored stays in your browser (the language, the learner profile, a pasted key)
and **Delete my data** removes it.
