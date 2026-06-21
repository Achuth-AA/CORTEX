import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { API_URL, getToken } from '../utils/api'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!user) return
    const opts = {
      auth: { token: getToken() },
      transports: ['websocket', 'polling'],
    }
    // Empty API_URL → connect to the current origin (proxied by Vite). Works in
    // Codespaces / any port-forward without a hardcoded backend host.
    const s = API_URL ? io(API_URL, opts) : io(opts)
    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    s.on('connect_error', (err) => console.warn('Socket error:', err.message))
    setSocket(s)
    return () => {
      s.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
