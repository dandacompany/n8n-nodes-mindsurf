import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir, platform } from 'os';
import { chromium, firefox, webkit } from 'playwright';

interface SystemInfo {
  platform: string;
  arch: string;
  distro?: string;
  libc?: string;
}

export class BrowserInstaller {
  private static instance: BrowserInstaller;
  private installationPath: string;
  private isInstalling: boolean = false;
  private installPromise: Promise<void> | null = null;
  private systemInfo: SystemInfo;

  private constructor() {
    // Set custom path for browser binaries
    this.installationPath = join(homedir(), '.n8n', 'mindsurf-browsers');
    
    // Ensure directory exists
    if (!existsSync(this.installationPath)) {
      mkdirSync(this.installationPath, { recursive: true });
    }

    // Set environment variable for Playwright
    process.env.PLAYWRIGHT_BROWSERS_PATH = this.installationPath;
    
    // Detect system information
    this.systemInfo = this.detectSystemInfo();
  }
  
  private detectSystemInfo(): SystemInfo {
    const info: SystemInfo = {
      platform: platform(),
      arch: process.arch,
    };
    
    // Detect Linux distribution
    if (info.platform === 'linux') {
      try {
        // Check for Alpine Linux
        if (existsSync('/etc/alpine-release')) {
          info.distro = 'alpine';
          info.libc = 'musl';
        } else if (existsSync('/etc/os-release')) {
          const osRelease = require('fs').readFileSync('/etc/os-release', 'utf8');
          if (osRelease.includes('Alpine')) {
            info.distro = 'alpine';
            info.libc = 'musl';
          } else if (osRelease.includes('Ubuntu')) {
            info.distro = 'ubuntu';
            info.libc = 'glibc';
          } else if (osRelease.includes('Debian')) {
            info.distro = 'debian';
            info.libc = 'glibc';
          } else {
            info.distro = 'unknown';
            info.libc = 'glibc';
          }
        }
      } catch (error) {
        console.log('Mindsurf: Could not detect Linux distribution');
      }
    }
    
    return info;
  }

  static getInstance(): BrowserInstaller {
    if (!BrowserInstaller.instance) {
      BrowserInstaller.instance = new BrowserInstaller();
    }
    return BrowserInstaller.instance;
  }

  async ensureBrowsersInstalled(): Promise<void> {
    // If already installing, wait for that to complete
    if (this.isInstalling && this.installPromise) {
      return this.installPromise;
    }

    // Check if browsers are already installed
    const browsersInstalled = await this.checkBrowsersInstalled();
    if (browsersInstalled) {
      console.log('Mindsurf: Browsers already installed');
      return;
    }

    // Start installation
    this.isInstalling = true;
    console.log('Mindsurf: Installing browser binaries...');
    
    this.installPromise = this.installBrowsers();
    
    try {
      await this.installPromise;
      console.log('Mindsurf: Browser installation completed');
    } catch (error) {
      console.error('Mindsurf: Failed to install browsers:', error);
      throw error;
    } finally {
      this.isInstalling = false;
      this.installPromise = null;
    }
  }

