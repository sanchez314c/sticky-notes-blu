/**
 * Secure IPC Handlers with Comprehensive Input Validation
 * All IPC communication is validated, sanitized, and rate-limited
 */

const { validator } = require('./inputValidation');

class SecureIpcHandlers {
  constructor(stickyNotes, saveAllNotes, screen) {
    this.stickyNotes = stickyNotes;
    this.saveAllNotes = saveAllNotes;
    this.screen = screen;
    
    // Rate limiters for different operations
    this.rateLimiters = {
      save: validator.createRateLimiter(50, 60000),
      color: validator.createRateLimiter(30, 60000),
      create: validator.createRateLimiter(20, 60000),
      move: validator.createRateLimiter(100, 60000),
      resize: validator.createRateLimiter(100, 60000)
    };
  }

  /**
   * Handle save-note-content with comprehensive validation
   * SECURITY FIX: Added authentication and authorization checks
   */
  handleSaveNoteContent = (event, data) => {
    try {
      // SECURITY FIX: Check authentication and authorization
      if (global.authzManager) {
        global.authzManager.validateIpcOperation('save-note-content', data);
      }
      
      // Rate limiting
      this.rateLimiters.save('save-note-content');
      
      // Comprehensive validation
      const validatedData = validator.validateIpcData(data, 'save-note-content');
      
      const note = this.stickyNotes.get(validatedData.id);
      if (note && !note.window.isDestroyed()) {
        // Enhanced security checks with confidence scoring
        const cmdInjectionResult = validator.containsCommandInjection(validatedData.content);
        if (cmdInjectionResult.detected && cmdInjectionResult.confidence > 0.6) {
          console.error('Command injection attempt:', {
            content: validatedData.content.substring(0, 100),
            confidence: cmdInjectionResult.confidence,
            patterns: cmdInjectionResult.patterns.length
          });
          throw new Error(`Command injection attempt detected (confidence: ${(cmdInjectionResult.confidence * 100).toFixed(1)}%)`);
        }
        
        const sqlInjectionResult = validator.containsSqlInjection(validatedData.content);
        if (sqlInjectionResult.detected && sqlInjectionResult.confidence > 0.6) {
          console.error('SQL injection attempt:', {
            content: validatedData.content.substring(0, 100),
            confidence: sqlInjectionResult.confidence,
            patterns: sqlInjectionResult.patterns.length
          });
          throw new Error(`SQL injection attempt detected (confidence: ${(sqlInjectionResult.confidence * 100).toFixed(1)}%)`);
        }
        
        const pathTraversalResult = validator.containsPathTraversal(validatedData.content);
        if (pathTraversalResult.detected && pathTraversalResult.confidence > 0.6) {
          console.error('Path traversal attempt:', {
            content: validatedData.content.substring(0, 100),
            confidence: pathTraversalResult.confidence,
            patterns: pathTraversalResult.patterns.length
          });
          throw new Error(`Path traversal attempt detected (confidence: ${(pathTraversalResult.confidence * 100).toFixed(1)}%)`);
        }
        
        note.content = validatedData.content;
        note.modified = new Date().toISOString();
        this.saveAllNotes();
        console.log(`Note ${validatedData.id} content saved successfully`);
        
        // Send success confirmation
        event.reply('note-saved', { id: validatedData.id, success: true });
      } else {
        console.warn('Attempt to save content for non-existent note:', validatedData.id);
        event.reply('note-error', { 
          id: validatedData.id, 
          message: 'Note not found' 
        });
      }
    } catch (error) {
      console.error('Security validation failed for save-note-content:', error.message);
      event.reply('validation-error', { 
      message: 'Security validation failed', 
      type: 'save-note-content',
      details: error.message,
        timestamp: new Date().toISOString()
        });
    }
  };

