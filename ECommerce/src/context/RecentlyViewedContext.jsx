import { createContext, useContext, useCallback, useMemo } from 'react'
import { useLocal } from '../hooks/useLocal.js'
import { getProductById } from '../data/products.js'

const RecentlyViewedContext = createContext(null)

const MAX = 8

export function RecentlyViewedProvider({ children }) {
  // Persist a small list of product ids, most-recent first.
  const [ids, setIds] = useLocal('recentlyViewed', [])

  const addRecent = useCallback(
    (productId) => {
      const id = Number(productId)
      setIds((prev) => [id, ...prev.filter((p) => p !== id)].slice(0, MAX))
    },
    [setIds]
  )

  const clearRecent = useCallback(() => setIds([]), [setIds])

  // Resolve ids → products, dropping any that no longer exist.
  const recent = useMemo(
    () => ids.map(getProductById).filter(Boolean),
    [ids]
  )

  const value = { recent, addRecent, clearRecent }
  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export const useRecentlyViewed = () => useContext(RecentlyViewedContext)
