import { useEffect, useState } from "react";
import { animate } from "framer-motion";

/** Smoothly animates a number toward `target` whenever it changes. */
export function useCountUp(target = 0, duration = 1.1) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const controls = animate(val, target, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return val;
}
