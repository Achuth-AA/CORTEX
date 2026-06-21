# Lumina — Premium 3D Storefront

A fully functional, animated e-commerce demo built with **React + Vite**,
**Tailwind CSS**, **Framer Motion**, and **Three.js** (`@react-three/fiber`
+ `@react-three/drei`). No backend — all data is local and all user state
(auth, cart, wishlist, orders) persists in **sessionStorage**.

## ✨ Features

- **Landing page** — animated headline reveal, parallax hero, floating product
  cards, featured categories, trending grid.
- **Product listing** — animated filter sidebar (category / price / rating),
  sort dropdown, skeleton loading shimmer, responsive grid.
- **Product detail** — **Photo View ⇄ 3D View** toggle. The 3D viewer renders a
  category-appropriate auto-rotating mesh (metallic box / torus / sphere /
  cylinder) with OrbitControls (drag to rotate, scroll to zoom), warm + cool
  lighting, and a fading "drag to rotate" hint. Animated size/color selectors,
  add-to-cart micro-animation, wishlist heart, related-products carousel.
- **Wishlist** (`/wishlist`) — saved items with Move-to-Cart / Remove, animated
  exit, empty state.
- **Cart drawer** — slide-in from the right, quantity steppers with animated
  number transitions, swipe-out removal, live subtotal.
- **Checkout** (`/checkout`, protected) — 3-step flow (Shipping → Payment →
  Confirm) with progress bar, floating-label validation, **animated card flip
  preview** with card-type auto-detection, and a success screen with an
  animated checkmark + confetti + order ID.
- **Auth** — Login / Register with floating labels, password-strength meter,
  shake-on-error, guest checkout, auto-login after registration.
- **Profile** (`/profile`, protected) — avatar initials, inline name edit,
  order history, wishlist summary, logout.
- **Navbar** — auth-aware, animated cart/wishlist badges, active-link layout
  animation, mobile slide-down menu, dark/light theme toggle (dark by default).
- Cart & wishlist **sync across tabs/components** via sessionStorage events.

## 🚀 Getting started

```bash
cd ECommerce
npm install
npm run dev
```

Then open the printed local URL (default http://localhost:5173).

The 3D libraries are part of `package.json`, but if you ever need to add them
to a fresh project:

```bash
npm install three @react-three/fiber @react-three/drei framer-motion
```

### Build for production

```bash
npm run build
npm run preview
```

## 🔑 Demo account

A seed user is preloaded so you can log in immediately:

```
Email:    alex@demo.com
Password: demo1234
```

You can also register a new account (auto-logs you in) or use **guest
checkout** from the login page.

## 🗂 sessionStorage schema

| Key           | Value |
| ------------- | ----- |
| `users`       | array of all registered users `{ id, name, email, password, createdAt }` |
| `currentUser` | logged-in user `{ id, name, email }` (cleared on logout) |
| `cart`        | `[{ productId, name, price, image, size, color, quantity }]` |
| `wishlist`    | `[{ productId, name, price, image, badge }]` |
| `lastOrder`   | `{ orderId, items, total, shippingDetails, placedAt }` |
| `theme`       | `"dark"` \| `"light"` |

All reads/writes go through the custom `useSession()` hook
(`src/hooks/useSession.js`), which wraps sessionStorage with JSON
parse/stringify and broadcasts a `session-sync` event so every component and
tab stays in sync.

## 🧱 Tech stack

React 18 · React Router v6 · Tailwind CSS 3 · Framer Motion 11 · Three.js ·
@react-three/fiber · @react-three/drei · Vite 5.

## 📁 Structure

```
src/
├── components/        Navbar, CartDrawer, ProductCard, ProtectedRoute,
│   │                  PasswordStrength, FloatingInput, Spinner, icons…
│   └── viewer/        ProductViewer3D, ProductMesh, ViewerToggle
├── pages/             Home, Products, ProductDetail, Wishlist, Checkout,
│                      Login, Register, Profile
├── context/           Cart, Wishlist, Auth, Theme providers
├── hooks/             useSession
└── data/              products, users
```

> This is a front-end demo. Card and login fields are dummy/local only — no
> real payment or authentication takes place.
