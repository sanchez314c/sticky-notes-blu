const { contextBridge, ipcRenderer } = require('electron');
const securityPolicy = require('../security/securityPolicy');

// SECURITY: Enhanced input validation and sanitization functions
function validateNoteId(id) {
  if (typeof id !== 'string') {
    throw new Error('Note ID must be a string');
  }
  
  const policy = securityPolicy.validation.noteId;
  
  if (id.length === 0 || id.length > policy.maxLength) {
    throw new Error(`Note ID must be between 1 and ${policy.maxLength} characters`);
  }
  
  if (!policy.pattern.test(id)) {
    throw new Error('Note ID contains invalid characters');
  }
  
  return id;
}

function validateContent(content) {
  if (typeof content !== 'string') {
    throw new Error('Content must be a string');
  }
  
  const policy = securityPolicy.validation.noteContent;
  
  if (content.length > policy.maxLength) {
    throw new Error(`Content too long (max ${policy.maxLength} characters)`);
  }
  
  // Check for blocked patterns
  for (const pattern of policy.blockPatterns) {
    if (content.toLowerCase().includes(pattern.toLowerCase())) {
      throw new Error(`Content contains blocked pattern: ${pattern}`);
    }
  }
  
  // Basic XSS detection
  if (/<script[^>]*>.*?<\/script>/gi.test(content) || 
      /javascript:\s*[^\s]/gi.test(content) ||
      /on\w+\s*=\s*["'][^"']*["']/gi.test(content)) {
    throw new Error('Content contains potentially dangerous code');
  }
  
  return content;
}

function validateColor(color) {
  if (typeof color !== 'string') {
    throw new Error('Color must be a string');
  }
  
  const policy = securityPolicy.validation.color;
  
  if (color.length > policy.maxLength) {
    throw new Error(`Color value too long (max ${policy.maxLength} characters)`);
  }
  
  // Check allowed predefined values
  if (policy.allowedValues.includes(color)) {
    return color;
  }
  
  // Check hex color pattern if allowed
  if (policy.allowHexColors && policy.hexPattern.test(color)) {
    return color;
  }
  
  throw new Error('Invalid color value');
}

// SECURITY: Enhanced rate limiting for IPC calls
const rateLimits = new Map();
const globalRequests = [];
const burstRequests = [];
const securityViolations = new Map();

function checkRateLimit(action) {
  const now = Date.now();
  const policy = securityPolicy.rateLimit;
  
  // Get operation-specific limits or use defaults
  const opPolicy = policy.operations[action] || { max: 10, window: 60000 };
  
  // Global rate limiting
  const globalWindow = now - policy.global.window;
  const recentGlobal = globalRequests.filter(time => time > globalWindow);
  
  if (recentGlobal.length >= policy.global.max) {
    logSecurityViolation('global_rate_limit', action);
    throw new Error('Global rate limit exceeded');
  }
  
  // Burst protection
  const burstWindow = now - policy.burst.window;
  const recentBurst = burstRequests.filter(time => time > burstWindow);
  
  if (recentBurst.length >= policy.burst.max) {
    logSecurityViolation('burst_limit', action);
    throw new Error('Burst limit exceeded');
  }
  
  // Operation-specific rate limiting
  const key = action;
  if (!rateLimits.has(key)) {
    rateLimits.set(key, { requests: [now], violations: 0 });
  } else {
    const actionLimit = rateLimits.get(key);
    
    // Clean old requests
    const windowStart = now - opPolicy.window;
    actionLimit.requests = actionLimit.requests.filter(time => time > windowStart);
    
    if (actionLimit.requests.length >= opPolicy.max) {
      actionLimit.violations++;
      logSecurityViolation('operation_rate_limit', action, actionLimit.violations);
      
      // Progressive penalties
      if (actionLimit.violations > 3) {
        throw new Error(`Repeated rate limit violations for ${action}. Access temporarily blocked.`);
      }
      
      throw new Error(`Rate limit exceeded for ${action}`);
    }
    
    actionLimit.requests.push(now);
  }
  
  // Track requests
  globalRequests.push(now);
  burstRequests.push(now);
  
  // Clean old tracking data
  const globalCutoff = now - policy.global.window;
  const burstCutoff = now - policy.burst.window;
  globalRequests.splice(0, globalRequests.findIndex(time => time > globalCutoff));
  burstRequests.splice(0, burstRequests.findIndex(time => time > burstCutoff));
  
  return true;
}

