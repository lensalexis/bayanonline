# bayanonline

Standalone Vite build of the JeskoJets scroll experience for use in HubSpot (e.g. DepositFix HTML module). One CSS file, one JS file; you paste a mount div and the asset links.

## Setup

```bash
npm install
```

## Commands

- **`npm run dev`** — start Vite dev server (open the URL shown to test locally).
- **`npm run build`** — build for production.
- **`npm run preview`** — serve the built `dist/` folder locally.

## Output

After `npm run build`:

- **`dist/app.js`** — bundled JS (GSAP, ScrollTrigger, Lenis, markup, init logic).
- **`dist/app.css`** — bundled CSS (includes Google Fonts `@import`).

Upload both files to a CDN or host that gives you a public URL (e.g. `https://yoursite.com/assets/jesko/app.js` and `.../app.css`).

## HubSpot snippet

In your HubSpot page (e.g. HTML module), paste the following. Live deployment: [bayanonline.vercel.app](https://bayanonline.vercel.app/)

```html
<link rel="stylesheet" href="https://bayanonline.vercel.app/app.css">
<div id="jesko-mount"></div>
<script defer src="https://bayanonline.vercel.app/app.js"></script>
```

The script mounts the scroll block into `#jesko-mount` and runs the same GSAP + Lenis animation as the WordPress template. All logic is scoped to the mounted container.
