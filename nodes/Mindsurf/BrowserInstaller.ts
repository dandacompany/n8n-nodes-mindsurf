import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { chromium, firefox, webkit } from 'playwright';

export class BrowserInstaller {
  private static instance: BrowserInstaller;
  private installationPath: string;
  private isInstalling: boolean = false;
  private installPromise: Promise<void> | null = null;

  private constructor() {
    // Set custom path for browser binaries
    this.installationPath = join(homedir(), '.n8n', 'mindsurf-browsers');
    
    // Ensure directory exists
    if (!existsSync(this.installationPath)) {
      mkdirSync(this.installationPath, { recursive: true });
    }

    // Set environment variable for Playwright
    process.env.PLAYWRIGHT_BROWSERS_PATH = this.installationPath;
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

  async getBrowserExecutablePath(browserType: string): Promise<string | undefined> {
    try {
      // Set environment variable to ensure correct path
      process.env.PLAYWRIGHT_BROWSERS_PATH = this.installationPath;
      
      // Manually construct the path based on the browser type and version
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