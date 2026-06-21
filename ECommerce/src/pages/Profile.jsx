import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useSession } from '../hooks/useSession.js'
import { HeartIcon, ArrowRightIcon } from '../components/icons.jsx'

export default function Profile() {
  const { currentUser, logout, updateName } = useAuth()
  const { count: wishCount } = useWishlist()
  const [lastOrder] = useSession('lastOrder', null)
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(currentUser?.name || '')

  const initials = currentUser?.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const save = () => {
    if (name.trim().length >= 2) {
      updateName(name.trim())
      setEditing(false)
    }
  }

  const doLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface flex flex-col items-center gap-4 rounded-3xl p-8 text-center shadow-card sm:flex-row sm:text-left"
      >
        <div className="grid h-24 w-24 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-violet text-3xl font-extrabold text-white">
          {initials}
        </div>
        <div className="flex-1">
          {editing ? (
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field !pt-2 max-w-xs"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={save} className="btn-accent !py-2 text-sm">Save</button>
                <button onClick={() => { setEditing(false); setName(currentUser.name) }} className="btn-ghost !py-2 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <h1 className="font-display text-3xl font-extrabold">{currentUser?.name}</h1>
              <button onClick={() => setEditing(true)} className="text-sm font-semibold text-accent hover:underline">
                Edit
              </button>
            </div>
          )}
          <p className="mt-1 text-zinc-500">{currentUser?.email}</p>
        </div>
        <button onClick={doLogout} className="btn-ghost text-sm !text-rose-500 hover:!border-rose-500">
          Log Out
        </button>
      </motion.div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Wishlist summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-surface rounded-2xl p-6 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-rose-500/10 text-rose-500">
              <HeartIcon />
            </div>
            <div>
              <h2 className="font-display font-bold">Wishlist</h2>
              <p className="text-sm text-zinc-500">{wishCount} saved items</p>
            </div>
          </div>
          <Link to="/wishlist" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:gap-2">
            View wishlist <ArrowRightIcon width={16} height={16} />
          </Link>
        </motion.div>

        {/* Order history */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-surface rounded-2xl p-6 shadow-card"
        >
          <h2 className="font-display font-bold">Order history</h2>
          {lastOrder ? (
            <div className="mt-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">#{lastOrder.orderId}</span>
                <span className="font-bold">${lastOrder.total.toFixed(2)}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {lastOrder.items.length} item(s) · {new Date(lastOrder.placedAt).toLocaleDateString()}
              </p>
              <div className="mt-3 flex -space-x-3">
                {lastOrder.items.slice(0, 5).map((it, i) => (
                  <img key={i} src={it.image} alt="" className="h-10 w-10 rounded-full border-2 border-white object-cover dark:border-ink-850" />
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">
              No orders yet.{' '}
              <Link to="/products" className="font-semibold text-accent hover:underline">
                Place your first order
              </Link>
              .
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
