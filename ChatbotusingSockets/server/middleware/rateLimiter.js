/**
 * Tiny in-memory rate limiter (no external deps).
 * Defaults: max 10 requests per 15 minutes, keyed by IP.
 */
function rateLimiter({ windowMs = 15 * 60 * 1000, max = 10 } = {}) {
  const hits = new Map() // ip -> { count, resetAt }

  return function (req, res, next) {
    const now = Date.now()
    const ip = req.ip || req.connection?.remoteAddress || 'unknown'
    const entry = hits.get(ip)

    if (!entry || now > entry.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + windowMs })
      return next()
    }

    entry.count += 1
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      res.set('Retry-After', String(retryAfter))
      return res.status(429).json({
        error: `Too many attempts. Try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
      })
    }
    next()
  }
}

module.exports = rateLimiter
