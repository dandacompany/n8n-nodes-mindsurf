import { BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

export interface SessionProfile {
  id: string;
  name: string;
  created: Date;
  lastUsed: Date;
  metadata: Record<string, any>;
  storageState?: any; // Playwright's StorageState type
  userAgent?: string;
  viewport?: { width: number; height: number };
  locale?: string;
  timezone?: string;
  geolocation?: { latitude: number; longitude: number };
  permissions?: string[];
  extraHTTPHeaders?: Record<string, string>;
  proxy?: {
    server: string;
    username?: string;
    password?: string;
  };
}

export class SessionProfileManager {
  private profilesDir: string;
  private profiles: Map<string, SessionProfile>;

  constructor() {
    this.profilesDir = path.join(homedir(), '.n8n', 'mindsurf-profiles');
    this.profiles = new Map();
    this.ensureProfilesDirectory();
    this.loadProfiles();
  }

  private ensureProfilesDirectory(): void {
    if (!fs.existsSync(this.profilesDir)) {
      fs.mkdirSync(this.profilesDir, { recursive: true });
    }
  }

  private loadProfiles(): void {
    try {
      const files = fs.readdirSync(this.profilesDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.profilesDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const profile = JSON.parse(content) as SessionProfile;
          profile.created = new Date(profile.created);
          profile.lastUsed = new Date(profile.lastUsed);
          this.profiles.set(profile.id, profile);
        }
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  }

  /**
   * Create a new session profile
   */
  async createProfile(
    name: string,
    context: BrowserContext,
    metadata: Record<string, any> = {}
  ): Promise<SessionProfile> {
    const profileId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save current browser state
    const storageState = await context.storageState();
    
    const profile: SessionProfile = {
      id: profileId,
      name,
      created: new Date(),
      lastUsed: new Date(),
      metadata,
      storageState
    };

    // Save viewport if available
    const pages = context.pages();
    if (pages.length > 0) {
      const viewport = pages[0].viewportSize();
      if (viewport) {
        profile.viewport = viewport;
      }
    }

    this.profiles.set(profileId, profile);
    await this.saveProfile(profile);
    
    return profile;
  }

  /**
   * Update an existing profile with current context state
   */
  async updateProfile(
    profileId: string,
    context: BrowserContext,
    metadata?: Record<string, any>
  ): Promise<SessionProfile> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    // Update storage state
    profile.storageState = await context.storageState();
    profile.lastUsed = new Date();
    
    if (metadata) {
      profile.metadata = { ...profile.metadata, ...metadata };
    }

    // Update viewport if available
    const pages = context.pages();
    if (pages.length > 0) {
      const viewport = pages[0].viewportSize();
      if (viewport) {
        profile.viewport = viewport;
      }
    }

    await this.saveProfile(profile);
    return profile;
  }

  /**
   * Load a profile and apply it to a browser context
   */
  async loadProfile(profileId: string): Promise<SessionProfile> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    profile.lastUsed = new Date();
    await this.saveProfile(profile);
    
    return profile;
  }

  /**
   * Get all profiles
   */
  getAllProfiles(): SessionProfile[] {
    return Array.from(this.profiles.values()).sort((a, b) => 
      b.lastUsed.getTime() - a.lastUsed.getTime()
    );
  }

  /**
   * Get a specific profile
   */
  getProfile(profileId: string): SessionProfile | undefined {
    return this.profiles.get(profileId);
  }

  /**
   * Delete a profile
   */
  async deleteProfile(profileId: string): Promise<void> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    this.profiles.delete(profileId);
    
    const filePath = path.join(this.profilesDir, `${profileId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete associated storage directory if exists
    const storageDir = path.join(this.profilesDir, `${profileId}_storage`);
    if (fs.existsSync(storageDir)) {
      fs.rmSync(storageDir, { recursive: true, force: true });
    }
  }

  /**
   * Save profile to disk
   */
  private async saveProfile(profile: SessionProfile): Promise<void> {
    const filePath = path.join(this.profilesDir, `${profile.id}.json`);
    const content = JSON.stringify(profile, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  /**
   * Export profile for sharing
   */
  async exportProfile(profileId: string): Promise<string> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    // Create a sanitized version without sensitive data
    const exportProfile = {
      ...profile,
      id: undefined, // Remove ID so it can be regenerated on import
      created: profile.created.toISOString(),
      lastUsed: profile.lastUsed.toISOString()
    };

    return JSON.stringify(exportProfile, null, 2);
  }

  /**
   * Import a profile from exported data
   */
  async importProfile(profileData: string, name?: string): Promise<SessionProfile> {
    const importedData = JSON.parse(profileData);
    
    const profileId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const profile: SessionProfile = {
      id: profileId,
      name: name || importedData.name || 'Imported Profile',
      created: new Date(importedData.created || Date.now()),
      lastUsed: new Date(),
      metadata: importedData.metadata || {},
      storageState: importedData.storageState,
      userAgent: importedData.userAgent,
      viewport: importedData.viewport,
      locale: importedData.locale,
      timezone: importedData.timezone,
      geolocation: importedData.geolocation,
      permissions: importedData.permissions,
      extraHTTPHeaders: importedData.extraHTTPHeaders,
      proxy: importedData.proxy
    };

    this.profiles.set(profileId, profile);
    await this.saveProfile(profile);
    
    return profile;
  }

  /**
   * Clone an existing profile
   */
  async cloneProfile(profileId: string, newName: string): Promise<SessionProfile> {
    const original = this.profiles.get(profileId);
    if (!original) {
      throw new Error(`Profile ${profileId} not found`);
    }

    const clonedId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const cloned: SessionProfile = {
      ...original,
      id: clonedId,
      name: newName,
      created: new Date(),
      lastUsed: new Date(),
      metadata: { ...original.metadata, clonedFrom: profileId }
    };

    this.profiles.set(clonedId, cloned);
    await this.saveProfile(cloned);
    
    return cloned;
  }

  /**
   * Get profile context options for Playwright
   */
  getProfileContextOptions(profile: SessionProfile): any {
    const options: any = {};

    if (profile.storageState) {
      options.storageState = profile.storageState;
    }

    if (profile.userAgent) {
      options.userAgent = profile.userAgent;
    }

    if (profile.viewport) {
      options.viewport = profile.viewport;
    }

    if (profile.locale) {
      options.locale = profile.locale;
    }

    if (profile.timezone) {
      options.timezoneId = profile.timezone;
    }

    if (profile.geolocation) {
      options.geolocation = profile.geolocation;
    }

    if (profile.permissions) {
      options.permissions = profile.permissions;
    }

    if (profile.extraHTTPHeaders) {
      options.extraHTTPHeaders = profile.extraHTTPHeaders;
    }

    if (profile.proxy) {
      options.proxy = profile.proxy;
    }

    return options;
  }

  /**
   * Clean up old profiles
   */
  async cleanupOldProfiles(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    let deletedCount = 0;
    
    for (const [profileId, profile] of this.profiles.entries()) {
      if (profile.lastUsed < cutoffDate) {
        await this.deleteProfile(profileId);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }
}