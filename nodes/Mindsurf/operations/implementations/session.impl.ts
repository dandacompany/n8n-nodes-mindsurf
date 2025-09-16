import { IExecuteFunctions } from 'n8n-workflow';
import { BrowserManager } from '../../BrowserManager';

export async function executeSessionOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
  currentSessionId: string
): Promise<any> {
  const browserManager = BrowserManager.getInstance();
  const profileManager = browserManager.getProfileManager();

  switch (operation) {
    case 'saveSession': {
      const profileName = this.getNodeParameter('profileName', itemIndex) as string;
      const profileDescription = this.getNodeParameter('profileDescription', itemIndex, '') as string;
      const overwriteExisting = this.getNodeParameter('overwriteExisting', itemIndex, false) as boolean;

      if (!profileName) {
        throw new Error('Profile name is required');
      }

      // Check if profile with same name exists
      const existingProfiles = profileManager.getAllProfiles();
      const existingProfile = existingProfiles.find(p => p.name === profileName);
      
      if (existingProfile && !overwriteExisting) {
        throw new Error(`Profile "${profileName}" already exists. Enable "Overwrite Existing" to update it.`);
      }

      // Get the current browser context
      const context = await browserManager.getContext(currentSessionId);
      if (!context) {
        throw new Error(`No active session found with ID: ${currentSessionId}`);
      }

      // Create or update the profile
      let profile;
      const metadata = {
        description: profileDescription,
        savedAt: new Date().toISOString(),
        n8nWorkflowId: this.getWorkflow().id,
        n8nNodeName: this.getNode().name,
      };

      if (existingProfile) {
        profile = await profileManager.updateProfile(existingProfile.id, context, metadata);
      } else {
        profile = await profileManager.createProfile(profileName, context, metadata);
      }

      return {
        operation: 'saveSession',
        profileId: profile.id,
        profileName: profile.name,
        saved: true,
        storageStateSize: JSON.stringify(profile.storageState).length,
        message: `Session saved as "${profileName}"`,
        profile: {
          id: profile.id,
          name: profile.name,
          created: profile.created,
          lastUsed: profile.lastUsed,
          metadata: profile.metadata,
        },
      };
    }

    case 'loadSession': {
      const profileId = this.getNodeParameter('profileId', itemIndex) as string;
      const createNewSession = this.getNodeParameter('createNewSession', itemIndex, true) as boolean;

      if (!profileId) {
        throw new Error('Profile ID is required');
      }

      // Load the profile
      const profile = await profileManager.loadProfile(profileId);
      if (!profile) {
        throw new Error(`Profile not found: ${profileId}`);
      }

      // Determine session ID
      let sessionId = currentSessionId;
      if (createNewSession || !currentSessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      // Get browser options from current parameters
      const browserType = this.getNodeParameter('browser', 0) as string;
      const browserOptions = this.getNodeParameter('browserOptions', 0, {}) as any;

      // Create context with the loaded profile
      const context = await browserManager.getOrCreateContext(
        sessionId,
        browserType,
        {
          ...browserOptions,
          profileId: profile.id,
        }
      );

      // Create a new page in the context (ensures context is ready)
      await context.newPage();

      return {
        operation: 'loadSession',
        sessionId,
        profileId: profile.id,
        profileName: profile.name,
        loaded: true,
        message: `Session loaded from profile "${profile.name}"`,
        profile: {
          id: profile.id,
          name: profile.name,
          created: profile.created,
          lastUsed: profile.lastUsed,
          metadata: profile.metadata,
        },
      };
    }

    case 'listSavedSessions': {
      const profiles = profileManager.getAllProfiles();
      
      return {
        operation: 'listSavedSessions',
        profiles: profiles.map(p => ({
          id: p.id,
          name: p.name,
          created: p.created,
          lastUsed: p.lastUsed,
          metadata: p.metadata,
          hasStorageState: !!p.storageState,
        })),
        profileCount: profiles.length,
      };
    }

    case 'deleteSavedSession': {
      const profileToDelete = this.getNodeParameter('profileToDelete', itemIndex) as string;

      if (!profileToDelete) {
        throw new Error('Profile ID is required');
      }

      const profile = profileManager.getProfile(profileToDelete);
      if (!profile) {
        throw new Error(`Profile not found: ${profileToDelete}`);
      }

      const profileName = profile.name;
      await profileManager.deleteProfile(profileToDelete);

      return {
        operation: 'deleteSavedSession',
        profileId: profileToDelete,
        profileName,
        deleted: true,
        message: `Profile "${profileName}" deleted successfully`,
      };
    }
    case 'closeSession': {
      const targetSessionId = this.getNodeParameter('targetSessionId', itemIndex, '') as string;
      const sessionIdToClose = targetSessionId || currentSessionId;
      const closeBrowser = this.getNodeParameter('closeBrowser', itemIndex, false) as boolean;

      // Close the specific session context
      await browserManager.closeContext(sessionIdToClose);

      // Optionally close the browser if requested
      if (closeBrowser) {
        await browserManager.closeAllBrowsers();
      }

      return {
        operation: 'closeSession',
        sessionId: sessionIdToClose,
        closed: true,
        browserClosed: closeBrowser,
        message: `Session ${sessionIdToClose} closed successfully`,
      };
    }

    case 'closeAllSessions': {
      const closeBrowser = this.getNodeParameter('closeBrowser', itemIndex, false) as boolean;

      // Close all contexts
      await browserManager.closeAllContexts();

      // Optionally close all browsers
      if (closeBrowser) {
        await browserManager.closeAllBrowsers();
      }

      return {
        operation: 'closeAllSessions',
        closed: true,
        browsersClosed: closeBrowser,
        message: 'All sessions closed successfully',
      };
    }

    case 'listSessions': {
      // Get list of active sessions
      const sessions = browserManager.getActiveSessions();
      const browserList = browserManager.getActiveBrowsers();

      return {
        operation: 'listSessions',
        activeSessions: sessions,
        sessionCount: sessions.length,
        activeBrowsers: browserList,
        browserCount: browserList.length,
      };
    }

    case 'cleanupAll': {
      // Complete cleanup - close everything
      await browserManager.cleanup();

      return {
        operation: 'cleanupAll',
        cleaned: true,
        message: 'All resources cleaned up successfully',
      };
    }

    default:
      throw new Error(`Unknown session operation: ${operation}`);
  }
}