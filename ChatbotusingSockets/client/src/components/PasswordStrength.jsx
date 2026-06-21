import { motion } from 'framer-motion'

export function scorePassword(pw = '') {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

const META = [
  { label: '', color: 'transparent' },
  { label: 'Weak', color: '#ef4444' },
  { label: 'Fair', color: '#f59e0b' },
  { label: 'Good', color: '#06b6d4' },
  { label: 'Strong', color: '#22c55e' },
]

export default function PasswordStrength({ password = '' }) {
  const score = scorePassword(password)
  const meta = META[score]
  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              initial={false}
              animate={{
                width: score >= i ? '100%' : '0%',
                backgroundColor: score >= i ? meta.color : 'transparent',
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>
      {password && (
        <p className="mt-1 text-xs font-semibold" style={{ color: meta.color }}>
          {meta.label} password
        </p>
      )}
    </div>
  )
}
