import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STEPS = [
  "Parsing your resume…",
  "Scanning structure & formatting…",
  "Matching ATS keywords…",
  "Scoring impact & achievements…",
  "Writing your improvement plan…",
];

export default function Loader() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      1400
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="glass loader">
      <div className="orbit">
        <span className="orbit-core" />
        <span className="orbit-dot d1" />
        <span className="orbit-dot d2" />
        <span className="orbit-dot d3" />
      </div>

      <div className="loader-steps">
        {STEPS.map((label, i) => (
          <motion.div
            key={i}
            className="loader-step"
            animate={{
              opacity: i <= step ? 1 : 0.32,
              x: 0,
            }}
            initial={{ opacity: 0, x: -8 }}
          >
            <span className={`step-tick ${i < step ? "done" : i === step ? "active" : ""}`}>
              {i < step ? "✓" : ""}
            </span>
            <span style={{ fontWeight: i === step ? 700 : 500 }}>{label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
