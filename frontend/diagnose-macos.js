#!/usr/bin/env node

/**
 * macOS Vite Diagnostic Tool
 * Helps identify common issues causing black screen problems
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 macOS Vite Diagnostic Tool');
console.log('================================\n');

// Helper function to safely execute commands
function safeExec(command, description) {
  try {
    console.log(`✅ ${description}`);
    const result = execSync(command, { encoding: 'utf8', timeout: 5000 });
    console.log(`   ${result.trim()}\n`);
    return result;
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}\n`);
    return null;
  }
}

// System Information
console.log('📋 SYSTEM INFORMATION');
console.log('----------------------');
safeExec('node --version', 'Node.js version');
safeExec('npm --version', 'npm version');
safeExec('uname -a', 'Operating system');

// Network Configuration
console.log('🌐 NETWORK CONFIGURATION');
console.log('-------------------------');
safeExec('ping -c 1 127.0.0.1', 'IPv4 localhost connectivity');
safeExec('ping -c 1 localhost', 'localhost DNS resolution');

// Port Availability
console.log('🔌 PORT AVAILABILITY');
console.log('--------------------');
safeExec('lsof -nPi :3100 | head -10', 'Process using port 3100');
safeExec('lsof -nPi :3101 | head -10', 'Process using port 3101 (HMR)');

// Project Configuration
console.log('⚙️  PROJECT CONFIGURATION');
console.log('--------------------------');

// Check if vite.config.js exists and show relevant parts
const configPath = path.join(__dirname, 'vite.config.js');
if (fs.existsSync(configPath)) {
  console.log('✅ vite.config.js exists');
  try {
    const config = fs.readFileSync(configPath, 'utf8');
    const serverMatch = config.match(/server:\s*{[\s\S]*?}/);
    if (serverMatch) {
      console.log('   Server configuration:');
      console.log(`   ${serverMatch[0]}\n`);
    }
  } catch (error) {
    console.log(`   Error reading config: ${error.message}\n`);
  }
} else {
  console.log('❌ vite.config.js not found\n');
}

// Check package.json scripts
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('✅ package.json exists');
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log('   Available scripts:');
    Object.entries(pkg.scripts || {}).forEach(([name, script]) => {
      if (name.startsWith('dev')) {
        console.log(`   - npm run ${name}: ${script}`);
      }
    });
    console.log('');
  } catch (error) {
    console.log(`   Error reading package.json: ${error.message}\n`);
  }
}

// Dependencies
console.log('📦 DEPENDENCIES');
console.log('---------------');
try {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const viteVersion = pkg.devDependencies?.vite || pkg.dependencies?.vite;
  const reactVersion = pkg.dependencies?.react;
  console.log(`✅ Vite version: ${viteVersion || 'not found'}`);
  console.log(`✅ React version: ${reactVersion || 'not found'}\n`);
} catch (error) {
  console.log(`❌ Error checking dependencies: ${error.message}\n`);
}

// Cache directories
console.log('🗂️  CACHE DIRECTORIES');
console.log('--------------------');
const cacheDir = path.join(__dirname, 'node_modules', '.vite');
if (fs.existsSync(cacheDir)) {
  console.log('⚠️  Vite cache directory exists (.vite)');
  console.log('   Consider clearing cache with: rm -rf node_modules/.vite\n');
} else {
  console.log('✅ No Vite cache directory found\n');
}

// Recommendations
console.log('💡 RECOMMENDATIONS');
console.log('------------------');
console.log('1. Try running: npm run dev');
console.log('2. If that fails, try: npm run dev:host');
console.log('3. If still failing, try: npm run dev:clear');
console.log('4. Use Chrome Incognito mode to bypass extensions');
console.log('5. Access via http://127.0.0.1:3100 instead of localhost');
console.log('6. Check browser console for JavaScript errors');
console.log('\n📖 For detailed troubleshooting, see MACOS_TROUBLESHOOTING.md');