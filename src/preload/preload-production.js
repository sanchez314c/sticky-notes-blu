// ================= PRELOAD SCRIPT =================
// Secure bridge between main and renderer processes

const { contextBridge, ipcRenderer } = require('electron');

// ================= SECURITY VALIDATION =================

// Input validation helper
function validateInput(input, type = 'string', maxLength = 10000) {
  if (typeof input !== type) {
    throw new Error(`Invalid input type. Expected ${type}`);
  }
  
  if (type === 'string' && input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength}`);
  }
  
  // Basic XSS prevention
  if (type === 'string') {
    const dangerous = /<script|javascript:|on\w+=/gi;
    if (dangerous.test(input)) {
      throw new Error('Input contains potentially dangerous content');
    }
  }
  
  return true;
}

// Rate limiting
const rateLimiter = new Map();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_CALLS_PER_WINDOW = 10;

function checkRateLimit(channel) {
  const now = Date.now();
  const key = `${channel}`;
  
  if (!rateLimiter.has(key)) {
    rateLimiter.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  const limit = rateLimiter.get(key);
  
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_LIMIT_WINDOW;
    return true;
  }
  
  if (limit.count >= MAX_CALLS_PER_WINDOW) {
    throw new Error('Rate limit exceeded');
  }
  
  limit.count++;
  return true;
}

// ================= IPC CHANNEL WHITELIST =================

const ALLOWED_CHANNELS = {
  // Outgoing (renderer to main)
  send: [
    'save-note-content',
    'update-note-color',
    'close-note',
    'minimize-note',
    'toggle-pin',
    'update-font-size',
    'resize-window'
  ],
  
  // Incoming (main to renderer)
  receive: [
    'init-note',
    'window-focused',
    'window-blurred',
    'export-notes',
    'import-notes',
    'pin-toggled'
  ],
  
  // Bidirectional (invoke/handle)
  invoke: [
    'create-new-note',
    'get-all-notes',
    'delete-note',
    'export-notes',
    'import-notes'
  ]
};

// ================= EXPOSED API =================

contextBridge.exposeInMainWorld('electronAPI', {
  // ================= NOTE OPERATIONS =================
  
  // Save note content
  saveNoteContent: (noteId, content) => {
    try {
      checkRateLimit('save-note-content');
      validateInput(noteId, 'string', 100);
      validateInput(content, 'string', 100000);
      ipcRenderer.send('save-note-content', noteId, content);
    } catch (error) {
      console.error('Error saving note content:', error);
    }
  },
  
  // Update note color
  updateNoteColor: (noteId, color) => {
    try {
      checkRateLimit('update-note-color');
      validateInput(noteId, 'string', 100);
      validateInput(color, 'string', 50);
      
      // Validate color format
      if (!color.match(/^gradient-\w+$/)) {
        throw new Error('Invalid color format');
      }
      
      ipcRenderer.send('update-note-color', noteId, color);
    } catch (error) {
      console.error('Error updating note color:', error);
    }
  },
  
  // Close note
  closeNote: (noteId) => {
    try {
      checkRateLimit('close-note');
      validateInput(noteId, 'string', 100);
      ipcRenderer.send('close-note', noteId);
    } catch (error) {
      console.error('Error closing note:', error);
    }
  },
  
  // Minimize note
  minimizeNote: (noteId) => {
    try {
      checkRateLimit('minimize-note');
      validateInput(noteId, 'string', 100);
      ipcRenderer.send('minimize-note', noteId);
    } catch (error) {
      console.error('Error minimizing note:', error);
    }
  },
  
  // Create new note
  createNewNote: async () => {
    try {
      checkRateLimit('create-new-note');
      return await ipcRenderer.invoke('create-new-note');
    } catch (error) {
      console.error('Error creating new note:', error);
      return null;
    }
  },
  
  // Delete note
  deleteNote: async (noteId) => {
    try {
      checkRateLimit('delete-note');
      validateInput(noteId, 'string', 100);
      return await ipcRenderer.invoke('delete-note', noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  },
  
  // ================= WINDOW OPERATIONS =================
  
  // Toggle pin state
  togglePin: (noteId) => {
    try {
      checkRateLimit('toggle-pin');
      validateInput(noteId, 'string', 100);
      ipcRenderer.send('toggle-pin', noteId);
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  },
  
  // Update font size
  updateFontSize: (noteId, fontSize) => {
    try {
      checkRateLimit('update-font-size');
      validateInput(noteId, 'string', 100);
      
      if (typeof fontSize !== 'number' || fontSize < 10 || fontSize > 24) {
        throw new Error('Invalid font size');
      }
      
      ipcRenderer.send('update-font-size', noteId, fontSize);
    } catch (error) {
      console.error('Error updating font size:', error);
    }
  },
  
  // Resize window
  resizeWindow: (noteId, width, height) => {
    try {
      checkRateLimit('resize-window');
      validateInput(noteId, 'string', 100);
      
      if (typeof width !== 'number' || typeof height !== 'number') {
        throw new Error('Invalid dimensions');
      }
      
      if (width < 200 || width > 800 || height < 200 || height > 800) {
        throw new Error('Dimensions out of range');
      }
      
      ipcRenderer.send('resize-window', noteId, width, height);
    } catch (error) {
      console.error('Error resizing window:', error);
    }
  },
  
  // ================= DATA OPERATIONS =================
  
  // Get all notes
  getAllNotes: async () => {
    try {
      checkRateLimit('get-all-notes');
      return await ipcRenderer.invoke('get-all-notes');
    } catch (error) {
      console.error('Error getting all notes:', error);
      return [];
    }
  },
  
  // Export notes
  exportNotes: async () => {
    try {
      checkRateLimit('export-notes');
      return await ipcRenderer.invoke('export-notes');
    } catch (error) {
      console.error('Error exporting notes:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Import notes
  importNotes: async () => {
    try {
      checkRateLimit('import-notes');
      return await ipcRenderer.invoke('import-notes');
    } catch (error) {
      console.error('Error importing notes:', error);
      return { success: false, error: error.message };
    }
  },
  
  // ================= EVENT LISTENERS =================
  
  // Initialize note
  onInitNote: (callback) => {
    const safeCallback = (event, data) => {
      try {
        // Validate incoming data
        if (data && typeof data === 'object') {
          callback(data);
        }
      } catch (error) {
        console.error('Error in init note callback:', error);
      }
    };
    
    ipcRenderer.on('init-note', safeCallback);
    
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('init-note', safeCallback);
    };
  },
  
  // Window focused
  onWindowFocused: (callback) => {
    const safeCallback = () => {
      try {
        callback();
      } catch (error) {
        console.error('Error in window focused callback:', error);
      }
    };
    
    ipcRenderer.on('window-focused', safeCallback);
    
    return () => {
      ipcRenderer.removeListener('window-focused', safeCallback);
    };
  },
  
  // Window blurred
  onWindowBlurred: (callback) => {
    const safeCallback = () => {
      try {
        callback();
      } catch (error) {
        console.error('Error in window blurred callback:', error);
      }
    };
    
    ipcRenderer.on('window-blurred', safeCallback);
    
    return () => {
      ipcRenderer.removeListener('window-blurred', safeCallback);
    };
  },
  
  // Export notes event
  onExportNotes: (callback) => {
    const safeCallback = () => {
      try {
        callback();
      } catch (error) {
        console.error('Error in export notes callback:', error);
      }
    };
    
    ipcRenderer.on('export-notes', safeCallback);
    
    return () => {
      ipcRenderer.removeListener('export-notes', safeCallback);
    };
  },
  
  // Import notes event
  onImportNotes: (callback) => {
    const safeCallback = () => {
      try {
        callback();
      } catch (error) {
        console.error('Error in import notes callback:', error);
      }
    };
    
    ipcRenderer.on('import-notes', safeCallback);
    
    return () => {
      ipcRenderer.removeListener('import-notes', safeCallback);
    };
  },
  
  // Pin toggled event
  onPinToggled: (callback) => {
    const safeCallback = (event, pinned) => {
      try {
        if (typeof pinned === 'boolean') {
          callback(pinned);
        }
      } catch (error) {
        console.error('Error in pin toggled callback:', error);
      }
    };
    
    ipcRenderer.on('pin-toggled', safeCallback);
    
    return () => {
      ipcRenderer.removeListener('pin-toggled', safeCallback);
    };
  },
  
  // ================= SYSTEM INFO =================
  
  // Get platform
  getPlatform: () => {
    return process.platform;
  },
  
  // Get version
  getVersion: () => {
    return process.versions.electron;
  }
});

// ================= CLEANUP =================

// Clean up rate limiter periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, limit] of rateLimiter.entries()) {
    if (now > limit.resetTime + 60000) { // Clean up entries older than 1 minute
      rateLimiter.delete(key);
    }
  }
}, 60000);

// Log preload script initialization
console.log('Preload script initialized with security features enabled');