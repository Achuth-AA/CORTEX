import {FilterConfig} from './bug_suggestion_types';

// ==================== PRODUCT AREA LISTS ====================
/**
 * List of all Search product areas.
 */
export const ALL_SEARCH_PRODUCT_AREAS: readonly string[] = [
  'GWS',
  'Search Verticals',
  'Ranking & Eval',
  'Search Features (google.com)',
  'AMP',
  'Discover',
  'Blogger',
  'News',
  'Local Universal',
  'Images Search',
  'Magi',
  'Search on AGSA',
  'Search on iGA',
  'Google Go',
  'Saves & Spaces',
  'Search Notifications',
  'FEBE',
  'Omnient',
  'AIM',
];

/**
 * List of all product areas.
 */
export const ALL_PRODUCT_AREAS: readonly string[] = [
  'Wearables-Watches',
  'AAP',
  'AFF',
  'Assistant Server UO',
  'Assistant on AGSA',
  'MISC (ATR)',
  'Morris',
  'NGA',
  'Wearables-Headsets',
];

// ==================== DROPDOWN OPTIONS ====================
/**
 * List of Assistant component IDs.
 */
export const ASSISTANT_COMPONENT_ID: readonly string[] = [
  'Action On Google (AOG) ',
  'Elaine',
  'Estelle',
];

/**
 * List of Search component IDs.
 */
export const SEARCH_COMPONENT_ID: readonly string[] = ['AMP', 'Blogger', 'GWS'];

/**
 * List of hotlist IDs.
 */
export const HOTLIST_IDS: readonly string[] = [
  'Productivity',
  'Hotword/Connectivity',
  'Communication',
  'Miscellaneous',
];

/**
 * List of bug type options.
 */
export const BUG_TYPE_OPTIONS: readonly string[] = [
  'Bug',
  'Feature Request',
  'Process',
  'Internal Cleanup',
  'Customer Issue',
  'Vulnerability',
  'Privacy Issue',
  'Program',
  'Project',
  'Feature',
  'Milestone',
  'Epic',
  'Story',
  'Task',
];

/**
 * List of priorities.
 */
export const PRIORITIES: readonly string[] = ['P0', 'P1', 'P2', 'P3', 'P4'];
/**
 * List of severities.
 */
export const SEVERITIES: readonly string[] = ['S0', 'S1', 'S2', 'S3', 'S4'];
/**
 * List of advance severities.
 */
export const ADVANCE_SEVERITIES: readonly string[] = [
  'S0',
  'S1',
  'S2',
  'S3',
  'S4',
];

// ==================== FILTER CONFIGURATION ====================
/**
 * Filter configuration for bug suggestions.
 */
