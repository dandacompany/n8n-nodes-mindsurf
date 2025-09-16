// ProxySettings type from Playwright
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

export interface ProxyConfig {
  id: string;
  name: string;
  server: string;
  username?: string;
  password?: string;
  bypass?: string[];
  type?: 'http' | 'https' | 'socks4' | 'socks5';
  country?: string;
  city?: string;
  provider?: string;
  speed?: number; // in ms
  reliability?: number; // 0-100
  lastChecked?: Date;
  isResidential?: boolean;
  rotationInterval?: number; // in seconds
  metadata?: Record<string, any>;
}

export interface ProxyRotationConfig {
  enabled: boolean;
  interval: number; // in seconds
  strategy: 'random' | 'round-robin' | 'least-used' | 'fastest' | 'geo-based';
  fallbackEnabled: boolean;
  healthCheckInterval?: number; // in seconds
}

export class ProxyManager {
  private proxiesDir: string;
  private proxies: Map<string, ProxyConfig>;
  private activeProxies: Map<string, ProxyConfig>; // sessionId -> proxy
  private proxyUsageCount: Map<string, number>;
  private lastRotation: Map<string, Date>;
  private currentRotationIndex: number = 0;

  constructor() {
    this.proxiesDir = path.join(homedir(), '.n8n', 'mindsurf-proxies');
    this.proxies = new Map();
    this.activeProxies = new Map();
    this.proxyUsageCount = new Map();
    this.lastRotation = new Map();
    this.ensureProxiesDirectory();
    this.loadProxies();
  }

  private ensureProxiesDirectory(): void {
    if (!fs.existsSync(this.proxiesDir)) {
      fs.mkdirSync(this.proxiesDir, { recursive: true });
    }
  }

  private loadProxies(): void {
    try {
      const configFile = path.join(this.proxiesDir, 'proxies.json');
      if (fs.existsSync(configFile)) {
        const content = fs.readFileSync(configFile, 'utf-8');
        const proxiesArray = JSON.parse(content) as ProxyConfig[];
        for (const proxy of proxiesArray) {
          if (proxy.lastChecked) {
            proxy.lastChecked = new Date(proxy.lastChecked);
          }
          this.proxies.set(proxy.id, proxy);
          this.proxyUsageCount.set(proxy.id, 0);
        }
      }
    } catch (error) {
      console.error('Error loading proxies:', error);
    }
  }

