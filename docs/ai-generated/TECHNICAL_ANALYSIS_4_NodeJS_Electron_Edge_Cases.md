# TECHNICAL ANALYSIS 4: Node.js Runtime & Electron Framework Edge Cases

## Executive Summary

This analysis covers critical edge cases and vulnerabilities in Node.js runtime and Electron framework environments, with specific focus on security, performance, and cross-platform compatibility issues that can compromise application stability and security.

---

## 1. NODE.JS RUNTIME CONSTRAINTS

### 1.1 Event Loop Blocking Scenarios

#### Critical Blocking Patterns
```javascript
// PROBLEMATIC: Synchronous CPU-intensive operations
function blockingOperation() {
    // Fibonacci calculation blocking event loop
    function fibonacci(n) {
        if (n < 2) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    return fibonacci(40); // Blocks for several seconds
}

// PROBLEMATIC: Synchronous file operations
const fs = require('fs');
const data = fs.readFileSync('large-file.txt'); // Blocks until complete

// PROBLEMATIC: Infinite loops in main thread
while (true) {
    // Event loop completely blocked
    someCalculation();
}
```

#### Mitigation Strategies
```javascript
// SOLUTION 1: Worker Threads for CPU-intensive tasks
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
    const worker = new Worker(__filename);
    worker.postMessage(40);
    worker.on('message', (result) => {
        console.log('Fibonacci result:', result);
    });
} else {
    parentPort.on('message', (n) => {
        const result = fibonacci(n);
        parentPort.postMessage(result);
        });
    }
}
```

---

## 4. SECURITY & VULNERABILITY SCENARIOS

### 4.1 Context Bridge Exploitation Risks

#### Vulnerable Context Bridge Implementations
```javascript
// PROBLEMATIC: Over-exposed context bridge
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Exposes entire ipcRenderer (DANGEROUS)
    ipc: ipcRenderer,
    
    // Direct access to Node.js modules (DANGEROUS)
    fs: require('fs'),
    path: require('path'),
    os: require('os'),
    
    // Unvalidated command execution (EXTREMELY DANGEROUS)
    exec: require('child_process').exec,
    
    // Direct database access without validation
    db: require('sqlite3').Database
});
```

#### Secure Context Bridge Implementation
```javascript
// SOLUTION 1: Minimal, validated context bridge
const { contextBridge, ipcRenderer } = require('electron');
const crypto = require('crypto');

// Input validation utilities
const validators = {
    noteId: (id) => {
        if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,50}$/.test(id)) {
            throw new Error('Invalid note ID format');
        }
        return id;
    },
    
    noteContent: (content) => {
        if (typeof content !== 'string' || content.length > 100000) {
            throw new Error('Invalid note content');
        }
        return content.trim();
    },
    
    filename: (filename) => {
        if (typeof filename !== 'string' || 
            filename.length > 100 || 
            /[<>:"/\\|?*]/.test(filename) ||
            filename.startsWith('.')) {
            throw new Error('Invalid filename');
        }
        return filename;
    }
};

// Rate limiting
class RateLimit {
    constructor(maxRequests = 100, windowMs = 60000) {
        this.requests = new Map();
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }
    
    check(key) {
        const now = Date.now();
        const requests = this.requests.get(key) || [];
        
        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < this.windowMs);
        
        if (validRequests.length >= this.maxRequests) {
            throw new Error('Rate limit exceeded');
        }
        
        validRequests.push(now);
        this.requests.set(key, validRequests);
        
        return true;
    }
}

const rateLimiter = new RateLimit(50, 60000); // 50 requests per minute

// Secure API interface
const secureAPI = {
    // Note operations with validation
    async saveNote(noteData) {
        try {
            rateLimiter.check('saveNote');
            
            const validatedData = {
                id: validators.noteId(noteData.id || crypto.randomUUID()),
                title: validators.noteContent(noteData.title || 'Untitled'),
                content: validators.noteContent(noteData.content || ''),
                tags: Array.isArray(noteData.tags) 
                    ? noteData.tags.slice(0, 10).map(tag => validators.noteContent(tag))
                    : []
            };
            
            return await ipcRenderer.invoke('secure-save-note', validatedData);
            
        } catch (error) {
            console.error('Save note error:', error);
            throw new Error('Failed to save note');
        }
    },
    
    async loadNote(noteId) {
        try {
            rateLimiter.check('loadNote');
            
            const validId = validators.noteId(noteId);
            return await ipcRenderer.invoke('secure-load-note', validId);
            
        } catch (error) {
            console.error('Load note error:', error);
            throw new Error('Failed to load note');
        }
    },
    
    async deleteNote(noteId) {
        try {
            rateLimiter.check('deleteNote');
            
            const validId = validators.noteId(noteId);
            return await ipcRenderer.invoke('secure-delete-note', validId);
            
        } catch (error) {
            console.error('Delete note error:', error);
            throw new Error('Failed to delete note');
        }
    },
    
    // File operations with strict validation
    async exportNote(noteId, filename) {
        try {
            rateLimiter.check('exportNote');
            
            const validId = validators.noteId(noteId);
            const validFilename = validators.filename(filename);
            
            return await ipcRenderer.invoke('secure-export-note', {
                noteId: validId,
                filename: validFilename
            });
            
        } catch (error) {
            console.error('Export note error:', error);
            throw new Error('Failed to export note');
        }
    },
    
    // System operations with limited scope
    async getSystemInfo() {
        try {
            rateLimiter.check('getSystemInfo');
            
            const info = await ipcRenderer.invoke('get-system-info');
            
            // Filter to only safe information
            return {
                platform: info.platform,
                arch: info.arch,
                version: info.appVersion
                // Exclude: hostname, username, paths, etc.
            };
            
        } catch (error) {
            console.error('System info error:', error);
            throw new Error('Failed to get system info');
        }
    },
    
    // Event listeners with automatic cleanup
    onNoteChanged: (callback) => {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        
        const wrappedCallback = (event, data) => {
            try {
                // Validate received data
                if (data && typeof data === 'object') {
                    callback(data);
                }
            } catch (error) {
                console.error('Note changed callback error:', error);
            }
        };
        
        ipcRenderer.on('note-changed', wrappedCallback);
        
        // Return cleanup function
        return () => {
            ipcRenderer.removeListener('note-changed', wrappedCallback);
        };
    },
    
    // Utility functions (safe to expose)
    generateId: () => crypto.randomUUID(),
    
    getCurrentTimestamp: () => Date.now(),
    
    isValidNoteId: (id) => {
        try {
            validators.noteId(id);
            return true;
        } catch {
            return false;
        }
    }
};

// Expose only the secure API
contextBridge.exposeInMainWorld('electronAPI', secureAPI);

// Security monitoring
const securityMonitor = {
    violations: [],
    
    checkContextIsolation() {
        // Verify context isolation is working
        if (typeof require !== 'undefined' || 
            typeof process !== 'undefined' || 
            typeof global !== 'undefined') {
            this.reportViolation('context_isolation_breach', {
                hasRequire: typeof require !== 'undefined',
                hasProcess: typeof process !== 'undefined',
                hasGlobal: typeof global !== 'undefined'
            });
        }
    },
    
    reportViolation(type, details) {
        const violation = {
            type,
            details,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: location.href
        };
        
        this.violations.push(violation);
        console.warn('Security violation:', violation);
        
        // Report to main process if possible
        try {
            secureAPI.reportSecurityViolation?.(violation);
        } catch (error) {
            console.error('Failed to report security violation:', error);
        }
    }
};

// Initialize security monitoring
securityMonitor.checkContextIsolation();

// Periodic security checks
setInterval(() => {
    securityMonitor.checkContextIsolation();
}, 30000);
```

### 4.2 Node.js Integration Security Holes

#### Dangerous Node.js Integration Patterns
```javascript
// PROBLEMATIC: Node integration enabled
// main.js
new BrowserWindow({
    webPreferences: {
        nodeIntegration: true, // DANGEROUS
        contextIsolation: false, // DANGEROUS
        webSecurity: false // EXTREMELY DANGEROUS
    }
});

// PROBLEMATIC: Unrestricted file system access
// renderer.js (with nodeIntegration: true)
const fs = require('fs');
const path = require('path');

// User input directly used in file operations
const userPath = document.getElementById('path').value;
const content = fs.readFileSync(userPath); // Path traversal vulnerability
```

#### Secure Node.js Integration Patterns
```javascript
// SOLUTION 1: Secure main process IPC handlers
// main.js
const { ipcMain, dialog, safeStorage } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class SecureFileHandler {
    constructor() {
        this.allowedDirectories = [
            path.join(app.getPath('documents'), 'YourApp'),
            path.join(app.getPath('userData'))
        ];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedExtensions = ['.txt', '.md', '.json', '.csv'];
    }
    
    validatePath(filePath) {
        const resolvedPath = path.resolve(filePath);
        
        // Check if path is within allowed directories
        const isAllowed = this.allowedDirectories.some(allowedDir => {
            const resolvedAllowedDir = path.resolve(allowedDir);
            return resolvedPath.startsWith(resolvedAllowedDir);
        });
        
        if (!isAllowed) {
            throw new Error('Access denied: Path not in allowed directory');
        }
        
        // Check file extension
        const extension = path.extname(resolvedPath).toLowerCase();
        if (!this.allowedExtensions.includes(extension)) {
            throw new Error(`File type not allowed: ${extension}`);
        }
        
        return resolvedPath;
    }
    
    async ensureDirectory(dirPath) {
        const validPath = this.validatePath(dirPath);
        try {
            await fs.mkdir(validPath, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }
    
    async readFileSecurely(filePath) {
        const validPath = this.validatePath(filePath);
        
        try {
            const stats = await fs.stat(validPath);
            
            if (stats.size > this.maxFileSize) {
                throw new Error(`File too large: ${stats.size} bytes`);
            }
            
            const content = await fs.readFile(validPath, 'utf8');
            
            return {
                success: true,
                content,
                size: stats.size,
                modified: stats.mtime
            };
            
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error('File not found');
            } else if (error.code === 'EACCES') {
                throw new Error('Permission denied');
            }
            throw error;
        }
    }
    
    async writeFileSecurely(filePath, content) {
        const validPath = this.validatePath(filePath);
        
        if (typeof content !== 'string') {
            throw new Error('Content must be a string');
        }
        
        if (Buffer.byteLength(content, 'utf8') > this.maxFileSize) {
            throw new Error('Content too large');
        }
        
        // Ensure directory exists
        await this.ensureDirectory(path.dirname(validPath));
        
        // Write to temporary file first
        const tempPath = `${validPath}.tmp.${crypto.randomUUID()}`;
        
        try {
            await fs.writeFile(tempPath, content, 'utf8');
            
            // Atomic move to final location
            await fs.rename(tempPath, validPath);
            
            return {
                success: true,
                path: validPath,
                size: Buffer.byteLength(content, 'utf8')
            };
            
        } catch (error) {
            // Clean up temp file
            try {
                await fs.unlink(tempPath);
            } catch {
                // Ignore cleanup errors
            }
            
            throw error;
        }
    }
    
    async deleteFileSecurely(filePath) {
        const validPath = this.validatePath(filePath);
        
        try {
            await fs.unlink(validPath);
            return { success: true };
        } catch (error) {
            if (error.code === 'ENOENT') {
                return { success: true }; // Already deleted
            }
            throw error;
        }
    }
    
    async listFilesSecurely(dirPath) {
        const validPath = this.validatePath(dirPath);
        
        try {
            const entries = await fs.readdir(validPath, { withFileTypes: true });
            
            const files = [];
            for (const entry of entries) {
                if (entry.isFile()) {
                    const extension = path.extname(entry.name).toLowerCase();
                    if (this.allowedExtensions.includes(extension)) {
                        const filePath = path.join(validPath, entry.name);
                        const stats = await fs.stat(filePath);
                        
                        files.push({
                            name: entry.name,
                            path: filePath,
                            size: stats.size,
                            modified: stats.mtime
                        });
                    }
                }
            }
            
            return { success: true, files };
            
        } catch (error) {
            if (error.code === 'ENOENT') {
                return { success: true, files: [] };
            }
            throw error;
        }
    }
}

const fileHandler = new SecureFileHandler();

// Secure IPC handlers
ipcMain.handle('secure-read-file', async (event, filePath) => {
    try {
        return await fileHandler.readFileSecurely(filePath);
    } catch (error) {
        console.error('Secure read file error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('secure-write-file', async (event, { filePath, content }) => {
    try {
        return await fileHandler.writeFileSecurely(filePath, content);
    } catch (error) {
        console.error('Secure write file error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('secure-delete-file', async (event, filePath) => {
    try {
        return await fileHandler.deleteFileSecurely(filePath);
    } catch (error) {
        console.error('Secure delete file error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('secure-list-files', async (event, dirPath) => {
    try {
        return await fileHandler.listFilesSecurely(dirPath);
    } catch (error) {
        console.error('Secure list files error:', error);
        return { success: false, error: error.message };
    }
});

// Secure dialog handlers
ipcMain.handle('show-open-dialog', async (event, options = {}) => {
    try {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'Text Files', extensions: ['txt', 'md'] },
                { name: 'JSON Files', extensions: ['json'] }
            ],
            ...options
        });
        
        return result;
    } catch (error) {
        console.error('Open dialog error:', error);
        return { canceled: true };
    }
});

ipcMain.handle('show-save-dialog', async (event, options = {}) => {
    try {
        const result = await dialog.showSaveDialog({
            filters: [
                { name: 'Text Files', extensions: ['txt', 'md'] },
                { name: 'JSON Files', extensions: ['json'] }
            ],
            ...options
        });
        
        return result;
    } catch (error) {
        console.error('Save dialog error:', error);
        return { canceled: true };
    }
});
```

### 4.3 XSS Vulnerabilities in Note Content

#### XSS Attack Vectors
```javascript
// PROBLEMATIC: Unsanitized content rendering
// renderer.js
function displayNote(note) {
    // Direct HTML injection (DANGEROUS)
    document.getElementById('content').innerHTML = note.content;
    
    // Unsanitized title (DANGEROUS)
    document.title = note.title;
    
    // Dynamic script execution (EXTREMELY DANGEROUS)
    eval(note.script);
}

// PROBLEMATIC: Unsafe content handling
const noteContent = '<script>alert("XSS")</script><p>Note content</p>';
document.body.innerHTML = noteContent; // XSS vulnerability
```

