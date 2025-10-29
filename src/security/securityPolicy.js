/**
 * Comprehensive Security Policy Configuration
 * Defines security policies, thresholds, and enforcement rules
 */

const securityPolicy = {
  // Threat detection thresholds
  detection: {
    // Confidence threshold for blocking requests (0.0 - 1.0)
    blockThreshold: 0.6,
    
    // Confidence threshold for logging warnings (0.0 - 1.0)
    warnThreshold: 0.3,
    
    // Maximum number of failed validation attempts before blocking IP/client
    maxFailedAttempts: 5,
    
    // Time window for rate limiting (milliseconds)
    rateLimitWindow: 60000,
    
    // Block duration for repeat offenders (milliseconds)
    blockDuration: 300000 // 5 minutes
  },

  // Content Security Policy
  csp: {
    // Strict CSP for maximum security
    strict: {
      'default-src': "'none'",
      'script-src': "'self' 'unsafe-inline'",
      'style-src': "'self' 'unsafe-inline'",
      'img-src': "'self' data:",
      'font-src': "'self'",
      'connect-src': "'none'",
      'frame-src': "'none'",
      'object-src': "'none'",
      'media-src': "'none'",
      'child-src': "'none'",
      'worker-src': "'none'",
      'manifest-src': "'none'",
      'base-uri': "'none'",
      'form-action': "'none'"
    },
    
    // Balanced CSP for normal operation
    balanced: {
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-inline'",
      'style-src': "'self' 'unsafe-inline'",
      'img-src': "'self' data: blob:",
      'font-src': "'self'",
      'connect-src': "'self'",
      'frame-src': "'none'",
      'object-src': "'none'",
      'media-src': "'none'"
    }
  },

  // Input validation rules
  validation: {
    // Note content validation
    noteContent: {
      maxLength: 50000,
      allowHtml: false,
      allowScripts: false,
      sanitizeLevel: 'strict', // 'strict', 'balanced', 'minimal'
      blockPatterns: [
        'javascript:',
        'vbscript:',
        'data:text/html',
        '<script',
        '</script>',
        'onload=',
        'onerror=',
        'onclick='
      ]
    },
    
    // Note ID validation
    noteId: {
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/,
      required: true
    },
    
    // Color validation
    color: {
      maxLength: 50,
      allowedValues: [
        'gradient-1', 'gradient-2', 'gradient-3', 'gradient-4',
        'gradient-5', 'gradient-6', 'gradient-7', 'gradient-8',
        'gradient-9', 'gradient-10', 'gradient-11', 'gradient-12',
        'gradient-dark', 'gradient-light', 'gradient-gold', 'gradient-silver'
      ],
      allowHexColors: true,
      hexPattern: /^#[0-9a-fA-F]{3,6}$/
    }
  },

  // Rate limiting configuration
  rateLimit: {
    // Per-operation limits
    operations: {
      'save-note-content': { max: 50, window: 60000 },
      'change-note-color': { max: 30, window: 60000 },
      'close-note': { max: 20, window: 60000 },
      'create-new-note': { max: 10, window: 60000 },
      'minimize-note': { max: 20, window: 60000 },
      'move-window': { max: 100, window: 60000 },
      'resize-window': { max: 50, window: 60000 }
    },
    
    // Global rate limit
    global: {
      max: 200, // Total requests per window
      window: 60000 // 1 minute
    },
    
    // Burst allowance
    burst: {
      max: 20, // Maximum burst requests
      window: 5000 // 5 seconds
    }
  },

  // Resource limits
  resources: {
    maxNotes: 50,
    maxNoteSize: 50000, // 50KB
    maxTotalStorage: 5242880, // 5MB total storage
    maxMemoryUsage: 104857600, // 100MB memory limit
    
    // Window constraints
    window: {
      minWidth: 200,
      minHeight: 150,
      maxWidth: 1200,
      maxHeight: 800,
      maxWindows: 50
    }
  },

  // Security headers
  headers: {
    // Electron security headers
    electron: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'no-referrer',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
    }
  },

  // Logging and monitoring
  logging: {
    // Security events to log
    events: [
      'xss_attempt',
      'sql_injection_attempt',
      'command_injection_attempt',
      'path_traversal_attempt',
      'rate_limit_exceeded',
      'invalid_input',
      'blocked_navigation',
      'blocked_window_creation',
      'validation_failure',
      'authentication_failure'
    ],
    
    // Log levels
    levels: {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      critical: 4
    },
    
    // Log retention
    retention: {
      debug: 86400000, // 1 day
      info: 604800000, // 1 week
      warn: 2592000000, // 1 month
      error: 7776000000, // 3 months
      critical: 31536000000 // 1 year
    }
  },

  // Monitoring and alerting
  monitoring: {
    // Thresholds for alerting
    alerts: {
      highThreatDetection: {
        threshold: 10, // threats per minute
        window: 60000,
        severity: 'high'
      },
      
      rateLimitViolations: {
        threshold: 50, // violations per hour
        window: 3600000,
        severity: 'medium'
      },
      
      repeatedInvalidInput: {
        threshold: 20, // invalid inputs per hour from same source
        window: 3600000,
        severity: 'medium'
      }
    },
    
    // Performance monitoring
    performance: {
      maxValidationTime: 1000, // 1 second max per validation
      maxMemoryGrowth: 10485760, // 10MB memory growth per hour
      maxCpuUsage: 80 // 80% CPU usage threshold
    }
  },

  // Feature flags
  features: {
    strictValidation: true,
    advancedThreatDetection: true,
    realTimeMonitoring: true,
    automaticBlocking: true,
    contentSanitization: true,
    rateLimiting: true,
    securityLogging: true,
    performanceMonitoring: false // Disable in production if needed
  },

  // Emergency procedures
  emergency: {
    // Lockdown mode - disable all non-essential features
    lockdownMode: {
      enabled: false,
      triggers: [
        'multiple_high_confidence_threats',
        'system_compromise_detected',
        'manual_activation'
      ],
      actions: [
        'disable_new_connections',
        'enable_strict_validation',
        'increase_logging',
        'alert_administrators'
      ]
    }
  }
};

module.exports = securityPolicy;