import { INodeProperties } from 'n8n-workflow';

export const accessibilityOperations: INodeProperties[] = [
  {
    displayName: 'Accessibility Operation',
    name: 'accessibilityOperation',
    type: 'options',
    displayOptions: {
      show: {
        category: ['accessibility'],
      },
    },
    options: [
      {
        name: 'Get Accessibility Tree',
        value: 'getAccessibilityTree',
        description: 'Get the accessibility tree of the page',
      },
      {
        name: 'Get Accessibility Snapshot',
        value: 'getAccessibilitySnapshot',
        description: 'Get accessibility snapshot',
      },
      {
        name: 'Check Element Role',
        value: 'checkRole',
        description: 'Check the ARIA role of an element',
      },
      {
        name: 'Check Element Label',
        value: 'checkLabel',
        description: 'Check the accessible label of an element',
      },
      {
        name: 'Run Accessibility Audit',
        value: 'runAudit',
        description: 'Run accessibility audit on the page',
      },
      {
        name: 'Get ARIA Attributes',
        value: 'getAriaAttributes',
        description: 'Get ARIA attributes of an element',
      },
      {
        name: 'Check Keyboard Navigation',
        value: 'checkKeyboardNav',
        description: 'Check keyboard navigation support',
      },
      {
        name: 'Get Focus Order',
        value: 'getFocusOrder',
        description: 'Get the tab focus order of elements',
      },
    ],
    default: 'getAccessibilityTree',
  },
  {
    displayName: 'Selector',
    name: 'accessibilitySelector',
    type: 'string',
    default: '',
    placeholder: '#element-id',
    description: 'CSS selector for the element',
    displayOptions: {
      show: {
        category: ['accessibility'],
        accessibilityOperation: [
          'checkRole',
          'checkLabel',
          'getAriaAttributes',
        ],
      },
    },
  },
  {
    displayName: 'Include Children',
    name: 'includeChildren',
    type: 'boolean',
    default: true,
    description: 'Whether to include children in the accessibility tree',
    displayOptions: {
      show: {
        category: ['accessibility'],
        accessibilityOperation: ['getAccessibilityTree', 'getAccessibilitySnapshot'],
      },
    },
  },
  {
    displayName: 'Interesting Only',
    name: 'interestingOnly',
    type: 'boolean',
    default: true,
    description: 'Whether to only include interesting nodes',
    displayOptions: {
      show: {
        category: ['accessibility'],
        accessibilityOperation: ['getAccessibilitySnapshot'],
      },
    },
  },
  {
    displayName: 'Root Selector',
    name: 'rootSelector',
    type: 'string',
    default: '',
    placeholder: 'body',
    description: 'Root element for accessibility tree',
    displayOptions: {
      show: {
        category: ['accessibility'],
        accessibilityOperation: ['getAccessibilityTree', 'getAccessibilitySnapshot'],
      },
    },
  },
  {
    displayName: 'Audit Options',
    name: 'auditOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        category: ['accessibility'],
        accessibilityOperation: ['runAudit'],
      },
    },
    options: [
      {
        displayName: 'Include Warnings',
        name: 'includeWarnings',
        type: 'boolean',
        default: true,
        description: 'Whether to include warnings in audit',
      },
      {
        displayName: 'Include Notices',
        name: 'includeNotices',
        type: 'boolean',
        default: false,
        description: 'Whether to include notices in audit',
      },
      {
        displayName: 'Standards',
        name: 'standards',
        type: 'multiOptions',
        options: [
          { name: 'WCAG 2.0 Level A', value: 'WCAG2A' },
          { name: 'WCAG 2.0 Level AA', value: 'WCAG2AA' },
          { name: 'WCAG 2.0 Level AAA', value: 'WCAG2AAA' },
          { name: 'WCAG 2.1 Level A', value: 'WCAG21A' },
          { name: 'WCAG 2.1 Level AA', value: 'WCAG21AA' },
          { name: 'WCAG 2.1 Level AAA', value: 'WCAG21AAA' },
          { name: 'Section 508', value: 'Section508' },
        ],
        default: ['WCAG2AA'],
        description: 'Accessibility standards to check against',
      },
      {
        displayName: 'Ignore Rules',
        name: 'ignoreRules',
        type: 'string',
        default: '',
        placeholder: 'color-contrast,duplicate-id',
        description: 'Comma-separated list of rules to ignore',
      },
    ],
  },
  {
    displayName: 'Focus Test',
    name: 'focusTest',
    type: 'collection',
    placeholder: 'Add Test',
    default: {},
    displayOptions: {
      show: {
        category: ['accessibility'],
        accessibilityOperation: ['checkKeyboardNav', 'getFocusOrder'],
      },
    },
    options: [
      {
        displayName: 'Test Tab Navigation',
        name: 'testTab',
        type: 'boolean',
        default: true,
        description: 'Whether to test tab key navigation',
      },
      {
        displayName: 'Test Arrow Keys',
        name: 'testArrows',
        type: 'boolean',
        default: false,
        description: 'Whether to test arrow key navigation',
      },
      {
        displayName: 'Test Enter Key',
        name: 'testEnter',
        type: 'boolean',
        default: true,
        description: 'Whether to test enter key activation',
      },
      {
        displayName: 'Test Escape Key',
        name: 'testEscape',
        type: 'boolean',
        default: true,
        description: 'Whether to test escape key behavior',
      },
      {
        displayName: 'Max Elements',
        name: 'maxElements',
        type: 'number',
        default: 50,
        description: 'Maximum number of elements to test',
      },
    ],
  },
  {
    displayName: 'Return Format',
    name: 'accessibilityFormat',
    type: 'options',
    options: [
      {
        name: 'JSON',
        value: 'json',
      },
      {
        name: 'HTML Report',
        value: 'html',
      },
      {
        name: 'Plain Text',
        value: 'text',
      },
      {
        name: 'CSV',
        value: 'csv',
      },
    ],
    default: 'json',
    description: 'Format for audit results',
    displayOptions: {
      show: {
        category: ['accessibility'],
        accessibilityOperation: ['runAudit'],
      },
    },
  },
];