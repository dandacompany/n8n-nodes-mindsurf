import { INodeProperties } from 'n8n-workflow';

export const screenshotOperations: INodeProperties[] = [
  {
    displayName: 'Screenshot Operation',
    name: 'screenshotOperation',
    type: 'options',
    displayOptions: {
      show: {
        category: ['screenshot'],
      },
    },
    options: [
      {
        name: 'Take Screenshot',
        value: 'screenshot',
        description: 'Capture a screenshot of the page',
      },
      {
        name: 'Take Element Screenshot',
        value: 'elementScreenshot',
        description: 'Capture a screenshot of a specific element',
      },
      {
        name: 'Generate PDF',
        value: 'pdf',
        description: 'Generate a PDF of the page',
      },
    ],
    default: 'screenshot',
  },
  {
    displayName: 'Selector',
    name: 'screenshotSelector',
    type: 'string',
    default: '',
    placeholder: '#element-id',
    description: 'CSS selector for the element to screenshot',
    displayOptions: {
      show: {
        category: ['screenshot'],
        screenshotOperation: ['elementScreenshot'],
      },
    },
  },
  {
    displayName: 'Screenshot Options',
    name: 'screenshotOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        category: ['screenshot'],
        screenshotOperation: ['screenshot', 'elementScreenshot'],
      },
    },
    options: [
      {
        displayName: 'Full Page',
        name: 'fullPage',
        type: 'boolean',
        default: false,
        description: 'Whether to take a screenshot of the full scrollable page',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          {
            name: 'PNG',
            value: 'png',
          },
          {
            name: 'JPEG',
            value: 'jpeg',
          },
        ],
        default: 'png',
        description: 'Screenshot image format',
      },
      {
        displayName: 'Quality',
        name: 'quality',
        type: 'number',
        default: 90,
        description: 'The quality of the image, between 0-100 (only for JPEG)',
        displayOptions: {
          show: {
            type: ['jpeg'],
          },
        },
      },
      {
        displayName: 'Omit Background',
        name: 'omitBackground',
        type: 'boolean',
        default: false,
        description: 'Whether to hide the default white background for transparent screenshots',
      },
      {
        displayName: 'Animations',
        name: 'animations',
        type: 'options',
        options: [
          {
            name: 'Allow',
            value: 'allow',
          },
          {
            name: 'Disabled',
            value: 'disabled',
          },
        ],
        default: 'allow',
        description: 'Control animations behavior',
      },
      {
        displayName: 'Caret',
        name: 'caret',
        type: 'options',
        options: [
          {
            name: 'Hide',
            value: 'hide',
          },
          {
            name: 'Initial',
            value: 'initial',
          },
        ],
        default: 'hide',
        description: 'Control text caret behavior',
      },
      {
        displayName: 'Scale',
        name: 'scale',
        type: 'options',
        options: [
          {
            name: 'CSS',
            value: 'css',
          },
          {
            name: 'Device',
            value: 'device',
          },
        ],
        default: 'device',
        description: 'Screenshot scale',
      },
      {
        displayName: 'Clip',
        name: 'clip',
        type: 'json',
        default: '',
        placeholder: '{"x": 0, "y": 0, "width": 100, "height": 100}',
        description: 'Clip area of the screenshot',
      },
    ],
  },
  {
    displayName: 'PDF Options',
    name: 'pdfOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        category: ['screenshot'],
        screenshotOperation: ['pdf'],
      },
    },
    options: [
      {
        displayName: 'Scale',
        name: 'scale',
        type: 'number',
        default: 1,
        description: 'Scale of the webpage rendering',
      },
      {
        displayName: 'Display Header Footer',
        name: 'displayHeaderFooter',
        type: 'boolean',
        default: false,
        description: 'Whether to display header and footer',
      },
      {
        displayName: 'Header Template',
        name: 'headerTemplate',
        type: 'string',
        default: '',
        description: 'HTML template for the print header',
      },
      {
        displayName: 'Footer Template',
        name: 'footerTemplate',
        type: 'string',
        default: '',
        description: 'HTML template for the print footer',
      },
      {
        displayName: 'Print Background',
        name: 'printBackground',
        type: 'boolean',
        default: false,
        description: 'Whether to print background graphics',
      },
      {
        displayName: 'Landscape',
        name: 'landscape',
        type: 'boolean',
        default: false,
        description: 'Whether to print in landscape orientation',
      },
      {
        displayName: 'Page Ranges',
        name: 'pageRanges',
        type: 'string',
        default: '',
        placeholder: '1-3, 5, 8',
        description: 'Paper ranges to print',
      },
      {
        displayName: 'Format',
        name: 'format',
        type: 'options',
        options: [
          { name: 'Letter', value: 'Letter' },
          { name: 'Legal', value: 'Legal' },
          { name: 'Tabloid', value: 'Tabloid' },
          { name: 'Ledger', value: 'Ledger' },
          { name: 'A0', value: 'A0' },
          { name: 'A1', value: 'A1' },
          { name: 'A2', value: 'A2' },
          { name: 'A3', value: 'A3' },
          { name: 'A4', value: 'A4' },
          { name: 'A5', value: 'A5' },
          { name: 'A6', value: 'A6' },
        ],
        default: 'A4',
        description: 'Paper format',
      },
      {
        displayName: 'Width',
        name: 'width',
        type: 'string',
        default: '',
        placeholder: '8.5in',
        description: 'Paper width',
      },
      {
        displayName: 'Height',
        name: 'height',
        type: 'string',
        default: '',
        placeholder: '11in',
        description: 'Paper height',
      },
      {
        displayName: 'Margin',
        name: 'margin',
        type: 'json',
        default: '',
        placeholder: '{"top": "1cm", "right": "1cm", "bottom": "1cm", "left": "1cm"}',
        description: 'Paper margins',
      },
      {
        displayName: 'Prefer CSS Page Size',
        name: 'preferCSSPageSize',
        type: 'boolean',
        default: false,
        description: 'Whether to prefer page size defined in CSS',
      },
      {
        displayName: 'Outline',
        name: 'outline',
        type: 'boolean',
        default: false,
        description: 'Whether to embed document outline into PDF',
      },
      {
        displayName: 'Tagged',
        name: 'tagged',
        type: 'boolean',
        default: false,
        description: 'Whether to generate tagged (accessible) PDF',
      },
    ],
  },
  {
    displayName: 'Output Property Name',
    name: 'dataPropertyName',
    type: 'string',
    default: 'data',
    description: 'Name of the binary property to store the screenshot/PDF data',
    displayOptions: {
      show: {
        category: ['screenshot'],
      },
    },
  },
];