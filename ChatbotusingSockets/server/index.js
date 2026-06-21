require('dotenv').config()
const http = require('http')
const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')

const { initSocket } = require('./socket/socketHandler')
const authRoutes = require('./routes/auth')
const roomRoutes = require('./routes/rooms')
const messageRoutes = require('./routes/messages')
const userRoutes = require('./routes/users')

const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// Allow the configured client, any localhost port, and forwarded dev hosts
// (GitHub Codespaces / Gitpod) so the app works in-browser without manual setup.
function isAllowedOrigin(origin) {
  if (!origin) return true // same-origin / non-browser requests
  if (origin === CLIENT_URL) return true
  try {
    const { hostname } = new URL(origin)
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true
    if (/\.app\.github\.dev$/.test(hostname)) return true // Codespaces
    if (/\.githubpreview\.dev$/.test(hostname)) return true
    if (/\.gitpod\.io$/.test(hostname)) return true
  } catch {
    return false
  }
  return false
}
const corsOptions = {
  origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
  credentials: true,
}

const app = express()
app.use(cors(corsOptions))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }))
app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/users', userRoutes)

// Fallback error handler.
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error.' })
})

const server = http.createServer(app)
const io = new Server(server, {
  cors: { ...corsOptions, methods: ['GET', 'POST'] },
})
initSocket(io)

server.listen(PORT, () => {
  console.log(`\n🔒 Lumina Chat server running on http://localhost:${PORT}`)
  console.log(`   Accepting client origin: ${CLIENT_URL}\n`)
})
