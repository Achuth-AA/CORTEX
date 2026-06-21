import { motion, AnimatePresence } from 'framer-motion'

export default function TypingIndicator({ typing = [] }) {
  const label =
    typing.length === 0
      ? ''
      : typing.length === 1
      ? `${typing[0].username} is typing`
      : typing.length === 2
      ? `${typing[0].username} and ${typing[1].username} are typing`
      : `${typing.length} people are typing`

  return (
    <AnimatePresence>
      {typing.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="flex items-center gap-2 px-4 py-1.5 text-xs text-zinc-400"
        >
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce-dot"
                style={{ animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </span>
          {label}…
        </motion.div>
      )}
    </AnimatePresence>
  )
}
