import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getProductById, getRelated } from '../data/products.js'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useRecentlyViewed } from '../context/RecentlyViewedContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Reviews from '../components/Reviews.jsx'
import Stars from '../components/Stars.jsx'
import Badge from '../components/Badge.jsx'
import { HeartIcon, BagIcon, ChevronLeftIcon, PlusIcon, MinusIcon } from '../components/icons.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const product = getProductById(id)
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { addRecent } = useRecentlyViewed()

  const [activeImg, setActiveImg] = useState(0)
  const [size, setSize] = useState(product?.sizes?.[0])
  const [color, setColor] = useState(product?.colors?.[0])
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  // Record the visit so it shows up under "Recently viewed".
  useEffect(() => {
    if (product) addRecent(product.id)
    setActiveImg(0)
    setQuantity(1)
  }, [product, addRecent])

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-lg font-semibold">Product not found.</p>
        <Link to="/products" className="btn-accent mt-6">
          Back to products
        </Link>
      </div>
    )
  }

  const wished = isWishlisted(product.id)
  const related = getRelated(product)

  const handleAdd = () => {
    addToCart(product, { size, color, quantity })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <Link to="/products" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-accent">
        <ChevronLeftIcon width={16} height={16} /> Back to products
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* MEDIA */}
        <div>
          <div className="relative">
            <div className="group relative aspect-square overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={product.images[activeImg]}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-125"
                />
              </AnimatePresence>
              <div className="absolute left-3 top-3">
                <Badge badge={product.badge} />
              </div>
            </div>
            <div className="mt-3 flex gap-3">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition-all ${
                    activeImg === i ? 'border-accent shadow-glow' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* INFO */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {product.category}
          </p>
          <h1 className="mt-1 font-display text-4xl font-extrabold">{product.name}</h1>
          <div className="mt-3">
            <Stars rating={product.rating} count={product.reviewCount} size={18} />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="font-display text-3xl font-extrabold">${product.price}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-zinc-400 line-through">${product.originalPrice}</span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-500">
                  Save ${product.originalPrice - product.price}
                </span>
              </>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-zinc-600 dark:text-zinc-300">
            {product.description}
          </p>

          {/* Size selector */}
          {product.sizes?.length > 0 && (
            <div className="mt-7">
              <h3 className="mb-2 text-sm font-semibold">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className="relative rounded-xl border border-black/10 px-4 py-2 text-sm font-medium dark:border-white/15"
                  >
                    {size === s && (
                      <motion.span
                        layoutId="size-active"
                        className="absolute inset-0 -z-10 rounded-xl bg-accent/15 ring-2 ring-accent"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selector */}
          {product.colors?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold">Color</h3>
              <div className="flex gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    aria-label={`Color ${c}`}
                    className="relative grid h-9 w-9 place-items-center rounded-full"
                  >
                    {color === c && (
                      <motion.span
                        layoutId="color-active"
                        className="absolute inset-0 rounded-full ring-2 ring-accent ring-offset-2 ring-offset-white dark:ring-offset-ink-950"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="h-7 w-7 rounded-full border border-black/10 dark:border-white/20" style={{ background: c }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold">Quantity</h3>
            <div className="inline-flex items-center gap-1 rounded-full border border-black/10 p-1 dark:border-white/15">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/10"
              >
                <MinusIcon width={16} height={16} />
              </button>
              <span className="w-8 text-center text-sm font-bold tabular-nums">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                aria-label="Increase quantity"
                className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              >
                <PlusIcon width={16} height={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center gap-3">
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.95 }}
              className="btn-accent relative flex-1 overflow-hidden text-base"
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span
                    key="added"
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    ✓ Added to cart
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <BagIcon width={18} height={18} /> Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              onClick={() => toggleWishlist(product)}
              aria-label="Toggle wishlist"
              className="focus-ring grid h-[52px] w-[52px] place-items-center rounded-full border border-black/10 text-rose-500 transition-colors hover:border-rose-500 dark:border-white/15"
            >
              <motion.span
                key={wished ? 'on' : 'off'}
                animate={{ scale: [1.5, 1] }}
                transition={{ type: 'spring', stiffness: 500, damping: 14 }}
              >
                <HeartIcon filled={wished} width={22} height={22} />
              </motion.span>
            </button>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-3 text-sm text-zinc-500">
            <li className="rounded-xl border border-black/10 p-3 dark:border-white/10">🚚 Free shipping over $150</li>
            <li className="rounded-xl border border-black/10 p-3 dark:border-white/10">↩️ 30-day returns</li>
            <li className="rounded-xl border border-black/10 p-3 dark:border-white/10">🔒 Secure checkout</li>
            <li className="rounded-xl border border-black/10 p-3 dark:border-white/10">⭐ 2-year warranty</li>
          </ul>
        </div>
      </div>

      {/* Reviews */}
      <Reviews product={product} />

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-extrabold">You might also like</h2>
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
            {related.map((p, i) => (
              <div key={p.id} className="w-64 flex-shrink-0">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
