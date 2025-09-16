import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from 'n8n-workflow';

import { navigationOperations } from './operations/navigation';
import { screenshotOperations } from './operations/screenshot';
import { interactionOperations } from './operations/interaction';
import { evaluateOperations } from './operations/evaluate';
import { waitOperations } from './operations/wait';
import { networkOperations } from './operations/network';
import { storageOperations } from './operations/storage';
import { accessibilityOperations } from './operations/accessibility';
import { fileOperations } from './operations/file';
import { tabOperations } from './operations/tab';
import { aiOperations, profileOperations, proxyOperations } from './operations/ai';
import { sessionOperations } from './operations/session';
import { BrowserManager } from './BrowserManager';

// Import operation implementations
import {
  executeNavigationOperation,
  executeScreenshotOperation,
  executeInteractionOperation,
  executeEvaluateOperation,
  executeWaitOperation,
} from './operations/implementations';
import {
  executeAIOperation,
  executeProfileOperation,
  executeProxyOperation,
} from './operations/implementations/ai.impl';
import { executeSessionOperation } from './operations/implementations/session.impl';

export class Mindsurf implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Mindsurf',
    name: 'mindsurf',
    icon: 'file:mindsurf.png',
    group: ['automation'],
    version: 1,
    subtitle: '={{$parameter["category"] ? $parameter["category"].charAt(0).toUpperCase() + $parameter["category"].slice(1) : ""}}{{$parameter[$parameter["category"] + "Operation"] ? ": " + $parameter[$parameter["category"] + "Operation"] : ""}}',
    description: 'Playwright-based web browser automation for n8n',
    defaults: {
      name: 'Mindsurf',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      {
        displayName: 'Browser',
        name: 'browser',
        type: 'options',
        options: [
          {
            name: 'Chromium',
            value: 'chromium',
          },
          {
            name: 'Firefox',
            value: 'firefox',
          },
          {
            name: 'WebKit',
            value: 'webkit',
          },
        ],
        default: 'chromium',
        description: 'Which browser to use',
      },
      {
        displayName: 'Operation Category',
        name: 'category',
        type: 'options',
        options: [
          {
            name: 'Navigation',
            value: 'navigation',
            description: 'Navigate and control page navigation',
          },
          {
            name: 'Screenshot & PDF',
            value: 'screenshot',
            description: 'Capture screenshots and generate PDFs',
          },
          {
            name: 'Interaction',
            value: 'interaction',
            description: 'Interact with page elements',
          },
          {
            name: 'Evaluate',
            value: 'evaluate',
            description: 'Execute JavaScript in the page context',
          },
          {
            name: 'Wait',
            value: 'wait',
            description: 'Wait for various conditions',
          },
          {
            name: 'Network',
            value: 'network',
            description: 'Control network behavior',
          },
          {
            name: 'Storage',
            value: 'storage',
            description: 'Manage cookies, local storage, and session storage',
          },
          {
            name: 'Accessibility',
            value: 'accessibility',
            description: 'Get accessibility tree and information',
          },
          {
            name: 'File',
            value: 'file',
            description: 'Handle file uploads and downloads',
          },
          {
            name: 'Tab',
            value: 'tab',
            description: 'Manage browser tabs and windows',
          },
          {
            name: 'AI',
            value: 'ai',
            description: 'AI-powered browser automation with LLM integration',
          },
          {
            name: 'Profile',
            value: 'profile',
            description: 'Manage browser session profiles',
          },
          {
            name: 'Proxy',
            value: 'proxy',
            description: 'Manage proxy configurations',
          },
          {
            name: 'Session',
            value: 'session',
            description: 'Manage browser sessions and cleanup',
          },
        ],
        default: 'navigation',
        noDataExpression: true,
      },
      ...navigationOperations,
      ...screenshotOperations,
      ...interactionOperations,
      ...evaluateOperations,
      ...waitOperations,
      ...networkOperations,
      ...storageOperations,
      ...accessibilityOperations,
      ...fileOperations,
      ...tabOperations,
      ...aiOperations,
      ...profileOperations,
      ...proxyOperations,
      ...sessionOperations,
      {
        displayName: 'Browser Options',
        name: 'browserOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Headless',
            name: 'headless',
            type: 'boolean',
            default: true,
            description: 'Whether to run browser in headless mode',
          },
          {
            displayName: 'Slow Motion',
            name: 'slowMo',
            type: 'number',
            default: 0,
            description: 'Slows down operations by the specified amount of milliseconds',
          },
          {
            displayName: 'Timeout',
            name: 'timeout',
            type: 'number',
            default: 30000,
            description: 'Maximum time in milliseconds',
          },
          {
            displayName: 'Viewport Width',
            name: 'viewportWidth',
            type: 'number',
            default: 1280,
            description: 'Browser viewport width in pixels',
          },
          {
            displayName: 'Viewport Height',
            name: 'viewportHeight',
            type: 'number',
            default: 720,
            description: 'Browser viewport height in pixels',
          },
          {
            displayName: 'User Agent',
            name: 'userAgent',
            type: 'string',
            default: '',
            description: 'Specific user agent to use',
          },
          {
            displayName: 'Locale',
            name: 'locale',
            type: 'string',
            default: '',
            placeholder: 'en-US',
            description: 'Specify user locale, for example en-US, de-DE, etc',
          },
          {
            displayName: 'Timezone',
            name: 'timezone',
            type: 'string',
            default: '',
            placeholder: 'Europe/Rome',
            description: 'Changes the timezone of the context',
          },
          {
            displayName: 'Geolocation',
            name: 'geolocation',
            type: 'json',
            default: '',
            placeholder: '{"latitude": 59.95, "longitude": 30.31667}',
            description: 'Context geolocation',
          },
          {
            displayName: 'Permissions',
            name: 'permissions',
            type: 'string',
            default: '',
            placeholder: 'geolocation,notifications',
            description: 'Comma-separated list of permissions to grant',
          },
          {
            displayName: 'Color Scheme',
            name: 'colorScheme',
            type: 'options',
            options: [
              {
                name: 'Light',
                value: 'light',
              },
              {
                name: 'Dark',
                value: 'dark',
              },
              {
                name: 'No Preference',
                value: 'no-preference',
              },
            ],
            default: 'light',
            description: 'Emulates prefers-colors-scheme media feature',
          },
          {
            displayName: 'Extra HTTP Headers',
            name: 'extraHTTPHeaders',
            type: 'json',
            default: '',
            placeholder: '{"X-Custom-Header": "value"}',
            description: 'Additional HTTP headers to be sent with every request',
          },
          {
            displayName: 'Offline',
            name: 'offline',
            type: 'boolean',
            default: false,
            description: 'Whether to emulate network being offline',
          },
          {
            displayName: 'HTTP Credentials',
            name: 'httpCredentials',
            type: 'json',
            default: '',
            placeholder: '{"username": "user", "password": "pass"}',
            description: 'Credentials for HTTP authentication',
          },
          {
            displayName: 'Ignore HTTPS Errors',
            name: 'ignoreHTTPSErrors',
            type: 'boolean',
            default: false,
            description: 'Whether to ignore HTTPS errors during navigation',
          },
          {
            displayName: 'JavaScript Enabled',
            name: 'javaScriptEnabled',
            type: 'boolean',
            default: true,
            description: 'Whether or not to enable JavaScript in the context',
          },
          {
            displayName: 'Bypass CSP',
            name: 'bypassCSP',
            type: 'boolean',
            default: false,
            description: 'Whether to bypass page Content-Security-Policy',
          },
          {
            displayName: 'User Data Directory',
            name: 'userDataDir',
            type: 'string',
            default: '',
            description: 'Path to a User Data Directory for persistent browser session',
          },
          {
            displayName: 'Downloads Path',
            name: 'downloadsPath',
            type: 'string',
            default: '',
            description: 'Path where to save downloads',
          },
          {
            displayName: 'Device Scale Factor',
            name: 'deviceScaleFactor',
            type: 'number',
            default: 1,
            description: 'Device scale factor (DPR)',
          },
          {
            displayName: 'Is Mobile',
            name: 'isMobile',
            type: 'boolean',
            default: false,
            description: 'Whether the viewport supports touch events',
          },
          {
            displayName: 'Has Touch',
            name: 'hasTouch',
            type: 'boolean',
            default: false,
            description: 'Whether the viewport supports touch events',
          },
          {
            displayName: 'Reduced Motion',
            name: 'reducedMotion',
            type: 'options',
            options: [
              {
                name: 'Reduce',
                value: 'reduce',
              },
              {
                name: 'No Preference',
                value: 'no-preference',
              },
            ],
            default: 'no-preference',
            description: 'Emulates prefers-reduced-motion media feature',
          },
          {
            displayName: 'Forced Colors',
            name: 'forcedColors',
            type: 'options',
            options: [
              {
                name: 'Active',
                value: 'active',
              },
              {
                name: 'None',
                value: 'none',
              },
            ],
            default: 'none',
            description: 'Emulates forced-colors media feature',
          },
          {
            displayName: 'Proxy',
            name: 'proxy',
            type: 'json',
            default: '',
            placeholder: '{"server": "http://proxy.com:3128", "username": "user", "password": "pass"}',
            description: 'Network proxy settings',
          },
        ],
      },
      {
        displayName: 'Session ID',
        name: 'sessionId',
        type: 'string',
        default: '={{ $json.sessionId }}',
        description: 'Session ID to reuse browser context across executions',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const browserManager = BrowserManager.getInstance();

    for (let i = 0; i < items.length; i++) {
      try {
        const browserType = this.getNodeParameter('browser', i) as string;
        const category = this.getNodeParameter('category', i) as string;
        const browserOptions = this.getNodeParameter('browserOptions', i) as any;
        
        // Get sessionId - handle empty strings and expressions
        let sessionId = this.getNodeParameter('sessionId', i, '') as string;
        
        // If sessionId is empty or just the expression template, generate a new one
        if (!sessionId || sessionId === '={{ $json.sessionId }}' || sessionId.trim() === '') {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        }

        // Get or create browser context
        const context = await browserManager.getOrCreateContext(sessionId, browserType, browserOptions);
        const page = context.pages()[0] || await context.newPage();

        let result: any = {};

        // Execute operation based on category
        switch (category) {
          case 'navigation':
            const navOperation = this.getNodeParameter('navigationOperation', i, 'goto') as string;
            result = await executeNavigationOperation.call(this, page, navOperation, i);
            break;
          case 'screenshot':
            const screenshotOperation = this.getNodeParameter('screenshotOperation', i, 'screenshot') as string;
            const screenshotResult = await executeScreenshotOperation.call(this, page, screenshotOperation, i);
            // Handle binary data if present
            if (screenshotResult.binary) {
              returnData.push({
                json: {
                  ...screenshotResult.json,
                  sessionId,
                },
                binary: screenshotResult.binary,
              });
              continue; // Skip the normal push at the end
            } else {
              result = screenshotResult.json || screenshotResult;
            }
            break;
          case 'interaction':
            const interactionOperation = this.getNodeParameter('interactionOperation', i, 'click') as string;
            result = await executeInteractionOperation.call(this, page, interactionOperation, i);
            break;
          case 'evaluate':
            const evaluateOperation = this.getNodeParameter('evaluateOperation', i, 'evaluate') as string;
            result = await executeEvaluateOperation.call(this, page, evaluateOperation, i);
            
            // Handle multiple results for operations with 'all' option
            if (result.extractAll && Array.isArray(result.data)) {
              // Create individual items for each result
              for (const item of result.data) {
                returnData.push({
                  json: {
                    ...item,
                    sessionId,
                    selector: result.selector,
                    operation: evaluateOperation,
                    extractAll: true,
                    totalCount: result.count,
                  },
                });
              }
              continue; // Skip the normal push at the end
            }
            break;
          case 'wait':
            const waitOperation = this.getNodeParameter('waitOperation', i, 'waitForSelector') as string;
            result = await executeWaitOperation.call(this, page, waitOperation, i);
            break;
          case 'network':
            const networkOperation = this.getNodeParameter('networkOperation', i) as string;
            // Implementation will be added
            result = { operation: networkOperation, status: 'pending implementation' };
            break;
          case 'storage':
            const storageOperation = this.getNodeParameter('storageOperation', i) as string;
            // Implementation will be added
            result = { operation: storageOperation, status: 'pending implementation' };
            break;
          case 'accessibility':
            const accessibilityOperation = this.getNodeParameter('accessibilityOperation', i) as string;
            // Implementation will be added
            result = { operation: accessibilityOperation, status: 'pending implementation' };
            break;
          case 'file':
            const fileOperation = this.getNodeParameter('fileOperation', i) as string;
            // Implementation will be added
            result = { operation: fileOperation, status: 'pending implementation' };
            break;
          case 'tab':
            const tabOperation = this.getNodeParameter('tabOperation', i) as string;
            // Implementation will be added
            result = { operation: tabOperation, status: 'pending implementation' };
            break;
          case 'ai':
            const aiOperation = this.getNodeParameter('aiOperation', i, 'nlCommand') as string;
            const aiResult = await executeAIOperation.call(this, page, aiOperation, i, sessionId);
            // Handle binary data if present
            if (aiResult.binary) {
              returnData.push({
                json: {
                  ...aiResult.json,
                  sessionId,
                },
                binary: aiResult.binary,
              });
              continue; // Skip the normal push at the end
            } 
            // Handle multiple results for AI extract with 'all' option
            else if (aiResult.extractAll && Array.isArray(aiResult.data)) {
              // Create individual items for each result
              for (const item of aiResult.data) {
                returnData.push({
                  json: {
                    ...item,
                    sessionId,
                    selector: aiResult.selector,
                    action: aiResult.action,
                    extractAll: true,
                    totalCount: aiResult.count,
                  },
                });
              }
              continue; // Skip the normal push at the end
            } else {
              result = aiResult;
            }
            break;
          case 'profile':
            const profileOperation = this.getNodeParameter('profileOperation', i, 'createProfile') as string;
            result = await executeProfileOperation.call(this, page, profileOperation, i, sessionId);
            break;
          case 'proxy':
            const proxyOperation = this.getNodeParameter('proxyOperation', i, 'addProxy') as string;
            result = await executeProxyOperation.call(this, proxyOperation, i, sessionId);
            break;
          case 'session':
            const sessionOperation = this.getNodeParameter('sessionOperation', i, 'closeSession') as string;
            result = await executeSessionOperation.call(this, sessionOperation, i, sessionId);
            break;
        }

        // For session operations and some other operations, page might be closed
        let pageUrl = '';
        let pageTitle = '';
        
        try {
          if (!page.isClosed()) {
            pageUrl = page.url();
            pageTitle = await page.title();
          }
        } catch (err) {
          // Page context might be destroyed, which is expected for some operations
          // We'll just use empty values
        }
        
        returnData.push({
          json: {
            ...result,
            sessionId,
            ...(pageUrl && { url: pageUrl }),
            ...(pageTitle && { title: pageTitle }),
          },
        });

      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error.message,
            },
          });
        } else {
          throw error;
        }
      }
    }

    return [returnData];
  }

}