import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mockApiPlugin from './server/server.js'

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  server: {
    port: 5173,
    open: true
  }
})