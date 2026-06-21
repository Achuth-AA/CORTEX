import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { products, categories } from '../data/products.js'
import ProductCard from '../components/ProductCard.jsx'
import { SlidersIcon, CloseIcon } from '../components/icons.jsx'

const sortOptions = [
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Price: Low → High' },
  { key: 'price-desc', label: 'Price: High → Low' },
  { key: 'rating', label: 'Top Rated' },
]

const maxPrice = Math.max(...products.map((p) => p.price))

function Skeleton() {
  return (
    <div className="card-surface relative overflow-hidden rounded-2xl">
      <div className="aspect-square bg-black/5 dark:bg-white/5" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 rounded bg-black/10 dark:bg-white/10" />
        <div className="h-4 w-3/4 rounded bg-black/10 dark:bg-white/10" />
        <div className="h-4 w-1/3 rounded bg-black/10 dark:bg-white/10" />
      </div>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/10" />
    </div>
  )
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCat = searchParams.get('category') || 'All'

  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(initialCat)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [price, setPrice] = useState(maxPrice)
  const [minRating, setMinRating] = useState(0)
  const [sort, setSort] = useState('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Skeleton on initial render.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  // Keep category + search query in sync with the URL when navigating in.
  useEffect(() => {
    setCategory(searchParams.get('category') || 'All')
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  // Update the URL while preserving the other param.
  const updateParams = (next) => {
    const params = {}
    const cat = next.category ?? category
    const q = next.q ?? query
    if (cat && cat !== 'All') params.category = cat
    if (q) params.q = q
    setSearchParams(params)
  }

  const setCat = (cat) => {
    setCategory(cat)
    updateParams({ category: cat })
  }

  const clearSearch = () => {
    setQuery('')
    updateParams({ q: '' })
  }

  const q = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    let list = products.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        p.price <= price &&
        p.rating >= minRating &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q))
    )
    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price)
        break
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating)
        break
      default:
        list = [...list].sort((a, b) => b.id - a.id)
    }
    return list
  }, [category, q, price, minRating, sort])

  const FilterPanel = (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider">Category</h3>
        <div className="flex flex-col gap-1">
          {['All', ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                category === c
                  ? 'bg-accent/10 font-semibold text-accent'
                  : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider">
          Max price: <span className="text-accent">${price}</span>
        </h3>
        <input
          type="range"
          min={Math.min(...products.map((p) => p.price))}
          max={maxPrice}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full accent-accent"
        />
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider">Minimum rating</h3>
        <div className="flex flex-wrap gap-2">
          {[0, 4, 4.5, 4.8].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                minRating === r
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-black/10 dark:border-white/15'
              }`}
            >
              {r === 0 ? 'Any' : `${r}+`}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-extrabold">
          {query.trim()
            ? `Results for “${query.trim()}”`
            : category === 'All'
            ? 'All Products'
            : category}
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <p className="text-zinc-500">{filtered.length} items</p>
          {query.trim() && (
            <button
              onClick={clearSearch}
              className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
            >
              Clear search <CloseIcon width={13} height={13} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button onClick={() => setFiltersOpen(true)} className="btn-ghost !py-2.5 text-sm">
          <SlidersIcon width={18} height={18} /> Filters
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-full border border-black/10 bg-transparent px-4 py-2.5 text-sm dark:border-white/15"
        >
          {sortOptions.map((o) => (
            <option key={o.key} value={o.key} className="text-black">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex gap-8">
        {/* Desktop sidebar */}
        <aside className="sticky top-20 hidden h-fit w-60 flex-shrink-0 lg:block">
          {FilterPanel}
        </aside>

        <div className="flex-1">
          {/* Desktop sort */}
          <div className="mb-5 hidden items-center justify-end gap-3 lg:flex">
            <span className="text-sm text-zinc-500">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-black/10 bg-transparent px-4 py-2 text-sm dark:border-white/15"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key} className="text-black">
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <p className="text-lg font-semibold">No products match your filters.</p>
              <button
                onClick={() => {
                  setCategory('All')
                  setQuery('')
                  setPrice(maxPrice)
                  setMinRating(0)
                  setSearchParams({})
                }}
                className="btn-ghost"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed left-0 top-0 z-[70] h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-6 dark:bg-ink-900 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                  <CloseIcon />
                </button>
              </div>
              {FilterPanel}
              <button onClick={() => setFiltersOpen(false)} className="btn-accent mt-8 w-full">
                Show {filtered.length} results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
