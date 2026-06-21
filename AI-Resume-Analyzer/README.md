# ResumeIQ — AI Resume Analyzer

A polished, light‑themed resume analyzer. **Flask API + SQLite** on the backend,
**React (Vite + Framer Motion)** on the front, **Google Gemini** doing the analysis.

Upload a PDF/DOCX/TXT (or paste text), optionally name a target role, and get an
animated dashboard: overall score, ATS score, section breakdown, strengths,
weak spots, actionable fixes, matched/missing ATS keywords and detected skills.
Every analysis is saved to a local SQLite database and shown in a history panel.

---

## 1. Backend (Flask + SQLite)

```bash
cd AI-Resume-Analyzer

# (recommended) virtual env
python3 -m venv .venv && source .venv/bin/activate

pip install -r requirements.txt

# add your Gemini key
cp .env.example .env
#   then edit .env → GEMINI_API_KEY=your_real_key

python app.py          # serves the API on http://localhost:5000
```

The SQLite database (`resume_analyzer.db`) is created automatically on first run.

Get a free Gemini API key at https://aistudio.google.com/app/apikey

## 2. Frontend (React)

In a **second terminal**:

```bash
cd AI-Resume-Analyzer/frontend
npm install
npm run dev            # opens http://localhost:5173
```

The Vite dev server proxies `/api/*` to Flask on port 5000, so just open
**http://localhost:5173**.

## 3. One‑server production build (optional)

```bash
cd frontend && npm run build      # outputs to frontend/dist
cd .. && python app.py            # Flask now serves the built React app at :5000
```

---

## Project structure

```
AI-Resume-Analyzer/
├── app.py               # Flask API + SQLite + Gemini
├── requirements.txt
├── .env.example         # copy to .env and add your key
├── resume_analyzer.db   # created at runtime
└── frontend/
    ├── index.html
    ├── vite.config.js   # /api proxy → Flask
    └── src/
        ├── App.jsx
        ├── api.js
        ├── index.css    # the light theme + animations
        └── components/   ScoreRing · UploadCard · Results · History · Background
```

## API endpoints

| Method | Route | Purpose |
| ------ | ----- | ------- |
| GET    | `/api/config`            | whether a Gemini key is configured |
| POST   | `/api/analyze`           | analyze an uploaded file or pasted text |
| GET    | `/api/history`           | last 25 analyses |
| GET    | `/api/history/<id>`      | full result for one analysis |
| DELETE | `/api/history/<id>`      | delete an analysis |
| GET    | `/api/stats`             | totals / averages for the hero counters |
