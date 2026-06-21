import { useRef, useState } from "react";
import { motion } from "framer-motion";

const ACCEPT = ".pdf,.docx,.txt";

export default function UploadCard({ onAnalyze, loading }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [role, setRole] = useState("");
  const [drag, setDrag] = useState(false);

  const pick = (f) => {
    if (!f) return;
    const ok = /\.(pdf|docx|txt)$/i.test(f.name);
    if (!ok) return alert("Please use a PDF, DOCX or TXT file.");
    setFile(f);
    setText("");
  };

  const submit = () => {
    if (!file && text.trim().length < 40) {
      return alert("Upload a resume or paste at least a few lines of text.");
    }
    const fd = new FormData();
    if (file) fd.append("resume", file);
    else fd.append("resume_text", text);
    fd.append("job_role", role);
    onAnalyze(fd);
  };

  return (
    <motion.div
      className="glass card-pad"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="card-title">Upload resume</div>

      <div
        className={`dropzone ${drag ? "drag" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pick(e.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <motion.div className="icon" whileHover={{ scale: 1.08, rotate: 6 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 17V3" />
            <path d="m6 9 6-6 6 6" />
            <path d="M5 21h14" />
          </svg>
        </motion.div>
        <div style={{ fontWeight: 600 }}>
          Drag &amp; drop your resume, or <span style={{ color: "var(--brand)" }}>browse</span>
        </div>
        <div className="muted" style={{ marginTop: 6 }}>PDF · DOCX · TXT — up to 8&nbsp;MB</div>
        {file && <div className="file-name">📄 {file.name}</div>}
      </div>

      <div className="divider">or paste the text</div>

      <textarea
        rows={5}
        placeholder="Paste your resume content here…"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (e.target.value) setFile(null);
        }}
      />

      <label className="fld">Target role (optional — sharpens the analysis)</label>
      <input
        type="text"
        placeholder="e.g. Senior Frontend Engineer"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />

      <div style={{ height: 20 }} />

      <button className="btn" onClick={submit} disabled={loading}>
        <span className="sheen" />
        {loading ? "Analyzing…" : "✨ Analyze my resume"}
      </button>
    </motion.div>
  );
}
