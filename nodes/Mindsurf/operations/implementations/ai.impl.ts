import { IExecuteFunctions } from 'n8n-workflow';
import { Page } from 'playwright';
import { BrowserManager } from '../../BrowserManager';

export async function executeAIOperation(
  this: IExecuteFunctions,
  page: Page,
  operation: string,
  itemIndex: number,
  sessionId: string
): Promise<any> {
  const browserManager = BrowserManager.getInstance();
  const nlProcessor = browserManager.getNLProcessor();

  switch (operation) {
    case 'executeJsonCommand': {
      const jsonCommand = this.getNodeParameter('jsonCommand', itemIndex) as string;
      const executeCommand = this.getNodeParameter('executeCommand', itemIndex, true) as boolean;

      // Parse the JSON command
      const command = nlProcessor.parseCommand(jsonCommand);

      if (executeCommand) {
        // Execute the command
        const result = await nlProcessor.executeCommand(page, command, this, itemIndex);
        
        // Handle binary data if present (e.g., from screenshots)
        if (result.binary) {
          return {
            binary: { data: result.binary },
            json: {
              action: result.action,
              success: result.success,
              sessionId,
            }
          };
        }

        return {
          ...result,
          command,
          sessionId,
        };
      } else {
        // Just return the parsed command without executing
        return {
          command,
          parsed: true,
          executed: false,
          sessionId,
        };
      }
    }

    case 'extractContext': {
      const context = await nlProcessor.extractPageContext(page);
      let parsedContext;
      try {
        parsedContext = JSON.parse(context);
      } catch (e) {
        parsedContext = context;
      }
      
      return {
        pageContext: parsedContext,
        url: page.url(),
        sessionId,
      };
    }

    case 'parseLLMResponse': {
      const llmResponse = this.getNodeParameter('llmResponse', itemIndex) as string;
      
      try {
        const command = nlProcessor.parseCommand(llmResponse);
        return {
          command,
          valid: true,
          sessionId,
        };
      } catch (error: any) {
        return {
          error: error.message,
          valid: false,
          originalResponse: llmResponse,
          sessionId,
        };
      }
    }

    case 'buildPrompt': {
      const userCommand = this.getNodeParameter('userCommand', itemIndex) as string;
      const includeContext = this.getNodeParameter('includeContext', itemIndex, true) as boolean;
      const includeCommandsInPrompt = this.getNodeParameter('includeCommandsInPrompt', itemIndex, true) as boolean;
      const systemPrompt = this.getNodeParameter('systemPrompt', itemIndex, '') as string;

      let context = '';
      let parsedContext = null;
      if (includeContext) {
        context = await nlProcessor.extractPageContext(page);
        try {
          parsedContext = JSON.parse(context);
        } catch (e) {
          parsedContext = context;
        }
      }

      // Use custom system prompt if provided
      if (systemPrompt) {
        // When custom prompt is provided, prepend it to the command
        let customPrompt = systemPrompt + '\n\n';
        if (context) {
          customPrompt += `CURRENT PAGE CONTEXT:\n${context}\n\n`;
        }
        customPrompt += `USER COMMAND: "${userCommand}"\n\n`;
        customPrompt += 'Please convert the user command to a JSON command:';
        
        return {
          prompt: customPrompt,
          userCommand,
          hasContext: includeContext,
          pageContext: parsedContext,
          commandDocumentation: nlProcessor.getCommandDocumentation(),
          sessionId,
        };
      }

      const prompt = nlProcessor.buildPrompt(userCommand, context, includeCommandsInPrompt);
      
      return {
        prompt,
        userCommand,
        hasContext: includeContext,
        pageContext: parsedContext,
        commandDocumentation: nlProcessor.getCommandDocumentation(),
        sessionId,
      };
    }

    case 'getCommandDocs': {
      const documentation = nlProcessor.getCommandDocumentation();
      
      return {
        documentation,
        commandCount: Object.keys(nlProcessor['commandDefinitions']).length,
        sessionId,
      };
    }

    default:
      throw new Error(`Unknown AI operation: ${operation}`);
  }
}

