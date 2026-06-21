import { createContext, useContext, useEffect } from 'react'
import { useSession } from '../hooks/useSession.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // Dark mode by default.
  const [theme, setTheme] = useSession('theme', 'dark')

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  }, [theme])

  const toggleTheme = () =>
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
