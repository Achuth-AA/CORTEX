"""
SyncScribe — Flask + Socket.IO backend (a Google-Docs-style collaborative editor).

REST
  GET    /api/health                 service status
  GET    /api/documents              list documents (newest first)
  POST   /api/documents              create a new document -> {id, title}
  GET    /api/documents/<id>         full document (title + Quill delta)
  PATCH  /api/documents/<id>         rename {title}
  DELETE /api/documents/<id>         delete a document

Socket.IO (room == document id)  — real-time collaboration
  get-document   {documentId}                 join room, create-if-missing,
                                               server emits 'load-document' {title, data}
  send-changes   {documentId, delta}           broadcast 'receive-changes' to the
                                               room (everyone except the sender)
  save-document  {documentId, data, title?}    persist the document to SQLite

Storage is a local SQLite file (docs.db). No external services.
"""

from __future__ import annotations

import datetime
import json
import os
import sqlite3
import uuid

from flask import Flask, g, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "docs.db")
FRONTEND_DIST = os.path.join(BASE_DIR, "..", "frontend", "dist")

DEFAULT_TITLE = "Untitled document"

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # 8 MB of JSON is plenty
CORS(app)

# threading async mode keeps deps minimal (no eventlet/gevent needed).
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")


# --------------------------------------------------------------------------- #
# Database
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


def _connect():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    return db


def init_db():
    db = sqlite3.connect(DB_PATH)
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS documents (
            id          TEXT PRIMARY KEY,
            title       TEXT NOT NULL DEFAULT 'Untitled document',
            data        TEXT,            -- JSON-encoded Quill delta
            created_at  TEXT NOT NULL,
            updated_at  TEXT NOT NULL
        )
        """
    )
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS feedback (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT,
            category    TEXT,
            message     TEXT NOT NULL,
            created_at  TEXT NOT NULL
        )
        """
    )
    db.commit()
    db.close()


def _now() -> str:
    return datetime.datetime.now().isoformat(timespec="seconds")


