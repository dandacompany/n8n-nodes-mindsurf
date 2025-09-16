import { INodeProperties } from 'n8n-workflow';

export const waitOperations: INodeProperties[] = [
  {
    displayName: 'Wait Operation',
    name: 'waitOperation',
    type: 'options',
    displayOptions: {
      show: {
        category: ['wait'],
      },
    },
    options: [
      {
        name: 'Wait for Selector',
        value: 'waitForSelector',
        description: 'Wait for an element to appear',
      },
      {
        name: 'Wait for Load State',
        value: 'waitForLoadState',
        description: 'Wait for page load state',
      },
      {
        name: 'Wait for Function',
        value: 'waitForFunction',
        description: 'Wait for a JavaScript function to return true',
      },
      {
        name: 'Wait for Timeout',
        value: 'waitForTimeout',
        description: 'Wait for a specified amount of time',
      },
      {
        name: 'Wait for Request',
        value: 'waitForRequest',
        description: 'Wait for a network request',
      },
      {
        name: 'Wait for Response',
        value: 'waitForResponse',
        description: 'Wait for a network response',
      },
      {
        name: 'Wait for Event',
        value: 'waitForEvent',
        description: 'Wait for a page event',
      },
      {
        name: 'Wait for File Chooser',
        value: 'waitForFileChooser',
        description: 'Wait for file chooser dialog',
      },
      {
        name: 'Wait for Popup',
        value: 'waitForPopup',
        description: 'Wait for a popup window',
      },
      {
        name: 'Wait for Download',
        value: 'waitForDownload',
        description: 'Wait for a download to start',
      },
    ],
    default: 'waitForSelector',
  },
  {
    displayName: 'Selector',
    name: 'waitSelector',
    type: 'string',
    default: '',
    placeholder: '#element-id',
    description: 'CSS selector to wait for',
    displayOptions: {
      show: {
        category: ['wait'],
        waitOperation: ['waitForSelector'],
      },
    },
  },
  {
    displayName: 'State',
    name: 'waitState',
    type: 'options',
    options: [
      {
        name: 'Attached',
        value: 'attached',
        description: 'Element is present in DOM',
      },
      {
        name: 'Detached',
        value: 'detached',
        description: 'Element is not present in DOM',
      },
      {
        name: 'Visible',
        value: 'visible',
        description: 'Element is visible',
      },
      {
        name: 'Hidden',
        value: 'hidden',
        description: 'Element is hidden',
      },
    ],
    default: 'visible',
    displayOptions: {
      show: {
        category: ['wait'],
        waitOperation: ['waitForSelector'],
      },
    },
  },
  {
    displayName: 'Load State',
    name: 'loadState',
    type: 'options',
    options: [
      {
        name: 'Load',
        value: 'load',
        description: 'Wait for the load event',
      },
      {
        name: 'DOM Content Loaded',
        value: 'domcontentloaded',
        description: 'Wait for DOMContentLoaded event',
      },
      {
        name: 'Network Idle',
        value: 'networkidle',
        description: 'Wait until there are no network connections',
      },
    ],
    default: 'load',
    displayOptions: {
      show: {
        category: ['wait'],
        waitOperation: ['waitForLoadState'],
      },
    },
  },
  {
    displayName: 'Function',
    name: 'waitFunction',
    type: 'string',
    typeOptions: {
      rows: 5,
    },
    default: '',
    placeholder: 'return document.querySelector("#element") !== null',
    description: 'JavaScript function to evaluate',
    displayOptions: {
      show: {
        category: ['wait'],
        waitOperation: ['waitForFunction'],
      },
    },
  },
  {
    displayName: 'Delay',
    name: 'delay',
    type: 'number',
    default: 1000,
    description: 'Time to wait in milliseconds',
    displayOptions: {
      show: {
        category: ['wait'],
        waitOperation: ['waitForTimeout'],
      },
    },
  },
  {
    displayName: 'URL Pattern',
    name: 'urlPattern',
    type: 'string',
    default: '',
    placeholder: '**/api/**',
    description: 'URL pattern to match (glob or regex)',
    displayOptions: {
      show: {
        category: ['wait'],
        waitOperation: ['waitForRequest', 'waitForResponse'],
      },
    },
  },
  {
    displayName: 'Predicate Function',
    name: 'predicateFunction',
    type: 'string',
    typeOptions: {
      rows: 5,
    },
    default: '',
    placeholder: 'return request.url().includes("api")',
    description: 'Function to match request/response',
    displayOptions: {
      show: {
        category: ['wait'],
        waitOperation: ['waitForRequest', 'waitForResponse'],
      },
    },
  },
  {
    displayName: 'Event Name',
    name: 'eventName',
    type: 'options',
    options: [
      {
        name: 'Close',
        value: 'close',
      },
      {
        name: 'Console',
        value: 'console',
      },
      {
        name: 'Dialog',
        value: 'dialog',
      },
      {
        name: 'Download',
        value: 'download',
      },
      {
        name: 'File Chooser',
        value: 'filechooser',
      },
      {
        name: 'Frame Attached',
        value: 'frameattached',
      },
      {
        name: 'Frame Detached',
        value: 'framedetached',
      },
      {
        name: 'Frame Navigated',
        value: 'framenavigated',
      },
      {
        name: 'Load',
        value: 'load',
      },
      {
        name: 'Page Error',
        value: 'pageerror',
      },
      {
        name: 'Popup',
        value: 'popup',
      },
      {
        name: 'Request',
        value: 'request',
      },
      {
        name: 'Request Failed',
        value: 'requestfailed',
      },
      {
        name: 'Request Finished',
        value: 'requestfinished',
      },
      {
        name: 'Response',
        value: 'response',
      },
      {
        name: 'Worker',
        value: 'worker',
      },
    ],
    default: 'load',
    displayOptions: {
      show: {
        category: ['wait'],
        waitOperation: ['waitForEvent'],
      },
    },
  },
  {
    displayName: 'Polling',
    name: 'waitPolling',
    type: 'options',
    options: [
      {
        name: 'RAF (Request Animation Frame)',
        value: 'raf',
      },
      {
        name: 'Mutation',
        value: 'mutation',
      },
      {
        name: 'Interval',
        value: 'interval',
      },
    ],
    default: 'raf',
    displayOptions: {
      show: {
        category: ['wait'],
        waitOperation: ['waitForFunction'],
      },
    },
  },
  {
    displayName: 'Polling Interval',
    name: 'waitPollingInterval',
    type: 'number',
    default: 100,
    description: 'Polling interval in milliseconds',
    displayOptions: {
      show: {
        category: ['wait'],
        waitOperation: ['waitForFunction'],
        waitPolling: ['interval'],
      },
    },
  },
  {
    displayName: 'Timeout',
    name: 'waitTimeout',
    type: 'number',
    default: 30000,
    description: 'Maximum time to wait in milliseconds',
    displayOptions: {
      show: {
        category: ['wait'],
        waitOperation: [
          'waitForSelector',
          'waitForLoadState',
          'waitForFunction',
          'waitForRequest',
          'waitForResponse',
          'waitForEvent',
          'waitForFileChooser',
          'waitForPopup',
          'waitForDownload',
        ],
      },
    },
  },
  {
    displayName: 'Strict',
    name: 'strict',
    type: 'boolean',
    default: false,
    description: 'Whether to throw when multiple elements match the selector',
    displayOptions: {
      show: {
        category: ['wait'],
        waitOperation: ['waitForSelector'],
      },
    },
  },
];