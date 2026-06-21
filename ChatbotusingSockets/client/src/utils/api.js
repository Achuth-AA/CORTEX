/** Thin fetch wrapper that injects the JWT and parses JSON / errors. */
// Empty by default → requests are relative to the current origin and go through
// the Vite dev proxy (see vite.config.js). This is what makes the app work in
// GitHub Codespaces / any port-forward without a hardcoded backend host. Set
// VITE_API_URL only when pointing at a separately-hosted backend in production.
const API_URL = import.meta.env.VITE_API_URL || ''

export const getToken = () => localStorage.getItem('chat_token')
export const setToken = (t) => localStorage.setItem('chat_token', t)
export const clearToken = () => localStorage.removeItem('chat_token')

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export { API_URL }
