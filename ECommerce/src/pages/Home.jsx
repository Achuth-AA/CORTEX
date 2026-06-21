import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { products, categories } from '../data/products.js'
import { useRecentlyViewed } from '../context/RecentlyViewedContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import {
  ArrowRightIcon,
  TruckIcon,
  RotateIcon,
  ShieldIcon,
  AwardIcon,
  SparkleIcon,
} from '../components/icons.jsx'

const headline = ['Design', 'that', 'moves', 'you.']

const catUrl = (id) =>
  `https://images.unsplash.com/photo-${id}?w=600&h=750&fit=crop&q=80`

const categoryArt = {
  Electronics: catUrl('1498049794561-7780e7231661'),
  Fashion: catUrl('1445205170230-053b83016050'),
  'Home Decor': catUrl('1586023492125-27b2c045efd7'),
  Fitness: catUrl('1571902943202-507ec2618e8f'),
}

const categoryCount = (cat) => products.filter((p) => p.category === cat).length

const perks = [
  { icon: TruckIcon, title: 'Free shipping', desc: 'On all orders over $150' },
  { icon: RotateIcon, title: '30-day returns', desc: 'No-questions-asked refunds' },
  { icon: ShieldIcon, title: 'Secure checkout', desc: 'Encrypted & protected' },
  { icon: AwardIcon, title: '2-year warranty', desc: 'On every product' },
]

const stats = [
  { value: '24', label: 'Curated products' },
  { value: '4.8★', label: 'Average rating' },
  { value: '12k+', label: 'Happy customers' },
]

