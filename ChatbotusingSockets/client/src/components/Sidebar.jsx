import { useState } from 'react'
import { motion } from 'framer-motion'
import { useChat } from '../context/ChatContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import Avatar from './Avatar.jsx'
import { SearchIcon, PlusIcon, HashIcon, SettingsIcon, LogOutIcon, UsersIcon, ShieldIcon } from './icons.jsx'

function Unread({ count }) {
  if (!count) return null
  return (
    <motion.span
      key={count}
      initial={{ scale: 0.4 }}
      animate={{ scale: [1.4, 1] }}
      className="ml-auto grid h-5 min-w-[20px] place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white"
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  )
}

export default function Sidebar({ onCreateRoom, onBrowseRooms, onNewDm, onOpenSettings }) {
  const { user, logout } = useAuth()
  const { rooms, dmIds, usersById, unread, active, selectRoom, selectDM, isOnline } = useChat()
  const [q, setQ] = useState('')

  const ql = q.trim().toLowerCase()
  const shownRooms = rooms.filter((r) => r.name.toLowerCase().includes(ql))
  const shownDms = dmIds
    .map((id) => usersById[id])
    .filter((u) => u && u.username.toLowerCase().includes(ql))

  const isActive = (type, id) => active?.type === type && active.id === id

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar">
      {/* Brand + user */}
      <div className="border-b border-white/5 p-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-violet text-white shadow-glow">
            <ShieldIcon width={18} height={18} />
          </div>
          <span className="text-gradient font-display text-lg font-extrabold">Lumina</span>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> AES-256
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2">
          <Avatar name={user.username} color={user.avatar} size={38} showDot online />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.username}</p>
            <p className="text-xs text-green-400">online</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <SearchIcon width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Lists */}
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-2">
        {/* Rooms */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Rooms</span>
            <div className="flex gap-1">
              <button onClick={onBrowseRooms} title="Browse rooms" className="rounded-md p-1 text-zinc-400 hover:bg-white/10 hover:text-white">
                <UsersIcon width={15} height={15} />
              </button>
              <button onClick={onCreateRoom} title="Create room" className="rounded-md p-1 text-zinc-400 hover:bg-white/10 hover:text-white">
                <PlusIcon width={15} height={15} />
              </button>
            </div>
          </div>
          {shownRooms.map((r) => (
            <button
              key={r.id}
              onClick={() => selectRoom(r.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors ${
                isActive('room', r.id) ? 'bg-accent/15 text-white' : 'text-zinc-300 hover:bg-white/5'
              }`}
            >
              <HashIcon width={17} height={17} className="text-zinc-500" />
              <span className="truncate">{r.name}</span>
              <Unread count={unread[`room:${r.id}`]} />
            </button>
          ))}
          {shownRooms.length === 0 && <p className="px-3 py-1 text-xs text-zinc-600">No rooms</p>}
        </div>

        {/* DMs */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Direct Messages</span>
            <button onClick={onNewDm} title="New DM" className="rounded-md p-1 text-zinc-400 hover:bg-white/10 hover:text-white">
              <PlusIcon width={15} height={15} />
            </button>
          </div>
          {shownDms.map((u) => (
            <button
              key={u.id}
              onClick={() => selectDM(u.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors ${
                isActive('dm', u.id) ? 'bg-accent/15 text-white' : 'text-zinc-300 hover:bg-white/5'
              }`}
            >
              <Avatar name={u.username} color={u.avatar} size={26} showDot online={isOnline(u.id)} />
              <span className="truncate">{u.username}</span>
              <Unread count={unread[`dm:${u.id}`]} />
            </button>
          ))}
          {shownDms.length === 0 && <p className="px-3 py-1 text-xs text-zinc-600">No conversations yet</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1 border-t border-white/5 p-3">
        <button onClick={onOpenSettings} className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">
          <SettingsIcon width={17} height={17} /> Settings
        </button>
        <button onClick={logout} className="grid h-9 w-9 place-items-center rounded-xl text-zinc-400 hover:bg-red-500/15 hover:text-red-400" title="Log out">
          <LogOutIcon width={17} height={17} />
        </button>
      </div>
    </div>
  )
}
