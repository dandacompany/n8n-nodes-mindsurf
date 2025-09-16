import { chromium, firefox, webkit, Browser, BrowserContext, BrowserType } from 'playwright';
import { BrowserOptions } from './types';
import { BrowserInstaller } from './BrowserInstaller';
import { SessionProfileManager } from './profiles/SessionProfileManager';
import { ProxyManager } from './proxy/ProxyManager';
import { NaturalLanguageProcessor } from './ai/NaturalLanguageProcessor';

export class BrowserManager {
  private static instance: BrowserManager;
  private browsers: Map<string, Browser> = new Map();
  private contexts: Map<string, BrowserContext> = new Map();
  private installer: BrowserInstaller;
  private profileManager: SessionProfileManager;
  private proxyManager: ProxyManager;
  private nlProcessor: NaturalLanguageProcessor;

  private constructor() {
    this.installer = BrowserInstaller.getInstance();
    this.profileManager = new SessionProfileManager();
    this.proxyManager = new ProxyManager();
    this.nlProcessor = new NaturalLanguageProcessor();
  }

  static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  getProfileManager(): SessionProfileManager {
    return this.profileManager;
  }

  getProxyManager(): ProxyManager {
    return this.proxyManager;
  }

  getNLProcessor(): NaturalLanguageProcessor {
    return this.nlProcessor;
  }

  async getOrCreateContext(
    sessionId: string,
    browserType: string,
    options: BrowserOptions = {}
  ): Promise<BrowserContext> {
    // Check if context already exists
    if (this.contexts.has(sessionId)) {
      return this.contexts.get(sessionId)!;
    }

    // Handle profile loading if profileId is provided
    let profileOptions: any = {};
    if (options.profileId) {
      const profile = await this.profileManager.loadProfile(options.profileId);
      if (profile) {
        profileOptions = this.profileManager.getProfileContextOptions(profile);
      }
    }

    // Handle proxy rotation if enabled
    let proxyOptions: any = {};
    if (options.proxyRotation && options.proxyRotation.enabled) {
      const selectedProxy = this.proxyManager.selectProxy(
        sessionId,
        options.proxyRotation,
        options.proxyGeoFilter
      );
      if (selectedProxy) {
        proxyOptions.proxy = this.proxyManager.getPlaywrightProxy(selectedProxy);
      }
    }

    // Get or create browser
    const browser = await this.getOrCreateBrowser(browserType, options);

    // Merge all context options (profile > proxy > user options)
    const contextOptions: any = {
      ...profileOptions,
      ...proxyOptions,
      viewport: options.viewport || profileOptions.viewport || { width: 1280, height: 720 },
      userAgent: options.userAgent || profileOptions.userAgent,
      locale: options.locale || profileOptions.locale,
      timezoneId: options.timezone || profileOptions.timezoneId,
      geolocation: options.geolocation || profileOptions.geolocation,
      permissions: options.permissions || profileOptions.permissions,
      colorScheme: options.colorScheme,
      reducedMotion: options.reducedMotion,
      forcedColors: options.forcedColors,
      extraHTTPHeaders: { ...profileOptions.extraHTTPHeaders, ...options.extraHTTPHeaders },
      offline: options.offline,
      httpCredentials: options.httpCredentials,
      deviceScaleFactor: options.deviceScaleFactor,
      isMobile: options.isMobile,
      hasTouch: options.hasTouch,
      ignoreHTTPSErrors: options.ignoreHTTPSErrors,
      javaScriptEnabled: options.javaScriptEnabled,
      bypassCSP: options.bypassCSP,
      userDataDir: options.userDataDir,
      proxy: proxyOptions.proxy || options.proxy || profileOptions.proxy,
    };

    // Remove undefined values
    Object.keys(contextOptions).forEach(key => {
      if (contextOptions[key] === undefined || contextOptions[key] === '') {
        delete contextOptions[key];
      }
    });

    // Handle viewport
    if (options.viewport) {
      contextOptions.viewport = {
        width: options.viewport.width || 1280,
        height: options.viewport.height || 720,
      };
    }

    // Handle permissions array
    if (options.permissions && typeof options.permissions === 'string') {
      contextOptions.permissions = options.permissions.split(',').map((p: string) => p.trim());
    } else if (Array.isArray(options.permissions)) {
      contextOptions.permissions = options.permissions;
    }

    // Handle geolocation
    if (options.geolocation && typeof options.geolocation === 'string') {
      try {
        contextOptions.geolocation = JSON.parse(options.geolocation);
      } catch {
        delete contextOptions.geolocation;
      }
    }

    // Handle extra HTTP headers
    if (options.extraHTTPHeaders && typeof options.extraHTTPHeaders === 'string') {
      try {
        contextOptions.extraHTTPHeaders = JSON.parse(options.extraHTTPHeaders);
      } catch {
        delete contextOptions.extraHTTPHeaders;
      }
    }

    // Handle HTTP credentials
    if (options.httpCredentials && typeof options.httpCredentials === 'string') {
      try {
        contextOptions.httpCredentials = JSON.parse(options.httpCredentials);
      } catch {
        delete contextOptions.httpCredentials;
      }
    }

    // Handle proxy
    if (options.proxy && typeof options.proxy === 'string') {
      try {
        contextOptions.proxy = JSON.parse(options.proxy);
      } catch {
        delete contextOptions.proxy;
      }
    }

    // Create new context
    const context = await browser.newContext(contextOptions);
    
    // Set default timeout
    if (options.timeout) {
      context.setDefaultTimeout(options.timeout);
    }

    // Store context
    this.contexts.set(sessionId, context);

    return context;
  }