export default function Home() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0])
  const floatY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%'])

  const { recent } = useRecentlyViewed()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const featured = products.filter((p) => p.badge === 'Hot').slice(0, 8)
  const floating = products.slice(0, 4)

  const subscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
  }

  return (
    <div>
      {/* ───────────────── HERO ───────────────── */}
      <section ref={heroRef} className="relative flex h-[94vh] min-h-[640px] items-center overflow-hidden">
        {/* Animated gradient-mesh backdrop */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10">
          <div className="absolute -left-32 top-[-10%] h-[42rem] w-[42rem] rounded-full bg-accent/40 opacity-50 blur-[120px] animate-blob dark:bg-accent/30" />
          <div className="absolute right-[-10%] top-[5%] h-[36rem] w-[36rem] rounded-full bg-accent-violet/40 opacity-50 blur-[120px] animate-blob dark:bg-accent-violet/30" style={{ animationDelay: '4s' }} />
          <div className="absolute bottom-[-15%] left-1/3 h-[34rem] w-[34rem] rounded-full bg-accent-glow/30 opacity-40 blur-[120px] animate-blob" style={{ animationDelay: '8s' }} />
          <div className="absolute inset-0 bg-grid" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-ink-950 dark:via-ink-950/40" />
        </motion.div>

        <motion.div
          style={{ opacity: fade }}
          className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 text-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent backdrop-blur-sm"
          >
            <SparkleIcon width={14} height={14} /> New season · 2026 collection
          </motion.span>

          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight [perspective:800px] sm:text-7xl md:text-8xl">
            {headline.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, rotateX: -40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.15 + i * 0.12, type: 'spring', stiffness: 120 }}
                className={`mr-3 inline-block ${word === 'moves' ? 'text-gradient' : ''}`}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 max-w-xl text-base text-zinc-500 dark:text-zinc-400 sm:text-lg"
          >
            A curated storefront of electronics, fashion, home, and fitness —
            thoughtfully chosen pieces, fast shipping, and an effortless checkout.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Link to="/products" className="btn-accent group animate-pulse-glow text-base">
              Shop Now
              <ArrowRightIcon className="transition-transform group-hover:translate-x-1" width={18} height={18} />
            </Link>
            <Link to="/products" className="btn-ghost text-base backdrop-blur-sm">
              Browse categories
            </Link>
          </motion.div>

          {/* Trust stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-12 flex items-center gap-6 sm:gap-10"
          >
            {stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-6 sm:gap-10">
                {i > 0 && <span className="h-9 w-px bg-black/10 dark:bg-white/15" />}
                <div className="text-center">
                  <p className="font-display text-2xl font-extrabold sm:text-3xl">{s.value}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating product cards */}
        <motion.div style={{ y: floatY }} className="pointer-events-none absolute inset-0 hidden lg:block">
          {floating.map((p, i) => {
            const layout = [
              { pos: 'left-[5%] top-[20%]', rot: '-rotate-6' },
              { pos: 'right-[6%] top-[16%]', rot: 'rotate-6' },
              { pos: 'left-[11%] bottom-[12%]', rot: 'rotate-3' },
              { pos: 'right-[9%] bottom-[15%]', rot: '-rotate-3' },
            ][i]
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.6, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.15, type: 'spring', stiffness: 90 }}
                className={`absolute ${layout.pos} ${layout.rot} animate-float`}
                style={{ animationDelay: `${i * 0.9}s` }}
              >
                <div className="w-36 overflow-hidden rounded-2xl border border-white/40 bg-white/70 p-2 shadow-glow backdrop-blur-md dark:border-white/10 dark:bg-ink-850/70">
                  <img src={p.images[0]} alt="" className="h-28 w-full rounded-xl object-cover" />
                  <div className="px-1 pb-1 pt-2 text-left">
                    <p className="truncate text-xs font-semibold">{p.name}</p>
                    <p className="text-xs font-bold text-accent">${p.price}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <div className="flex h-9 w-6 items-start justify-center rounded-full border-2 border-zinc-400/60 p-1.5">
            <motion.span
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-accent"
            />
          </div>
        </motion.div>
      </section>

      {/* ───────────────── PERKS STRIP ───────────────── */}
      <section className="mx-auto -mt-6 max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-2 gap-3 rounded-3xl border border-black/5 bg-white/60 p-4 shadow-card backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/60 md:grid-cols-4 md:p-5">
          {perks.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 rounded-2xl p-3"
            >
              <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <perk.icon width={22} height={22} />
              </span>
              <div>
                <p className="text-sm font-bold">{perk.title}</p>
                <p className="text-xs text-zinc-500">{perk.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───────────────── CATEGORIES ───────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">Collections</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold md:text-4xl">Shop by category</h2>
          </div>
          <Link to="/products" className="hidden items-center gap-1 text-sm font-semibold text-accent transition-all hover:gap-2 sm:flex">
            View all <ArrowRightIcon width={16} height={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -8 }}
            >
              <Link
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5 dark:ring-white/10"
              >
                <img
                  src={categoryArt[cat]}
                  alt={cat}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:from-black/90" />
                <span className="absolute right-3 top-3 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                  {categoryCount(cat)} items
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-lg font-bold text-white">{cat}</h3>
                  <span className="mt-1 flex items-center gap-1 text-sm text-white/90 transition-all group-hover:gap-2">
                    Explore <ArrowRightIcon width={14} height={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───────────────── TRENDING ───────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">Bestsellers</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold md:text-4xl">Trending now</h2>
          </div>
          <Link to="/products" className="hidden items-center gap-1 text-sm font-semibold text-accent transition-all hover:gap-2 sm:flex">
            View all <ArrowRightIcon width={16} height={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* ───────────────── RECENTLY VIEWED ───────────────── */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">For you</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold md:text-4xl">Recently viewed</h2>
          </div>
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
            {recent.map((p, i) => (
              <div key={p.id} className="w-56 flex-shrink-0 sm:w-60">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ───────────────── NEWSLETTER CTA ───────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-aurora animate-gradient-pan p-10 text-center text-white md:p-16">
          <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-10 top-10 hidden opacity-30 md:block">
            <SparkleIcon width={40} height={40} className="animate-spin-slow" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-xl"
          >
            <h2 className="font-display text-3xl font-extrabold md:text-5xl">
              Get 15% off your first order
            </h2>
            <p className="mx-auto mt-4 text-white/85">
              Join the Velora list for early drops, member-only deals, and free
              shipping on orders over $150.
            </p>

            {subscribed ? (
              <motion.p
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 font-semibold backdrop-blur-md"
              >
                ✓ You’re in! Check your inbox for code WELCOME15.
              </motion.p>
            ) : (
              <form onSubmit={subscribe} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-full border border-white/30 bg-white/15 px-5 py-3 text-sm text-white placeholder-white/60 outline-none backdrop-blur-md focus:border-white focus:bg-white/25"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-white px-7 py-3 font-semibold text-accent transition-transform hover:scale-105 active:scale-95"
                >
                  Subscribe
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <Link to="/" className="font-display text-2xl font-extrabold tracking-tight">
                <span className="text-gradient">VELORA</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm text-zinc-500">
                A curated demo storefront built with React, Tailwind, and Framer
                Motion. Beautifully simple shopping.
              </p>
            </div>
            {[
              { title: 'Shop', links: ['All products', ...categories] },
              { title: 'Company', links: ['About', 'Careers', 'Press', 'Blog'] },
              { title: 'Support', links: ['Help center', 'Shipping', 'Returns', 'Contact'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-display text-sm font-bold uppercase tracking-wider">{col.title}</h4>
                <ul className="mt-4 space-y-2.5 text-sm text-zinc-500">
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link to="/products" className="transition-colors hover:text-accent">
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-black/10 pt-6 text-sm text-zinc-500 dark:border-white/10 sm:flex-row">
            <p>© 2026 Velora. A demo storefront — all data is local & for demonstration only.</p>
            <p className="flex items-center gap-2">
              Crafted with <span className="text-rose-500">♥</span> using React + Tailwind
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
