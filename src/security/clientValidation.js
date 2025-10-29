/**
 * Client-side Input Validation and Sanitization
 * Runs in renderer process for immediate feedback and XSS prevention
 */

class ClientSecurityValidator {
  constructor() {
    // XSS prevention patterns for client-side
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
      /<[^>]*\s+on\w+\s*=.*?>/gi,
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi
    ];

    // Maximum lengths
    this.maxLengths = {
      noteContent: 10000,
      colorValue: 50
    };

    // Allowed gradient classes
    this.allowedGradients = [
      'gradient-1', 'gradient-2', 'gradient-3', 'gradient-4',
      'gradient-5', 'gradient-6', 'gradient-7', 'gradient-8',
      'gradient-9', 'gradient-10', 'gradient-11', 'gradient-12',
      'gradient-dark', 'gradient-light', 'gradient-gold', 'gradient-silver'
    ];

    // Debounce timers
    this.debounceTimers = new Map();
  }

  /**
   * Sanitize note content for display
   * @param {string} content - Content to sanitize
   * @returns {string} - Sanitized content
   */
  sanitizeNoteContent(content) {
    if (typeof content !== 'string') {
      return '';
    }

    // Truncate if too long
    if (content.length > this.maxLengths.noteContent) {
      content = content.substring(0, this.maxLengths.noteContent);
    }

    // Remove XSS patterns
    let sanitized = content;
    this.xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // HTML encode dangerous characters but preserve line breaks
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\0/g, ''); // Remove null bytes

    return sanitized;
  }

  /**
   * Validate color/gradient class
   * @param {string} colorClass - Color class to validate
   * @returns {string} - Valid color class or default
   */
  validateColorClass(colorClass) {
    if (!colorClass || typeof colorClass !== 'string') {
      return 'gradient-1';
    }

    // Check if it's an allowed gradient
    if (this.allowedGradients.includes(colorClass)) {
      return colorClass;
    }

    // If it's a hex color, validate format
    if (colorClass.startsWith('#')) {
      const hexRegex = /^#[0-9a-fA-F]{3,6}$/;
      if (hexRegex.test(colorClass) && colorClass.length <= 7) {
        return colorClass;
      }
    }

    // Default fallback
    return 'gradient-1';
  }

  /**
   * Real-time content validation with visual feedback
   * @param {HTMLElement} element - Input element
   * @param {Function} callback - Callback when valid
   */
  setupRealTimeValidation(element, callback) {
    if (!element) return;

    // Create validation indicator
    const indicator = this.createValidationIndicator();
    element.parentNode.appendChild(indicator);

    const validate = () => {
      const content = element.value;
      const isValid = this.isContentSafe(content);
      
      // Update visual indicator
      indicator.className = `validation-indicator ${isValid ? 'valid' : 'invalid'}`;
      indicator.textContent = isValid ? '✓' : '⚠';
      indicator.title = isValid ? 'Content is safe' : 'Content contains potentially dangerous code';
      
      // Update element style
      element.style.borderColor = isValid ? '#28ca42' : '#ff5f57';
      
      if (isValid && callback) {
        callback(this.sanitizeNoteContent(content));
      }
    };

    // Debounced validation
    element.addEventListener('input', () => {
      const timerId = this.debounceTimers.get(element);
      if (timerId) {
        clearTimeout(timerId);
      }
      
      this.debounceTimers.set(element, setTimeout(validate, 300));
    });

    // Immediate validation on paste
    element.addEventListener('paste', () => {
      setTimeout(validate, 10);
    });
  }

  /**
   * Create validation indicator element
   * @returns {HTMLElement} - Indicator element
   */
  createValidationIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'validation-indicator';
    indicator.style.cssText = `
      position: absolute;
      right: 8px;
      top: 8px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      pointer-events: none;
      transition: all 0.2s ease;
      z-index: 1000;
    `;
    return indicator;
  }

  /**
   * Check if content is safe (no XSS vectors)
   * @param {string} content - Content to check
   * @returns {boolean} - True if safe
   */
  isContentSafe(content) {
    if (!content || typeof content !== 'string') {
      return true;
    }

    // Check against XSS patterns
    return !this.xssPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Sanitize DOM element content
   * @param {HTMLElement} element - Element to sanitize
   */
  sanitizeElement(element) {
    if (!element) return;

    // Remove dangerous attributes
    const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'];
    dangerousAttrs.forEach(attr => {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr);
      }
    });

    // Remove script tags
    const scripts = element.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    // Sanitize child elements recursively
    Array.from(element.children).forEach(child => {
      this.sanitizeElement(child);
    });
  }

  /**
   * Set up Content Security Policy headers (if possible in Electron)
   */
  setupCSP() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self';
      media-src 'none';
      object-src 'none';
      frame-src 'none';
    `.replace(/\s+/g, ' ').trim();
    
    document.head.appendChild(meta);
  }

  /**
   * Prevent dangerous clipboard operations
   * @param {HTMLElement} element - Element to protect
   */
  setupClipboardProtection(element) {
    if (!element) return;

    element.addEventListener('paste', (e) => {
      e.preventDefault();
      
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;
      
      const pastedText = clipboardData.getData('text/plain');
      const sanitizedText = this.sanitizeNoteContent(pastedText);
      
      // Insert sanitized text
      const start = element.selectionStart;
      const end = element.selectionEnd;
      const currentValue = element.value;
      
      element.value = currentValue.slice(0, start) + sanitizedText + currentValue.slice(end);
      element.setSelectionRange(start + sanitizedText.length, start + sanitizedText.length);
      
      // Trigger input event
      element.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  /**
   * Rate limiter for client-side operations
   * @param {string} operation - Operation identifier
   * @param {number} maxOps - Maximum operations per window
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} - True if allowed
   */
  rateLimitOperation(operation, maxOps = 50, windowMs = 60000) {
    const now = Date.now();
    const key = `rateLimit_${operation}`;
    
    let operations = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Clean old operations
    operations = operations.filter(time => now - time < windowMs);
    
    if (operations.length >= maxOps) {
      return false;
    }
    
    operations.push(now);
    localStorage.setItem(key, JSON.stringify(operations));
    
    return true;
  }

  /**
   * Initialize client-side security measures
   */
  initialize() {
    // Set up CSP
    this.setupCSP();
    
    // Sanitize existing elements
    document.querySelectorAll('*').forEach(element => {
      this.sanitizeElement(element);
    });
    
    // Set up mutation observer to sanitize dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.sanitizeElement(node);
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Set up validation for note content
    const noteContent = document.getElementById('noteContent');
    if (noteContent) {
      this.setupRealTimeValidation(noteContent, () => {
        // Content is valid, can save
        console.log('Content validated and sanitized');
      });
      
      this.setupClipboardProtection(noteContent);
    }

    console.log('Client-side security initialized');
  }

  /**
   * Validate IPC message before sending
   * @param {string} channel - IPC channel
   * @param {*} data - Data to send
   * @returns {boolean} - True if safe to send
   */
  validateIpcMessage(channel, data) {
    // Rate limit IPC messages
    if (!this.rateLimitOperation(`ipc_${channel}`, 100, 60000)) {
      console.warn(`Rate limit exceeded for IPC channel: ${channel}`);
      return false;
    }

    // Validate based on channel
    switch (channel) {
      case 'save-note-content':
        if (!data.id || typeof data.id !== 'string') return false;
        if (!this.isContentSafe(data.content)) return false;
        break;
        
      case 'change-note-color':
        if (!data.id || typeof data.id !== 'string') return false;
        if (this.validateColorClass(data.color) !== data.color) return false;
        break;
        
      default:
        break;
    }

    return true;
  }
}

// Create and export singleton
const clientValidator = new ClientSecurityValidator();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    clientValidator.initialize();
  });
} else {
  clientValidator.initialize();
}

// Make available globally for renderer
window.clientValidator = clientValidator;