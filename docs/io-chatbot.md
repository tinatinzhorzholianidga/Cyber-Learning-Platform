# IO Chat — the CyberHero course-tutor chatbot 🤖

IO (Georgian: **იო**) is the helper robot of the **CyberHero** (კიბერგმირი)
platform. **IO Chat** turns him from a mascot into a real AI tutor: a chatbot
that answers questions **exclusively from the Government of Georgia's Basic
Cybersecurity Course** («კიბერუსაფრთხოების საბაზისო კურსი», elearning.gov.ge,
course id 18), in **Georgian or English**, running **entirely in the visitor's
browser** — no server, no API keys, and nothing the user types ever leaves
their device.

| | |
|---|---|
| **Demo page** | `#/io-chat` (hidden — reached from the mascot demo, not linked from the public site) |
| **Status** | demo / testing (α2). Not merged to the production branch. |
| **Engine** | Qwen2.5 (1.5B / 3B / 7B) via [WebLLM](https://github.com/mlc-ai/web-llm), running on the visitor's GPU through **WebGPU** |
| **Grounding** | Retrieval-augmented generation (RAG) over 223 chunks of the course |
| **Languages** | Georgian (ქართული) and English, auto-detected per message |
| **Privacy** | 100% local inference — the model and the course ship to the browser; questions never go to any server |

---

## 1. How it works, in one picture

```
                     the visitor's browser  (nothing leaves it)
 ┌───────────────────────────────────────────────────────────────────────────┐
 │                                                                           │
 │  user question ──►  ioBrain.js                                            │
 │  "რა არის ფიშინგი?"     │  1. retrieve()  – find the 5 most relevant       │
 │                        │     course chunks (lexical, Georgian-aware)      │
 │                        │  2. buildSystemPrompt()  – persona + strict      │
 │                        │     rules + ONLY those 5 chunks                  │
 │                        ▼                                                  │
 │                Qwen2.5  (WebLLM, runs on the visitor's GPU via WebGPU)    │
 │                        │  streams tokens back                            │
 │                        ▼                                                  │
 │   answer in the user's language  +  📚 source chips (which chapters)      │
 │                                                                           │
 └───────────────────────────────────────────────────────────────────────────┘
      model weights (~0.9–4.6 GB) are downloaded once and cached by the browser
```

This is a **RAG** (retrieval-augmented generation) chatbot. Instead of trusting
the LLM's own memory, every answer is grounded on chunks retrieved from the
course, and the system prompt forbids the model from using anything else.

---

## 2. Files

| File | Role |
|---|---|
| `src/content/ioCourse.js` | **The knowledge base.** The whole Basic Cybersecurity Course as 11 chapters / 223 text chunks (Georgian). Machine-generated from the platform — see §8. |
| `src/mascot/ioBrain.js` | **The brain.** Builds the searchable knowledge base, does retrieval, and assembles the system prompt (persona + rules + retrieved chunks). Also exports the model list. |
| `src/pages/IoChatPage.jsx` | **The UI.** Model picker, download button, chat thread, streaming, source chips, the 3D IO next to the chat. |
| `src/i18n/en.js`, `src/i18n/ka.js` | UI strings under the `mascot.chat.*` namespace (bilingual). |
| `src/App.jsx` | Lazy route: `#/io-chat` → `IoChatPage`. |

Everything the chatbot needs lives in the client bundle; there is no backend.

---

## 3. The knowledge base — `ioCourse.js`

The course is stored as a plain data module:

```js
export const IO_COURSE = {
  title: { en: 'Basic Cybersecurity Course', ka: 'კიბერუსაფრთხოების საბაზისო კურსი' },
  source: 'Government of Georgia e-learning platform (elearning.gov.ge), course id=18',
  sections: [
    { id: 0, en: 'Introduction', ka: 'შესავალი', chunks: ['…', '…'] },
    …
  ],
}
```

The 11 chapters (223 chunks total):

| # | Chapter (EN) | Chapter (KA) | Chunks |
|---|---|---|---|
| 0 | Introduction (CIA triad, course overview) | შესავალი | 8 |
| 1 | Personal computer security | პერსონალური კომპიუტერის უსაფრთხოება | 19 |
| 2 | Passwords and authentication | პაროლები და ავთენტიფიკაცია | 29 |
| 3 | Email security | ელ. ფოსტის უსაფრთხოება | 30 |
| 4 | Safe internet | უსაფრთხო ინტერნეტი | 18 |
| 5 | Social media security | სოციალური მედიის უსაფრთხოება | 22 |
| 6 | Mobile device security | მობილური მოწყობილობების უსაფრთხოება | 26 |
| 7 | Data security | მონაცემთა უსაფრთხოება | 22 |
| 8 | Workplace security | სამუშაო გარემოს უსაფრთხოება | 13 |
| 9 | Disinformation, misinformation and fake information | დეზინფორმაცია, მისინფორმაცია და ყალბი ინფორმაცია | 31 |
| 10 | AI-related cyber threats | ხელოვნურ ინტელექტთან დაკავშირებული ძირითადი კიბერსაფრთხეები | 5 |

Chunks are ~240–900 characters — small enough to retrieve precisely, large
enough to carry a whole idea. The testing/certification chapter (a quiz) is
intentionally excluded since it has no teachable prose.

---

## 4. Retrieval — how IO finds the right passage

`ioBrain.js` builds a flat list of chunks (each tagged with its chapter), then
`retrieve(query, topN = 5)` scores them against the user's question:

- **Tokenizer** splits on Latin (`[a-z0-9]+`) *and* Georgian (`[ა-ჰ]+`) runs, drops a small bilingual **stop-word** list.
- **Scoring**: +2 for each long term (>3 chars) found in a chunk, +1 for short terms.
- **Georgian stemming**: Georgian inflects heavily, so if a whole term isn't found, a **prefix match** (word minus its last 2 characters) still scores +1. This lets «პაროლს / პაროლები / პაროლის» all match the chunk about «პაროლი».
- The top 5 chunks are returned and shown to the model.

It's deliberately **lexical, not embeddings-based** — zero extra downloads, no
vector DB, instant, and good enough because the corpus is one focused course.
Off-topic questions ("how do I bake a cake?") match nothing → IO says the course
doesn't cover it.

---

## 5. The prompt — persona, rules, and the "only this course" guardrail

`buildSystemPrompt(query)` returns `{ prompt, sources }`. The prompt has three
parts: **persona → rules → the retrieved course chunks**. The load-bearing
rules:

1. **Single source of truth.** *"Answer strictly and exclusively from the COURSE
   CONTENT below … Do NOT use outside knowledge or general cyber-security facts
   you happen to know — even if you are sure they are correct."*
2. **Honest refusal.** If the answer isn't in the retrieved chunks, IO says so
   («ეს კურსში არ არის განხილული» / "the course doesn't cover this") and points
   to a related chapter — it never invents facts, tools, numbers or links.
3. **Off-topic redirect.** Non-course questions get one friendly sentence, then a
   nudge back to what the course covers.
4. **Language + quality.** Georgian questions are answered in fluent, natural
   Mkhedruli Georgian (correct cases, ergative in past tense, no transliterated
   English); English questions in English; it switches with the user.
5. **Short + safe.** 2–5 sentences, ≤1 emoji. Danger/blackmail/child-safety
   answers follow the course's guidance (don't pay, keep evidence, tell a
   trusted adult, in Georgia call **112**). Never asks for personal data, never
   helps with attacking — this course is about defence.

