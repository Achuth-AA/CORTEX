# Boutique — Frontend

A responsive, mobile-first site for an Indian tailoring boutique, built with React 19 and Vite: a marketing landing page plus an atelier management app (clients, measurements, transactions, dashboard).

## Data & Supabase

Records live in a Supabase Postgres database (`measurements` and `transactions` tables) with realtime enabled — changes on one device appear live on every other open session. The data layer is `src/DataProvider.jsx` (fetch, insert/update/delete, realtime subscription) exposed via the `useData()` hook in `src/dataContext.js`; the client is created in `src/lib/supabase.js`.

Setup: copy the project credentials into `boutique-fe/.env` (git-ignored):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key>
```

Note: the tables currently allow full anonymous access via RLS policies (no login yet). Before going public, add Supabase Auth and tighten the policies.

## App pages

- **Clients** — searchable directory built from saved records; per-client detail view with measurement profiles, transactions, balance due, edit/delete, and record-payment
- **Measurements** — multi-garment Indian tailoring measurements (Blouse, Kurti, Salwar, Lehenga, Anarkali, Frock, Petticoat) typed in inches or uploaded as a sheet photo/PDF; edit mode updates saved profiles
- **Transactions** — billing ledger with amounts (₹), payment method, derived Paid/Partial/Pending status, optional bill attachment, and totals
- **Dashboard** — KPI tiles, revenue-by-month chart, garments-by-type, payment-method split (palette validated for colorblind safety); shows labeled sample data until records exist

## Landing sections

- **Navbar** — transparent over the hero, frosted and solid on scroll; full-screen animated menu on mobile
- **Hero** — full-viewport imagery with slow zoom and staged entrance
- **Marquee** — scrolling brand ticker
- **Collections** — four curated edits with hover zoom and staggered reveal
- **New Arrivals** — product cards; swipeable snap-scroll row on mobile, grid on desktop
- **Story** — brand narrative with stats
- **Testimonials** — auto-rotating quotes with manual dots
- **Newsletter** — signup with success state
- **Footer** — link columns and social

## Getting started

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run lint     # eslint
```

## Design notes

- Typography: Cormorant Garamond (display) + Jost (body), loaded from Google Fonts
- Palette: cream `#faf7f2`, ink `#1a1816`, gold `#b08d57` — defined as CSS variables in `src/index.css`
- Mobile-first CSS with breakpoints at 560 / 640 / 720 / 820 / 900 / 920 / 1080 px
- Scroll reveals via `IntersectionObserver` (`src/components/Reveal.jsx`); all motion respects `prefers-reduced-motion`
- Imagery served from Unsplash
