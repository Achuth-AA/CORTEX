import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../utils/api.js'
import Avatar from '../components/Avatar.jsx'

const COLORS = ['#6366f1', '#06b6d4', '#ec4899', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6']

export default function Settings({ onClose }) {
  const { user, setUser, logout } = useAuth()
  const [username, setUsername] = useState(user.username)
  const [avatar, setAvatar] = useState(user.avatar || COLORS[0])
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const flash = (m) => {
    setMsg(m)
    setErr('')
    setTimeout(() => setMsg(''), 2500)
  }

  const saveProfile = async () => {
    try {
      const updated = await api('/api/users/profile', { method: 'PATCH', body: { username, avatar } })
      setUser((u) => ({ ...u, username: updated.username, avatar: updated.avatar }))
      flash('Profile updated.')
    } catch (e) {
      setErr(e.message)
    }
  }

  const changePassword = async () => {
    if (pw.next !== pw.confirm) return setErr('New passwords do not match.')
    try {
      await api('/api/users/password', {
        method: 'PATCH',
        body: { currentPassword: pw.current, newPassword: pw.next },
      })
      setPw({ current: '', next: '', confirm: '' })
      flash('Password changed.')
    } catch (e) {
      setErr(e.message)
    }
  }

  const deleteAccount = async () => {
    try {
      await api('/api/users/me', { method: 'DELETE' })
      logout()
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <section>
        <div className="mb-3 flex items-center gap-3">
          <Avatar name={username} color={avatar} size={52} />
          <div>
            <p className="text-sm font-semibold">{username}</p>
            <p className="text-xs text-zinc-500">{user.email}</p>
          </div>
        </div>
        <label className="mb-1 block text-xs font-semibold text-zinc-400">Display name</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="input mb-3" />
        <label className="mb-1 block text-xs font-semibold text-zinc-400">Avatar color</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setAvatar(c)}
              className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${avatar === c ? 'ring-2 ring-white ring-offset-2 ring-offset-panel' : ''}`}
              style={{ background: c }}
            />
          ))}
        </div>
        <button onClick={saveProfile} className="btn-accent mt-3 w-full !py-2 text-sm">Save profile</button>
      </section>

      <div className="h-px bg-white/10" />

      {/* Password */}
      <section className="space-y-2">
        <h3 className="text-sm font-bold">Change password</h3>
        <input type="password" placeholder="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className="input" />
        <input type="password" placeholder="New password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className="input" />
        <input type="password" placeholder="Confirm new password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className="input" />
        <button onClick={changePassword} className="btn-ghost w-full !py-2 text-sm">Update password</button>
      </section>

      {msg && <p className="text-sm font-medium text-green-400">{msg}</p>}
      {err && <p className="text-sm font-medium text-red-400">{err}</p>}

      <div className="h-px bg-white/10" />

      {/* Account */}
      <section>
        <p className="text-xs text-zinc-500">
          Account created {new Date(user.createdAt?.replace(' ', 'T') + 'Z').toLocaleDateString()}
        </p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="mt-3 w-full rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10">
            Delete account
          </button>
        ) : (
          <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/5 p-3">
            <p className="text-sm text-red-300">This permanently deletes your account. Are you sure?</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost flex-1 !py-2 text-sm">Cancel</button>
              <button onClick={deleteAccount} className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
