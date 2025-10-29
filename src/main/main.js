const { app, BrowserWindow, ipcMain, screen, Menu, Tray, nativeImage, globalShortcut } = require('electron');
const Store = require('electron-store');
const path = require('path');
const { SecureIpcHandlers } = require('../security/secureIpcHandlers');

// Initialize store for persistent data with better error handling
const store = new Store({
  name: 'stickynotes-data',
  defaults: {
    stickyNotes: [],
    settings: {
      autoSave: true,
      saveInterval: 500,
      maxNotes: 50
    },
    lastNoteId: 0
  },
  // Enable encryption for sensitive data
  encryptionKey: 'stickynotes-encryption-key',
  // Schema validation
  schema: {
    stickyNotes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: { type: 'string' },
          color: { type: 'string' },
          bounds: {
            type: 'object',
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
              width: { type: 'number' },
              height: { type: 'number' }
            },
            required: ['x', 'y', 'width', 'height']
          },
          created: { type: 'string' },
          modified: { type: 'string' }
        },
        required: ['id', 'content', 'color', 'bounds']
      }
    },
    settings: {
      type: 'object',
      properties: {
        autoSave: { type: 'boolean' },
        saveInterval: { type: 'number' },
        maxNotes: { type: 'number' }
      }
    },
    lastNoteId: { type: 'number' }
  }
});

// Store for all sticky notes with enhanced tracking
let stickyNotes = new Map();
let tray = null;
let noteIdCounter = store.get('lastNoteId', 0);

// Auto-save functionality with debouncing
let saveTimeout = null;
function debouncedSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      saveAllNotes();
    } catch (error) {
      console.error('Error during debounced save:', error);
    }
  }, store.get('settings.saveInterval', 500));
}

// Force immediate save
function forceSave() {
  clearTimeout(saveTimeout);
  saveAllNotes();
}

// Default note configuration with security hardening
const DEFAULT_NOTE = {
  width: 300,
  height: 300,
  backgroundColor: '#2a2a2a',
  alwaysOnTop: true,
  frame: false,
  resizable: true,
  movable: true,
  minimizable: false,
  maximizable: false,
   skipTaskbar: true,
   hasShadow: true,
   transparent: false,
   webPreferences: {
    // SECURITY: Context isolation enforcement
    contextIsolation: true,
    
    // SECURITY: Node integration restrictions
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    nodeIntegrationInSubFrames: false,
    
    // SECURITY: Sandbox enforcement
    sandbox: true,
    
    // SECURITY: Disable web security for local files but maintain other protections
    webSecurity: true,
    
    // SECURITY: Disable remote module access
    enableRemoteModule: false,
    
    // SECURITY: Restrict auxiliary content
    allowRunningInsecureContent: false,
    
    // SECURITY: Disable experimental features that could be exploited
    experimentalFeatures: false,
    
    // SECURITY: Enable additional security features
    safeDialogs: true,
    safeDialogsMessage: 'This app is trying to display a dialog',
    
    // SECURITY: Disable navigation to external URLs
    navigateOnDragDrop: false,
    
    // SECURITY: Strict preload script
    preload: path.join(__dirname, '../preload/preload.js'),
    
    // SECURITY: Additional protections
    additionalArguments: [
      '--disable-web-security=false',
      '--disable-features=VizDisplayCompositor'
    ]
  }
};

