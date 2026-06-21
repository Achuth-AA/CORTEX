import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '../context/ChatContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import Sidebar from '../components/Sidebar.jsx'
import ChatWindow from '../components/ChatWindow.jsx'
import MembersPanel from '../components/MembersPanel.jsx'
import Modal from '../components/Modal.jsx'
import Avatar from '../components/Avatar.jsx'
import Settings from './Settings.jsx'
import RoomsBrowser from './RoomsBrowser.jsx'
import { HashIcon, UsersIcon, SearchIcon } from '../components/icons.jsx'

// ── Create-room modal body ───────────────────────────────────────────────
function CreateRoom({ onClose }) {
  const { createRoom } = useChat()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await createRoom(name, description)
      onClose()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="relative">
        <HashIcon width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="room-name" className="input pl-9" />
      </div>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this room about?" rows={3} className="input resize-none" />
      {err && <p className="text-sm text-red-400">{err}</p>}
      <button disabled={busy} className="btn-accent w-full">{busy ? 'Creating…' : 'Create room'}</button>
    </form>
  )
}

// ── New-DM modal body ────────────────────────────────────────────────────
function NewDm({ onClose }) {
  const { users, selectDM, isOnline } = useChat()
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const shown = users
    .filter((u) => u.id !== user.id)
    .filter((u) => u.username.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <div className="relative mb-3">
        <SearchIcon width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people…" className="input pl-9" />
      </div>
      <div className="no-scrollbar max-h-[55vh] space-y-1 overflow-y-auto">
        {shown.map((u) => (
          <button
            key={u.id}
            onClick={() => { selectDM(u.id); onClose() }}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/5"
          >
            <Avatar name={u.username} color={u.avatar} size={36} showDot online={isOnline(u.id)} />
            <div>
              <p className="text-sm font-medium">{u.username}</p>
              <p className="text-xs text-zinc-500">{isOnline(u.id) ? 'online' : 'offline'}</p>
            </div>
          </button>
        ))}
        {shown.length === 0 && <p className="py-6 text-center text-sm text-zinc-500">No people found.</p>}
      </div>
    </div>
  )
}

// ── Chat page ─────────────────────────────────────────────────────────────
export default function Chat({ initialView, initialSettings }) {
  const { active } = useChat()
  const [tab, setTab] = useState('rooms') // mobile: rooms | chat | members
  const [modal, setModal] = useState(initialSettings ? 'settings' : initialView === 'rooms' ? 'rooms' : null)
  const [membersOpen, setMembersOpen] = useState(false)

  // On mobile, jump to the chat panel whenever a conversation opens.
  useEffect(() => {
    if (active) setTab('chat')
  }, [active])

  const close = () => setModal(null)

  return (
    <div className="relative h-dvh overflow-hidden bg-base text-zinc-100 md:grid md:grid-cols-[clamp(220px,26vw,300px)_minmax(0,1fr)] xl:grid-cols-[clamp(240px,20vw,320px)_minmax(0,1fr)_clamp(240px,22vw,340px)]">
      {/* Ambient aurora backdrop */}
      <div className="aurora" />
      {/* Sidebar */}
      <aside className={`h-full min-h-0 overflow-hidden ${tab === 'rooms' ? 'flex' : 'hidden'} flex-col pb-14 md:flex md:pb-0`}>
        <Sidebar
          onCreateRoom={() => setModal('createRoom')}
          onBrowseRooms={() => setModal('rooms')}
          onNewDm={() => setModal('newDm')}
          onOpenSettings={() => setModal('settings')}
        />
      </aside>

      {/* Chat window */}
      <main className={`h-full min-h-0 overflow-hidden ${tab === 'chat' ? 'flex' : 'hidden'} flex-col pb-14 md:flex md:pb-0`}>
        <ChatWindow onOpenMembers={() => setMembersOpen(true)} onBack={() => setTab('rooms')} />
      </main>

      {/* Members panel (static third column on xl, slide-over below) */}
      <aside className={`h-full min-h-0 overflow-hidden ${tab === 'members' ? 'block' : 'hidden'} pb-14 xl:block xl:pb-0`}>
        <MembersPanel />
      </aside>

      {/* Members slide-over (tablet) */}
      <AnimatePresence>
        {membersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMembersOpen(false)} className="fixed inset-0 z-40 bg-black/60 xl:hidden" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 z-50 h-full w-72 max-w-[85vw] xl:hidden"
            >
              <MembersPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom tab bar (phones only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-white/10 bg-panel md:hidden">
        {[
          { key: 'rooms', label: 'Rooms', icon: HashIcon },
          { key: 'chat', label: 'Chat', icon: SearchIcon },
          { key: 'members', label: 'Members', icon: UsersIcon },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${tab === t.key ? 'text-accent' : 'text-zinc-500'}`}
          >
            <t.icon width={20} height={20} />
            {t.label}
          </button>
        ))}
      </nav>

      {/* Modals */}
      <Modal open={modal === 'createRoom'} onClose={close} title="Create a room">
        <CreateRoom onClose={close} />
      </Modal>
      <Modal open={modal === 'newDm'} onClose={close} title="New direct message">
        <NewDm onClose={close} />
      </Modal>
      <Modal open={modal === 'rooms'} onClose={close} title="Browse rooms" maxWidth="max-w-lg">
        <RoomsBrowser onClose={close} />
      </Modal>
      <Modal open={modal === 'settings'} onClose={close} title="Settings" maxWidth="max-w-md">
        <Settings onClose={close} />
      </Modal>
    </div>
  )
}
