import { INodeProperties } from 'n8n-workflow';

export const aiOperations: INodeProperties[] = [
  {
    displayName: 'AI Operation',
    name: 'aiOperation',
    type: 'options',
    displayOptions: {
      show: {
        category: ['ai'],
      },
    },
    options: [
      {
        name: 'Execute JSON Command',
        value: 'executeJsonCommand',
        description: 'Execute browser actions using JSON command format',
      },
      {
        name: 'Extract Page Context',
        value: 'extractContext',
        description: 'Extract structured information from the current page',
      },
      {
        name: 'Parse LLM Response',
        value: 'parseLLMResponse',
        description: 'Parse LLM response into browser command',
      },
      {
        name: 'Build LLM Prompt',
        value: 'buildPrompt',
        description: 'Build prompt for LLM with page context',
      },
      {
        name: 'Get Command Documentation',
        value: 'getCommandDocs',
        description: 'Get documentation of all supported commands for LLM training',
      },
    ],
    default: 'executeJsonCommand',
    description: 'The AI operation to perform',
  },
  // JSON Command Input
  {
    displayName: 'JSON Command',
    name: 'jsonCommand',
    type: 'json',
    default: '{"action": "navigate", "target": "https://example.com"}',
    displayOptions: {
      show: {
        category: ['ai'],
        aiOperation: ['executeJsonCommand'],
      },
    },
    description: 'JSON command to execute. Examples: {"action": "navigate", "target": "https://google.com"} | {"action": "click", "target": "#button"} | {"action": "type", "target": "input", "value": "text"}',
    hint: 'Supported actions: navigate, click, type, screenshot, scroll, wait, hover, select, check, press, doubleClick, rightClick',
  },
  {
    displayName: 'LLM Response',
    name: 'llmResponse',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        category: ['ai'],
        aiOperation: ['parseLLMResponse'],
      },
    },
    description: 'Parse raw LLM response text containing JSON command',
  },
  {
    displayName: 'User Command',
    name: 'userCommand',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        category: ['ai'],
        aiOperation: ['buildPrompt'],
      },
    },
    description: 'The natural language command from the user',
  },
  {
    displayName: 'Include Page Context',
    name: 'includeContext',
    type: 'boolean',
    default: true,
    displayOptions: {
      show: {
        category: ['ai'],
        aiOperation: ['buildPrompt', 'extractContext'],
      },
    },
    description: 'Whether to include current page context in the prompt',
  },
  {
    displayName: 'Include Commands in Prompt',
    name: 'includeCommandsInPrompt',
    type: 'boolean',
    default: true,
    displayOptions: {
      show: {
        category: ['ai'],
        aiOperation: ['buildPrompt'],
      },
    },
    description: 'Whether to include command documentation in the prompt itself (recommended for better LLM understanding)',
  },
  {
    displayName: 'System Prompt',
    name: 'systemPrompt',
    type: 'string',
    typeOptions: {
      rows: 10,
    },
    default: '',
    displayOptions: {
      show: {
        category: ['ai'],
        aiOperation: ['buildPrompt'],
      },
    },
    description: 'Custom system prompt for the LLM (optional)',
  },
  {
    displayName: 'Execute Command',
    name: 'executeCommand',
    type: 'boolean',
    default: true,
    displayOptions: {
      show: {
        category: ['ai'],
        aiOperation: ['executeJsonCommand'],
      },
    },
    description: 'Whether to execute the parsed command immediately',
  },
];

export const profileOperations: INodeProperties[] = [
  {
    displayName: 'Profile Operation',
    name: 'profileOperation',
    type: 'options',
    displayOptions: {
      show: {
        category: ['profile'],
      },
    },
    options: [
      {
        name: 'Create Profile',
        value: 'createProfile',
        description: 'Create a new browser profile from current session',
      },
      {
        name: 'Load Profile',
        value: 'loadProfile',
        description: 'Load an existing browser profile',
      },
      {
        name: 'Update Profile',
        value: 'updateProfile',
        description: 'Update an existing profile with current state',
      },
      {
        name: 'List Profiles',
        value: 'listProfiles',
        description: 'List all available profiles',
      },
      {
        name: 'Delete Profile',
        value: 'deleteProfile',
        description: 'Delete a browser profile',
      },
      {
        name: 'Export Profile',
        value: 'exportProfile',
        description: 'Export a profile for sharing',
      },
      {
        name: 'Import Profile',
        value: 'importProfile',
        description: 'Import a profile from exported data',
      },
      {
        name: 'Clone Profile',
        value: 'cloneProfile',
        description: 'Create a copy of an existing profile',
      },
    ],
    default: 'createProfile',
    description: 'The profile operation to perform',
  },
  {
    displayName: 'Profile Name',
    name: 'profileName',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        category: ['profile'],
        profileOperation: ['createProfile', 'cloneProfile', 'importProfile'],
      },
    },
    description: 'Name for the profile',
  },
  {
    displayName: 'Profile ID',
    name: 'profileId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        category: ['profile'],
        profileOperation: ['loadProfile', 'updateProfile', 'deleteProfile', 'exportProfile', 'cloneProfile'],
      },
    },
    description: 'ID of the profile to operate on',
  },
  {
    displayName: 'Profile Data',
    name: 'profileData',
    type: 'string',
    typeOptions: {
      rows: 10,
    },
    default: '',
    displayOptions: {
      show: {
        category: ['profile'],
        profileOperation: ['importProfile'],
      },
    },
    description: 'Exported profile data to import',
  },
  {
    displayName: 'Profile Metadata',
    name: 'profileMetadata',
    type: 'json',
    default: '{}',
    displayOptions: {
      show: {
        category: ['profile'],
        profileOperation: ['createProfile', 'updateProfile'],
      },
    },
    description: 'Additional metadata to store with the profile',
  },
];

