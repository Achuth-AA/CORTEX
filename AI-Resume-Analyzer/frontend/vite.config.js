import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During `npm run dev`, /api requests are proxied to the Flask server on :5000,
// so there are no CORS issues and you only hit one URL in the browser.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
  build: {
    outDir: "dist",
  },
});
