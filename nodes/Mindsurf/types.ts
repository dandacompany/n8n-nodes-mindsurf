export interface BrowserOptions {
  headless?: boolean;
  slowMo?: number;
  timeout?: number;
  viewport?: {
    width: number;
    height: number;
  };
  userAgent?: string;
  locale?: string;
  timezone?: string;
  permissions?: string | string[];
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  colorScheme?: 'light' | 'dark' | 'no-preference';
  reducedMotion?: 'reduce' | 'no-preference';
  forcedColors?: 'active' | 'none';
  extraHTTPHeaders?: Record<string, string>;
  offline?: boolean;
  httpCredentials?: {
    username: string;
    password: string;
  };
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
  ignoreHTTPSErrors?: boolean;
  javaScriptEnabled?: boolean;
  bypassCSP?: boolean;
  userDataDir?: string;
  downloadsPath?: string;
  proxy?: {
    server: string;
    bypass?: string;
    username?: string;
    password?: string;
  };
  // Advanced features
  profileId?: string;
  proxyRotation?: {
    enabled: boolean;
    interval: number;
    strategy: 'random' | 'round-robin' | 'least-used' | 'fastest' | 'geo-based';
    fallbackEnabled: boolean;
    healthCheckInterval?: number;
  };
  proxyGeoFilter?: {
    country?: string;
    city?: string;
  };
  enableAI?: boolean;
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  path?: string;
  type?: 'png' | 'jpeg';
  quality?: number;
  omitBackground?: boolean;
  animations?: 'disabled' | 'allow';
  caret?: 'hide' | 'initial';
  scale?: 'css' | 'device';
  mask?: string[];
  maskColor?: string;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PDFOptions {
  path?: string;
  scale?: number;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  printBackground?: boolean;
  landscape?: boolean;
  pageRanges?: string;
  format?: string;
  width?: string | number;
  height?: string | number;
  margin?: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };
  preferCSSPageSize?: boolean;
  outline?: boolean;
  tagged?: boolean;
}

export interface NetworkOptions {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  postData?: string | Buffer;
  failOnStatusCode?: boolean;
  ignoreHTTPSErrors?: boolean;
  timeout?: number;
}

export interface WaitOptions {
  state?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
  timeout?: number;
}

export interface ClickOptions {
  button?: 'left' | 'right' | 'middle';
  clickCount?: number;
  delay?: number;
  position?: { x: number; y: number };
  modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>;
  force?: boolean;
  noWaitAfter?: boolean;
  trial?: boolean;
  timeout?: number;
}

export interface TypeOptions {
  delay?: number;
  noWaitAfter?: boolean;
  timeout?: number;
}

export interface SelectOptions {
  value?: string | string[];
  index?: number | number[];
  label?: string | string[];
  force?: boolean;
  noWaitAfter?: boolean;
  timeout?: number;
}

export interface FileOptions {
  name?: string;
  mimeType?: string;
  buffer?: Buffer;
  path?: string;
}

export interface EvaluateOptions {
  expression: string;
  arg?: any;
  isFunction?: boolean;
}

export interface DialogOptions {
  accept?: boolean;
  promptText?: string;
}

export interface CookieOptions {
  name?: string;
  value?: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface StorageOptions {
  origin?: string;
}

export interface AccessibilityOptions {
  interestingOnly?: boolean;
  root?: string;
}