#### Comprehensive XSS Prevention
```javascript
// SOLUTION 1: Content sanitization system
class ContentSanitizer {
    constructor() {
        // Initialize DOMPurify if available
        this.purify = this.initializeDOMPurify();
        
        // Fallback sanitization rules
        this.dangerousTags = [
            'script', 'iframe', 'embed', 'object', 'applet',
            'link', 'meta', 'base', 'form', 'input', 'textarea',
            'button', 'select', 'option'
        ];
        
        this.dangerousAttributes = [
            'onclick', 'onmouseover', 'onload', 'onerror',
            'onfocus', 'onblur', 'onchange', 'onsubmit',
            'javascript:', 'vbscript:', 'data:', 'file:'
        ];
        
        this.allowedTags = [
            'p', 'div', 'span', 'br', 'strong', 'em', 'u',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
            'a', 'img'
        ];
        
        this.allowedAttributes = {
            'a': ['href', 'title'],
            'img': ['src', 'alt', 'width', 'height'],
            'all': ['class', 'id', 'style']
        };
    }
    
    initializeDOMPurify() {
        try {
            // Try to use DOMPurify if available
            const createDOMPurify = require('dompurify');
            const { JSDOM } = require('jsdom');
            
            const window = new JSDOM('').window;
            return createDOMPurify(window);
        } catch (error) {
            console.warn('DOMPurify not available, using fallback sanitization');
            return null;
        }
    }
    
    sanitizeHTML(htmlContent) {
        if (typeof htmlContent !== 'string') {
            return '';
        }
        
        if (this.purify) {
            return this.purify.sanitize(htmlContent, {
                ALLOWED_TAGS: this.allowedTags,
                ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'width', 'height', 'class', 'id'],
                ALLOW_DATA_ATTR: false,
                FORBID_SCRIPT: true,
                FORBID_TAGS: this.dangerousTags,
                FORBID_ATTR: this.dangerousAttributes
            });
        }
        
        return this.fallbackSanitize(htmlContent);
    }
    
    fallbackSanitize(htmlContent) {
        let sanitized = htmlContent;
        
        // Remove dangerous tags
        this.dangerousTags.forEach(tag => {
            const regex = new RegExp(`</?${tag}[^>]*>`, 'gi');
            sanitized = sanitized.replace(regex, '');
        });
        
        // Remove dangerous attributes
        this.dangerousAttributes.forEach(attr => {
            const regex = new RegExp(`${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
            sanitized = sanitized.replace(regex, '');
        });
        
        // Remove javascript: and data: URLs
        sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
        sanitized = sanitized.replace(/src\s*=\s*["']data:[^"']*["']/gi, '');
        
        return sanitized;
    }
    
    sanitizeText(textContent) {
        if (typeof textContent !== 'string') {
            return '';
        }
        
        // HTML entity encoding for text content
        return textContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    
    sanitizeURL(url) {
        if (typeof url !== 'string') {
            return '';
        }
        
        // Allow only safe protocols
        const safeProtocols = ['http:', 'https:', 'mailto:'];
        
        try {
            const parsedUrl = new URL(url);
            
            if (!safeProtocols.includes(parsedUrl.protocol)) {
                return '';
            }
            
            return parsedUrl.toString();
        } catch {
            // Invalid URL
            return '';
        }
    }
    
    sanitizeCSS(cssContent) {
        if (typeof cssContent !== 'string') {
            return '';
        }
        
        // Remove potentially dangerous CSS
        let sanitized = cssContent;
        
        // Remove expressions and imports
        sanitized = sanitized.replace(/expression\s*\(/gi, '');
        sanitized = sanitized.replace(/@import/gi, '');
        sanitized = sanitized.replace(/javascript:/gi, '');
        sanitized = sanitized.replace(/vbscript:/gi, '');
        
        // Remove behavior and binding
        sanitized = sanitized.replace(/behavior\s*:/gi, '');
        sanitized = sanitized.replace(/-moz-binding\s*:/gi, '');
        
        return sanitized;
    }
}

// SOLUTION 2: Safe content rendering system
class SafeContentRenderer {
    constructor() {
        this.sanitizer = new ContentSanitizer();
        this.templates = new Map();
        
        this.initializeTemplates();
    }
    
    initializeTemplates() {
        // Pre-compile safe templates
        this.templates.set('note', `
            <div class="note-container" data-note-id="{{noteId}}">
                <div class="note-header">
                    <h1 class="note-title">{{title}}</h1>
                    <div class="note-meta">
                        <span class="note-date">{{date}}</span>
                        <span class="note-tags">{{tags}}</span>
                    </div>
                </div>
                <div class="note-content">{{content}}</div>
            </div>
        `);
        
        this.templates.set('tag', `
            <span class="tag" data-tag="{{name}}">{{name}}</span>
        `);
        
        this.templates.set('error', `
            <div class="error-message">
                <strong>Error:</strong> {{message}}
            </div>
        `);
    }
    
    renderNote(noteData, targetElement) {
        if (!noteData || typeof noteData !== 'object') {
            throw new Error('Invalid note data');
        }
        
        try {
            // Sanitize all input data
            const sanitizedData = {
                noteId: this.sanitizer.sanitizeText(noteData.id || ''),
                title: this.sanitizer.sanitizeText(noteData.title || 'Untitled'),
                content: this.sanitizer.sanitizeHTML(noteData.content || ''),
                date: this.formatDate(noteData.createdAt || new Date()),
                tags: this.renderTags(noteData.tags || [])
            };
            
            // Render using template
            const html = this.processTemplate('note', sanitizedData);
            
            // Safely inject into DOM
            this.safeInjectHTML(targetElement, html);
            
            // Set up safe event listeners
            this.setupNoteEventListeners(targetElement, sanitizedData.noteId);
            
        } catch (error) {
            console.error('Note rendering error:', error);
            this.renderError(targetElement, 'Failed to render note content');
        }
    }
    
    renderTags(tags) {
        if (!Array.isArray(tags)) {
            return '';
        }
        
        return tags
            .filter(tag => typeof tag === 'string' && tag.trim())
            .slice(0, 10) // Limit number of tags
            .map(tag => {
                const sanitizedTag = this.sanitizer.sanitizeText(tag.trim());
                return this.processTemplate('tag', { name: sanitizedTag });
            })
            .join('');
    }
    
    processTemplate(templateName, data) {
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Template not found: ${templateName}`);
        }
        
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] || '';
        });
    }
    
    safeInjectHTML(element, html) {
        if (!element || !element.nodeType) {
            throw new Error('Invalid target element');
        }
        
        // Clear existing content
        element.innerHTML = '';
        
        // Create document fragment for safe injection
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Move nodes from temp div to fragment
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }
        
        // Inject fragment into target element
        element.appendChild(fragment);
    }
    
    setupNoteEventListeners(container, noteId) {
        // Safe event delegation
        container.addEventListener('click', (event) => {
            const target = event.target;
            
            // Handle tag clicks
            if (target.classList.contains('tag')) {
                event.preventDefault();
                const tagName = target.dataset.tag;
                if (tagName) {
                    this.handleTagClick(this.sanitizer.sanitizeText(tagName));
                }
            }
            
            // Handle link clicks
            if (target.tagName === 'A') {
                event.preventDefault();
                const href = target.getAttribute('href');
                if (href) {
                    const sanitizedURL = this.sanitizer.sanitizeURL(href);
                    if (sanitizedURL) {
                        this.handleLinkClick(sanitizedURL);
                    }
                }
            }
        });
    }
    
    handleTagClick(tagName) {
        // Safe tag click handling
        if (window.electronAPI && window.electronAPI.searchByTag) {
            window.electronAPI.searchByTag(tagName);
        }
    }
    
    handleLinkClick(url) {
        // Safe link click handling
        if (window.electronAPI && window.electronAPI.openExternal) {
            window.electronAPI.openExternal(url);
        }
    }
    
    renderError(targetElement, message) {
        const sanitizedMessage = this.sanitizer.sanitizeText(message);
        const errorHTML = this.processTemplate('error', { message: sanitizedMessage });
        this.safeInjectHTML(targetElement, errorHTML);
    }
    
    formatDate(date) {
        try {
            return new Date(date).toLocaleDateString();
        } catch {
            return 'Unknown date';
        }
    }
    
    // Content Security Policy helpers
    generateCSPNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode.apply(null, array));
    }
    
    setContentSecurityPolicy() {
        const nonce = this.generateCSPNonce();
        
        const csp = [
            "default-src 'self'",
            `script-src 'self' 'nonce-${nonce}'`,
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self'",
            "connect-src 'self'",
            "frame-src 'none'",
            "object-src 'none'"
        ].join('; ');
        
        const metaTag = document.createElement('meta');
        metaTag.httpEquiv = 'Content-Security-Policy';
        metaTag.content = csp;
        document.head.appendChild(metaTag);
        
        return nonce;
    }
}

// Initialize secure content handling
const contentSanitizer = new ContentSanitizer();
const contentRenderer = new SafeContentRenderer();

// Set up CSP
contentRenderer.setContentSecurityPolicy();

// Export for use in application
window.safeContentRenderer = contentRenderer;
```

## CONCLUSION

This comprehensive technical analysis covers the critical edge cases and vulnerabilities in Node.js runtime and Electron framework environments. Key takeaways include:

### Node.js Runtime Security
- **Event Loop Protection**: Implement worker threads and monitoring for CPU-intensive operations
- **Promise Management**: Comprehensive error handling and timeout mechanisms
- **Stream Security**: Backpressure control and memory monitoring
- **Buffer Safety**: Input validation and bounds checking
- **Module Loading**: Whitelist approaches and circular dependency detection

### Electron Framework Security
- **IPC Security**: Validated message handling and rate limiting
- **Context Isolation**: Minimal API exposure and runtime monitoring
- **Native Modules**: Compatibility checking and graceful fallbacks
- **Update Security**: Signature verification and rollback mechanisms
- **Build Security**: Content validation and secure distribution

### Cross-Platform Compatibility
- **Platform Abstraction**: Unified APIs for platform-specific functionality
- **Path Handling**: Validation and normalization across file systems
- **Shortcut Management**: Platform-aware key mapping and conflict detection
- **Notification Systems**: Capability detection and fallback mechanisms

### XSS and Content Security
- **Input Sanitization**: Multi-layer content filtering
- **Safe Rendering**: Template-based content injection
- **CSP Implementation**: Runtime content security policies
- **Event Security**: Validated event handling and delegation

### Testing Strategies
Each mitigation strategy should be thoroughly tested with:
- Unit tests for individual components
- Integration tests for system interactions
- Security tests for vulnerability scenarios
- Cross-platform tests for compatibility
- Performance tests for edge case handling

### Monitoring and Maintenance
Implement continuous monitoring for:
- Event loop performance metrics
- Memory usage patterns
- Security violation attempts
- Cross-platform compatibility issues
- Update mechanism integrity

This analysis provides a foundation for building secure, performant, and cross-platform Electron applications that can handle edge cases gracefully while maintaining strong security postures.
}

// SOLUTION 3: Monitoring event loop lag
const { monitorEventLoopDelay } = require('perf_hooks');
const monitor = monitorEventLoopDelay({ resolution: 20 });
monitor.enable();

setInterval(() => {
    const lag = monitor.mean / 1e6; // Convert to milliseconds
    if (lag > 10) {
        console.warn(`Event loop lag detected: ${lag}ms`);
    }
    monitor.reset();
}, 1000);
```

### 1.2 Promise Rejection Handling Failures

#### Common Failure Patterns
```javascript
// PROBLEMATIC: Unhandled promise rejection
async function riskyOperation() {
    throw new Error('Database connection failed');
}

riskyOperation(); // Unhandled rejection - crashes in Node.js 15+

// PROBLEMATIC: Promise chain without error handling
fetchUserData()
    .then(processData)
    .then(saveToDatabase); // No .catch() handler

// PROBLEMATIC: Mixed async/sync error handling
async function mixedErrorHandling() {
    try {
        const result = await someAsyncOperation();
        JSON.parse(result); // Sync error not caught properly
        return result;
    } catch (error) {
        // Only catches async errors
        console.error('Async error:', error);
    }
}
```

#### Comprehensive Error Handling
```javascript
// SOLUTION 1: Global unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Log to monitoring service
    logError('unhandled_rejection', { reason, promise });
    
    // Graceful shutdown
    gracefulShutdown();
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    logError('uncaught_exception', error);
    process.exit(1);
});

// SOLUTION 2: Promise wrapper with timeout
function promiseWithTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Operation timed out after ${timeoutMs}ms`));
            }, timeoutMs);
        })
    ]);
}

// SOLUTION 3: Comprehensive async error handling
async function robustAsyncOperation() {
    try {
        const result = await promiseWithTimeout(
            someAsyncOperation(),
            5000
        );
        
        // Handle sync operations that might throw
        let parsedResult;
        try {
            parsedResult = JSON.parse(result);
        } catch (parseError) {
            throw new Error(`JSON parsing failed: ${parseError.message}`);
        }
        
        return parsedResult;
    } catch (error) {
        // Log structured error information
        console.error('Operation failed:', {
            operation: 'robustAsyncOperation',
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        // Re-throw or handle based on error type
        if (error.code === 'TIMEOUT') {
            throw new Error('Service temporarily unavailable');
        }
        throw error;
    }
}
```

### 1.3 Stream Processing Limitations

#### Memory and Backpressure Issues
```javascript
// PROBLEMATIC: No backpressure handling
const fs = require('fs');
const { Transform } = require('stream');

const readStream = fs.createReadStream('huge-file.txt');
const processStream = new Transform({
    transform(chunk, encoding, callback) {
        // Slow processing without backpressure control
        setTimeout(() => {
            this.push(chunk.toString().toUpperCase());
            callback();
        }, 100);
    }
});

readStream.pipe(processStream); // Memory buildup risk

// PROBLEMATIC: Stream error handling
const pipeline = fs.createReadStream('input.txt')
    .pipe(transformStream)
    .pipe(fs.createWriteStream('output.txt'));
// No error handling - can leave files in inconsistent state
```

#### Robust Stream Implementation
```javascript
const { pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);

// SOLUTION 1: Proper backpressure and error handling
class BackpressureTransform extends Transform {
    constructor(options = {}) {
        super({
            ...options,
            highWaterMark: options.highWaterMark || 16 * 1024, // 16KB chunks
            objectMode: options.objectMode || false
        });
        this.processing = 0;
        this.maxConcurrency = options.maxConcurrency || 5;
    }
    
    _transform(chunk, encoding, callback) {
        if (this.processing >= this.maxConcurrency) {
            // Apply backpressure
            return callback(new Error('Processing capacity exceeded'));
        }
        
        this.processing++;
        this.processChunk(chunk)
            .then(result => {
                this.processing--;
                this.push(result);
                callback();
            })
            .catch(error => {
                this.processing--;
                callback(error);
            });
    }
    
    async processChunk(chunk) {
        // Simulate async processing
        await new Promise(resolve => setTimeout(resolve, 10));
        return chunk.toString().toUpperCase();
    }
}

// SOLUTION 2: Stream pipeline with comprehensive error handling
async function processFileStream(inputPath, outputPath) {
    try {
        await pipelineAsync(
            fs.createReadStream(inputPath),
            new BackpressureTransform({ maxConcurrency: 3 }),
            fs.createWriteStream(outputPath)
        );
        console.log('Stream processing completed successfully');
    } catch (error) {
        console.error('Stream processing failed:', error);
        
        // Cleanup incomplete output file
        try {
            await fs.promises.unlink(outputPath);
        } catch (cleanupError) {
            console.error('Cleanup failed:', cleanupError);
        }
        
        throw error;
    }
}

// SOLUTION 3: Memory usage monitoring for streams
const v8 = require('v8');

function monitorMemoryUsage(streamName) {
    const interval = setInterval(() => {
        const stats = v8.getHeapStatistics();
        const usedMB = stats.used_heap_size / 1024 / 1024;
        const totalMB = stats.heap_size_limit / 1024 / 1024;
        
        if (usedMB > totalMB * 0.8) {
            console.warn(`Memory usage high in ${streamName}: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);
        }
    }, 1000);
    
    return () => clearInterval(interval);
}
```

### 1.4 Buffer Overflow Scenarios

#### Vulnerable Buffer Operations
```javascript
// PROBLEMATIC: Unsafe buffer allocation
const buffer = Buffer.allocUnsafe(1024); // Contains arbitrary memory
console.log(buffer); // May expose sensitive data

// PROBLEMATIC: Buffer overflow in concatenation
function unsafeConcatenation(chunks) {
    let totalLength = 0;
    chunks.forEach(chunk => totalLength += chunk.length);
    
    const result = Buffer.allocUnsafe(totalLength); // Potential integer overflow
    let offset = 0;
    
    chunks.forEach(chunk => {
        chunk.copy(result, offset); // No bounds checking
        offset += chunk.length;
    });
    
    return result;
}

