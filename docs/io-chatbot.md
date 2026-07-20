# IO Chat — the CyberHero AI helper

IO Chat turns **IO (იო)**, the platform mascot, into a real bilingual
(English / ქართული) chatbot that teaches online safety. It is powered by
**Google's Gemini API** and grounds every answer on CyberHero's own
learning content.

> **Status:** `IO Chat β1` — demo / test only. It lives on a hidden page
> (`/#/io-chat`) that nothing on the public site links to, and it has not
> been mounted on the live product yet.

> **History:** an earlier α1 ran Qwen2.5 fully in the browser (WebLLM /
> WebGPU). It was private and free but its Georgian was weak, so the
> backend was switched to Gemini. The knowledge/RAG layer and the UI are
> unchanged.

---

## 1. What it is (in one paragraph)

A child (or teacher/parent) asks IO a question in Georgian or English.
The app finds the most relevant pieces of the platform's missions and
guides, sends them to **Gemini** as context together with IO's persona
and safety rules, and Gemini streams back a short, kid-friendly answer.

---

## 2. Architecture

The site is a **static GitHub Pages app** (no backend). The chat page
calls the Gemini REST API directly from the browser and streams the
reply.

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
 │  IoChatPage.jsx (UI)     │ ◀───────────────── │  Google Gemini API            │
 │  useIoChat + llmClient   │                    │  (gemini-*-flash)             │
 └─────────────────────────┘                     └──────────────────────────────┘
