/**
 * Client-side AES-256 encryption (crypto-js).
 *
 * The plaintext is encrypted here, in the browser, before it is ever sent over
 * the socket — the server and database only ever see ciphertext. The shared
 * secret matches the server's ENCRYPTION_SECRET so either side can decrypt.
 */
import CryptoJS from 'crypto-js'

const SECRET =
  import.meta.env.VITE_ENCRYPTION_SECRET || 'fallback-insecure-development-secret'

export function encryptMessage(plaintext) {
  return CryptoJS.AES.encrypt(String(plaintext), SECRET).toString()
}

export function decryptMessage(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(String(ciphertext), SECRET)
    const text = bytes.toString(CryptoJS.enc.Utf8)
    return text || '🔒 (unable to decrypt)'
  } catch {
    return '🔒 (unable to decrypt)'
  }
}
