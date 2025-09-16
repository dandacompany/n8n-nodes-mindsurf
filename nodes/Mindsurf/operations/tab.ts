import { INodeProperties } from 'n8n-workflow';

export const tabOperations: INodeProperties[] = [
  {
    displayName: 'Tab Operation',
    name: 'tabOperation',
    type: 'options',
    displayOptions: {
      show: {
        category: ['tab'],
      },
    },
    options: [
      {
        name: 'New Tab',
        value: 'newTab',
        description: 'Open a new tab',
      },
      {
        name: 'Close Tab',
        value: 'closeTab',
        description: 'Close current or specific tab',
      },
      {
        name: 'Switch Tab',
        value: 'switchTab',
        description: 'Switch to a specific tab',
      },
      {
        name: 'Get Tabs',
        value: 'getTabs',
        description: 'Get all open tabs',
      },
      {
        name: 'Bring to Front',
        value: 'bringToFront',
        description: 'Bring tab to front',
      },
      {
        name: 'New Window',
        value: 'newWindow',
        description: 'Open a new browser window',
      },
      {
        name: 'Close Window',
        value: 'closeWindow',
        description: 'Close browser window',
      },
      {
        name: 'Get Windows',
        value: 'getWindows',
        description: 'Get all browser windows',
      },
      {
        name: 'Minimize Window',
        value: 'minimizeWindow',
        description: 'Minimize browser window',
      },
      {
        name: 'Maximize Window',
        value: 'maximizeWindow',
        description: 'Maximize browser window',
      },
      {
        name: 'Fullscreen',
        value: 'fullscreen',
        description: 'Enter or exit fullscreen mode',
      },
      {
        name: 'Set Window Bounds',
        value: 'setWindowBounds',
        description: 'Set window position and size',
      },
    ],
    default: 'newTab',
  },
  {
    displayName: 'URL',
    name: 'tabUrl',
    type: 'string',
    default: '',
    placeholder: 'https://example.com',
    description: 'URL to open in new tab/window',
    displayOptions: {
      show: {
        category: ['tab'],
        tabOperation: ['newTab', 'newWindow'],
      },
    },
  },
  {
    displayName: 'Tab Index',
    name: 'tabIndex',
    type: 'number',
    default: 0,
    description: 'Index of the tab (0-based)',
    displayOptions: {
      show: {
        category: ['tab'],
        tabOperation: ['switchTab', 'closeTab'],
      },
    },
  },
  {
    displayName: 'Tab ID',
    name: 'tabId',
    type: 'string',
    default: '',
    description: 'ID of the tab',
    displayOptions: {
      show: {
        category: ['tab'],
        tabOperation: ['switchTab', 'closeTab', 'bringToFront'],
      },
    },
  },
  {
    displayName: 'Use Current Tab',
    name: 'useCurrentTab',
    type: 'boolean',
    default: true,
    description: 'Whether to use the current active tab',
    displayOptions: {
      show: {
        category: ['tab'],
        tabOperation: ['closeTab', 'bringToFront'],
      },
    },
  },
  {
    displayName: 'Window Options',
    name: 'windowOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        category: ['tab'],
        tabOperation: ['newWindow'],
      },
    },
    options: [
      {
        displayName: 'Width',
        name: 'width',
        type: 'number',
        default: 1280,
        description: 'Window width in pixels',
      },
      {
        displayName: 'Height',
        name: 'height',
        type: 'number',
        default: 720,
        description: 'Window height in pixels',
      },
      {
        displayName: 'Left',
        name: 'left',
        type: 'number',
        default: 0,
        description: 'Window left position',
      },
      {
        displayName: 'Top',
        name: 'top',
        type: 'number',
        default: 0,
        description: 'Window top position',
      },
      {
        displayName: 'Incognito',
        name: 'incognito',
        type: 'boolean',
        default: false,
        description: 'Whether to open in incognito mode',
      },
    ],
  },
  {
    displayName: 'Window Bounds',
    name: 'windowBounds',
    type: 'collection',
    placeholder: 'Add Bounds',
    default: {},
    displayOptions: {
      show: {
        category: ['tab'],
        tabOperation: ['setWindowBounds'],
      },
    },
    options: [
      {
        displayName: 'Width',
        name: 'width',
        type: 'number',
        default: 1280,
        description: 'Window width in pixels',
      },
      {
        displayName: 'Height',
        name: 'height',
        type: 'number',
        default: 720,
        description: 'Window height in pixels',
      },
      {
        displayName: 'Left',
        name: 'left',
        type: 'number',
        default: 0,
        description: 'Window left position',
      },
      {
        displayName: 'Top',
        name: 'top',
        type: 'number',
        default: 0,
        description: 'Window top position',
      },
    ],
  },
  {
    displayName: 'Fullscreen Mode',
    name: 'fullscreenMode',
    type: 'options',
    options: [
      {
        name: 'Enter',
        value: 'enter',
      },
      {
        name: 'Exit',
        value: 'exit',
      },
      {
        name: 'Toggle',
        value: 'toggle',
      },
    ],
    default: 'enter',
    displayOptions: {
      show: {
        category: ['tab'],
        tabOperation: ['fullscreen'],
      },
    },
  },
  {
    displayName: 'Tab Options',
    name: 'tabOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        category: ['tab'],
        tabOperation: ['newTab'],
      },
    },
    options: [
      {
        displayName: 'Wait Until',
        name: 'waitUntil',
        type: 'options',
        options: [
          { name: 'Load', value: 'load' },
          { name: 'DOM Content Loaded', value: 'domcontentloaded' },
          { name: 'Network Idle', value: 'networkidle' },
          { name: 'Commit', value: 'commit' },
        ],
        default: 'load',
        description: 'When to consider navigation succeeded',
      },
      {
        displayName: 'Timeout',
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Maximum time to wait in milliseconds',
      },
      {
        displayName: 'Background',
        name: 'background',
        type: 'boolean',
        default: false,
        description: 'Whether to open tab in background',
      },
    ],
  },
  {
    displayName: 'Include Info',
    name: 'includeInfo',
    type: 'multiOptions',
    options: [
      { name: 'URL', value: 'url' },
      { name: 'Title', value: 'title' },
      { name: 'ID', value: 'id' },
      { name: 'Index', value: 'index' },
      { name: 'Active', value: 'active' },
      { name: 'Viewport', value: 'viewport' },
    ],
    default: ['url', 'title', 'id'],
    description: 'Information to include about tabs',
    displayOptions: {
      show: {
        category: ['tab'],
        tabOperation: ['getTabs', 'getWindows'],
      },
    },
  },
  {
    displayName: 'Force Close',
    name: 'forceClose',
    type: 'boolean',
    default: false,
    description: 'Whether to force close without waiting for beforeunload',
    displayOptions: {
      show: {
        category: ['tab'],
        tabOperation: ['closeTab', 'closeWindow'],
      },
    },
  },
];