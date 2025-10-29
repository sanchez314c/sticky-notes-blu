const { app, BrowserWindow, ipcMain, screen, Menu, Tray, nativeImage, globalShortcut } = require('electron');
const Store = require('electron-store');
const path = require('path');
const { SecureIpcHandlers } = require('../security/secureIpcHandlers');
const { validator } = require('../security/inputValidation');
const { WindowLifecycleManager } = require('./window-lifecycle-manager');

// Initialize store for persistent data with enhanced error handling
const store = new Store({
  name: 'stickynotes-data',
  defaults: {
    stickyNotes: [],
    settings: {
      autoSave: true,
      saveInterval: 500,
      maxNotes: 50,
      alwaysOnTop: true
    },
    lastNoteId: 0
  },
  encryptionKey: 'stickynotes-encryption-key',
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
        maxNotes: { type: 'number' },
        alwaysOnTop: { type: 'boolean' }
      }
    },
    lastNoteId: { type: 'number' }
  }
});

// Enhanced application state management
class StickyNotesApp {
  constructor() {
    this.windowManager = null;
    this.secureHandlers = null;
    this.tray = null;
    this.appMenu = null;
    this.isQuitting = false;
    this.saveTimeout = null;
    
    // Bind methods to preserve context
    this.handleAppReady = this.handleAppReady.bind(this);
    this.handleWindowAllClosed = this.handleWindowAllClosed.bind(this);
    this.handleActivate = this.handleActivate.bind(this);
    this.handleBeforeQuit = this.handleBeforeQuit.bind(this);
    
    this.init();
  }
  
  init() {
    console.log('Initializing StickyNotes application...');
    
    // Setup app event handlers
    app.whenReady().then(this.handleAppReady);
    app.on('window-all-closed', this.handleWindowAllClosed);
    app.on('activate', this.handleActivate);
    app.on('before-quit', this.handleBeforeQuit);
    app.on('will-quit', this.handleWillQuit.bind(this));
  }
  
  async handleAppReady() {
    try {
      console.log('App ready, initializing components...');
      
      // Initialize window lifecycle manager
      await this.initializeWindowManager();
      
      // Initialize secure IPC handlers
      this.initializeSecureHandlers();
      
      // Create system tray
      await this.createTray();
      
      // Create application menu
      this.createApplicationMenu();
      
      // Register global shortcuts
      this.registerGlobalShortcuts();
      
      // Load saved notes or create initial note
      await this.loadSavedNotes();
      
      console.log('StickyNotes application initialized successfully');
      
    } catch (error) {
      console.error('Error initializing application:', error);
      app.quit();
    }
  }
  
  async initializeWindowManager() {
    // Default window configuration with enhanced security
    const defaultConfig = {
      width: 300,
      height: 300,
      backgroundColor: '#2a2a2a',
      alwaysOnTop: store.get('settings.alwaysOnTop', true),
      frame: false,
      resizable: true,
      movable: true,
      minimizable: false,
      maximizable: false,
      skipTaskbar: true,
      hasShadow: true,
      transparent: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        nodeIntegrationInSubFrames: false,
        sandbox: true,
        webSecurity: true,
        enableRemoteModule: false,
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        safeDialogs: true,
        safeDialogsMessage: 'This app is trying to display a dialog',
        navigateOnDragDrop: false,
        preload: path.join(__dirname, 'preload-fixed.js'),
        additionalArguments: [
          '--disable-web-security=false',
          '--disable-features=VizDisplayCompositor'
        ]
      }
    };
    
    this.windowManager = new WindowLifecycleManager(store, defaultConfig);
    
    // Setup window manager event handlers
    this.setupWindowManagerHandlers();
    
