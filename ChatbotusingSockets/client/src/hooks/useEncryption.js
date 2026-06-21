// crypto-js AES helpers exposed as a hook for convenience.
import { encryptMessage, decryptMessage } from '../utils/encryption'

export function useEncryption() {
  return { encrypt: encryptMessage, decrypt: decryptMessage }
}

export default useEncryption
