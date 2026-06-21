import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import FloatingInput from '../components/FloatingInput.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Simulate a brief async auth check.
    setTimeout(() => {
      const res = login(form)
      setLoading(false)
      if (res.ok) {
        navigate(from, { replace: true })
      } else {
        setError(res.error)
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
    }, 400)
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        <motion.div
          animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : {}}
          transition={{ duration: 0.45 }}
          className="card-surface rounded-3xl p-8 shadow-card"
        >
          <h1 className="font-display text-3xl font-extrabold">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Log in to your Velora account.
          </p>

          <div className="mt-4 rounded-xl bg-accent/10 p-3 text-xs text-accent">
            <strong>Demo login:</strong> alex@demo.com / demo1234
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <FloatingInput
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={update('email')}
            />
            <FloatingInput
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={update('password')}
            />

            {error && <p className="text-sm font-medium text-rose-500">{error}</p>}

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-zinc-500">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                Remember me
              </label>
              <span className="text-accent">Forgot password?</span>
            </div>

            <button type="submit" disabled={loading} className="btn-accent w-full">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-zinc-400">
            <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            or
            <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          </div>

          <button
            onClick={() => navigate('/products')}
            className="btn-ghost w-full"
          >
            Continue as guest
          </button>

          <p className="mt-6 text-center text-sm text-zinc-500">
            New here?{' '}
            <Link to="/register" className="font-semibold text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
