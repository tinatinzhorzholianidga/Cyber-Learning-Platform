# CyberHero → elearning.gov.ge Integration Dossier

This document briefs the engineer (or Claude session) integrating **CyberHero
(კიბერგმირი)** into the **CyberMasterDGA/elearning** website as a section
(e.g. `mainwebsite.com/cyberhero/`). It captures everything about THIS
codebase that the integration needs. It was written from inside the CyberHero
repo; the author could not see the elearning repo, so all host-side decisions
are marked ⚠️ DECIDE IN HOST.

## 1. What this app is

Bilingual (Georgian-first + English) cyber-hygiene learning platform, fully
client-side, no backend, no sign-up, no analytics. Four functional areas:

| Area | Routes | Notes |
|---|---|---|
| Welcome + age tracks | `/`, `/track/:tierId` | 6 age tiers, 2 live sections, rest "coming soon" |
| Cyber Guardians (teens) | `/guardians`, `/guardians/mission/:id`, `/guardians/certificate` | 10 interactive missions (4 round engines), points, final exam (timed, 80% pass), printable certificate |
| Teachers & Parents | `/parents`, `/parents/:articleId`, `/parents/agreement` | 16 articles (a1-a7, b1-b5, c1-c4), printable Family Media Agreement |
| IO mascot | site-wide widget + `/mascot-demo`, `/io-chat` (both unlisted demo pages) | 3D robot companion; in-browser AI tutor |

## 2. Stack

- **React 18.3 + Vite 5**, plain JSX, no TypeScript, no CSS framework.
- **react-router-dom 6 with `HashRouter`** (chosen for GitHub Pages; a host
  with real server routing should switch to `BrowserRouter` — see §6).
- **Styling:** one file, `src/styles/global.css` (~2800 lines). Design tokens
  as CSS custom properties on `:root` (brand purple `--brand`, etc.).
  All classnames are plain and unprefixed (`.play-card`, `.mascot-widget`…) —
  ⚠️ collision risk in host; consider prefixing or CSS-module-izing on import.
- **Fonts:** `@fontsource-variable/noto-sans-georgian` (npm, self-hosted).
- **3D mascot:** `three` 0.169 + `@react-three/fiber` 8 (React-18-compatible
  major). Hand-built geometry, no GLTF assets, no textures except a
  canvas-generated face (`src/mascot/faceTexture.js`).
- **AI chat:** `@mlc-ai/web-llm` 0.2.x — Qwen2.5 runs in-browser via WebGPU;
  model weights (~1-2 GB) download at user request from HuggingFace/MLC CDN
  and are cached by the browser. RAG over `src/content/ioCourse.js` (the
  Basic Cybersecurity Course from elearning.gov.ge). Nothing leaves the
  device; no API keys. ⚠️ needs CSP/network allowances for the model CDN.

## 3. Source layout (all under `src/`, ~5100 lines + CSS)

- `content/` — ALL text lives here as data files; every leaf is `{en, ka}`.
  `guardians/g1-g10.js` (missions), `guardians/meta.js` (cards/emoji/order),
  `parents/articles/*.js`, `parents/agreement.js`, `tiers.js`, `mascot.js`
  (contextual tips per route), `ioCourse.js` (AI knowledge base).
- `games/` — 4 reusable round engines: `ChoiceRound` (quiz + optional timer),
  `FlagsRound` (multi-select red flags), `BuilderRound` (build-a-defense
  meter), `BranchRound` (branching chat stories). Contract documented in
  `content/guardians/index.js` header comment.
- `i18n/` — tiny homegrown context: `useI18n()` → `t('dot.path')` for UI
  strings (`en.js`/`ka.js`, keys mirror-checked by QA script) and `tx({en,ka})`
  for content leaves. Language persisted in `localStorage`.
- `store/progress.jsx` — mission completion/points/exam state, React context
  over `localStorage`.
- `mascot/` — `MascotProvider` (companion brain: wrong answer → IO explains
  in speech bubble with thinking face; correct → move + praise; mission done
  → fireworks), `MascotWidget` (floating dock, cursor-following, lazy-loaded
  ~1s after paint so three.js never blocks first render), `Fireworks.jsx`
  (dependency-free canvas 2D), `RobotModel`/`HeroModel` (two characters),
  skins (`classic`/`metal`), builder variant (hard hat) for coming-soon pages.
