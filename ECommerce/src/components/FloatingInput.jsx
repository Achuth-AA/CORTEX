import { motion, AnimatePresence } from 'framer-motion'

export default function FloatingInput({
  id,
  label,
  error,
  valid,
  type = 'text',
  ...props
}) {
  return (
    <div>
      <div className="float-group">
        <input
          id={id}
          type={type}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`input-field focus-ring ${
            error ? '!border-rose-500 !ring-rose-500/30' : ''
          } ${valid ? '!border-emerald-500' : ''}`}
          {...props}
        />
        <label htmlFor={id}>{label}</label>
        {valid && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
          >
            ✓
          </motion.span>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 pl-1 text-xs text-rose-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
