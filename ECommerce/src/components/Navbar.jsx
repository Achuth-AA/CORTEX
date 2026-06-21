import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import {
  HeartIcon,
  BagIcon,
  SunIcon,
  MoonIcon,
  MenuIcon,
  CloseIcon,
  SearchIcon,
} from './icons.jsx'

const links = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/wishlist', label: 'Wishlist' },
  { to: '/profile', label: 'Profile' },
]

function Badge({ count }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0 }}
          animate={{ scale: [1.5, 1] }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[20px] place-items-center
            rounded-full bg-gradient-to-r from-accent to-accent-violet px-1 text-[11px] font-bold text-white"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

export default function Navbar() {
  const { count: cartCount, openCart } = useCart()
  const { count: wishCount } = useWishlist()
  const { currentUser, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  const submitSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products')
    setMobileOpen(false)
  }

  const initials = currentUser
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''

  const doLogout = () => {
    logout()
    setMenuOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50">
      <nav className="glass mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="font-display text-xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-accent to-accent-violet bg-clip-text text-transparent">
            VELORA
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className="focus-ring relative rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-accent"
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Desktop search */}
        <form onSubmit={submitSearch} className="hidden flex-1 justify-center px-6 lg:flex">
          <div className="relative w-full max-w-xs">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width={18} height={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="focus-ring w-full rounded-full border border-black/10 bg-black/5 py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-accent dark:border-white/10 dark:bg-white/5"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="focus-ring grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="focus-ring relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <HeartIcon />
            <Badge count={wishCount} />
          </Link>

          <button
            onClick={openCart}
            aria-label="Open cart"
            className="focus-ring relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            <BagIcon />
            <Badge count={cartCount} />
          </button>

          {/* Auth */}
          {currentUser ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="focus-ring ml-1 grid h-10 w-10 place-items-center rounded-full
                  bg-gradient-to-br from-accent to-accent-violet text-sm font-bold text-white"
                aria-label="Account menu"
              >
                {initials}
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="glass absolute right-0 mt-2 w-44 overflow-hidden rounded-xl p-1 shadow-card"
                  >
                    <p className="px-3 py-2 text-xs text-zinc-500">
                      {currentUser.email}
                    </p>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={doLogout}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-500 hover:bg-rose-500/10"
                    >
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn-accent ml-1 hidden !px-5 !py-2 text-sm md:inline-flex">
              Login
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="focus-ring grid h-10 w-10 place-items-center rounded-full md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass overflow-hidden md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              <form onSubmit={submitSearch} className="relative mb-2">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width={18} height={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  aria-label="Search products"
                  className="focus-ring w-full rounded-full border border-black/10 bg-black/5 py-2.5 pl-10 pr-4 text-sm outline-none dark:border-white/10 dark:bg-white/5"
                />
              </form>
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-medium ${
                      isActive ? 'bg-accent/10 text-accent' : 'hover:bg-black/5 dark:hover:bg-white/10'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="my-2 h-px bg-black/10 dark:bg-white/10" />
              {currentUser ? (
                <button
                  onClick={doLogout}
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium text-rose-500"
                >
                  Log Out ({currentUser.name})
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-accent w-full"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