    console.log('Window lifecycle manager initialized');
  }
  
  setupWindowManagerHandlers() {
    // Window creation events
    this.windowManager.on('windowCreated', (data) => {
      console.log(`Window created: ${data.id}`);
      this.updateTrayTooltip();
    });
    
    this.windowManager.on('windowClosed', (data) => {
      console.log(`Window closed: ${data.id}`);
      this.updateTrayTooltip();
      this.updateTrayContextMenu();
    });
    
    // Content update events
    this.windowManager.on('windowContentUpdated', (data) => {
      console.log(`Content updated for window: ${data.id}`);
    });
    
    this.windowManager.on('windowColorUpdated', (data) => {
      console.log(`Color updated for window: ${data.id}`);
    });
    
    // Error events
    this.windowManager.on('windowError', (data) => {
      console.error('Window error:', data);
    });
    
    this.windowManager.on('saveError', (data) => {
      console.error('Save error:', data);
    });
  }
  
  initializeSecureHandlers() {
    this.secureHandlers = new SecureIpcHandlers(
      this.windowManager.windows,
      () => this.windowManager.saveAllWindows(),
      screen
    );
    
    // Register IPC handlers with window manager integration
    this.secureHandlers.registerHandlers(ipcMain, (savedData) => {
      return this.windowManager.createWindow(savedData);
    });
    
    console.log('Secure IPC handlers initialized');
  }
  
  async createTray() {
    try {
      // Create tray icon
      let trayIcon;
      try {
        trayIcon = nativeImage.createFromPath(path.join(__dirname, 'resources', 'tray-icon.png'));
        if (trayIcon.isEmpty()) {
          throw new Error('Custom icon not found');
        }
      } catch (iconError) {
        // Fallback: create a simple programmatic icon
        trayIcon = nativeImage.createFromBuffer(
          Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x91, 0x68, 0x36
          ]), 
          { width: 16, height: 16 }
        );
      }
      
      this.tray = new Tray(trayIcon);
      
      // Setup tray event handlers
      this.setupTrayHandlers();
      
      // Create initial context menu
      this.updateTrayContextMenu();
      
      // Set initial tooltip
      this.updateTrayTooltip();
      
      console.log('System tray created successfully');
    } catch (error) {
      console.error('Error creating system tray:', error);
    }
  }
  
  setupTrayHandlers() {
    if (!this.tray) return;
    
    // Handle tray click
    this.tray.on('click', () => {
      const windowCount = this.windowManager.getWindowCount();
      
      if (windowCount === 0) {
        this.windowManager.createWindow();
      } else {
        // Toggle visibility of all notes
        const allWindows = this.windowManager.getAllWindowsData();
        const visibleWindows = allWindows.filter(data => 
          !data.window.isDestroyed() && data.window.isVisible()
        );
        
        if (visibleWindows.length === 0) {
          this.windowManager.showAllWindows();
        } else {
          this.windowManager.hideAllWindows();
        }
      }
    });
    
    // Handle tray double-click
    this.tray.on('double-click', () => {
      this.windowManager.createWindow();
    });
  }
  
  updateTrayContextMenu() {
    if (!this.tray) return;
    
    const windowCount = this.windowManager.getWindowCount();
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'New Sticky Note',
        accelerator: 'CmdOrCtrl+N',
        click: () => this.windowManager.createWindow()
      },
      { type: 'separator' },
      {
        label: `Show All Notes (${windowCount})`,
        enabled: windowCount > 0,
        click: () => {
          const count = this.windowManager.showAllWindows();
          if (count === 0) {
            this.windowManager.createWindow();
          }
        }
      },
      {
        label: 'Hide All Notes',
        enabled: windowCount > 0,
        click: () => this.windowManager.hideAllWindows()
      },
      {
        label: 'Focus Next Note',
        accelerator: 'CmdOrCtrl+Tab',
        enabled: windowCount > 0,
        click: () => this.windowManager.focusNextWindow()
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
            checked: store.get('settings.alwaysOnTop', true),
            click: (menuItem) => {
              store.set('settings.alwaysOnTop', menuItem.checked);
              this.updateAlwaysOnTop(menuItem.checked);
            }
          },
          { type: 'separator' },
          {
            label: 'Max Notes',
            submenu: [
              {
                label: '25 Notes',
                type: 'radio',
                checked: store.get('settings.maxNotes', 50) === 25,
                click: () => store.set('settings.maxNotes', 25)
              },
              {
                label: '50 Notes',
                type: 'radio',
                checked: store.get('settings.maxNotes', 50) === 50,
                click: () => store.set('settings.maxNotes', 50)
              },
              {
                label: '100 Notes',
                type: 'radio',
                checked: store.get('settings.maxNotes', 50) === 100,
                click: () => store.set('settings.maxNotes', 100)
              }
            ]
          }
        ]
      },
      { type: 'separator' },
      {
        label: 'Clear All Notes',
        enabled: windowCount > 0,
        click: () => {
          const count = this.windowManager.closeAllWindows();
          console.log(`Cleared ${count} notes`);
        }
      },
      { type: 'separator' },
      {
        label: 'Quit StickyNotes',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          this.isQuitting = true;
          this.windowManager.saveAllWindows();
          app.quit();
        }
      }
    ]);
    
    this.tray.setContextMenu(contextMenu);
  }
  
  updateTrayTooltip() {
    if (!this.tray) return;
    
    const windowCount = this.windowManager.getWindowCount();
    this.tray.setToolTip(`StickyNotes (${windowCount} notes)`);
  }
  
  createApplicationMenu() {
    const template = [
      {
        label: 'StickyNotes',
        submenu: [
          {
            label: 'New Note',
            accelerator: 'CmdOrCtrl+N',
            click: () => this.windowManager.createWindow()
          },
          {
            label: 'New Note (Global)',
            accelerator: 'CmdOrCtrl+Shift+N',
            enabled: false
          },
          { type: 'separator' },
          {
            label: 'Show All Notes',
            click: () => this.windowManager.showAllWindows()
          },
          {
            label: 'Hide All Notes',
            click: () => this.windowManager.hideAllWindows()
          },
          { type: 'separator' },
          {
            label: 'Save All Notes',
            accelerator: 'CmdOrCtrl+S',
            click: () => this.windowManager.saveAllWindows()
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
              this.isQuitting = true;
              this.windowManager.saveAllWindows();
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
            checked: store.get('settings.alwaysOnTop', true),
            click: (menuItem) => {
              store.set('settings.alwaysOnTop', menuItem.checked);
              this.updateAlwaysOnTop(menuItem.checked);
            }
          },
          { type: 'separator' },
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          {
            label: 'Focus Next Note',
            accelerator: 'CmdOrCtrl+Tab',
            click: () => this.windowManager.focusNextWindow()
          },
          { type: 'separator' },
          { role: 'minimize' },
          { role: 'close' }
        ]
      }
    ];
    
    this.appMenu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(this.appMenu);
    
    console.log('Application menu created');
  }
  
  registerGlobalShortcuts() {
    try {
      // Global shortcut to create new note
      globalShortcut.register('CommandOrControl+Shift+N', () => {
        this.windowManager.createWindow();
      });
      
      // Global shortcut to show/hide all notes
      globalShortcut.register('CommandOrControl+Shift+H', () => {
        const allWindows = this.windowManager.getAllWindowsData();
        const visibleWindows = allWindows.filter(data => 
          !data.window.isDestroyed() && data.window.isVisible()
        );
        
        if (visibleWindows.length === 0) {
          this.windowManager.showAllWindows();
        } else {
          this.windowManager.hideAllWindows();
        }
      });
      
      // Global shortcut to focus next note
      globalShortcut.register('CommandOrControl+Shift+Tab', () => {
        this.windowManager.focusNextWindow();
      });
      
      // Global shortcut to save all notes
      globalShortcut.register('CommandOrControl+Alt+S', () => {
        this.windowManager.saveAllWindows();
      });
      
      console.log('Global keyboard shortcuts registered');
    } catch (error) {
      console.error('Error registering global shortcuts:', error);
    }
  }
  
  async loadSavedNotes() {
    try {
      const savedNotes = store.get('stickyNotes', []);
      console.log(`Loading ${savedNotes.length} saved notes`);
      
      if (!Array.isArray(savedNotes)) {
        console.warn('Invalid saved notes data, starting fresh');
        return;
      }
      
      // Load each note
      let loadedCount = 0;
      for (const noteData of savedNotes) {
        try {
          if (noteData && typeof noteData === 'object' && noteData.id) {
            // Ensure bounds are valid
            if (!noteData.bounds || typeof noteData.bounds !== 'object') {
              noteData.bounds = { 
                x: 100 + (loadedCount * 20), 
                y: 100 + (loadedCount * 20), 
                width: 300, 
                height: 300 
              };
            }
            
            // Ensure required properties exist
            noteData.content = noteData.content || '';
            noteData.color = noteData.color || 'gradient-1';
            noteData.created = noteData.created || new Date().toISOString();
            
            this.windowManager.createWindow(noteData);
            loadedCount++;
          } else {
            console.warn('Skipping invalid note data:', noteData);
          }
        } catch (noteError) {
          console.error('Error loading individual note:', noteError);
        }
      }
      
      // If no notes were loaded, create a new one
      if (loadedCount === 0) {
        this.windowManager.createWindow();
      }
      
      console.log(`Successfully loaded ${loadedCount} notes`);
      
    } catch (error) {
      console.error('Error loading saved notes:', error);
      // Create a new note as fallback
      this.windowManager.createWindow();
    }
  }
  
  updateAlwaysOnTop(alwaysOnTop) {
    const allWindows = this.windowManager.getAllWindowsData();
    allWindows.forEach(data => {
      if (!data.window.isDestroyed()) {
        data.window.setAlwaysOnTop(alwaysOnTop);
      }
    });
  }
  
  handleWindowAllClosed() {
    // On macOS, keep the app running even when all windows are closed
    if (process.platform !== 'darwin' && !this.isQuitting) {
      app.quit();
    }
  }
  
  handleActivate() {
    // On macOS, re-create a window when the dock icon is clicked
    if (this.windowManager && this.windowManager.getWindowCount() === 0) {
      this.windowManager.createWindow();
    }
  }
  
  handleBeforeQuit() {
    try {
      console.log('App is quitting, saving data...');
      this.isQuitting = true;
      
      // Save all notes
      if (this.windowManager) {
        this.windowManager.saveAllWindows();
      }
      
      // Unregister all global shortcuts
      globalShortcut.unregisterAll();
      
    } catch (error) {
      console.error('Error during app quit preparation:', error);
    }
  }
  
  handleWillQuit() {
    try {
      console.log('App will quit, final cleanup...');
      
      // Final cleanup
      globalShortcut.unregisterAll();
      
      // Destroy window manager
      if (this.windowManager) {
        this.windowManager.destroy();
      }
      
    } catch (error) {
      console.error('Error during app will quit:', error);
    }
  }
}

// Create and initialize the application
const stickyNotesApp = new StickyNotesApp();

// Handle critical errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  try {
    if (stickyNotesApp.windowManager) {
      stickyNotesApp.windowManager.saveAllWindows();
    }
  } catch (saveError) {
    console.error('Error saving during critical failure:', saveError);
  }
  app.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('StickyNotes main process initialized');