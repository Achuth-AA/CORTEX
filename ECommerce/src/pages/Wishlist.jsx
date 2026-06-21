import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { getProductById } from '../data/products.js'
import Badge from '../components/Badge.jsx'
import { HeartIcon, TrashIcon, BagIcon } from '../components/icons.jsx'

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  const moveToCart = (item) => {
    const product = getProductById(item.productId)
    if (product) addToCart(product)
    removeFromWishlist(item.productId)
  }

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center gap-5 px-4 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="grid h-28 w-28 place-items-center rounded-full bg-rose-500/10 text-rose-500"
        >
          <HeartIcon width={48} height={48} />
        </motion.div>
        <h1 className="font-display text-3xl font-extrabold">Your wishlist is empty</h1>
        <p className="max-w-md text-zinc-500">
          Tap the heart on any product to save it here for later.
        </p>
        <Link to="/products" className="btn-accent">
          Go Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <h1 className="font-display text-4xl font-extrabold">Your Wishlist</h1>
      <p className="mt-2 text-zinc-500">{wishlist.length} saved items</p>

      <motion.div layout className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {wishlist.map((item) => (
            <motion.div
              key={item.productId}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="card-surface flex flex-col overflow-hidden rounded-2xl shadow-card"
            >
              <Link to={`/product/${item.productId}`} className="relative block aspect-square overflow-hidden">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />
                <div className="absolute left-3 top-3">
                  <Badge badge={item.badge} />
                </div>
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <Link to={`/product/${item.productId}`} className="line-clamp-1 font-display font-bold hover:text-accent">
                  {item.name}
                </Link>
                <span className="text-lg font-bold">${item.price}</span>
                <div className="mt-auto flex flex-col gap-2 pt-2">
                  <button onClick={() => moveToCart(item)} className="btn-accent !py-2 text-sm">
                    <BagIcon width={16} height={16} /> Move to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-black/10 py-2 text-sm text-zinc-500 transition-colors hover:border-rose-500 hover:text-rose-500 dark:border-white/15"
                  >
                    <TrashIcon width={15} height={15} /> Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
