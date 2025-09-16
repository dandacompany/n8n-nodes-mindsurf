import { INodeProperties } from 'n8n-workflow';

export const networkOperations: INodeProperties[] = [
  {
    displayName: 'Network Operation',
    name: 'networkOperation',
    type: 'options',
    displayOptions: {
      show: {
        category: ['network'],
      },
    },
    options: [
      {
        name: 'Set Extra HTTP Headers',
        value: 'setExtraHTTPHeaders',
        description: 'Set extra HTTP headers',
      },
      {
        name: 'Set User Agent',
        value: 'setUserAgent',
        description: 'Set the user agent',
      },
      {
        name: 'Set Offline Mode',
        value: 'setOfflineMode',
        description: 'Enable or disable offline mode',
      },
      {
        name: 'Set Cache Enabled',
        value: 'setCacheEnabled',
        description: 'Enable or disable cache',
      },
      {
        name: 'Authenticate',
        value: 'authenticate',
        description: 'Set HTTP authentication credentials',
      },
      {
        name: 'Route Request',
        value: 'route',
        description: 'Intercept and modify network requests',
      },
      {
        name: 'Abort Request',
        value: 'abort',
        description: 'Abort specific requests',
      },
      {
        name: 'Continue Request',
        value: 'continue',
        description: 'Continue intercepted request with modifications',
      },
      {
        name: 'Fulfill Request',
        value: 'fulfill',
        description: 'Fulfill request with custom response',
      },
      {
        name: 'Emulate Network Conditions',
        value: 'emulateNetworkConditions',
        description: 'Simulate network conditions',
      },
      {
        name: 'Block Resources',
        value: 'blockResources',
        description: 'Block certain resource types',
      },
      {
        name: 'Set Request Interception',
        value: 'setRequestInterception',
        description: 'Enable request interception',
      },
    ],
    default: 'setExtraHTTPHeaders',
  },
  {
    displayName: 'Headers',
    name: 'extraHeaders',
    type: 'json',
    default: '',
    placeholder: '{"X-Custom-Header": "value"}',
    description: 'Extra HTTP headers as JSON',
    displayOptions: {
      show: {
        category: ['network'],
        networkOperation: ['setExtraHTTPHeaders'],
      },
    },
  },
  {
    displayName: 'User Agent',
    name: 'userAgent',
    type: 'string',
    default: '',
    description: 'User agent string',
    displayOptions: {
      show: {
        category: ['network'],
        networkOperation: ['setUserAgent'],
      },
    },
  },
  {
    displayName: 'Offline',
    name: 'offline',
    type: 'boolean',
    default: true,
    description: 'Whether to enable offline mode',
    displayOptions: {
      show: {
        category: ['network'],
        networkOperation: ['setOfflineMode'],
      },
    },
  },
  {
    displayName: 'Cache Enabled',
    name: 'cacheEnabled',
    type: 'boolean',
    default: true,
    description: 'Whether to enable cache',
    displayOptions: {
      show: {
        category: ['network'],
        networkOperation: ['setCacheEnabled'],
      },
    },
  },
  {
    displayName: 'Authentication',
    name: 'authentication',
    type: 'collection',
    placeholder: 'Add Credentials',
    default: {},
    displayOptions: {
      show: {
        category: ['network'],
        networkOperation: ['authenticate'],
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
    displayName: 'URL Pattern',
    name: 'routeUrlPattern',
    type: 'string',
    default: '**/*',
    placeholder: '**/api/**',
    description: 'URL pattern to match (glob pattern)',
    displayOptions: {
      show: {
        category: ['network'],
        networkOperation: ['route', 'abort', 'continue', 'fulfill'],
      },
    },
  },
  {
    displayName: 'Route Handler',
    name: 'routeHandler',
    type: 'options',
    options: [
      {
        name: 'Abort',
        value: 'abort',
      },
      {
        name: 'Continue',
        value: 'continue',
      },
      {
        name: 'Fulfill',
        value: 'fulfill',
      },
      {
        name: 'Fallback',
        value: 'fallback',
      },
    ],
    default: 'continue',
    displayOptions: {
      show: {
        category: ['network'],
        networkOperation: ['route'],
      },
    },
  },
  {
    displayName: 'Abort Error Code',
    name: 'abortErrorCode',
    type: 'options',
    options: [
      {
        name: 'Access Denied',
        value: 'accessdenied',
      },
      {
        name: 'Address Unreachable',
        value: 'addressunreachable',
      },
      {
        name: 'Blocked by Client',
        value: 'blockedbyclient',
      },
      {
        name: 'Blocked by Response',
        value: 'blockedbyresponse',
      },
      {
        name: 'Connection Aborted',
        value: 'connectionaborted',
      },
      {
        name: 'Connection Closed',
        value: 'connectionclosed',
      },
      {
        name: 'Connection Failed',
        value: 'connectionfailed',
      },
      {
        name: 'Connection Refused',
        value: 'connectionrefused',
      },
      {
        name: 'Connection Reset',
        value: 'connectionreset',
      },
      {
        name: 'Internet Disconnected',
        value: 'internetdisconnected',
      },
      {
        name: 'Name Not Resolved',
        value: 'namenotresolved',
      },
      {
        name: 'Timed Out',
        value: 'timedout',
      },
      {
        name: 'Failed',
        value: 'failed',
      },
    ],
    default: 'failed',
    displayOptions: {
      show: {
        category: ['network'],
        networkOperation: ['abort'],
        routeHandler: ['abort'],
      },
    },
  },
  {
    displayName: 'Continue Options',
    name: 'continueOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        category: ['network'],
        networkOperation: ['continue'],
        routeHandler: ['continue'],
      },
    },
    options: [
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        description: 'Override URL',
      },
      {
        displayName: 'Method',
        name: 'method',
        type: 'options',
        options: [
          { name: 'GET', value: 'GET' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
          { name: 'DELETE', value: 'DELETE' },
          { name: 'PATCH', value: 'PATCH' },
          { name: 'HEAD', value: 'HEAD' },
          { name: 'OPTIONS', value: 'OPTIONS' },
        ],
        default: 'GET',
        description: 'Override HTTP method',
      },
      {
        displayName: 'Headers',
        name: 'headers',
        type: 'json',
        default: '',
        placeholder: '{"X-Custom": "value"}',
        description: 'Override headers',
      },
      {
        displayName: 'Post Data',
        name: 'postData',
        type: 'string',
        default: '',
        description: 'Override POST data',
      },
    ],
  },
  {
    displayName: 'Fulfill Options',
    name: 'fulfillOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        category: ['network'],
        networkOperation: ['fulfill'],
        routeHandler: ['fulfill'],
      },
    },
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'number',
        default: 200,
        description: 'Response status code',
      },
      {
        displayName: 'Headers',
        name: 'headers',
        type: 'json',
        default: '',
        placeholder: '{"Content-Type": "application/json"}',
        description: 'Response headers',
      },
      {
        displayName: 'Content Type',
        name: 'contentType',
        type: 'string',
        default: 'text/html',
        description: 'Response content type',
      },
      {
        displayName: 'Body',
        name: 'body',
        type: 'string',
        typeOptions: {
          rows: 10,
        },
        default: '',
        description: 'Response body',
      },
      {
        displayName: 'Path',
        name: 'path',
        type: 'string',
        default: '',
        description: 'Path to file to use as response',
      },
    ],
  },
  {
    displayName: 'Network Conditions',
    name: 'networkConditions',
    type: 'collection',
    placeholder: 'Add Condition',
    default: {},
    displayOptions: {
      show: {
        category: ['network'],
        networkOperation: ['emulateNetworkConditions'],
      },
    },
    options: [
      {
        displayName: 'Offline',
        name: 'offline',
        type: 'boolean',
        default: false,
        description: 'Whether to emulate offline',
      },
      {
        displayName: 'Download Throughput',
        name: 'downloadThroughput',
        type: 'number',
        default: -1,
        description: 'Download speed in bytes/sec (-1 for no throttling)',
      },
      {
        displayName: 'Upload Throughput',
        name: 'uploadThroughput',
        type: 'number',
        default: -1,
        description: 'Upload speed in bytes/sec (-1 for no throttling)',
      },
      {
        displayName: 'Latency',
        name: 'latency',
        type: 'number',
        default: 0,
        description: 'Latency in milliseconds',
      },
    ],
  },
  {
    displayName: 'Resource Types',
    name: 'resourceTypes',
    type: 'multiOptions',
    options: [
      { name: 'Document', value: 'document' },
      { name: 'Stylesheet', value: 'stylesheet' },
      { name: 'Image', value: 'image' },
      { name: 'Media', value: 'media' },
      { name: 'Font', value: 'font' },
      { name: 'Script', value: 'script' },
      { name: 'Text Track', value: 'texttrack' },
      { name: 'XHR', value: 'xhr' },
      { name: 'Fetch', value: 'fetch' },
      { name: 'Event Source', value: 'eventsource' },
      { name: 'WebSocket', value: 'websocket' },
      { name: 'Manifest', value: 'manifest' },
      { name: 'Other', value: 'other' },
    ],
    default: [],
    description: 'Resource types to block',
    displayOptions: {
      show: {
        category: ['network'],
        networkOperation: ['blockResources'],
      },
    },
  },
  {
    displayName: 'Interception Enabled',
    name: 'interceptionEnabled',
    type: 'boolean',
    default: true,
    description: 'Whether to enable request interception',
    displayOptions: {
      show: {
        category: ['network'],
        networkOperation: ['setRequestInterception'],
      },
    },
  },
];