// PROBLEMATIC: String to buffer conversion issues
const userInput = 'potentially very long string from user';
const buffer = Buffer.from(userInput); // No size limits
```

#### Secure Buffer Handling
```javascript
// SOLUTION 1: Safe buffer allocation and bounds checking
function safeConcatenation(chunks, maxSize = 10 * 1024 * 1024) {
    let totalLength = 0;
    
    // Check for potential overflow and size limits
    for (const chunk of chunks) {
        if (!Buffer.isBuffer(chunk)) {
            throw new Error('Invalid chunk: must be Buffer');
        }
        
        totalLength += chunk.length;
        
        if (totalLength > maxSize) {
            throw new Error(`Buffer size exceeds maximum: ${maxSize} bytes`);
        }
        
        if (totalLength < 0) {
            throw new Error('Integer overflow detected in buffer size calculation');
        }
    }
    
    // Use safe allocation
    const result = Buffer.alloc(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
        if (offset + chunk.length > result.length) {
            throw new Error('Buffer overflow protection triggered');
        }
        
        chunk.copy(result, offset, 0, chunk.length);
        offset += chunk.length;
    }
    
    return result;
}

// SOLUTION 2: Input validation and sanitization
class SecureBufferHandler {
    constructor(maxBufferSize = 1024 * 1024) { // 1MB default
        this.maxBufferSize = maxBufferSize;
    }
    
    fromString(str, encoding = 'utf8') {
        if (typeof str !== 'string') {
            throw new Error('Input must be a string');
        }
        
        // Calculate byte length before allocation
        const byteLength = Buffer.byteLength(str, encoding);
        
        if (byteLength > this.maxBufferSize) {
            throw new Error(`String too large: ${byteLength} bytes exceeds ${this.maxBufferSize} bytes`);
        }
        
        return Buffer.from(str, encoding);
    }
    
    concat(buffers) {
        if (!Array.isArray(buffers)) {
            throw new Error('Input must be an array of buffers');
        }
        
        return safeConcatenation(buffers, this.maxBufferSize);
    }
    
    slice(buffer, start = 0, end = buffer.length) {
        if (!Buffer.isBuffer(buffer)) {
            throw new Error('Input must be a buffer');
        }
        
        // Validate slice parameters
        start = Math.max(0, Math.floor(start));
        end = Math.min(buffer.length, Math.floor(end));
        
        if (start >= end) {
            return Buffer.alloc(0);
        }
        
        return buffer.slice(start, end);
    }
}

// SOLUTION 3: Memory pool management
class BufferPool {
    constructor(poolSize = 10, bufferSize = 64 * 1024) {
        this.poolSize = poolSize;
        this.bufferSize = bufferSize;
        this.available = [];
        this.inUse = new Set();
        
        // Pre-allocate buffers
        for (let i = 0; i < poolSize; i++) {
            this.available.push(Buffer.alloc(bufferSize));
        }
    }
    
    acquire() {
        if (this.available.length === 0) {
            if (this.inUse.size >= this.poolSize * 2) {
                throw new Error('Buffer pool exhausted');
            }
            // Create new buffer if pool is empty but not at hard limit
            return Buffer.alloc(this.bufferSize);
        }
        
        const buffer = this.available.pop();
        this.inUse.add(buffer);
        return buffer;
    }
    
    release(buffer) {
        if (!this.inUse.has(buffer)) {
            throw new Error('Buffer not from this pool');
        }
        
        this.inUse.delete(buffer);
        buffer.fill(0); // Clear sensitive data
        this.available.push(buffer);
    }
    
    destroy() {
        this.available.length = 0;
        this.inUse.clear();
    }
}
```

### 1.5 Module Loading Conflicts

#### Common Module Conflicts
```javascript
// PROBLEMATIC: Version conflicts
// package.json dependencies
{
  "dependencies": {
    "lodash": "^4.17.21",
    "some-package": "^1.0.0" // Depends on lodash ^3.0.0
  }
}

// PROBLEMATIC: Circular dependencies
// fileA.js
const fileB = require('./fileB');
module.exports = { functionA: () => fileB.functionB() };

// fileB.js
const fileA = require('./fileA');
module.exports = { functionB: () => fileA.functionA() };

// PROBLEMATIC: Dynamic require() calls
const moduleName = getUserInput(); // User-controlled input
const dynamicModule = require(moduleName); // Security risk
```

#### Module Management Solutions
```javascript
// SOLUTION 1: Dependency resolution strategies
const path = require('path');
const fs = require('fs');

class ModuleResolver {
    constructor() {
        this.loadedModules = new Map();
        this.circularDeps = new Set();
    }
    
    safeRequire(modulePath, options = {}) {
        const { allowCircular = false, timeout = 5000 } = options;
        
        // Resolve absolute path
        const resolvedPath = path.resolve(modulePath);
        
        // Check for circular dependency
        if (this.circularDeps.has(resolvedPath)) {
            if (!allowCircular) {
                throw new Error(`Circular dependency detected: ${resolvedPath}`);
            }
        }
        
        // Check if already loaded
        if (this.loadedModules.has(resolvedPath)) {
            return this.loadedModules.get(resolvedPath);
        }
        
        // Mark as loading to detect circular deps
        this.circularDeps.add(resolvedPath);
        
        try {
            // Validate module path
            if (!this.isValidModulePath(resolvedPath)) {
                throw new Error(`Invalid module path: ${resolvedPath}`);
            }
            
            // Load with timeout
            const modulePromise = new Promise((resolve, reject) => {
                try {
                    const module = require(resolvedPath);
                    resolve(module);
                } catch (error) {
                    reject(error);
                }
            });
            
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Module load timeout')), timeout);
            });
            
            const module = Promise.race([modulePromise, timeoutPromise]);
            
            this.loadedModules.set(resolvedPath, module);
            return module;
            
        } finally {
            this.circularDeps.delete(resolvedPath);
        }
    }
    
    isValidModulePath(modulePath) {
        // Whitelist approach for security
        const allowedPaths = [
            path.join(__dirname, 'modules'),
            path.join(__dirname, 'lib'),
            'node_modules'
        ];
        
        return allowedPaths.some(allowed => 
            modulePath.startsWith(path.resolve(allowed))
        );
    }
}

// SOLUTION 2: Version conflict detection
function detectVersionConflicts() {
    const packageLock = require('./package-lock.json');
    const conflicts = [];
    
    function checkDependencies(deps, path = '') {
        for (const [name, info] of Object.entries(deps)) {
            const versions = findAllVersions(name, packageLock);
            if (versions.length > 1) {
                conflicts.push({
                    package: name,
                    versions: versions,
                    path: path
                });
            }
            
            if (info.dependencies) {
                checkDependencies(info.dependencies, `${path}/${name}`);
            }
        }
    }
    
    checkDependencies(packageLock.dependencies);
    return conflicts;
}

// SOLUTION 3: Safe dynamic imports
class SafeModuleLoader {
    constructor() {
        this.allowedModules = new Set([
            'fs', 'path', 'crypto', 'util'
            // Add your allowed modules
        ]);
    }
    
    async dynamicImport(moduleName, options = {}) {
        // Validate module name
        if (!this.isAllowedModule(moduleName)) {
            throw new Error(`Module not allowed: ${moduleName}`);
        }
        
        // Use dynamic import for ES modules
        try {
            if (options.type === 'esm') {
                return await import(moduleName);
            } else {
                return require(moduleName);
            }
        } catch (error) {
            throw new Error(`Failed to load module ${moduleName}: ${error.message}`);
        }
    }
    
    isAllowedModule(moduleName) {
        // Check against whitelist
        if (this.allowedModules.has(moduleName)) {
            return true;
        }
        
        // Check if it's a built-in Node.js module
        try {
            return require('module').builtinModules.includes(moduleName);
        } catch {
            return false;
        }
    }
    
    addAllowedModule(moduleName) {
        this.allowedModules.add(moduleName);
    }
}
```

---

## 2. ELECTRON FRAMEWORK EDGE CASES

### 2.1 Main/Renderer Process Communication Failures

#### Common Communication Issues
```javascript
// PROBLEMATIC: Direct object passing (security risk)
// main.js
const { ipcMain } = require('electron');

ipcMain.handle('get-user-data', async (event) => {
    // Direct return of sensitive object
    return {
        password: 'secret123',
        apiKeys: ['key1', 'key2'],
        internalConfig: process.env
    };
});

// PROBLEMATIC: Unvalidated message handling
// renderer.js
const { ipcRenderer } = require('electron');

// No validation of received data
ipcRenderer.on('update-ui', (event, data) => {
    document.innerHTML = data; // XSS vulnerability
});

// PROBLEMATIC: Synchronous IPC blocking UI
const result = ipcRenderer.sendSync('heavy-computation', largeData);
```

#### Secure IPC Implementation
```javascript
// SOLUTION 1: Secure message validation and sanitization
// main.js
const { ipcMain, dialog } = require('electron');
const Joi = require('joi'); // For validation

class SecureIPCHandler {
    constructor() {
        this.messageSchema = {
            'save-note': Joi.object({
                title: Joi.string().max(100).required(),
                content: Joi.string().max(10000).required(),
                tags: Joi.array().items(Joi.string().max(20)).max(10)
            }),
            'load-notes': Joi.object({
                limit: Joi.number().integer().min(1).max(100).default(20),
                offset: Joi.number().integer().min(0).default(0)
            })
        };
        
        this.setupHandlers();
    }
    
    setupHandlers() {
        ipcMain.handle('save-note', async (event, data) => {
            try {
                // Validate input
                const validatedData = await this.validateMessage('save-note', data);
                
                // Sanitize content
                const sanitizedNote = this.sanitizeNote(validatedData);
                
                // Process with rate limiting
                await this.rateLimit(event.sender.id, 'save-note');
                
                const result = await this.saveNote(sanitizedNote);
                return { success: true, noteId: result.id };
                
            } catch (error) {
                console.error('Save note error:', error);
                return { success: false, error: error.message };
            }
        });
        
        ipcMain.handle('load-notes', async (event, data) => {
            try {
                const validatedData = await this.validateMessage('load-notes', data);
                const notes = await this.loadNotes(validatedData);
                
                // Filter sensitive data before sending
                const publicNotes = notes.map(note => ({
                    id: note.id,
                    title: note.title,
                    content: note.content,
                    createdAt: note.createdAt
                    // Exclude: internalId, userId, metadata
                }));
                
                return { success: true, notes: publicNotes };
                
            } catch (error) {
                console.error('Load notes error:', error);
                return { success: false, error: 'Failed to load notes' };
            }
        });
    }
    
    async validateMessage(messageType, data) {
        const schema = this.messageSchema[messageType];
        if (!schema) {
            throw new Error(`Unknown message type: ${messageType}`);
        }
        
        const { error, value } = schema.validate(data);
        if (error) {
            throw new Error(`Validation failed: ${error.details[0].message}`);
        }
        
        return value;
    }
    
    sanitizeNote(note) {
        const DOMPurify = require('isomorphic-dompurify');
        
        return {
            ...note,
            title: this.sanitizeString(note.title),
            content: DOMPurify.sanitize(note.content),
            tags: note.tags?.map(tag => this.sanitizeString(tag)) || []
        };
    }
    
    sanitizeString(str) {
        return str
            .replace(/[<>]/g, '') // Remove HTML brackets
            .trim()
            .substring(0, 1000); // Limit length
    }
    
    async rateLimit(senderId, operation) {
        const key = `${senderId}-${operation}`;
        const now = Date.now();
        const windowMs = 60000; // 1 minute
        const maxRequests = 30;
        
        if (!this.rateLimitStore) {
            this.rateLimitStore = new Map();
        }
        
        const requests = this.rateLimitStore.get(key) || [];
        const recentRequests = requests.filter(time => now - time < windowMs);
        
        if (recentRequests.length >= maxRequests) {
            throw new Error('Rate limit exceeded');
        }
        
        recentRequests.push(now);
        this.rateLimitStore.set(key, recentRequests);
    }
}

// SOLUTION 2: Context Bridge implementation
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe API to renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Note operations
    saveNote: async (noteData) => {
        return await ipcRenderer.invoke('save-note', noteData);
    },
    
    loadNotes: async (options = {}) => {
        return await ipcRenderer.invoke('load-notes', options);
    },
    
    // System operations
    showDialog: async (type, options) => {
        const allowedTypes = ['info', 'warning', 'error'];
        if (!allowedTypes.includes(type)) {
            throw new Error('Invalid dialog type');
        }
        return await ipcRenderer.invoke('show-dialog', { type, options });
    },
    
    // Event listeners with cleanup
    onNoteUpdate: (callback) => {
        const handler = (event, data) => {
            // Validate callback
            if (typeof callback !== 'function') {
                console.error('Callback must be a function');
                return;
            }
            callback(data);
        };
        
        ipcRenderer.on('note-updated', handler);
        
        // Return cleanup function
        return () => {
            ipcRenderer.removeListener('note-updated', handler);
        };
    }
});

// SOLUTION 3: Message queuing and error recovery
// renderer.js
class RobustIPCClient {
    constructor() {
        this.pendingRequests = new Map();
        this.requestTimeout = 10000; // 10 seconds
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
        
        this.setupErrorHandling();
    }
    
    async sendMessage(channel, data, options = {}) {
        const requestId = this.generateRequestId();
        const { timeout = this.requestTimeout, retries = this.maxRetries } = options;
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const result = await this.sendWithTimeout(channel, data, timeout);
                return result;
                
            } catch (error) {
                if (attempt === retries) {
                    throw new Error(`IPC request failed after ${retries + 1} attempts: ${error.message}`);
                }
                
                console.warn(`IPC attempt ${attempt + 1} failed, retrying:`, error.message);
                await this.delay(this.retryDelay * Math.pow(2, attempt)); // Exponential backoff
            }
        }
    }
    
    async sendWithTimeout(channel, data, timeout) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`IPC request timeout: ${channel}`));
            }, timeout);
            
            window.electronAPI[channel](data)
                .then(result => {
                    clearTimeout(timeoutId);
                    
                    if (result && result.success === false) {
                        reject(new Error(result.error || 'IPC request failed'));
                    } else {
                        resolve(result);
                    }
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    reject(error);
                });
        });
    }
    
    setupErrorHandling() {
        // Handle main process crashes
        window.addEventListener('beforeunload', () => {
            this.pendingRequests.clear();
        });
        
        // Monitor IPC health
        setInterval(() => {
            this.healthCheck();
        }, 30000);
    }
    
    async healthCheck() {
        try {
            await this.sendMessage('ping', {}, { timeout: 5000, retries: 1 });
        } catch (error) {
            console.error('IPC health check failed:', error);
            this.handleIPCFailure();
        }
    }
    
    handleIPCFailure() {
        // Show user notification
        this.showOfflineMessage();
        
        // Attempt to reload the renderer
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    }
    
    generateRequestId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showOfflineMessage() {
        // Implementation depends on your UI framework
        console.error('Lost connection to main process');
    }
}
```

### 2.2 Context Isolation Security Issues

#### Security Vulnerabilities
```javascript
// VULNERABLE: Context isolation disabled
// main.js
new BrowserWindow({
    webPreferences: {
        contextIsolation: false, // DANGEROUS
        nodeIntegration: true,   // DANGEROUS
        enableRemoteModule: true // DANGEROUS
    }
});

// VULNERABLE: Unsafe context bridge exposure
// preload.js
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Exposes entire Node.js require function
    require: require, // EXTREMELY DANGEROUS
    
    // Exposes process object
    process: process, // DANGEROUS
    
    // No input validation
    executeCommand: (cmd) => {
        require('child_process').exec(cmd); // DANGEROUS
    }
});
```

#### Secure Context Isolation
```javascript
// SOLUTION 1: Proper security configuration
// main.js
const { BrowserWindow, session } = require('electron');
const path = require('path');

