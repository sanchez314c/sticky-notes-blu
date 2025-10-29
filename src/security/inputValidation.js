/**
 * Comprehensive Input Validation and Sanitization Module
 * Protects against XSS, SQL Injection, Command Injection, and Path Traversal
 */

const crypto = require('crypto');
const path = require('path');
const { advancedValidator } = require('./advancedValidation');

class SecurityValidator {
  constructor() {
    // XSS prevention patterns
    this.xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi,
      /<link\b[^>]*>/gi,
      /<meta\b[^>]*>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /on\w+\s*=/gi,
      /<[^>]*\s+on\w+\s*=.*?>/gi
    ];

    // Command injection patterns
    this.commandInjectionPatterns = [
      /[;&|`$(){}[\]\\]/g,
      /\.\./g,
      /\/etc\/passwd/gi,
      /\/proc\//gi,
      /cmd\.exe/gi,
      /powershell/gi,
      /bash/gi,
      /sh\s/gi,
      /exec/gi,
      /eval/gi
    ];

    // SQL injection patterns
    this.sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /('|('')|;|--|\*|\|)/g,
      /\b(OR|AND)\s+\d+\s*=\s*\d+/gi,
      /\b(OR|AND)\s+['"].*?['"]\s*=\s*['"].*?['"]/gi,
      /\b(UNION\s+(ALL\s+)?SELECT)\b/gi,
      /\bDROP\s+(TABLE|DATABASE|SCHEMA)\b/gi
    ];

    // Path traversal patterns
    this.pathTraversalPatterns = [
      /\.\.\//g,
      /\.\.\\+/g,
      /%2e%2e%2f/gi,
      /%2e%2e\//gi,
      /\.\.%2f/gi,
      /%252e%252e%252f/gi,
      /\.\./g
    ];

    // Maximum lengths for different input types
    this.maxLengths = {
      noteId: 50,
      noteContent: 10000,
      colorValue: 50,
      fileName: 255,
      filePath: 1000
    };

    // Allowed color formats
    this.allowedColorFormats = [
      /^#[0-9a-fA-F]{3,6}$/,           // Hex colors
      /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/,  // RGB
      /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*[01]?\.?\d*\s*\)$/,  // RGBA
      /^gradient-\d{1,2}$|^gradient-(dark|light|gold|silver)$/  // Predefined gradients
    ];
  }

  /**
   * Sanitize text content to prevent XSS attacks
   * @param {string} input - Text to sanitize
   * @param {Object} options - Sanitization options
   * @returns {string} - Sanitized text
   */
  sanitizeText(input, options = {}) {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    // Use advanced validator for comprehensive sanitization
    const sanitizationOptions = {
      maxLength: options.maxLength || this.maxLengths.noteContent,
      strict: options.strict || false,
      preserveLineBreaks: options.preserveLineBreaks !== false
    };

    try {
      // Use advanced XSS sanitization
      const sanitized = advancedValidator.sanitizeXSS(input, sanitizationOptions);
      
      // Additional validation for suspicious patterns
      const validationResult = advancedValidator.comprehensiveValidation(input, sanitizationOptions);
      
      if (!validationResult.isValid && validationResult.confidence > 0.7) {
        console.warn('High-confidence security threat detected:', validationResult.threats);
        // Return heavily sanitized content for high-risk input
        return this.safeFallbackSanitization(input, options.maxLength || this.maxLengths.noteContent);
      }
      
      return sanitized;
    } catch (error) {
      console.error('Advanced sanitization failed, using fallback:', error.message);
      return this.safeFallbackSanitization(input, options.maxLength || this.maxLengths.noteContent);
    }
  }

  /**
   * Safe fallback sanitization for high-risk content
   * @param {string} input - Input to sanitize
   * @param {number} maxLength - Maximum length
   * @returns {string} - Heavily sanitized content
   */
  safeFallbackSanitization(input, maxLength) {
    if (typeof input !== 'string') return '';
    
    let sanitized = input.length > maxLength ? input.substring(0, maxLength) : input;
    
    // Remove all HTML-like content
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Remove all potentially dangerous characters except basic punctuation
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s.,!?\-_()\[\]{}:;"'\n\r]/g, '');
    
    // HTML encode remaining special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    
    return sanitized.trim();
  }

  /**
   * Validate and sanitize note ID
   * @param {string} noteId - Note identifier to validate
   * @returns {string} - Validated note ID
   * @throws {Error} - If validation fails
   */
  validateNoteId(noteId) {
    if (typeof noteId !== 'string') {
      throw new Error('Note ID must be a string');
    }

    if (noteId.length === 0 || noteId.length > this.maxLengths.noteId) {
      throw new Error(`Note ID must be between 1 and ${this.maxLengths.noteId} characters`);
    }

    // Only allow alphanumeric characters, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(noteId)) {
      throw new Error('Note ID contains invalid characters');
    }

    return noteId;
  }

  /**
   * Validate and sanitize color values
   * @param {string} color - Color value to validate
   * @returns {string} - Validated color
   * @throws {Error} - If validation fails
   */
  validateColor(color) {
    if (typeof color !== 'string') {
      throw new Error('Color must be a string');
    }

    if (color.length > this.maxLengths.colorValue) {
      throw new Error(`Color value too long (max ${this.maxLengths.colorValue} characters)`);
    }

    // Check if color matches allowed formats
    const isValidColor = this.allowedColorFormats.some(format => format.test(color));
    
    if (!isValidColor) {
      throw new Error('Invalid color format');
    }

    return color;
  }

  /**
   * Validate file path to prevent path traversal attacks
   * @param {string} filePath - File path to validate
   * @param {string} baseDir - Base directory (optional)
   * @returns {string} - Safe file path
   * @throws {Error} - If validation fails
   */
  validateFilePath(filePath, baseDir = null) {
    if (typeof filePath !== 'string') {
      throw new Error('File path must be a string');
    }

    if (filePath.length > this.maxLengths.filePath) {
      throw new Error(`File path too long (max ${this.maxLengths.filePath} characters)`);
    }

    // Check for path traversal patterns
    this.pathTraversalPatterns.forEach(pattern => {
      if (pattern.test(filePath)) {
        throw new Error('Path traversal attempt detected');
      }
    });

    // Normalize the path
    const normalizedPath = path.normalize(filePath);

    // If base directory is provided, ensure path stays within it
    if (baseDir) {
      const resolvedBase = path.resolve(baseDir);
      const resolvedPath = path.resolve(baseDir, normalizedPath);
      
      if (!resolvedPath.startsWith(resolvedBase)) {
        throw new Error('Path attempts to escape base directory');
      }
    }

    return normalizedPath;
  }

  /**
   * Validate window bounds to prevent security issues
   * @param {Object} bounds - Window bounds object
   * @returns {Object} - Validated bounds
   */
  validateWindowBounds(bounds) {
    if (!bounds || typeof bounds !== 'object') {
      throw new Error('Bounds must be an object');
    }

    const validatedBounds = {};
    
    // Validate numeric properties
    ['x', 'y', 'width', 'height'].forEach(prop => {
      if (bounds[prop] !== undefined) {
        const value = Number(bounds[prop]);
        if (isNaN(value) || !isFinite(value)) {
          throw new Error(`Invalid ${prop} value`);
        }
        
        // Reasonable bounds checking
        if (prop === 'x' || prop === 'y') {
          validatedBounds[prop] = Math.max(-5000, Math.min(5000, value));
        } else {
          validatedBounds[prop] = Math.max(100, Math.min(3000, value));
        }
      }
    });

    return validatedBounds;
  }

  /**
   * Check for command injection attempts
   * @param {string} input - Input to check
   * @returns {Object} - Detection result with details
   */
  containsCommandInjection(input) {
    if (typeof input !== 'string') {
      return { detected: false, confidence: 0 };
    }

    try {
      const result = advancedValidator.detectCommandInjection(input);
      return {
        detected: result.detected,
        confidence: result.confidence,
        patterns: result.patterns,
        legacy: this.commandInjectionPatterns.some(pattern => pattern.test(input))
      };
    } catch (error) {
      console.error('Command injection detection failed:', error.message);
      // Fallback to legacy detection
      return {
        detected: this.commandInjectionPatterns.some(pattern => pattern.test(input)),
        confidence: 0.5,
        patterns: [],
        legacy: true
      };
    }
  }

  /**
   * Check for SQL injection attempts
   * @param {string} input - Input to check
   * @returns {Object} - Detection result with details
   */
  containsSqlInjection(input) {
    if (typeof input !== 'string') {
      return { detected: false, confidence: 0 };
    }

    try {
      const result = advancedValidator.detectSQLInjection(input);
      return {
        detected: result.detected,
        confidence: result.confidence,
        patterns: result.patterns,
        legacy: this.sqlInjectionPatterns.some(pattern => pattern.test(input))
      };
    } catch (error) {
      console.error('SQL injection detection failed:', error.message);
      // Fallback to legacy detection
      return {
        detected: this.sqlInjectionPatterns.some(pattern => pattern.test(input)),
        confidence: 0.5,
        patterns: [],
        legacy: true
      };
    }
  }

  /**
   * Check for path traversal attempts
   * @param {string} input - Input to check
   * @returns {Object} - Detection result with details
   */
  containsPathTraversal(input) {
    if (typeof input !== 'string') {
      return { detected: false, confidence: 0 };
    }

    try {
      const result = advancedValidator.detectPathTraversal(input);
      return {
        detected: result.detected,
        confidence: result.confidence,
        patterns: result.patterns,
        legacy: this.pathTraversalPatterns.some(pattern => pattern.test(input))
      };
    } catch (error) {
      console.error('Path traversal detection failed:', error.message);
      // Fallback to legacy detection
      return {
        detected: this.pathTraversalPatterns.some(pattern => pattern.test(input)),
        confidence: 0.5,
        patterns: [],
        legacy: true
      };
    }
  }

  /**
   * Validate IPC message data
   * @param {Object} data - IPC message data
   * @param {string} messageType - Type of IPC message
   * @returns {Object} - Validated data
   */
  validateIpcData(data, messageType) {
    if (!data || typeof data !== 'object') {
      throw new Error('IPC data must be an object');
    }

    const validatedData = {};

    switch (messageType) {
      case 'save-note-content':
        validatedData.id = this.validateNoteId(data.id);
        validatedData.content = this.sanitizeText(data.content);
        break;

      case 'change-note-color':
        validatedData.id = this.validateNoteId(data.id);
        validatedData.color = this.validateColor(data.color);
        break;

      case 'close-note':
      case 'minimize-note':
        if (typeof data === 'string') {
          validatedData.id = this.validateNoteId(data);
        } else {
          validatedData.id = this.validateNoteId(data.id);
        }
        break;

      case 'window-bounds':
        validatedData.id = this.validateNoteId(data.id);
        validatedData.bounds = this.validateWindowBounds(data.bounds);
        break;

      default:
        throw new Error(`Unknown IPC message type: ${messageType}`);
    }

    return validatedData;
  }

  /**
   * Generate secure note ID
   * @returns {string} - Secure note ID
   */
  generateSecureNoteId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(8).toString('hex');
    return `note_${timestamp}_${random}`;
  }

  /**
   * Rate limiting for operations
   */
  createRateLimiter(maxRequests = 100, windowMs = 60000) {
    const requests = new Map();
    
    return (identifier) => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Clean old entries
      for (const [key, timestamps] of requests.entries()) {
        requests.set(key, timestamps.filter(time => time > windowStart));
        if (requests.get(key).length === 0) {
          requests.delete(key);
        }
      }
      
      // Check current identifier
      const currentRequests = requests.get(identifier) || [];
      
      if (currentRequests.length >= maxRequests) {
        throw new Error('Rate limit exceeded');
      }
      
      currentRequests.push(now);
      requests.set(identifier, currentRequests);
      
      return true;
    };
  }

  /**
   * Comprehensive validation for note data
   * @param {Object} noteData - Note data to validate
   * @returns {Object} - Validated note data
   */
  validateNoteData(noteData) {
    if (!noteData || typeof noteData !== 'object') {
      throw new Error('Note data must be an object');
    }

    const validated = {};

    if (noteData.id !== undefined) {
      validated.id = this.validateNoteId(noteData.id);
    }

    if (noteData.content !== undefined) {
      validated.content = this.sanitizeText(noteData.content);
    }

    if (noteData.color !== undefined) {
      validated.color = this.validateColor(noteData.color);
    }

    if (noteData.bounds !== undefined) {
      validated.bounds = this.validateWindowBounds(noteData.bounds);
    }

    if (noteData.timestamp !== undefined) {
      const timestamp = Number(noteData.timestamp);
      if (isNaN(timestamp) || timestamp < 0) {
        throw new Error('Invalid timestamp');
      }
      validated.timestamp = timestamp;
    }

    return validated;
  }

  /**
   * Sanitize HTML to prevent XSS (for any HTML content)
   * @param {string} html - HTML content to sanitize
   * @returns {string} - Sanitized HTML
   */
  sanitizeHtml(html) {
    if (typeof html !== 'string') {
      return '';
    }

    // Remove all HTML tags except safe ones
    const allowedTags = ['b', 'i', 'u', 'em', 'strong', 'br'];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi;
    
    return html.replace(tagRegex, (match, tagName) => {
      return allowedTags.includes(tagName.toLowerCase()) ? match : '';
    });
  }
}

// Create singleton instance
const securityValidator = new SecurityValidator();

module.exports = {
  SecurityValidator,
  validator: securityValidator
};