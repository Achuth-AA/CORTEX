import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The backend the dev server proxies to (defaults to the local Express server).
const API_TARGET = process.env.VITE_PROXY_TARGET || 'http://localhost:5000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // bind 0.0.0.0 so GitHub Codespaces can forward the port
    // Proxy API + WebSocket traffic to the backend. The browser only ever talks
    // to this origin, so it works the same locally and behind a Codespaces /
    // any-host port-forward — no CORS, no hardcoded backend URL.
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
      '/socket.io': { target: API_TARGET, changeOrigin: true, ws: true },
    },
  },
})
