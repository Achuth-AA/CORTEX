import os
import re
import json
import sqlite3
import datetime
from flask import Flask, request, jsonify, send_from_directory, g
from flask_cors import CORS

import google.generativeai as genai
from dotenv import load_dotenv

# PDF / DOCX text extraction
from pypdf import PdfReader
import docx

load_dotenv()

# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "resume_analyzer.db")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Treat the example placeholder as "no key configured".
if GEMINI_API_KEY in {"PASTE_YOUR_KEY_HERE", "your_gemini_api_key_here"}:
    GEMINI_API_KEY = ""

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_CONTENT_LENGTH = 8 * 1024 * 1024  # 8 MB

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
CORS(app)  # allow the Vite dev server to call the API during development


# --------------------------------------------------------------------------- #
# Database helpers
# --------------------------------------------------------------------------- #
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DB_PATH)
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS analyses (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            filename      TEXT,
            job_role      TEXT,
            score         INTEGER,
            ats_score     INTEGER,
            result_json   TEXT,
            created_at    TEXT
        )
        """
    )
    db.commit()
    db.close()


# --------------------------------------------------------------------------- #
# Text extraction
# --------------------------------------------------------------------------- #
def extract_text(file_storage):
    filename = file_storage.filename or ""
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        reader = PdfReader(file_storage.stream)
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    if ext == ".docx":
        document = docx.Document(file_storage.stream)
        return "\n".join(p.text for p in document.paragraphs)

    if ext == ".txt":
        return file_storage.stream.read().decode("utf-8", errors="ignore")

    raise ValueError("Unsupported file type. Use PDF, DOCX or TXT.")


# --------------------------------------------------------------------------- #
# Gemini analysis
# --------------------------------------------------------------------------- #
ANALYSIS_PROMPT = """You are an elite technical recruiter and ATS (Applicant Tracking System) expert.
Analyze the following resume{role_clause}.

Return ONLY a valid JSON object (no markdown, no code fences) with EXACTLY this shape:
{{
  "overall_score": <integer 0-100>,
  "ats_score": <integer 0-100>,
  "summary": "<2-3 sentence professional summary of the candidate>",
  "strengths": ["<strength>", ...],            // 3-6 items
  "weaknesses": ["<weakness>", ...],           // 3-6 items
  "suggestions": ["<actionable improvement>", ...],  // 4-7 items
  "missing_keywords": ["<keyword>", ...],      // ATS keywords that should be added
  "matched_keywords": ["<keyword>", ...],      // relevant keywords already present
  "skills": ["<skill>", ...],                  // detected hard/soft skills
  "experience_level": "<Entry|Junior|Mid|Senior|Lead>",
  "estimated_years_experience": <number>,
  "section_scores": {{
     "formatting": <0-100>,
     "impact": <0-100>,
     "skills": <0-100>,
     "experience": <0-100>,
     "education": <0-100>
  }},
  "verdict": "<one punchy sentence of overall judgement>"
}}

RESUME TEXT:
\"\"\"
{resume_text}
\"\"\"
"""


def clean_json(raw: str) -> str:
    raw = raw.strip()
    # Strip code fences if the model added them anyway.
    raw = re.sub(r"^```(?:json)?", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()
    # Grab the outermost JSON object.
    start = raw.find("{")
    end = raw.rfind("}")
    if start != -1 and end != -1:
        raw = raw[start : end + 1]
    return raw


def analyze_with_gemini(resume_text: str, job_role: str = "") -> dict:
    if not GEMINI_API_KEY:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Add it to a .env file in the project root."
        )

    role_clause = f" for the role of '{job_role}'" if job_role.strip() else ""
    prompt = ANALYSIS_PROMPT.format(
        role_clause=role_clause,
        resume_text=resume_text[:20000],  # keep prompt within sane limits
    )

    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(
        prompt,
        generation_config={"temperature": 0.4, "response_mime_type": "application/json"},
    )
    data = json.loads(clean_json(response.text))
    return data


# --------------------------------------------------------------------------- #
# Routes
# --------------------------------------------------------------------------- #
@app.route("/api/config")
def api_config():
    return jsonify({"has_key": bool(GEMINI_API_KEY), "model": GEMINI_MODEL})


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Serve the built React app (frontend/dist). Run `npm run build` first."""
    full_path = os.path.join(FRONTEND_DIST, path)
    if path and os.path.exists(full_path):
        return send_from_directory(FRONTEND_DIST, path)
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return send_from_directory(FRONTEND_DIST, "index.html")
    return (
        "<h1>AI Resume Analyzer API</h1>"
        "<p>The React frontend isn't built yet. In the <code>frontend/</code> folder run "
        "<code>npm install &amp;&amp; npm run dev</code> for development, "
        "or <code>npm run build</code> to serve it from Flask.</p>",
        200,
    )


@app.route("/api/analyze", methods=["POST"])
def api_analyze():
    job_role = request.form.get("job_role", "").strip()
    resume_text = ""
    filename = "pasted_text.txt"

    if "resume" in request.files and request.files["resume"].filename:
        file = request.files["resume"]
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "Unsupported file type. Use PDF, DOCX or TXT."}), 400
        filename = file.filename
        try:
            resume_text = extract_text(file)
        except Exception as exc:  # noqa: BLE001
            return jsonify({"error": f"Could not read file: {exc}"}), 400
    else:
        resume_text = request.form.get("resume_text", "").strip()

    if not resume_text or len(resume_text.strip()) < 40:
        return jsonify({"error": "Resume content is empty or too short to analyze."}), 400

    try:
        result = analyze_with_gemini(resume_text, job_role)
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": str(exc)}), 500

    # Persist
    db = get_db()
    cur = db.execute(
        """INSERT INTO analyses (filename, job_role, score, ats_score, result_json, created_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (
            filename,
            job_role,
            int(result.get("overall_score", 0)),
            int(result.get("ats_score", 0)),
            json.dumps(result),
            datetime.datetime.now().isoformat(timespec="seconds"),
        ),
    )
    db.commit()
    result["id"] = cur.lastrowid
    return jsonify(result)


@app.route("/api/history")
def api_history():
    db = get_db()
    rows = db.execute(
        "SELECT id, filename, job_role, score, ats_score, created_at "
        "FROM analyses ORDER BY id DESC LIMIT 25"
    ).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/api/history/<int:item_id>")
def api_history_item(item_id):
    db = get_db()
    row = db.execute("SELECT * FROM analyses WHERE id = ?", (item_id,)).fetchone()
    if row is None:
        return jsonify({"error": "Not found"}), 404
    data = json.loads(row["result_json"])
    data["id"] = row["id"]
    return jsonify(data)


@app.route("/api/history/<int:item_id>", methods=["DELETE"])
def api_history_delete(item_id):
    db = get_db()
    db.execute("DELETE FROM analyses WHERE id = ?", (item_id,))
    db.commit()
    return jsonify({"ok": True})


@app.route("/api/stats")
def api_stats():
    db = get_db()
    row = db.execute(
        "SELECT COUNT(*) AS total, AVG(score) AS avg_score, MAX(score) AS best "
        "FROM analyses"
    ).fetchone()
    return jsonify(
        {
            "total": row["total"] or 0,
            "avg_score": round(row["avg_score"] or 0, 1),
            "best": row["best"] or 0,
        }
    )


if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0", port=5000)
