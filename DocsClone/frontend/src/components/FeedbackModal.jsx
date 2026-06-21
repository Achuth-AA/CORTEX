import React, { useEffect, useState } from "react";
import { api } from "../api";

const CATEGORIES = ["Improvement", "Feature request", "Bug", "Love it ❤️"];

export default function FeedbackModal({ open, onClose }) {
  const [category, setCategory] = useState("Improvement");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // reset whenever it opens, and allow Esc to close
  useEffect(() => {
    if (open) {
      setCategory("Improvement");
      setName("");
      setMessage("");
      setBusy(false);
      setDone(false);
      setError("");
    }
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please write a short suggestion.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.sendFeedback({ category, name: name.trim(), message: message.trim() });
      setDone(true);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {done ? (
          <div className="modal-done">
            <div className="modal-done-art">🎉</div>
            <h3>Thank you!</h3>
            <p className="muted">
              Your suggestion was saved. We read every one — it really helps shape SyncScribe.
            </p>
            <button className="btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className="modal-form" onSubmit={submit}>
            <div className="modal-head">
              <span className="modal-kicker">We're listening</span>
              <h3>Share an improvement</h3>
              <p className="muted">
                Got an idea, a feature request, or found something off? Tell us — it's saved
                and reviewed.
              </p>
            </div>

            <label className="f-label">Category</label>
            <div className="chip-row">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`chip ${category === c ? "active" : ""}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <label className="f-label" htmlFor="fb-msg">
              Your suggestion
            </label>
            <textarea
              id="fb-msg"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="I'd love it if SyncScribe could…"
              autoFocus
            />

            <label className="f-label" htmlFor="fb-name">
              Name <span className="muted">(optional)</span>
            </label>
            <input
              id="fb-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="So we can thank you"
            />

            {error && <div className="alert">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? "Sending…" : "Send suggestion"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
