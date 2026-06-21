# 🛍️ Velora — Premium 3D Storefront

**An animated e-commerce demo storefront.** Browse and filter products, spin a
**3D product viewer**, manage a cart and wishlist, and run a polished multi-step
checkout — with auth, order history, and a dark/light theme. A front-end-only app:
all state lives in the browser, no backend required.

---

## ✨ Features

- 🛒 **Cart & wishlist** — add/remove, quantity steppers, move-to-cart, synced across tabs.
- 🧊 **3D product viewer** — toggle Photo ↔ 3D (Three.js + OrbitControls) on product pages.
- 💳 **Animated checkout** — 3-step flow with a card-flip preview, coupon codes (`VELORA10`, `WELCOME15`), and confetti.
- 👤 **Auth & profile** — login/register with a password-strength meter, order history (mock/local).
- 🎚️ **Filters & sort** — animated product listing.
- 🌗 **Dark / light theme** — with a custom palette.

---

## 🛠 Tech stack

| Layer | What we used |
|-------|--------------|
| **Framework** | React 18 + React Router v6, Vite |
| **Styling** | Tailwind CSS 3 (custom dark "ink" palette), PostCSS, Autoprefixer |
| **Animation** | Framer Motion |
| **3D** | Three.js (product viewer with OrbitControls) |
| **State / storage** | React Context + `sessionStorage` / `localStorage` (no backend, no real payments) |

---

## 📁 Project structure

```
Velora/  (folder: ECommerce)
├── index.html
├── vite.config.js          # dev server on :5173
├── tailwind.config.js      # theme: colors, fonts, animations
├── package.json            # name: velora-store
└── src/
    ├── main.jsx            # app entry (context providers)
    ├── App.jsx             # router + layout
    ├── index.css
    ├── pages/              # Home, Products, ProductDetail (3D), Wishlist, Checkout, Login, Register, Profile
    ├── components/         # Navbar, CartDrawer, ProductCard, FloatingInput, PasswordStrength, Reviews, Stars, …
    ├── context/            # Auth, Cart, Wishlist, Theme, RecentlyViewed
    ├── hooks/              # useSession, useLocal (storage wrappers with cross-tab sync)
    └── data/               # products.js (catalog), productImages.js, users.js (demo login)
```

---

## 🚀 Getting started

```bash
cd ECommerce
npm install
npm run dev                 # http://localhost:5173
```

**Production build**
```bash
npm run build
npm run preview
```

**Demo login** — email `alex@demo.com`, password `demo1234` (or register / use guest checkout).

---

_Part of the workspace alongside Foliofy, SyncScribe, Algoscope, ResumeIQ and Lumina Chat._
