import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Detect if running in Docker container
const isDocker = process.env.DOCKER_ENV || process.env.HOST === '0.0.0.0' || 
                 require('fs').existsSync('/.dockerenv')

export default defineConfig({
  plugins: [react()],
  server: {
    // Host configuration - different for Docker vs local development
    host: isDocker ? '0.0.0.0' : '127.0.0.1',
    port: parseInt(process.env.FRONTEND_PORT) || 3000,
    strictPort: false, // Allow fallback to different port if occupied
    open: !isDocker, // Only auto-open browser when NOT in Docker
    cors: true,
    // Additional network fixes for macOS (only for local development)
    hmr: isDocker ? {
      // For Docker: use port only, let Docker handle host mapping
      port: parseInt(process.env.FRONTEND_PORT) + 1 || 3001,
    } : {
      // For local development: use explicit host
      host: '127.0.0.1',
      port: parseInt(process.env.FRONTEND_PORT) + 1 || 3001,
    },
    // Force HTTP to avoid HTTPS redirect issues in Chrome
    https: false,
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