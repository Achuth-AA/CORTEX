const express = require('express')
const db = require('../db/database')
const { authMiddleware } = require('../middleware/authMiddleware')
const { encrypt, decrypt } = require('../socket/encryption')

const router = express.Router()
const clean = (s) => String(s ?? '').replace(/<[^>]*>/g, '').trim()

// Shared row → DTO mapper. Content stays encrypted; the client decrypts it.
const mapMessage = (m) => ({
  id: m.id,
  roomId: m.room_id,
  senderId: m.sender_id,
  senderName: m.senderName,
  senderAvatar: m.senderAvatar,
  recipientId: m.recipient_id,
  content: m.content,
  type: m.message_type,
  isRead: !!m.is_read,
  edited: !!m.edited,
  deleted: !!m.deleted,
  reactions: safeJson(m.reactions),
  createdAt: m.created_at,
  editedAt: m.edited_at,
})

function safeJson(s) {
  try {
    return JSON.parse(s || '{}')
  } catch {
    return {}
  }
}

const SELECT = `
  SELECT msg.*, u.username AS senderName, u.avatar AS senderAvatar
  FROM messages msg JOIN users u ON u.id = msg.sender_id
`

// GET /api/messages/room/:roomId?before=<id>&limit=30
router.get('/room/:roomId', authMiddleware, (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100)
  const before = Number(req.query.before) || null

  const rows = db
    .prepare(
      `${SELECT} WHERE msg.room_id = ? AND msg.recipient_id IS NULL
       ${before ? 'AND msg.id < ?' : ''}
       ORDER BY msg.id DESC LIMIT ?`
    )
    .all(...(before ? [req.params.roomId, before, limit] : [req.params.roomId, limit]))

  res.json(rows.reverse().map(mapMessage))
})

// GET /api/messages/dm/:userId?before=<id>&limit=30
router.get('/dm/:userId', authMiddleware, (req, res) => {
  const me = req.user.id
  const other = Number(req.params.userId)
  const limit = Math.min(Number(req.query.limit) || 50, 100)
  const before = Number(req.query.before) || null

  const rows = db
    .prepare(
      `${SELECT}
       WHERE ((msg.sender_id = ? AND msg.recipient_id = ?)
           OR (msg.sender_id = ? AND msg.recipient_id = ?))
       ${before ? 'AND msg.id < ?' : ''}
       ORDER BY msg.id DESC LIMIT ?`
    )
    .all(...(before ? [me, other, other, me, before, limit] : [me, other, other, me, limit]))

  res.json(rows.reverse().map(mapMessage))
})

// PATCH /api/messages/:id — edit (owner only). Body: { content } (encrypted)
router.patch('/:id', authMiddleware, (req, res) => {
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id)
  if (!msg) return res.status(404).json({ error: 'Message not found.' })
  if (msg.sender_id !== req.user.id)
    return res.status(403).json({ error: 'You can only edit your own messages.' })

  // Decrypt → sanitize → re-encrypt so stored content is always ciphertext.
  const plaintext = clean(decrypt(req.body.content))
  if (!plaintext) return res.status(400).json({ error: 'Empty message.' })

  db.prepare(
    "UPDATE messages SET content = ?, edited = 1, edited_at = datetime('now') WHERE id = ?"
  ).run(encrypt(plaintext), msg.id)

  res.json({ id: msg.id, content: encrypt(plaintext), edited: true })
})

// DELETE /api/messages/:id — soft delete (owner only)
router.delete('/:id', authMiddleware, (req, res) => {
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id)
  if (!msg) return res.status(404).json({ error: 'Message not found.' })
  if (msg.sender_id !== req.user.id)
    return res.status(403).json({ error: 'You can only delete your own messages.' })

  db.prepare('UPDATE messages SET deleted = 1 WHERE id = ?').run(msg.id)
  res.json({ id: msg.id, deleted: true })
})

module.exports = router
