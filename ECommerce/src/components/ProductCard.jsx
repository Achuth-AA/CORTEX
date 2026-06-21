import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { HeartIcon, BagIcon } from './icons.jsx'
import Stars from './Stars.jsx'
import Badge from './Badge.jsx'

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wished = isWishlisted(product.id)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 8) * 0.05 }}
      whileHover={{ y: -8 }}
      className="group card-surface relative flex flex-col overflow-hidden rounded-2xl shadow-card
        transition-shadow duration-300 hover:shadow-glow"
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="relative block overflow-hidden">
        <div className="aspect-square overflow-hidden bg-black/5 dark:bg-white/5">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="absolute left-3 top-3">
          <Badge badge={product.badge} />
        </div>

        {/* Quick add — slides up on hover */}
        <div className="absolute inset-x-3 bottom-3 translate-y-16 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.preventDefault()
              addToCart(product)
            }}
            className="btn-accent w-full !py-2.5 text-sm"
          >
            <BagIcon width={16} height={16} /> Quick Add
          </button>
        </div>
      </Link>

      {/* Wishlist heart */}
      <button
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={() => toggleWishlist(product)}
        className="focus-ring absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full
          bg-white/80 text-rose-500 backdrop-blur transition-colors dark:bg-ink-900/70"
      >
        <motion.span
          key={wished ? 'on' : 'off'}
          initial={{ scale: 0.6 }}
          animate={{ scale: [1.4, 1] }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          <HeartIcon filled={wished} width={18} height={18} />
        </motion.span>
      </button>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
          {product.category}
        </p>
        <Link
          to={`/product/${product.id}`}
          className="line-clamp-1 font-display text-base font-bold hover:text-accent"
        >
          {product.name}
        </Link>
        <Stars rating={product.rating} count={product.reviewCount} />
        <div className="mt-auto flex items-center gap-2 pt-1">
          <span className="text-lg font-bold">${product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-zinc-400 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