// Create a new sticky note with enhanced window management
function createStickyNote(savedData = null) {
  try {
    // Check note limit
    if (stickyNotes.size >= store.get('settings.maxNotes', 50)) {
      console.warn('Maximum number of notes reached');
      return null;
    }
    
    const noteId = savedData?.id || `note_${++noteIdCounter}`;
    
    // Prevent duplicate notes
    if (stickyNotes.has(noteId)) {
      console.warn(`Note with ID ${noteId} already exists`);
      return stickyNotes.get(noteId).window;
    }
    
    // Get screen dimensions for positioning
    const display = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;
    
    // Smart positioning: cascade new notes, respect screen boundaries
    let defaultX, defaultY;
    if (savedData?.bounds?.x !== undefined && savedData?.bounds?.y !== undefined) {
      defaultX = Math.max(0, Math.min(savedData.bounds.x, screenWidth - DEFAULT_NOTE.width));
      defaultY = Math.max(0, Math.min(savedData.bounds.y, screenHeight - DEFAULT_NOTE.height));
    } else {
      // Cascade new notes
      const offset = (stickyNotes.size % 10) * 30;
      defaultX = Math.min(100 + offset, screenWidth - DEFAULT_NOTE.width);
      defaultY = Math.min(100 + offset, screenHeight - DEFAULT_NOTE.height);
    }
    
    const noteWindow = new BrowserWindow({
      ...DEFAULT_NOTE,
      x: defaultX,
      y: defaultY,
      width: savedData?.bounds?.width || DEFAULT_NOTE.width,
      height: savedData?.bounds?.height || DEFAULT_NOTE.height,
       titleBarStyle: 'customButtonsOnHover',
       // Enhanced window properties
       show: false, // Don't show until ready
       focusable: true,
       title: `Sticky Note - ${noteId}`,
       autoHideMenuBar: true
    });
    
    // SECURITY: Add content security policy and navigation restrictions
    noteWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      // SECURITY: Block all external navigation
      const parsedUrl = new URL(navigationUrl);
      if (parsedUrl.origin !== `file://`) {
        console.warn(`Blocked navigation to: ${navigationUrl}`);
        event.preventDefault();
      }
    });
    
    noteWindow.webContents.on('new-window', (event, navigationUrl) => {
      // SECURITY: Block all new window creation
      console.warn(`Blocked new window creation to: ${navigationUrl}`);
      event.preventDefault();
    });
    
    noteWindow.webContents.on('will-attach-webview', (event, webPreferences, params) => {
      // SECURITY: Block webview attachments
      console.warn(`Blocked webview attachment`);
      event.preventDefault();
    });
    
    // SECURITY: Set Content Security Policy
    noteWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: blob:; " +
            "font-src 'self'; " +
            "connect-src 'none'; " +
            "frame-src 'none'; " +
            "object-src 'none'; " +
            "media-src 'none';"
          ]
        }
      });
    });
    
    // Load the HTML for the sticky note
    noteWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    
    // Enhanced initialization with error handling
    noteWindow.webContents.on('did-finish-load', () => {
      noteWindow.webContents.send('init-note', {
        id: noteId,
        content: savedData?.content || '',
        color: savedData?.color || 'gradient-1'
      });
      
      // Show window after initialization
      noteWindow.show();
      if (!savedData) {
        noteWindow.focus();
      }
    });
    
    // Store the window reference with enhanced tracking
    const currentTime = new Date().toISOString();
    stickyNotes.set(noteId, {
      window: noteWindow,
      id: noteId,
      content: savedData?.content || '',
      color: savedData?.color || 'gradient-1',
      bounds: noteWindow.getBounds(),
      created: savedData?.created || currentTime,
      modified: savedData?.modified || currentTime
    });
    
    // Enhanced state saving with debouncing
    const saveState = () => {
      const note = stickyNotes.get(noteId);
      if (note && !note.window.isDestroyed()) {
        note.bounds = noteWindow.getBounds();
        note.modified = new Date().toISOString();
        debouncedSave();
      }
    };
    
    noteWindow.on('moved', saveState);
    noteWindow.on('resized', saveState);
    
    // Handle window close with cleanup
    noteWindow.on('closed', () => {
      stickyNotes.delete(noteId);
      saveAllNotes();
    });
    
    // Handle window ready-to-show
    noteWindow.once('ready-to-show', () => {
      if (!savedData) {
        noteWindow.show();
        noteWindow.focus();
      } else {
        noteWindow.show();
      }
    });
    
    console.log(`Created sticky note: ${noteId}`);
    return noteWindow;
    
  } catch (error) {
    console.error('Error creating sticky note:', error);
    return null;
  }
}

