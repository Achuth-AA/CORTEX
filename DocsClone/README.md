# 📝 SyncScribe

**A real-time collaborative document editor.** Create documents, write in a
rich-text editor, and edit the *same document from multiple tabs/people at once* —
every keystroke syncs live. Starter templates, auto-save, and a feedback inbox,
all on a local SQLite database.

> Open a document in two tabs (or share the link) and watch edits appear in both
> instantly.

---

## ✨ Features

| | Feature | What it does |
|--|---------|--------------|
| 🤝 | **Real-time collaboration** | Edits broadcast live to everyone in the same document via Socket.IO rooms. |
| ✍️ | **Rich-text editor** | Full Quill toolbar: headings, fonts, colours, lists, alignment, code blocks, links, images. |
| 🧩 | **Templates** | Resume, Cold Email, Cover Letter, Meeting Notes, Project Proposal, Blog Post, or blank — pre-formatted. |
| 💾 | **Auto-save** | Content **and** title persist to SQLite every 2 seconds. |
| 🗂 | **Dashboard** | A documents grid with search, create, open, and delete. |
| 💡 | **Feedback inbox** | A suggestions form whose submissions are saved to the database. |
| 🔗 | **Shareable URLs** | Each document lives at `/documents/<id>`. |

---

## 🛠 Tech stack

| Layer | What we used |
|-------|--------------|
| **Frontend** | React 18, Vite, React Router, **Quill** (rich-text), **socket.io-client** |
| **Backend** | Python 3, Flask, **Flask-SocketIO** (threading mode + `simple-websocket`), Flask-CORS |
| **Database** | SQLite (Python stdlib) — `backend/docs.db` |
| **Realtime** | Socket.IO rooms keyed by document id (delta broadcast + periodic save) |

---

## 📁 Project structure

```
SyncScribe/  (folder: DocsClone)
├── backend/
│   ├── app.py             # Flask REST (documents CRUD + feedback) and Socket.IO events
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── vite.config.js     # dev proxy: /api and /socket.io → :5002
    ├── package.json
    └── src/
        ├── main.jsx       # router (/, /documents, /documents/:id)
        ├── api.js         # REST client
        ├── socket.js      # same-origin Socket.IO connection
        ├── index.css
        ├── pages/
        │   ├── Landing.jsx   # marketing landing page
        │   ├── Home.jsx      # documents dashboard (templates + search)
        │   └── Editor.jsx    # Quill editor wired to Socket.IO + autosave
        ├── components/
        │   ├── TemplateGallery.jsx
        │   └── FeedbackModal.jsx
        ├── data/templates.js # the document templates (Quill deltas)
        └── hooks/useCreateDoc.js
```

---

## 🚀 Getting started

**1. Backend (Flask + Socket.IO + SQLite)**
```bash
cd DocsClone/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py            # API + websockets on http://localhost:5002
```

**2. Frontend (React + Vite)**
```bash
cd DocsClone/frontend
npm install
npm run dev              # http://localhost:5176  (proxies /api + /socket.io → :5002)
```

Open **http://localhost:5176**, create a document, then **open the same document
URL in a second tab** to see live collaboration.

**Production** — `cd frontend && npm run build`, then `python app.py` serves the
built app from Flask at `:5002`.

---

## 🔌 API

### REST
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/health` | Status |
| `GET` / `POST` | `/api/documents` | List / create documents |
| `GET` / `PATCH` / `DELETE` | `/api/documents/<id>` | Fetch / rename / delete a document |
| `POST` / `GET` | `/api/feedback` | Submit / list suggestions |

### Socket.IO (room = document id)
| Event | Direction | Effect |
|-------|-----------|--------|
| `get-document` | client → server | Join room, server replies `load-document {title, data}` |
| `send-changes` | client → server | Relay `receive-changes` to others in the room |
| `save-document` | client → server | Persist the document to SQLite |

---

_Part of the workspace alongside Foliofy, Algoscope, ResumeIQ, Lumina Chat and Velora._
