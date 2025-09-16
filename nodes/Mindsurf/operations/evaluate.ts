import { INodeProperties } from 'n8n-workflow';

export const evaluateOperations: INodeProperties[] = [
  {
    displayName: 'Evaluate Operation',
    name: 'evaluateOperation',
    type: 'options',
    displayOptions: {
      show: {
        category: ['evaluate'],
      },
    },
    options: [
      {
        name: 'Evaluate JavaScript',
        value: 'evaluate',
        description: 'Execute JavaScript in the page context',
      },
      {
        name: 'Evaluate Handle',
        value: 'evaluateHandle',
        description: 'Execute JavaScript and return a handle to the result',
      },
      {
        name: 'Get Element Text',
        value: 'getText',
        description: 'Get text content of an element',
      },
      {
        name: 'Get Element Attribute',
        value: 'getAttribute',
        description: 'Get attribute value of an element',
      },
      {
        name: 'Get Element Property',
        value: 'getProperty',
        description: 'Get property value of an element',
      },
      {
        name: 'Get Element',
        value: 'getElement',
        description: 'Get element details including full selector path and HTML',
      },
      {
        name: 'Get Page Content',
        value: 'getContent',
        description: 'Get the full HTML content of the page',
      },
      {
        name: 'Get URL',
        value: 'getUrl',
        description: 'Get the current page URL',
      },
      {
        name: 'Get Title',
        value: 'getTitle',
        description: 'Get the page title',
      },
      {
        name: 'Count Elements',
        value: 'count',
        description: 'Count elements matching a selector',
      },
      {
        name: 'Element Exists',
        value: 'exists',
        description: 'Check if an element exists',
      },
      {
        name: 'Element Visible',
        value: 'isVisible',
        description: 'Check if an element is visible',
      },
      {
        name: 'Element Enabled',
        value: 'isEnabled',
        description: 'Check if an element is enabled',
      },
      {
        name: 'Element Checked',
        value: 'isChecked',
        description: 'Check if a checkbox/radio is checked',
      },
    ],
    default: 'evaluate',
  },
  {
    displayName: 'JavaScript Code',
    name: 'code',
    type: 'string',
    typeOptions: {
      rows: 10,
    },
    default: '',
    placeholder: 'return document.title',
    description: 'JavaScript code to execute in the page context',
    displayOptions: {
      show: {
        category: ['evaluate'],
        evaluateOperation: ['evaluate', 'evaluateHandle'],
      },
    },
  },
  {
    displayName: 'Selector',
    name: 'evaluateSelector',
    type: 'string',
    default: '',
    placeholder: '#element-id',
    description: 'CSS selector for the element',
    displayOptions: {
      show: {
        category: ['evaluate'],
        evaluateOperation: [
          'getText',
          'getAttribute',
          'getProperty',
          'getElement',
          'count',
          'exists',
          'isVisible',
          'isEnabled',
          'isChecked',
        ],
      },
    },
  },
  {
    displayName: 'Attribute Name',
    name: 'attributeName',
    type: 'string',
    default: '',
    placeholder: 'href',
    description: 'Name of the attribute to get',
    displayOptions: {
      show: {
        category: ['evaluate'],
        evaluateOperation: ['getAttribute'],
      },
    },
  },
  {
    displayName: 'Property Name',
    name: 'propertyName',
    type: 'string',
    default: '',
    placeholder: 'value',
    description: 'Name of the property to get',
    displayOptions: {
      show: {
        category: ['evaluate'],
        evaluateOperation: ['getProperty'],
      },
    },
  },
  {
    displayName: 'Arguments',
    name: 'evaluateArgs',
    type: 'json',
    default: '',
    placeholder: '["arg1", "arg2"]',
    description: 'Arguments to pass to the JavaScript function',
    displayOptions: {
      show: {
        category: ['evaluate'],
        evaluateOperation: ['evaluate', 'evaluateHandle'],
      },
    },
  },
  {
    displayName: 'Polling',
    name: 'polling',
    type: 'options',
    options: [
      {
        name: 'None',
        value: 'none',
      },
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
    default: 'none',
    description: 'Polling method for waiting',
    displayOptions: {
      show: {
        category: ['evaluate'],
        evaluateOperation: ['evaluate'],
      },
    },
  },
  {
    displayName: 'Polling Interval',
    name: 'pollingInterval',
    type: 'number',
    default: 100,
    description: 'Polling interval in milliseconds',
    displayOptions: {
      show: {
        category: ['evaluate'],
        polling: ['interval'],
      },
    },
  },
  {
    displayName: 'Timeout',
    name: 'evaluateTimeout',
    type: 'number',
    default: 30000,
    description: 'Maximum time to wait in milliseconds',
    displayOptions: {
      show: {
        category: ['evaluate'],
      },
    },
  },
  {
    displayName: 'Extract Options',
    name: 'extractOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        category: ['evaluate'],
        evaluateOperation: ['getText', 'getAttribute', 'getProperty', 'getElement', 'isVisible', 'isEnabled', 'isChecked'],
      },
    },
    options: [
      {
        displayName: 'Extract All',
        name: 'all',
        type: 'boolean',
        default: false,
        description: 'Extract from all matching elements instead of just the first one',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 100,
        description: 'Maximum number of elements to extract when extracting all',
      },
      {
        displayName: 'Include Selector',
        name: 'includeSelector',
        type: 'boolean',
        default: false,
        description: 'Include the selector or ID of each element in the result',
      },
      {
        displayName: 'Selector Path Strategy',
        name: 'selectorStrategy',
        type: 'options',
        default: 'attributes',
        description: 'Strategy for generating selector paths (getElement only)',
        options: [
          {
            name: 'Attributes First',
            value: 'attributes',
            description: 'Use attributes (name, data-*, aria-label) before nth-child',
          },
          {
            name: 'Minimal',
            value: 'minimal',
            description: 'Use shortest possible selector',
          },
          {
            name: 'Full Path',
            value: 'full',
            description: 'Always include full path from root',
          },
        ],
      },
    ],
  },
];