function createSecureWindow() {
    // Configure secure session
    const partition = 'persist:secure-session';
    const ses = session.fromPartition(partition);
    
    // Set security policies
    ses.setPermissionRequestHandler((webContents, permission, callback) => {
        const allowedPermissions = ['notifications'];
        callback(allowedPermissions.includes(permission));
    });
    
    // Block dangerous protocols
    ses.protocol.interceptHttpProtocol('file', (request, callback) => {
        callback({ error: -3 }); // Block file:// access
    });
    
    const window = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            // Security settings
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            allowRunningInsecureContent: false,
            experimentalFeatures: false,
            
            // Restrict navigation
            navigateOnDragDrop: false,
            
            // Preload script
            preload: path.join(__dirname, 'preload.js'),
            
            // Session
            session: ses
        }
    });
    
    // Prevent new window creation
    window.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });
    
    // Validate navigation
    window.webContents.on('will-navigate', (event, navigationUrl) => {
        const allowedOrigins = [
            'https://your-app.com',
            'file://' + path.join(__dirname, 'dist')
        ];
        
        const url = new URL(navigationUrl);
        const isAllowed = allowedOrigins.some(origin => 
            navigationUrl.startsWith(origin)
        );
        
        if (!isAllowed) {
            event.preventDefault();
            console.warn('Blocked navigation to:', navigationUrl);
        }
    });
    
    return window;
}

// SOLUTION 2: Secure context bridge implementation
// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const crypto = require('crypto');

// Input validation utilities
const validators = {
    string: (value, maxLength = 1000) => {
        if (typeof value !== 'string' || value.length > maxLength) {
            throw new Error('Invalid string input');
        }
        return value.trim();
    },
    
    number: (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
        const num = Number(value);
        if (!Number.isInteger(num) || num < min || num > max) {
            throw new Error('Invalid number input');
        }
        return num;
    },
    
    object: (value, schema) => {
        if (typeof value !== 'object' || value === null) {
            throw new Error('Invalid object input');
        }
        
        const validated = {};
        for (const [key, validator] of Object.entries(schema)) {
            if (value[key] !== undefined) {
                validated[key] = validator(value[key]);
            }
        }
        return validated;
    }
};

// Create secure API interface
const secureAPI = {
    // File operations with strict validation
    saveFile: async (filename, content) => {
        try {
            const validFilename = validators.string(filename, 100);
            const validContent = validators.string(content, 1000000); // 1MB limit
            
            // Validate filename (no path traversal)
            if (!/^[a-zA-Z0-9._-]+$/.test(validFilename)) {
                throw new Error('Invalid filename characters');
            }
            
            return await ipcRenderer.invoke('secure-save-file', {
                filename: validFilename,
                content: validContent,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('Save file error:', error);
            throw new Error('File save failed');
        }
    },
    
    // System information with filtering
    getSystemInfo: async () => {
        const info = await ipcRenderer.invoke('get-system-info');
        
        // Filter out sensitive information
        return {
            platform: info.platform,
            arch: info.arch,
            version: info.version
            // Exclude: hostname, username, environment variables
        };
    },
    
    // Secure settings management
    setSetting: async (key, value) => {
        const allowedSettings = ['theme', 'language', 'fontSize'];
        
        if (!allowedSettings.includes(key)) {
            throw new Error('Setting not allowed');
        }
        
        const validKey = validators.string(key, 50);
        const validValue = validators.string(value, 100);
        
        return await ipcRenderer.invoke('set-setting', { key: validKey, value: validValue });
    },
    
    // Generate secure tokens
    generateToken: () => {
        return crypto.randomBytes(32).toString('hex');
    },
    
    // Version information (safe to expose)
    getVersion: () => {
        return process.versions.electron;
    }
};

// Expose only the secure API
contextBridge.exposeInMainWorld('electronAPI', secureAPI);

// SOLUTION 3: Runtime security monitoring
class SecurityMonitor {
    constructor() {
        this.violations = [];
        this.startMonitoring();
    }
    
    startMonitoring() {
        // Monitor for CSP violations
        window.addEventListener('securitypolicyviolation', (event) => {
            this.recordViolation('csp', {
                directive: event.violatedDirective,
                blockedURI: event.blockedURI,
                source: event.sourceFile
            });
        });
        
        // Monitor for unauthorized access attempts
        const originalConsole = window.console;
        window.console = new Proxy(originalConsole, {
            get: (target, prop) => {
                if (prop === 'error') {
                    return (...args) => {
                        // Check for security-related errors
                        const message = args.join(' ');
                        if (message.includes('node') || message.includes('require')) {
                            this.recordViolation('context', { message });
                        }
                        return target[prop](...args);
                    };
                }
                return target[prop];
            }
        });
        
        // Periodic security checks
        setInterval(() => {
            this.performSecurityCheck();
        }, 10000);
    }
    
    recordViolation(type, details) {
        const violation = {
            type,
            details,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.violations.push(violation);
        console.warn('Security violation detected:', violation);
        
        // Report to main process
        if (window.electronAPI && window.electronAPI.reportSecurityViolation) {
            window.electronAPI.reportSecurityViolation(violation);
        }
    }
    
    performSecurityCheck() {
        // Check for context isolation
        if (typeof require !== 'undefined') {
            this.recordViolation('context', { issue: 'require function exposed' });
        }
        
        if (typeof process !== 'undefined') {
            this.recordViolation('context', { issue: 'process object exposed' });
        }
        
        // Check for unexpected global objects
        const dangerousGlobals = ['__dirname', '__filename', 'global', 'Buffer'];
        dangerousGlobals.forEach(global => {
            if (typeof window[global] !== 'undefined') {
                this.recordViolation('context', { issue: `${global} exposed` });
            }
        });
    }
}

// Initialize security monitoring
new SecurityMonitor();
```

### 2.3 Native Module Compatibility Problems

#### Common Compatibility Issues
```javascript
// PROBLEMATIC: Platform-specific native modules
const { app } = require('electron');

// This will fail on different architectures
const nativeModule = require('native-addon'); // Built for x64, running on arm64

// PROBLEMATIC: Version mismatches
const sqlite3 = require('sqlite3'); // Built for Node.js 14, Electron uses Node.js 16

// PROBLEMATIC: Missing rebuild after Electron version change
// package.json shows Electron 15.0.0 but native modules built for 13.0.0
```

#### Native Module Management Solutions
```javascript
// SOLUTION 1: Robust native module loading with fallbacks
class NativeModuleManager {
    constructor() {
        this.modules = new Map();
        this.fallbacks = new Map();
        this.initializeFallbacks();
    }
    
    initializeFallbacks() {
        // Define JavaScript fallbacks for native modules
        this.fallbacks.set('sqlite3', () => {
            console.warn('Using JavaScript SQLite fallback');
            return require('sql.js'); // Pure JavaScript SQLite
        });
        
        this.fallbacks.set('sharp', () => {
            console.warn('Using canvas fallback for image processing');
            return require('canvas'); // Canvas-based image processing
        });
        
        this.fallbacks.set('fsevents', () => {
            console.warn('Using polling fallback for file watching');
            return require('chokidar'); // Cross-platform file watcher
        });
    }
    
    async loadModule(moduleName, options = {}) {
        const { useCache = true, timeout = 10000 } = options;
        
        // Check cache
        if (useCache && this.modules.has(moduleName)) {
            return this.modules.get(moduleName);
        }
        
        try {
            // Attempt to load native module with timeout
            const module = await this.loadWithTimeout(moduleName, timeout);
            
            // Verify module functionality
            await this.verifyModule(moduleName, module);
            
            if (useCache) {
                this.modules.set(moduleName, module);
            }
            
            return module;
            
        } catch (error) {
            console.warn(`Native module ${moduleName} failed to load:`, error.message);
            
            // Try fallback
            const fallback = this.fallbacks.get(moduleName);
            if (fallback) {
                try {
                    const fallbackModule = await fallback();
                    console.info(`Using fallback for ${moduleName}`);
                    return fallbackModule;
                } catch (fallbackError) {
                    console.error(`Fallback for ${moduleName} also failed:`, fallbackError.message);
                }
            }
            
            throw new Error(`Failed to load ${moduleName} and no fallback available`);
        }
    }
    
    async loadWithTimeout(moduleName, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Module load timeout: ${moduleName}`));
            }, timeout);
            
            try {
                const module = require(moduleName);
                clearTimeout(timer);
                resolve(module);
            } catch (error) {
                clearTimeout(timer);
                reject(error);
            }
        });
    }
    
    async verifyModule(moduleName, module) {
        // Module-specific verification tests
        const verifiers = {
            'sqlite3': (mod) => {
                const db = new mod.Database(':memory:');
                db.close();
            },
            'sharp': (mod) => {
                // Check if sharp can create a basic image
                mod({ create: { width: 1, height: 1, channels: 3, background: 'white' } });
            },
            'canvas': (mod) => {
                const canvas = mod.createCanvas(1, 1);
                const ctx = canvas.getContext('2d');
            }
        };
        
        const verifier = verifiers[moduleName];
        if (verifier) {
            try {
                await verifier(module);
            } catch (error) {
                throw new Error(`Module verification failed: ${error.message}`);
            }
        }
    }
    
    getModuleInfo(moduleName) {
        try {
            const packagePath = require.resolve(`${moduleName}/package.json`);
            const packageJson = require(packagePath);
            
            return {
                name: packageJson.name,
                version: packageJson.version,
                description: packageJson.description,
                hasNativeCode: !!packageJson.gypfile || 
                              !!packageJson.scripts?.install ||
                              !!(packageJson.dependencies && Object.keys(packageJson.dependencies).some(dep => 
                                  dep.includes('node-gyp') || dep.includes('prebuild')
                              ))
            };
        } catch {
            return { name: moduleName, version: 'unknown', hasNativeCode: false };
        }
    }
}

// SOLUTION 2: Automated rebuild and compatibility checks
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class ModuleCompatibilityManager {
    constructor() {
        this.electronVersion = process.versions.electron;
        this.nodeVersion = process.versions.node;
        this.platform = process.platform;
        this.arch = process.arch;
    }
    
    async checkCompatibility() {
        const incompatibleModules = [];
        const packageJson = require(path.join(process.cwd(), 'package.json'));
        
        for (const [moduleName, version] of Object.entries(packageJson.dependencies || {})) {
            try {
                const moduleInfo = await this.analyzeModule(moduleName);
                
                if (moduleInfo.needsRebuild) {
                    incompatibleModules.push({
                        name: moduleName,
                        issue: 'needs_rebuild',
                        details: moduleInfo
                    });
                }
                
                if (moduleInfo.platformIncompatible) {
                    incompatibleModules.push({
                        name: moduleName,
                        issue: 'platform_incompatible',
                        details: moduleInfo
                    });
                }
                
            } catch (error) {
                incompatibleModules.push({
                    name: moduleName,
                    issue: 'analysis_failed',
                    error: error.message
                });
            }
        }
        
        return incompatibleModules;
    }
    
    async analyzeModule(moduleName) {
        const modulePath = require.resolve(moduleName);
        const moduleDir = path.dirname(modulePath);
        
        // Check for native binaries
        const bindingPaths = [
            path.join(moduleDir, 'build', 'Release'),
            path.join(moduleDir, 'prebuilds'),
            path.join(moduleDir, 'lib', 'binding')
        ];
        
        let hasNativeBindings = false;
        let bindingInfo = {};
        
        for (const bindingPath of bindingPaths) {
            if (fs.existsSync(bindingPath)) {
                const files = fs.readdirSync(bindingPath, { recursive: true });
                const nativeFiles = files.filter(file => 
                    file.endsWith('.node') || 
                    file.endsWith('.dll') || 
                    file.endsWith('.so') || 
                    file.endsWith('.dylib')
                );
                
                if (nativeFiles.length > 0) {
                    hasNativeBindings = true;
                    bindingInfo = await this.analyzeNativeFiles(bindingPath, nativeFiles);
                    break;
                }
            }
        }
        
        return {
            hasNativeBindings,
            needsRebuild: hasNativeBindings && bindingInfo.incompatible,
            platformIncompatible: bindingInfo.platformMismatch,
            bindingInfo
        };
    }
    
    async analyzeNativeFiles(bindingPath, files) {
        const analysis = {
            files: files,
            compatible: true,
            incompatible: false,
            platformMismatch: false
        };
        
        for (const file of files) {
            const filePath = path.join(bindingPath, file);
            
            try {
                // Try to load the native module to test compatibility
                require(filePath);
            } catch (error) {
                analysis.incompatible = true;
                analysis.compatible = false;
                
                if (error.message.includes('arch') || error.message.includes('platform')) {
                    analysis.platformMismatch = true;
                }
            }
        }
        
        return analysis;
    }
    
    async rebuildModule(moduleName) {
        return new Promise((resolve, reject) => {
            const rebuildProcess = spawn('npx', [
                'electron-rebuild',
                '-f',
                '-w', moduleName,
                '-v', this.electronVersion
            ], {
                cwd: process.cwd(),
                stdio: 'pipe'
            });
            
            let output = '';
            let error = '';
            
            rebuildProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            rebuildProcess.stderr.on('data', (data) => {
                error += data.toString();
            });
            
            rebuildProcess.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, output });
                } else {
                    reject(new Error(`Rebuild failed (exit code ${code}): ${error}`));
                }
            });
            
            rebuildProcess.on('error', reject);
        });
    }
    
    async autoFixModules() {
        const incompatible = await this.checkCompatibility();
        const results = [];
        
        for (const module of incompatible) {
            if (module.issue === 'needs_rebuild') {
                try {
                    console.log(`Rebuilding ${module.name}...`);
                    const result = await this.rebuildModule(module.name);
                    results.push({
                        module: module.name,
                        action: 'rebuild',
                        success: true,
                        details: result
                    });
                } catch (error) {
                    results.push({
                        module: module.name,
                        action: 'rebuild',
                        success: false,
                        error: error.message
                    });
                }
            }
        }
        
        return results;
    }
}

// SOLUTION 3: Module loading strategy with graceful degradation
class GracefulModuleLoader {
    constructor() {
        this.moduleStrategies = new Map();
        this.initializeStrategies();
    }
    
    initializeStrategies() {
        // Database modules
        this.moduleStrategies.set('database', [
            { module: 'better-sqlite3', priority: 1 },
            { module: 'sqlite3', priority: 2 },
            { module: 'sql.js', priority: 3, isJS: true }
        ]);
        
        // Image processing modules
        this.moduleStrategies.set('image', [
            { module: 'sharp', priority: 1 },
            { module: 'jimp', priority: 2, isJS: true },
            { module: 'canvas', priority: 3 }
        ]);
        
        // File watching modules
        this.moduleStrategies.set('watcher', [
            { module: 'fsevents', priority: 1, platforms: ['darwin'] },
            { module: 'chokidar', priority: 2, isJS: true }
        ]);
    }
    
    async loadBestModule(category, requirements = {}) {
        const strategies = this.moduleStrategies.get(category);
        if (!strategies) {
            throw new Error(`No strategies defined for category: ${category}`);
        }
        
        // Filter by platform compatibility
        const compatibleStrategies = strategies.filter(strategy => {
            if (strategy.platforms) {
                return strategy.platforms.includes(process.platform);
            }
            return true;
        });
        
        // Sort by priority
        compatibleStrategies.sort((a, b) => a.priority - b.priority);
        
        let lastError;
        
        for (const strategy of compatibleStrategies) {
            try {
                console.log(`Attempting to load ${strategy.module}...`);
                
                const module = await this.loadModuleWithRetry(strategy.module, {
                    maxRetries: strategy.isJS ? 1 : 3,
                    timeout: 5000
                });
                
                // Test module functionality
                if (requirements.test && typeof requirements.test === 'function') {
                    await requirements.test(module);
                }
                
                console.log(`Successfully loaded ${strategy.module}`);
                return {
                    module,
                    strategy: strategy.module,
                    isNative: !strategy.isJS
                };
                
            } catch (error) {
                console.warn(`Failed to load ${strategy.module}:`, error.message);
                lastError = error;
                continue;
            }
        }
        
        throw new Error(`All module loading strategies failed for ${category}. Last error: ${lastError?.message}`);
    }
    
    async loadModuleWithRetry(moduleName, options = {}) {
        const { maxRetries = 3, timeout = 10000, delay = 1000 } = options;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await this.loadWithTimeout(moduleName, timeout);
            } catch (error) {
                if (attempt === maxRetries - 1) {
                    throw error;
                }
                
                console.warn(`Load attempt ${attempt + 1} failed for ${moduleName}, retrying...`);
                await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
            }
        }
    }
    
    async loadWithTimeout(moduleName, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Module load timeout: ${moduleName}`));
            }, timeout);
            
            try {
                const startTime = Date.now();
                const module = require(moduleName);
                const loadTime = Date.now() - startTime;
                
                clearTimeout(timer);
                console.log(`Loaded ${moduleName} in ${loadTime}ms`);
                resolve(module);
                
            } catch (error) {
                clearTimeout(timer);
                reject(error);
            }
        });
    }
}

