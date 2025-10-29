// ELECTRON SECURITY HARDENING CONFIGURATION
// This file documents all security measures implemented in the StickyNotes app

module.exports = {
  // Context Isolation Enforcement
  contextIsolation: {
    enabled: true,
    description: 'Ensures complete isolation between main world and isolated world contexts',
    implementation: 'webPreferences.contextIsolation: true'
  },

  // Node Integration Restrictions
  nodeIntegration: {
    main: false,
    worker: false,
    subFrames: false,
    description: 'Completely disables Node.js APIs in renderer processes',
    implementation: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false
    }
  },

  // Sandbox Enforcement
  sandbox: {
    enabled: true,
    description: 'Enables Chromium sandbox for renderer processes',
    implementation: 'webPreferences.sandbox: true'
  },

  // Remote Module Deprecation
  remoteModule: {
    enabled: false,
    description: 'Remote module is completely disabled (deprecated in Electron 14+)',
    implementation: 'webPreferences.enableRemoteModule: false'
  },

  // Content Security Policy
  csp: {
    policy: {
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-inline'",
      'style-src': "'self' 'unsafe-inline'",
      'img-src': "'self' data: blob:",
      'font-src': "'self'",
      'connect-src': "'none'",
      'frame-src': "'none'",
      'object-src': "'none'",
      'media-src': "'none'"
    },
    description: 'Strict CSP prevents XSS and data exfiltration attacks'
  },

  // Navigation Security
  navigationSecurity: {
    externalNavigation: 'blocked',
    newWindowCreation: 'blocked',
    webviewAttachments: 'blocked',
    description: 'Prevents navigation to external URLs and new window creation'
  },

  // Input Validation
  inputValidation: {
    noteId: {
      pattern: '^[a-zA-Z0-9_-]+$',
      maxLength: 100,
      description: 'Only alphanumeric characters, underscores, and hyphens allowed'
    },
    content: {
      maxLength: 100000,
      sanitization: 'HTML script tags and dangerous content removed',
      description: 'Content length limited and sanitized'
    },
    color: {
      allowedValues: [
        'gradient-1', 'gradient-2', 'gradient-3', 'gradient-4',
        'gradient-5', 'gradient-6', 'gradient-7', 'gradient-8',
        'gradient-9', 'gradient-10', 'gradient-11', 'gradient-12',
        'gradient-dark', 'gradient-light', 'gradient-gold', 'gradient-silver'
      ],
      description: 'Only predefined gradient classes allowed'
    }
  },

  // Rate Limiting
  rateLimiting: {
    saveNoteContent: { limit: 20, timeWindow: 1000 },
    changeNoteColor: { limit: 5, timeWindow: 1000 },
    closeNote: { limit: 5, timeWindow: 1000 },
    createNewNote: { limit: 3, timeWindow: 1000 },
    minimizeNote: { limit: 5, timeWindow: 1000 },
    description: 'Prevents abuse of IPC communication'
  },

  // Resource Limits
  resourceLimits: {
    maxNotes: 50,
    maxContentLength: 100000,
    description: 'Prevents resource exhaustion attacks'
  },

  // Additional Security Features
  additionalSecurity: {
    safeDialogs: true,
    experimentalFeatures: false,
    allowRunningInsecureContent: false,
    navigateOnDragDrop: false,
    webSecurity: true,
    description: 'Additional Chromium security features enabled'
  },

  // Logging and Monitoring
  securityLogging: {
    blockedNavigation: true,
    blockedWindowCreation: true,
    blockedWebview: true,
    rateLimitExceeded: true,
    invalidInput: true,
    description: 'Security events are logged for monitoring'
  }
};