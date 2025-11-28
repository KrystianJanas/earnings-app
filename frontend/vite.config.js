import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: false,
    open: false,
    cors: true,
    allowedHosts: 'all',
    hmr: {
      host: '0.0.0.0',
      port: 5000,
      protocol: 'ws'
    },
    https: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    },
  },
  // Resolve issues with dependencies
  resolve: {
    alias: {
      // Ensure proper module resolution
    }
  },
  // Build optimizations
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
  // Development optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'styled-components', 'framer-motion'],
    force: true // Force re-optimization on restart
  },
  // Clear cache on start to avoid stale issues
  clearScreen: false
})