export async function executeProfileOperation(
  this: IExecuteFunctions,
  page: Page,
  operation: string,
  itemIndex: number,
  sessionId: string
): Promise<any> {
  const browserManager = BrowserManager.getInstance();
  const profileManager = browserManager.getProfileManager();
  const context = page.context();

  switch (operation) {
    case 'createProfile': {
      const profileName = this.getNodeParameter('profileName', itemIndex) as string;
      const metadata = this.getNodeParameter('profileMetadata', itemIndex, '{}') as string;
      
      let parsedMetadata = {};
      try {
        parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      } catch (error) {
        // Ignore parse errors
      }

      const profile = await profileManager.createProfile(profileName, context, parsedMetadata);
      
      return {
        profileId: profile.id,
        name: profile.name,
        created: profile.created,
        metadata: profile.metadata,
        sessionId,
      };
    }

    case 'loadProfile': {
      const profileId = this.getNodeParameter('profileId', itemIndex) as string;
      
      const profile = await profileManager.loadProfile(profileId);
      
      return {
        profileId: profile.id,
        name: profile.name,
        lastUsed: profile.lastUsed,
        metadata: profile.metadata,
        sessionId,
      };
    }

    case 'updateProfile': {
      const profileId = this.getNodeParameter('profileId', itemIndex) as string;
      const metadata = this.getNodeParameter('profileMetadata', itemIndex, '{}') as string;
      
      let parsedMetadata = {};
      try {
        parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      } catch (error) {
        // Ignore parse errors
      }

      const profile = await profileManager.updateProfile(profileId, context, parsedMetadata);
      
      return {
        profileId: profile.id,
        name: profile.name,
        updated: profile.lastUsed,
        metadata: profile.metadata,
        sessionId,
      };
    }

    case 'listProfiles': {
      const profiles = profileManager.getAllProfiles();
      
      return {
        profiles: profiles.map(p => ({
          id: p.id,
          name: p.name,
          created: p.created,
          lastUsed: p.lastUsed,
          metadata: p.metadata,
        })),
        count: profiles.length,
        sessionId,
      };
    }

    case 'deleteProfile': {
      const profileId = this.getNodeParameter('profileId', itemIndex) as string;
      
      await profileManager.deleteProfile(profileId);
      
      return {
        profileId,
        deleted: true,
        sessionId,
      };
    }

    case 'exportProfile': {
      const profileId = this.getNodeParameter('profileId', itemIndex) as string;
      
      const exportedData = await profileManager.exportProfile(profileId);
      
      return {
        profileId,
        exportedData,
        sessionId,
      };
    }

    case 'importProfile': {
      const profileName = this.getNodeParameter('profileName', itemIndex) as string;
      const profileData = this.getNodeParameter('profileData', itemIndex) as string;
      
      const profile = await profileManager.importProfile(profileData, profileName);
      
      return {
        profileId: profile.id,
        name: profile.name,
        imported: true,
        sessionId,
      };
    }

    case 'cloneProfile': {
      const profileId = this.getNodeParameter('profileId', itemIndex) as string;
      const profileName = this.getNodeParameter('profileName', itemIndex) as string;
      
      const cloned = await profileManager.cloneProfile(profileId, profileName);
      
      return {
        profileId: cloned.id,
        name: cloned.name,
        clonedFrom: profileId,
        sessionId,
      };
    }

    default:
      throw new Error(`Unknown profile operation: ${operation}`);
  }
}

export async function executeProxyOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
  sessionId: string
): Promise<any> {
  const browserManager = BrowserManager.getInstance();
  const proxyManager = browserManager.getProxyManager();

  switch (operation) {
    case 'addProxy': {
      const server = this.getNodeParameter('proxyServer', itemIndex) as string;
      const name = this.getNodeParameter('proxyName', itemIndex, '') as string;
      const credentials = this.getNodeParameter('proxyCredentials', itemIndex, {}) as any;
      const location = this.getNodeParameter('proxyLocation', itemIndex, {}) as any;

      const proxy = await proxyManager.addProxy({
        name: name || server,
        server,
        username: credentials.username,
        password: credentials.password,
        country: location.country,
        city: location.city,
        isResidential: location.isResidential,
      });

      return {
        proxyId: proxy.id,
        name: proxy.name,
        server: proxy.server,
        added: true,
        sessionId,
      };
    }

    case 'addProxyList': {
      const proxyList = this.getNodeParameter('proxyList', itemIndex) as string;
      const location = this.getNodeParameter('proxyLocation', itemIndex, {}) as any;

      const proxies = proxyList.split('\n').filter(line => line.trim());
      const added = await proxyManager.addProxiesFromList(proxies, location);

      return {
        added: added.length,
        proxies: added.map(p => ({
          id: p.id,
          name: p.name,
          server: p.server,
        })),
        sessionId,
      };
    }

    case 'listProxies': {
      const proxies = proxyManager.getAllProxies();

      return {
        proxies: proxies.map(p => ({
          id: p.id,
          name: p.name,
          server: p.server,
          country: p.country,
          city: p.city,
          isResidential: p.isResidential,
          reliability: p.reliability,
          speed: p.speed,
          lastChecked: p.lastChecked,
        })),
        count: proxies.length,
        sessionId,
      };
    }

    case 'testProxy': {
      const proxyId = this.getNodeParameter('proxyId', itemIndex) as string;

      const result = await proxyManager.testProxy(proxyId);

      return {
        proxyId,
        ...result,
        sessionId,
      };
    }

    case 'testAllProxies': {
      const results = await proxyManager.testAllProxies();

      const resultsArray = Array.from(results.entries()).map(([proxyId, result]) => ({
        proxyId,
        ...result,
      }));

      return {
        tested: resultsArray.length,
        results: resultsArray,
        sessionId,
      };
    }

    case 'removeProxy': {
      const proxyId = this.getNodeParameter('proxyId', itemIndex) as string;

      await proxyManager.removeProxy(proxyId);

      return {
        proxyId,
        removed: true,
        sessionId,
      };
    }

    case 'getStatistics': {
      const stats = proxyManager.getStatistics();

      return {
        ...stats,
        byCountry: Array.from(stats.byCountry.entries()).map(([country, count]) => ({
          country,
          count,
        })),
        sessionId,
      };
    }

    case 'importProxies': {
      const filePath = this.getNodeParameter('filePath', itemIndex) as string;
      const fileFormat = this.getNodeParameter('fileFormat', itemIndex, 'json') as 'json' | 'txt';

      const imported = await proxyManager.importProxiesFromFile(filePath, fileFormat);

      return {
        imported,
        filePath,
        format: fileFormat,
        sessionId,
      };
    }

    case 'exportProxies': {
      const filePath = this.getNodeParameter('filePath', itemIndex) as string;
      const fileFormat = this.getNodeParameter('fileFormat', itemIndex, 'json') as 'json' | 'txt';

      await proxyManager.exportProxiesToFile(filePath, fileFormat);

      return {
        exported: true,
        filePath,
        format: fileFormat,
        count: proxyManager.getAllProxies().length,
        sessionId,
      };
    }

    default:
      throw new Error(`Unknown proxy operation: ${operation}`);
  }
}