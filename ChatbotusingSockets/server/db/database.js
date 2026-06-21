/**
 * SQLite connection, schema initialisation, and first-run seeding.
 * Uses better-sqlite3 (synchronous, fast, zero-config).
 */
const path = require('path')
const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const { encrypt } = require('../socket/encryption')

const db = new Database(path.join(__dirname, 'chat.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      username    TEXT UNIQUE NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      avatar      TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen   DATETIME
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT UNIQUE NOT NULL,
      description TEXT,
      created_by  INTEGER REFERENCES users(id),
      is_private  INTEGER DEFAULT 0,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS room_members (
      room_id   INTEGER REFERENCES rooms(id),
      user_id   INTEGER REFERENCES users(id),
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (room_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id      INTEGER REFERENCES rooms(id),
      sender_id    INTEGER REFERENCES users(id),
      recipient_id INTEGER REFERENCES users(id),
      content      TEXT NOT NULL,
      message_type TEXT DEFAULT 'text',
      is_read      INTEGER DEFAULT 0,
      edited       INTEGER DEFAULT 0,
      deleted      INTEGER DEFAULT 0,
      reactions    TEXT DEFAULT '{}',
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      edited_at    DATETIME
    );

    CREATE TABLE IF NOT EXISTS direct_conversations (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user1_id   INTEGER REFERENCES users(id),
      user2_id   INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_dm ON messages(sender_id, recipient_id, created_at);
  `)
}

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n
  if (userCount > 0) return // already seeded

  const insertUser = db.prepare(
    'INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)'
  )
  const hash = bcrypt.hashSync('demo1234', 12)
  const seedUsers = [
    ['Alice Chen', 'alice@demo.com', '#6366f1'],
    ['Bob Martinez', 'bob@demo.com', '#06b6d4'],
    ['Sara Kim', 'sara@demo.com', '#ec4899'],
  ]
  const userIds = seedUsers.map(([username, email, avatar]) =>
    Number(insertUser.run(username, email, hash, avatar).lastInsertRowid)
  )

  const insertRoom = db.prepare(
    'INSERT INTO rooms (name, description, created_by, is_private) VALUES (?, ?, ?, 0)'
  )
  const seedRooms = [
    ['general', 'General discussion for everyone'],
    ['tech-talk', 'Programming, tools, and tech news'],
    ['random', 'Anything goes'],
  ]
  const roomIds = seedRooms.map(([name, desc]) =>
    Number(insertRoom.run(name, desc, userIds[0]).lastInsertRowid)
  )

  // Every seed user joins every seed room.
  const joinRoom = db.prepare(
    'INSERT OR IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)'
  )
  roomIds.forEach((rid) => userIds.forEach((uid) => joinRoom.run(rid, uid)))

  // 10 encrypted dummy messages in #general so it isn't empty on first load.
  const insertMsg = db.prepare(
    `INSERT INTO messages (room_id, sender_id, content, message_type, created_at)
     VALUES (?, ?, ?, 'text', datetime('now', ?))`
  )
  const conversation = [
    [0, 'Hey everyone! Welcome to Lumina Chat 👋'],
    [1, 'This place looks amazing — love the dark theme.'],
    [2, 'Wait, every message is AES-256 encrypted? 🔒'],
    [0, 'Yep! Encrypted before it ever leaves your browser.'],
    [1, 'Even the database only stores ciphertext. Nice.'],
    [2, 'So if someone steals chat.db they get… gibberish?'],
    [0, 'Exactly. Zero plaintext, anywhere.'],
    [1, 'Okay this is officially cooler than our work Slack.'],
    [2, 'Real-time too — Bob, are you typing right now?'],
    [1, 'Always 😎'],
  ]
  conversation.forEach(([senderIdx, text], i) => {
    const minutesAgo = `-${(conversation.length - i) * 3} minutes`
    insertMsg.run(roomIds[0], userIds[senderIdx], encrypt(text), minutesAgo)
  })

  console.log('✓ Seeded 3 users, 3 rooms, and 10 encrypted messages.')
  console.log('  Demo login → alice@demo.com / demo1234')
}

initSchema()
seed()

module.exports = db
