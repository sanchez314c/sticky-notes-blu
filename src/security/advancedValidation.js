/**
 * Advanced Security Validation Module
 * Enhanced input validation, sanitization, and attack prevention
 */

const crypto = require('crypto');
const { URL } = require('url');
const path = require('path');

class AdvancedSecurityValidator {
  constructor() {
    // Enhanced XSS patterns with more sophisticated detection
    this.xssPatterns = [
      // Script tag variations
      /<\s*script[^>]*>.*?<\s*\/\s*script\s*>/gis,
      /<\s*script[^>]*>/gi,
      /javascript\s*:/gi,
      /vbscript\s*:/gi,
      /data\s*:\s*text\s*\/\s*html/gi,
      /data\s*:\s*application\s*\/\s*x-httpd-php/gi,
      
      // Event handler attributes
      /on\w+\s*=\s*["']?[^"'>]*["']?/gi,
      /<[^>]*\son\w+\s*=.*?>/gi,
      
      // Iframe and object tags
      /<\s*iframe[^>]*>/gi,
      /<\s*object[^>]*>/gi,
      /<\s*embed[^>]*>/gi,
      /<\s*applet[^>]*>/gi,
      /<\s*form[^>]*>/gi,
      
      // Meta and link tags
      /<\s*meta[^>]*>/gi,
      /<\s*link[^>]*>/gi,
      /<\s*base[^>]*>/gi,
      
      // Style injection
      /<\s*style[^>]*>.*?<\s*\/\s*style\s*>/gis,
      /expression\s*\(/gi,
      /@import\s+/gi,
      /binding\s*:/gi,
      
      // Data URLs and pseudo-protocols
      /data\s*:/gi,
      /javascript\s*:/gi,
      /vbscript\s*:/gi,
      /livescript\s*:/gi,
      /mocha\s*:/gi,
      
      // SVG-based XSS
      /<\s*svg[^>]*>.*?<\s*\/\s*svg\s*>/gis,
      /<\s*use[^>]*>/gi,
      /<\s*image[^>]*>/gi,
      
      // Template injection
      /\{\{.*?\}\}/g,
      /<\s*template[^>]*>.*?<\s*\/\s*template\s*>/gis,
      
      // CSS expressions and imports
      /url\s*\(\s*["']?javascript:/gi,
      /expression\s*\(/gi
    ];

    // Command injection patterns
    this.commandInjectionPatterns = [
      // Basic shell metacharacters
      /[;&|`$(){}[\]\\]/g,
      /\$\{.*?\}/g,
      /\$\(.*?\)/g,
      
      // Path traversal
      /\.\.\//g,
      /\.\.\\+/g,
      /%2e%2e%2f/gi,
      /%2e%2e\//gi,
      /\.\.%2f/gi,
      /%252e%252e%252f/gi,
      
      // System files and commands
      /\/etc\/passwd/gi,
      /\/proc\//gi,
      /\/sys\//gi,
      /\/dev\//gi,
      /cmd\.exe/gi,
      /powershell/gi,
      /bash/gi,
      /sh\s/gi,
      /zsh/gi,
      /csh/gi,
      /ksh/gi,
      /fish/gi,
      
      // Common command execution
      /exec\s*\(/gi,
      /eval\s*\(/gi,
      /system\s*\(/gi,
      /popen\s*\(/gi,
      /spawn\s*\(/gi,
      
      // Network operations
      /wget\s+/gi,
      /curl\s+/gi,
      /nc\s+/gi,
      /netcat\s+/gi,
      /telnet\s+/gi,
      /ssh\s+/gi,
      /scp\s+/gi,
      /rsync\s+/gi,
      
      // File operations
      /cat\s+/gi,
      /ls\s+/gi,
      /dir\s+/gi,
      /find\s+/gi,
      /grep\s+/gi,
      /awk\s+/gi,
      /sed\s+/gi,
      /sort\s+/gi,
      /uniq\s+/gi,
      /wc\s+/gi,
      /head\s+/gi,
      /tail\s+/gi,
      
      // Compression and archives
      /tar\s+/gi,
      /zip\s+/gi,
      /unzip\s+/gi,
      /gzip\s+/gi,
      /gunzip\s+/gi,
      
      // Text editors
      /vi\s+/gi,
      /vim\s+/gi,
      /nano\s+/gi,
      /emacs\s+/gi
    ];

    // Enhanced SQL injection patterns
    this.sqlInjectionPatterns = [
      // Basic SQL keywords
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      
      // String delimiter manipulation
      /('|('')|;|--|\*|\||\\)/g,
      /%27|%22|%3B|%2D%2D/gi,
      
      // Union-based injections
      /\b(UNION\s+(ALL\s+)?SELECT)\b/gi,
      /\bUNION\s+SELECT\s+/gi,
      
      // Boolean-based injections
      /\b(OR|AND)\s+\d+\s*=\s*\d+/gi,
      /\b(OR|AND)\s+['"].*?['"]\s*=\s*['"].*?['"]/gi,
      /\b(OR|AND)\s+\d+\s*<>\s*\d+/gi,
      
      // Time-based injections
      /\bWAITFOR\s+DELAY\b/gi,
      /\bSLEEP\s*\(/gi,
      /\bBENCHMARK\s*\(/gi,
      /\bPG_SLEEP\s*\(/gi,
      
      // Information schema queries
      /\bINFORMATION_SCHEMA\b/gi,
      /\bSYS\.\w+/gi,
      /\bMSYSACCESSOBJECTS\b/gi,
      
      // Database-specific functions
      /\b(LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE)\b/gi,
      /\bXP_CMDSHELL\b/gi,
      /\bSP_EXECUTESQL\b/gi,
      
      // Comment-based bypasses
      /\/\*.*?\*\//gs,
      /--.*$/gm,
      /#.*$/gm,
      
      // Encoded injections
      /%23|%2F%2A|%2A%2F|%27|%22/gi,
      
      // Conditional queries
      /\bCASE\s+WHEN\b/gi,
      /\bIF\s*\(/gi,
      /\bIIF\s*\(/gi,
      
      // Subqueries
      /\(\s*SELECT\s+/gi,
      /\bEXISTS\s*\(/gi,
      
      // Database functions
      /\b(CHAR|ASCII|LEN|LENGTH|SUBSTRING|MID|CONCAT)\s*\(/gi,
      /\b(USER|DATABASE|VERSION|@@)\w*/gi,
      
      // Error-based injections
      /\bEXTRACTVALUE\s*\(/gi,
      /\bUPDATEXML\s*\(/gi,
      /\bXMLTYPE\s*\(/gi
    ];

    // LDAP injection patterns
    this.ldapInjectionPatterns = [
      /[()&|!=<>~*]/g,
      /\\\*/g,
      /\\\(/g,
      /\\\)/g,
      /\\00/g,
      /\x00/g
    ];

    // Path traversal patterns
    this.pathTraversalPatterns = [
      /\.\.\//g,
      /\.\.\\+/g,
      /%2e%2e%2f/gi,
      /%2e%2e\//gi,
      /\.\.%2f/gi,
      /%252e%252e%252f/gi,
      /\.\./g,
      /~\//g,
      /%7e\//gi
    ];

    // NoSQL injection patterns
    this.nosqlInjectionPatterns = [
      /\$where\s*:/gi,
      /\$ne\s*:/gi,
      /\$gt\s*:/gi,
      /\$lt\s*:/gi,
      /\$or\s*:/gi,
      /\$and\s*:/gi,
      /\$regex\s*:/gi,
      /\$exists\s*:/gi,
      /\$in\s*:/gi,
      /\$nin\s*:/gi
    ];

    // XML injection patterns
    this.xmlInjectionPatterns = [
      /<!\[CDATA\[.*?\]\]>/gis,
      /<!DOCTYPE[^>]*>/gi,
      /<!ENTITY[^>]*>/gi,
      /<\?xml[^>]*>/gi,
      /&[a-zA-Z][a-zA-Z0-9]*;/g
    ];

    // Maximum input lengths
    this.maxLengths = {
      noteId: 50,
      noteContent: 50000, // 50KB limit
      colorValue: 50,
      fileName: 255,
      filePath: 1000,
      url: 2048,
      email: 254,
      username: 50,
      password: 128
    };
  }

  /**
   * Comprehensive XSS sanitization
   * @param {string} input - Input to sanitize
   * @param {Object} options - Sanitization options
   * @returns {string} - Sanitized input
   */
  sanitizeXSS(input, options = {}) {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    const maxLength = options.maxLength || this.maxLengths.noteContent;
    let sanitized = input.length > maxLength ? input.substring(0, maxLength) : input;

    // Remove XSS patterns
    this.xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // HTML encode dangerous characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;');

    // Remove null bytes and control characters
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Normalize Unicode
    sanitized = sanitized.normalize('NFKC');

    // Additional protections based on options
    if (options.strict) {
      // Remove all HTML-like content in strict mode
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    if (options.preserveLineBreaks) {
      // Convert line breaks to safe format
      sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    } else {
      // Remove all line breaks
      sanitized = sanitized.replace(/[\r\n]/g, ' ');
    }

    return sanitized.trim();
  }

  /**
   * Check for SQL injection attempts
   * @param {string} input - Input to check
   * @returns {Object} - Detection result
   */
  detectSQLInjection(input) {
    if (typeof input !== 'string') {
      return { detected: false, patterns: [] };
    }

    const detectedPatterns = [];
    
    this.sqlInjectionPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        detectedPatterns.push({
          patternIndex: index,
          pattern: pattern.toString(),
          matches: input.match(pattern) || []
        });
      }
    });

    return {
      detected: detectedPatterns.length > 0,
      patterns: detectedPatterns,
      confidence: this.calculateConfidence(detectedPatterns, 'sql')
    };
  }

  /**
   * Check for command injection attempts
   * @param {string} input - Input to check
   * @returns {Object} - Detection result
   */
  detectCommandInjection(input) {
    if (typeof input !== 'string') {
      return { detected: false, patterns: [] };
    }

    const detectedPatterns = [];
    
    this.commandInjectionPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        detectedPatterns.push({
          patternIndex: index,
          pattern: pattern.toString(),
          matches: input.match(pattern) || []
        });
      }
    });

    return {
      detected: detectedPatterns.length > 0,
      patterns: detectedPatterns,
      confidence: this.calculateConfidence(detectedPatterns, 'command')
    };
  }

  /**
   * Check for path traversal attempts
   * @param {string} input - Input to check
   * @returns {Object} - Detection result
   */
  detectPathTraversal(input) {
    if (typeof input !== 'string') {
      return { detected: false, patterns: [] };
    }

    const detectedPatterns = [];
    
    this.pathTraversalPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        detectedPatterns.push({
          patternIndex: index,
          pattern: pattern.toString(),
          matches: input.match(pattern) || []
        });
      }
    });

    return {
      detected: detectedPatterns.length > 0,
      patterns: detectedPatterns,
      confidence: this.calculateConfidence(detectedPatterns, 'path')
    };
  }

  /**
   * Validate and sanitize file path
   * @param {string} filePath - File path to validate
   * @param {string} baseDir - Base directory restriction
   * @returns {string} - Safe file path
   */
  validateAndSanitizeFilePath(filePath, baseDir = null) {
    if (typeof filePath !== 'string') {
      throw new Error('File path must be a string');
    }

    if (filePath.length > this.maxLengths.filePath) {
      throw new Error(`File path too long (max ${this.maxLengths.filePath} characters)`);
    }

    // Check for path traversal
    const pathTraversalResult = this.detectPathTraversal(filePath);
    if (pathTraversalResult.detected) {
      throw new Error('Path traversal attempt detected');
    }

    // Normalize and resolve path
    const normalizedPath = path.normalize(filePath);
    
    // Additional security checks
    if (normalizedPath.includes('\x00')) {
      throw new Error('Null byte in path');
    }

    // Check for dangerous file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.jar'];
    const ext = path.extname(normalizedPath).toLowerCase();
    if (dangerousExtensions.includes(ext)) {
      throw new Error('Dangerous file extension detected');
    }

    // Validate base directory constraint
    if (baseDir) {
      const resolvedBase = path.resolve(baseDir);
      const resolvedPath = path.resolve(baseDir, normalizedPath);
      
      if (!resolvedPath.startsWith(resolvedBase + path.sep) && resolvedPath !== resolvedBase) {
        throw new Error('Path attempts to escape base directory');
      }
    }

    return normalizedPath;
  }

  /**
   * Validate URL input
   * @param {string} url - URL to validate
   * @param {Array} allowedProtocols - Allowed protocols
   * @returns {Object} - Validation result
   */
  validateURL(url, allowedProtocols = ['http:', 'https:']) {
    if (typeof url !== 'string') {
      throw new Error('URL must be a string');
    }

    if (url.length > this.maxLengths.url) {
      throw new Error(`URL too long (max ${this.maxLengths.url} characters)`);
    }

    try {
      const parsedUrl = new URL(url);
      
      // Check protocol
      if (!allowedProtocols.includes(parsedUrl.protocol)) {
        throw new Error(`Protocol ${parsedUrl.protocol} not allowed`);
      }

      // Check for dangerous protocols
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
      if (dangerousProtocols.includes(parsedUrl.protocol)) {
        throw new Error('Dangerous protocol detected');
      }

      // Check for localhost/private IPs (optional)
      const hostname = parsedUrl.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || 
          hostname.startsWith('192.168.') || hostname.startsWith('10.') ||
          hostname.startsWith('172.')) {
        console.warn('Private/local IP detected in URL');
      }

      return {
        isValid: true,
        parsed: parsedUrl,
        normalized: parsedUrl.href
      };
    } catch (error) {
      throw new Error(`Invalid URL: ${error.message}`);
    }
  }

  /**
   * Advanced email validation
   * @param {string} email - Email to validate
   * @returns {boolean} - Validation result
   */
  validateEmail(email) {
    if (typeof email !== 'string') {
      throw new Error('Email must be a string');
    }

    if (email.length > this.maxLengths.email) {
      throw new Error(`Email too long (max ${this.maxLengths.email} characters)`);
    }

    // RFC 5322 compliant email regex (simplified but robust)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Additional security checks
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      throw new Error('Invalid email format: consecutive dots or leading/trailing dots');
    }

    return true;
  }

  /**
   * Calculate confidence score for attack detection
   * @param {Array} detectedPatterns - Detected patterns
   * @param {string} attackType - Type of attack
   * @returns {number} - Confidence score (0-1)
   */
  calculateConfidence(detectedPatterns, attackType) {
    if (detectedPatterns.length === 0) {
      return 0;
    }

    // Weight patterns by severity and commonality
    const weights = {
      sql: [0.9, 0.8, 0.7, 0.6, 0.5],
      command: [0.95, 0.85, 0.75, 0.65, 0.55],
      path: [0.9, 0.8, 0.7, 0.6, 0.5]
    };

    const typeWeights = weights[attackType] || [0.5, 0.4, 0.3, 0.2, 0.1];
    
    let totalScore = 0;
    detectedPatterns.forEach((pattern, index) => {
      const weight = typeWeights[index] || 0.1;
      const matchCount = pattern.matches.length;
      totalScore += weight * Math.min(matchCount / 10, 1);
    });

    return Math.min(totalScore, 1);
  }

  /**
   * Comprehensive input validation
   * @param {string} input - Input to validate
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result
   */
  comprehensiveValidation(input, options = {}) {
    const results = {
      isValid: true,
      sanitized: input,
      threats: [],
      confidence: 0
    };

    try {
      // XSS detection and sanitization
      results.sanitized = this.sanitizeXSS(input, options);

      // SQL injection detection
      const sqlResult = this.detectSQLInjection(input);
      if (sqlResult.detected) {
        results.threats.push({ type: 'sql_injection', ...sqlResult });
        results.isValid = false;
      }

      // Command injection detection
      const cmdResult = this.detectCommandInjection(input);
      if (cmdResult.detected) {
        results.threats.push({ type: 'command_injection', ...cmdResult });
        results.isValid = false;
      }

      // Path traversal detection
      const pathResult = this.detectPathTraversal(input);
      if (pathResult.detected) {
        results.threats.push({ type: 'path_traversal', ...pathResult });
        results.isValid = false;
      }

      // Calculate overall confidence
      if (results.threats.length > 0) {
        results.confidence = results.threats.reduce((sum, threat) => sum + threat.confidence, 0) / results.threats.length;
      }

    } catch (error) {
      results.isValid = false;
      results.error = error.message;
    }

    return results;
  }

  /**
   * Generate security hash for content integrity
   * @param {string} content - Content to hash
   * @returns {string} - Security hash
   */
  generateSecurityHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Create rate limiter with advanced features
   * @param {Object} options - Rate limiter options
   * @returns {Function} - Rate limiter function
   */
  createAdvancedRateLimiter(options = {}) {
    const {
      maxRequests = 100,
      windowMs = 60000,
      blockDurationMs = 300000, // 5 minutes
      skipSuccessfulRequests = false,
      skipFailedRequests = false
    } = options;

    const requests = new Map();
    const blocked = new Map();

    return (identifier, isSuccess = true) => {
      const now = Date.now();

      // Check if identifier is blocked
      if (blocked.has(identifier)) {
        const blockInfo = blocked.get(identifier);
        if (now < blockInfo.unblockTime) {
          throw new Error(`Rate limit exceeded. Blocked until ${new Date(blockInfo.unblockTime).toISOString()}`);
        } else {
          blocked.delete(identifier);
        }
      }

      // Clean old requests
      const windowStart = now - windowMs;
      for (const [key, timestamps] of requests.entries()) {
        const filteredTimestamps = timestamps.filter(time => time > windowStart);
        if (filteredTimestamps.length === 0) {
          requests.delete(key);
        } else {
          requests.set(key, filteredTimestamps);
        }
      }

      // Skip counting based on options
      if ((skipSuccessfulRequests && isSuccess) || (skipFailedRequests && !isSuccess)) {
        return true;
      }

      // Check current requests
      const currentRequests = requests.get(identifier) || [];
      
      if (currentRequests.length >= maxRequests) {
        // Block the identifier
        blocked.set(identifier, {
          blockedAt: now,
          unblockTime: now + blockDurationMs,
          requestCount: currentRequests.length
        });
        
        throw new Error('Rate limit exceeded. Client has been temporarily blocked.');
      }

      // Add current request
      currentRequests.push(now);
      requests.set(identifier, currentRequests);

      return true;
    };
  }
}

// Create singleton instance
const advancedValidator = new AdvancedSecurityValidator();

module.exports = {
  AdvancedSecurityValidator,
  advancedValidator
};