import { createContext, useContext, useEffect, useState } from 'react'
import { api, setToken, clearToken, getToken } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from a stored token.
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api('/api/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password, remember) => {
    const { token, user } = await api('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password, remember },
    })
    setToken(token)
    setUser(user)
    return user
  }

  const register = async (payload) => {
    const { token, user } = await api('/api/auth/register', {
      method: 'POST',
      auth: false,
      body: payload,
    })
    setToken(token)
    setUser(user)
    return user
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  const value = { user, setUser, loading, login, register, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