// Save all notes to persistent storage with enhanced data integrity
function saveAllNotes() {
  try {
    const notesData = [];
    const currentTime = new Date().toISOString();
    
    stickyNotes.forEach((note) => {
      // Ensure data integrity
      if (note && note.id && note.window && !note.window.isDestroyed()) {
        notesData.push({
          id: note.id,
          content: note.content || '',
          color: note.color || 'gradient-1',
          bounds: note.bounds || note.window.getBounds(),
          created: note.created || currentTime,
          modified: currentTime
        });
      }
    });
    
    // Save notes data
    store.set('stickyNotes', notesData);
    
    // Update last note ID counter
    store.set('lastNoteId', noteIdCounter);
    
    console.log(`Saved ${notesData.length} notes to persistent storage`);
  } catch (error) {
    console.error('Error saving notes:', error);
    // Fallback: try to save minimal data
    try {
      const basicData = Array.from(stickyNotes.keys()).map(id => ({
        id,
        content: stickyNotes.get(id)?.content || '',
        color: stickyNotes.get(id)?.color || 'gradient-1',
        bounds: { x: 100, y: 100, width: 300, height: 300 }
      }));
      store.set('stickyNotes', basicData);
    } catch (fallbackError) {
      console.error('Critical error: Could not save notes data:', fallbackError);
    }
  }
}

