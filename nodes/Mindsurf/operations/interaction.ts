import { INodeProperties } from 'n8n-workflow';

export const interactionOperations: INodeProperties[] = [
  {
    displayName: 'Interaction Operation',
    name: 'interactionOperation',
    type: 'options',
    displayOptions: {
      show: {
        category: ['interaction'],
      },
    },
    options: [
      {
        name: 'Click',
        value: 'click',
        description: 'Click on an element',
      },
      {
        name: 'Double Click',
        value: 'dblclick',
        description: 'Double click on an element',
      },
      {
        name: 'Right Click',
        value: 'rightClick',
        description: 'Right click on an element',
      },
      {
        name: 'Type Text',
        value: 'type',
        description: 'Type text into an element',
      },
      {
        name: 'Fill',
        value: 'fill',
        description: 'Fill an input field',
      },
      {
        name: 'Clear',
        value: 'clear',
        description: 'Clear an input field',
      },
      {
        name: 'Select Option',
        value: 'select',
        description: 'Select option(s) from a dropdown',
      },
      {
        name: 'Check/Uncheck',
        value: 'check',
        description: 'Check or uncheck a checkbox',
      },
      {
        name: 'Hover',
        value: 'hover',
        description: 'Hover over an element',
      },
      {
        name: 'Focus',
        value: 'focus',
        description: 'Focus on an element',
      },
      {
        name: 'Press Key',
        value: 'press',
        description: 'Press a key or key combination',
      },
      {
        name: 'Upload File',
        value: 'upload',
        description: 'Upload a file to an input',
      },
      {
        name: 'Drag and Drop',
        value: 'dragAndDrop',
        description: 'Drag an element and drop it on another',
      },
      {
        name: 'Scroll',
        value: 'scroll',
        description: 'Scroll page or element',
      },
      {
        name: 'Tap',
        value: 'tap',
        description: 'Tap on an element (mobile)',
      },
      {
        name: 'Swipe',
        value: 'swipe',
        description: 'Swipe gesture (mobile)',
      },
    ],
    default: 'click',
  },
  {
    displayName: 'Selector',
    name: 'interactionSelector',
    type: 'string',
    default: '',
    placeholder: '#element-id',
    description: 'CSS selector, text selector, or XPath for the element',
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: [
          'click',
          'dblclick',
          'rightClick',
          'type',
          'fill',
          'clear',
          'select',
          'check',
          'hover',
          'focus',
          'upload',
          'tap',
        ],
      },
    },
  },
  {
    displayName: 'Text',
    name: 'text',
    type: 'string',
    default: '',
    description: 'Text to type or fill',
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: ['type', 'fill'],
      },
    },
  },
  {
    displayName: 'Key',
    name: 'key',
    type: 'string',
    default: '',
    placeholder: 'Enter, Escape, ArrowDown, Control+A',
    description: 'Key or key combination to press',
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: ['press'],
      },
    },
  },
  {
    displayName: 'File Path',
    name: 'filePath',
    type: 'string',
    default: '',
    description: 'Path to the file to upload',
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: ['upload'],
      },
    },
  },
  {
    displayName: 'Select Value',
    name: 'selectValue',
    type: 'string',
    default: '',
    description: 'Value, label, or index to select (comma-separated for multiple)',
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: ['select'],
      },
    },
  },
  {
    displayName: 'Check State',
    name: 'checkState',
    type: 'options',
    options: [
      {
        name: 'Check',
        value: 'check',
      },
      {
        name: 'Uncheck',
        value: 'uncheck',
      },
    ],
    default: 'check',
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: ['check'],
      },
    },
  },
  {
    displayName: 'Source Selector',
    name: 'sourceSelector',
    type: 'string',
    default: '',
    placeholder: '#source-element',
    description: 'Selector for the element to drag',
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: ['dragAndDrop'],
      },
    },
  },
  {
    displayName: 'Target Selector',
    name: 'targetSelector',
    type: 'string',
    default: '',
    placeholder: '#target-element',
    description: 'Selector for the drop target',
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: ['dragAndDrop'],
      },
    },
  },
  {
    displayName: 'Scroll Direction',
    name: 'scrollDirection',
    type: 'options',
    options: [
      {
        name: 'Down',
        value: 'down',
      },
      {
        name: 'Up',
        value: 'up',
      },
      {
        name: 'Left',
        value: 'left',
      },
      {
        name: 'Right',
        value: 'right',
      },
      {
        name: 'To Element',
        value: 'toElement',
      },
    ],
    default: 'down',
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: ['scroll'],
      },
    },
  },
  {
    displayName: 'Scroll Distance',
    name: 'scrollDistance',
    type: 'number',
    default: 100,
    description: 'Distance to scroll in pixels',
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: ['scroll'],
        scrollDirection: ['down', 'up', 'left', 'right'],
      },
    },
  },
  {
    displayName: 'Scroll Target',
    name: 'scrollTarget',
    type: 'string',
    default: '',
    placeholder: '#target-element',
    description: 'Element to scroll to',
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: ['scroll'],
        scrollDirection: ['toElement'],
      },
    },
  },
  {
    displayName: 'Swipe Direction',
    name: 'swipeDirection',
    type: 'options',
    options: [
      {
        name: 'Up',
        value: 'up',
      },
      {
        name: 'Down',
        value: 'down',
      },
      {
        name: 'Left',
        value: 'left',
      },
      {
        name: 'Right',
        value: 'right',
      },
    ],
    default: 'left',
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: ['swipe'],
      },
    },
  },
  {
    displayName: 'Swipe Distance',
    name: 'swipeDistance',
    type: 'number',
    default: 100,
    description: 'Distance to swipe in pixels',
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: ['swipe'],
      },
    },
  },
  {
    displayName: 'Click Options',
    name: 'clickOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: ['click', 'dblclick', 'rightClick'],
      },
    },
    options: [
      {
        displayName: 'Button',
        name: 'button',
        type: 'options',
        options: [
          {
            name: 'Left',
            value: 'left',
          },
          {
            name: 'Right',
            value: 'right',
          },
          {
            name: 'Middle',
            value: 'middle',
          },
        ],
        default: 'left',
        description: 'Which mouse button to use',
      },
      {
        displayName: 'Click Count',
        name: 'clickCount',
        type: 'number',
        default: 1,
        description: 'Number of clicks',
      },
      {
        displayName: 'Delay',
        name: 'delay',
        type: 'number',
        default: 0,
        description: 'Time to wait between mousedown and mouseup in milliseconds',
      },
      {
        displayName: 'Position',
        name: 'position',
        type: 'json',
        default: '',
        placeholder: '{"x": 10, "y": 10}',
        description: 'Click position relative to the element',
      },
      {
        displayName: 'Force Click',
        name: 'force',
        type: 'boolean',
        default: false,
        description: 'Force click even if element is not visible or actionable',
      },
      {
        displayName: 'Trial',
        name: 'trial',
        type: 'boolean',
        default: false,
        description: 'Perform checks without actually clicking',
      },
      {
        displayName: 'Timeout',
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Maximum time to wait for element in milliseconds',
      },
      {
        displayName: 'No Wait After',
        name: 'noWaitAfter',
        type: 'boolean',
        default: false,
        description: 'Do not wait for navigations after click',
      },
      {
        displayName: 'Error Handling',
        name: 'errorHandling',
        type: 'options',
        options: [
          {
            name: 'Throw Error',
            value: 'throw',
            description: 'Throw an error if click fails',
          },
          {
            name: 'Return Failure',
            value: 'soft',
            description: 'Return failure status without throwing error',
          },
          {
            name: 'Retry',
            value: 'retry',
            description: 'Retry clicking with different strategies',
          },
        ],
        default: 'throw',
        description: 'How to handle click failures',
      },
      {
        displayName: 'Retry Count',
        name: 'retryCount',
        type: 'number',
        default: 3,
        description: 'Number of retry attempts',
        displayOptions: {
          show: {
            errorHandling: ['retry'],
          },
        },
      },
      {
        displayName: 'Wait Before Click',
        name: 'waitBeforeClick',
        type: 'number',
        default: 0,
        description: 'Wait time in milliseconds before attempting click',
      },
      {
        displayName: 'Check Visibility',
        name: 'checkVisibility',
        type: 'boolean',
        default: true,
        description: 'Check if element is visible before clicking',
      },
      {
        displayName: 'Check Clickable',
        name: 'checkClickable',
        type: 'boolean',
        default: true,
        description: 'Check if element is clickable (not disabled, not covered)',
      },
      {
        displayName: 'Modifiers',
        name: 'modifiers',
        type: 'multiOptions',
        options: [
          {
            name: 'Alt',
            value: 'Alt',
          },
          {
            name: 'Control',
            value: 'Control',
          },
          {
            name: 'Meta',
            value: 'Meta',
          },
          {
            name: 'Shift',
            value: 'Shift',
          },
        ],
        default: [],
        description: 'Modifier keys to press',
      },
      {
        displayName: 'Force',
        name: 'force',
        type: 'boolean',
        default: false,
        description: 'Whether to bypass actionability checks',
      },
      {
        displayName: 'No Wait After',
        name: 'noWaitAfter',
        type: 'boolean',
        default: false,
        description: 'Whether to wait for navigation after the action',
      },
      {
        displayName: 'Trial',
        name: 'trial',
        type: 'boolean',
        default: false,
        description: 'Whether to perform the action in trial mode',
      },
      {
        displayName: 'Timeout',
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Maximum time to wait for the action in milliseconds',
      },
    ],
  },
  {
    displayName: 'Type Options',
    name: 'typeOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        category: ['interaction'],
        interactionOperation: ['type'],
      },
    },
    options: [
      {
        displayName: 'Delay',
        name: 'delay',
        type: 'number',
        default: 0,
        description: 'Time to wait between key presses in milliseconds',
      },
      {
        displayName: 'Press Key After Typing',
        name: 'pressKeyAfter',
        type: 'options',
        options: [
          {
            name: 'None',
            value: 'none',
          },
          {
            name: 'Enter',
            value: 'Enter',
          },
          {
            name: 'Tab',
            value: 'Tab',
          },
          {
            name: 'Escape',
            value: 'Escape',
          },
        ],
        default: 'none',
        description: 'Press a key after typing the text',
      },
      {
        displayName: 'No Wait After',
        name: 'noWaitAfter',
        type: 'boolean',
        default: false,
        description: 'Whether to wait for navigation after typing',
      },
      {
        displayName: 'Timeout',
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Maximum time to wait for the action in milliseconds',
      },
    ],
  },
];