# Maison Élan — Boutique Landing Page

An elegant, fully responsive landing page for a boutique fashion business, built with **React + Vite** and animated with **Framer Motion**.

## Highlights

- **Hero** — full-screen imagery with a slow ken-burns zoom, parallax on scroll, staggered text reveals
- **Marquee** — infinite scrolling announcement strip (pauses on hover)
- **Collections** — 4-card edit grid with hover zoom and rotating arrow micro-interaction
- **Story** — split layout with gold picture frame accent and animated stat counters
- **Featured** — product cards with slide-up "Add to bag" reveal
- **Testimonials** — auto-rotating quote carousel with manual dots
- **Newsletter** — email capture over a dimmed lifestyle image
- **Mobile** — hamburger drawer menu, single-column grids, fluid `clamp()` type; respects `prefers-reduced-motion`

## Stack

- React + Vite
- Framer Motion (scroll reveals, parallax, transitions)
- lucide-react icons
- Plain CSS with custom properties — no framework
- Fonts: Cormorant Garamond (display) + Jost (body)

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Images are loaded from Unsplash; swap the URLs in `src/data.js` for your own product photography.
