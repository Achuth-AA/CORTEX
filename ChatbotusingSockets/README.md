# 🔒 Lumina Chat

**A real-time, end-to-end encrypted chat app.** Messages are encrypted in the
browser (AES-256) before they're sent, so the server and database only ever store
ciphertext. Rooms, direct messages, presence, typing indicators, reactions, read
receipts and JWT auth — in a polished, glassmorphism UI.

---

## ✨ Features

- 💬 **Real-time messaging** — rooms & direct messages over WebSockets, with typing indicators and presence.
- 🔐 **End-to-end AES-256 encryption** — messages encrypted client-side; the backend stores only ciphertext.
- 😀 **Reactions, editing & soft-delete** — emoji reactions, edit/delete, and read receipts.
- 🔑 **Auth** — JWT sessions with bcrypt-hashed passwords.
- 🎨 **Polished UI** — responsive, glassmorphism design with animations.

---

## 🛠 Tech stack

| Layer | What we used |
|-------|--------------|
| **Frontend** | React 18, Vite, Tailwind CSS 3, Framer Motion, **socket.io-client**, `crypto-js` (AES-256) |
| **Backend** | **Node.js + Express 4**, **Socket.io 4** |
| **Database** | SQLite via **better-sqlite3** |
| **Auth & crypto** | `jsonwebtoken` (JWT), `bcryptjs` (password hashing), `crypto-js` (AES-256) |

> Note: unlike the Python projects in this workspace, Lumina Chat has a
> **Node.js/Express** backend.

---

## 📁 Project structure

```
Lumina Chat/  (folder: ChatbotusingSockets)
├── client/                         # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js              # dev server + proxy (/api, /socket.io → :5000)
│   ├── tailwind.config.js
│   ├── package.json                # name: lumina-chat-client
│   └── src/
│       ├── main.jsx · App.jsx      # entry + router
│       ├── pages/                  # Login, Register, Chat, RoomsBrowser, Settings
│       ├── components/             # Sidebar, ChatWindow, MessageBubble, MessageInput, EmojiPicker, …
│       ├── context/                # AuthContext, SocketContext, ChatContext
│       ├── hooks/                  # useSocket, useEncryption, useMessages
│       ├── utils/                  # api.js, encryption.js (AES-256 helpers)
│       └── data/demoUsers.js
└── server/                         # Express + Socket.io backend
    ├── index.js                    # HTTP + Socket.io server entry
    ├── package.json                # name: lumina-chat-server
    ├── db/database.js              # SQLite schema, init, seeding
    ├── routes/                     # auth, rooms, messages, users
    ├── socket/                     # socketHandler.js, encryption.js
    └── middleware/                 # auth (JWT), rateLimit
```

---

## 🚀 Getting started

**1. Backend (Express + Socket.io + SQLite)**
```bash
cd ChatbotusingSockets/server
cp .env.example .env        # dev defaults provided
npm install
npm start                   # API + websockets on http://localhost:5000
# or: npm run dev           # auto-restart on changes
```

**2. Frontend (React + Vite)**
```bash
cd ChatbotusingSockets/client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173  (proxies /api + /socket.io → :5000)
```

**Production** — `cd client && npm run build`, then run the server to host the API
and sockets.

---

_Part of the workspace alongside Foliofy, SyncScribe, Algoscope, ResumeIQ and Velora._