// Usage example
const moduleManager = new GracefulModuleLoader();

async function initializeDatabase() {
    try {
        const { module: db, strategy, isNative } = await moduleManager.loadBestModule('database', {
            test: async (module) => {
                // Test database functionality
                if (strategy === 'sql.js') {
                    const SQL = module;
                    const db = new SQL.Database();
                    db.close();
                } else {
                    const db = new module(':memory:');
                    db.close();
                }
            }
        });
        
        console.log(`Database initialized with ${strategy} (native: ${isNative})`);
        return db;
        
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
}
```

### 2.4 Update Mechanism Failures

#### Common Update Issues
```javascript
// PROBLEMATIC: Unsafe update process
const { autoUpdater } = require('electron-updater');

// No signature verification
autoUpdater.checkForUpdatesAndNotify();

// PROBLEMATIC: Update without user consent
autoUpdater.on('update-available', () => {
    autoUpdater.downloadUpdate(); // Downloads immediately
});

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall(); // Force restart
});

// PROBLEMATIC: No rollback mechanism
// Update fails, app becomes unusable
```

#### Robust Update Implementation
```javascript
// SOLUTION 1: Secure update manager with verification
const { autoUpdater } = require('electron-updater');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SecureUpdateManager {
    constructor(options = {}) {
        this.options = {
            allowPrerelease: false,
            allowDowngrade: false,
            timeout: 30000,
            maxRetries: 3,
            publicKey: options.publicKey, // For signature verification
            backupPath: path.join(process.cwd(), 'backup'),
            ...options
        };
        
        this.updateState = {
            checking: false,
            downloading: false,
            available: null,
            downloaded: false,
            error: null,
            progress: 0
        };
        
        this.setupAutoUpdater();
    }
    
    setupAutoUpdater() {
        // Configure auto-updater with security settings
        autoUpdater.allowPrerelease = this.options.allowPrerelease;
        autoUpdater.allowDowngrade = this.options.allowDowngrade;
        autoUpdater.autoDownload = false; // Manual download control
        
        // Event handlers
        autoUpdater.on('checking-for-update', () => {
            this.updateState.checking = true;
            this.emit('checking');
        });
        
        autoUpdater.on('update-available', (info) => {
            this.updateState.checking = false;
            this.updateState.available = info;
            this.handleUpdateAvailable(info);
        });
        
        autoUpdater.on('update-not-available', () => {
            this.updateState.checking = false;
            this.updateState.available = null;
            this.emit('not-available');
        });
        
        autoUpdater.on('download-progress', (progress) => {
            this.updateState.progress = progress.percent;
            this.emit('progress', progress);
        });
        
        autoUpdater.on('update-downloaded', (info) => {
            this.updateState.downloading = false;
            this.updateState.downloaded = true;
            this.handleUpdateDownloaded(info);
        });
        
        autoUpdater.on('error', (error) => {
            this.updateState.error = error;
            this.handleUpdateError(error);
        });
    }
    
    async checkForUpdates() {
        if (this.updateState.checking) {
            return;
        }
        
        try {
            // Create application backup before checking
            await this.createBackup();
            
            // Set timeout for check
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Update check timeout')), this.options.timeout);
            });
            
            const checkPromise = autoUpdater.checkForUpdates();
            
            await Promise.race([checkPromise, timeoutPromise]);
            
        } catch (error) {
            this.handleUpdateError(error);
            throw error;
        }
    }
    
    async handleUpdateAvailable(info) {
        try {
            // Verify update information
            await this.verifyUpdateInfo(info);
            
            // Check version compatibility
            if (!this.isVersionCompatible(info.version)) {
                throw new Error(`Version ${info.version} is not compatible`);
            }
            
            // Emit to UI for user decision
            this.emit('available', {
                version: info.version,
                releaseDate: info.releaseDate,
                releaseNotes: info.releaseNotes,
                downloadSize: this.formatBytes(info.files[0]?.size || 0)
            });
            
        } catch (error) {
            this.handleUpdateError(error);
        }
    }
    
    async downloadUpdate() {
        if (this.updateState.downloading || !this.updateState.available) {
            return;
        }
        
        this.updateState.downloading = true;
        
        try {
            // Create download timeout
            const downloadTimeout = setTimeout(() => {
                autoUpdater.downloadUpdate().cancel?.();
                this.handleUpdateError(new Error('Download timeout'));
            }, this.options.timeout * 3); // Longer timeout for download
            
            await autoUpdater.downloadUpdate();
            clearTimeout(downloadTimeout);
            
        } catch (error) {
            this.updateState.downloading = false;
            this.handleUpdateError(error);
            throw error;
        }
    }
    
    async handleUpdateDownloaded(info) {
        try {
            // Verify downloaded update
            await this.verifyDownloadedUpdate(info);
            
            // Test update compatibility
            await this.testUpdateCompatibility();
            
            this.emit('downloaded', {
                version: info.version,
                path: info.downloadedFile
            });
            
        } catch (error) {
            // Delete corrupted download
            try {
                if (info.downloadedFile && fs.existsSync(info.downloadedFile)) {
                    fs.unlinkSync(info.downloadedFile);
                }
            } catch (deleteError) {
                console.error('Failed to delete corrupted update:', deleteError);
            }
            
            this.handleUpdateError(error);
        }
    }
    
    async installUpdate() {
        if (!this.updateState.downloaded) {
            throw new Error('No update downloaded');
        }
        
        try {
            // Final verification before install
            await this.preInstallChecks();
            
            // Save application state
            await this.saveApplicationState();
            
            // Create restore point
            await this.createRestorePoint();
            
            // Install update
            autoUpdater.quitAndInstall(true, true);
            
        } catch (error) {
            this.handleUpdateError(error);
            throw error;
        }
    }
    
    async verifyUpdateInfo(info) {
        // Verify signature if public key provided
        if (this.options.publicKey && info.signature) {
            const verify = crypto.createVerify('RSA-SHA256');
            verify.update(JSON.stringify({
                version: info.version,
                files: info.files,
                releaseDate: info.releaseDate
            }));
            
            const isValid = verify.verify(this.options.publicKey, info.signature, 'base64');
            if (!isValid) {
                throw new Error('Update signature verification failed');
            }
        }
        
        // Verify file checksums
        for (const file of info.files || []) {
            if (file.sha256 && file.url) {
                // We'll verify this after download
                console.log(`Will verify ${file.url} with checksum ${file.sha256}`);
            }
        }
    }
    
    async verifyDownloadedUpdate(info) {
        const filePath = info.downloadedFile;
        
        if (!fs.existsSync(filePath)) {
            throw new Error('Downloaded file not found');
        }
        
        // Verify file size
        const stats = fs.statSync(filePath);
        const expectedSize = info.files?.[0]?.size;
        
        if (expectedSize && stats.size !== expectedSize) {
            throw new Error(`File size mismatch: expected ${expectedSize}, got ${stats.size}`);
        }
        
        // Verify checksum
        const expectedChecksum = info.files?.[0]?.sha256;
        if (expectedChecksum) {
            const fileBuffer = fs.readFileSync(filePath);
            const actualChecksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
            
            if (actualChecksum !== expectedChecksum) {
                throw new Error('Checksum verification failed');
            }
        }
    }
    
    async createBackup() {
        const backupPath = path.join(this.options.backupPath, `backup-${Date.now()}`);
        
        try {
            await fs.promises.mkdir(backupPath, { recursive: true });
            
            // Copy current executable
            const currentPath = process.execPath;
            const backupFile = path.join(backupPath, path.basename(currentPath));
            
            await fs.promises.copyFile(currentPath, backupFile);
            
            // Save backup metadata
            const metadata = {
                version: require('../package.json').version,
                timestamp: Date.now(),
                originalPath: currentPath,
                backupPath: backupFile
            };
            
            await fs.promises.writeFile(
                path.join(backupPath, 'metadata.json'),
                JSON.stringify(metadata, null, 2)
            );
            
            console.log(`Backup created at ${backupPath}`);
            return backupPath;
            
        } catch (error) {
            console.error('Failed to create backup:', error);
            throw error;
        }
    }
    
    async createRestorePoint() {
        // Implementation depends on platform
        const restorePoint = {
            timestamp: Date.now(),
            version: require('../package.json').version,
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version
        };
        
        const restorePath = path.join(this.options.backupPath, 'restore-points');
        await fs.promises.mkdir(restorePath, { recursive: true });
        
        const restoreFile = path.join(restorePath, `restore-${restorePoint.timestamp}.json`);
        await fs.promises.writeFile(restoreFile, JSON.stringify(restorePoint, null, 2));
        
        return restoreFile;
    }
    
    isVersionCompatible(version) {
        // Implement version compatibility logic
        const currentVersion = require('../package.json').version;
        const semver = require('semver');
        
        // Don't allow downgrade unless explicitly allowed
        if (!this.options.allowDowngrade && semver.lt(version, currentVersion)) {
            return false;
        }
        
        // Check for breaking changes
        const currentMajor = semver.major(currentVersion);
        const newMajor = semver.major(version);
        
        if (newMajor > currentMajor + 1) {
            // Skip major versions
            return false;
        }
        
        return true;
    }
    
    formatBytes(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    handleUpdateError(error) {
        console.error('Update error:', error);
        this.updateState.error = error;
        this.updateState.checking = false;
        this.updateState.downloading = false;
        this.emit('error', error);
    }
    
    // Event emitter methods
    emit(event, data) {
        // Implement event emission to UI
        if (this.listeners && this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
    
    on(event, callback) {
        if (!this.listeners) this.listeners = {};
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }
}

// SOLUTION 2: Update rollback system
class UpdateRollbackManager {
    constructor(options = {}) {
        this.options = {
            maxBackups: 5,
            backupPath: path.join(process.cwd(), 'backups'),
            testTimeout: 30000,
            ...options
        };
    }
    
    async rollback(targetVersion = null) {
        try {
            const backups = await this.getAvailableBackups();
            
            if (backups.length === 0) {
                throw new Error('No backups available for rollback');
            }
            
            let targetBackup;
            if (targetVersion) {
                targetBackup = backups.find(backup => backup.version === targetVersion);
                if (!targetBackup) {
                    throw new Error(`Backup for version ${targetVersion} not found`);
                }
            } else {
                // Use most recent backup
                targetBackup = backups[0];
            }
            
            console.log(`Rolling back to version ${targetBackup.version}`);
            
            // Verify backup integrity
            await this.verifyBackup(targetBackup);
            
            // Stop current application
            await this.gracefulShutdown();
            
            // Restore backup
            await this.restoreBackup(targetBackup);
            
            console.log(`Rollback to ${targetBackup.version} completed`);
            
        } catch (error) {
            console.error('Rollback failed:', error);
            throw error;
        }
    }
    
    async getAvailableBackups() {
        const backupPath = this.options.backupPath;
        
        if (!fs.existsSync(backupPath)) {
            return [];
        }
        
        const backupDirs = fs.readdirSync(backupPath);
        const backups = [];
        
        for (const dir of backupDirs) {
            const metadataPath = path.join(backupPath, dir, 'metadata.json');
            
            if (fs.existsSync(metadataPath)) {
                try {
                    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                    backups.push({
                        ...metadata,
                        directory: dir,
                        path: path.join(backupPath, dir)
                    });
                } catch (error) {
                    console.warn(`Invalid backup metadata in ${dir}:`, error.message);
                }
            }
        }
        
        // Sort by timestamp (newest first)
        return backups.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    async verifyBackup(backup) {
        const backupFile = backup.backupPath;
        
        if (!fs.existsSync(backupFile)) {
            throw new Error('Backup file not found');
        }
        
        // Verify file integrity
        const stats = fs.statSync(backupFile);
        if (stats.size === 0) {
            throw new Error('Backup file is empty');
        }
        
        // Additional integrity checks could be added here
        console.log(`Backup ${backup.version} verified`);
    }
    
    async restoreBackup(backup) {
        const currentPath = process.execPath;
        const backupFile = backup.backupPath;
        
        // Create temporary copy of current version
        const tempPath = currentPath + '.temp';
        await fs.promises.copyFile(currentPath, tempPath);
        
        try {
            // Replace current executable with backup
            await fs.promises.copyFile(backupFile, currentPath);
            
            // Test the restored version
            await this.testRestoredVersion();
            
            // Remove temporary file
            await fs.promises.unlink(tempPath);
            
        } catch (error) {
            // Restore failed, revert to original
            try {
                await fs.promises.copyFile(tempPath, currentPath);
                await fs.promises.unlink(tempPath);
            } catch (revertError) {
                console.error('Failed to revert after restore failure:', revertError);
            }
            
            throw error;
        }
    }
    
    async testRestoredVersion() {
        // Implementation would test the restored version
        // This is a placeholder for testing logic
        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }
    
    async gracefulShutdown() {
        // Implementation for graceful application shutdown
        // Save application state, close databases, etc.
        console.log('Performing graceful shutdown...');
    }
}

// SOLUTION 3: Progressive update system
class ProgressiveUpdateManager {
    constructor() {
        this.updateStages = [
            { name: 'download', weight: 30 },
            { name: 'verify', weight: 10 },
            { name: 'backup', weight: 20 },
            { name: 'install', weight: 30 },
            { name: 'verify-install', weight: 10 }
        ];
        
        this.currentStage = 0;
        this.stageProgress = 0;
    }
    
    async performProgressiveUpdate(updateInfo) {
        const totalWeight = this.updateStages.reduce((sum, stage) => sum + stage.weight, 0);
        let completedWeight = 0;
        
        for (let i = 0; i < this.updateStages.length; i++) {
            const stage = this.updateStages[i];
            this.currentStage = i;
            this.stageProgress = 0;
            
            try {
                await this.executeStage(stage, updateInfo, (progress) => {
                    this.stageProgress = progress;
                    const totalProgress = (completedWeight + (stage.weight * progress / 100)) / totalWeight * 100;
                    this.emit('progress', {
                        stage: stage.name,
                        stageProgress: progress,
                        totalProgress: totalProgress
                    });
                });
                
                completedWeight += stage.weight;
                
            } catch (error) {
                await this.handleStageFailure(stage, error);
                throw error;
            }
        }
    }
    
    async executeStage(stage, updateInfo, progressCallback) {
        switch (stage.name) {
            case 'download':
                return await this.downloadStage(updateInfo, progressCallback);
            case 'verify':
                return await this.verifyStage(updateInfo, progressCallback);
            case 'backup':
                return await this.backupStage(progressCallback);
            case 'install':
                return await this.installStage(updateInfo, progressCallback);
            case 'verify-install':
                return await this.verifyInstallStage(progressCallback);
            default:
                throw new Error(`Unknown stage: ${stage.name}`);
        }
    }
    
    async downloadStage(updateInfo, progressCallback) {
        // Implement download with progress tracking
        progressCallback(0);
        
        // Simulated download progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            progressCallback(i);
        }
    }
    
    async verifyStage(updateInfo, progressCallback) {
        progressCallback(0);
        // Verification logic
        await new Promise(resolve => setTimeout(resolve, 500));
        progressCallback(100);
    }
    
    async backupStage(progressCallback) {
        progressCallback(0);
        // Backup logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        progressCallback(100);
    }
    
    async installStage(updateInfo, progressCallback) {
        progressCallback(0);
        // Installation logic
        await new Promise(resolve => setTimeout(resolve, 1500));
        progressCallback(100);
    }
    
    async verifyInstallStage(progressCallback) {
        progressCallback(0);
        // Verification logic
        await new Promise(resolve => setTimeout(resolve, 300));
        progressCallback(100);
    }
    
    async handleStageFailure(stage, error) {
        console.error(`Stage ${stage.name} failed:`, error);
        
        // Stage-specific rollback logic
        switch (stage.name) {
            case 'install':
                await this.rollbackInstall();
                break;
            case 'download':
                await this.cleanupDownload();
                break;
        }
    }
    
    async rollbackInstall() {
        // Rollback installation changes
        console.log('Rolling back installation...');
    }
    
    async cleanupDownload() {
        // Clean up partial downloads
        console.log('Cleaning up download...');
    }
    
    emit(event, data) {
        // Event emission implementation
        console.log(`Event: ${event}`, data);
    }
}
```

### 2.5 Packaging and Distribution Edge Cases

#### Common Packaging Issues
```javascript
// PROBLEMATIC: Insecure build configuration
// electron-builder config
{
  "build": {
    "asar": false, // Exposes source code
    "compression": "store", // No compression
    "directories": {
      "output": "dist"
    },
    "files": [
      "**/*", // Includes everything
      "node_modules/**/*" // Includes all dependencies
    ]
  }
}

// PROBLEMATIC: Missing platform-specific configurations
// No code signing
// No notarization for macOS
// Missing Windows manifest
```

#### Secure Packaging Configuration
```javascript
// SOLUTION 1: Comprehensive build configuration
// electron-builder.js
const path = require('path');
const fs = require('fs');

module.exports = {
    appId: 'com.yourcompany.yourapp',
    productName: 'Your App',
    copyright: '© 2024 Your Company',
    
    // Security settings
    asar: true,
    asarUnpack: [
        '**/node_modules/sqlite3/**/*',
        '**/node_modules/sharp/**/*'
    ],
    
    // Compression
    compression: 'maximum',
    
    // File inclusion/exclusion
    files: [
        'dist/**/*',
        'assets/**/*',
        'package.json',
        '!src/**/*',
        '!test/**/*',
        '!docs/**/*',
        '!.git/**/*',
        '!*.log',
        '!*.map'
    ],
    
    directories: {
        output: 'release/${version}',
        buildResources: 'build'
    },
    
    // Platform-specific configurations
    mac: {
        category: 'public.app-category.productivity',
        icon: 'build/icon.icns',
        hardenedRuntime: true,
        entitlements: 'build/entitlements.mac.plist',
        entitlementsInherit: 'build/entitlements.mac.plist',
        gatekeeperAssess: false,
        darkModeSupport: true,
        target: [
            {
                target: 'dmg',
                arch: ['x64', 'arm64']
            },
            {
                target: 'zip',
                arch: ['x64', 'arm64']
            }
        ]
    },
    
    win: {
        icon: 'build/icon.ico',
        publisherName: 'Your Company',
        verifyUpdateCodeSignature: true,
        certificateFile: process.env.WINDOWS_CERTIFICATE_FILE,
        certificatePassword: process.env.WINDOWS_CERTIFICATE_PASSWORD,
        target: [
            {
                target: 'nsis',
                arch: ['x64', 'ia32']
            },
            {
                target: 'portable',
                arch: ['x64']
            }
        ]
    },
    
    linux: {
        icon: 'build/icons',
        category: 'Office',
        target: [
            {
                target: 'AppImage',
                arch: ['x64', 'arm64']
            },
            {
                target: 'deb',
                arch: ['x64', 'arm64']
            },
            {
                target: 'rpm',
                arch: ['x64']
            }
        ]
    },
    
    // NSIS installer configuration (Windows)
    nsis: {
        oneClick: false,
        allowElevation: true,
        allowToChangeInstallationDirectory: true,
        installerIcon: 'build/icon.ico',
        uninstallerIcon: 'build/icon.ico',
        installerHeaderIcon: 'build/icon.ico',
        createDesktopShortcut: 'always',
        createStartMenuShortcut: true,
        menuCategory: 'Your App',
        shortcutName: 'Your App'
    },
    
    // DMG configuration (macOS)
    dmg: {
        contents: [
            {
                x: 410,
                y: 150,
                type: 'link',
                path: '/Applications'
            },
            {
                x: 130,
                y: 150,
                type: 'file'
            }
        ],
        window: {
            width: 540,
            height: 380
        }
    },
    
    // Update configuration
    publish: [
        {
            provider: 'github',
            owner: 'your-username',
            repo: 'your-repo',
            private: true,
            token: process.env.GITHUB_TOKEN
        }
    ],
    
    // Notarization (macOS)
    afterSign: 'scripts/notarize.js',
    
    // Build hooks
    beforeBuild: async (context) => {
        await runPreBuildTasks(context);
    },
    
    afterPack: async (context) => {
        await runPostPackTasks(context);
    }
};

// SOLUTION 2: Build security validation
// scripts/validate-build.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class BuildValidator {
    constructor(buildPath) {
        this.buildPath = buildPath;
        this.securityRules = {
            // Files that should not be included
            forbiddenFiles: [
                '.env',
                '.env.local',
                'secrets.json',
                'private-key.pem',
                '*.log',
                'node_modules/.cache',
                'coverage/',
                '.nyc_output/'
            ],
            
            // Required security files
            requiredFiles: {
                'package.json': true,
                'build/icon.png': true,
                'build/entitlements.mac.plist': process.platform === 'darwin'
            },
            
            // File size limits (in bytes)
            maxSizes: {
                'package.json': 50000,
                '*.js': 10000000, // 10MB per JS file
                '*.json': 1000000 // 1MB per JSON file
            }
        };
    }
    
    async validate() {
        const violations = [];
        
        // Check for forbidden files
        const forbiddenFound = await this.checkForbiddenFiles();
        violations.push(...forbiddenFound);
        
        // Check for required files
        const missingRequired = await this.checkRequiredFiles();
        violations.push(...missingRequired);
        
        // Check file sizes
        const oversizedFiles = await this.checkFileSizes();
        violations.push(...oversizedFiles);
        
        // Check for suspicious content
        const suspiciousContent = await this.checkSuspiciousContent();
        violations.push(...suspiciousContent);
        
        // Generate build manifest
        const manifest = await this.generateManifest();
        
        return {
            valid: violations.length === 0,
            violations,
            manifest
        };
    }
    
    async checkForbiddenFiles() {
        const violations = [];
        
        for (const pattern of this.securityRules.forbiddenFiles) {
            const matches = await this.findFiles(pattern);
            
            for (const match of matches) {
                violations.push({
                    type: 'forbidden_file',
                    file: match,
                    message: `Forbidden file found: ${match}`
                });
            }
        }
        
        return violations;
    }
    
    async checkRequiredFiles() {
        const violations = [];
        
        for (const [file, required] of Object.entries(this.securityRules.requiredFiles)) {
            if (required && !fs.existsSync(path.join(this.buildPath, file))) {
                violations.push({
                    type: 'missing_required',
                    file,
                    message: `Required file missing: ${file}`
                });
            }
        }
        
        return violations;
    }
    
    async checkFileSizes() {
        const violations = [];
        
        for (const [pattern, maxSize] of Object.entries(this.securityRules.maxSizes)) {
            const matches = await this.findFiles(pattern);
            
            for (const match of matches) {
                const filePath = path.join(this.buildPath, match);
                const stats = fs.statSync(filePath);
                
                if (stats.size > maxSize) {
                    violations.push({
                        type: 'oversized_file',
                        file: match,
                        size: stats.size,
                        maxSize,
                        message: `File exceeds size limit: ${match} (${stats.size} > ${maxSize})`
                    });
                }
            }
        }
        
        return violations;
    }
    
    async checkSuspiciousContent() {
        const violations = [];
        const suspiciousPatterns = [
            /password\s*[:=]\s*['"][^'"]{3,}['"]/gi,
            /api[_-]?key\s*[:=]\s*['"][^'"]{10,}['"]/gi,
            /secret\s*[:=]\s*['"][^'"]{5,}['"]/gi,
            /token\s*[:=]\s*['"][^'"]{10,}['"]/gi
        ];
        
        const jsFiles = await this.findFiles('*.js');
        
        for (const file of jsFiles) {
            const filePath = path.join(this.buildPath, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            for (const pattern of suspiciousPatterns) {
                const matches = content.match(pattern);
                if (matches) {
                    violations.push({
                        type: 'suspicious_content',
                        file,
                        matches: matches.map(match => match.substring(0, 50) + '...'),
                        message: `Suspicious content found in ${file}`
                    });
                }
            }
        }
        
        return violations;
    }
    
    async generateManifest() {
        const manifest = {
            buildDate: new Date().toISOString(),
            platform: process.platform,
            arch: process.arch,
            files: {},
            checksums: {}
        };
        
        const allFiles = await this.getAllFiles();
        
        for (const file of allFiles) {
            const filePath = path.join(this.buildPath, file);
            const stats = fs.statSync(filePath);
            
            manifest.files[file] = {
                size: stats.size,
                modified: stats.mtime.toISOString()
            };
            
            // Generate checksum for security-critical files
            if (file.endsWith('.js') || file.endsWith('.json') || file === 'package.json') {
                const content = fs.readFileSync(filePath);
                manifest.checksums[file] = crypto.createHash('sha256').update(content).digest('hex');
            }
        }
        
        return manifest;
    }
    
    async findFiles(pattern) {
        // Implementation would use glob or similar pattern matching
        // This is a simplified version
        const allFiles = await this.getAllFiles();
        
        if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return allFiles.filter(file => regex.test(file));
        }
        
        return allFiles.filter(file => file.includes(pattern));
    }
    
    async getAllFiles() {
        const files = [];
        
        const scanDirectory = (dir, relativePath = '') => {
            const entries = fs.readdirSync(dir);
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry);
                const relativeFile = path.join(relativePath, entry);
                const stats = fs.statSync(fullPath);
                
                if (stats.isDirectory()) {
                    scanDirectory(fullPath, relativeFile);
                } else {
                    files.push(relativeFile);
                }
            }
        };
        
        scanDirectory(this.buildPath);
        return files;
    }
}

