import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    open: false,
    cors: true,
    allowedHosts: ['**', 'localhost', '127.0.0.1', '0.0.0.0', 'moje.studiopaulinka.pl', '.studiopaulinka.pl', '.picard.replit.dev'],
    https: false,
    proxy: {
      '/api': {
        target: 'http://backend:3001',
        changeOrigin: true,
        secure: false,
      }
    },
  },
  resolve: {
    alias: {
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'styled-components', 'framer-motion'],
    force: true
  },
  clearScreen: false
})