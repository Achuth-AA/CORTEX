import { motion, AnimatePresence } from "framer-motion";
import Tilt from "./Tilt";

const scoreColor = (v) => (v >= 75 ? "#1bbf83" : v >= 50 ? "#f5a623" : "#f55470");

export default function History({ items, onOpen, onDelete }) {
  return (
    <Tilt
      className="glass card-pad tilt"
      max={5}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="card-title">Recent analyses</div>
      {items.length === 0 && (
        <p className="muted">No analyses yet — your history will appear here.</p>
      )}
      <AnimatePresence>
        {items.map((it) => (
          <motion.div
            key={it.id}
            className="hist-item"
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0, padding: 0 }}
            onClick={() => onOpen(it.id)}
          >
            <div className="hist-score" style={{ background: scoreColor(it.score) }}>
              {it.score}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {it.filename}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                {it.job_role || "General"} · ATS {it.ats_score} ·{" "}
                {new Date(it.created_at).toLocaleDateString()}
              </div>
            </div>
            <button
              className="ghost-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(it.id);
              }}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </Tilt>
  );
}