export const proxyOperations: INodeProperties[] = [
  {
    displayName: 'Proxy Operation',
    name: 'proxyOperation',
    type: 'options',
    displayOptions: {
      show: {
        category: ['proxy'],
      },
    },
    options: [
      {
        name: 'Add Proxy',
        value: 'addProxy',
        description: 'Add a new proxy configuration',
      },
      {
        name: 'Add Proxy List',
        value: 'addProxyList',
        description: 'Add multiple proxies from a list',
      },
      {
        name: 'List Proxies',
        value: 'listProxies',
        description: 'List all configured proxies',
      },
      {
        name: 'Test Proxy',
        value: 'testProxy',
        description: 'Test proxy connectivity',
      },
      {
        name: 'Test All Proxies',
        value: 'testAllProxies',
        description: 'Test all configured proxies',
      },
      {
        name: 'Remove Proxy',
        value: 'removeProxy',
        description: 'Remove a proxy configuration',
      },
      {
        name: 'Get Statistics',
        value: 'getStatistics',
        description: 'Get proxy usage statistics',
      },
      {
        name: 'Import Proxies',
        value: 'importProxies',
        description: 'Import proxies from file',
      },
      {
        name: 'Export Proxies',
        value: 'exportProxies',
        description: 'Export proxies to file',
      },
    ],
    default: 'addProxy',
    description: 'The proxy operation to perform',
  },
  {
    displayName: 'Proxy Server',
    name: 'proxyServer',
    type: 'string',
    default: '',
    placeholder: 'http://proxy.example.com:8080',
    displayOptions: {
      show: {
        category: ['proxy'],
        proxyOperation: ['addProxy'],
      },
    },
    description: 'Proxy server URL',
  },
  {
    displayName: 'Proxy Name',
    name: 'proxyName',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        category: ['proxy'],
        proxyOperation: ['addProxy'],
      },
    },
    description: 'Name for the proxy configuration',
  },
  {
    displayName: 'Proxy Credentials',
    name: 'proxyCredentials',
    type: 'collection',
    placeholder: 'Add Credential',
    default: {},
    displayOptions: {
      show: {
        category: ['proxy'],
        proxyOperation: ['addProxy'],
      },
    },
    options: [
      {
        displayName: 'Username',
        name: 'username',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Password',
        name: 'password',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
      },
    ],
  },
  {
    displayName: 'Proxy List',
    name: 'proxyList',
    type: 'string',
    typeOptions: {
      rows: 10,
    },
    default: '',
    placeholder: 'http://proxy1.com:8080\nhttp://user:pass@proxy2.com:3128',
    displayOptions: {
      show: {
        category: ['proxy'],
        proxyOperation: ['addProxyList'],
      },
    },
    description: 'List of proxies (one per line)',
  },
  {
    displayName: 'Proxy ID',
    name: 'proxyId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        category: ['proxy'],
        proxyOperation: ['testProxy', 'removeProxy'],
      },
    },
    description: 'ID of the proxy to operate on',
  },
  {
    displayName: 'Proxy Location',
    name: 'proxyLocation',
    type: 'collection',
    placeholder: 'Add Location',
    default: {},
    displayOptions: {
      show: {
        category: ['proxy'],
        proxyOperation: ['addProxy'],
      },
    },
    options: [
      {
        displayName: 'Country',
        name: 'country',
        type: 'string',
        default: '',
      },
      {
        displayName: 'City',
        name: 'city',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Is Residential',
        name: 'isResidential',
        type: 'boolean',
        default: false,
      },
    ],
  },
  {
    displayName: 'Import/Export File Path',
    name: 'filePath',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        category: ['proxy'],
        proxyOperation: ['importProxies', 'exportProxies'],
      },
    },
    description: 'Path to the file for import/export',
  },
  {
    displayName: 'File Format',
    name: 'fileFormat',
    type: 'options',
    options: [
      {
        name: 'JSON',
        value: 'json',
      },
      {
        name: 'Text',
        value: 'txt',
      },
    ],
    default: 'json',
    displayOptions: {
      show: {
        category: ['proxy'],
        proxyOperation: ['importProxies', 'exportProxies'],
      },
    },
    description: 'Format of the import/export file',
  },
];