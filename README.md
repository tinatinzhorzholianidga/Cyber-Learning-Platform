# CyberHero · კიბერგმირი

A bilingual (Georgian + English) web platform that teaches cyber-hygiene to
different age groups through interactive missions and short, practical guides.

**Live site:** https://tinatinzhorzholianidga.github.io/Cyber-Learning-Platform/

## What's in this stage

- **Welcome page** — six age tracks plus a Teachers & Parents card. Two
  sections are active; the rest are polished "coming soon" previews.
- **Teachers & Parents hub** — three shelves (*Understand the risks · Act ·
  For school*) with full articles for every topic in the content spec
  (A1–A7, B1–B5, C1–C4), a printable Family Media Agreement, and an
  emergency playbook with Georgia-specific contacts (112, MIA cyber division).
- **Cyber Guardians** (grades 8–12) — ten interactive scenario missions
  (G1–G10) with points, progress, and a printable Guardian Certificate.
  Serious tone, scenario-first, never lecture-y.

Content source of truth: [`docs/cyberhero-topics-spec.md`](docs/cyberhero-topics-spec.md).
Brand reference: [`docs/cyberhero-prototype.html`](docs/cyberhero-prototype.html).

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

No backend, no login. Progress is stored in `localStorage`.

## Architecture

- **Vite + React** (JavaScript), `HashRouter` so deep links work on GitHub Pages.
- **i18n** — no hardcoded UI strings:
  - `src/i18n/en.js` / `src/i18n/ka.js` — UI dictionaries, addressed with `t('path.to.key')`.
  - Long-form content (articles, missions) lives in `src/content/` as data
    modules whose text leaves are `{ en, ka }` objects, rendered with `tx()`.
    This mirrors the translation-object pattern of the approved prototype.
- **Missions** are data-driven: `src/content/guardians/g*.js` files describe
  rounds (`choice`, `branch`, `flags`, `builder`) that generic engine
  components in `src/games/` render. Adding a mission = adding a data file.
- **Progress** — `src/store/progress.jsx`, versioned `localStorage` schema.
- **Styling** — hand-written CSS design tokens in `src/styles/global.css`
  (no UI framework; light bundle for school machines). Self-hosted Noto Sans
  Georgian covers both scripts.
- **Accessibility** — keyboard navigable, visible focus rings, WCAG AA
  contrast, `prefers-reduced-motion`, alt text / `aria-hidden` on decorative
  emoji, ≥44 px touch targets.

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` builds the site on every push (to `main` or
the current stage branch) and publishes `dist/` to the **`gh-pages`** branch.
Vite's `base` is set to `/Cyber-Learning-Platform/` in `vite.config.js`.

**One-time setup (repo admin, ~10 seconds):** GitHub does not allow the
workflow token to change Pages settings, so after the first deploy run go to
**Settings → Pages → Build and deployment → Source: "Deploy from a branch"
→ Branch: `gh-pages` / `/ (root)`** and save. From then on every push
publishes automatically to
https://tinatinzhorzholianidga.github.io/Cyber-Learning-Platform/.

(Background: the repo's auto-created `github-pages` environment rejects
deployments from the stage branch, which blocks the `actions/deploy-pages`
flow — the `gh-pages` branch flow avoids that entirely.)

## Content rules (from the spec)

- Bilingual KA/EN everywhere; Georgian is draft quality pending native review,
  but always complete and never mixed with English in the UI.
- Sensitive topics (sextortion, grooming, bullying) follow NCMEC victim-first
  framing: never blame, no fear-mongering, always a concrete next step and a
  trusted adult. No graphic content.
- Stats carry their source (APA, Pew, NCMEC) in article footnotes.
