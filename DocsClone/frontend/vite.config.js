import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, both /api (REST) and /socket.io (websockets) proxy to the Flask
// server on :5002, so the browser only ever talks to one origin. This is what
// makes it work in Codespaces / forwarded ports too.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    host: true,
    proxy: {
      "/api": "http://localhost:5002",
      "/socket.io": {
        target: "http://localhost:5002",
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
