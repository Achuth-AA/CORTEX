import { motion } from 'framer-motion'

export function Spinner({ size = 28 }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-accent/30 border-t-accent"
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    />
  )
}

export function RouteLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[60vh] items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size={40} />
        <span className="text-sm text-zinc-500">Loading…</span>
      </div>
    </motion.div>
  )
}

export default Spinner