// SOLUTION 3: Secure distribution pipeline
// scripts/secure-release.js
class SecureReleaseManager {
    constructor(options = {}) {
        this.options = {
            signCertificates: {
                windows: process.env.WINDOWS_CERTIFICATE_FILE,
                mac: process.env.APPLE_CERTIFICATE
            },
            notarization: {
                appleId: process.env.APPLE_ID,
                appleIdPassword: process.env.APPLE_ID_PASSWORD,
                teamId: process.env.APPLE_TEAM_ID
            },
            uploadTargets: options.uploadTargets || [],
            ...options
        };
    }
    
    async createSecureRelease(version) {
        const releaseSteps = [
            { name: 'validate-environment', fn: this.validateEnvironment },
            { name: 'clean-build', fn: this.cleanBuild },
            { name: 'build-application', fn: this.buildApplication },
            { name: 'validate-build', fn: this.validateBuild },
            { name: 'sign-binaries', fn: this.signBinaries },
            { name: 'notarize-mac', fn: this.notarizeMac },
            { name: 'create-installers', fn: this.createInstallers },
            { name: 'generate-checksums', fn: this.generateChecksums },
            { name: 'upload-release', fn: this.uploadRelease },
            { name: 'verify-upload', fn: this.verifyUpload }
        ];
        
        for (const step of releaseSteps) {
            try {
                console.log(`Executing step: ${step.name}`);
                await step.fn.call(this, version);
                console.log(`✓ Completed: ${step.name}`);
            } catch (error) {
                console.error(`✗ Failed: ${step.name}`, error);
                throw error;
            }
        }
        
        console.log(`🎉 Secure release ${version} completed successfully`);
    }
    
    async validateEnvironment() {
        const requiredEnvVars = [
            'GITHUB_TOKEN',
            'APPLE_ID',
            'APPLE_ID_PASSWORD',
            'WINDOWS_CERTIFICATE_FILE'
        ];
        
        const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
        
        // Verify certificate files exist
        if (process.env.WINDOWS_CERTIFICATE_FILE && !fs.existsSync(process.env.WINDOWS_CERTIFICATE_FILE)) {
            throw new Error('Windows certificate file not found');
        }
        
        // Verify build tools
        const requiredTools = ['electron-builder', 'electron-notarize'];
        for (const tool of requiredTools) {
            try {
                require.resolve(tool);
            } catch (error) {
                throw new Error(`Required tool not found: ${tool}`);
            }
        }
    }
    
    async cleanBuild() {
        const buildDirs = ['dist', 'release', 'build'];
        
        for (const dir of buildDirs) {
            if (fs.existsSync(dir)) {
                fs.rmSync(dir, { recursive: true, force: true });
            }
        }
    }
    
    async buildApplication(version) {
        const { spawn } = require('child_process');
        
        return new Promise((resolve, reject) => {
            const build = spawn('npm', ['run', 'build'], {
                stdio: 'inherit',
                env: { ...process.env, NODE_ENV: 'production' }
            });
            
            build.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Build failed with exit code ${code}`));
                }
            });
        });
    }
    
    async validateBuild() {
        const validator = new BuildValidator('./dist');
        const result = await validator.validate();
        
        if (!result.valid) {
            console.error('Build validation failed:');
            result.violations.forEach(violation => {
                console.error(`- ${violation.message}`);
            });
            throw new Error('Build validation failed');
        }
        
        // Save manifest
        fs.writeFileSync(
            './dist/manifest.json',
            JSON.stringify(result.manifest, null, 2)
        );
    }
    
    async signBinaries() {
        // Platform-specific signing logic would go here
        if (process.platform === 'win32' && this.options.signCertificates.windows) {
            await this.signWindowsBinaries();
        }
        
        if (process.platform === 'darwin' && this.options.signCertificates.mac) {
            await this.signMacBinaries();
        }
    }
    
    async notarizeMac() {
        if (process.platform !== 'darwin') {
            return; // Skip on non-Mac platforms
        }
        
        console.log('Starting macOS notarization...');
        
        const { notarize } = require('electron-notarize');
        
        await notarize({
            appBundleId: 'com.yourcompany.yourapp',
            appPath: './release/Your App.app',
            appleId: this.options.notarization.appleId,
            appleIdPassword: this.options.notarization.appleIdPassword,
            teamId: this.options.notarization.teamId
        });
        
        console.log('✓ macOS notarization completed');
    }
    
    async createInstallers() {
        const { spawn } = require('child_process');
        
        return new Promise((resolve, reject) => {
            const builder = spawn('electron-builder', ['--publish=never'], {
                stdio: 'inherit'
            });
            
            builder.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Installer creation failed with exit code ${code}`));
                }
            });
        });
    }
    
    async generateChecksums() {
        const releaseDir = './release';
        const checksumFile = path.join(releaseDir, 'CHECKSUMS.txt');
        
        const files = fs.readdirSync(releaseDir).filter(file => 
            file.endsWith('.exe') || 
            file.endsWith('.dmg') || 
            file.endsWith('.AppImage') ||
            file.endsWith('.deb') ||
            file.endsWith('.rpm')
        );
        
        const checksums = [];
        
        for (const file of files) {
            const filePath = path.join(releaseDir, file);
            const content = fs.readFileSync(filePath);
            const checksum = crypto.createHash('sha256').update(content).digest('hex');
            
            checksums.push(`${checksum}  ${file}`);
        }
        
        fs.writeFileSync(checksumFile, checksums.join('\n'));
        console.log(`Generated checksums for ${files.length} files`);
    }
    
    async uploadRelease(version) {
        // Implementation would handle upload to GitHub releases, S3, etc.
        console.log(`Uploading release ${version}...`);
        
        for (const target of this.options.uploadTargets) {
            await this.uploadToTarget(target, version);
        }
    }
    
    async verifyUpload(version) {
        // Verify that uploaded files are accessible and have correct checksums
        console.log(`Verifying upload for ${version}...`);
    }
    
    async uploadToTarget(target, version) {
        switch (target.type) {
            case 'github':
                await this.uploadToGitHub(target, version);
                break;
            case 's3':
                await this.uploadToS3(target, version);
                break;
            default:
                throw new Error(`Unknown upload target: ${target.type}`);
        }
    }
    
    async uploadToGitHub(target, version) {
        // GitHub release upload implementation
        console.log(`Uploading to GitHub: ${target.repo}`);
    }
    
    async uploadToS3(target, version) {
        // S3 upload implementation
        console.log(`Uploading to S3: ${target.bucket}`);
    }
}
```

---

## 3. CROSS-PLATFORM COMPATIBILITY

### 3.1 Windows/macOS/Linux Behavioral Differences

#### Platform-Specific Issues
```javascript
// PROBLEMATIC: Platform assumptions
const fs = require('fs');
const path = require('path');

