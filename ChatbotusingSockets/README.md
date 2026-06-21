# 🔒 Lumina Chat

A real-time, **AES-256 encrypted** chat application built with **React + Socket.io + Express + SQLite**. Messages are encrypted in the browser *before* they ever leave your device — the server and database only ever store ciphertext.

![stack](https://img.shields.io/badge/React-18-61dafb) ![stack](https://img.shields.io/badge/Socket.io-4-010101) ![stack](https://img.shields.io/badge/Express-4-000000) ![stack](https://img.shields.io/badge/SQLite-better--sqlite3-003b57) ![stack](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

## ✨ Features

- **End-to-end style AES-256 encryption** — plaintext is encrypted client-side; the DB only holds ciphertext.
- **Real-time everything** over WebSockets — messages, typing indicators, online/offline presence, read receipts.
- **Rooms & Direct Messages** — public rooms you can browse/create/join/leave, plus 1:1 DMs.
- **Rich messaging** — emoji reactions, replies, edit, soft-delete, copy, day separators, infinite scroll history.
- **Presence** — live online dots, "last seen" timestamps, multi-tab aware.
- **Auth** — JWT sessions, bcrypt-hashed passwords, password-strength meter, "remember me".
- **Insane UI** — glassmorphism, animated aurora background, gradient accents, Framer Motion transitions, fully responsive (desktop 3-pane → mobile tab bar).

---

## 🗂️ Project structure

```
ChatbotusingSockets/
├── server/                 # Express + Socket.io + SQLite backend
│   ├── index.js            # HTTP + Socket.io entry point
│   ├── db/database.js      # SQLite schema + first-run seeding
│   ├── routes/             # auth, rooms, messages, users REST endpoints
│   ├── socket/             # socketHandler + AES encryption helpers
│   └── middleware/         # JWT auth + rate limiting
└── client/                 # React + Vite + Tailwind frontend
    └── src/
        ├── context/        # Auth, Socket, Chat providers
        ├── pages/          # Login, Register, Chat, Settings, RoomsBrowser
        ├── components/      # ChatWindow, Sidebar, MessageBubble, …
        └── utils/          # api client + client-side AES
```

---

## 🚀 Getting started

### Prerequisites
- **Node.js 18+** and npm

### 1. Backend

```bash
cd server
cp .env.example .env        # already provided with working dev defaults
npm install
npm start                   # → http://localhost:5000
```

The first run automatically creates `chat.db` and seeds **3 demo users**, **3 rooms**, and a short encrypted conversation in `#general`.

### 2. Frontend (in a second terminal)

```bash
cd client
cp .env.example .env        # already provided with working dev defaults
npm install
npm run dev                 # → http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### 🧑‍💻 Running in GitHub Codespaces

It just works — no extra config. The Vite dev server **proxies** all `/api` and
`/socket.io` traffic to the backend, so the browser only ever talks to the
forwarded **5173** URL and there are no cross-origin / hardcoded-host issues.

1. Start both servers as above.
2. Open the **Ports** tab and click the 🌐 link for port **5173** (Codespaces
   forwards it automatically). That's the only port you need to open.
3. Log in and chat.

> You do **not** need to expose port 5000 — Vite reaches it over `localhost`
> inside the codespace. (If you ever want to hit the API directly from the
> browser instead of through the proxy, set `VITE_API_URL` to the forwarded
> 5000 URL and make that port **Public** in the Ports tab.)

> 💡 Run both at once from the project root:
> ```bash
> (cd server && npm start) & (cd client && npm run dev)
> ```

---

## 🔑 Demo accounts

Click **"Use demo account"** on the login screen, or sign in manually:

| Email            | Password   |
| ---------------- | ---------- |
| `alice@demo.com` | `demo1234` |
| `bob@demo.com`   | `demo1234` |
| `sara@demo.com`  | `demo1234` |

To see real-time messaging, open two browsers (or an incognito window), log in as two different users, and chat in a shared room or DM. You'll watch messages, typing indicators, and presence update live.

---

## ⚙️ Environment variables

**`server/.env`**

| Key                 | Description                                  | Dev default                        |
| ------------------- | -------------------------------------------- | ---------------------------------- |
| `PORT`              | Server port                                  | `5000`                             |
| `JWT_SECRET`        | Secret for signing auth tokens               | *(change in production)*           |
| `ENCRYPTION_SECRET` | AES key — **must match the client's**        | *(change in production)*           |
| `CLIENT_URL`        | Allowed CORS origin                          | `http://localhost:5173`            |

**`client/.env`**

| Key                       | Description                              | Dev default             |
| ------------------------- | ---------------------------------------- | ----------------------- |
| `VITE_API_URL`            | Backend base URL                         | `http://localhost:5000` |
| `VITE_ENCRYPTION_SECRET`  | AES key — **must match the server's**    | *(change in production)*|

> ⚠️ `ENCRYPTION_SECRET` and `VITE_ENCRYPTION_SECRET` **must be identical** or messages won't decrypt.

---

## 🏗️ Production build

```bash
cd client && npm run build      # outputs to client/dist
cd ../server && npm start       # serve API + sockets
```

Serve `client/dist` with any static host (or point a reverse proxy at it) and run the server alongside it.

---

## 🔐 How the encryption works

1. You type a message → the React client encrypts it with **AES-256** (crypto-js) using the shared secret.
2. Only the **ciphertext** travels over the socket.
3. The server decrypts to sanitize/validate length, then **re-encrypts** before writing to SQLite — so `chat.db` never contains plaintext.
4. On delivery, each client decrypts locally to display the message.

If someone copies `chat.db`, they get nothing but gibberish. 🔒

---

## 🧰 Tech stack

| Layer     | Tech                                                        |
| --------- | ---------------------------------------------------------- |
| Frontend  | React 18, Vite, Tailwind CSS, Framer Motion, socket.io-client |
| Backend   | Express, Socket.io, better-sqlite3, JWT, bcryptjs          |
| Crypto    | crypto-js (AES-256, OpenSSL-compatible on both ends)       |

---

## 📜 npm scripts

**server**
- `npm start` — run the server
- `npm run dev` — run with `node --watch` (auto-restart)

**client**
- `npm run dev` — Vite dev server with HMR
- `npm run build` — production build
- `npm run preview` — preview the production build

---

Built with ♥ — every message AES-256 encrypted, end to end.
