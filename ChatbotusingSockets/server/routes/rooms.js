const express = require('express')
const db = require('../db/database')
const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()
const clean = (s) => String(s ?? '').replace(/<[^>]*>/g, '').trim()

const memberCount = (roomId) =>
  db.prepare('SELECT COUNT(*) AS n FROM room_members WHERE room_id = ?').get(roomId).n

const decorate = (room, userId) => ({
  ...room,
  memberCount: memberCount(room.id),
  joined: !!db
    .prepare('SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?')
    .get(room.id, userId),
})

// GET /api/rooms — list all public rooms
router.get('/', authMiddleware, (req, res) => {
  const rooms = db.prepare('SELECT * FROM rooms WHERE is_private = 0 ORDER BY name').all()
  res.json(rooms.map((r) => decorate(r, req.user.id)))
})

// POST /api/rooms — create a room
router.post('/', authMiddleware, (req, res) => {
  const name = clean(req.body.name).replace(/^#/, '').toLowerCase()
  const description = clean(req.body.description)
  const isPrivate = req.body.isPrivate ? 1 : 0

  if (name.length < 2) return res.status(400).json({ error: 'Room name too short.' })
  const exists = db.prepare('SELECT id FROM rooms WHERE name = ?').get(name)
  if (exists) return res.status(409).json({ error: 'A room with that name already exists.' })

  const info = db
    .prepare('INSERT INTO rooms (name, description, created_by, is_private) VALUES (?, ?, ?, ?)')
    .run(name, description, req.user.id, isPrivate)
  db.prepare('INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)').run(
    info.lastInsertRowid,
    req.user.id
  )
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(decorate(room, req.user.id))
})

// GET /api/rooms/:id — details + members
router.get('/:id', authMiddleware, (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id)
  if (!room) return res.status(404).json({ error: 'Room not found.' })
  const members = db
    .prepare(
      `SELECT u.id, u.username, u.avatar, u.last_seen AS lastSeen
       FROM room_members m JOIN users u ON u.id = m.user_id
       WHERE m.room_id = ?`
    )
    .all(room.id)
  res.json({ ...decorate(room, req.user.id), members })
})

// POST /api/rooms/:id/join
router.post('/:id/join', authMiddleware, (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id)
  if (!room) return res.status(404).json({ error: 'Room not found.' })
  db.prepare('INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)').run(
    room.id,
    req.user.id
  )
  res.json(decorate(room, req.user.id))
})

// POST /api/rooms/:id/leave
router.post('/:id/leave', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM room_members WHERE room_id = ? AND user_id = ?').run(
    req.params.id,
    req.user.id
  )
  res.json({ ok: true })
})

module.exports = router
