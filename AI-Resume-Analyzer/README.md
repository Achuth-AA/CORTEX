# 📄 ResumeIQ

**An AI résumé analyzer.** Upload a PDF/DOCX/TXT résumé (or paste text),
optionally target a job role, and get an animated dashboard: an overall score,
ATS-compatibility score, section breakdowns, strengths & weaknesses, concrete
improvements, matched/missing ATS keywords, and detected skills — powered by
**Google Gemini** and saved to a local SQLite database.

---

## ✨ Features

- 📤 **Upload or paste** — PDF, DOCX or TXT résumés (text extracted server-side).
- 🎯 **Target a role** — tailor the analysis and ATS keyword matching to a job.
- 📊 **Scores & breakdowns** — overall + ATS scores, per-section feedback, animated score rings.
- 🟢 **Strengths / weaknesses / improvements** — specific, actionable suggestions.
- 🔑 **ATS keywords** — matched vs. missing keywords for the target role.
- 🗂 **History** — every analysis is stored in SQLite and re-loadable.

---

## 🛠 Tech stack

| Layer | What we used |
|-------|--------------|
| **Frontend** | React 18, Vite, Framer Motion (animations) |
| **Backend** | Python 3, Flask, Flask-CORS |
| **AI** | **Google Gemini** via `google-generativeai` (default model: Gemini 2.5 Flash) |
| **Parsing** | `pypdf` (PDF), `python-docx` (DOCX) |
| **Database** | SQLite (Python stdlib) — `resume_analyzer.db` |
| **Config** | python-dotenv (`GEMINI_API_KEY`) |

---

## 📁 Project structure

```
ResumeIQ/  (folder: AI-Resume-Analyzer)
├── app.py                 # Flask API: file upload, text extraction, Gemini analysis, history
├── requirements.txt
├── .env.example           # GEMINI_API_KEY=...
├── uploads/               # temp file storage during analysis
├── resume_analyzer.db     # SQLite database (created at runtime)
└── frontend/
    ├── index.html
    ├── vite.config.js     # dev proxy /api → :5000
    ├── package.json
    └── src/
        ├── App.jsx        # nav, hero, upload, results, history
        ├── api.js
        ├── useCountUp.js  # animated counters
        ├── index.css
        └── components/    # UploadCard, Results, ScoreRing, History, Loader, Confetti, Tilt, Background
```

---

## 🚀 Getting started

**1. Backend (Flask + Gemini + SQLite)**
```bash
cd AI-Resume-Analyzer
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # add GEMINI_API_KEY=<your key>
python app.py              # API on http://localhost:5000
```

**2. Frontend (React + Vite)**
```bash
cd AI-Resume-Analyzer/frontend
npm install
npm run dev                # http://localhost:5173  (proxies /api → :5000)
```

**Production** — `cd frontend && npm run build`, then `python app.py` serves the
built app from Flask at `:5000`.

> Needs a **Gemini API key** in `.env` for live analysis.

---

_Part of the workspace alongside Foliofy, SyncScribe, Algoscope, Lumina Chat and Velora._
