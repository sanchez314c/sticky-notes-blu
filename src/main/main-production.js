const { app, BrowserWindow, ipcMain, screen, Menu, Tray, nativeImage, globalShortcut, dialog, shell } = require('electron');
const Store = require('electron-store');
const path = require('path');
const fs = require('fs').promises;

// ================= CONFIGURATION =================

// Initialize secure store for persistent data
const store = new Store({
  name: 'stickynotes-data',
  defaults: {
    stickyNotes: [],
    settings: {
      autoSave: true,
      saveInterval: 500,
      maxNotes: 50,
      theme: 'dark',
      alwaysOnTop: true,
      startMinimized: false
    },
    lastNoteId: 0,
    windowPositions: [],
    userPreferences: {
      defaultColor: 'gradient-1',
      defaultSize: { width: 300, height: 300 },
      shortcuts: {
        newNote: 'CommandOrControl+Shift+N',
        hideAll: 'CommandOrControl+Shift+H',
        showAll: 'CommandOrControl+Shift+S',
        focusNext: 'CommandOrControl+Shift+Tab'
      }
    }
  },
  encryptionKey: 'stickynotes-secure-key-2024',
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
            }
          },
          created: { type: 'string' },
          modified: { type: 'string' },
          isPinned: { type: 'boolean' },
          fontSize: { type: 'number' }
        }
      }
    }
  }
});

// ================= STATE MANAGEMENT =================

let stickyNotes = new Map();
let tray = null;
let noteIdCounter = store.get('lastNoteId', 0);
let saveTimeout = null;
let isQuitting = false;
let visibilityState = 'visible';

// ================= HELPER FUNCTIONS =================

// Generate unique note ID
function generateNoteId() {
  noteIdCounter++;
  store.set('lastNoteId', noteIdCounter);
  return `note-${Date.now()}-${noteIdCounter}`;
}

// Debounced save function
function debouncedSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveAllNotes();
  }, store.get('settings.saveInterval', 500));
}

// Save all notes to persistent storage
async function saveAllNotes() {
  try {
    const notesToSave = [];
    stickyNotes.forEach((window, id) => {
      if (!window.isDestroyed()) {
        const bounds = window.getBounds();
        const noteData = window.noteData || {};
        notesToSave.push({
          id,
          content: noteData.content || '',
          color: noteData.color || 'gradient-1',
          bounds,
          created: noteData.created || new Date().toISOString(),
          modified: new Date().toISOString(),
          isPinned: noteData.isPinned || false,
          fontSize: noteData.fontSize || 14
        });
      }
    });
    store.set('stickyNotes', notesToSave);
    console.log(`Saved ${notesToSave.length} notes`);
  } catch (error) {
    console.error('Error saving notes:', error);
  }
}

// Load notes from storage
async function loadNotes() {
  try {
    const savedNotes = store.get('stickyNotes', []);
    console.log(`Loading ${savedNotes.length} saved notes`);
    
    for (const note of savedNotes) {
      await createStickyNote(note);
    }
  } catch (error) {
    console.error('Error loading notes:', error);
  }
}

// Get smart position for new notes
function getSmartPosition() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const defaultSize = store.get('userPreferences.defaultSize', { width: 300, height: 300 });
  
  // Calculate cascade position based on existing notes
  const offset = stickyNotes.size * 30;
  let x = 100 + offset;
  let y = 100 + offset;
  
  // Wrap around if going off screen
  if (x + defaultSize.width > screenWidth) {
    x = 100;
  }
  if (y + defaultSize.height > screenHeight) {
    y = 100;
  }
  
  return { x, y, ...defaultSize };
}

// ================= WINDOW CREATION =================

