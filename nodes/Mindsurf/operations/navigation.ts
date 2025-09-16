import { INodeProperties } from 'n8n-workflow';

export const navigationOperations: INodeProperties[] = [
  {
    displayName: 'Navigation Operation',
    name: 'navigationOperation',
    type: 'options',
    displayOptions: {
      show: {
        category: ['navigation'],
      },
    },
    options: [
      {
        name: 'Go To URL',
        value: 'goto',
        description: 'Navigate to a URL',
      },
      {
        name: 'Go Back',
        value: 'back',
        description: 'Navigate back in history',
      },
      {
        name: 'Go Forward',
        value: 'forward',
        description: 'Navigate forward in history',
      },
      {
        name: 'Reload',
        value: 'reload',
        description: 'Reload the current page',
      },
      {
        name: 'Wait for Navigation',
        value: 'waitForNavigation',
        description: 'Wait for navigation to complete',
      },
    ],
    default: 'goto',
  },
  {
    displayName: 'URL',
    name: 'url',
    type: 'string',
    default: 'https://example.com',
    placeholder: 'https://example.com',
    description: 'The URL to navigate to',
    displayOptions: {
      show: {
        category: ['navigation'],
        navigationOperation: ['goto'],
      },
    },
  },
  {
    displayName: 'Wait Until',
    name: 'waitUntil',
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
        description: 'Wait for the DOMContentLoaded event',
      },
      {
        name: 'Network Idle',
        value: 'networkidle',
        description: 'Wait until there are no network connections for at least 500ms',
      },
      {
        name: 'Commit',
        value: 'commit',
        description: 'Wait for the navigation to commit',
      },
    ],
    default: 'load',
    displayOptions: {
      show: {
        category: ['navigation'],
        navigationOperation: ['goto', 'reload', 'waitForNavigation'],
      },
    },
  },
  {
    displayName: 'Timeout',
    name: 'navigationTimeout',
    type: 'number',
    default: 30000,
    description: 'Maximum time to wait for navigation in milliseconds',
    displayOptions: {
      show: {
        category: ['navigation'],
      },
    },
  },
];