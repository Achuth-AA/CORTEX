import { motion } from "framer-motion";
import ScoreRing from "./ScoreRing";
import Tilt from "./Tilt";

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06 },
  }),
};

const SECTION_LABELS = {
  formatting: "Formatting",
  impact: "Impact & Results",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
};

function Bar({ label, value, i }) {
  return (
    <motion.div className="bar-row" variants={fade} custom={i}>
      <div className="bar-top">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="bar-track">
        <motion.div
          className="bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 + i * 0.08 }}
        />
      </div>
    </motion.div>
  );
}

function ListCard({ title, items, kind }) {
  if (!items?.length) return null;
  return (
    <motion.div className="glass card-pad" variants={fade}>
      <div className="card-title">{title}</div>
      {items.map((it, i) => (
        <motion.div className="li" key={i} variants={fade} custom={i}>
          <span className={`tick ${kind}`}>
            {kind === "s" ? "✓" : kind === "w" ? "!" : "→"}
          </span>
          <span>{it}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function Results({ data }) {
  const sections = data.section_scores || {};

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      style={{ display: "grid", gap: 22 }}
    >
      {/* Hero scores */}
      <Tilt className="glass card-pad tilt score-hero" max={5} variants={fade}>
        <div className="rings">
          <ScoreRing value={data.overall_score ?? 0} label="Overall" sub="Resume strength" />
          <ScoreRing value={data.ats_score ?? 0} label="ATS Score" sub="Machine readability" />
        </div>
        {data.verdict && (
          <motion.div
            variants={fade}
            style={{ textAlign: "center", marginTop: 22 }}
          >
            <span className="verdict gradient-text">“{data.verdict}”</span>
          </motion.div>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 18 }}>
          {data.experience_level && (
            <span className="chip">🎯 {data.experience_level} level</span>
          )}
          {data.estimated_years_experience != null && (
            <span className="chip">⏳ ~{data.estimated_years_experience} yrs experience</span>
          )}
        </div>
      </Tilt>

      {data.summary && (
        <motion.div className="glass card-pad" variants={fade}>
          <div className="card-title">Snapshot</div>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-soft)" }}>{data.summary}</p>
        </motion.div>
      )}

      {/* Section scores */}
      {Object.keys(sections).length > 0 && (
        <motion.div className="glass card-pad" variants={fade}>
          <div className="card-title">Section breakdown</div>
          {Object.entries(sections).map(([k, v], i) => (
            <Bar key={k} label={SECTION_LABELS[k] || k} value={v} i={i} />
          ))}
        </motion.div>
      )}

      {/* Strengths / weaknesses */}
      <div className="grid-2">
        <ListCard title="💪 Strengths" items={data.strengths} kind="s" />
        <ListCard title="⚠️ Weak spots" items={data.weaknesses} kind="w" />
      </div>

      {/* Suggestions */}
      <ListCard title="🚀 How to level up" items={data.suggestions} kind="i" />

      {/* Keywords */}
      {(data.matched_keywords?.length || data.missing_keywords?.length) ? (
        <motion.div className="glass card-pad" variants={fade}>
          <div className="card-title">ATS keywords</div>
          {data.matched_keywords?.length > 0 && (
            <>
              <p className="muted" style={{ marginBottom: 8 }}>Already present</p>
              <div className="chips" style={{ marginBottom: 18 }}>
                {data.matched_keywords.map((k, i) => (
                  <motion.span key={i} className="chip good" variants={fade} custom={i}>{k}</motion.span>
                ))}
              </div>
            </>
          )}
          {data.missing_keywords?.length > 0 && (
            <>
              <p className="muted" style={{ marginBottom: 8 }}>Consider adding</p>
              <div className="chips">
                {data.missing_keywords.map((k, i) => (
                  <motion.span key={i} className="chip miss" variants={fade} custom={i}>{k}</motion.span>
                ))}
              </div>
            </>
          )}
        </motion.div>
      ) : null}

      {/* Skills */}
      {data.skills?.length > 0 && (
        <motion.div className="glass card-pad" variants={fade}>
          <div className="card-title">Detected skills</div>
          <div className="chips">
            {data.skills.map((s, i) => (
              <motion.span key={i} className="chip" variants={fade} custom={i}>{s}</motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
