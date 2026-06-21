import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { RouteLoader } from './components/Spinner.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Checkout from './pages/Checkout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'

function Page({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.main>
  )
}

function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-6xl font-extrabold text-accent">404</h1>
      <p className="text-zinc-500">This page wandered off the shelf.</p>
      <a href="/" className="btn-accent">
        Back home
      </a>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const [routeLoading, setRouteLoading] = useState(false)

  // Brief loading spinner on route change + scroll to top.
  useEffect(() => {
    setRouteLoading(true)
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
    const t = setTimeout(() => setRouteLoading(false), 280)
    return () => clearTimeout(t)
  }, [location.pathname])

  return (
    <div className="theme-bg min-h-screen">
      <Navbar />
      <CartDrawer />

      {routeLoading ? (
        <RouteLoader />
      ) : (
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/products" element={<Page><Products /></Page>} />
            <Route path="/product/:id" element={<Page><ProductDetail /></Page>} />
            <Route path="/wishlist" element={<Page><Wishlist /></Page>} />
            <Route path="/login" element={<Page><Login /></Page>} />
            <Route path="/register" element={<Page><Register /></Page>} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Page><Checkout /></Page>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Page><Profile /></Page>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Page><NotFound /></Page>} />
          </Routes>
        </AnimatePresence>
      )}
    </div>
  )
}
