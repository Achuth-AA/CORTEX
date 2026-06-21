import { motion } from 'framer-motion'

export function scorePassword(pw = '') {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 3) // 0..3
}

const levels = [
  { label: '', color: 'transparent', width: '0%' },
  { label: 'Weak', color: '#ef4444', width: '33%' },
  { label: 'Medium', color: '#f59e0b', width: '66%' },
  { label: 'Strong', color: '#10b981', width: '100%' },
]

export default function PasswordStrength({ password }) {
  if (!password) return null
  const score = scorePassword(password)
  const level = levels[score]

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full"
          initial={false}
          animate={{ width: level.width, backgroundColor: level.color }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
        />
      </div>
      {level.label && (
        <p className="mt-1 text-xs font-medium" style={{ color: level.color }}>
          {level.label} password
        </p>
      )}
    </div>
  )
}