// Load saved notes with error recovery
function loadSavedNotes() {
  try {
    const savedNotes = store.get('stickyNotes', []);
    console.log(`Loading ${savedNotes.length} saved notes`);
    
    if (!Array.isArray(savedNotes)) {
      console.warn('Invalid saved notes data, starting fresh');
      return;
    }
    
    savedNotes.forEach((noteData, index) => {
      try {
        // Validate note data before creating
        if (noteData && typeof noteData === 'object' && noteData.id) {
          // Ensure bounds are valid
          if (!noteData.bounds || typeof noteData.bounds !== 'object') {
            noteData.bounds = { x: 100 + (index * 20), y: 100 + (index * 20), width: 300, height: 300 };
          }
          
          // Ensure required properties exist
          noteData.content = noteData.content || '';
          noteData.color = noteData.color || 'gradient-1';
          noteData.created = noteData.created || new Date().toISOString();
          
          createStickyNote(noteData);
        } else {
          console.warn(`Skipping invalid note data at index ${index}:`, noteData);
        }
      } catch (noteError) {
        console.error(`Error loading note at index ${index}:`, noteError);
        // Continue loading other notes
      }
    });
    
    // Update counter to prevent ID conflicts
    const maxId = savedNotes
      .filter(note => note && note.id)
      .map(note => {
        const match = note.id.match(/note_(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .reduce((max, id) => Math.max(max, id), 0);
    
    noteIdCounter = Math.max(noteIdCounter, maxId);
    
  } catch (error) {
    console.error('Error loading saved notes:', error);
    console.log('Starting with fresh notes');
  }
}

// Create system tray with enhanced functionality
function createTray() {
  try {
    // Create a proper tray icon - use a simple 16x16 PNG icon
    let trayIcon;
    try {
      // Try to load custom icon first
      trayIcon = nativeImage.createFromPath(path.join(__dirname, 'resources', 'tray-icon.png'));
      if (trayIcon.isEmpty()) {
        throw new Error('Custom icon not found');
      }
    } catch (iconError) {
      // Fallback: create a simple SVG-based icon
      const iconData = `
        <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
          <rect width="16" height="16" rx="3" fill="#667eea"/>
          <text x="8" y="12" text-anchor="middle" fill="white" font-size="10" font-family="Arial">N</text>
        </svg>
      `;
      trayIcon = nativeImage.createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(iconData).toString('base64')}`);
      
      // If SVG fails, use template icon
      if (trayIcon.isEmpty()) {
        trayIcon = nativeImage.createFromNamedImage('NSActionTemplate', [16, 16]);
      }
      
      // Final fallback: create from path template
      if (trayIcon.isEmpty()) {
        trayIcon = nativeImage.createFromPath('/System/Library/CoreServices/Menu Extras/TextInput.menu/Contents/Resources/TextInput.icns');
        if (trayIcon.isEmpty()) {
          console.warn('All tray icon methods failed, using empty icon');
          trayIcon = nativeImage.createEmpty();
        }
      }
    }
    
    tray = new Tray(trayIcon);
    
    // Enhanced context menu with keyboard shortcuts
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'New Sticky Note',
        accelerator: 'CmdOrCtrl+N',
        click: () => createStickyNote()
      },
      { type: 'separator' },
      {
        label: `Show All Notes (${stickyNotes.size})`,
        click: () => {
          let visibleCount = 0;
          stickyNotes.forEach(note => {
            if (!note.window.isDestroyed()) {
              note.window.show();
              if (visibleCount === 0) {
                note.window.focus();
              }
              visibleCount++;
            }
          });
          if (visibleCount === 0) {
            createStickyNote();
          }
        }
      },
      {
        label: 'Hide All Notes',
        click: () => {
          stickyNotes.forEach(note => {
            if (!note.window.isDestroyed()) {
              note.window.hide();
            }
          });
        }
      },
      {
        label: 'Focus Next Note',
        accelerator: 'CmdOrCtrl+Tab',
        click: () => {
          const notes = Array.from(stickyNotes.values()).filter(note => !note.window.isDestroyed());
          if (notes.length > 0) {
            const randomNote = notes[Math.floor(Math.random() * notes.length)];
            randomNote.window.show();
            randomNote.window.focus();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Settings',
        submenu: [
          {
            label: 'Auto-save',
            type: 'checkbox',
            checked: store.get('settings.autoSave', true),
            click: (menuItem) => {
              store.set('settings.autoSave', menuItem.checked);
            }
          },
          {
            label: 'Always on Top',
            type: 'checkbox',
            checked: true,
            click: (menuItem) => {
              stickyNotes.forEach(note => {
                if (!note.window.isDestroyed()) {
                  note.window.setAlwaysOnTop(menuItem.checked);
                }
              });
            }
          }
        ]
      },
      { type: 'separator' },
      {
        label: 'Clear All Notes',
        click: () => {
          const noteCount = stickyNotes.size;
          stickyNotes.forEach(note => {
            if (!note.window.isDestroyed()) {
              note.window.close();
            }
          });
          stickyNotes.clear();
          saveAllNotes();
          console.log(`Cleared ${noteCount} notes`);
        }
      },
      { type: 'separator' },
      {
        label: 'Quit StickyNotes',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          // Save all notes before quitting
          saveAllNotes();
          app.quit();
        }
      }
    ]);
    
    tray.setToolTip(`StickyNotes (${stickyNotes.size} notes)`);
    tray.setContextMenu(contextMenu);
    
    // Handle tray click events
    tray.on('click', () => {
      if (stickyNotes.size === 0) {
        createStickyNote();
      } else {
        // Toggle visibility of all notes
        const visibleNotes = Array.from(stickyNotes.values()).filter(note => 
          !note.window.isDestroyed() && note.window.isVisible()
        );
        
        if (visibleNotes.length === 0) {
          // Show all notes
          stickyNotes.forEach(note => {
            if (!note.window.isDestroyed()) {
              note.window.show();
            }
          });
        } else {
          // Hide all notes
          stickyNotes.forEach(note => {
            if (!note.window.isDestroyed()) {
              note.window.hide();
            }
          });
        }
      }
    });
    
    // Update tray tooltip periodically
    setInterval(() => {
      if (tray && !tray.isDestroyed()) {
        tray.setToolTip(`StickyNotes (${stickyNotes.size} notes)`);
      }
    }, 5000);
    
    console.log('System tray created successfully');
  } catch (error) {
    console.error('Error creating system tray:', error);
  }
}

// Register global keyboard shortcuts
function registerGlobalShortcuts() {
  try {
    // Global shortcut to create new note
    globalShortcut.register('CommandOrControl+Shift+N', () => {
      createStickyNote();
    });
    
    // Global shortcut to show/hide all notes
    globalShortcut.register('CommandOrControl+Shift+H', () => {
      const visibleNotes = Array.from(stickyNotes.values()).filter(note => 
        !note.window.isDestroyed() && note.window.isVisible()
      );
      
      if (visibleNotes.length === 0) {
        stickyNotes.forEach(note => {
          if (!note.window.isDestroyed()) {
            note.window.show();
          }
        });
      } else {
        stickyNotes.forEach(note => {
          if (!note.window.isDestroyed()) {
            note.window.hide();
          }
        });
      }
    });
    
    // Global shortcut to focus next note
    globalShortcut.register('CommandOrControl+Shift+Tab', () => {
      const notes = Array.from(stickyNotes.values()).filter(note => !note.window.isDestroyed());
      if (notes.length > 0) {
        const randomNote = notes[Math.floor(Math.random() * notes.length)];
        randomNote.window.show();
        randomNote.window.focus();
      }
    });
    
    // Global shortcut to save all notes
    globalShortcut.register('CommandOrControl+Alt+S', () => {
      forceSave();
    });
    
    console.log('Global keyboard shortcuts registered');
  } catch (error) {
    console.error('Error registering global shortcuts:', error);
  }
}

// App event handlers
app.whenReady().then(async () => {
  // Create tray icon
  createTray();
  
  // Register global shortcuts
  registerGlobalShortcuts();
  
  // Load saved notes or create a new one
  loadSavedNotes();
  if (stickyNotes.size === 0) {
    createStickyNote();
  }
  
  // Create enhanced app menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'StickyNotes',
      submenu: [
        {
          label: 'New Note',
          accelerator: 'CmdOrCtrl+N',
          click: () => createStickyNote()
        },
        {
          label: 'New Note (Global)',
          accelerator: 'CmdOrCtrl+Shift+N',
          enabled: false // Show shortcut but disabled since it's global
        },
        { type: 'separator' },
        {
          label: 'Show All Notes',
          click: () => {
            stickyNotes.forEach(note => {
              if (!note.window.isDestroyed()) {
                note.window.show();
              }
            });
          }
        },
        {
          label: 'Hide All Notes',
          click: () => {
            stickyNotes.forEach(note => {
              if (!note.window.isDestroyed()) {
                note.window.hide();
              }
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Save All Notes',
          accelerator: 'CmdOrCtrl+S',
          click: () => forceSave()
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          click: () => {
            // TODO: Create preferences window
            console.log('Preferences window not implemented yet');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            forceSave();
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Always on Top',
          type: 'checkbox',
          checked: true,
          click: (menuItem) => {
            stickyNotes.forEach(note => {
              if (!note.window.isDestroyed()) {
                note.window.setAlwaysOnTop(menuItem.checked);
              }
            });
          }
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' }
      ]
    }
  ]);
  
  Menu.setApplicationMenu(menu);

  // Initialize secure IPC handlers
const { SecureIpcHandlers } = require('../security/secureIpcHandlers');
  const secureHandlers = new SecureIpcHandlers(stickyNotes, saveAllNotes, screen);
  secureHandlers.registerHandlers(ipcMain, createStickyNote);
  
  // Initialize authentication and authorization systems
  const { AuthenticationManager } = require('../security/authenticationManager');
  const { AuthorizationManager } = require('../security/authorizationManager');
  const { SessionManager } = require('../security/sessionManager');
  const { AuthIpcHandlers } = require('../security/authIpcHandlers');
  
  const authManager = new AuthenticationManager();
  const authzManager = new AuthorizationManager(authManager);
  const sessionManager = new SessionManager();
  const authIpcHandlers = new AuthIpcHandlers();
  
  // Initialize default admin user if needed
  await authzManager.initializeDefaultAdmin();
  
  // Make managers available globally for IPC handlers
  global.authManager = authManager;
  global.authzManager = authzManager;
  global.sessionManager = sessionManager;
  
  // Register authentication IPC handlers
  authIpcHandlers.registerHandlers(ipcMain);
  
  console.log('🔐 Security systems initialized successfully');
});

// Prevent app from quitting when all windows are closed (macOS behavior)
app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create a window when the dock icon is clicked
  if (stickyNotes.size === 0) {
    createStickyNote();
  }
});

// Note: All IPC handlers and security validations have been moved to SecureIpcHandlers class
// for better organization and comprehensive security validation

// App lifecycle event handlers
app.on("before-quit", () => {
  // Save all notes before quitting
  forceSave();
  // Unregister all global shortcuts
  globalShortcut.unregisterAll();
});

app.on("will-quit", () => {
  // Final cleanup
  globalShortcut.unregisterAll();
});
