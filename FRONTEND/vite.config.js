import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['lucide-react', 'react-router-dom', 'react', 'react-dom']
  },
  server: {
    port: 5173,
    host: true
  }
})
