const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../db/database')
const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()
const clean = (s) => String(s ?? '').replace(/<[^>]*>/g, '').trim()
const publicUser = (u) => ({
  id: u.id,
  username: u.username,
  email: u.email,
  avatar: u.avatar,
  createdAt: u.created_at,
  lastSeen: u.last_seen,
})

// GET /api/users — list all users (for DM search)
router.get('/', authMiddleware, (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY username').all()
  res.json(users.map(publicUser))
})

// GET /api/users/:id — profile
router.get('/:id', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  res.json(publicUser(user))
})

// PATCH /api/users/profile — update display name / avatar color
router.patch('/profile', authMiddleware, (req, res) => {
  const username = clean(req.body.username)
  const avatar = clean(req.body.avatar)

  if (username && username.length >= 2) {
    const taken = db
      .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
      .get(username, req.user.id)
    if (taken) return res.status(409).json({ error: 'Username already taken.' })
    db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, req.user.id)
  }
  if (avatar) db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatar, req.user.id)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json(publicUser(user))
})

// PATCH /api/users/password — change password
router.patch('/password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!bcrypt.compareSync(currentPassword || '', user.password))
    return res.status(401).json({ error: 'Current password is incorrect.' })
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ error: 'New password must be at least 6 characters.' })

  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(
    bcrypt.hashSync(newPassword, 12),
    req.user.id
  )
  res.json({ ok: true })
})

// DELETE /api/users/me — delete account
router.delete('/me', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM room_members WHERE user_id = ?').run(req.user.id)
  db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id)
  res.json({ ok: true })
})

module.exports = router
