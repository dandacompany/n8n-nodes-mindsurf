import { INodeProperties } from 'n8n-workflow';

export const storageOperations: INodeProperties[] = [
  {
    displayName: 'Storage Operation',
    name: 'storageOperation',
    type: 'options',
    displayOptions: {
      show: {
        category: ['storage'],
      },
    },
    options: [
      {
        name: 'Get Cookies',
        value: 'getCookies',
        description: 'Get browser cookies',
      },
      {
        name: 'Set Cookie',
        value: 'setCookie',
        description: 'Set a browser cookie',
      },
      {
        name: 'Delete Cookie',
        value: 'deleteCookie',
        description: 'Delete a browser cookie',
      },
      {
        name: 'Clear Cookies',
        value: 'clearCookies',
        description: 'Clear all browser cookies',
      },
      {
        name: 'Get Local Storage',
        value: 'getLocalStorage',
        description: 'Get local storage item',
      },
      {
        name: 'Set Local Storage',
        value: 'setLocalStorage',
        description: 'Set local storage item',
      },
      {
        name: 'Remove Local Storage',
        value: 'removeLocalStorage',
        description: 'Remove local storage item',
      },
      {
        name: 'Clear Local Storage',
        value: 'clearLocalStorage',
        description: 'Clear all local storage',
      },
      {
        name: 'Get Session Storage',
        value: 'getSessionStorage',
        description: 'Get session storage item',
      },
      {
        name: 'Set Session Storage',
        value: 'setSessionStorage',
        description: 'Set session storage item',
      },
      {
        name: 'Remove Session Storage',
        value: 'removeSessionStorage',
        description: 'Remove session storage item',
      },
      {
        name: 'Clear Session Storage',
        value: 'clearSessionStorage',
        description: 'Clear all session storage',
      },
      {
        name: 'Save Storage State',
        value: 'saveStorageState',
        description: 'Save cookies and storage to file',
      },
      {
        name: 'Load Storage State',
        value: 'loadStorageState',
        description: 'Load cookies and storage from file',
      },
    ],
    default: 'getCookies',
  },
  {
    displayName: 'Cookie Name',
    name: 'cookieName',
    type: 'string',
    default: '',
    description: 'Name of the cookie',
    displayOptions: {
      show: {
        category: ['storage'],
        storageOperation: ['deleteCookie'],
      },
    },
  },
  {
    displayName: 'Cookie',
    name: 'cookie',
    type: 'collection',
    placeholder: 'Add Cookie Properties',
    default: {},
    displayOptions: {
      show: {
        category: ['storage'],
        storageOperation: ['setCookie'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Value',
        name: 'value',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Domain',
        name: 'domain',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Path',
        name: 'path',
        type: 'string',
        default: '/',
      },
      {
        displayName: 'Expires',
        name: 'expires',
        type: 'number',
        default: 0,
        description: 'Unix time in seconds',
      },
      {
        displayName: 'HTTP Only',
        name: 'httpOnly',
        type: 'boolean',
        default: false,
      },
      {
        displayName: 'Secure',
        name: 'secure',
        type: 'boolean',
        default: false,
      },
      {
        displayName: 'Same Site',
        name: 'sameSite',
        type: 'options',
        options: [
          { name: 'Strict', value: 'Strict' },
          { name: 'Lax', value: 'Lax' },
          { name: 'None', value: 'None' },
        ],
        default: 'Lax',
      },
    ],
  },
  {
    displayName: 'Storage Key',
    name: 'storageKey',
    type: 'string',
    default: '',
    description: 'Key for storage item',
    displayOptions: {
      show: {
        category: ['storage'],
        storageOperation: [
          'getLocalStorage',
          'setLocalStorage',
          'removeLocalStorage',
          'getSessionStorage',
          'setSessionStorage',
          'removeSessionStorage',
        ],
      },
    },
  },
  {
    displayName: 'Storage Value',
    name: 'storageValue',
    type: 'string',
    default: '',
    description: 'Value for storage item',
    displayOptions: {
      show: {
        category: ['storage'],
        storageOperation: ['setLocalStorage', 'setSessionStorage'],
      },
    },
  },
  {
    displayName: 'File Path',
    name: 'storageFilePath',
    type: 'string',
    default: '',
    description: 'Path to save or load storage state',
    displayOptions: {
      show: {
        category: ['storage'],
        storageOperation: ['saveStorageState', 'loadStorageState'],
      },
    },
  },
  {
    displayName: 'Cookie Filter',
    name: 'cookieFilter',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        category: ['storage'],
        storageOperation: ['getCookies'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter by cookie name',
      },
      {
        displayName: 'Domain',
        name: 'domain',
        type: 'string',
        default: '',
        description: 'Filter by domain',
      },
      {
        displayName: 'Path',
        name: 'path',
        type: 'string',
        default: '',
        description: 'Filter by path',
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        description: 'Filter cookies by URL',
      },
    ],
  },
  {
    displayName: 'Return All Cookies',
    name: 'returnAllCookies',
    type: 'boolean',
    default: true,
    description: 'Whether to return all cookies or filter',
    displayOptions: {
      show: {
        category: ['storage'],
        storageOperation: ['getCookies'],
      },
    },
  },
];