# 🧩 PortfolioGenerator


Fill in a form, watch your portfolio render **live**, and download a complete,
**deploy-ready** website as a ZIP — proper README and all. Built with a
**React + Vite** frontend, a **Python / Flask** backend, and a **local SQLite**
database.

> User fills in their information → the backend generates an entire project
> folder (website + résumé + deploy kit + README) → download it as a ZIP and
> ship it anywhere.

---

## ✨ Features

| | Feature | What it does |
|--|---------|--------------|
| 🎯 | **Portfolio generator** | Turns your details into a self-contained static site and zips the whole project. |
| 🪄 | **4 distinct themes** | Aurora, Neon, Minimal, Terminal — plus a custom accent colour. |
| 👁 | **Live preview** | The portfolio re-renders in an iframe as you type (desktop / tablet / mobile). |
| 📊 | **Completeness score + suggestions** | Heuristic 0–100 score, A+–D grade, and specific tips on what to add. |
| 📄 | **PDF résumé** | A matching one-page `resume.pdf` is bundled in the ZIP. |
| 🔳 | **QR code** | An SVG QR to your site/profile, shown in the UI and bundled as `assets/qr.svg`. |
| 🚀 | **One-click deploy kit** | ZIP ships with GitHub Pages workflow, Netlify, Vercel and Docker/nginx configs. |
| 🗂 | **History (SQLite)** | Every generation is saved — reload it into the editor or re-download anytime. |

The generated ZIP contains:

```
your-name-portfolio/
├── index.html              # the website
├── styles.css              # theme styling
├── script.js               # dark/light toggle, typed effect, scroll reveals
├── resume.pdf              # matching résumé (or resume.html fallback)
├── assets/qr.svg           # QR code
├── data.json               # the data it was built from
├── README.md               # proper, project-specific docs
├── LICENSE                 # MIT
├── .github/workflows/deploy.yml
├── netlify.toml · vercel.json
└── Dockerfile · nginx.conf
```

---

## 🏗 Architecture

```
React (Vite) ──/api──▶ Flask ──▶ generator → ZIP (in memory)
   live form            │           ├─ themes.py     (HTML/CSS/JS)
   live preview         │           ├─ scoring.py    (completeness)
   score + QR           │           ├─ qr_util.py    (SVG QR)
                        │           └─ resume_pdf.py  (PDF)
                        └──▶ SQLite (portfolio.db) + generated/<id>.zip
```

---

## 🚀 Getting started

### 1. Backend (Flask + SQLite)

```bash
cd PortfolioGenerator/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py            # serves the API on http://localhost:5001
```

> `qrcode` and `fpdf2` are optional — the app still runs without them and
> degrades gracefully (placeholder QR / HTML résumé). Install them for the full
> experience (they're already in `requirements.txt`).

### 2. Frontend (React + Vite)

```bash
cd PortfolioGenerator/frontend
npm install
npm run dev              # http://localhost:5174  (proxies /api → :5001)
```

Open **http://localhost:5174**, fill in the form, and download your ZIP.

### Production (serve everything from Flask)

```bash
cd frontend && npm run build      # outputs frontend/dist
cd ../backend && python app.py    # Flask serves the built app at :5001
```

---

## 🔌 API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/health` | Service status + which optional features (PDF/QR) are available |
| `POST` | `/api/preview` | `{data}` → `{html, score, qr_svg}` for the live preview |
| `POST` | `/api/score` | `{data}` → completeness report |
| `POST` | `/api/generate` | `{data}` → builds + stores a ZIP, returns metadata |
| `GET` | `/api/download/<id>` | Stream a generated ZIP |
| `GET` | `/api/history` | Recent generations |
| `GET` / `DELETE` | `/api/history/<id>` | Fetch / delete one |
| `GET` | `/api/stats` | Totals (count, avg score, best) |

---

## 🧪 Tech

- **Frontend:** React 18, Vite, Framer Motion, plain CSS (no UI kit)
- **Backend:** Flask, Flask-CORS, SQLite (stdlib), `qrcode`, `fpdf2`
- **Storage:** local SQLite DB + ZIPs on disk under `backend/generated/`

---

_Part of this workspace alongside AI-Resume-Analyzer and ChatbotusingSockets._
