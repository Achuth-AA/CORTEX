import { useEffect, useState } from 'react'
import { useChat } from '../context/ChatContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../utils/api.js'
import Avatar from './Avatar.jsx'
import EncryptedBadge from './EncryptedBadge.jsx'
import { LockIcon } from './icons.jsx'

const lastSeen = (ts) => {
  if (!ts) return 'offline'
  const m = Math.floor((Date.now() - new Date(ts.replace(' ', 'T') + 'Z').getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`
}

export default function MembersPanel() {
  const { user } = useAuth()
  const { active, allRooms, isOnline, selectDM, usersById } = useChat()
  const [members, setMembers] = useState([])
  const [createdBy, setCreatedBy] = useState(null)

  useEffect(() => {
    if (active?.type !== 'room') {
      setMembers([])
      return
    }
    const room = allRooms.find((r) => r.id === active.id)
    setCreatedBy(room?.created_by ?? null)
    api(`/api/rooms/${active.id}`)
      .then((r) => setMembers(r.members || []))
      .catch(() => setMembers([]))
  }, [active, allRooms])

  if (!active) return null

  // DM: show the contact card.
  if (active.type === 'dm') {
    const u = usersById[active.id]
    return (
      <div className="flex h-full flex-col items-center gap-4 bg-sidebar p-5 text-center">
        <Avatar name={u?.username} color={u?.avatar} size={80} showDot online={isOnline(active.id)} />
        <div>
          <h3 className="font-display text-lg font-bold">{u?.username}</h3>
          <p className="text-xs text-zinc-500">{isOnline(active.id) ? 'online' : `last seen ${lastSeen(u?.lastSeen)}`}</p>
        </div>
        <div className="w-full rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-left text-xs text-zinc-400">
          <p className="mb-1 flex items-center gap-1.5 font-semibold text-green-400">
            <LockIcon width={14} height={14} /> End-to-end encrypted
          </p>
          Messages in this conversation are secured with AES-256. Only you and {u?.username} can read them.
        </div>
      </div>
    )
  }

  const onlineMembers = members.filter((m) => isOnline(m.id))
  const offlineMembers = members.filter((m) => !isOnline(m.id))

  const Row = ({ m }) => (
    <button
      onClick={() => m.id !== user.id && selectDM(m.id)}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm hover:bg-white/5 disabled:cursor-default"
      disabled={m.id === user.id}
    >
      <Avatar name={m.username} color={m.avatar} size={34} showDot online={isOnline(m.id)} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate font-medium">
          {m.username} {m.id === user.id && <span className="text-xs text-zinc-500">(you)</span>}
          {m.id === createdBy && <span className="text-amber-400" title="Room admin">★</span>}
        </p>
        <p className="text-xs text-zinc-500">{isOnline(m.id) ? 'online' : lastSeen(m.lastSeen)}</p>
      </div>
    </button>
  )

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3.5">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-zinc-400">Members</h3>
        <EncryptedBadge compact />
      </div>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {onlineMembers.length > 0 && (
          <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-green-500/80">
            Online — {onlineMembers.length}
          </p>
        )}
        {onlineMembers.map((m) => <Row key={m.id} m={m} />)}
        {offlineMembers.length > 0 && (
          <p className="mt-3 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600">
            Offline — {offlineMembers.length}
          </p>
        )}
        {offlineMembers.map((m) => <div key={m.id} className="opacity-60"><Row m={m} /></div>)}
      </div>
    </div>
  )
}
