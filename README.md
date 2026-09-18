# IO for main page 🤖

**IO** (Georgian: **იო**) is the friendly 3D robot of the CyberHero platform. This
repository puts him on the **front door** of the Government of Georgia's
e-learning platform, **elearning.gov.ge** — as a bilingual **welcome host** who
greets visitors and helps them choose where to go:

| Path | Who it's for | Where it leads |
|---|---|---|
| **კიბერუსაფრთხოების საბაზისო კურსი** (Basic Cybersecurity Course) | adults, employees, anyone | `https://elearning.gov.ge/course/view.php?id=18` |
| **კიბერგმირი / CyberHero** | kids, teens, parents, teachers | `https://tinatinzhorzholianidga.github.io/Cyber-Learning-Platform/` |

On this page IO is a **host, not a teacher**: he welcomes, introduces himself,
routes you to the right course, reacts when you hover a path, and explains the
small print (login, certificate, language). He gives **no cyber-security tips**
here — those live inside the courses.

This is a standalone project. It does not modify the CyberHero repository; it
reuses IO's 3D character code by copy.

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
- **Embed mode** for dropping IO into the real Moodle page (see below).
- Georgian is the default language; the choice is remembered (`localStorage`)
  and can be forced with `?lang=ka|en`.

Accessibility: the bubble is an `aria-live` region, the canvas has an `aria-label`,
cards are real links (keyboard + screen-reader friendly), there's a skip link,
and `prefers-reduced-motion` switches IO to a still, on-demand render.

---

## Files

```
index.html                 page shell, Georgian + Inter web fonts
src/main.jsx               React entry
src/App.jsx                the welcome page (top bar, hero, path cards, footer, embed mode)
src/styles/global.css      DGA palette + layout, responsive, embed styles
src/i18n/ui.js             UI strings (KA/EN): titles, card texts, buttons
src/content/hints.js       IO's SPEECH (KA/EN) — everything he says on this page
src/mascot/hostBrain.js    which line he says when (greeting, cycle, hover, farewell) + his mood per line
src/mascot/IoHost.jsx      IO + bubble: entrance, typewriter, click cycle, hover/farewell API
src/mascot/RobotCanvas.jsx 3D stage (three.js / react-three-fiber), WebGL fallback, reduced motion
src/mascot/RobotModel.jsx  IO's 3D model (copied from CyberHero — Original + Metal skins)
src/mascot/faceTexture.js  IO's face (canvas texture: eyes, moods, DGA plate)
scripts/check-hints.mjs    sanity checks for hints.js (parity, length, emoji, no cyber tips)
.github/workflows/deploy.yml  builds and publishes to GitHub Pages on every push to main
```

---

## IO's lines — `src/content/hints.js`

All of IO's speech is one plain data file. Each category is an array of
`{ en, ka }` lines; the host picks from them round-robin so nothing repeats
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
thinking, excited, celebrate, sleepy) are in `src/mascot/hostBrain.js`.

The copy was produced with a small design process: three independent writers
(concierge / character / Georgian-first), a native-Georgian editor and a UX
writer as judges, and a final synthesis in one consistent register. Rules every
line follows: ≤ 110 characters per language, at most one emoji, **no
cyber-security advice**, native Georgian (no calques).

**Editing:** change the text in `hints.js`, then run

```bash
npm run check
```

which verifies every category exists in both languages, flags lines that are
too long for the bubble or carry more than one emoji, and warns if a line
looks like a cyber tip or leaks Latin letters into Georgian.

---

## Running it

```bash
npm install
npm run dev        # local dev server
npm run build      # production build into dist/
npm run preview    # serve the production build
```

Query parameters:

| Param | Effect |
|---|---|
| `?lang=ka` / `?lang=en` | force the language (also remembered) |
| `?embed=1` | render only IO + bubble on a transparent background (for an iframe) |
| `?size=260` | IO's stage size in embed mode (px) |
| `?skin=metal` | the metal-droid IO instead of the original |

---

## Embedding IO in the real elearning.gov.ge page

The simplest, theme-independent way is an **iframe** in the Moodle front page
(an HTML block or the theme's front-page region):

```html
<iframe
  src="https://tinatinzhorzholianidga.github.io/IO-for-main-page/?embed=1&lang=ka&size=260"
  title="იო - კიბერუსაფრთხოების გზამკვლევი"
  width="340" height="400"
  style="border:0;background:transparent"
  loading="lazy"
  allowtransparency="true"></iframe>
```

Use `lang=en` for the English page. The whole welcome page can also simply be
linked, or the redesigned front page can be built on this project directly
(`App.jsx` is the page; `IoHost` is the reusable piece).

---

## Deploying

The included GitHub Actions workflow builds the site and publishes it to
**GitHub Pages** on every push to `main`. One-time setup in the repository:
**Settings → Pages → Source: GitHub Actions.** The site then lives at
`https://<owner>.github.io/IO-for-main-page/` (`base` in `vite.config.js` must
match the repository name).

---

## Privacy

Static site, no backend, no cookies, no analytics. The only thing stored is the
chosen language, in the visitor's own browser.