```

This is a **Retrieval-Augmented Generation (RAG)** design. Gemini's own
weights are unchanged; the platform's material is injected into the
prompt at question time, so answers reflect CyberHero's content and tone.
See §7 for what real "training" would mean beyond this.

---

## 3. Files

| File | Role |
|---|---|
| `src/mascot/ioBrain.js` | The knowledge layer: builds the knowledge base, retrieves relevant chunks, and assembles the RAG system prompt + persona/guardrails. Pure JS, model-agnostic. |
| `src/chat/llmClient.js` | Gemini client: API-key resolution, the streaming `streamGemini()` call, and the model list (`GEMINI_MODELS`). |
| `src/chat/useIoChat.js` | React hook holding the chat state: builds a fresh prompt per question, streams the answer, keeps a rolling window. |
| `src/pages/IoChatPage.jsx` | The chat UI: model picker, API-key field, streaming thread, source chips, IO rendered beside the conversation. |
| `src/App.jsx` | Registers the lazy route `/io-chat`. |
| `src/i18n/en.js`, `src/i18n/ka.js` | UI strings under `mascot.chat.*` (bilingual). |
| `.env.example` | Template for the local API key (copy to `.env.local`). |

The route is **lazy-loaded**, so the chat code is a separate ~12 KB
bundle chunk — the main site's size and load time are unaffected.

---

## 4. The knowledge base (RAG)

`ioBrain.js` builds the knowledge base **automatically from the existing
content modules** — no separate copy to maintain:

- **Missions** (`src/content/guardians/*`): name, description, brief,
  every theory point, every answer explanation.
- **Guides** (`src/content/parents/articles/*`): title, teaser, lead and
  all body text.
- **IO tips** (`src/content/mascot.js`).

Every chunk keeps **both languages** (`{ en, ka }`) — currently **~330
chunks**. Adding or editing a mission/guide updates IO's knowledge on the
next build, no extra step.

`retrieve(query, topN)` scores chunks by term overlap across both
languages, with a prefix fallback so inflected Georgian words still hit.
It's lexical (keyword) retrieval — simple and dependency-free. Replies
show 📚 source chips naming the chunks used.

---

## 5. API key & how to test

Gemini needs an API key ([aistudio.google.com](https://aistudio.google.com)
→ **Get API key** → **Create**; free, no card).

The key is resolved in this order:

1. **`import.meta.env.VITE_GEMINI_API_KEY`** — from `.env.local`, for
   local `npm run dev`.
2. **Runtime key** — a key the tester pastes into the page; stored only
   in `localStorage`, never in the code or bundle.

> ⚠️ **Never commit a key.** `.env.local` is gitignored. A `VITE_` var is
> **inlined into the built JavaScript**, so a key placed in `.env.local`
> would be exposed if that build were published to a public site. The
> deployed demo therefore ships **no** key and uses the paste-in-browser
> field instead (see §8).

**Local (recommended for first tests)**

```bash
cp .env.example .env.local        # then paste your key into .env.local
npm run dev                       # restart if it was already running
# open the printed URL, add:  #/io-chat
```

**Deployed demo** — open `…/#/io-chat`, paste your key into the
**Gemini API key** box on the left (stored only in your browser), chat.

**Models** (`llmClient.js → GEMINI_MODELS`): `gemini-2.0-flash` (default,
fast, strong Georgian), `gemini-2.5-flash`, `gemini-1.5-flash`. Switch in
the UI; unavailable models show a clear error.

---

## 6. Persona & safety guardrails

Defined in `buildSystemPrompt()` (`ioBrain.js`). IO is instructed to:

- **Answer in the user's language** (Georgian or English).
- **Stay on topic** — online safety and the platform; off-topic gets one
  friendly sentence then a steer back.
- Be **warm, short (2–5 sentences), kid-friendly**, ≤ one emoji.
- **Ground answers** on retrieved platform content; recommend the
  matching mission/guide by name.
- **Safety first:** threats/blackmail → never pay, save evidence, tell a
  trusted adult, in Georgia call **112**.
- **Never** ask for or store personal data.
- **Refuse** hacking/attack help — IO defends, not attacks.
- **Not invent** platform features, prices or contacts.

Gemini also applies its own safety filters; a blocked answer surfaces a
friendly "try rephrasing" message.

> ⚠️ These are prompt-level guardrails plus Gemini's filters — strong for
> a demo but **not** a substitute for human moderation. Do real
> child-safety testing before any public launch.

---

## 7. Privacy note (important for a kids' product)

Unlike the earlier in-browser version, **questions are now sent to
Google's Gemini API** to generate answers — they leave the device. The UI
says so and warns against typing passwords or personal details. Before a
public launch, review Google's data-use terms for the chosen tier (free
vs paid differ) and your obligations for minors (e.g. COPPA / GDPR-K).

---

## 8. Limitations & roadmap

**Current limitations**

- **Needs an API key** and a network connection.
- **RAG, not fine-tuned** — Gemini uses platform context in the prompt; it
  hasn't learned the content into its weights.
- **Lexical retrieval** — keyword-based; can miss paraphrases.
- **Data leaves the device** (see §7).
- **Guardrails are prompt + filter based** — see §6.

**Possible next steps**

1. **Backend key proxy** (serverless function) so the deployed site can
   use one server-side key safely, without each user pasting their own.
2. **Embedding-based retrieval** for better recall on paraphrases.
3. **Child-safety review**: adversarial testing, optional QA logging,
   stronger refusal tuning.
4. **Real fine-tuning / LoRA** on the platform's content and tone — needs
   training infrastructure.
5. **Mount IO Chat into the floating widget** so he's reachable from every
   page once approved.

---

## 9. Deployment notes

- Everything currently lives on the demo branch
  `claude/mascot-robot-demo-9oclw8` and the hidden `/io-chat` page.
- The deployed build contains **no API key** (it is gitignored and absent
  from CI), so the public demo is inert until a tester pastes their own
  key — safe to publish.
- Promotion to the live line (`claude/cyberhero-platform-setup-gd5ur7`)
  happens **only on explicit approval**.
- Self-contained and lazy-loaded; merging does not alter any existing
  page.

---

*IO Chat is part of the CyberHero (კიბერგმირი) platform — a free,
bilingual cyber-hygiene learning resource.*
