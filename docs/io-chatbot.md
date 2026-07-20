# IO Chat — the CyberHero AI helper

IO Chat turns **IO (იო)**, the platform mascot, into a real bilingual
(English / ქართული) chatbot that teaches online safety. It runs the
**Qwen2.5** language model **entirely inside the visitor's browser** and
grounds every answer on CyberHero's own learning content.

> **Status:** `IO Chat α1` — demo / test only. It lives on a hidden page
> (`/#/io-chat`) that nothing on the public site links to, and it has not
> been mounted on the live product yet.

---

## 1. What it is (in one paragraph)

A child (or teacher/parent) asks IO a question in Georgian or English.
The app finds the most relevant pieces of the platform's missions and
guides, hands them to Qwen2.5 as context together with IO's persona and
safety rules, and Qwen writes a short, kid-friendly answer — all on the
user's own device. No server, no API key, no data leaves the browser.

---

## 2. Architecture

The site is a **static GitHub Pages app** (no backend). So instead of
calling a cloud LLM API, IO Chat runs the model client-side with
[**WebLLM**](https://github.com/mlc-ai/web-llm) on **WebGPU**.

```
 User question
      │
      ▼
 ┌─────────────────────────┐     retrieve top chunks     ┌──────────────────────┐
 │  ioBrain.js (retrieval)  │ ──────────────────────────▶ │  Knowledge base       │
 │  keyword scoring, KA+EN  │                             │  330 bilingual chunks │
 └─────────────────────────┘ ◀────────────────────────── │  (built from content) │
      │  system prompt = persona + rules + context        └──────────────────────┘
      ▼
 ┌─────────────────────────┐   streams tokens   ┌──────────────────────────────┐
 │  IoChatPage.jsx (UI)     │ ◀───────────────── │  Qwen2.5 Instruct (WebLLM)    │
 │  chat thread, IO 3D, …   │                    │  runs in-browser on WebGPU    │
 └─────────────────────────┘                     └──────────────────────────────┘
```

This is a **Retrieval-Augmented Generation (RAG)** design. IO is not a
fine-tuned model — the base Qwen2.5 weights are unchanged. Instead, the
platform's material is injected into the prompt at question time, so the
answers reflect CyberHero's content and tone. See §7 for what "training"
would mean beyond this.

### Why in-browser?

| Benefit | Detail |
|---|---|
| **Privacy** | Nothing a child types ever leaves their device. Important for a kids' product. |
| **Cost** | No inference servers, no API bills — it scales for free. |
| **No keys** | Nothing secret ships in the static site. |
| **Offline-ish** | After the one-time model download, it works without a network. |

The trade-off is the client requirements — see §5.

---

## 3. Files

| File | Role |
|---|---|
| `src/mascot/ioBrain.js` | The "brain": builds the knowledge base, retrieves relevant chunks, and assembles the system prompt + persona/guardrails. Pure JS, framework-free, unit-testable in Node. |
| `src/pages/IoChatPage.jsx` | The chat UI: WebGPU check, model picker + download progress, streaming conversation, source chips, IO rendered beside the thread. |
| `src/App.jsx` | Registers the lazy route `/io-chat`. |
| `src/i18n/en.js`, `src/i18n/ka.js` | UI strings under `mascot.chat.*` (bilingual). |
| `src/styles/global.css` | `.io-chat-*` styles, in the site's "Candy Clay" design system. |
| `package.json` | Adds the `@mlc-ai/web-llm` dependency. |

The route is **lazy-loaded**, so WebLLM and this page are a separate
bundle chunk — the main site's size and load time are unaffected.

---

## 4. The knowledge base (RAG)

`ioBrain.js` builds the knowledge base **automatically from the existing
content modules** — there is no separate copy to maintain:

- **Missions** (`src/content/guardians/*`): each mission's name,
  description, brief, every theory point, and every answer explanation.
- **Guides** (`src/content/parents/articles/*`): title, teaser, lead, and
  all body text (paragraphs, lists, callouts).
- **IO tips** (`src/content/mascot.js`).

Every chunk keeps **both languages** (`{ en, ka }`). As of α1 this
produces **~330 chunks**. Because it's derived from the content files,
**adding or editing a mission/guide updates IO's knowledge on the next
build — no extra step.**

### Retrieval

`retrieve(query, topN = 4)` scores chunks by term overlap against both
languages at once, with a prefix-match fallback so inflected Georgian
words still hit (Georgian is heavily inflected). It's **lexical**
(keyword) retrieval — simple, fast, zero dependencies, and good enough
for a focused domain. Upgrading to embedding-based semantic search is a
known future improvement (§7).

`buildSystemPrompt(query)` returns `{ prompt, sources }`, where `sources`
are the chunks used — the UI shows them as 📚 chips under each answer so
you can see what IO drew on.

---

## 5. Requirements & how to test

**Requirements**

- A **WebGPU** browser: **Chrome or Edge on a desktop/laptop** (recent
  versions). The page detects missing WebGPU and shows a friendly notice.
- Enough disk/RAM for the chosen model (it's cached by the browser after
  the first download).

**Models offered** (edit in `ioBrain.js → IO_MODELS`):

| Model | Download | Notes |
|---|---|---|
| `Qwen2.5-7B-Instruct-q4f16_1-MLC` | ~4.6 GB | Best quality + best Georgian. Needs a capable GPU. |
| `Qwen2.5-3B-Instruct-q4f16_1-MLC` | ~2.0 GB | Good balance. |
| `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` | ~0.9 GB | Fast to try; weaker Georgian. |

**Test on the deployed demo**

```
https://tinatinzhorzholianidga.github.io/Cyber-Learning-Platform/?fresh#/io-chat
```

1. Pick a model and click **Download & start the brain** (one-time
   download; watch the progress line).
2. Ask in either language, or tap a starter question.
3. Watch the 📚 source chips to confirm IO is grounded on real content.

**Test locally**

```bash
npm install
npm run dev
# open the printed URL, then add:  #/io-chat
```

---

## 6. Persona & safety guardrails

Defined in `buildSystemPrompt()` (`ioBrain.js`). IO is instructed to:

- **Answer in the user's language** (Georgian or English), matching their
  last message.
- **Stay on topic** — online safety and the platform. Off-topic questions
  get one friendly sentence, then a steer back.
- Be **warm, short (2–5 sentences), kid-friendly**, at most one emoji.
- **Ground answers** on the retrieved platform content and recommend the
  matching mission/guide by name when useful.
- **Safety first:** if someone is threatened or blackmailed — never pay,
  save the evidence, tell a trusted adult, and in Georgia call **112**.
- **Never** ask for or store personal data (passwords, codes, addresses,
  full names).
- **Refuse** to help with hacking, attacking, or breaking into accounts —
  IO defends, it does not attack.
- **Not invent** platform features, prices, or contacts.

A visible disclaimer on the page reminds users that IO is an AI, can make
mistakes, and is a helper — not a replacement for a trusted adult.

> ⚠️ These are prompt-level guardrails on a small open model. They are
> strong for a demo but **not** a substitute for human moderation. Before
> any public launch, the outputs should be reviewed with real
> child-safety testing (see §7).

---

## 7. Limitations & roadmap

**Current limitations**

- **WebGPU only** — no support on most phones or Safari yet; low-end
  laptops may be slow or unable to run the 7B model.
- **Large first download** for the bigger models.
- **RAG, not fine-tuned** — IO uses the base Qwen2.5 with platform context
  injected; it hasn't learned the content into its weights.
- **Lexical retrieval** — keyword-based; can miss paraphrases an
  embedding search would catch.
- **Guardrails are prompt-based** — see the safety note in §6.

**Possible next steps (in rough order of value)**

1. **Embedding-based retrieval** for better recall on paraphrased
   questions (still fully in-browser).
2. **Hosted-model fallback** for phones / weak devices (a small managed
   API), toggled per device — trades some privacy/cost for reach.
3. **Child-safety review**: adversarial testing, an answer-logging
   opt-in for QA, stronger refusal tuning.
4. **True fine-tuning / LoRA** of Qwen on the platform's content and tone
   — needs GPU training infrastructure; improves fluency and Georgian.
5. **Mount IO Chat into the floating widget** so he's reachable from every
   page once approved.

---

## 8. Deployment notes

- Everything currently lives on the demo branch
  `claude/mascot-robot-demo-9oclw8` and the hidden `/io-chat` page.
- Promotion to the live line (`claude/cyberhero-platform-setup-gd5ur7`)
  happens **only on explicit approval**.
- The feature is self-contained and lazy-loaded; merging it does not alter
  any existing page.

---

*IO Chat is part of the CyberHero (კიბერგმირი) platform — a free,
bilingual cyber-hygiene learning resource.*
