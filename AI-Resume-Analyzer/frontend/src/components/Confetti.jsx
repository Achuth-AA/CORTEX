import { useMemo } from "react";
import { motion } from "framer-motion";

const COLORS = ["#6d5efc", "#b14bff", "#ff5fa2", "#1bbf83", "#f5a623"];

/**
 * Fires a one-shot confetti burst. Remount (via a changing `key`) to replay.
 * Pure CSS/motion — no external library.
 */
export default function Confetti({ count = 90 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i * 137.5) % 100, // golden-angle spread, deterministic
        color: COLORS[i % COLORS.length],
        delay: (i % 12) * 0.04,
        drift: ((i * 53) % 120) - 60,
        rotate: (i * 47) % 360,
        size: 7 + ((i * 13) % 8),
        duration: 2.4 + ((i % 7) * 0.18),
      })),
    [count]
  );

  return (
    <div className="confetti-layer">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
          }}
          initial={{ y: "-10vh", x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", x: p.drift, rotate: p.rotate, opacity: [1, 1, 0.9, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