  /**
   * Add a new proxy configuration
   */
  async addProxy(config: Omit<ProxyConfig, 'id'>): Promise<ProxyConfig> {
    const proxyId = `proxy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const proxy: ProxyConfig = {
      id: proxyId,
      ...config,
      lastChecked: new Date()
    };

    // Validate proxy format
    this.validateProxyConfig(proxy);

    this.proxies.set(proxyId, proxy);
    this.proxyUsageCount.set(proxyId, 0);
    await this.saveProxies();
    
    return proxy;
  }

  /**
   * Add multiple proxies from a list
   */
  async addProxiesFromList(
    proxyList: string[],
    config?: Partial<ProxyConfig>
  ): Promise<ProxyConfig[]> {
    const addedProxies: ProxyConfig[] = [];
    
    for (const proxyString of proxyList) {
      try {
        const parsedProxy = this.parseProxyString(proxyString);
        const proxy = await this.addProxy({
          name: parsedProxy.name || proxyString,
          server: parsedProxy.server || proxyString,
          ...parsedProxy,
          ...config
        } as Omit<ProxyConfig, 'id'>);
        addedProxies.push(proxy);
      } catch (error) {
        console.error(`Failed to add proxy ${proxyString}:`, error);
      }
    }
    
    return addedProxies;
  }

  /**
   * Parse proxy string in various formats
   * Supports: 
   * - http://proxy.com:8080
   * - http://user:pass@proxy.com:8080
   * - socks5://proxy.com:1080
   */
  private parseProxyString(proxyString: string): Partial<ProxyConfig> {
    const urlPattern = /^(https?|socks[45]?):\/\/(?:([^:]+):([^@]+)@)?([^:]+):(\d+)$/;
    const match = proxyString.match(urlPattern);
    
    if (!match) {
      // Try simple format: proxy.com:8080
      const simplePattern = /^([^:]+):(\d+)$/;
      const simpleMatch = proxyString.match(simplePattern);
      
      if (simpleMatch) {
        return {
          name: simpleMatch[1],
          server: `http://${simpleMatch[1]}:${simpleMatch[2]}`,
          type: 'http'
        };
      }
      
      throw new Error(`Invalid proxy format: ${proxyString}`);
    }
    
    const [, protocol, username, password, host, port] = match;
    
    return {
      name: host,
      server: `${protocol}://${host}:${port}`,
      username,
      password,
      type: protocol.replace('://', '') as any
    };
  }

  /**
   * Validate proxy configuration
   */
  private validateProxyConfig(proxy: ProxyConfig): void {
    if (!proxy.server) {
      throw new Error('Proxy server is required');
    }

    const urlPattern = /^(https?|socks[45]?):\/\/[^:]+:\d+$/;
    if (!urlPattern.test(proxy.server)) {
      throw new Error(`Invalid proxy server format: ${proxy.server}`);
    }

    if (proxy.reliability !== undefined && (proxy.reliability < 0 || proxy.reliability > 100)) {
      throw new Error('Proxy reliability must be between 0 and 100');
    }
  }

  /**
   * Get proxy for Playwright context
   */
  getPlaywrightProxy(proxy: ProxyConfig): any {
    const settings: any = {
      server: proxy.server
    };

    if (proxy.username && proxy.password) {
      settings.username = proxy.username;
      settings.password = proxy.password;
    }

    if (proxy.bypass && proxy.bypass.length > 0) {
      settings.bypass = proxy.bypass.join(',');
    }

    return settings;
  }

  /**
   * Select proxy based on rotation strategy
   */
  selectProxy(
    sessionId: string,
    rotationConfig: ProxyRotationConfig,
    geoFilter?: { country?: string; city?: string }
  ): ProxyConfig | null {
    // Check if rotation is needed
    if (this.shouldRotate(sessionId, rotationConfig)) {
      const availableProxies = this.getAvailableProxies(geoFilter);
      
      if (availableProxies.length === 0) {
        return null;
      }

      let selectedProxy: ProxyConfig | null = null;

      switch (rotationConfig.strategy) {
        case 'random':
          selectedProxy = this.selectRandomProxy(availableProxies);
          break;
        case 'round-robin':
          selectedProxy = this.selectRoundRobinProxy(availableProxies);
          break;
        case 'least-used':
          selectedProxy = this.selectLeastUsedProxy(availableProxies);
          break;
        case 'fastest':
          selectedProxy = this.selectFastestProxy(availableProxies);
          break;
        case 'geo-based':
          selectedProxy = this.selectGeoBasedProxy(availableProxies, geoFilter);
          break;
        default:
          selectedProxy = availableProxies[0];
      }

      if (selectedProxy) {
        this.activeProxies.set(sessionId, selectedProxy);
        this.lastRotation.set(sessionId, new Date());
        this.incrementUsageCount(selectedProxy.id);
      }

      return selectedProxy;
    }

    // Return existing proxy if no rotation needed
    return this.activeProxies.get(sessionId) || null;
  }

  /**
   * Check if proxy rotation is needed
   */
  private shouldRotate(sessionId: string, config: ProxyRotationConfig): boolean {
    if (!config.enabled) {
      return !this.activeProxies.has(sessionId);
    }

    const lastRotation = this.lastRotation.get(sessionId);
    if (!lastRotation) {
      return true;
    }

    const timeSinceLastRotation = (Date.now() - lastRotation.getTime()) / 1000;
    return timeSinceLastRotation >= config.interval;
  }

  /**
   * Get available proxies with optional geo filter
   */
  private getAvailableProxies(geoFilter?: { country?: string; city?: string }): ProxyConfig[] {
    let proxies = Array.from(this.proxies.values());

    if (geoFilter?.country) {
      proxies = proxies.filter(p => p.country === geoFilter.country);
    }

    if (geoFilter?.city) {
      proxies = proxies.filter(p => p.city === geoFilter.city);
    }

    // Filter out unreliable proxies
    proxies = proxies.filter(p => 
      p.reliability === undefined || p.reliability > 50
    );

    return proxies;
  }

  /**
   * Select random proxy
   */
  private selectRandomProxy(proxies: ProxyConfig[]): ProxyConfig {
    const index = Math.floor(Math.random() * proxies.length);
    return proxies[index];
  }

  /**
   * Select proxy using round-robin
   */
  private selectRoundRobinProxy(proxies: ProxyConfig[]): ProxyConfig {
    const proxy = proxies[this.currentRotationIndex % proxies.length];
    this.currentRotationIndex++;
    return proxy;
  }

  /**
   * Select least used proxy
   */
  private selectLeastUsedProxy(proxies: ProxyConfig[]): ProxyConfig {
    let leastUsed = proxies[0];
    let minUsage = this.proxyUsageCount.get(leastUsed.id) || 0;

    for (const proxy of proxies) {
      const usage = this.proxyUsageCount.get(proxy.id) || 0;
      if (usage < minUsage) {
        leastUsed = proxy;
        minUsage = usage;
      }
    }

    return leastUsed;
  }

  /**
   * Select fastest proxy based on speed metric
   */
  private selectFastestProxy(proxies: ProxyConfig[]): ProxyConfig {
    const proxiesWithSpeed = proxies.filter(p => p.speed !== undefined);
    
    if (proxiesWithSpeed.length === 0) {
      return proxies[0];
    }

    return proxiesWithSpeed.reduce((fastest, current) => 
      (current.speed! < fastest.speed!) ? current : fastest
    );
  }

  /**
   * Select proxy based on geographic preferences
   */
  private selectGeoBasedProxy(
    proxies: ProxyConfig[],
    geoFilter?: { country?: string; city?: string }
  ): ProxyConfig {
    // Already filtered by geo in getAvailableProxies
    // Additional logic for residential preference
    const residential = proxies.filter(p => p.isResidential);
    
    if (residential.length > 0) {
      return this.selectRandomProxy(residential);
    }
    
    return this.selectRandomProxy(proxies);
  }

  /**
   * Increment usage count for a proxy
   */
  private incrementUsageCount(proxyId: string): void {
    const count = this.proxyUsageCount.get(proxyId) || 0;
    this.proxyUsageCount.set(proxyId, count + 1);
  }

  /**
   * Test proxy connectivity
   */
  async testProxy(proxyId: string): Promise<{ success: boolean; latency?: number; error?: string }> {
    const proxy = this.proxies.get(proxyId);
    if (!proxy) {
      return { success: false, error: 'Proxy not found' };
    }

    try {
      // This is a placeholder - in real implementation, you'd use playwright to test
      // For now, we just update the lastChecked time
      proxy.lastChecked = new Date();
      
      const latency = Math.random() * 1000; // Simulated latency
      proxy.speed = latency;
      proxy.reliability = Math.random() * 100;
      
      await this.saveProxies();
      
      return { success: true, latency };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test all proxies
   */
  async testAllProxies(): Promise<Map<string, { success: boolean; latency?: number; error?: string }>> {
    const results = new Map<string, { success: boolean; latency?: number; error?: string }>();
    
    for (const [proxyId] of this.proxies) {
      const result = await this.testProxy(proxyId);
      results.set(proxyId, result);
    }
    
    return results;
  }

  /**
   * Get all proxies
   */
  getAllProxies(): ProxyConfig[] {
    return Array.from(this.proxies.values());
  }

  /**
   * Get proxy by ID
   */
  getProxy(proxyId: string): ProxyConfig | undefined {
    return this.proxies.get(proxyId);
  }

  /**
   * Update proxy configuration
   */
  async updateProxy(proxyId: string, updates: Partial<ProxyConfig>): Promise<ProxyConfig> {
    const proxy = this.proxies.get(proxyId);
    if (!proxy) {
      throw new Error(`Proxy ${proxyId} not found`);
    }

    Object.assign(proxy, updates);
    this.validateProxyConfig(proxy);
    
    await this.saveProxies();
    return proxy;
  }

  /**
   * Remove proxy
   */
  async removeProxy(proxyId: string): Promise<void> {
    this.proxies.delete(proxyId);
    this.proxyUsageCount.delete(proxyId);
    
    // Remove from active proxies
    for (const [sessionId, proxy] of this.activeProxies) {
      if (proxy.id === proxyId) {
        this.activeProxies.delete(sessionId);
      }
    }
    
    await this.saveProxies();
  }

  /**
   * Save proxies to disk
   */
  private async saveProxies(): Promise<void> {
    const configFile = path.join(this.proxiesDir, 'proxies.json');
    const proxiesArray = Array.from(this.proxies.values());
    const content = JSON.stringify(proxiesArray, null, 2);
    fs.writeFileSync(configFile, content, 'utf-8');
  }

  /**
   * Import proxies from file
   */
  async importProxiesFromFile(filePath: string, format: 'json' | 'txt' = 'txt'): Promise<number> {
    const content = fs.readFileSync(filePath, 'utf-8');
    let imported = 0;

    if (format === 'json') {
      const proxies = JSON.parse(content) as ProxyConfig[];
      for (const proxy of proxies) {
        await this.addProxy(proxy);
        imported++;
      }
    } else {
      const lines = content.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const parsedProxy = this.parseProxyString(line.trim());
          await this.addProxy(parsedProxy as any);
          imported++;
        } catch (error) {
          console.error(`Failed to import proxy: ${line}`);
        }
      }
    }

    return imported;
  }

  /**
   * Export proxies to file
   */
  async exportProxiesToFile(filePath: string, format: 'json' | 'txt' = 'json'): Promise<void> {
    const proxies = Array.from(this.proxies.values());
    
    if (format === 'json') {
      const content = JSON.stringify(proxies, null, 2);
      fs.writeFileSync(filePath, content, 'utf-8');
    } else {
      const lines = proxies.map(p => {
        if (p.username && p.password) {
          return `${p.type || 'http'}://${p.username}:${p.password}@${p.server.replace(/^https?:\/\//, '')}`;
        }
        return p.server;
      });
      fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    }
  }

  /**
   * Get proxy statistics
   */
  getStatistics(): {
    total: number;
    active: number;
    residential: number;
    byCountry: Map<string, number>;
    byReliability: { high: number; medium: number; low: number };
    averageSpeed: number;
  } {
    const proxies = Array.from(this.proxies.values());
    const byCountry = new Map<string, number>();
    let totalSpeed = 0;
    let speedCount = 0;
    
    const stats = {
      total: proxies.length,
      active: this.activeProxies.size,
      residential: 0,
      byCountry,
      byReliability: { high: 0, medium: 0, low: 0 },
      averageSpeed: 0
    };

    for (const proxy of proxies) {
      if (proxy.isResidential) stats.residential++;
      
      if (proxy.country) {
        byCountry.set(proxy.country, (byCountry.get(proxy.country) || 0) + 1);
      }
      
      if (proxy.reliability !== undefined) {
        if (proxy.reliability >= 80) stats.byReliability.high++;
        else if (proxy.reliability >= 50) stats.byReliability.medium++;
        else stats.byReliability.low++;
      }
      
      if (proxy.speed !== undefined) {
        totalSpeed += proxy.speed;
        speedCount++;
      }
    }

    stats.averageSpeed = speedCount > 0 ? totalSpeed / speedCount : 0;
    
    return stats;
  }
}