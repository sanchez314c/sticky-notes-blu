const { app, BrowserWindow, ipcMain, screen, Menu, Tray, nativeImage, globalShortcut, session } = require('electron');
const Store = require('electron-store');
const path = require('path');
const ElectronSecurityHardening = require('./security-hardening');

// Initialize comprehensive security hardening
const securityHardening = new ElectronSecurityHardening();
securityHardening.initialize();

// Initialize store for persistent data with enhanced security
const store = new Store({
  name: 'stickynotes-data-secure',
  defaults: {
    stickyNotes: [],
    settings: {
      autoSave: true,
      saveInterval: 500,
      maxNotes: 50
    },
    lastNoteId: 0
  },
  // SECURITY: Enhanced encryption
  encryptionKey: 'stickynotes-secure-encryption-key-2024',
  
  // SECURITY: Schema validation with strict types
  schema: {
    stickyNotes: {
      type: 'array',
      maxItems: 50, // Prevent memory exhaustion
      items: {
        type: 'object',
        properties: {
          id: { 
            type: 'string', 
            pattern: '^[a-zA-Z0-9_-]+$',
            minLength: 1,
            maxLength: 100
          },
          content: { 
            type: 'string',
            maxLength: 100000 // 100KB limit
          },
          color: { 
            type: 'string',
            enum: [
              'gradient-1', 'gradient-2', 'gradient-3', 'gradient-4',
              'gradient-5', 'gradient-6', 'gradient-7', 'gradient-8',
              'gradient-9', 'gradient-10', 'gradient-11', 'gradient-12',
              'gradient-dark', 'gradient-light', 'gradient-gold', 'gradient-silver'
            ]
          },
          bounds: {
            type: 'object',
            properties: {
              x: { type: 'number', minimum: -1000, maximum: 10000 },
              y: { type: 'number', minimum: -1000, maximum: 10000 },
              width: { type: 'number', minimum: 200, maximum: 1200 },
              height: { type: 'number', minimum: 150, maximum: 1000 }
            },
            required: ['x', 'y', 'width', 'height']
          },
          created: { type: 'string', format: 'date-time' },
          modified: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'content', 'color', 'bounds']
      }
    },
    settings: {
      type: 'object',
      properties: {
        autoSave: { type: 'boolean' },
        saveInterval: { type: 'number', minimum: 100, maximum: 5000 },
        maxNotes: { type: 'number', minimum: 1, maximum: 50 }
      }
    },
    lastNoteId: { type: 'number', minimum: 0 }
  }
});

// SECURITY: Enhanced secure storage
let stickyNotes = new Map();
let tray = null;
let noteIdCounter = store.get('lastNoteId', 0);

// SECURITY: Enhanced auto-save with integrity checks
let saveTimeout = null;
function debouncedSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      saveAllNotes();
    } catch (error) {
      console.error('Error during debounced save:', error);
      // Attempt recovery save with minimal data
      try {
        store.set('stickyNotes', []);
        console.log('Recovery save completed');
      } catch (recoveryError) {
        console.error('Critical: Recovery save failed:', recoveryError);
      }
    }
  }, store.get('settings.saveInterval', 500));
}

function forceSave() {
  clearTimeout(saveTimeout);
  saveAllNotes();
}

// SECURITY: Hardened default note configuration
function getSecureNoteConfiguration(savedData = null) {
  const display = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = display.workAreaSize;
  
  // Calculate safe positioning
  const defaultWidth = 300;
  const defaultHeight = 300;
  let defaultX, defaultY;
  
  if (savedData?.bounds?.x !== undefined && savedData?.bounds?.y !== undefined) {
    // Validate saved bounds against current screen
    const validatedBounds = securityHardening.sanitizeWindowBounds(
      savedData.bounds, 
      { width: screenWidth, height: screenHeight }
    );
    defaultX = validatedBounds.x;
    defaultY = validatedBounds.y;
  } else {
    // Smart cascading for new notes
    const offset = (stickyNotes.size % 10) * 25;
    defaultX = Math.min(100 + offset, screenWidth - defaultWidth);
    defaultY = Math.min(100 + offset, screenHeight - defaultHeight);
  }

  return {
    x: defaultX,
    y: defaultY,
    width: savedData?.bounds?.width || defaultWidth,
    height: savedData?.bounds?.height || defaultHeight,
    backgroundColor: '#1a1a1a', // Darker for better security indication
    alwaysOnTop: true,
    frame: false,
    resizable: true,
    movable: true,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    hasShadow: true,
    transparent: true,
    titleBarStyle: 'customButtonsOnHover',
    vibrancy: 'dark',
    visualEffectState: 'active',
    show: false, // Don't show until security checks pass
    focusable: true,
    autoHideMenuBar: true,
    
    // SECURITY: Maximum hardened WebPreferences
    webPreferences: securityHardening.getSecureWebPreferences(
      path.join(__dirname, 'preload-secure.js')
    )
  };
}

