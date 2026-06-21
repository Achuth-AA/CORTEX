import { useCallback, useEffect, useState } from 'react'

/**
 * useLocal — same API as useSession, but backed by localStorage so the data
 * persists across browser sessions (used for reviews and recently-viewed,
 * which should outlive a single tab). Keeps every hook instance in this tab
 * in sync via a custom event, and syncs across tabs via the native `storage`
 * event.
 */
const EVENT = 'local-sync'

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function useLocal(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback))

  const setLocal = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        try {
          localStorage.setItem(key, JSON.stringify(resolved))
          window.dispatchEvent(new CustomEvent(EVENT, { detail: { key } }))
        } catch {
          /* storage full or blocked — ignore gracefully */
        }
        return resolved
      })
    },
    [key]
  )

  useEffect(() => {
    const sync = (e) => {
      if (e?.detail?.key && e.detail.key !== key) return
      setValue(read(key, fallback))
    }
    const onStorage = (e) => {
      if (e.key === null || e.key === key) setValue(read(key, fallback))
    }
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', onStorage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return [value, setLocal]
}

export default useLocal
