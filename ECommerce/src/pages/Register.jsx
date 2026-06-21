import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import FloatingInput from '../components/FloatingInput.jsx'
import PasswordStrength, { scorePassword } from '../components/PasswordStrength.jsx'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [touched, setTouched] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }))

  const errors = {
    name: form.name.trim().length < 2 ? 'Enter your full name.' : '',
    email: !emailRe.test(form.email) ? 'Enter a valid email.' : '',
    password: scorePassword(form.password) < 2 ? 'Use 8+ chars with mixed case & a number.' : '',
    confirm: form.confirm !== form.password ? 'Passwords do not match.' : '',
  }
  const valid = {
    name: form.name.trim().length >= 2,
    email: emailRe.test(form.email),
    password: scorePassword(form.password) >= 2,
    confirm: form.confirm.length > 0 && form.confirm === form.password,
  }
  const formValid = Object.values(valid).every(Boolean)

  const submit = (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, confirm: true })
    setError('')
    if (!formValid) return
    setLoading(true)
    setTimeout(() => {
      const res = register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      setLoading(false)
      if (res.ok) navigate('/', { replace: true })
      else setError(res.error)
    }, 400)
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="card-surface rounded-3xl p-8 shadow-card"
      >
        <h1 className="font-display text-3xl font-extrabold">Create account</h1>
        <p className="mt-2 text-sm text-zinc-500">Join Velora in seconds.</p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <FloatingInput
            id="name"
            label="Full name"
            autoComplete="name"
            value={form.name}
            onChange={update('name')}
            onBlur={blur('name')}
            error={touched.name ? errors.name : ''}
            valid={valid.name}
          />
          <FloatingInput
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            onBlur={blur('email')}
            error={touched.email ? errors.email : ''}
            valid={valid.email}
          />
          <div>
            <FloatingInput
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={update('password')}
              onBlur={blur('password')}
              error={touched.password ? errors.password : ''}
            />
            <PasswordStrength password={form.password} />
          </div>
          <FloatingInput
            id="confirm"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={update('confirm')}
            onBlur={blur('confirm')}
            error={touched.confirm ? errors.confirm : ''}
            valid={valid.confirm}
          />

          {error && <p className="text-sm font-medium text-rose-500">{error}</p>}

          <button type="submit" disabled={loading} className="btn-accent w-full">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