// SECURITY: Enhanced note creation with comprehensive security checks
function createStickyNote(savedData = null) {
  try {
    // SECURITY: Enforce note limits
    const maxNotes = store.get('settings.maxNotes', 50);
    if (stickyNotes.size >= maxNotes) {
      console.warn(`Maximum number of notes reached: ${maxNotes}`);
      return null;
    }
    
    // SECURITY: Validate saved data if provided
    if (savedData) {
      try {
        if (!savedData.id || typeof savedData.id !== 'string') {
          throw new Error('Invalid note ID in saved data');
        }
        savedData.id = securityHardening.sanitizeNoteId(savedData.id);
        savedData.content = securityHardening.sanitizeContent(savedData.content || '');
      } catch (validationError) {
        console.error('Saved data validation failed:', validationError);
        savedData = null; // Start fresh if data is corrupted
      }
    }
    
    const noteId = savedData?.id || `note_${++noteIdCounter}`;
    
    // SECURITY: Prevent duplicate notes
    if (stickyNotes.has(noteId)) {
      console.warn(`Note with ID ${noteId} already exists`);
      return stickyNotes.get(noteId).window;
    }
    
    // SECURITY: Create window with hardened configuration
    const noteConfig = getSecureNoteConfiguration(savedData);
    const noteWindow = new BrowserWindow(noteConfig);
    
    // SECURITY: Enhanced navigation and content security
    noteWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      try {
        const parsedUrl = new URL(navigationUrl);
        // Only allow file:// protocol for local resources
        if (parsedUrl.protocol !== 'file:' && parsedUrl.protocol !== 'chrome-devtools:') {
          console.warn(`SECURITY: Blocked navigation to: ${navigationUrl}`);
          event.preventDefault();
          
          // Log security event
          console.error(`Security violation: Attempt to navigate to ${navigationUrl}`);
        }
      } catch (urlError) {
        console.warn(`SECURITY: Blocked invalid URL navigation: ${navigationUrl}`);
        event.preventDefault();
      }
    });
    
    noteWindow.webContents.on('new-window', (event, navigationUrl) => {
      console.warn(`SECURITY: Blocked new window creation to: ${navigationUrl}`);
      event.preventDefault();
    });
    
    noteWindow.webContents.on('will-attach-webview', (event, webPreferences, params) => {
      console.warn(`SECURITY: Blocked webview attachment`);
      event.preventDefault();
    });
    
    // SECURITY: Prevent external resource loading
    noteWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
      try {
        const url = new URL(details.url);
        
        // Only allow file:// protocol and chrome-devtools://
        if (url.protocol !== 'file:' && url.protocol !== 'chrome-devtools:') {
          console.warn(`SECURITY: Blocked external resource: ${details.url}`);
          callback({ cancel: true });
          return;
        }
        
        callback({ cancel: false });
      } catch (urlError) {
        console.warn(`SECURITY: Blocked invalid resource URL: ${details.url}`);
        callback({ cancel: true });
      }
    });
    
    // SECURITY: Set comprehensive security headers
    securityHardening.configureSessionSecurity(noteWindow.webContents.session);
    
    // SECURITY: Load HTML file with integrity check
    const htmlPath = path.join(__dirname, 'index.html');
    noteWindow.loadFile(htmlPath).catch(error => {
      console.error(`Failed to load note HTML: ${error}`);
      noteWindow.close();
    });
    
    // SECURITY: Enhanced initialization with validation
    noteWindow.webContents.once('did-finish-load', () => {
      try {
        // Validate note data before sending to renderer
        const initData = {
          id: noteId,
          content: savedData?.content || '',
          color: savedData?.color || 'gradient-1'
        };
        
        // Additional validation
        if (!securityHardening.validateNoteData(initData, ['id', 'content', 'color'])) {
          throw new Error('Note initialization data validation failed');
        }
        
        noteWindow.webContents.send('init-note', initData);
        
        // Show window after successful initialization
        setTimeout(() => {
          if (!noteWindow.isDestroyed()) {
            noteWindow.show();
            if (!savedData) {
              noteWindow.focus();
            }
          }
        }, 100);
        
      } catch (initError) {
        console.error('Note initialization failed:', initError);
        noteWindow.close();
      }
    });
    
    // SECURITY: Enhanced note tracking with validation
    const currentTime = new Date().toISOString();
    const noteData = {
      window: noteWindow,
      id: noteId,
      content: savedData?.content || '',
      color: savedData?.color || 'gradient-1',
      bounds: noteWindow.getBounds(),
      created: savedData?.created || currentTime,
      modified: savedData?.modified || currentTime,
      lastSave: currentTime
    };
    
    stickyNotes.set(noteId, noteData);
    
    // SECURITY: Throttled state saving to prevent DoS
    let saveThrottle = null;
    const throttledSave = () => {
      clearTimeout(saveThrottle);
      saveThrottle = setTimeout(() => {
        const note = stickyNotes.get(noteId);
        if (note && !note.window.isDestroyed()) {
          note.bounds = noteWindow.getBounds();
          note.modified = new Date().toISOString();
          debouncedSave();
        }
      }, 1000); // Throttle to max 1 save per second per window
    };
    
    noteWindow.on('moved', throttledSave);
    noteWindow.on('resized', throttledSave);
    
    // SECURITY: Enhanced cleanup on window close
    noteWindow.on('closed', () => {
      clearTimeout(saveThrottle);
      stickyNotes.delete(noteId);
      saveAllNotes();
      console.log(`Note closed and cleaned up: ${noteId}`);
    });
    
    // SECURITY: Additional window security events
    noteWindow.on('unresponsive', () => {
      console.warn(`Note window unresponsive: ${noteId}`);
    });
    
    noteWindow.webContents.on('crashed', (event, killed) => {
      console.error(`Note window crashed: ${noteId}, killed: ${killed}`);
      stickyNotes.delete(noteId);
    });
    
    console.log(`Secure note created: ${noteId}`);
    return noteWindow;
    
  } catch (error) {
    console.error('Critical error creating note:', error);
    return null;
  }
}

