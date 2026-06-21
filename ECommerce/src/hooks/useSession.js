import { useCallback, useEffect, useState } from 'react'

/**
 * useSession — a stateful wrapper around sessionStorage with JSON
 * parse/stringify, plus cross-tab/cross-component sync.
 *
 * sessionStorage is per-tab, so the native `storage` event (which only
 * fires across tabs sharing localStorage) won't help us sync within the
 * same tab. We dispatch a custom `session-sync` event so every hook
 * instance in this tab stays consistent, and we also listen to the
 * native `storage` event so duplicated tabs that copy the session stay
 * in sync where the browser supports it.
 */
const EVENT = 'session-sync'

const read = (key, fallback) => {
  try {
    const raw = sessionStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function useSession(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback))

  // Persist + broadcast on change.
  const setSession = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        try {
          sessionStorage.setItem(key, JSON.stringify(resolved))
          window.dispatchEvent(new CustomEvent(EVENT, { detail: { key } }))
        } catch {
          /* storage might be full or blocked — ignore gracefully */
        }
        return resolved
      })
    },
    [key]
  )

  // Stay in sync with other hook instances + other tabs.
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

  return [value, setSession]
}

export default useSession