async function createStickyNote(existingNote = null) {
  try {
    // Check max notes limit
    if (stickyNotes.size >= store.get('settings.maxNotes', 50)) {
      dialog.showMessageBox({
        type: 'warning',
        title: 'Note Limit Reached',
        message: `Maximum number of notes (${store.get('settings.maxNotes')}) reached.`,
        buttons: ['OK']
      });
      return null;
    }

    const noteId = existingNote?.id || generateNoteId();
    const bounds = existingNote?.bounds || getSmartPosition();
    const color = existingNote?.color || store.get('userPreferences.defaultColor', 'gradient-1');
    
    // Create browser window with security hardening
    const noteWindow = new BrowserWindow({
      ...bounds,
      minWidth: 200,
      minHeight: 200,
      maxWidth: 800,
      maxHeight: 800,
      backgroundColor: '#2a2a2a',
      alwaysOnTop: store.get('settings.alwaysOnTop', true),
      frame: false,
      resizable: true,
      movable: true,
      minimizable: true,
      maximizable: false,
      skipTaskbar: false,
      hasShadow: true,
      transparent: true,
      titleBarStyle: 'customButtonsOnHover',
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        enableBlinkFeatures: '',
        webviewTag: false
      }
    });

    // Store note data
    noteWindow.noteData = {
      id: noteId,
      content: existingNote?.content || '',
      color: color,
      created: existingNote?.created || new Date().toISOString(),
      modified: existingNote?.modified || new Date().toISOString(),
      isPinned: existingNote?.isPinned || false,
      fontSize: existingNote?.fontSize || 14
    };

    // Load HTML
    await noteWindow.loadFile('index.html');
    
    // Send initial data to renderer
    noteWindow.webContents.send('init-note', noteWindow.noteData);
    
    // Store in map
    stickyNotes.set(noteId, noteWindow);
    
    // Window event handlers
    noteWindow.on('closed', () => {
      stickyNotes.delete(noteId);
      debouncedSave();
      updateTrayMenu();
    });

    noteWindow.on('moved', () => {
      debouncedSave();
    });

    noteWindow.on('resized', () => {
      debouncedSave();
    });

    noteWindow.on('focus', () => {
      noteWindow.webContents.send('window-focused');
    });

    noteWindow.on('blur', () => {
      noteWindow.webContents.send('window-blurred');
      debouncedSave();
    });

    // Update tray menu
    updateTrayMenu();
    
    console.log(`Created note: ${noteId}`);
    return noteWindow;
    
  } catch (error) {
    console.error('Error creating sticky note:', error);
    return null;
  }
}

// ================= IPC HANDLERS =================

