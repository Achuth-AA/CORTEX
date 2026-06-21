import { createContext, useContext } from 'react'
import { useSession } from '../hooks/useSession.js'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useSession('wishlist', [])

  const isWishlisted = (productId) =>
    wishlist.some((i) => i.productId === productId)

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.some((i) => i.productId === product.id)) {
        return prev.filter((i) => i.productId !== product.id)
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          badge: product.badge,
        },
      ]
    })
  }

  const removeFromWishlist = (productId) =>
    setWishlist((prev) => prev.filter((i) => i.productId !== productId))

  const clearWishlist = () => setWishlist([])

  const value = {
    wishlist,
    count: wishlist.length,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
