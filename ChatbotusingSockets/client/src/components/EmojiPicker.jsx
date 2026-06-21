import { motion, AnimatePresence } from 'framer-motion'

const EMOJIS = [
  '😀', '😂', '🥰', '😎', '🤔', '😅', '😭', '😤',
  '👍', '👏', '🙌', '🔥', '✨', '🎉', '💯', '❤️',
  '😮', '😡', '🤝', '🙏', '👀', '💀', '🚀', '🔒',
]

export default function EmojiPicker({ open, onSelect, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: 'spring', stiffness: 360, damping: 24 }}
            className="panel absolute bottom-14 left-0 z-20 grid w-64 grid-cols-8 gap-1 rounded-2xl p-3 shadow-panel"
          >
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => {
                  onSelect(e)
                  onClose()
                }}
                className="rounded-lg p-1.5 text-lg transition-transform hover:scale-125 hover:bg-white/10"
              >
                {e}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