function setupIpcHandlers() {
  // Save note content
  ipcMain.on('save-note-content', (event, noteId, content) => {
    const window = stickyNotes.get(noteId);
    if (window && !window.isDestroyed()) {
      window.noteData.content = content;
      window.noteData.modified = new Date().toISOString();
      debouncedSave();
    }
  });

  // Update note color
  ipcMain.on('update-note-color', (event, noteId, color) => {
    const window = stickyNotes.get(noteId);
    if (window && !window.isDestroyed()) {
      window.noteData.color = color;
      debouncedSave();
    }
  });

  // Create new note
  ipcMain.handle('create-new-note', async () => {
    const newNote = await createStickyNote();
    return newNote ? newNote.noteData.id : null;
  });

  // Close note
  ipcMain.on('close-note', (event, noteId) => {
    const window = stickyNotes.get(noteId);
    if (window && !window.isDestroyed()) {
      window.close();
    }
  });

  // Minimize note
  ipcMain.on('minimize-note', (event, noteId) => {
    const window = stickyNotes.get(noteId);
    if (window && !window.isDestroyed()) {
      window.minimize();
    }
  });

  // Toggle pin state
  ipcMain.on('toggle-pin', (event, noteId) => {
    const window = stickyNotes.get(noteId);
    if (window && !window.isDestroyed()) {
      window.noteData.isPinned = !window.noteData.isPinned;
      window.setAlwaysOnTop(window.noteData.isPinned);
      debouncedSave();
      event.reply('pin-toggled', window.noteData.isPinned);
    }
  });

  // Update font size
  ipcMain.on('update-font-size', (event, noteId, fontSize) => {
    const window = stickyNotes.get(noteId);
    if (window && !window.isDestroyed()) {
      window.noteData.fontSize = fontSize;
      debouncedSave();
    }
  });

  // Get all notes
  ipcMain.handle('get-all-notes', () => {
    const notes = [];
    stickyNotes.forEach((window, id) => {
      if (!window.isDestroyed()) {
        notes.push({
          id,
          ...window.noteData,
          bounds: window.getBounds()
        });
      }
    });
    return notes;
  });

  // Delete note
  ipcMain.handle('delete-note', async (event, noteId) => {
    const window = stickyNotes.get(noteId);
    if (window && !window.isDestroyed()) {
      const result = await dialog.showMessageBox(window, {
        type: 'question',
        buttons: ['Delete', 'Cancel'],
        defaultId: 1,
        title: 'Delete Note',
        message: 'Are you sure you want to delete this note?'
      });
      
      if (result.response === 0) {
        window.close();
        return true;
      }
    }
    return false;
  });

  // Export notes
  ipcMain.handle('export-notes', async () => {
    const notes = store.get('stickyNotes', []);
    const result = await dialog.showSaveDialog({
      title: 'Export Notes',
      defaultPath: `stickynotes-export-${Date.now()}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      try {
        await fs.writeFile(result.filePath, JSON.stringify(notes, null, 2));
        return { success: true, path: result.filePath };
      } catch (error) {
        console.error('Export error:', error);
        return { success: false, error: error.message };
      }
    }
    return { success: false, cancelled: true };
  });

  // Import notes
  ipcMain.handle('import-notes', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Import Notes',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      try {
        const data = await fs.readFile(result.filePaths[0], 'utf-8');
        const notes = JSON.parse(data);
        
        // Validate and import notes
        for (const note of notes) {
          if (note.content && note.color) {
            await createStickyNote(note);
          }
        }
        
        return { success: true, count: notes.length };
      } catch (error) {
        console.error('Import error:', error);
        return { success: false, error: error.message };
      }
    }
    return { success: false, cancelled: true };
  });
}

// ================= MENU SYSTEM =================

function createApplicationMenu() {
  const template = [
    {
      label: 'StickyNotes',
      submenu: [
        {
          label: 'About StickyNotes',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'About StickyNotes',
              message: 'StickyNotes v1.0.0',
              detail: 'A modern, secure sticky notes application for desktop.\n\n© 2024 Your Company',
              buttons: ['OK']
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Preferences',
          accelerator: 'CommandOrControl+,',
          click: () => {
            // Open preferences window
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Note',
          accelerator: 'CommandOrControl+N',
          click: () => createStickyNote()
        },
        { type: 'separator' },
        {
          label: 'Export Notes...',
          accelerator: 'CommandOrControl+Shift+E',
          click: () => {
            if (stickyNotes.size > 0) {
              const firstWindow = stickyNotes.values().next().value;
              firstWindow.webContents.send('export-notes');
            }
          }
        },
        {
          label: 'Import Notes...',
          accelerator: 'CommandOrControl+Shift+I',
          click: () => {
            if (stickyNotes.size > 0) {
              const firstWindow = stickyNotes.values().next().value;
              firstWindow.webContents.send('import-notes');
            }
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CommandOrControl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CommandOrControl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CommandOrControl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CommandOrControl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CommandOrControl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CommandOrControl+A', role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Show All Notes',
          accelerator: 'CommandOrControl+Shift+S',
          click: () => showAllNotes()
        },
        {
          label: 'Hide All Notes',
          accelerator: 'CommandOrControl+Shift+H',
          click: () => hideAllNotes()
        },
        { type: 'separator' },
        {
          label: 'Focus Next Note',
          accelerator: 'CommandOrControl+Tab',
          click: () => focusNextNote()
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'CommandOrControl+M', role: 'minimize' },
        { label: 'Close', accelerator: 'CommandOrControl+W', role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Keyboard Shortcuts',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'Keyboard Shortcuts',
              message: 'Keyboard Shortcuts',
              detail: `
Global Shortcuts:
• Cmd/Ctrl+Shift+N - New Note
• Cmd/Ctrl+Shift+H - Hide All Notes
• Cmd/Ctrl+Shift+S - Show All Notes
• Cmd/Ctrl+Tab - Focus Next Note

Note Shortcuts:
• Cmd/Ctrl+S - Save Note
• Cmd/Ctrl+W - Close Note
• Cmd/Ctrl+1-9 - Quick Color Change
• Cmd/Ctrl+Plus/Minus - Adjust Font Size
              `,
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ================= TRAY SYSTEM =================

function createTray() {
  try {
    // Create tray icon
    const iconPath = path.join(__dirname, 'resources', 'tray-icon.png');
    const icon = nativeImage.createFromPath(iconPath);
    
    // Fallback to text icon if image not found
    if (icon.isEmpty()) {
      const canvas = require('canvas');
      const ctx = canvas.createCanvas(16, 16).getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText('N', 2, 12);
      tray = new Tray(nativeImage.createFromDataURL(canvas.toDataURL()));
    } else {
      tray = new Tray(icon.resize({ width: 16, height: 16 }));
    }
    
    tray.setToolTip(`StickyNotes - ${stickyNotes.size} notes`);
    
    // Click to toggle visibility
    tray.on('click', () => {
      if (visibilityState === 'visible') {
        hideAllNotes();
      } else {
        showAllNotes();
      }
    });
    
    updateTrayMenu();
    
  } catch (error) {
    console.error('Error creating tray:', error);
  }
}

function updateTrayMenu() {
  if (!tray) return;
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `StickyNotes (${stickyNotes.size} notes)`,
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'New Note',
      click: () => createStickyNote()
    },
    {
      label: visibilityState === 'visible' ? 'Hide All Notes' : 'Show All Notes',
      click: () => {
        if (visibilityState === 'visible') {
          hideAllNotes();
        } else {
          showAllNotes();
        }
      }
    },
    { type: 'separator' },
    ...Array.from(stickyNotes.entries()).slice(0, 10).map(([id, window]) => ({
      label: window.noteData.content.substring(0, 30) || 'Empty Note',
      click: () => {
        window.show();
        window.focus();
      }
    })),
    ...(stickyNotes.size > 10 ? [
      { type: 'separator' },
      { label: `... and ${stickyNotes.size - 10} more`, enabled: false }
    ] : []),
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip(`StickyNotes - ${stickyNotes.size} notes`);
}

// ================= KEYBOARD SHORTCUTS =================

function registerGlobalShortcuts() {
  const shortcuts = store.get('userPreferences.shortcuts', {
    newNote: 'CommandOrControl+Shift+N',
    hideAll: 'CommandOrControl+Shift+H',
    showAll: 'CommandOrControl+Shift+S',
    focusNext: 'CommandOrControl+Shift+Tab'
  });

  // New Note
  globalShortcut.register(shortcuts.newNote, () => {
    createStickyNote();
  });

  // Hide All
  globalShortcut.register(shortcuts.hideAll, () => {
    hideAllNotes();
  });

  // Show All
  globalShortcut.register(shortcuts.showAll, () => {
    showAllNotes();
  });

  // Focus Next
  globalShortcut.register(shortcuts.focusNext, () => {
    focusNextNote();
  });
}

// ================= NOTE MANAGEMENT FUNCTIONS =================

function showAllNotes() {
  stickyNotes.forEach(window => {
    if (!window.isDestroyed()) {
      window.show();
    }
  });
  visibilityState = 'visible';
  updateTrayMenu();
}

function hideAllNotes() {
  stickyNotes.forEach(window => {
    if (!window.isDestroyed()) {
      window.hide();
    }
  });
  visibilityState = 'hidden';
  updateTrayMenu();
}

function focusNextNote() {
  const notes = Array.from(stickyNotes.values());
  if (notes.length === 0) return;
  
  const focusedWindow = BrowserWindow.getFocusedWindow();
  const currentIndex = notes.indexOf(focusedWindow);
  const nextIndex = (currentIndex + 1) % notes.length;
  
  const nextWindow = notes[nextIndex];
  if (nextWindow && !nextWindow.isDestroyed()) {
    nextWindow.show();
    nextWindow.focus();
  }
}

// ================= APP LIFECYCLE =================

app.whenReady().then(async () => {
  // Setup IPC handlers
  setupIpcHandlers();
  
  // Create application menu
  createApplicationMenu();
  
  // Create system tray
  createTray();
  
  // Register global shortcuts
  registerGlobalShortcuts();
  
  // Load saved notes
  await loadNotes();
  
  // Create first note if none exist
  if (stickyNotes.size === 0) {
    await createStickyNote();
  }
  
  console.log('StickyNotes app ready');
});

app.on('window-all-closed', () => {
  if (!isQuitting && process.platform === 'darwin') {
    // Keep app running in tray on macOS
    return;
  }
  app.quit();
});

app.on('before-quit', () => {
  isQuitting = true;
  saveAllNotes();
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (stickyNotes.size === 0) {
    createStickyNote();
  } else {
    showAllNotes();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  saveAllNotes();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

module.exports = { createStickyNote, stickyNotes };