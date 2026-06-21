import { createContext, useContext, useEffect, useMemo } from 'react'
import { useSession } from '../hooks/useSession.js'
import { seedUsers } from '../data/users.js'

const AuthContext = createContext(null)

let nextId = Date.now()
const genId = () => ++nextId

export function AuthProvider({ children }) {
  const [users, setUsers] = useSession('users', null)
  const [currentUser, setCurrentUser] = useSession('currentUser', null)

  // Seed the registered-users list on first run so testers can log in.
  useEffect(() => {
    if (users === null) setUsers(seedUsers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const list = users || seedUsers

  const register = ({ name, email, password }) => {
    const exists = list.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    )
    if (exists) {
      return { ok: false, error: 'An account with this email already exists.' }
    }
    const user = {
      id: genId(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    }
    setUsers([...list, user])
    // Auto-login after registration.
    const safe = { id: user.id, name: user.name, email: user.email }
    setCurrentUser(safe)
    return { ok: true, user: safe }
  }

  const login = ({ email, password }) => {
    const match = list.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    )
    if (!match) {
      return { ok: false, error: 'Invalid email or password.' }
    }
    const safe = { id: match.id, name: match.name, email: match.email }
    setCurrentUser(safe)
    return { ok: true, user: safe }
  }

  const logout = () => setCurrentUser(null)

  const updateName = (name) => {
    if (!currentUser) return
    setCurrentUser({ ...currentUser, name })
    setUsers(
      list.map((u) => (u.id === currentUser.id ? { ...u, name } : u))
    )
  }

  const value = useMemo(
    () => ({ currentUser, register, login, logout, updateName }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser, users]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
