import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useChat } from '../context/ChatContext.jsx'
import { SearchIcon, HashIcon, CheckIcon } from '../components/icons.jsx'

export default function RoomsBrowser({ onClose }) {
  const { allRooms, refreshRooms, joinRoom, selectRoom } = useChat()
  const [q, setQ] = useState('')
  const [joining, setJoining] = useState(null)

  useEffect(() => {
    refreshRooms()
  }, [refreshRooms])

  const shown = allRooms.filter(
    (r) =>
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(q.toLowerCase())
  )

  const handleJoin = async (room) => {
    setJoining(room.id)
    try {
      if (room.joined) selectRoom(room.id)
      else await joinRoom(room.id)
      onClose()
    } finally {
      setJoining(null)
    }
  }

  return (
    <div>
      <div className="relative mb-4">
        <SearchIcon width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search rooms…"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="no-scrollbar max-h-[60vh] space-y-2 overflow-y-auto">
        {shown.map((room) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3"
          >
            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
              <HashIcon width={20} height={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">#{room.name}</p>
              <p className="truncate text-xs text-zinc-500">
                {room.description || 'No description'} · {room.memberCount} members
              </p>
            </div>
            <button
              onClick={() => handleJoin(room)}
              disabled={joining === room.id}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                room.joined ? 'border border-white/10 text-zinc-300 hover:bg-white/10' : 'bg-accent text-white hover:brightness-110'
              }`}
            >
              {room.joined ? (<><CheckIcon width={14} height={14} /> Open</>) : joining === room.id ? 'Joining…' : 'Join'}
            </button>
          </motion.div>
        ))}
        {shown.length === 0 && <p className="py-8 text-center text-sm text-zinc-500">No rooms found.</p>}
      </div>
    </div>
  )
}
