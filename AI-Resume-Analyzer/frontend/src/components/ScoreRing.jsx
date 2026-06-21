import { motion, animate } from "framer-motion";
import { useEffect, useState } from "react";

const colorFor = (v) => (v >= 75 ? "#1bbf83" : v >= 50 ? "#f5a623" : "#f55470");
const gradId = (label) => `ring-${String(label).replace(/\s+/g, "")}`;

export default function ScoreRing({ value = 0, size = 168, label, sub }) {
  const stroke = 15;
  const r = (size - stroke - 6) / 2;
  const circ = 2 * Math.PI * r;
  const [display, setDisplay] = useState(0);
  const tone = colorFor(value);
  const id = gradId(label);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);

  return (
    <div className="ring-wrap">
      <div className="ring-canvas" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="ring-svg">
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6d5efc" />
              <stop offset="50%" stopColor="#b14bff" />
              <stop offset="100%" stopColor="#ff5fa2" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(20,21,43,0.07)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${id})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (circ * value) / 100 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ filter: `drop-shadow(0 0 8px ${tone}55)` }}
          />
        </svg>
        <div className="ring-center">
          <motion.div
            className="ring-num"
            style={{ color: tone }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
          >
            {display}
            <span className="ring-pct">%</span>
          </motion.div>
        </div>
      </div>
      {label && <div className="label">{label}</div>}
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}
