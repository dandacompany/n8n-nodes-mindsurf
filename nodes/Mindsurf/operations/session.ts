import { INodeProperties } from 'n8n-workflow';

export const sessionOperations: INodeProperties[] = [
  {
    displayName: 'Session Operation',
    name: 'sessionOperation',
    type: 'options',
    displayOptions: {
      show: {
        category: ['session'],
      },
    },
    options: [
      {
        name: 'Save Login Session',
        value: 'saveSession',
        description: 'Save current browser session with login state (cookies, localStorage)',
      },
      {
        name: 'Load Login Session',
        value: 'loadSession',
        description: 'Load a saved session to restore login state',
      },
      {
        name: 'List Saved Sessions',
        value: 'listSavedSessions',
        description: 'List all saved login sessions',
      },
      {
        name: 'Delete Saved Session',
        value: 'deleteSavedSession',
        description: 'Delete a saved login session',
      },
      {
        name: 'Close Session',
        value: 'closeSession',
        description: 'Close a specific browser session',
      },
      {
        name: 'Close All Sessions',
        value: 'closeAllSessions',
        description: 'Close all active browser sessions',
      },
      {
        name: 'List Active Sessions',
        value: 'listSessions',
        description: 'List all active browser sessions',
      },
      {
        name: 'Cleanup All',
        value: 'cleanupAll',
        description: 'Close all sessions and browsers, clean up resources',
      },
    ],
    default: 'saveSession',
    description: 'The session management operation to perform',
  },
  // Save Session Fields
  {
    displayName: 'Profile Name',
    name: 'profileName',
    type: 'string',
    default: '',
    placeholder: 'e.g. Gmail Account, Facebook Login',
    description: 'Name to identify this saved session',
    required: true,
    displayOptions: {
      show: {
        category: ['session'],
        sessionOperation: ['saveSession'],
      },
    },
  },
  {
    displayName: 'Profile Description',
    name: 'profileDescription',
    type: 'string',
    typeOptions: {
      rows: 3,
    },
    default: '',
    placeholder: 'e.g. Personal Gmail account with 2FA enabled',
    description: 'Optional description for this session',
    displayOptions: {
      show: {
        category: ['session'],
        sessionOperation: ['saveSession'],
      },
    },
  },
  {
    displayName: 'Overwrite Existing',
    name: 'overwriteExisting',
    type: 'boolean',
    default: false,
    description: 'Whether to overwrite if a profile with the same name exists',
    displayOptions: {
      show: {
        category: ['session'],
        sessionOperation: ['saveSession'],
      },
    },
  },
  
  // Load Session Fields
  {
    displayName: 'Profile to Load',
    name: 'profileId',
    type: 'string',
    default: '',
    placeholder: 'Select or enter profile ID',
    description: 'The saved session profile to load',
    required: true,
    displayOptions: {
      show: {
        category: ['session'],
        sessionOperation: ['loadSession'],
      },
    },
  },
  {
    displayName: 'Create New Session',
    name: 'createNewSession',
    type: 'boolean',
    default: true,
    description: 'Whether to create a new session ID when loading the profile',
    displayOptions: {
      show: {
        category: ['session'],
        sessionOperation: ['loadSession'],
      },
    },
  },
  
  // Delete Session Fields
  {
    displayName: 'Profile to Delete',
    name: 'profileToDelete',
    type: 'string',
    default: '',
    placeholder: 'Select or enter profile ID',
    description: 'The saved session profile to delete',
    required: true,
    displayOptions: {
      show: {
        category: ['session'],
        sessionOperation: ['deleteSavedSession'],
      },
    },
  },
  
  // Original fields
  {
    displayName: 'Session ID',
    name: 'targetSessionId',
    type: 'string',
    default: '={{ $json.sessionId }}',
    placeholder: 'session_123456',
    description: 'The session ID to close (leave empty to close current session)',
    displayOptions: {
      show: {
        category: ['session'],
        sessionOperation: ['closeSession'],
      },
    },
  },
  {
    displayName: 'Close Browser',
    name: 'closeBrowser',
    type: 'boolean',
    default: false,
    description: 'Whether to also close the browser (not just the context)',
    displayOptions: {
      show: {
        category: ['session'],
        sessionOperation: ['closeSession', 'closeAllSessions'],
      },
    },
  },
];