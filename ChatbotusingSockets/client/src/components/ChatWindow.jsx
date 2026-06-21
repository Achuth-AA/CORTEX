import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '../context/ChatContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import MessageBubble from './MessageBubble.jsx'
import MessageInput from './MessageInput.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import EncryptedBadge from './EncryptedBadge.jsx'
import Avatar from './Avatar.jsx'
import { HashIcon, LockIcon, UsersIcon, ChevronDownIcon, ArrowLeftIcon } from './icons.jsx'

const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString()
const dayLabel = (ts) => {
  const d = new Date(ts.replace(' ', 'T') + 'Z')
  const today = new Date()
  const yest = new Date()
  yest.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yest.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
}
const lastSeenLabel = (ts) => {
  if (!ts) return 'offline'
  const diff = Date.now() - new Date(ts.replace(' ', 'T') + 'Z').getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function ChatWindow({ onOpenMembers, onBack }) {
  const { user } = useAuth()
  const {
    active, rooms, allRooms, usersById, isOnline, messages, loadingMessages,
    typing, loadOlder, sendMessage, editMessage, deleteMessage, reactMessage,
    startTyping, stopTyping,
  } = useChat()

  const scrollRef = useRef(null)
  const bottomRef = useRef(null)
  const [atBottom, setAtBottom] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const prevLen = useRef(0)

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior })
    setShowNew(false)
  }, [])

  // When messages change: auto-scroll if we were at the bottom, else flag "new".
  useEffect(() => {
    if (messages.length > prevLen.current) {
      if (atBottom) requestAnimationFrame(() => scrollToBottom('smooth'))
      else setShowNew(true)
    }
    prevLen.current = messages.length
  }, [messages, atBottom, scrollToBottom])

  // Jump to bottom instantly when switching conversations.
  useEffect(() => {
    prevLen.current = messages.length
    requestAnimationFrame(() => scrollToBottom('auto'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.type, active?.id])

  const onScroll = async () => {
    const el = scrollRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    setAtBottom(distance < 80)
    if (distance < 80) setShowNew(false)

    // Infinite scroll: near top → load older, preserve position.
    if (el.scrollTop < 60 && !loadingOlder && messages.length >= 20) {
      setLoadingOlder(true)
      const prevHeight = el.scrollHeight
      const added = await loadOlder()
      if (added) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight - prevHeight })
      setLoadingOlder(false)
    }
  }

  const handleSend = (text) => {
    const payload = replyingTo ? `> ${replyingTo.senderName}: ${replyingTo.text}\n${text}` : text
    sendMessage(payload)
    setReplyingTo(null)
  }

  // ── Empty state ──
  if (!active) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-base/40 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-accent/20 to-accent-violet/20 text-accent">
          <LockIcon width={40} height={40} />
        </div>
        <div>
          <h2 className="text-gradient font-display text-2xl font-bold">Your messages are encrypted</h2>
          <p className="mt-1 max-w-sm text-sm text-zinc-500">
            Select a room or a direct message to start chatting. Everything you
            send is secured with AES-256.
          </p>
        </div>
      </div>
    )
  }

  // ── Header info ──
  let title, subtitle, headerAvatar, online
  if (active.type === 'room') {
    const room = rooms.find((r) => r.id === active.id) || allRooms.find((r) => r.id === active.id)
    title = `#${room?.name || 'room'}`
    subtitle = `${room?.memberCount || 0} members`
  } else {
    const u = usersById[active.id]
    title = u?.username || 'User'
    headerAvatar = u
    online = isOnline(active.id)
    subtitle = online ? 'online' : `last seen ${lastSeenLabel(u?.lastSeen)}`
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-base/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-panel/60 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 hover:bg-white/10 md:hidden">
            <ArrowLeftIcon width={18} height={18} />
          </button>
          {active.type === 'room' ? (
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
              <HashIcon width={20} height={20} />
            </div>
          ) : (
            <Avatar name={headerAvatar?.username} color={headerAvatar?.avatar} size={40} showDot online={online} />
          )}
          <div>
            <h2 className="font-display text-base font-bold leading-tight">{title}</h2>
            <p className="text-xs text-zinc-500">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EncryptedBadge />
          {active.type === 'room' && (
            <button onClick={onOpenMembers} className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 hover:bg-white/10 xl:hidden" title="Members">
              <UsersIcon width={18} height={18} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} onScroll={onScroll} className="relative min-h-0 flex-1 overflow-y-auto py-3">
        {loadingOlder && <p className="py-2 text-center text-xs text-zinc-500">Loading older messages…</p>}
        {loadingMessages ? (
          <div className="grid h-full place-items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-zinc-500">
            No messages yet — say hello 👋
          </div>
        ) : (
          messages.map((m, i) => {
            const showDay = i === 0 || !sameDay(messages[i - 1].createdAt, m.createdAt)
            return (
              <div key={m.id}>
                {showDay && (
                  <div className="my-3 flex items-center gap-3 px-4">
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="rounded-full bg-white/5 px-3 py-0.5 text-[11px] font-medium text-zinc-400">
                      {dayLabel(m.createdAt)}
                    </span>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                )}
                <MessageBubble
                  message={m}
                  isOwn={m.senderId === user.id}
                  myId={user.id}
                  onEdit={editMessage}
                  onDelete={deleteMessage}
                  onReact={reactMessage}
                  onReply={setReplyingTo}
                />
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* New messages button */}
      <AnimatePresence>
        {showNew && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-glow"
          >
            <ChevronDownIcon width={14} height={14} /> New messages
          </motion.button>
        )}
      </AnimatePresence>

      <TypingIndicator typing={typing} />
      <MessageInput
        onSend={handleSend}
        onTypingStart={startTyping}
        onTypingStop={stopTyping}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  )
}
