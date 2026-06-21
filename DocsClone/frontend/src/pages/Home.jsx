import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useCreateDoc } from "../hooks/useCreateDoc";
import TemplateGallery from "../components/TemplateGallery";
import FeedbackModal from "../components/FeedbackModal";

function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000));
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [label, size] of units) {
    const v = Math.floor(secs / size);
    if (v >= 1) return `${v} ${label}${v > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

const SWATCHES = ["#4f46e5", "#0ea5e9", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"];
const colorFor = (id) => {
  let h = 0;
  for (const c of id || "") h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return SWATCHES[h % SWATCHES.length];
};

export default function Home() {
  const { create, creating, error: createError } = useCreateDoc();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const refresh = () =>
    api
      .list()
      .then(setDocs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    refresh();
  }, []);

  const remove = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this document? This cannot be undone.")) return;
    await api.remove(id).catch(() => {});
    setDocs((d) => d.filter((x) => x.id !== id));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) => (d.title || "").toLowerCase().includes(q));
  }, [docs, query]);

  return (
    <div className="dash">
      {/* top bar */}
      <header className="dash-top">
        <Link to="/" className="brand" title="Back to home">
          <span className="brand-mark">D</span>
          <div>
            <strong>SyncScribe</strong>
            <small>your documents</small>
          </div>
        </Link>

        <div className="dash-search">
          <span className="search-ic">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents"
          />
        </div>

        <div className="dash-top-actions">
          <Link to="/" className="btn-ghost">
            🏠 Home
          </Link>
          <button className="btn-ghost" onClick={() => setFeedbackOpen(true)}>
            💡 Feedback
          </button>
          <button className="btn-primary" disabled={creating} onClick={() => create()}>
            {creating ? "Creating…" : "+ New document"}
          </button>
        </div>
      </header>

      <main className="dash-main">
        {(error || createError) && <div className="alert">{error || createError}</div>}

        {/* templates */}
        <section className="dash-block">
          <div className="block-head">
            <h2 className="section-h">Start a new document</h2>
            <span className="muted small">Pick a template or start blank</span>
          </div>
          <TemplateGallery onPick={create} disabled={creating} />
        </section>

        {/* recents */}
        <section className="dash-block">
          <div className="block-head">
            <h2 className="section-h">
              {query ? `Results for “${query}”` : "Recent documents"}
            </h2>
            <span className="muted small">
              {docs.length} document{docs.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="doc-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="doc-card skeleton" key={i}>
                  <div className="doc-thumb shimmer" />
                  <div className="doc-meta">
                    <div className="sk-line w70" />
                    <div className="sk-line w40" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-art">🗂️</div>
              <p>{query ? "No documents match your search." : "No documents yet."}</p>
              {!query && (
                <button className="btn-primary" disabled={creating} onClick={() => create()}>
                  Create your first document
                </button>
              )}
            </div>
          ) : (
            <ul className="doc-grid">
              {filtered.map((d) => {
                const c = colorFor(d.id);
                return (
                  <li key={d.id} className="doc-card" style={{ "--c": c }}>
                    <Link to={`/documents/${d.id}`} className="doc-link">
                      <div className="doc-thumb">
                        <span className="doc-thumb-tag">{(d.title || "U")[0].toUpperCase()}</span>
                        <span className="doc-thumb-lines" />
                      </div>
                      <div className="doc-meta">
                        <strong className="doc-title">{d.title || "Untitled document"}</strong>
                        <small className="muted">Edited {timeAgo(d.updated_at)}</small>
                      </div>
                    </Link>
                    <button className="doc-del" title="Delete" onClick={(e) => remove(e, d.id)}>
                      🗑
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {/* floating feedback */}
      <button className="fab" onClick={() => setFeedbackOpen(true)} title="Share a suggestion">
        💡
      </button>

      <footer className="dash-footer">
        SyncScribe · open the same document in two tabs to see live collaboration
      </footer>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}
