const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../db/database')
const { authMiddleware, signToken } = require('../middleware/authMiddleware')
const rateLimiter = require('../middleware/rateLimiter')

const router = express.Router()

// Max 10 attempts per 15 min on the credential routes.
const authLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 })

const clean = (s) => String(s ?? '').replace(/<[^>]*>/g, '').trim()
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const publicUser = (u) => ({
  id: u.id,
  username: u.username,
  email: u.email,
  avatar: u.avatar,
  createdAt: u.created_at,
})

// POST /api/auth/register
router.post('/register', authLimiter, (req, res) => {
  let { username, email, password, avatar } = req.body
  username = clean(username)
  email = clean(email).toLowerCase()
  avatar = clean(avatar) || '#6366f1'

  if (username.length < 2) return res.status(400).json({ error: 'Username too short.' })
  if (!emailRe.test(email)) return res.status(400).json({ error: 'Invalid email.' })
  if (!password || password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' })

  const exists = db
    .prepare('SELECT id FROM users WHERE email = ? OR username = ?')
    .get(email, username)
  if (exists) return res.status(409).json({ error: 'Username or email already taken.' })

  const hash = bcrypt.hashSync(password, 12)
  const info = db
    .prepare('INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)')
    .run(username, email, hash, avatar)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)

  // Auto-join every public room so new users land somewhere.
  const rooms = db.prepare('SELECT id FROM rooms WHERE is_private = 0').all()
  const join = db.prepare('INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)')
  rooms.forEach((r) => join.run(r.id, user.id))

  const token = signToken({ id: user.id, username: user.username })
  res.status(201).json({ token, user: publicUser(user) })
})

// POST /api/auth/login
router.post('/login', authLimiter, (req, res) => {
  const email = clean(req.body.email).toLowerCase()
  const { password, remember } = req.body

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !bcrypt.compareSync(password || '', user.password))
    return res.status(401).json({ error: 'Invalid email or password.' })

  db.prepare("UPDATE users SET last_seen = datetime('now') WHERE id = ?").run(user.id)
  const token = signToken({ id: user.id, username: user.username }, !!remember)
  res.json({ token, user: publicUser(user) })
})

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  res.json({ user: publicUser(user) })
})

// POST /api/auth/logout (token is cleared client-side; this just acks)
router.post('/logout', (req, res) => res.json({ ok: true }))

module.exports = router