  private async checkBrowsersInstalled(): Promise<boolean> {
    try {
      // Set the environment variable before checking
      process.env.PLAYWRIGHT_BROWSERS_PATH = this.installationPath;
      
      // Try to get executable paths for each browser
      const browsers = [
        { name: 'chromium', launcher: chromium },
        { name: 'firefox', launcher: firefox },
        { name: 'webkit', launcher: webkit },
      ];

      for (const browser of browsers) {
        try {
          const executablePath = browser.launcher.executablePath();
          if (!executablePath || !existsSync(executablePath)) {
            console.log(`Mindsurf: ${browser.name} not found at ${executablePath}`);
            return false;
          }
        } catch (error) {
          console.log(`Mindsurf: ${browser.name} not installed`);
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  private async installBrowsers(): Promise<void> {
    const { execSync } = require('child_process');
    const path = require('path');
    
    try {
      // Find the playwright module path
      const nodeModulesPath = path.join(__dirname, '..', '..', '..', 'node_modules');
      
      // Install only the browsers we need
      const browsers = ['chromium', 'firefox', 'webkit'];
      
      for (const browser of browsers) {
        console.log(`Mindsurf: Installing ${browser}...`);
        
        // Use the local playwright CLI to install browsers
        const command = `cd "${nodeModulesPath}" && PLAYWRIGHT_BROWSERS_PATH="${this.installationPath}" npx playwright install ${browser}`;
        
        try {
          execSync(command, {
            stdio: 'inherit',
            shell: true,
            env: {
              ...process.env,
              PLAYWRIGHT_BROWSERS_PATH: this.installationPath,
            },
          });
          
          console.log(`Mindsurf: ${browser} installed successfully`);
        } catch (installError) {
          console.error(`Mindsurf: Failed to install ${browser}, trying alternative method...`);
          
          // Alternative: Try using the playwright package directly
          try {
            const altCommand = `node -e "require('playwright').${browser}._install()"`;
            execSync(altCommand, {
              stdio: 'inherit',
              cwd: nodeModulesPath,
              env: {
                ...process.env,
                PLAYWRIGHT_BROWSERS_PATH: this.installationPath,
              },
            });
            console.log(`Mindsurf: ${browser} installed successfully (alternative method)`);
          } catch (altError) {
            console.error(`Mindsurf: Could not install ${browser}. Please install manually.`);
          }
        }
      }

      // Install system dependencies if needed (macOS usually doesn't need this)
      if (process.platform === 'linux') {
        try {
          console.log('Mindsurf: Installing system dependencies...');
          const depsCommand = `cd "${nodeModulesPath}" && PLAYWRIGHT_BROWSERS_PATH="${this.installationPath}" npx playwright install-deps`;
          execSync(depsCommand, {
            stdio: 'inherit',
            shell: true,
            env: {
              ...process.env,
              PLAYWRIGHT_BROWSERS_PATH: this.installationPath,
            },
          });
        } catch (error) {
          // System dependencies might require sudo, so we'll just warn
          console.warn('Mindsurf: Could not install system dependencies. Some features might not work.');
          console.warn('Mindsurf: You may need to run: npx playwright install-deps');
        }
      }
    } catch (error) {
      throw new Error(`Failed to install browsers: ${error.message}`);
    }
  }

  getInstallationPath(): string {
    return this.installationPath;
  }

  private async findSystemBrowser(browserType: string): Promise<string | undefined> {
    const candidatePaths: string[] = [];
    
    // Check environment variables first
    if (browserType === 'chromium') {
      const envPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
      if (envPath && existsSync(envPath)) {
        console.log(`Mindsurf: Using Chromium from environment variable: ${envPath}`);
        return envPath;
      }
    } else if (browserType === 'firefox') {
      const envPath = process.env.PLAYWRIGHT_FIREFOX_EXECUTABLE_PATH;
      if (envPath && existsSync(envPath)) {
        console.log(`Mindsurf: Using Firefox from environment variable: ${envPath}`);
        return envPath;
      }
    }
    
    // Platform-specific system browser paths
    if (this.systemInfo.platform === 'win32') {
      if (browserType === 'chromium') {
        candidatePaths.push(
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files\\Chromium\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Chromium\\Application\\chrome.exe'
        );
      } else if (browserType === 'firefox') {
        candidatePaths.push(
          'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
          'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe'
        );
      }
    } else if (this.systemInfo.platform === 'darwin') {
      if (browserType === 'chromium') {
        candidatePaths.push(
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Chromium.app/Contents/MacOS/Chromium'
        );
      } else if (browserType === 'firefox') {
        candidatePaths.push(
          '/Applications/Firefox.app/Contents/MacOS/firefox',
          '/Applications/Firefox Nightly.app/Contents/MacOS/firefox'
        );
      } else if (browserType === 'webkit') {
        candidatePaths.push(
          '/Applications/Safari.app/Contents/MacOS/Safari'
        );
      }
    } else if (this.systemInfo.platform === 'linux') {
      if (browserType === 'chromium') {
        // Alpine-specific paths
        if (this.systemInfo.distro === 'alpine' || this.systemInfo.libc === 'musl') {
          candidatePaths.push(
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
            '/usr/lib/chromium/chromium',
            '/usr/lib/chromium-browser/chromium-browser'
          );
        } else {
          // Standard Linux paths
          candidatePaths.push(
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome-beta',
            '/usr/bin/google-chrome-unstable',
            '/snap/bin/chromium',
            '/var/lib/flatpak/app/org.chromium.Chromium/current/active/export/bin/org.chromium.Chromium'
          );
        }
      } else if (browserType === 'firefox') {
        candidatePaths.push(
          '/usr/bin/firefox',
          '/usr/bin/firefox-esr',
          '/snap/bin/firefox',
          '/var/lib/flatpak/app/org.mozilla.firefox/current/active/export/bin/org.mozilla.firefox'
        );
      }
    }
    
    // Check each candidate path
    for (const path of candidatePaths) {
      if (existsSync(path)) {
        console.log(`Mindsurf: Found system ${browserType} at ${path}`);
        return path;
      }
    }
    
    return undefined;
  }
  
  async getBrowserExecutablePath(browserType: string): Promise<string | undefined> {
    try {
      // First, try to find system browser
      const systemBrowser = await this.findSystemBrowser(browserType);
      if (systemBrowser) {
        return systemBrowser;
      }
      
      // If system browser not found and we're on Alpine Linux, 
      // don't try Playwright browsers as they won't work
      if (this.systemInfo.distro === 'alpine' || this.systemInfo.libc === 'musl') {
        console.error(`Mindsurf: No system ${browserType} found on Alpine Linux`);
        console.error('Mindsurf: Please install chromium with: apk add --no-cache chromium chromium-chromedriver');
        return undefined;
      }
      
      // Set environment variable to ensure correct path
      process.env.PLAYWRIGHT_BROWSERS_PATH = this.installationPath;
      
      // Try Playwright-installed browsers
      const fs = require('fs');
      const path = require('path');
      
      // Find the latest version directory for the browser
      const browserDirs = fs.readdirSync(this.installationPath)
        .filter((dir: string) => dir.startsWith(browserType));
      
      if (browserDirs.length === 0) {
        throw new Error(`No ${browserType} installation found`);
      }
      
      // Sort to get the latest version (highest number)
      browserDirs.sort((a: string, b: string) => {
        const versionA = parseInt(a.split('-').pop() || '0');
        const versionB = parseInt(b.split('-').pop() || '0');
        return versionB - versionA;
      });
      
      const browserDir = browserDirs[0];
      let executablePath: string;
      
      switch (browserType) {
        case 'chromium':
          if (process.platform === 'darwin') {
            executablePath = path.join(this.installationPath, browserDir, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium');
          } else if (process.platform === 'win32') {
            executablePath = path.join(this.installationPath, browserDir, 'chrome-win', 'chrome.exe');
          } else {
            executablePath = path.join(this.installationPath, browserDir, 'chrome-linux', 'chrome');
          }
          break;
          
        case 'firefox':
          if (process.platform === 'darwin') {
            // Check for Nightly.app first (newer versions), then Firefox.app (older versions)
            const nightlyPath = path.join(this.installationPath, browserDir, 'firefox', 'Nightly.app', 'Contents', 'MacOS', 'firefox');
            const firefoxPath = path.join(this.installationPath, browserDir, 'firefox', 'Firefox.app', 'Contents', 'MacOS', 'firefox');
            
            if (fs.existsSync(nightlyPath)) {
              executablePath = nightlyPath;
            } else if (fs.existsSync(firefoxPath)) {
              executablePath = firefoxPath;
            } else {
              // Fallback to expected path
              executablePath = nightlyPath;
            }
          } else if (process.platform === 'win32') {
            executablePath = path.join(this.installationPath, browserDir, 'firefox', 'firefox.exe');
          } else {
            executablePath = path.join(this.installationPath, browserDir, 'firefox', 'firefox');
          }
          break;
          
        case 'webkit':
          if (process.platform === 'darwin') {
            executablePath = path.join(this.installationPath, browserDir, 'Playwright.app', 'Contents', 'MacOS', 'Playwright');
          } else if (process.platform === 'win32') {
            executablePath = path.join(this.installationPath, browserDir, 'Playwright.exe');
          } else {
            // WebKit is not supported on Linux by Playwright
            throw new Error('WebKit is not supported on Linux');
          }
          break;
          
        default:
          throw new Error(`Unknown browser type: ${browserType}`);
      }
      
      if (!fs.existsSync(executablePath)) {
        console.error(`Mindsurf: Executable not found at ${executablePath}`);
        // Fallback to Playwright's default method
        switch (browserType) {
          case 'chromium':
            return chromium.executablePath();
          case 'firefox':
            return firefox.executablePath();
          case 'webkit':
            return webkit.executablePath();
          default:
            return chromium.executablePath();
        }
      }
      
      console.log(`Mindsurf: Found ${browserType} at ${executablePath}`);
      return executablePath;
      
    } catch (error) {
      console.error(`Mindsurf: Failed to get executable path for ${browserType}:`, error);
      
      // Fallback to Playwright's default method
      try {
        switch (browserType) {
          case 'chromium':
            return chromium.executablePath();
          case 'firefox':
            return firefox.executablePath();
          case 'webkit':
            return webkit.executablePath();
          default:
            return chromium.executablePath();
        }
      } catch (fallbackError) {
        console.error(`Mindsurf: Fallback also failed:`, fallbackError);
        return undefined;
      }
    }
  }
}