- `pages/` — route components; `MascotDemoPage` and `IoChatPage` are
  demo/testing rooms reachable only by URL.

## 4. State & persistence (browser-only)

- `localStorage["cyberhero.progress.v1"]` — missions/points/exam.
- `localStorage["cyberhero.lang"]` — `'ka' | 'en'` (default **ka**).
- WebLLM caches model weights in browser Cache/IndexedDB.
No server, no DB, no cookies. If the host has accounts, progress COULD later
move server-side, but the "no sign-up" property is a deliberate feature.

## 5. Build & QA

- `npm run build` → static `dist/` (~1 MB gz total; three.js and web-llm are
  route-level lazy chunks, main bundle stays small).
- `scripts/check-content.mjs` — content QA: en/ka key parity, mission-schema
  validation, spec limits. `scripts/smoke.mjs` — Playwright smoke of every
  route in both languages, console-error check. Both must stay green.
- Georgian copy was professionally proofread (Shanidze-school norms; plain
  hyphens instead of em-dashes are an intentional style choice; scam-message
  props intentionally contain realistic informal Georgian).

## 6. Porting notes for the host (⚠️ all DECIDE IN HOST)

1. **Routing:** replace `HashRouter` with the host's router. All internal
   links use react-router `Link`/`useNavigate` — no hardcoded hash URLs in
   components. Mount everything under a base path (e.g. `/cyberhero`): with
   react-router use `<Routes>` nested under the section path or `basename`;
   with Next.js App Router, map each route to a directory page and swap
   `Link`s. `vite.config.js base` and `public/.nojekyll` are GitHub-Pages
   artifacts — drop them in the host.
2. **If the host is not React:** the clean seam is to keep CyberHero as a
   built static bundle served under `/cyberhero/` (set Vite `base` to
   `/cyberhero/`, switch to `BrowserRouter` with `basename`, add a server
   rewrite of `/cyberhero/* → its index.html`). Full rewrite into another
   framework is only worth it if the host team wants to own the code.
3. **If the host is React/Next:** port as a self-contained feature folder
   (`features/cyberhero/`), keep the content/data files verbatim (they are
   the product), re-export pages into host routes, wrap `global.css` under a
   `.cyberhero-root` scope or convert tokens to the host's design system.
4. **Header/Footer:** the app has its own; in the host, drop them and let the
   host chrome wrap the pages. The language toggle must then live in (or
   sync with) the host's language mechanism — keep `cyberhero.lang` in sync
   or replace `I18nContext` reads with the host's locale.
5. **Print styles:** certificate and agreement pages rely on `@media print`
   rules in `global.css` — carry them over.
6. **IO widget:** mount `MascotProvider` + lazy `MascotWidget` + `Fireworks`
   at the section layout level (NOT site-wide in the host, unless wanted).
   It needs `useLocation` for contextual tips and the progress store for
   celebrations.
7. **Reduced motion / no WebGL:** already handled (static fallbacks) — keep.
8. **A11y:** skip-link, aria-live bubbles, focus styles, lang attributes are
   in place; preserve when re-chroming.

## 7. Suggested integration order (incremental, each step shippable)

1. Branch in elearning repo (never touch its main).
2. Static-bundle mount OR feature-folder port (per host stack, see §6.2/6.3).
3. Route smoke in host: `/cyberhero/` renders welcome in KA, lang toggle works.
4. Missions + progress + certificate verified (play one mission end-to-end).
5. Parents hub + printables verified (print preview).
6. IO widget enabled for the section; verify CSP for web-llm if `/io-chat`
   is kept (it can also be excluded initially - it is an unlisted demo).
7. Host-wide nav link to the section; QA scripts adapted or re-run here.

## 8. Contact points in this repo

- Live reference deployment: https://tinatinzhorzholianidga.github.io/Cyber-Learning-Platform/
- Deploy pipeline: `.github/workflows/deploy.yml` (build → sync main → Pages).
- The two demo rooms for stakeholder review: `#/mascot-demo`, `#/io-chat`.