// Assumes Unix-style paths
const configPath = '/home/user/.config/app/config.json';

// Windows-specific behavior not handled
const { spawn } = require('child_process');
const command = spawn('ls', ['-la']); // Fails on Windows

// macOS-specific APIs used without checks
const { systemPreferences } = require('electron');
systemPreferences.askForMediaAccess('camera'); // macOS only
```

#### Cross-Platform Compatibility Solutions
```javascript
// SOLUTION 1: Platform abstraction layer
const os = require('os');
const path = require('path');
const { spawn, exec } = require('child_process');

class PlatformManager {
    constructor() {
        this.platform = process.platform;
        this.arch = process.arch;
        this.isWindows = this.platform === 'win32';
        this.isMac = this.platform === 'darwin';
        this.isLinux = this.platform === 'linux';
        
        this.setupPlatformSpecifics();
    }
    
    setupPlatformSpecifics() {
        this.paths = {
            home: os.homedir(),
            config: this.getConfigDirectory(),
            cache: this.getCacheDirectory(),
            logs: this.getLogsDirectory(),
            temp: os.tmpdir()
        };
        
        this.commands = {
            list: this.isWindows ? 'dir' : 'ls',
            copy: this.isWindows ? 'copy' : 'cp',
            move: this.isWindows ? 'move' : 'mv',
            remove: this.isWindows ? 'del' : 'rm',
            shell: this.isWindows ? 'cmd' : 'bash'
        };
        
        this.features = {
            notifications: true,
            trayIcon: !this.isLinux, // Linux support varies
            globalShortcuts: true,
            autoUpdater: this.isMac || this.isWindows,
            touchBar: this.isMac,
            jumpList: this.isWindows
        };
    }
    
    getConfigDirectory() {
        if (this.isWindows) {
            return path.join(process.env.APPDATA || os.homedir(), 'YourApp');
        } else if (this.isMac) {
            return path.join(os.homedir(), 'Library', 'Application Support', 'YourApp');
        } else {
            return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'yourapp');
        }
    }
    
    getCacheDirectory() {
        if (this.isWindows) {
            return path.join(process.env.LOCALAPPDATA || os.homedir(), 'YourApp', 'Cache');
        } else if (this.isMac) {
            return path.join(os.homedir(), 'Library', 'Caches', 'YourApp');
        } else {
            return path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'), 'yourapp');
        }
    }
    
    getLogsDirectory() {
        if (this.isWindows) {
            return path.join(process.env.LOCALAPPDATA || os.homedir(), 'YourApp', 'Logs');
        } else if (this.isMac) {
            return path.join(os.homedir(), 'Library', 'Logs', 'YourApp');
        } else {
            return path.join(this.paths.config, 'logs');
        }
    }
    
    async executeCommand(command, args = [], options = {}) {
        const platformCommand = this.adaptCommand(command, args);
        
        return new Promise((resolve, reject) => {
            const child = spawn(platformCommand.command, platformCommand.args, {
                ...options,
                shell: this.isWindows
            });
            
            let stdout = '';
            let stderr = '';
            
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            
            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr, exitCode: code });
                } else {
                    reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
                }
            });
            
            child.on('error', reject);
        });
    }
    
    adaptCommand(command, args) {
        // Adapt common commands for each platform
        const adaptations = {
            'ls': {
                win32: { command: 'dir', args: ['/B'] },
                default: { command: 'ls', args }
            },
            'cat': {
                win32: { command: 'type', args },
                default: { command: 'cat', args }
            },
            'which': {
                win32: { command: 'where', args },
                default: { command: 'which', args }
            }
        };
        
        const adaptation = adaptations[command];
        if (adaptation) {
            return adaptation[this.platform] || adaptation.default;
        }
        
        return { command, args };
    }
    
    async openExternal(url) {
        const { shell } = require('electron');
        
        try {
            await shell.openExternal(url);
        } catch (error) {
            // Fallback to platform-specific commands
            let command;
            
            if (this.isWindows) {
                command = ['start', '', url];
            } else if (this.isMac) {
                command = ['open', url];
            } else {
                command = ['xdg-open', url];
            }
            
            await this.executeCommand(command[0], command.slice(1));
        }
    }
    
    async showInFolder(filePath) {
        const { shell } = require('electron');
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        
        try {
            shell.showItemInFolder(filePath);
        } catch (error) {
            // Platform-specific fallbacks
            if (this.isWindows) {
                await this.executeCommand('explorer', ['/select,', filePath]);
            } else if (this.isMac) {
                await this.executeCommand('open', ['-R', filePath]);
            } else {
                // Linux - open containing directory
                const dir = path.dirname(filePath);
                await this.executeCommand('xdg-open', [dir]);
            }
        }
    }
    
    getSystemInfo() {
        return {
            platform: this.platform,
            arch: this.arch,
            release: os.release(),
            version: os.version(),
            cpus: os.cpus().length,
            memory: Math.round(os.totalmem() / 1024 / 1024 / 1024), // GB
            uptime: Math.round(os.uptime() / 3600), // Hours
            nodeVersion: process.version,
            electronVersion: process.versions.electron
        };
    }
    
    isFeatureSupported(feature) {
        return this.features[feature] || false;
    }
    
    // Platform-specific optimizations
    optimizeForPlatform(options = {}) {
        const optimizations = {};
        
        if (this.isWindows) {
            optimizations.windowsOptimizations = {
                // Enable Windows-specific features
                enableJumpList: true,
                useNativeTheme: true,
                enableBackgroundThrottling: false
            };
        }
        
        if (this.isMac) {
            optimizations.macOptimizations = {
                // Enable macOS-specific features
                enableTouchBar: true,
                useSystemAccentColor: true,
                enableTabbing: true,
                titleBarStyle: 'hiddenInset'
            };
        }
        
        if (this.isLinux) {
            optimizations.linuxOptimizations = {
                // Linux-specific considerations
                useCustomTitleBar: true,
                enableWaylandSupport: process.env.WAYLAND_DISPLAY !== undefined,
                respectSystemTheme: true
            };
        }
        
        return { ...optimizations, ...options };
    }
}

// SOLUTION 2: File system compatibility layer
class CrossPlatformFileSystem {
    constructor() {
        this.platform = new PlatformManager();
        this.pathSeparator = path.sep;
        this.invalidChars = this.getInvalidChars();
    }
    
    getInvalidChars() {
        // Characters that are invalid in filenames for each platform
        const common = ['<', '>', ':', '"', '|', '?', '*', '\0'];
        
        if (this.platform.isWindows) {
            return [...common, '/', '\\'];
        } else {
            return [...common, '/'];
        }
    }
    
    sanitizeFileName(filename) {
        // Remove or replace invalid characters
        let sanitized = filename;
        
        // Replace invalid characters with underscore
        this.invalidChars.forEach(char => {
            sanitized = sanitized.replace(new RegExp(`\\${char}`, 'g'), '_');
        });
        
        // Handle Windows reserved names
        if (this.platform.isWindows) {
            const reserved = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
            const upperName = sanitized.toUpperCase();
            
            if (reserved.includes(upperName)) {
                sanitized = `_${sanitized}`;
            }
        }
        
        // Trim spaces and dots (Windows doesn't allow trailing spaces/dots)
        if (this.platform.isWindows) {
            sanitized = sanitized.replace(/[\s.]+$/, '');
        }
        
        // Limit filename length
        const maxLength = this.platform.isWindows ? 255 : 255;
        if (sanitized.length > maxLength) {
            const ext = path.extname(sanitized);
            const base = path.basename(sanitized, ext);
            sanitized = base.substring(0, maxLength - ext.length) + ext;
        }
        
        return sanitized || '_unnamed_';
    }
    
    async createDirectory(dirPath) {
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if (error.code === 'EEXIST') {
                // Directory already exists
                return;
            }
            
            // Handle platform-specific errors
            if (this.platform.isWindows && error.code === 'EINVAL') {
                throw new Error(`Invalid path for Windows: ${dirPath}`);
            }
            
            throw error;
        }
    }
    
    async copyFile(src, dest) {
        try {
            // Ensure destination directory exists
            await this.createDirectory(path.dirname(dest));
            
            // Use platform-appropriate copy method
            await fs.promises.copyFile(src, dest);
            
            // Preserve permissions on Unix-like systems
            if (!this.platform.isWindows) {
                const stats = await fs.promises.stat(src);
                await fs.promises.chmod(dest, stats.mode);
            }
            
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`Source file not found: ${src}`);
            } else if (error.code === 'EACCES') {
                throw new Error(`Permission denied: ${dest}`);
            }
            
            throw error;
        }
    }
    
    async moveFile(src, dest) {
        try {
            await fs.promises.rename(src, dest);
        } catch (error) {
            if (error.code === 'EXDEV') {
                // Cross-device move, copy then delete
                await this.copyFile(src, dest);
                await fs.promises.unlink(src);
            } else {
                throw error;
            }
        }
    }
    
    async deleteFile(filePath, options = {}) {
        const { moveToTrash = false } = options;
        
        try {
            if (moveToTrash && require.resolve('trash')) {
                const trash = require('trash');
                await trash([filePath]);
            } else {
                await fs.promises.unlink(filePath);
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, consider it deleted
                return;
            }
            
            throw error;
        }
    }
    
    async getFileStats(filePath) {
        try {
            const stats = await fs.promises.stat(filePath);
            
            return {
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                accessed: stats.atime,
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory(),
                permissions: this.platform.isWindows ? null : stats.mode.toString(8),
                hidden: this.isHiddenFile(filePath)
            };
        } catch (error) {
            if (error.code === 'ENOENT') {
                return null;
            }
            throw error;
        }
    }
    
    isHiddenFile(filePath) {
        const basename = path.basename(filePath);
        
        if (this.platform.isWindows) {
            // On Windows, check file attributes
            try {
                const { spawn } = require('child_process');
                // This would need proper implementation for Windows hidden attribute
                return false;
            } catch {
                return basename.startsWith('.');
            }
        } else {
            // On Unix-like systems, files starting with . are hidden
            return basename.startsWith('.');
        }
    }
    
    resolvePath(...segments) {
        // Resolve path segments accounting for platform differences
        return path.resolve(...segments);
    }
    
    joinPath(...segments) {
        // Join path segments with correct separator
        return path.join(...segments);
    }
    
    normalizePath(inputPath) {
        // Normalize path separators and resolve . and ..
        return path.normalize(inputPath);
    }
    
    async watchDirectory(dirPath, callback, options = {}) {
        const { recursive = false, ignoreInitial = true } = options;
        
        try {
            // Use chokidar for cross-platform file watching
            const chokidar = require('chokidar');
            
            const watcher = chokidar.watch(dirPath, {
                ignored: /(^|[\/\\])\../, // ignore dotfiles
                persistent: true,
                recursive,
                ignoreInitial
            });
            
            watcher
                .on('add', (path) => callback({ type: 'add', path }))
                .on('change', (path) => callback({ type: 'change', path }))
                .on('unlink', (path) => callback({ type: 'remove', path }))
                .on('addDir', (path) => callback({ type: 'addDir', path }))
                .on('unlinkDir', (path) => callback({ type: 'removeDir', path }))
                .on('error', (error) => callback({ type: 'error', error }));
            
            return {
                close: () => watcher.close()
            };
            
        } catch (error) {
            throw new Error(`Failed to watch directory: ${error.message}`);
        }
    }
}
```

### 3.2 File Path Handling Inconsistencies

#### Path-Related Issues
```javascript
// PROBLEMATIC: Hard-coded path separators
const filePath = 'documents/notes/file.txt'; // Unix-style
const fullPath = process.cwd() + '\\' + filePath; // Windows-style mixed

// PROBLEMATIC: Case sensitivity assumptions
const userFile = 'MyFile.txt';
const exists = fs.existsSync('./myfile.txt'); // May fail on case-sensitive systems

// PROBLEMATIC: Path length limitations not considered
const longPath = 'very/long/path/that/exceeds/windows/path/length/limits/...';
```

#### Robust Path Handling
```javascript
// SOLUTION 1: Universal path utilities
class UniversalPathManager {
    constructor() {
        this.platform = process.platform;
        this.maxPathLength = this.getMaxPathLength();
        this.caseSensitive = this.isCaseSensitive();
    }
    
    getMaxPathLength() {
        // Platform-specific path length limits
        switch (this.platform) {
            case 'win32':
                return 260; // MAX_PATH on Windows (can be extended with long path support)
            case 'darwin':
                return 1024; // macOS limit
            default:
                return 4096; // Linux/Unix default
        }
    }
    
    isCaseSensitive() {
        // Most Unix systems are case-sensitive, Windows is not
        return this.platform !== 'win32';
    }
    
