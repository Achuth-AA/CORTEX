import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Chat from './pages/Chat.jsx'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading)
    return (
      <div className="grid h-screen place-items-center bg-base">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-zinc-500">Decrypting your session…</p>
        </div>
      </div>
    )
  return user ? children : <Navigate to="/login" replace />
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/chat" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/chat" element={<Protected><Chat /></Protected>} />
      <Route path="/chat/rooms" element={<Protected><Chat initialView="rooms" /></Protected>} />
      <Route path="/settings" element={<Protected><Chat initialSettings /></Protected>} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  )
}
