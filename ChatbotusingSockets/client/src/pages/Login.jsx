import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { ShieldIcon, LockIcon } from '../components/icons.jsx'
import { demoPassword } from '../data/demoUsers.js'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(email, password, remember)
      navigate('/chat')
    } catch (err) {
      setError(err.message)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setBusy(false)
    }
  }

  const useDemo = () => {
    setEmail('alice@demo.com')
    setPassword(demoPassword)
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-x-hidden overflow-y-auto bg-base px-4 py-8">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-accent/30 blur-[120px] animate-blob" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent-violet/30 blur-[120px] animate-blob" style={{ animationDelay: '5s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className={`panel w-full max-w-md rounded-3xl p-8 shadow-panel ${shake ? 'animate-shake' : ''}`}
      >
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-violet text-white shadow-glow">
            <ShieldIcon width={28} height={28} />
          </div>
          <h1 className="text-gradient font-display text-3xl font-extrabold">Welcome back</h1>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-zinc-500">
            <LockIcon width={13} height={13} /> AES-256 encrypted messaging
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="float-group">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="input pt-6"
            />
            <label htmlFor="email">Email address</label>
          </div>

          <div className="float-group">
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="input pt-6"
            />
            <label htmlFor="password">Password</label>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setRemember((r) => !r)}
              className="flex items-center gap-2 text-sm text-zinc-400"
            >
              <span
                className={`grid h-5 w-9 place-items-start rounded-full p-0.5 transition-colors ${
                  remember ? 'bg-accent' : 'bg-white/15'
                }`}
              >
                <motion.span layout className={`h-4 w-4 rounded-full bg-white ${remember ? 'ml-auto' : ''}`} />
              </span>
              Remember me
            </button>
            <button type="button" onClick={useDemo} className="text-sm font-semibold text-accent hover:underline">
              Use demo account
            </button>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium text-red-400">
              {error}
            </motion.p>
          )}

          <button type="submit" disabled={busy} className="btn-accent w-full">
            {busy ? 'Decrypting…' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Don’t have an account?{' '}
          <Link to="/register" className="font-semibold text-accent hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