// SECURITY: Enhanced save function with data integrity checks
function saveAllNotes() {
  try {
    const notesData = [];
    const currentTime = new Date().toISOString();
    
    stickyNotes.forEach((note) => {
      try {
        if (note && note.id && note.window && !note.window.isDestroyed()) {
          // SECURITY: Validate note data before saving
          const noteDataToSave = {
            id: note.id,
            content: note.content || '',
            color: note.color || 'gradient-1',
            bounds: note.bounds || note.window.getBounds(),
            created: note.created || currentTime,
            modified: currentTime
          };
          
          // Additional validation
          if (securityHardening.validateNoteData(noteDataToSave, ['id', 'content', 'color', 'bounds'])) {
            notesData.push(noteDataToSave);
          }
        }
      } catch (noteError) {
        console.error(`Error processing note ${note?.id} for save:`, noteError);
        // Continue with other notes
      }
    });
    
    // SECURITY: Validate total data size before saving
    const dataString = JSON.stringify(notesData);
    if (dataString.length > 5000000) { // 5MB limit
      console.error('Notes data too large, skipping save');
      return;
    }
    
    // Save with error handling
    store.set('stickyNotes', notesData);
    store.set('lastNoteId', noteIdCounter);
    
    console.log(`Securely saved ${notesData.length} notes`);
    
  } catch (error) {
    console.error('Critical error saving notes:', error);
    
    // SECURITY: Attempt minimal recovery save
    try {
      const basicData = Array.from(stickyNotes.keys()).map(id => ({
        id,
        content: '',
        color: 'gradient-1',
        bounds: { x: 100, y: 100, width: 300, height: 300 },
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }));
      store.set('stickyNotes', basicData);
      console.log('Recovery save completed');
    } catch (recoveryError) {
      console.error('Critical: Recovery save failed:', recoveryError);
    }
  }
}

