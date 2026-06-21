/**
 * AES-256 encryption helpers (server side).
 *
 * We use crypto-js here so the ciphertext format is 100% compatible with the
 * crypto-js the React client uses. Both sides share the same ENCRYPTION_SECRET
 * (the client reads it as VITE_ENCRYPTION_SECRET). crypto-js's AES.encrypt
 * uses an OpenSSL-compatible scheme with a random salt+IV embedded in the
 * output, so re-encrypting the same plaintext yields a different ciphertext
 * every time — exactly what we want for stored messages.
 */
const CryptoJS = require('crypto-js')
require('dotenv').config()

const SECRET = process.env.ENCRYPTION_SECRET || 'fallback-insecure-development-secret'

function encrypt(plaintext) {
  return CryptoJS.AES.encrypt(String(plaintext), SECRET).toString()
}

function decrypt(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(String(ciphertext), SECRET)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch {
    return ''
  }
}

module.exports = { encrypt, decrypt }