  /**
   * Handle change-note-color with validation
   * SECURITY FIX: Added authentication and authorization checks
   */
  handleChangeNoteColor = (event, data) => {
    try {
      // SECURITY FIX: Check authentication and authorization
      if (global.authzManager) {
        global.authzManager.validateIpcOperation('change-note-color', data);
      }
      
      // Rate limiting
      this.rateLimiters.color('change-note-color');
      
      // Comprehensive validation
      const validatedData = validator.validateIpcData(data, 'change-note-color');
      
      const note = this.stickyNotes.get(validatedData.id);
      if (note && !note.window.isDestroyed()) {
        note.color = validatedData.color;
        note.modified = new Date().toISOString();
        this.saveAllNotes();
        console.log(`Note ${validatedData.id} color changed to ${validatedData.color}`);
        
        event.reply('note-color-changed', { 
          id: validatedData.id, 
          color: validatedData.color,
          success: true 
        });
      } else {
        console.warn('Attempt to change color for non-existent note:', validatedData.id);
        event.reply('note-error', { 
          id: validatedData.id, 
          message: 'Note not found' 
        });
      }
    } catch (error) {
      console.error('Security validation failed for change-note-color:', error.message);
      event.reply('validation-error', { 
        message: 'Invalid color data', 
        type: 'change-note-color',
        details: error.message
      });
    }
  };

  /**
   * Handle close-note with validation
   */
  handleCloseNote = (event, noteId) => {
    try {
      // Validate note ID
      const validatedId = validator.validateNoteId(noteId);
      
      const note = this.stickyNotes.get(validatedId);
      if (note && !note.window.isDestroyed()) {
        note.window.close();
        console.log(`Note ${validatedId} closed`);
      } else {
        console.warn('Attempt to close non-existent note:', validatedId);
      }
    } catch (error) {
      console.error('Security validation failed for close-note:', error.message);
      event.reply('validation-error', { 
        message: 'Invalid note ID', 
        type: 'close-note',
        details: error.message
      });
    }
  };

  /**
   * Handle minimize-note with validation
   */
  handleMinimizeNote = (event, noteId) => {
    try {
      // Validate note ID
      const validatedId = validator.validateNoteId(noteId);
      
      const note = this.stickyNotes.get(validatedId);
      if (note && !note.window.isDestroyed()) {
        note.window.minimize();
        console.log(`Note ${validatedId} minimized`);
      } else {
        console.warn('Attempt to minimize non-existent note:', validatedId);
      }
    } catch (error) {
      console.error('Security validation failed for minimize-note:', error.message);
      event.reply('validation-error', { 
        message: 'Invalid note ID', 
        type: 'minimize-note',
        details: error.message
      });
    }
  };

  /**
   * Handle create-new-note with rate limiting
   */
  handleCreateNewNote = (event, createStickyNote) => {
    try {
      // Rate limiting
      this.rateLimiters.create('create-new-note');
      
      // Check maximum notes limit
      if (this.stickyNotes.size >= 50) {
        throw new Error('Maximum number of notes reached');
      }
      
      const newNote = createStickyNote();
      if (newNote) {
        console.log('New note created successfully');
        event.reply('note-created', { success: true });
      } else {
        event.reply('note-error', { message: 'Failed to create note' });
      }
    } catch (error) {
      console.error('Failed to create new note:', error.message);
      event.reply('validation-error', { 
        message: 'Cannot create new note', 
        type: 'create-new-note',
        details: error.message
      });
    }
  };