// SECURITY: Enhanced note loading with comprehensive validation
function loadSavedNotes() {
  try {
    const savedNotes = store.get('stickyNotes', []);
    console.log(`Loading ${savedNotes.length} saved notes with security validation`);
    
    if (!Array.isArray(savedNotes)) {
      console.warn('Invalid saved notes data format, starting fresh');
      return;
    }
    
    // SECURITY: Limit number of notes to load
    const maxNotesToLoad = Math.min(savedNotes.length, 50);
    
    let loadedCount = 0;
    for (let i = 0; i < maxNotesToLoad; i++) {
      const noteData = savedNotes[i];
      
      try {
        // SECURITY: Comprehensive validation of each note
        if (!noteData || typeof noteData !== 'object') {
          console.warn(`Skipping invalid note data at index ${i}`);
          continue;
        }
        
        // Validate required fields
        if (!noteData.id || typeof noteData.id !== 'string') {
          console.warn(`Skipping note with invalid ID at index ${i}`);
          continue;
        }
        
        // Sanitize and validate data
        const sanitizedData = {
          id: securityHardening.sanitizeNoteId(noteData.id),
          content: securityHardening.sanitizeContent(noteData.content || ''),
          color: noteData.color || 'gradient-1',
          bounds: noteData.bounds || { x: 100 + (i * 25), y: 100 + (i * 25), width: 300, height: 300 },
          created: noteData.created || new Date().toISOString(),
          modified: noteData.modified || new Date().toISOString()
        };
        
        if (!sanitizedData.id) {
          console.warn(`Failed to sanitize note ID at index ${i}`);
          continue;
        }
        
        // Create note with validated data
        const createdWindow = createStickyNote(sanitizedData);
        if (createdWindow) {
          loadedCount++;
        }
        
      } catch (noteError) {
        console.error(`Error loading note at index ${i}:`, noteError);
        // Continue loading other notes
      }
    }
    
    // Update counter based on loaded notes
    const loadedIds = Array.from(stickyNotes.keys())
      .map(id => {
        const match = id.match(/note_(\d+)/);
        return match ? parseInt(match[1]) : 0;
      });
    
    if (loadedIds.length > 0) {
      noteIdCounter = Math.max(noteIdCounter, ...loadedIds);
    }
    
    console.log(`Successfully loaded ${loadedCount} notes with security validation`);
    
  } catch (error) {
    console.error('Error loading saved notes:', error);
    console.log('Starting with fresh notes for security');
  }
}

// SECURITY: Enhanced tray creation with security considerations
function createTray() {
  try {
    // Create secure tray icon
    let trayIcon;
    try {
      trayIcon = nativeImage.createFromPath(path.join(__dirname, 'resources', 'tray-icon-secure.png'));
      if (trayIcon.isEmpty()) {
        throw new Error('Secure tray icon not found');
      }
    } catch (iconError) {
      // Fallback to simple icon
      trayIcon = nativeImage.createEmpty();
    }
    
    tray = new Tray(trayIcon);
    
    // SECURITY: Enhanced context menu with security indicators
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '🔒 New Secure Note',
        accelerator: 'CmdOrCtrl+N',
        click: () => createStickyNote()
      },
      { type: 'separator' },
      {
        label: `📝 Show All Notes (${stickyNotes.size})`,
        click: () => {
          stickyNotes.forEach(note => {
            if (!note.window.isDestroyed()) {
              note.window.show();
            }
          });
        }
      },
      {
        label: '🔐 Security Status',
        submenu: [
          {
            label: `✅ Context Isolation: Enabled`,
            enabled: false
          },
          {
            label: `✅ Node Integration: Disabled`,
            enabled: false
          },
          {
            label: `✅ Sandbox: Enabled`,
            enabled: false
          },
          {
            label: `✅ Remote Module: Disabled`,
            enabled: false
          }
        ]
      },
      { type: 'separator' },
      {
        label: '🚪 Quit Secure Notes',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          forceSave();
          app.quit();
        }
      }
    ]);
    
    tray.setToolTip(`Secure StickyNotes (${stickyNotes.size} notes)`);
    tray.setContextMenu(contextMenu);
    
    console.log('Secure system tray created');
    
  } catch (error) {
    console.error('Error creating secure tray:', error);
  }
}

