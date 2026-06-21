import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Background from "./components/Background";
import UploadCard from "./components/UploadCard";
import Results from "./components/Results";
import History from "./components/History";
import Loader from "./components/Loader";
import Confetti from "./components/Confetti";
import { useCountUp } from "./useCountUp";
import { api } from "./api";

function StatChip({ value, label, delay, decimals = 0 }) {
  const n = useCountUp(value);
  return (
    <motion.div
      className="stat-chip"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
    >
      <b>{decimals ? n.toFixed(1) : Math.round(n)}</b>
      <span>{label}</span>
    </motion.div>
  );
}

export default function App() {
  const [config, setConfig] = useState({ has_key: true });
  const [stats, setStats] = useState({ total: 0, avg_score: 0, best: 0 });
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [celebrate, setCelebrate] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const resultRef = useRef(null);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  const refresh = async () => {
    try {
      const [h, s] = await Promise.all([api.history(), api.stats()]);
      setHistory(h);
      setStats(s);
    } catch (e) {
      /* ignore */
    }
  };

  useEffect(() => {
    api.config().then(setConfig).catch(() => {});
    refresh();
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showResult = (data, isNew = false) => {
    setResult(data);
    if (isNew && (data.overall_score ?? 0) >= 80) setCelebrate((c) => c + 1);
    setTimeout(
      () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      150
    );
  };

  const analyze = async (formData) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await api.analyze(formData);
      flash("Analysis complete ✨");
      refresh();
      showResult(data, true);
    } catch (e) {
      flash(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openItem = async (id) => {
    try {
      showResult(await api.historyItem(id));
    } catch (e) {
      flash(e.message);
    }
  };

  const deleteItem = async (id) => {
    setHistory((h) => h.filter((x) => x.id !== id));
    try {
      await api.deleteItem(id);
      refresh();
    } catch (e) {
      flash(e.message);
    }
  };

  return (
    <>
      <Background />
      {celebrate > 0 && <Confetti key={celebrate} />}

      {/* Sticky nav */}
      <motion.nav
        className={`nav ${scrolled ? "stuck" : ""}`}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="nav-inner">
          <div className="logo">
            <span className="mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M9 13h6M9 17h4" />
              </svg>
            </span>
            ResumeIQ
          </div>
          <div className="pill">
            <span className={`dot ${config.has_key ? "on" : "off"}`} />
            {config.has_key ? "Gemini connected" : "API key missing"}
          </div>
        </div>
      </motion.nav>

      <div className="shell">
        {/* Hero */}
        <header className="hero">
          <motion.div
            className="eyebrow"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="spark">⚡</span> Powered by Google Gemini
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Make your resume <br />
            <span className="gradient-text">impossible to ignore.</span>
          </motion.h1>
          <motion.p
            className="sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Upload your resume and get an instant AI breakdown — ATS score, strengths,
            weak spots, missing keywords and concrete fixes that get you interviews.
          </motion.p>

          <div className="stat-row">
            <StatChip value={stats.total} label="resumes analyzed" delay={0.4} />
            <StatChip value={stats.avg_score} label="average score" delay={0.5} decimals={1} />
            <StatChip value={stats.best} label="top score" delay={0.6} />
          </div>
        </header>

        {!config.has_key && (
          <div className="glass card-pad notice" style={{ marginBottom: 22 }}>
            <strong>⚠️ No Gemini API key detected.</strong>
            <p className="muted" style={{ marginTop: 6 }}>
              Create a <code>.env</code> file in the project root with{" "}
              <code>GEMINI_API_KEY=your_key</code> and restart the Flask server.
            </p>
          </div>
        )}

        {/* Input + history */}
        <div className="grid-2">
          <UploadCard onAnalyze={analyze} loading={loading} />
          <History items={history} onOpen={openItem} onDelete={deleteItem} />
        </div>

        {/* Results */}
        <div ref={resultRef} style={{ marginTop: 28 }}>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader />
              </motion.div>
            )}
            {!loading && result && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Results data={result} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="footer">
          Built with Flask · SQLite · React · Framer Motion · Gemini —
          your data stays in a local database.
        </footer>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
