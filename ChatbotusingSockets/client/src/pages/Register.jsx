import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import PasswordStrength, { scorePassword } from '../components/PasswordStrength.jsx'
import Avatar from '../components/Avatar.jsx'
import { ShieldIcon, CheckIcon } from '../components/icons.jsx'

const COLORS = ['#6366f1', '#06b6d4', '#ec4899', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6']
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ValidField({ valid }) {
  return (
    <AnimatePresence>
      {valid && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400"
        >
          <CheckIcon width={18} height={18} />
        </motion.span>
      )}
    </AnimatePresence>
  )
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [avatar, setAvatar] = useState(COLORS[0])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const valid = {
    username: form.username.trim().length >= 2,
    email: emailRe.test(form.email),
    password: scorePassword(form.password) >= 2,
    confirm: form.confirm.length > 0 && form.confirm === form.password,
  }
  const allValid = Object.values(valid).every(Boolean)

  const submit = async (e) => {
    e.preventDefault()
    if (!allValid) return
    setBusy(true)
    setError('')
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        avatar,
      })
      navigate('/chat')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-x-hidden overflow-y-auto bg-base px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-accent-violet/30 blur-[120px] animate-blob" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent-cyan/20 blur-[120px] animate-blob" style={{ animationDelay: '6s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel w-full max-w-md rounded-3xl p-8 shadow-panel"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-violet text-white shadow-glow">
            <ShieldIcon width={28} height={28} />
          </div>
          <h1 className="text-gradient font-display text-3xl font-extrabold">Create account</h1>
          <p className="mt-1 text-sm text-zinc-500">Join the encrypted conversation.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <input value={form.username} onChange={set('username')} placeholder="Display name" className="input pr-10" />
            <ValidField valid={valid.username} />
          </div>
          <div className="relative">
            <input type="email" value={form.email} onChange={set('email')} placeholder="Email address" className="input pr-10" />
            <ValidField valid={valid.email} />
          </div>
          <div>
            <div className="relative">
              <input type="password" value={form.password} onChange={set('password')} placeholder="Password" className="input pr-10" />
              <ValidField valid={valid.password} />
            </div>
            <PasswordStrength password={form.password} />
          </div>
          <div className="relative">
            <input type="password" value={form.confirm} onChange={set('confirm')} placeholder="Confirm password" className="input pr-10" />
            <ValidField valid={valid.confirm} />
          </div>

          {/* Avatar color picker */}
          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-300">Pick your avatar color</p>
            <div className="flex items-center gap-3">
              <Avatar name={form.username || '?'} color={avatar} size={44} />
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatar(c)}
                    className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${
                      avatar === c ? 'ring-2 ring-white ring-offset-2 ring-offset-panel' : ''
                    }`}
                    style={{ background: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-400">{error}</p>}

          <button type="submit" disabled={!allValid || busy} className="btn-accent w-full">
            {busy ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