def _row_to_doc(row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "data": json.loads(row["data"]) if row["data"] else None,
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def _find_document(db, doc_id):
    return db.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone()


def _create_document(db, doc_id=None, title=DEFAULT_TITLE, data=None) -> dict:
    doc_id = doc_id or uuid.uuid4().hex
    now = _now()
    db.execute(
        "INSERT INTO documents (id, title, data, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?)",
        (doc_id, title, json.dumps(data) if data is not None else None, now, now),
    )
    db.commit()
    return _row_to_doc(_find_document(db, doc_id))


def _get_or_create(db, doc_id) -> dict:
    row = _find_document(db, doc_id)
    if row is None:
        return _create_document(db, doc_id)
    return _row_to_doc(row)


# --------------------------------------------------------------------------- #
# REST routes
# --------------------------------------------------------------------------- #
@app.route("/api/health")
def api_health():
    return jsonify({"ok": True, "realtime": True})


@app.route("/api/documents")
def api_documents():
    db = get_db()
    rows = db.execute(
        "SELECT id, title, created_at, updated_at FROM documents "
        "ORDER BY datetime(updated_at) DESC"
    ).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/api/documents", methods=["POST"])
def api_create_document():
    payload = request.get_json(silent=True) or {}
    title = (payload.get("title") or DEFAULT_TITLE).strip() or DEFAULT_TITLE
    # Optional Quill delta to seed the document from (used by templates).
    data = payload.get("data")
    db = get_db()
    doc = _create_document(db, title=title, data=data)
    return jsonify(doc), 201


@app.route("/api/documents/<doc_id>")
def api_get_document(doc_id):
    db = get_db()
    row = _find_document(db, doc_id)
    if row is None:
        return jsonify({"error": "Not found"}), 404
    return jsonify(_row_to_doc(row))


@app.route("/api/documents/<doc_id>", methods=["PATCH"])
def api_rename_document(doc_id):
    payload = request.get_json(silent=True) or {}
    title = (payload.get("title") or "").strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400
    db = get_db()
    if _find_document(db, doc_id) is None:
        return jsonify({"error": "Not found"}), 404
    db.execute(
        "UPDATE documents SET title = ?, updated_at = ? WHERE id = ?",
        (title, _now(), doc_id),
    )
    db.commit()
    return jsonify(_row_to_doc(_find_document(db, doc_id)))


@app.route("/api/documents/<doc_id>", methods=["DELETE"])
def api_delete_document(doc_id):
    db = get_db()
    db.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    db.commit()
    return jsonify({"ok": True})


# --------------------------------------------------------------------------- #
# Feedback / suggestions  (persisted to SQLite)
# --------------------------------------------------------------------------- #
@app.route("/api/feedback", methods=["POST"])
def api_create_feedback():
    payload = request.get_json(silent=True) or {}
    message = (payload.get("message") or "").strip()
    if not message:
        return jsonify({"error": "Please enter a suggestion before sending."}), 400
    name = (payload.get("name") or "").strip()
    category = (payload.get("category") or "Improvement").strip() or "Improvement"
    db = get_db()
    cur = db.execute(
        "INSERT INTO feedback (name, category, message, created_at) VALUES (?, ?, ?, ?)",
        (name, category, message, _now()),
    )
    db.commit()
    return jsonify({"ok": True, "id": cur.lastrowid}), 201


@app.route("/api/feedback")
def api_list_feedback():
    db = get_db()
    rows = db.execute(
        "SELECT id, name, category, message, created_at FROM feedback "
        "ORDER BY id DESC LIMIT 100"
    ).fetchall()
    return jsonify([dict(r) for r in rows])


# --------------------------------------------------------------------------- #
# Socket.IO — real-time collaboration
# --------------------------------------------------------------------------- #
@socketio.on("get-document")
def on_get_document(payload):
    doc_id = (payload or {}).get("documentId")
    if not doc_id:
        return
    db = _connect()
    try:
        doc = _get_or_create(db, doc_id)
    finally:
        db.close()
    join_room(doc_id)
    emit("load-document", {"title": doc["title"], "data": doc["data"]})


@socketio.on("send-changes")
def on_send_changes(payload):
    payload = payload or {}
    doc_id = payload.get("documentId")
    delta = payload.get("delta")
    if not doc_id:
        return
    # Relay just the incremental delta to everyone else in the room.
    emit("receive-changes", delta, to=doc_id, include_self=False)


@socketio.on("save-document")
def on_save_document(payload):
    payload = payload or {}
    doc_id = payload.get("documentId")
    if not doc_id:
        return
    data = payload.get("data")
    title = payload.get("title")
    db = _connect()
    try:
        row = _find_document(db, doc_id)
        if row is None:
            _create_document(db, doc_id, title=title or DEFAULT_TITLE)
            row = _find_document(db, doc_id)
        new_title = (title or row["title"] or DEFAULT_TITLE)
        db.execute(
            "UPDATE documents SET data = ?, title = ?, updated_at = ? WHERE id = ?",
            (json.dumps(data) if data is not None else None, new_title, _now(), doc_id),
        )
        db.commit()
    finally:
        db.close()


# --------------------------------------------------------------------------- #
# Serve the built frontend (after `npm run build`)
# --------------------------------------------------------------------------- #
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    full_path = os.path.join(FRONTEND_DIST, path)
    if path and os.path.exists(full_path) and not os.path.isdir(full_path):
        return send_from_directory(FRONTEND_DIST, path)
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return send_from_directory(FRONTEND_DIST, "index.html")
    return (
        "<h1>SyncScribe API</h1>"
        "<p>Frontend isn't built. In <code>frontend/</code> run "
        "<code>npm install &amp;&amp; npm run dev</code> (dev) or "
        "<code>npm run build</code> to serve from Flask.</p>",
        200,
    )


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", "5002"))
    socketio.run(app, host="0.0.0.0", port=port, debug=True, allow_unsafe_werkzeug=True)
