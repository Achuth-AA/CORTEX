import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext.jsx'
import { CloseIcon, PlusIcon, MinusIcon, BagIcon } from './icons.jsx'

const SHIPPING_FREE_OVER = 150

export default function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    count,
    lineKey,
  } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col
              bg-white shadow-2xl dark:bg-ink-900"
          >
            <div className="flex items-center justify-between border-b border-black/10 p-5 dark:border-white/10">
              <h2 className="font-display text-lg font-bold">
                Your Cart <span className="text-accent">({count})</span>
              </h2>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="focus-ring grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-accent/10 text-accent">
                    <BagIcon width={34} height={34} />
                  </div>
                  <p className="text-zinc-500">Your cart is empty.</p>
                  <Link to="/products" onClick={closeCart} className="btn-ghost">
                    Start shopping
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {cart.map((item) => {
                      const key = lineKey(item.productId, item.size, item.color)
                      return (
                        <motion.li
                          key={key}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, x: 120 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 36 }}
                          className="flex gap-3"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
                          />
                          <div className="flex flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                to={`/product/${item.productId}`}
                                onClick={closeCart}
                                className="line-clamp-1 text-sm font-semibold hover:text-accent"
                              >
                                {item.name}
                              </Link>
                              <button
                                onClick={() => removeItem(key)}
                                className="text-xs text-zinc-400 hover:text-rose-500"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                              <span>{item.size}</span>
                              <span
                                className="inline-block h-3 w-3 rounded-full border border-black/10 dark:border-white/20"
                                style={{ background: item.color }}
                              />
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <div className="flex items-center gap-1 rounded-full border border-black/10 dark:border-white/15">
                                <button
                                  onClick={() => updateQuantity(key, -1)}
                                  className="grid h-7 w-7 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                                  aria-label="Decrease quantity"
                                >
                                  <MinusIcon width={14} height={14} />
                                </button>
                                <AnimatePresence mode="popLayout">
                                  <motion.span
                                    key={item.quantity}
                                    initial={{ y: -8, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 8, opacity: 0 }}
                                    className="w-6 text-center text-sm font-semibold"
                                  >
                                    {item.quantity}
                                  </motion.span>
                                </AnimatePresence>
                                <button
                                  onClick={() => updateQuantity(key, 1)}
                                  className="grid h-7 w-7 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                                  aria-label="Increase quantity"
                                >
                                  <PlusIcon width={14} height={14} />
                                </button>
                              </div>
                              <span className="text-sm font-bold">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-black/10 p-5 dark:border-white/10">
                <div className="mb-1 flex items-center justify-between text-sm text-zinc-500">
                  <span>Shipping</span>
                  <span>{subtotal >= SHIPPING_FREE_OVER ? 'Free' : '$12.00'}</span>
                </div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-semibold">Subtotal</span>
                  <motion.span
                    key={subtotal}
                    initial={{ scale: 1.15, color: '#8b5cf6' }}
                    animate={{ scale: 1, color: 'inherit' }}
                    className="font-display text-xl font-bold"
                  >
                    ${subtotal.toFixed(2)}
                  </motion.span>
                </div>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="btn-accent w-full animate-pulse-glow"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
