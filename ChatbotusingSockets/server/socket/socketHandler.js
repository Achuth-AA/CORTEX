const db = require('../db/database')
const { verifyToken } = require('../middleware/authMiddleware')
const { encrypt, decrypt } = require('./encryption')

const clean = (s) => String(s ?? '').replace(/<[^>]*>/g, '').trim()
const safeJson = (s) => {
  try {
    return JSON.parse(s || '{}')
  } catch {
    return {}
  }
}

// userId -> Set of socket ids (a user may have several tabs open)
const online = new Map()

function addOnline(userId, socketId) {
  if (!online.has(userId)) online.set(userId, new Set())
  online.get(userId).add(socketId)
}
function removeOnline(userId, socketId) {
  const set = online.get(userId)
  if (!set) return false
  set.delete(socketId)
  if (set.size === 0) {
    online.delete(userId)
    return true // fully offline now
  }
  return false
}

const userRow = (id) =>
  db.prepare('SELECT id, username, avatar FROM users WHERE id = ?').get(id)

function buildMessageDTO(id) {
  const m = db
    .prepare(
      `SELECT msg.*, u.username AS senderName, u.avatar AS senderAvatar
       FROM messages msg JOIN users u ON u.id = msg.sender_id WHERE msg.id = ?`
    )
    .get(id)
  if (!m) return null
  return {
    id: m.id,
    roomId: m.room_id,
    senderId: m.sender_id,
    senderName: m.senderName,
    senderAvatar: m.senderAvatar,
    recipientId: m.recipient_id,
    content: m.content,
    type: m.message_type,
    edited: !!m.edited,
    deleted: !!m.deleted,
    reactions: safeJson(m.reactions),
    createdAt: m.created_at,
  }
}

function initSocket(io) {
  // ── Handshake authentication ──────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    const payload = token && verifyToken(token)
    if (!payload) return next(new Error('unauthorized'))
    socket.userId = payload.id
    socket.username = payload.username
    next()
  })

  io.on('connection', (socket) => {
    const uid = socket.userId
    const wasOffline = !online.has(uid)
    addOnline(uid, socket.id)
    socket.join(`user:${uid}`) // personal room for DM delivery

    // Tell the newcomer who's already online; tell everyone else about them.
    socket.emit('online_users', Array.from(online.keys()))
    if (wasOffline) io.emit('user_status', { userId: uid, status: 'online' })

    // ── Rooms ────────────────────────────────────────────────────────────
    socket.on('join_room', ({ roomId }) => {
      if (!roomId) return
      socket.join(`room:${roomId}`)
      io.to(`room:${roomId}`).emit('room_joined', {
        roomId,
        userId: uid,
        username: socket.username,
      })
    })

    socket.on('leave_room', ({ roomId }) => {
      if (!roomId) return
      socket.leave(`room:${roomId}`)
      io.to(`room:${roomId}`).emit('room_left', { roomId, userId: uid })
    })

    // ── Messaging ─────────────────────────────────────────────────────────
    socket.on('send_message', ({ roomId, recipientId, content, type = 'text' }) => {
      // Decrypt the incoming ciphertext, validate/sanitize, re-encrypt for storage.
      const plaintext = clean(decrypt(content))
      if (!plaintext) return socket.emit('error', { message: 'Message could not be decrypted.' })
      if (plaintext.length > 5000)
        return socket.emit('error', { message: 'Message too long.' })

      const stored = encrypt(plaintext)
      const info = db
        .prepare(
          `INSERT INTO messages (room_id, sender_id, recipient_id, content, message_type)
           VALUES (?, ?, ?, ?, ?)`
        )
        .run(roomId || null, uid, recipientId || null, stored, type)

      const dto = buildMessageDTO(info.lastInsertRowid)
      if (roomId) {
        io.to(`room:${roomId}`).emit('receive_message', dto)
      } else if (recipientId) {
        io.to(`user:${recipientId}`).emit('receive_message', dto)
        io.to(`user:${uid}`).emit('receive_message', dto)
      }
    })

    // ── Typing indicators (relayed; client auto-clears after 3s) ──────────
    socket.on('typing_start', ({ roomId, recipientId }) => {
      const payload = { userId: uid, username: socket.username, isTyping: true, roomId, recipientId }
      if (roomId) socket.to(`room:${roomId}`).emit('typing_indicator', payload)
      else if (recipientId) socket.to(`user:${recipientId}`).emit('typing_indicator', payload)
    })
    socket.on('typing_stop', ({ roomId, recipientId }) => {
      const payload = { userId: uid, username: socket.username, isTyping: false, roomId, recipientId }
      if (roomId) socket.to(`room:${roomId}`).emit('typing_indicator', payload)
      else if (recipientId) socket.to(`user:${recipientId}`).emit('typing_indicator', payload)
    })

    // ── Read receipts ─────────────────────────────────────────────────────
    socket.on('message_read', ({ messageId }) => {
      db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(messageId)
    })

    // ── Edit ──────────────────────────────────────────────────────────────
    socket.on('edit_message', ({ messageId, newContent }) => {
      const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId)
      if (!msg || msg.sender_id !== uid) return
      const plaintext = clean(decrypt(newContent))
      if (!plaintext) return
      const stored = encrypt(plaintext)
      db.prepare(
        "UPDATE messages SET content = ?, edited = 1, edited_at = datetime('now') WHERE id = ?"
      ).run(stored, messageId)
      broadcastForMessage(io, msg, 'message_updated', {
        messageId,
        newContent: stored,
        edited: true,
      })
    })

    // ── Delete (soft) ─────────────────────────────────────────────────────
    socket.on('delete_message', ({ messageId }) => {
      const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId)
      if (!msg || msg.sender_id !== uid) return
      db.prepare('UPDATE messages SET deleted = 1 WHERE id = ?').run(messageId)
      broadcastForMessage(io, msg, 'message_deleted', { messageId })
    })

    // ── Reactions ─────────────────────────────────────────────────────────
    socket.on('react_message', ({ messageId, emoji }) => {
      const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId)
      if (!msg) return
      const reactions = safeJson(msg.reactions)
      const list = new Set(reactions[emoji] || [])
      list.has(uid) ? list.delete(uid) : list.add(uid)
      if (list.size) reactions[emoji] = Array.from(list)
      else delete reactions[emoji]
      db.prepare('UPDATE messages SET reactions = ? WHERE id = ?').run(
        JSON.stringify(reactions),
        messageId
      )
      broadcastForMessage(io, msg, 'message_updated', { messageId, reactions })
    })

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const nowOffline = removeOnline(uid, socket.id)
      if (nowOffline) {
        db.prepare("UPDATE users SET last_seen = datetime('now') WHERE id = ?").run(uid)
        io.emit('user_status', { userId: uid, status: 'offline' })
      }
    })
  })
}

// Route a message-update event to the right room or DM pair.
function broadcastForMessage(io, msg, event, payload) {
  if (msg.room_id) io.to(`room:${msg.room_id}`).emit(event, payload)
  else if (msg.recipient_id) {
    io.to(`user:${msg.recipient_id}`).emit(event, payload)
    io.to(`user:${msg.sender_id}`).emit(event, payload)
  }
}

module.exports = { initSocket }