The retrieved chunks are appended as `COURSE CONTENT` with their chapter labels,
so the model quotes and teaches from real course text.

---

## 6. The models

Offered in the demo (picker on the left, biggest first). All are Qwen2.5
Instruct, 4-bit quantised, served by WebLLM:

| Model | Download | Notes |
|---|---|---|
| **Qwen2.5 7B** | ~4.6 GB | best quality + best Georgian (recommended) |
| **Qwen2.5 3B** | ~2.0 GB | good balance |
| **Qwen2.5 1.5B** | ~0.9 GB | fast to test, weak Georgian |

Streaming generation, `temperature 0.6`, `max_tokens 320`, and only the last 8
turns of history are sent (keeps small models focused). The download is
**one-time** and cached by the browser afterward.

---

## 7. Running & testing it

**Requirements for the visitor:** a **WebGPU** browser (Chrome or Edge on a
desktop/laptop) and enough free disk for the model. The page detects
`navigator.gpu` and shows a warning if WebGPU is missing.

```bash
npm install
npm run dev          # then open the printed URL and go to #/io-chat
# or test the production build:
npm run build && npm run preview
```

On the page: pick a model → **Download & start the brain** (first load pulls the
weights) → ask in Georgian or English, or tap a starter question. The 📚 chips
under each answer show which course chapters it drew from.

> **Note for automated/headless testing:** the LLM itself needs WebGPU, which
> headless Chromium in CI generally can't provide — so the *retrieval* layer is
> what's unit-tested (feed queries to `retrieve()` and assert the right chapter
> comes back); the *generation* is verified by a human in a real browser.

---

## 8. Updating the course content

The course lives on the government platform and `ioCourse.js` is generated from
it — don't hand-edit the chunks. To refresh:

1. Pull the course from the Moodle web-service API (`core_course_get_contents`,
   `courseid=18`) using a `login/token.php` token — the label modules hold the
   lesson HTML.
2. Strip the HTML to text, split into ~240–900-char chunks per chapter.
3. Regenerate `src/content/ioCourse.js` with the same shape as above.

Because retrieval is language-agnostic lexical matching, adding/re-chunking
content needs no other changes — the brain and prompt pick it up automatically.

---

## 9. Privacy & security

- **Local inference.** The model and the course are downloaded to the browser;
  the user's questions are processed on their own GPU and **never sent to any
  server**. There is no backend, no logging, no API key.
- **Public content.** The course text ships inside the public site bundle. This
  is fine here because the material is public government cyber-awareness
  content; the platform owner confirmed it may be public.
- **No data collection.** IO never asks for or stores personal data, and is
  instructed to refuse it if offered.

---

## 10. Alternative backend (saved, not active)

An earlier version routed IO through the **Google Gemini API** instead of the
in-browser model. It lives on the **`io-chat-gemini`** branch
(`src/chat/llmClient.js` + `src/chat/useIoChat.js`): SSE streaming, key
resolution from `VITE_GEMINI_API_KEY` / a pasted key in `localStorage`, and
model fallbacks. It was shelved because Gemini's free tier wasn't available for
the project's account (HTTP 429, `limit: 0`) and because a server-side key would
have to be proxied to stay private. The in-browser Qwen version is the current
demo. If a hosted, private, course-only tutor is ever needed, the clean path is
a small serverless proxy that holds the course + key server-side and streams
back only the answer.

---

## 11. Limitations & known trade-offs

- **First load is heavy** (0.9–4.6 GB) and needs WebGPU — desktop Chrome/Edge
  only. Not usable on most phones.
- **Small models drift.** 1.5B especially can wander off the course or produce
  weaker Georgian; 7B is much more faithful. The prompt hardens against drift
  but can't fully prevent it — hence the human-in-the-loop testing.
- **Lexical retrieval** can miss a synonym the course never uses; if the right
  chunk isn't retrieved, IO will (correctly) say it's not covered rather than
  guess.
- **Demo only.** Hidden route, not linked publicly, not on the production
  branch until approved.
