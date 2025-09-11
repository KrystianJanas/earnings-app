# macOS Vite Black Screen Troubleshooting Guide

This guide addresses the common black screen issue that occurs when running Vite projects locally on macOS systems.

## 🔧 Quick Fix Options

### Option 1: Use the default configuration (Recommended)
```bash
npm run dev
```

### Option 2: If Option 1 doesn't work, try specific host configurations
```bash
# Try IPv4 explicitly
npm run dev:host

# Try localhost explicitly  
npm run dev:local

# Try network access
npm run dev:network

# Clear cache and force rebuild
npm run dev:clear

# Debug mode with verbose logging
npm run dev:debug
```

## 🔍 Root Causes & Solutions

### 1. **Docker Container Browser Auto-Open Error (New Fix)**
- **Problem**: `Error: spawn xdg-open ENOENT` when running in Docker containers
- **Cause**: Vite tries to open browser inside container which has no GUI
- **Solution**: Auto-detect Docker environment and disable `open: true`
- **Fixed in**: `vite.config.js` - automatically detects Docker and adjusts settings

### 2. **DNS Resolution Issues (Most Common)**
- **Problem**: Node.js under v17 reorders DNS-resolved addresses, causing localhost to resolve differently
- **Solution**: Use explicit IPv4 address `127.0.0.1` instead of `localhost`
- **Fixed in**: `vite.config.js` - set `host: '127.0.0.1'`

### 3. **Chrome HTTPS Redirection**
- **Problem**: Chrome automatically redirects `http://localhost` to `https://localhost`
- **Solutions**:
  - Use Chrome Incognito mode
  - Use `http://127.0.0.1:3100` instead of `http://localhost:3100`
  - Disable "Always use secure connections" in Chrome settings

### 4. **Browser Extensions Interference**
- **Problem**: Ad-blockers (especially uBlock Origin) prevent Vite client requests
- **Solutions**:
  - Disable browser extensions temporarily
  - Use Incognito/Private browsing mode
  - Whitelist localhost in your ad-blocker

### 5. **Port Conflicts**
- **Problem**: Another process is using port 3100
- **Solutions**:
  - Check what's using the port: `lsof -nPi :3100`
  - Kill the process: `kill -9 <PID>`
  - Use `strictPort: false` in config to auto-find available port

### 6. **Cached Dependencies Issues**
- **Problem**: Stale Vite cache or optimized dependencies
- **Solutions**:
  - Clear Vite cache: `rm -rf node_modules/.vite`
  - Force re-optimization: `npm run dev:clear`
  - Delete and reinstall: `rm -rf node_modules package-lock.json && npm install`

## 🚨 Emergency Troubleshooting

If nothing above works, try these steps in order:

### Step 1: Network Diagnosis
```bash
# Check if port is available
lsof -nPi :3100

# Check DNS resolution
nslookup localhost
ping 127.0.0.1
```

### Step 2: Clean Restart
```bash
# Clean all caches and restart
rm -rf node_modules/.vite
rm -rf dist
npm run dev:clear
```

### Step 3: Browser Testing
1. Try different browsers (Safari, Firefox, Chrome Incognito)
2. Disable all extensions
3. Clear browser cache
4. Try `http://127.0.0.1:3100` directly

### Step 4: Alternative Configurations

Create `vite.config.local.js` for testing:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 3000, // Different port
    open: '/index.html', // Explicit path
    strictPort: true,
    cors: true,
    force: true // Always rebuild
  }
})
```

Then run: `vite --config vite.config.local.js`

## 🔧 Configuration Explanations

### Current `vite.config.js` Settings:
- `host: '127.0.0.1'` - Uses explicit IPv4 to avoid DNS issues
- `strictPort: false` - Allows fallback to different port
- `open: true` - Automatically opens browser
- `hmr.host: '127.0.0.1'` - Hot Module Replacement on correct host
- `hmr.port: 3101` - Separate port for HMR to avoid conflicts
- `optimizeDeps.force: true` - Forces dependency re-optimization
- `clearScreen: false` - Keeps console logs visible for debugging

## 🌐 Network Access

### Local Development Only:
```bash
npm run dev        # Uses 127.0.0.1 (recommended)
npm run dev:host   # Explicit IPv4
npm run dev:local  # Uses localhost
```

### Network Access (for mobile testing):
```bash
npm run dev:network  # Allows network access via 0.0.0.0
```

Then access via your Mac's IP address: `http://[YOUR_IP]:3100`

## 📱 Docker Development

The Docker configuration uses `HOST: 0.0.0.0` to work inside containers while the local development uses `127.0.0.1` for macOS compatibility.

## 🆘 Still Having Issues?

1. **Check the browser console** for any JavaScript errors
2. **Check the terminal** for Vite server errors
3. **Try a different port**: Edit `vite.config.js` and change port to 3000, 3002, etc.
4. **Check firewall settings**: Ensure localhost connections are allowed
5. **Update dependencies**: Run `npm update` to get latest versions

## 📋 System Information Helper

Run this to gather system info for debugging:
```bash
echo "=== System Information ==="
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo "OS: $(uname -a)"
echo "Network interfaces:"
ifconfig | grep inet
echo "Ports in use:"
lsof -nPi | grep :310
```

This comprehensive guide should resolve the vast majority of Vite black screen issues on macOS systems.