    normalizePath(inputPath) {
        // Normalize path separators and resolve relative segments
        let normalized = path.normalize(inputPath);
        
        // Convert to platform-appropriate separators
        if (this.platform === 'win32') {
            normalized = normalized.replace(/\//g, path.sep);
        } else {
            normalized = normalized.replace(/\\/g, path.sep);
        }
        
        return normalized;
    }
    
    joinPaths(...segments) {
        // Safely join path segments
        return path.join(...segments.map(segment => this.normalizePath(segment)));
    }
    
    resolvePath(...segments) {
        // Resolve to absolute path
        return path.resolve(...segments.map(segment => this.normalizePath(segment)));
    }
    
    validatePath(inputPath) {
        const normalized = this.normalizePath(inputPath);
        const issues = [];
        
        // Check path length
        if (normalized.length > this.maxPathLength) {
            issues.push({
                type: 'length',
                message: `Path exceeds maximum length of ${this.maxPathLength} characters`,
                actual: normalized.length
            });
        }
        
        // Check for invalid characters
        const invalidChars = this.getInvalidCharacters();
        for (const char of invalidChars) {
            if (normalized.includes(char)) {
                issues.push({
                    type: 'invalid_char',
                    message: `Path contains invalid character: '${char}'`,
                    character: char
                });
            }
        }
        
        // Check for reserved names (Windows)
        if (this.platform === 'win32') {
            const reservedNames = ['CON', 'PRN', 'AUX', 'NUL'];
            const segments = normalized.split(path.sep);
            
            for (const segment of segments) {
                const name = segment.toUpperCase().split('.')[0];
                if (reservedNames.includes(name)) {
                    issues.push({
                        type: 'reserved_name',
                        message: `Path contains reserved name: '${segment}'`,
                        segment
                    });
                }
            }
        }
        
        return {
            valid: issues.length === 0,
            issues,
            normalized
        };
    }
    
    getInvalidCharacters() {
        if (this.platform === 'win32') {
            return ['<', '>', ':', '"', '|', '?', '*'];
        } else {
            return ['\0']; // Only null character is universally invalid
        }
    }
    
    async findCaseInsensitive(basePath, targetName) {
        // Find file/directory regardless of case
        if (!this.caseSensitive) {
            return this.joinPaths(basePath, targetName);
        }
        
        try {
            const entries = await fs.promises.readdir(basePath);
            const found = entries.find(entry => 
                entry.toLowerCase() === targetName.toLowerCase()
            );
            
            return found ? this.joinPaths(basePath, found) : null;
        } catch {
            return null;
        }
    }
    
    async ensurePathExists(dirPath) {
        const validation = this.validatePath(dirPath);
        
        if (!validation.valid) {
            throw new Error(`Invalid path: ${validation.issues[0].message}`);
        }
        
        try {
            await fs.promises.mkdir(validation.normalized, { recursive: true });
            return validation.normalized;
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
            return validation.normalized;
        }
    }
    
    getRelativePath(from, to) {
        // Get relative path between two absolute paths
        const normalizedFrom = this.resolvePath(from);
        const normalizedTo = this.resolvePath(to);
        
        return path.relative(normalizedFrom, normalizedTo);
    }
    
    isSubPath(parent, child) {
        // Check if child path is under parent path
        const normalizedParent = this.resolvePath(parent);
        const normalizedChild = this.resolvePath(child);
        
        const relativePath = path.relative(normalizedParent, normalizedChild);
        
        // If relative path starts with ../, child is not under parent
        return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
    }
    
    truncatePath(inputPath, maxLength = null) {
        const limit = maxLength || this.maxPathLength;
        const normalized = this.normalizePath(inputPath);
        
        if (normalized.length <= limit) {
            return normalized;
        }
        
        // Truncate from the middle, preserving beginning and end
        const extension = path.extname(normalized);
        const directory = path.dirname(normalized);
        const basename = path.basename(normalized, extension);
        
        const availableLength = limit - directory.length - extension.length - 3; // 3 for "..."
        
        if (availableLength <= 0) {
            throw new Error('Path cannot be truncated to fit length limit');
        }
        
        const truncatedBase = basename.substring(0, availableLength);
        return this.joinPaths(directory, `${truncatedBase}...${extension}`);
    }
    
    // Safe file operations with path validation
    async safeReadFile(filePath, options = {}) {
        const validation = this.validatePath(filePath);
        
        if (!validation.valid) {
            throw new Error(`Invalid file path: ${validation.issues[0].message}`);
        }
        
        try {
            return await fs.promises.readFile(validation.normalized, options);
        } catch (error) {
            // Enhance error messages with path information
            if (error.code === 'ENOENT') {
                throw new Error(`File not found: ${validation.normalized}`);
            } else if (error.code === 'EACCES') {
                throw new Error(`Permission denied: ${validation.normalized}`);
            }
            throw error;
        }
    }
    
    async safeWriteFile(filePath, data, options = {}) {
        const validation = this.validatePath(filePath);
        
        if (!validation.valid) {
            throw new Error(`Invalid file path: ${validation.issues[0].message}`);
        }
        
        // Ensure directory exists
        const directory = path.dirname(validation.normalized);
        await this.ensurePathExists(directory);
        
        try {
            return await fs.promises.writeFile(validation.normalized, data, options);
        } catch (error) {
            if (error.code === 'EACCES') {
                throw new Error(`Permission denied: ${validation.normalized}`);
            }
            throw error;
        }
    }
}

// SOLUTION 2: Advanced path utilities for specific use cases
class AdvancedPathUtils extends UniversalPathManager {
    constructor() {
        super();
        this.homeDirectory = os.homedir();
        this.appDataDirectory = this.getAppDataDirectory();
    }
    
    getAppDataDirectory() {
        switch (this.platform) {
            case 'win32':
                return process.env.APPDATA || this.joinPaths(this.homeDirectory, 'AppData', 'Roaming');
            case 'darwin':
                return this.joinPaths(this.homeDirectory, 'Library', 'Application Support');
            default:
                return process.env.XDG_CONFIG_HOME || this.joinPaths(this.homeDirectory, '.config');
        }
    }
    
    expandTildePath(inputPath) {
        // Expand ~ to home directory
        if (inputPath.startsWith('~')) {
            return inputPath.replace('~', this.homeDirectory);
        }
        return inputPath;
    }
    
    contractTildePath(inputPath) {
        // Convert home directory to ~ (for display)
        const normalized = this.resolvePath(inputPath);
        
        if (normalized.startsWith(this.homeDirectory)) {
            return '~' + normalized.substring(this.homeDirectory.length);
        }
        
        return normalized;
    }
    
    getUniqueFileName(basePath, desiredName) {
        // Generate unique filename if desired name exists
        const extension = path.extname(desiredName);
        const basename = path.basename(desiredName, extension);
        let counter = 0;
        let uniqueName = desiredName;
        
        while (true) {
            const fullPath = this.joinPaths(basePath, uniqueName);
            
            try {
                fs.accessSync(fullPath);
                // File exists, try next number
                counter++;
                uniqueName = `${basename} (${counter})${extension}`;
            } catch {
                // File doesn't exist, use this name
                return uniqueName;
            }
        }
    }
    
    async getPathType(inputPath) {
        // Determine what type of path this is
        const validation = this.validatePath(inputPath);
        
        if (!validation.valid) {
            return { type: 'invalid', issues: validation.issues };
        }
        
        try {
            const stats = await fs.promises.stat(validation.normalized);
            
            if (stats.isFile()) {
                return {
                    type: 'file',
                    size: stats.size,
                    modified: stats.mtime,
                    extension: path.extname(validation.normalized)
                };
            } else if (stats.isDirectory()) {
                const contents = await fs.promises.readdir(validation.normalized);
                return {
                    type: 'directory',
                    itemCount: contents.length,
                    modified: stats.mtime
                };
            } else if (stats.isSymbolicLink()) {
                const target = await fs.promises.readlink(validation.normalized);
                return {
                    type: 'symlink',
                    target: this.resolvePath(path.dirname(validation.normalized), target)
                };
            }
            
            return { type: 'other' };
            
        } catch (error) {
            if (error.code === 'ENOENT') {
                return { type: 'nonexistent' };
            }
            return { type: 'error', error: error.message };
        }
    }
    
    createPortablePath(inputPath, portableRoot) {
        // Create a portable path that works across systems
        const normalized = this.resolvePath(inputPath);
        const rootPath = this.resolvePath(portableRoot);
        
        if (!this.isSubPath(rootPath, normalized)) {
            throw new Error('Path is not within portable root directory');
        }
        
        const relativePath = this.getRelativePath(rootPath, normalized);
        
        // Use forward slashes for portability
        return relativePath.split(path.sep).join('/');
    }
    
    resolvePortablePath(portablePath, portableRoot) {
        // Resolve a portable path to system-specific path
        const segments = portablePath.split('/');
        return this.joinPaths(portableRoot, ...segments);
    }
    
    sanitizeForWeb(inputPath) {
        // Sanitize path for use in web contexts (URLs, etc.)
        return inputPath
            .split(path.sep)
            .map(segment => encodeURIComponent(segment))
            .join('/');
    }
    
    // Batch operations
    async processPathBatch(paths, operation, options = {}) {
        const { concurrency = 5, continueOnError = false } = options;
        const results = [];
        
        // Process paths in batches to avoid overwhelming the system
        for (let i = 0; i < paths.length; i += concurrency) {
            const batch = paths.slice(i, i + concurrency);
            
            const batchPromises = batch.map(async (inputPath) => {
                try {
                    const result = await operation(inputPath);
                    return { path: inputPath, success: true, result };
                } catch (error) {
                    if (continueOnError) {
                        return { path: inputPath, success: false, error: error.message };
                    }
                    throw error;
                }
            });
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }
        
        return results;
    }
}
```

### 3.3 Keyboard Shortcut Conflicts

#### Platform-Specific Shortcut Issues
```javascript
// PROBLEMATIC: Hard-coded shortcuts
const { globalShortcut } = require('electron');

// Uses Ctrl on all platforms (should be Cmd on Mac)
globalShortcut.register('Ctrl+N', () => {
    createNewNote();
});

// PROBLEMATIC: System shortcut conflicts
globalShortcut.register('Ctrl+Alt+Delete', handler); // System shortcut on Windows
globalShortcut.register('Cmd+Space', handler); // Spotlight on Mac
```

#### Cross-Platform Shortcut Management
```javascript
// SOLUTION 1: Platform-aware shortcut system
class ShortcutManager {
    constructor() {
        this.platform = process.platform;
        this.isMac = this.platform === 'darwin';
        this.registeredShortcuts = new Map();
        this.conflictChecks = new Map();
        
        this.setupPlatformDefaults();
        this.loadSystemConflicts();
    }
    
    setupPlatformDefaults() {
        // Platform-specific modifier key mappings
        this.modifiers = {
            primary: this.isMac ? 'Cmd' : 'Ctrl',
            secondary: this.isMac ? 'Ctrl' : 'Alt',
            tertiary: 'Shift'
        };
        
        // Common shortcuts with platform adaptations
        this.shortcuts = {
            newFile: `${this.modifiers.primary}+N`,
            openFile: `${this.modifiers.primary}+O`,
            saveFile: `${this.modifiers.primary}+S`,
            copy: `${this.modifiers.primary}+C`,
            paste: `${this.modifiers.primary}+V`,
            cut: `${this.modifiers.primary}+X`,
            undo: `${this.modifiers.primary}+Z`,
            redo: this.isMac ? `${this.modifiers.primary}+Shift+Z` : `${this.modifiers.primary}+Y`,
            find: `${this.modifiers.primary}+F`,
            quit: this.isMac ? `${this.modifiers.primary}+Q` : `${this.modifiers.secondary}+F4`,
            preferences: this.isMac ? `${this.modifiers.primary}+,` : `${this.modifiers.primary}+,`,
            minimize: this.isMac ? `${this.modifiers.primary}+M` : `${this.modifiers.secondary}+Space`,
            close: this.isMac ? `${this.modifiers.primary}+W` : `${this.modifiers.secondary}+F4`
        };
    }
    
    loadSystemConflicts() {
        // Known system shortcuts that should not be overridden
        const systemShortcuts = {
            'win32': [
                'Ctrl+Alt+Delete', 'Ctrl+Shift+Esc', 'Win+L', 'Alt+Tab',
                'Win+R', 'Win+X', 'Ctrl+Alt+T'
            ],
            'darwin': [
                'Cmd+Space', 'Cmd+Tab', 'Cmd+Option+Esc', 'Cmd+Shift+3',
                'Cmd+Shift+4', 'Cmd+Shift+5', 'Control+Up', 'Control+Down'
            ],
            'linux': [
                'Ctrl+Alt+T', 'Alt+F2', 'Super+L', 'Alt+Tab',
                'Ctrl+Alt+F1', 'Ctrl+Alt+F2', 'Print'
            ]
        };
        
        this.systemShortcuts = new Set(systemShortcuts[this.platform] || []);
    }
    
    register(shortcutId, accelerator, handler, options = {}) {
        const { 
            global = false, 
            allowSystemConflict = false, 
            description = '',
            category = 'general' 
        } = options;
        
        try {
            // Validate shortcut
            const validation = this.validateShortcut(accelerator, allowSystemConflict);
            if (!validation.valid) {
                throw new Error(`Invalid shortcut: ${validation.reason}`);
            }
            
            // Check for existing registration
            if (this.registeredShortcuts.has(shortcutId)) {
                this.unregister(shortcutId);
            }
            
            const shortcutInfo = {
                id: shortcutId,
                accelerator: validation.normalized,
                handler,
                global,
                description,
                category,
                registeredAt: Date.now()
            };
            
            if (global) {
                const { globalShortcut } = require('electron');
                const success = globalShortcut.register(validation.normalized, () => {
                    this.executeHandler(shortcutInfo, 'global');
                });
                
                if (!success) {
                    throw new Error(`Failed to register global shortcut: ${validation.normalized}`);
                }
            }
            
            this.registeredShortcuts.set(shortcutId, shortcutInfo);
            
            return {
                success: true,
                shortcut: shortcutInfo,
                normalized: validation.normalized
            };
            
        } catch (error) {
            console.error(`Shortcut registration failed for ${shortcutId}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    validateShortcut(accelerator, allowSystemConflict = false) {
        // Normalize accelerator string
        const normalized = this.normalizeAccelerator(accelerator);
        
        // Check for system conflicts
        if (!allowSystemConflict && this.systemShortcuts.has(normalized)) {
            return {
                valid: false,
                reason: `Conflicts with system shortcut: ${normalized}`
            };
        }
        
        // Check for valid key combination
        const parts = normalized.split('+');
        const key = parts[parts.length - 1];
        
        if (!this.isValidKey(key)) {
            return {
                valid: false,
                reason: `Invalid key: ${key}`
            };
        }
        
        // Check for modifier requirements
        const modifiers = parts.slice(0, -1);
        if (modifiers.length === 0 && this.requiresModifier(key)) {
            return {
                valid: false,
                reason: `Key ${key} requires at least one modifier`
            };
        }
        
        return {
            valid: true,
            normalized
        };
    }
    
    normalizeAccelerator(accelerator) {
        // Normalize accelerator format
        let normalized = accelerator;
        
        // Handle platform-specific variations
        if (this.isMac) {
            normalized = normalized
                .replace(/\bCtrl\b/g, 'Control')
                .replace(/\bAlt\b/g, 'Option')
                .replace(/\bMeta\b/g, 'Cmd');
        } else {
            normalized = normalized
                .replace(/\bCmd\b/g, 'Ctrl')
                .replace(/\bCommand\b/g, 'Ctrl')
                .replace(/\bOption\b/g, 'Alt');
        }
        
        // Standardize separator and order
        const parts = normalized.split(/[+\-\s]/).filter(part => part.trim());
        const key = parts.pop();
        const modifiers = parts.sort();
        
        return [...modifiers, key].join('+');
    }
    
    isValidKey(key) {
        const validKeys = [
            // Function keys
            'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
            // Numbers
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            // Letters
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            // Special keys
            'Space', 'Tab', 'Enter', 'Return', 'Escape', 'Backspace', 'Delete',
            'Insert', 'Home', 'End', 'PageUp', 'PageDown',
            'Up', 'Down', 'Left', 'Right',
            // Symbols
            'Plus', 'Minus', 'Equal', 'Backquote', 'Bracket', 'Backslash',
            'Semicolon', 'Quote', 'Comma', 'Period', 'Slash'
        ];
        
        return validKeys.includes(key) || /^[A-Z]$/.test(key);
    }
    
    requiresModifier(key) {
        // Keys that should not be used without modifiers (to avoid conflicts)
        const modifierRequired = [
            'Space', 'Tab', 'Enter', 'Return', 'Escape', 'Backspace', 'Delete',
            'Up', 'Down', 'Left', 'Right'
        ];
        
        return modifierRequired.includes(key) || /^[A-Z0-9]$/.test(key);
    }
    
    unregister(shortcutId) {
        const shortcut = this.registeredShortcuts.get(shortcutId);
        if (!shortcut) {
            return false;
        }
        
        if (shortcut.global) {
            const { globalShortcut } = require('electron');
            globalShortcut.unregister(shortcut.accelerator);
        }
        
        this.registeredShortcuts.delete(shortcutId);
        return true;
    }
    
    unregisterAll() {
        const { globalShortcut } = require('electron');
        globalShortcut.unregisterAll();
        this.registeredShortcuts.clear();
    }
    
    executeHandler(shortcutInfo, context) {
        try {
            shortcutInfo.handler({
                shortcut: shortcutInfo,
                context,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error(`Error executing shortcut handler for ${shortcutInfo.id}:`, error);
        }
    }
}
```
```
```
```

This analysis covers the critical edge cases and vulnerabilities in Node.js runtime and Electron framework environments. Each section provides specific technical implementation details, security mitigation strategies, and testing approaches to handle these challenging scenarios effectively.

Would you like me to continue with the remaining sections (Update Mechanism Failures, Cross-Platform Compatibility, and Security Vulnerabilities) in the next part?