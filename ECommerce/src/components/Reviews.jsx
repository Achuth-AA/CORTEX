import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocal } from '../hooks/useLocal.js'
import { useAuth } from '../context/AuthContext.jsx'
import Stars from './Stars.jsx'
import { StarIcon } from './icons.jsx'

// A few seeded reviews so a product page never looks empty. Chosen
// deterministically per product id so they stay stable across renders.
const SEED_POOL = [
  { name: 'Ava M.', rating: 5, text: 'Exceeded my expectations — exactly as pictured and the quality feels premium.' },
  { name: 'Liam R.', rating: 4, text: 'Really happy with it overall. Shipping was quick and packaging was great.' },
  { name: 'Sofia T.', rating: 5, text: 'Worth every penny. I’ve already recommended it to two friends.' },
  { name: 'Noah K.', rating: 4, text: 'Solid build and looks fantastic. Knocked off a star for the price.' },
  { name: 'Emma L.', rating: 5, text: 'Absolutely love this. Daily driver now — can’t imagine going back.' },
  { name: 'Mateo D.', rating: 3, text: 'Good, but took a little getting used to. Still glad I bought it.' },
]

const seededFor = (product) => {
  const start = product.id % SEED_POOL.length
  return [SEED_POOL[start], SEED_POOL[(start + 2) % SEED_POOL.length]].map(
    (r, i) => ({ ...r, id: `seed-${product.id}-${i}`, seeded: true })
  )
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className="transition-transform hover:scale-110"
        >
          <StarIcon
            filled={n <= (hover || value)}
            width={26}
            height={26}
            className={n <= (hover || value) ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-600'}
          />
        </button>
      ))}
    </div>
  )
}

export default function Reviews({ product }) {
  const { currentUser } = useAuth()
  const [all, setAll] = useLocal('userReviews', {})
  const userReviews = all[product.id] || []

  const [rating, setRating] = useState(5)
  const [name, setName] = useState(currentUser?.name || '')
  const [text, setText] = useState('')
  const [justAdded, setJustAdded] = useState(false)

  const seeded = useMemo(() => seededFor(product), [product])
  const list = [...userReviews, ...seeded]

  // Blend the catalog rating with any reviews the visitor has added.
  const { avg, total } = useMemo(() => {
    const base = product.rating * product.reviewCount
    const extra = userReviews.reduce((s, r) => s + r.rating, 0)
    const count = product.reviewCount + userReviews.length
    return { avg: (base + extra) / count, total: count }
  }, [product, userReviews])

  const submit = (e) => {
    e.preventDefault()
    if (text.trim().length < 3) return
    const review = {
      id: `u-${product.id}-${userReviews.length}-${text.length}`,
      name: name.trim() || 'Anonymous',
      rating,
      text: text.trim(),
      date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
    }
    setAll((prev) => ({ ...prev, [product.id]: [review, ...(prev[product.id] || [])] }))
    setText('')
    setRating(5)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1600)
  }

  return (
    <section className="mt-20">
      <h2 className="mb-6 font-display text-2xl font-extrabold">Customer reviews</h2>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        {/* Summary + form */}
        <div>
          <div className="card-surface rounded-2xl p-5 text-center shadow-card">
            <p className="font-display text-5xl font-extrabold">{avg.toFixed(1)}</p>
            <div className="mt-2 flex justify-center">
              <Stars rating={avg} size={18} />
            </div>
            <p className="mt-2 text-sm text-zinc-500">{total.toLocaleString()} ratings</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider">Write a review</h3>
            <StarPicker value={rating} onChange={setRating} />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="focus-ring w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share what you think…"
              rows={3}
              className="focus-ring w-full resize-none rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/15"
            />
            <button type="submit" className="btn-accent w-full !py-2.5 text-sm">
              {justAdded ? '✓ Thanks for your review' : 'Submit review'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {list.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-surface rounded-2xl p-5 shadow-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-violet text-sm font-bold text-white">
                      {r.name.trim().charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-xs text-zinc-500">
                        {r.seeded ? 'Verified buyer' : r.date}
                      </p>
                    </div>
                  </div>
                  <Stars rating={r.rating} size={14} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{r.text}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