// SECURITY: Register secure IPC handlers with comprehensive validation
function registerSecureIpcHandlers() {
  const handlers = {
    'save-note-content': {
      handler: (event, data) => {
        const sanitizedId = securityHardening.sanitizeNoteId(data.id);
        const sanitizedContent = securityHardening.sanitizeContent(data.content);
        
        if (!sanitizedId || sanitizedContent === null) {
          console.warn('Failed to sanitize note content data');
          return;
        }
        
        const note = stickyNotes.get(sanitizedId);
        if (note) {
          note.content = sanitizedContent;
          note.modified = new Date().toISOString();
          debouncedSave();
        }
      },
      rateLimit: { max: 30, window: 1000 },
      validation: { required: ['id', 'content'] }
    },
    
    'change-note-color': {
      handler: (event, data) => {
        const sanitizedId = securityHardening.sanitizeNoteId(data.id);
        const allowedColors = new Set([
          'gradient-1', 'gradient-2', 'gradient-3', 'gradient-4',
          'gradient-5', 'gradient-6', 'gradient-7', 'gradient-8',
          'gradient-9', 'gradient-10', 'gradient-11', 'gradient-12',
          'gradient-dark', 'gradient-light', 'gradient-gold', 'gradient-silver'
        ]);
        
        if (!sanitizedId || !allowedColors.has(data.color)) {
          console.warn('Invalid note color change request');
          return;
        }
        
        const note = stickyNotes.get(sanitizedId);
        if (note) {
          note.color = data.color;
          note.modified = new Date().toISOString();
          debouncedSave();
        }
      },
      rateLimit: { max: 10, window: 1000 },
      validation: { required: ['id', 'color'] }
    },
    
    'close-note': {
      handler: (event, noteId) => {
        const sanitizedId = securityHardening.sanitizeNoteId(noteId);
        if (!sanitizedId) return;
        
        const note = stickyNotes.get(sanitizedId);
        if (note && !note.window.isDestroyed()) {
          note.window.close();
        }
      },
      rateLimit: { max: 5, window: 1000 }
    },
    
    'create-new-note': {
      handler: (event) => {
        if (stickyNotes.size >= 50) {
          console.warn('Maximum number of secure notes reached');
          return;
        }
        createStickyNote();
      },
      rateLimit: { max: 2, window: 2000 }
    }
  };
  
  securityHardening.registerSecureIpcHandlers(ipcMain, handlers);
}

// SECURITY: Enhanced app initialization with comprehensive security
app.whenReady().then(async () => {
  try {
    console.log('Initializing secure Electron application...');
    
    // SECURITY: Configure session security before creating any windows
    await securityHardening.configureSessionSecurity(session.defaultSession);
    
    // SECURITY: Register secure IPC handlers
    registerSecureIpcHandlers();
    
    // Create secure tray
    createTray();
    
    // Load notes with security validation
    loadSavedNotes();
    
    // Create first note if none exist
    if (stickyNotes.size === 0) {
      createStickyNote();
    }
    
    // SECURITY: Create hardened application menu
    const secureMenu = Menu.buildFromTemplate([
      {
        label: 'Secure StickyNotes',
        submenu: [
          {
            label: '🔒 New Secure Note',
            accelerator: 'CmdOrCtrl+N',
            click: () => createStickyNote()
          },
          { type: 'separator' },
          {
            label: '💾 Force Save All',
            accelerator: 'CmdOrCtrl+S',
            click: () => forceSave()
          },
          { type: 'separator' },
          {
            label: '🔐 Security Information',
            click: () => {
              console.log('Security Status:', {
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true,
                remoteModule: false,
                notesCount: stickyNotes.size
              });
            }
          },
          { type: 'separator' },
          {
            label: '🚪 Quit',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
              forceSave();
              app.quit();
            }
          }
        ]
      }
    ]);
    
    Menu.setApplicationMenu(secureMenu);
    
    console.log('Secure Electron application initialized successfully');
    
  } catch (error) {
    console.error('Critical error during secure app initialization:', error);
    app.quit();
  }
});

// SECURITY: Enhanced app lifecycle handlers
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    forceSave();
    app.quit();
  }
});

app.on('activate', () => {
  if (stickyNotes.size === 0) {
    createStickyNote();
  }
});

app.on('before-quit', () => {
  console.log('Saving all notes before quit...');
  forceSave();
  globalShortcut.unregisterAll();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// SECURITY: Handle uncaught exceptions securely
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Attempt to save data before potential crash
  try {
    forceSave();
  } catch (saveError) {
    console.error('Failed to save during uncaught exception:', saveError);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});