export const FILTER_CONFIG: {[productArea: string]: FilterConfig} = {
  'GWS': {
    testingTypes: ['Regression'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['Push Blocker', 'Live Issue', 'Prod Issue', 'Cell Issue'],
    },
    verticals: {
      'Regression': {
        'Push Blocker': ['REG Push Blocker', 'EXP Push Blocker'],
        'Live Issue': ['REG Live Issue', 'EXP Live Issue'],
        'Prod Issue': ['REG Prod Issue', 'EXP Prod Issue'],
        'Cell Issue': ['Cell Issue'],
      },
    },
  },
  'Search Verticals': {
    testingTypes: ['Regression', 'Exploratory', 'New features'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['SV Regression Bug'],
      'Exploratory': ['SV Exploratory Bug'],
      'New features': ['SV New feature Bug'],
    },
    verticals: {
      'Regression': {
        'SV Regression Bug': ['SV Regression Bug', 'Sports bug', 'Finance bug'],
      },
      'Exploratory': {
        'SV Exploratory Bug': [
          'SV Exploratory Bug',
          'Sports bug',
          'Finance bug',
        ],
      },
      'New features': {
        'SV New feature Bug': ['SV NF Bug', 'Sports bug', 'Finance bug'],
      },
    },
  },
  'Ranking & Eval': {
    testingTypes: ['Regression', 'New features'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['Intent Lab'],
      'New features': ['New features'],
    },
    verticals: {
      'Regression': {
        'Intent Lab': [
          'Intent Lab Doc Explorer',
          'Intent Lab Meaning Explorer Tool',
          'Intent Lab Modeling Tool',
          'Intent Lab Query Examples Tool',
          'Intent Lab Workspaces Management Tool',
          'Intent Lab Workspace Review Tool',
          'Intent Lab for Patterngen',
          'RSE (Rich Semantics Editor)',
          'SQ Weekly Reg',
        ],
      },
      'New features': {'New features': []},
    },
  },
  'Search Features (google.com)': {
    testingTypes: ['Regression', 'Exploratory', 'New features'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['Regression'],
      'Exploratory': ['Exploratory'],
      'New features': ['New features'],
    },
    verticals: {
      'Regression': {'Regression': []},
      'Exploratory': {'Exploratory': []},
      'New features': {'New features': []},
    },
  },
  'Search on iGA': {
    testingTypes: ['Regression', 'Exploratory', 'New Features'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['Regression', 'Dogfood'],
      'Exploratory': ['Exploratory'],
      'New Features': ['New Features'],
    },
    verticals: {
      'Regression': {'Regression': [], 'Dogfood': []},
      'Exploratory': {'Exploratory': []},
      'New Features': {'New Features': []},
    },
  },
  'AMP': {
    testingTypes: ['Regression', 'New features'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['Validation/Full test pass', 'Production bug'],
      'New features': ['New features'],
    },
    verticals: {
      'Regression': {'Validation/Full test pass': [], 'Production bug': []},
      'New features': {'New features': []},
    },
  },
  'Discover': {
    testingTypes: ['Regression', 'Exploratory', 'New features', 'GWS'],
    testingOptions: [],
    bugTypes: {
      'Regression': [
        'aGA Regression',
        'iGA Regression',
        'DogFood Regression',
        'Tweed Regression',
        'Jardin Reg',
      ],
      'Exploratory': ['Exploratory'],
      'New features': ['New features'],
      'GWS': ['Discover_GWS'],
    },
    verticals: {
      'Regression': {
        'aGA Regression': [],
        'iGA Regression': [],
        'DogFood Regression': [],
        'Tweed Regression': [],
        'Jardin Reg': [],
      },
      'Exploratory': {'Exploratory': []},
      'New features': {'New features': []},
      'GWS': {'Discover_GWS': []},
    },
  },
  'Blogger': {
    testingTypes: ['Regression', 'Exploratory', 'New features'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['Regression'],
      'Exploratory': ['Exploratory'],
      'New features': ['New features'],
    },
    verticals: {
      'Regression': {'Regression': []},
      'Exploratory': {'Exploratory': []},
      'New features': {'New features': []},
    },
  },
  'News': {
    testingTypes: [
      'Android Client',
      'iOS Client',
      'Desktop/Mobile Splash',
      'Backend',
      'Publisher Center',
    ],
    testingOptions: [],
    bugTypes: {
      'Android Client': ['Android Reg Bugs'],
      'iOS Client': ['iOS Reg Bugs'],
      'Desktop/Mobile Splash': ['News websplash Bugs'],
      'Backend': ['BackendBugs'],
      'Publisher Center': ['PublisherCenter Bugs'],
    },
    verticals: {
      'Android Client': {'Android Reg Bugs': []},
      'iOS Client': {'iOS Reg Bugs': []},
      'Desktop/Mobile Splash': {'News websplash Bugs': []},
      'Backend': {'BackendBugs': []},
      'Publisher Center': {'PublisherCenter Bugs': []},
    },
  },
  'Local Universal': {
    testingTypes: ['Regression', 'New features'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['Regression'],
      'New features': ['New features'],
    },
    verticals: {
      'Regression': {'Regression': []},
      'New features': {'New features': []},
    },
  },
  'Images Search': {
    testingTypes: ['Regression', 'Exploratory'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['Regression'],
      'Exploratory': ['Exploratory'],
    },
    verticals: {
      'Regression': {'Regression': ['Multi search', 'Image viewer']},
      'Exploratory': {'Exploratory': ['Multi search', 'Image viewer']},
    },
  },
  'Magi': {
    testingTypes: ['Regression', 'Exploratory', 'New features'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['Regression'],
      'Exploratory': ['Exploratory'],
      'New features': ['New features'],
    },
    verticals: {
      'Regression': {'Regression': []},
      'Exploratory': {'Exploratory': []},
      'New features': {'New features': []},
    },
  },
  'Search on AGSA': {
    testingTypes: ['Regression', 'Exploratory', 'New features'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['Regression'],
      'Exploratory': ['Exploratory'],
      'New features': ['New features'],
    },
    verticals: {
      'Regression': {'Regression': []},
      'Exploratory': {'Exploratory': []},
      'New features': {'New features': []},
    },
  },
  'Google Go': {
    testingTypes: ['Regression', 'Exploratory', 'New features'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['Regression'],
      'Exploratory': ['Exploratory'],
      'New features': ['New features'],
    },
    verticals: {
      'Regression': {'Regression': []},
      'Exploratory': {'Exploratory': []},
      'New features': {'New features': []},
    },
  },
  'Saves & Spaces': {
    testingTypes: ['Regression', 'Exploratory', 'New features'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['Regression'],
      'Exploratory': ['Exploratory'],
      'New features': ['New features'],
    },
    verticals: {
      'Regression': {'Regression': []},
      'Exploratory': {'Exploratory': []},
      'New features': {'New features': []},
    },
  },
  'Search Notifications': {
    testingTypes: [
      'Regression aGA',
      'Regression iGA',
      'Exploratory aGA',
      'Exploratory iGA',
      'New features',
    ],
    testingOptions: [],
    bugTypes: {
      'Regression aGA': ['Regression'],
      'Regression iGA': ['Regression'],
      'Exploratory aGA': ['Exploratory'],
      'Exploratory iGA': ['Exploratory'],
      'New features': ['New features'],
    },
    verticals: {
      'Regression aGA': {'Regression': []},
      'Regression iGA': {'Regression': []},
      'Exploratory aGA': {'Exploratory': []},
      'Exploratory iGA': {'Exploratory': []},
      'New features': {'New features': []},
    },
  },
  'FEBE': {
    testingTypes: ['Regression', 'Exploratory', 'New features'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['Regression'],
      'Exploratory': ['Exploratory'],
      'New features': ['New features'],
    },
    verticals: {
      'Regression': {'Regression': []},
      'Exploratory': {'Exploratory': []},
      'New features': {'New features': []},
    },
  },
  'Omnient': {
    testingTypes: ['Regression', 'Exploratory', 'New features'],
    testingOptions: [],
    bugTypes: {
      'Regression': ['Regression'],
      'Exploratory': ['Exploratory'],
      'New features': ['New features'],
    },
    verticals: {
      'Regression': {'Regression': []},
      'Exploratory': {'Exploratory': []},
      'New features': {'New features': []},
    },
  },
  'AIM': {
    testingTypes: ['Regression', 'Exploratory', 'New features'],
    testingOptions: ['en-US'],
    bugTypes: {
      'Regression': ['Blocker', 'Live bug'],
      'Exploratory': ['Blocker', 'Live bug'],
      'New features': ['NF Bug'],
    },
    verticals: {
      'Regression': {'Blocker': [], 'Live bug': []},
      'Exploratory': {'Blocker': [], 'Live bug': []},
      'New features': {'NF Bug': []},
    },
  },
};
