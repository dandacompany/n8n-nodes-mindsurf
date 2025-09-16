#!/usr/bin/env node

/**
 * Script to install Playwright browsers for n8n-nodes-mindsurf
 * Run this after npm install to ensure browsers are available
 */

const { execSync } = require('child_process');
const { homedir } = require('os');
const { join } = require('path');
const { mkdirSync, existsSync } = require('fs');

// Set the installation path
const installationPath = join(homedir(), '.n8n', 'mindsurf-browsers');

// Ensure directory exists
if (!existsSync(installationPath)) {
  mkdirSync(installationPath, { recursive: true });
}

console.log('=================================');
console.log('Mindsurf Browser Installation');
console.log('=================================');
console.log(`Installing browsers to: ${installationPath}`);
console.log('');

// Set environment variable
process.env.PLAYWRIGHT_BROWSERS_PATH = installationPath;

const browsers = ['chromium', 'firefox', 'webkit'];

for (const browser of browsers) {
  console.log(`📦 Installing ${browser}...`);
  
  try {
    execSync(`npx playwright install ${browser}`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH: installationPath,
      },
    });
    console.log(`✅ ${browser} installed successfully\n`);
  } catch (error) {
    console.error(`❌ Failed to install ${browser}`);
    console.error(`   Error: ${error.message}`);
    console.error(`   You may need to install it manually with:`);
    console.error(`   PLAYWRIGHT_BROWSERS_PATH="${installationPath}" npx playwright install ${browser}\n`);
  }
}

// Install system dependencies on Linux
if (process.platform === 'linux') {
  console.log('📦 Installing system dependencies...');
  console.log('   Note: This may require sudo privileges\n');
  
  try {
    execSync(`npx playwright install-deps`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH: installationPath,
      },
    });
    console.log('✅ System dependencies installed successfully\n');
  } catch (error) {
    console.warn('⚠️  Could not install system dependencies automatically');
    console.warn('   You may need to run manually:');
    console.warn('   sudo npx playwright install-deps\n');
  }
}

console.log('=================================');
console.log('✨ Browser installation complete!');
console.log('=================================');
console.log('');
console.log('Next steps:');
console.log('1. Build the node: npm run build');
console.log('2. Link to n8n: npm link');
console.log('3. In ~/.n8n/custom: npm link n8n-nodes-mindsurf');
console.log('4. Restart n8n');
console.log('');