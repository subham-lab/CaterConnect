import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // 🔥 better than true for external access
    port: 5173, // 🔥 explicitly define (avoids mismatch)
    strictPort: true, // 🔥 ensures same port always
    allowedHosts: true, // 🔥 allow all hosts (fixes your error)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})