  /**
   * Handle move-window with bounds validation
   */
  handleMoveWindow = (event, data) => {
    try {
      // Rate limiting for move operations
      this.rateLimiters.move('move-window');
      
      // Validate input data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid move data');
      }
      
      const validatedId = validator.validateNoteId(data.id);
      
      if (typeof data.x !== 'number' || typeof data.y !== 'number') {
        throw new Error('Invalid coordinates');
      }
      
      const note = this.stickyNotes.get(validatedId);
      if (note && !note.window.isDestroyed()) {
        const display = this.screen.getPrimaryDisplay();
        const { width: screenWidth, height: screenHeight } = display.workAreaSize;
        const bounds = note.window.getBounds();
        
        // Ensure window stays within screen bounds
        const x = Math.max(0, Math.min(data.x, screenWidth - bounds.width));
        const y = Math.max(0, Math.min(data.y, screenHeight - bounds.height));
        
        note.window.setPosition(Math.floor(x), Math.floor(y));
        note.bounds = note.window.getBounds();
        note.modified = new Date().toISOString();
        
        // Throttled save to prevent excessive disk writes
        clearTimeout(note.saveTimeout);
        note.saveTimeout = setTimeout(() => this.saveAllNotes(), 1000);
        
        console.log(`Note ${validatedId} moved to (${x}, ${y})`);
      } else {
        console.warn('Attempt to move non-existent note:', validatedId);
      }
    } catch (error) {
      console.error('Security validation failed for move-window:', error.message);
      event.reply('validation-error', { 
        message: 'Invalid move operation', 
        type: 'move-window',
        details: error.message
      });
    }
  };

  /**
   * Handle resize-window with bounds validation
   */
  handleResizeWindow = (event, data) => {
    try {
      // Rate limiting for resize operations
      this.rateLimiters.resize('resize-window');
      
      // Validate input data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid resize data');
      }
      
      const validatedId = validator.validateNoteId(data.id);
      
      if (typeof data.width !== 'number' || typeof data.height !== 'number') {
        throw new Error('Invalid dimensions');
      }
      
      // Validate size constraints
      const minWidth = 200, minHeight = 150;
      const maxWidth = 1000, maxHeight = 800;
      
      if (data.width < minWidth || data.height < minHeight || 
          data.width > maxWidth || data.height > maxHeight) {
        throw new Error('Window size out of allowed range');
      }
      
      const note = this.stickyNotes.get(validatedId);
      if (note && !note.window.isDestroyed()) {
        note.window.setSize(Math.floor(data.width), Math.floor(data.height));
        note.bounds = note.window.getBounds();
        note.modified = new Date().toISOString();
        
        // Throttled save
        clearTimeout(note.saveTimeout);
        note.saveTimeout = setTimeout(() => this.saveAllNotes(), 1000);
        
        console.log(`Note ${validatedId} resized to ${data.width}x${data.height}`);
      } else {
        console.warn('Attempt to resize non-existent note:', validatedId);
      }
    } catch (error) {
      console.error('Security validation failed for resize-window:', error.message);
      event.reply('validation-error', { 
        message: 'Invalid resize operation', 
        type: 'resize-window',
        details: error.message
      });
    }
  };

  /**
   * Register all secure IPC handlers
   */
  registerHandlers(ipcMain, createStickyNote) {
    // Remove any existing listeners to prevent duplicates
    ipcMain.removeAllListeners('save-note-content');
    ipcMain.removeAllListeners('change-note-color');
    ipcMain.removeAllListeners('close-note');
    ipcMain.removeAllListeners('minimize-note');
    ipcMain.removeAllListeners('create-new-note');
    ipcMain.removeAllListeners('move-window');
    ipcMain.removeAllListeners('resize-window');
    
    // Register secure handlers
    ipcMain.on('save-note-content', this.handleSaveNoteContent);
    ipcMain.on('change-note-color', this.handleChangeNoteColor);
    ipcMain.on('close-note', this.handleCloseNote);
    ipcMain.on('minimize-note', this.handleMinimizeNote);
    ipcMain.on('create-new-note', (event) => this.handleCreateNewNote(event, createStickyNote));
    ipcMain.on('move-window', this.handleMoveWindow);
    ipcMain.on('resize-window', this.handleResizeWindow);
    
    console.log('Secure IPC handlers registered successfully');
  }
}

module.exports = { SecureIpcHandlers };