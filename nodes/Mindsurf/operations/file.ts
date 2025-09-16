import { INodeProperties } from 'n8n-workflow';

export const fileOperations: INodeProperties[] = [
  {
    displayName: 'File Operation',
    name: 'fileOperation',
    type: 'options',
    displayOptions: {
      show: {
        category: ['file'],
      },
    },
    options: [
      {
        name: 'Upload File',
        value: 'uploadFile',
        description: 'Upload a file to a file input',
      },
      {
        name: 'Download File',
        value: 'downloadFile',
        description: 'Download a file from a link',
      },
      {
        name: 'Handle Download',
        value: 'handleDownload',
        description: 'Handle file download event',
      },
      {
        name: 'Save Download',
        value: 'saveDownload',
        description: 'Save a downloaded file',
      },
      {
        name: 'Set Download Path',
        value: 'setDownloadPath',
        description: 'Set the default download directory',
      },
      {
        name: 'Accept File Chooser',
        value: 'acceptFileChooser',
        description: 'Accept file chooser dialog',
      },
      {
        name: 'Cancel File Chooser',
        value: 'cancelFileChooser',
        description: 'Cancel file chooser dialog',
      },
      {
        name: 'Get Downloads',
        value: 'getDownloads',
        description: 'Get list of downloaded files',
      },
    ],
    default: 'uploadFile',
  },
  {
    displayName: 'File Selector',
    name: 'fileSelector',
    type: 'string',
    default: '',
    placeholder: 'input[type="file"]',
    description: 'Selector for file input element',
    displayOptions: {
      show: {
        category: ['file'],
        fileOperation: ['uploadFile'],
      },
    },
  },
  {
    displayName: 'File Path',
    name: 'uploadFilePath',
    type: 'string',
    default: '',
    description: 'Path to the file to upload',
    displayOptions: {
      show: {
        category: ['file'],
        fileOperation: ['uploadFile', 'acceptFileChooser'],
      },
    },
  },
  {
    displayName: 'Multiple Files',
    name: 'multipleFiles',
    type: 'string',
    default: '',
    placeholder: '/path/file1.txt,/path/file2.txt',
    description: 'Comma-separated paths for multiple files',
    displayOptions: {
      show: {
        category: ['file'],
        fileOperation: ['uploadFile', 'acceptFileChooser'],
      },
    },
  },
  {
    displayName: 'Download URL',
    name: 'downloadUrl',
    type: 'string',
    default: '',
    placeholder: 'https://example.com/file.pdf',
    description: 'URL of the file to download',
    displayOptions: {
      show: {
        category: ['file'],
        fileOperation: ['downloadFile'],
      },
    },
  },
  {
    displayName: 'Download Selector',
    name: 'downloadSelector',
    type: 'string',
    default: '',
    placeholder: 'a[download]',
    description: 'Selector for download link',
    displayOptions: {
      show: {
        category: ['file'],
        fileOperation: ['downloadFile'],
      },
    },
  },
  {
    displayName: 'Download Path',
    name: 'downloadPath',
    type: 'string',
    default: '',
    placeholder: '/path/to/downloads',
    description: 'Directory path for downloads',
    displayOptions: {
      show: {
        category: ['file'],
        fileOperation: ['setDownloadPath', 'saveDownload'],
      },
    },
  },
  {
    displayName: 'File Name',
    name: 'saveFileName',
    type: 'string',
    default: '',
    placeholder: 'document.pdf',
    description: 'Name for the saved file',
    displayOptions: {
      show: {
        category: ['file'],
        fileOperation: ['saveDownload'],
      },
    },
  },
  {
    displayName: 'Download Options',
    name: 'downloadOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        category: ['file'],
        fileOperation: ['downloadFile', 'handleDownload'],
      },
    },
    options: [
      {
        displayName: 'Wait For Download',
        name: 'waitForDownload',
        type: 'boolean',
        default: true,
        description: 'Whether to wait for download to complete',
      },
      {
        displayName: 'Timeout',
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Maximum time to wait for download in milliseconds',
      },
      {
        displayName: 'Save As',
        name: 'saveAs',
        type: 'string',
        default: '',
        description: 'Custom filename for download',
      },
    ],
  },
  {
    displayName: 'File Chooser Options',
    name: 'fileChooserOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        category: ['file'],
        fileOperation: ['acceptFileChooser'],
      },
    },
    options: [
      {
        displayName: 'No Wait After',
        name: 'noWaitAfter',
        type: 'boolean',
        default: false,
        description: 'Whether to wait for navigation after accepting',
      },
      {
        displayName: 'Timeout',
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Maximum time to wait in milliseconds',
      },
    ],
  },
  {
    displayName: 'Download Filter',
    name: 'downloadFilter',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        category: ['file'],
        fileOperation: ['getDownloads'],
      },
    },
    options: [
      {
        displayName: 'Extension',
        name: 'extension',
        type: 'string',
        default: '',
        placeholder: '.pdf',
        description: 'Filter by file extension',
      },
      {
        displayName: 'Name Pattern',
        name: 'namePattern',
        type: 'string',
        default: '',
        placeholder: 'report*',
        description: 'Filter by filename pattern',
      },
      {
        displayName: 'Min Size',
        name: 'minSize',
        type: 'number',
        default: 0,
        description: 'Minimum file size in bytes',
      },
      {
        displayName: 'Max Size',
        name: 'maxSize',
        type: 'number',
        default: 0,
        description: 'Maximum file size in bytes (0 for no limit)',
      },
      {
        displayName: 'Date After',
        name: 'dateAfter',
        type: 'dateTime',
        default: '',
        description: 'Files downloaded after this date',
      },
      {
        displayName: 'Date Before',
        name: 'dateBefore',
        type: 'dateTime',
        default: '',
        description: 'Files downloaded before this date',
      },
    ],
  },
  {
    displayName: 'Return Binary Data',
    name: 'returnBinary',
    type: 'boolean',
    default: false,
    description: 'Whether to return file content as binary data',
    displayOptions: {
      show: {
        category: ['file'],
        fileOperation: ['downloadFile', 'handleDownload', 'saveDownload'],
      },
    },
  },
  {
    displayName: 'Binary Property Name',
    name: 'binaryPropertyName',
    type: 'string',
    default: 'data',
    description: 'Name of the binary property to store file data',
    displayOptions: {
      show: {
        category: ['file'],
        fileOperation: ['downloadFile', 'handleDownload', 'saveDownload'],
        returnBinary: [true],
      },
    },
  },
];