function logSecurityViolation(type, action, count = 1) {
  const key = `${type}_${action}`;
  const now = Date.now();
  
  if (!securityViolations.has(key)) {
    securityViolations.set(key, { count: 1, lastOccurrence: now, firstOccurrence: now });
  } else {
    const violation = securityViolations.get(key);
    violation.count += count;
    violation.lastOccurrence = now;
  }
  
  console.warn(`Security violation: ${type} for action ${action} (total: ${securityViolations.get(key).count})`);
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // SECURITY FIX: Authentication APIs
  authenticate: async (authData) => {
    return await ipcRenderer.invoke('authenticate', authData);
  },
  
  checkAuthStatus: async () => {
    return await ipcRenderer.invoke('check-auth-status');
  },
  
  logout: async () => {
    return await ipcRenderer.invoke('logout');
  },
  
  authComplete: (authResult) => {
    ipcRenderer.send('auth-complete', authResult);
  },
  
  authCancelled: () => {
    ipcRenderer.send('auth-cancelled');
  },

  // Note operations with security validation
  saveNoteContent: (id, content) => {
    try {
      checkRateLimit('save-note-content');
      const validId = validateNoteId(id);
      const validContent = validateContent(content);
      ipcRenderer.send('save-note-content', { id: validId, content: validContent });
    } catch (error) {
      console.error('Security validation failed for save-note-content:', error.message);
      logSecurityViolation('validation_failure', 'save-note-content');
    }
  },
  
  changeNoteColor: (id, color) => {
    try {
      checkRateLimit('change-note-color');
      const validId = validateNoteId(id);
      const validColor = validateColor(color);
      ipcRenderer.send('change-note-color', { id: validId, color: validColor });
    } catch (error) {
      console.error('Security validation failed for change-note-color:', error.message);
      logSecurityViolation('validation_failure', 'change-note-color');
    }
  },
  
  closeNote: (id) => {
    try {
      checkRateLimit('close-note');
      const validId = validateNoteId(id);
      ipcRenderer.send('close-note', validId);
    } catch (error) {
      console.error('Security validation failed for close-note:', error.message);
      logSecurityViolation('validation_failure', 'close-note');
    }
  },
  
  createNewNote: () => {
    try {
      checkRateLimit('create-new-note');
      ipcRenderer.send('create-new-note');
    } catch (error) {
      console.error('Security validation failed for create-new-note:', error.message);
      logSecurityViolation('validation_failure', 'create-new-note');
    }
  },
  
  minimizeNote: (id) => {
    try {
      checkRateLimit('minimize-note');
      const validId = validateNoteId(id);
      ipcRenderer.send('minimize-note', validId);
    } catch (error) {
      console.error('Security validation failed for minimize-note:', error.message);
      logSecurityViolation('validation_failure', 'minimize-note');
    }
  },
  
  moveWindow: (id, x, y) => {
    try {
      checkRateLimit('move-window');
      const validId = validateNoteId(id);
      
      if (typeof x !== 'number' || typeof y !== 'number') {
        throw new Error('Invalid coordinates');
      }
      
      if (!isFinite(x) || !isFinite(y) || x < -5000 || x > 5000 || y < -5000 || y > 5000) {
        throw new Error('Coordinates out of valid range');
      }
      
      ipcRenderer.send('move-window', { id: validId, x: Math.floor(x), y: Math.floor(y) });
    } catch (error) {
      console.error('Security validation failed for move-window:', error.message);
      logSecurityViolation('validation_failure', 'move-window');
    }
  },
  
  resizeWindow: (id, width, height) => {
    try {
      checkRateLimit('resize-window');
      const validId = validateNoteId(id);
      
      if (typeof width !== 'number' || typeof height !== 'number') {
        throw new Error('Invalid dimensions');
      }
      
      if (!isFinite(width) || !isFinite(height)) {
        throw new Error('Invalid finite dimensions');
      }
      
      const policy = securityPolicy.resources.window;
      if (width < policy.minWidth || height < policy.minHeight || 
          width > policy.maxWidth || height > policy.maxHeight) {
        throw new Error(`Window size must be between ${policy.minWidth}x${policy.minHeight} and ${policy.maxWidth}x${policy.maxHeight}`);
      }
      
      ipcRenderer.send('resize-window', { id: validId, width: Math.floor(width), height: Math.floor(height) });
    } catch (error) {
      console.error('Security validation failed for resize-window:', error.message);
      logSecurityViolation('validation_failure', 'resize-window');
    }
  },
  
  // Listen for initialization data
  onInitNote: (callback) => {
    ipcRenderer.on('init-note', (event, data) => callback(data));
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});