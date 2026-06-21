import { motion, AnimatePresence } from 'framer-motion'
import { XIcon } from './icons.jsx'

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={`panel relative z-10 flex max-h-[calc(100dvh-2rem)] w-full ${maxWidth} flex-col rounded-2xl shadow-panel`}
          >
            {/* Fixed title bar */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/5 p-5">
              <h2 className="font-display text-lg font-bold">{title}</h2>
              <button
                onClick={onClose}
                className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <XIcon width={18} height={18} />
              </button>
            </div>
            {/* Scrollable body */}
            <div className="overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
