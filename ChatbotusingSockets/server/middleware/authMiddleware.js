const jwt = require('jsonwebtoken')
require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret'

/**
 * Express middleware — verifies the Bearer JWT and attaches req.user.
 */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Authentication required.' })

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

/** Verify a raw token (used by the socket handshake). Returns payload or null. */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

function signToken(payload, remember = false) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: remember ? '30d' : '7d' })
}

module.exports = { authMiddleware, verifyToken, signToken, JWT_SECRET }
