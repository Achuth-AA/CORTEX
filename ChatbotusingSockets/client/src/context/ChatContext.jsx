import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import { api } from '../utils/api'
import { encryptMessage, decryptMessage } from '../utils/encryption'
import { useAuth } from './AuthContext'
import { useSocket } from './SocketContext'

const ChatContext = createContext(null)

// Conversation key helpers ------------------------------------------------
const roomKey = (id) => `room:${id}`
const dmKey = (id) => `dm:${id}`

export function ChatProvider({ children }) {
  const { user } = useAuth()
  const { socket } = useSocket()
  const me = user?.id

  const [rooms, setRooms] = useState([])
  const [allRooms, setAllRooms] = useState([])
  const [users, setUsers] = useState([])
  const [onlineIds, setOnlineIds] = useState(new Set())
  const [dmIds, setDmIds] = useState([])
  const [active, setActive] = useState(null) // { type:'room'|'dm', id }
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [typing, setTyping] = useState([]) // [{ userId, username }]
  const [unread, setUnread] = useState({})

  const activeRef = useRef(null)
  const typingTimers = useRef({})
  useEffect(() => {
    activeRef.current = active
  }, [active])

  const usersById = useMemo(() => {
    const m = {}
    users.forEach((u) => (m[u.id] = u))
    return m
  }, [users])

  const normalize = useCallback((msg) => ({ ...msg, text: decryptMessage(msg.content) }), [])

  const otherOf = useCallback(
    (msg) => (msg.senderId === me ? msg.recipientId : msg.senderId),
    [me]
  )
  const convKeyOf = useCallback(
    (msg) => (msg.roomId ? roomKey(msg.roomId) : dmKey(otherOf(msg))),
    [otherOf]
  )
  const activeKey = useCallback(
    () => (active ? (active.type === 'room' ? roomKey(active.id) : dmKey(active.id)) : null),
    [active]
  )

  // ── Initial data load + DM persistence ────────────────────────────────
  useEffect(() => {
    if (!user) return
    setDmIds(JSON.parse(localStorage.getItem(`chat_dms_${user.id}`) || '[]'))
    api('/api/users').then(setUsers).catch(() => {})
    api('/api/rooms')
      .then((all) => {
        setAllRooms(all)
        setRooms(all.filter((r) => r.joined))
      })
      .catch(() => {})
  }, [user])

  useEffect(() => {
    if (user) localStorage.setItem(`chat_dms_${user.id}`, JSON.stringify(dmIds))
  }, [dmIds, user])

  const addDm = useCallback((id) => {
    if (!id) return
    setDmIds((prev) => (prev.includes(id) ? prev : [id, ...prev]))
  }, [])

  // ── Socket wiring ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !user) return

    const onOnline = (ids) => setOnlineIds(new Set(ids))
    const onStatus = ({ userId, status }) =>
      setOnlineIds((prev) => {
        const next = new Set(prev)
        status === 'online' ? next.add(userId) : next.delete(userId)
        return next
      })

    const onReceive = (raw) => {
      const msg = normalize(raw)
      const key = convKeyOf(msg)
      if (msg.recipientId && msg.senderId !== me) addDm(msg.senderId)
      else if (msg.recipientId && msg.senderId === me) addDm(msg.recipientId)

      if (key === activeKey()) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
        if (msg.senderId !== me) socket.emit('message_read', { messageId: msg.id })
      } else {
        setUnread((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }))
      }
    }

    const onUpdated = ({ messageId, newContent, reactions, edited }) =>
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m
          const next = { ...m }
          if (newContent != null) {
            next.content = newContent
            next.text = decryptMessage(newContent)
            next.edited = true
          }
          if (edited) next.edited = true
          if (reactions != null) next.reactions = reactions
          return next
        })
      )

    const onDeleted = ({ messageId }) =>
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, deleted: true } : m))
      )

    const onTyping = ({ userId, username, isTyping, roomId, recipientId }) => {
      const key = roomId ? roomKey(roomId) : dmKey(userId)
      if (key !== activeKey()) return
      clearTimeout(typingTimers.current[userId])
      if (isTyping) {
        setTyping((prev) =>
          prev.some((t) => t.userId === userId) ? prev : [...prev, { userId, username }]
        )
        // Auto-clear after 3s of silence.
        typingTimers.current[userId] = setTimeout(() => {
          setTyping((prev) => prev.filter((t) => t.userId !== userId))
        }, 3000)
      } else {
        setTyping((prev) => prev.filter((t) => t.userId !== userId))
      }
    }

    socket.on('online_users', onOnline)
    socket.on('user_status', onStatus)
    socket.on('receive_message', onReceive)
    socket.on('message_updated', onUpdated)
    socket.on('message_deleted', onDeleted)
    socket.on('typing_indicator', onTyping)

    return () => {
      socket.off('online_users', onOnline)
      socket.off('user_status', onStatus)
      socket.off('receive_message', onReceive)
      socket.off('message_updated', onUpdated)
      socket.off('message_deleted', onDeleted)
      socket.off('typing_indicator', onTyping)
    }
  }, [socket, user, me, normalize, convKeyOf, activeKey, addDm])

  // Join all of my rooms once the socket + room list are ready.
  useEffect(() => {
    if (!socket) return
    rooms.forEach((r) => socket.emit('join_room', { roomId: r.id }))
  }, [socket, rooms])

  // ── Conversation selection ─────────────────────────────────────────────
  const openConversation = useCallback(
    async (type, id) => {
      setActive({ type, id })
      setTyping([])
      setMessages([])
      setLoadingMessages(true)
      const key = type === 'room' ? roomKey(id) : dmKey(id)
      setUnread((prev) => ({ ...prev, [key]: 0 }))
      if (type === 'dm') addDm(id)
      try {
        const path = type === 'room' ? `/api/messages/room/${id}` : `/api/messages/dm/${id}`
        const data = await api(path)
        setMessages(data.map(normalize))
      } catch {
        setMessages([])
      } finally {
        setLoadingMessages(false)
      }
    },
    [normalize, addDm]
  )

  const selectRoom = useCallback((id) => openConversation('room', id), [openConversation])
  const selectDM = useCallback((id) => openConversation('dm', id), [openConversation])

  const loadOlder = useCallback(async () => {
    const cur = activeRef.current
    if (!cur || messages.length === 0) return 0
    const before = messages[0].id
    const base = cur.type === 'room' ? `/api/messages/room/${cur.id}` : `/api/messages/dm/${cur.id}`
    const data = await api(`${base}?before=${before}&limit=30`)
    if (!data.length) return 0
    const older = data.map(normalize)
    setMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id))
      return [...older.filter((m) => !ids.has(m.id)), ...prev]
    })
    return older.length
  }, [messages, normalize])

  // ── Actions ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (plaintext, type = 'text') => {
      const cur = activeRef.current
      if (!cur || !socket || !plaintext.trim()) return
      const content = encryptMessage(plaintext.trim())
      if (cur.type === 'room') socket.emit('send_message', { roomId: cur.id, content, type })
      else socket.emit('send_message', { recipientId: cur.id, content, type })
    },
    [socket]
  )

  const editMessage = useCallback(
    (messageId, plaintext) =>
      socket?.emit('edit_message', { messageId, newContent: encryptMessage(plaintext.trim()) }),
    [socket]
  )
  const deleteMessage = useCallback((messageId) => socket?.emit('delete_message', { messageId }), [socket])
  const reactMessage = useCallback(
    (messageId, emoji) => socket?.emit('react_message', { messageId, emoji }),
    [socket]
  )

  const target = useCallback(() => {
    const cur = activeRef.current
    if (!cur) return {}
    return cur.type === 'room' ? { roomId: cur.id } : { recipientId: cur.id }
  }, [])
  const startTyping = useCallback(() => socket?.emit('typing_start', target()), [socket, target])
  const stopTyping = useCallback(() => socket?.emit('typing_stop', target()), [socket, target])

  // ── Room management ────────────────────────────────────────────────────
  const refreshRooms = useCallback(async () => {
    const all = await api('/api/rooms')
    setAllRooms(all)
    setRooms(all.filter((r) => r.joined))
    return all
  }, [])

  const createRoom = useCallback(
    async (name, description) => {
      const room = await api('/api/rooms', { method: 'POST', body: { name, description } })
      await refreshRooms()
      socket?.emit('join_room', { roomId: room.id })
      selectRoom(room.id)
      return room
    },
    [refreshRooms, socket, selectRoom]
  )

  const joinRoom = useCallback(
    async (id) => {
      await api(`/api/rooms/${id}/join`, { method: 'POST' })
      await refreshRooms()
      socket?.emit('join_room', { roomId: id })
      selectRoom(id)
    },
    [refreshRooms, socket, selectRoom]
  )

  const leaveRoom = useCallback(
    async (id) => {
      await api(`/api/rooms/${id}/leave`, { method: 'POST' })
      socket?.emit('leave_room', { roomId: id })
      if (activeRef.current?.type === 'room' && activeRef.current.id === id) setActive(null)
      await refreshRooms()
    },
    [refreshRooms, socket]
  )

  const isOnline = useCallback((id) => onlineIds.has(id), [onlineIds])

  const value = {
    rooms,
    allRooms,
    users,
    usersById,
    onlineIds,
    isOnline,
    dmIds,
    active,
    messages,
    loadingMessages,
    typing,
    unread,
    selectRoom,
    selectDM,
    loadOlder,
    sendMessage,
    editMessage,
    deleteMessage,
    reactMessage,
    startTyping,
    stopTyping,
    refreshRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    addDm,
  }
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => useContext(ChatContext)
