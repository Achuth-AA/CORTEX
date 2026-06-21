import { createContext, useContext, useMemo } from 'react'
import { useSession } from '../hooks/useSession.js'

const CartContext = createContext(null)

const lineKey = (productId, size, color) => `${productId}|${size}|${color}`

export function CartProvider({ children }) {
  const [cart, setCart] = useSession('cart', [])
  const [isOpen, setIsOpen] = useSession('cartOpen', false)

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const addToCart = (product, { size, color, quantity = 1 } = {}) => {
    const chosenSize = size ?? product.sizes?.[0] ?? 'One Size'
    const chosenColor = color ?? product.colors?.[0] ?? '#6366f1'
    setCart((prev) => {
      const key = lineKey(product.id, chosenSize, chosenColor)
      const existing = prev.find(
        (i) => lineKey(i.productId, i.size, i.color) === key
      )
      if (existing) {
        return prev.map((i) =>
          lineKey(i.productId, i.size, i.color) === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          size: chosenSize,
          color: chosenColor,
          quantity,
        },
      ]
    })
    openCart()
  }

  const updateQuantity = (key, delta) =>
    setCart((prev) =>
      prev
        .map((i) =>
          lineKey(i.productId, i.size, i.color) === key
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    )

  const removeItem = (key) =>
    setCart((prev) =>
      prev.filter((i) => lineKey(i.productId, i.size, i.color) !== key)
    )

  const clearCart = () => setCart([])

  const { count, subtotal } = useMemo(() => {
    return cart.reduce(
      (acc, i) => {
        acc.count += i.quantity
        acc.subtotal += i.price * i.quantity
        return acc
      },
      { count: 0, subtotal: 0 }
    )
  }, [cart])

  const value = {
    cart,
    count,
    subtotal,
    isOpen,
    openCart,
    closeCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    lineKey,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
