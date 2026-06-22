import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' so the built site works from any subdirectory.
export default defineConfig({
  base: './',
  plugins: [react()],
})