  private async getOrCreateBrowser(
    browserType: string,
    options: BrowserOptions = {}
  ): Promise<Browser> {
    // Ensure browsers are installed before trying to launch
    await this.installer.ensureBrowsersInstalled();
    
    const browserId = `${browserType}_${options.headless !== false ? 'headless' : 'headed'}`;

    if (this.browsers.has(browserId)) {
      const browser = this.browsers.get(browserId)!;
      if (browser.isConnected()) {
        return browser;
      }
      // Browser disconnected, remove from map
      this.browsers.delete(browserId);
    }

    // Set the PLAYWRIGHT_BROWSERS_PATH environment variable before launching
    process.env.PLAYWRIGHT_BROWSERS_PATH = this.installer.getInstallationPath();

    // Get the specific executable path for this browser
    const executablePath = await this.installer.getBrowserExecutablePath(browserType);

    // Launch new browser with explicit executable path
    const launchOptions: any = {
      headless: options.headless !== false,
      slowMo: options.slowMo || 0,
      downloadsPath: options.downloadsPath,
      executablePath: executablePath, // Use explicit path to avoid conflicts
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-extensions',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      ],
    };
    
    // Add Alpine/Docker-specific args
    if (process.platform === 'linux') {
      const fs = require('fs');
      const isAlpine = fs.existsSync('/etc/alpine-release');
      const isDocker = fs.existsSync('/.dockerenv');
      
      if (isAlpine || isDocker) {
        // Remove --single-process as it causes crashes on some sites
        // Add more stable options for Alpine/Docker
        launchOptions.args.push(
          '--disable-software-rasterizer',
          '--disable-web-security', // May be needed for some sites
          '--disable-features=VizDisplayCompositor,IsolateOrigins,site-per-process',
          '--disable-site-isolation-trials',
          '--no-zygote' // Keep this for Alpine
        );
        
        // Use larger /dev/shm if available
        if (fs.existsSync('/dev/shm')) {
          launchOptions.args.push('--shm-size=256m');
        }
      }
    }

    // Handle proxy at browser level if needed
    if (options.proxy && typeof options.proxy === 'object') {
      launchOptions.proxy = options.proxy;
    }

    let browserTypeObj: BrowserType;
    switch (browserType) {
      case 'firefox':
        browserTypeObj = firefox;
        break;
      case 'webkit':
        browserTypeObj = webkit;
        break;
      case 'chromium':
      default:
        browserTypeObj = chromium;
        break;
    }

    const browser = await browserTypeObj.launch(launchOptions);
    this.browsers.set(browserId, browser);

    return browser;
  }

  async closeContext(sessionId: string): Promise<void> {
    const context = this.contexts.get(sessionId);
    if (context) {
      await context.close();
      this.contexts.delete(sessionId);
    }
  }

  async closeAllContexts(): Promise<void> {
    for (const [, context] of this.contexts) {
      await context.close();
    }
    this.contexts.clear();
  }

  async closeAllBrowsers(): Promise<void> {
    for (const [, browser] of this.browsers) {
      if (browser.isConnected()) {
        await browser.close();
      }
    }
    this.browsers.clear();
    this.contexts.clear();
  }

  async cleanup(): Promise<void> {
    await this.closeAllContexts();
    await this.closeAllBrowsers();
  }

  getActiveSessions(): string[] {
    return Array.from(this.contexts.keys());
  }

  getActiveBrowsers(): string[] {
    return Array.from(this.browsers.keys());
  }

  async getContext(sessionId: string): Promise<BrowserContext | undefined> {
    return this.contexts.get(sessionId);
  }

  hasContext(sessionId: string): boolean {
    return this.contexts.has(sessionId);
  }
}