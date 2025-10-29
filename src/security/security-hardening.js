// COMPREHENSIVE ELECTRON SECURITY HARDENING MODULE
// This module provides enhanced security configurations and utilities

const path = require('path');
const { app, session } = require('electron');

/**
 * Comprehensive Security Hardening Configuration
 */
class ElectronSecurityHardening {
  constructor() {
    this.securityPolicies = {
      // Content Security Policy - Most restrictive possible
      contentSecurityPolicy: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'", // Needed for inline event handlers
        "style-src 'self' 'unsafe-inline'", // Needed for dynamic styling
        "img-src 'self' data: blob:", // Allow base64 and blob images
        "font-src 'self'", // Only local fonts
        "connect-src 'none'", // No external connections
        "frame-src 'none'", // No iframes
        "object-src 'none'", // No plugins/objects
        "media-src 'none'", // No media streams
        "worker-src 'none'", // No web workers
        "child-src 'none'", // No child contexts
        "form-action 'none'", // No form submissions
        "frame-ancestors 'none'", // Prevent embedding
        "base-uri 'self'", // Restrict base URI
        "upgrade-insecure-requests" // Force HTTPS for any requests
      ].join('; '),

      // Permission Policy (formerly Feature Policy)
      permissionsPolicy: [
        "accelerometer=()",
        "ambient-light-sensor=()",
        "autoplay=()",
        "battery=()",
        "camera=()",
        "cross-origin-isolated=()",
        "display-capture=()",
        "document-domain=()",
        "encrypted-media=()",
        "execution-while-not-rendered=()",
        "execution-while-out-of-viewport=()",
        "fullscreen=()",
        "geolocation=()",
        "gyroscope=()",
        "keyboard-map=()",
        "magnetometer=()",
        "microphone=()",
        "midi=()",
        "navigation-override=()",
        "payment=()",
        "picture-in-picture=()",
        "publickey-credentials-get=()",
        "screen-wake-lock=()",
        "sync-xhr=()",
        "usb=()",
        "web-share=()",
        "xr-spatial-tracking=()"
      ].join(', ')
    };
  }

  /**
   * Get hardened WebPreferences configuration
   */
  getSecureWebPreferences(preloadPath = null) {
    return {
      // CRITICAL: Context isolation enforcement
      contextIsolation: true,
      
      // CRITICAL: Node integration restrictions
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      
      // CRITICAL: Sandbox enforcement
      sandbox: true,
      
      // CRITICAL: Web security enforcement
      webSecurity: true,
      
      // CRITICAL: Remote module disabled (deprecated)
      enableRemoteModule: false,
      
      // CRITICAL: Auxiliary content restrictions
      allowRunningInsecureContent: false,
      
      // CRITICAL: Experimental features disabled
      experimentalFeatures: false,
      
      // CRITICAL: Safe dialogs enabled
      safeDialogs: true,
      safeDialogsMessage: 'This application is attempting to display a dialog.',
      
      // CRITICAL: Navigation restrictions
      navigateOnDragDrop: false,
      
      // CRITICAL: Preload script (if provided)
      ...(preloadPath ? { preload: preloadPath } : {}),
      
      // CRITICAL: Additional Chromium security flags
      additionalArguments: [
        '--disable-web-security=false', // Ensure web security is NOT disabled
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-field-trial-config', // Disable experimental field trials
        '--disable-ipc-flooding-protection=false', // Keep IPC flooding protection
        '--site-per-process', // Enable site isolation
        '--disable-extensions-except', // Disable all extensions
        '--disable-plugins', // Disable all plugins
        '--disable-default-apps', // Disable default Chrome apps
        '--disable-background-networking', // Disable background network requests
        '--disable-background-mode', // Disable background mode
        '--disable-client-side-phishing-detection', // Disable phishing detection (privacy)
        '--disable-component-extensions-with-background-pages',
        '--disable-features=TranslateUI,BlinkGenPropertyTrees'
      ],
      
      // CRITICAL: Partition isolation
      partition: 'persist:secure-sticky-notes'
    };
  }

  /**
   * Configure session security headers and policies
   */
  configureSessionSecurity(sessionObject = session.defaultSession) {
    // Set security headers for all requests
    sessionObject.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = {
        ...details.responseHeaders,
        
        // Content Security Policy
        'Content-Security-Policy': [this.securityPolicies.contentSecurityPolicy],
        
        // X-Frame-Options to prevent clickjacking
        'X-Frame-Options': ['DENY'],
        
        // X-Content-Type-Options to prevent MIME sniffing
        'X-Content-Type-Options': ['nosniff'],
        
        // X-XSS-Protection
        'X-XSS-Protection': ['1; mode=block'],
        
        // Referrer Policy
        'Referrer-Policy': ['no-referrer'],
        
        // Permissions Policy
        'Permissions-Policy': [this.securityPolicies.permissionsPolicy],
        
        // Cross-Origin policies
        'Cross-Origin-Embedder-Policy': ['require-corp'],
        'Cross-Origin-Opener-Policy': ['same-origin'],
        'Cross-Origin-Resource-Policy': ['same-origin'],
        
        // Remove potentially dangerous headers
        'Server': undefined,
        'X-Powered-By': undefined
      };

      // Clean up undefined headers
      Object.keys(responseHeaders).forEach(key => {
        if (responseHeaders[key] === undefined) {
          delete responseHeaders[key];
        }
      });

      callback({ responseHeaders });
    });

    // Block dangerous protocols and schemes
    sessionObject.protocol.interceptHttpProtocol('http', (request, callback) => {
      console.warn(`Blocked HTTP request to: ${request.url}`);
      callback({ error: -3 }); // ERR_ABORTED
    });

    // Block external resource loading
    sessionObject.webRequest.onBeforeRequest((details, callback) => {
      const url = new URL(details.url);
      
      // Allow only file:// protocol for local resources
      if (url.protocol !== 'file:' && url.protocol !== 'chrome-devtools:') {
        console.warn(`Blocked external resource request: ${details.url}`);
        callback({ cancel: true });
        return;
      }
      
      callback({ cancel: false });
    });

    // Clear all existing data to start fresh
    sessionObject.clearStorageData();
    
    // Disable cache to prevent data persistence attacks
    sessionObject.setCache({
      maxSize: 0
    });

    // Set secure cookie policy (though we shouldn't be using cookies)
    sessionObject.cookies.on('changed', (event, cookie, cause, removed) => {
      if (!removed && cookie) {
        // Remove any cookies that get set
        sessionObject.cookies.remove(cookie.url, cookie.name);
        console.warn(`Removed cookie: ${cookie.name} from ${cookie.url}`);
      }
    });
  }

  /**
   * Validate and sanitize window bounds
   */
  sanitizeWindowBounds(bounds, screenBounds) {
    const minWidth = 200;
    const minHeight = 150;
    const maxWidth = Math.min(1200, screenBounds.width);
    const maxHeight = Math.min(1000, screenBounds.height);

    return {
      x: Math.max(0, Math.min(bounds.x || 0, screenBounds.width - minWidth)),
      y: Math.max(0, Math.min(bounds.y || 0, screenBounds.height - minHeight)),
      width: Math.max(minWidth, Math.min(bounds.width || minWidth, maxWidth)),
      height: Math.max(minHeight, Math.min(bounds.height || minHeight, maxHeight))
    };
  }

  /**
   * Input validation utilities
   */
  validateNoteData(data, requiredFields = []) {
    if (!data || typeof data !== 'object') {
      console.warn('Invalid data object received');
      return false;
    }

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in data)) {
        console.warn(`Missing required field: ${field}`);
        return false;
      }
    }

    return true;
  }

  sanitizeNoteId(id) {
    if (typeof id !== 'string') {
      console.warn('Note ID must be a string');
      return null;
    }
    
    if (id.length === 0 || id.length > 100) {
      console.warn('Note ID length out of bounds');
      return null;
    }
    
    // Only allow alphanumeric characters, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      console.warn('Note ID contains invalid characters');
      return null;
    }
    
    return id;
  }

  sanitizeContent(content) {
    if (typeof content !== 'string') {
      console.warn('Content must be a string');
      return null;
    }
    
    // Limit content length (100KB)
    if (content.length > 100000) {
      console.warn('Content too long, truncating');
      content = content.substring(0, 100000);
    }
    
    // Remove potentially dangerous HTML/script content
    // This is a basic sanitizer - for production, consider using a library like DOMPurify
    const sanitized = content
      .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove script tags
      .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '') // Remove iframe tags
      .replace(/<object[^>]*>.*?<\/object>/gis, '') // Remove object tags
      .replace(/<embed[^>]*>/gi, '') // Remove embed tags
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '') // Remove inline event handlers
      .replace(/on\w+\s*=\s*'[^']*'/gi, '') // Remove inline event handlers
      .replace(/javascript:/gi, ''); // Remove javascript: URLs
    
    return sanitized;
  }

  /**
   * Rate limiting implementation
   */
  createRateLimiter() {
    const limits = new Map();
    
    return {
      checkLimit: (action, maxRequests = 10, timeWindow = 1000) => {
        const now = Date.now();
        const key = action;
        
        if (!limits.has(key)) {
          limits.set(key, { count: 1, resetTime: now + timeWindow });
          return true;
        }
        
        const limit = limits.get(key);
        
        if (now > limit.resetTime) {
          limit.count = 1;
          limit.resetTime = now + timeWindow;
          return true;
        }
        
        if (limit.count >= maxRequests) {
          console.warn(`Rate limit exceeded for action: ${action}`);
          return false;
        }
        
        limit.count++;
        return true;
      }
    };
  }

  /**
   * Secure IPC handler registration
   */
  registerSecureIpcHandlers(ipcMain, handlers = {}) {
    const rateLimiter = this.createRateLimiter();
    
    // Wrap each handler with security checks
    Object.entries(handlers).forEach(([channel, { handler, rateLimit = { max: 10, window: 1000 }, validation = {} }]) => {
      ipcMain.on(channel, (event, data) => {
        // Rate limiting
        if (!rateLimiter.checkLimit(channel, rateLimit.max, rateLimit.window)) {
          return;
        }
        
        // Input validation
        if (validation.required && !this.validateNoteData(data, validation.required)) {
          return;
        }
        
        // Custom validation if provided
        if (validation.custom && !validation.custom(data)) {
          console.warn(`Custom validation failed for channel: ${channel}`);
          return;
        }
        
        // Execute handler with error catching
        try {
          handler(event, data);
        } catch (error) {
          console.error(`Error in IPC handler for ${channel}:`, error);
        }
      });
    });
  }

  /**
   * Initialize comprehensive security hardening
   */
  initialize() {
    console.log('Initializing comprehensive Electron security hardening...');
    
    // Configure session security
    app.whenReady().then(() => {
      this.configureSessionSecurity(session.defaultSession);
      console.log('Session security configured');
    });
    
    // Set app security policies
    app.setPath('userData', path.join(app.getPath('userData'), 'secure-sticky-notes'));
    
    // Disable hardware acceleration to prevent GPU-related vulnerabilities
    app.disableHardwareAcceleration();
    
    // Set secure defaults
    app.commandLine.appendSwitch('--disable-web-security', 'false');
    app.commandLine.appendSwitch('--enable-features', 'OutOfBlinkCors');
    
    console.log('Electron security hardening initialized');
  }
}

module.exports = ElectronSecurityHardening;