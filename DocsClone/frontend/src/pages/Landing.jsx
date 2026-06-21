import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCreateDoc } from "../hooks/useCreateDoc";
import { api } from "../api";
import TemplateGallery from "../components/TemplateGallery";
import FeedbackModal from "../components/FeedbackModal";

const FEATURES = [
  {
    icon: "🤝",
    title: "Real-time collaboration",
    body: "Open a doc in two tabs or share the link — every keystroke syncs live over websockets.",
  },
  {
    icon: "🧩",
    title: "Beautiful templates",
    body: "Start from a Resume, Cold Email, Proposal and more — pre-formatted and ready to edit.",
  },
  {
    icon: "💾",
    title: "Auto-save to your DB",
    body: "Content and title persist to a local SQLite database every couple of seconds. Never lose work.",
  },
  {
    icon: "✍️",
    title: "Rich-text editor",
    body: "Headings, lists, colours, code blocks, links and images — a full word-processor toolbar.",
  },
];

export default function Landing() {
  const { create, creating } = useCreateDoc();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [count, setCount] = useState(null);

  useEffect(() => {
    api.list().then((d) => setCount(d.length)).catch(() => {});
  }, []);

  return (
    <div className="landing">
      <div className="aurora" aria-hidden>
        <span className="aurora-blob b1" />
        <span className="aurora-blob b2" />
        <span className="aurora-blob b3" />
      </div>

      {/* nav */}
      <header className="lp-nav">
        <Link to="/" className="lp-brand">
          <span className="brand-mark">D</span>
          <strong>SyncScribe</strong>
        </Link>
        <nav className="lp-nav-links">
          <a href="#features">Features</a>
          <a href="#templates">Templates</a>
          <button className="linklike" onClick={() => setFeedbackOpen(true)}>
            Feedback
          </button>
        </nav>
        <div className="lp-nav-cta">
          <Link to="/documents" className="btn-ghost">
            Open app
          </Link>
          <button className="btn-primary" disabled={creating} onClick={() => create()}>
            {creating ? "Opening…" : "Start writing"}
          </button>
        </div>
      </header>

      {/* hero */}
      <section className="hero">
        <div className="hero-text">
          <span className="badge">⚡ Real-time · Templates · Auto-save</span>
          <h1 className="hero-title">
            Write together,<br />
            <span className="grad-text">in real time.</span>
          </h1>
          <p className="hero-sub">
            SyncScribe is a collaborative document editor — beautiful templates, a full rich-text
            toolbar, and live multi-user editing. Built with React, Flask &amp; SQLite.
          </p>
          <div className="hero-actions">
            <button className="btn-primary big" disabled={creating} onClick={() => create()}>
              {creating ? "Opening…" : "✍️  Create a document"}
            </button>
            <Link to="/documents" className="btn-ghost big">
              Browse your docs →
            </Link>
          </div>
          <div className="hero-trust">
            <span className="dot-live" /> Live sync · No sign-up ·{" "}
            {count !== null ? `${count} document${count === 1 ? "" : "s"} so far` : "Local-first"}
          </div>
        </div>

        {/* editor mockup */}
        <div className="hero-art">
          <div className="mock">
            <div className="mock-bar">
              <span className="mock-dot r" />
              <span className="mock-dot y" />
              <span className="mock-dot g" />
              <span className="mock-title">My Resume — SyncScribe</span>
            </div>
            <div className="mock-toolbar">
              <span>B</span><span>i</span><span>U</span><span>H1</span><span>•</span><span>🔗</span>
            </div>
            <div className="mock-page">
              <div className="mock-h" />
              <div className="mock-l w90" />
              <div className="mock-l w80" />
              <div className="mock-l w60" />
              <div className="mock-h sm" />
              <div className="mock-l w85" />
              <div className="mock-l w70" />
              <div className="mock-cursor">
                <span className="caret" />
                <span className="caret-name">Ada</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section id="features" className="lp-section">
        <h2 className="lp-h2">Everything you'd expect — and it's yours</h2>
        <p className="lp-sub">A focused, fast writing experience that runs entirely on your machine.</p>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-ic">{f.icon}</div>
              <h3>{f.title}</h3>
              <p className="muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* templates */}
      <section id="templates" className="lp-section">
        <h2 className="lp-h2">Start with a template</h2>
        <p className="lp-sub">Pick one and start editing instantly — fully formatted and customizable.</p>
        <TemplateGallery onPick={create} disabled={creating} />
      </section>

      {/* feedback CTA */}
      <section className="lp-cta">
        <div className="lp-cta-inner">
          <h2>Have an idea to make SyncScribe better?</h2>
          <p>We save and read every suggestion. Tell us what would make this your daily editor.</p>
          <button className="btn-light big" onClick={() => setFeedbackOpen(true)}>
            💡 Share a suggestion
          </button>
        </div>
      </section>

      <footer className="lp-footer">
        <span>SyncScribe · React + Flask + SQLite</span>
        <span className="muted">Open the same document in two tabs to see live collaboration.</span>
      </footer>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}
