const { BrowserWindow, screen } = require('electron');
const path = require('path');

/**
 * NoteWindowManager - Handles creation, tracking, and cleanup of sticky note windows
 * Prevents memory leaks by properly managing event listeners and resources
 */
class NoteWindowManager {
    constructor(store) {
        this.store = store;
        this.windows = new Map();
        this.listeners = new Map();
        this.intervals = new Map();
        this.noteIdCounter = store.get('lastNoteId', 0);
        this.saveCallback = null;
    }

    /**
     * Set the save callback function
     */
    setSaveCallback(callback) {
        this.saveCallback = callback;
    }

    /**
     * Create a new sticky note window with proper resource management
     */
    createNote(savedData = null) {
        try {
            // Check note limit
            const maxNotes = this.store.get('settings.maxNotes', 50);
            if (this.windows.size >= maxNotes) {
                console.warn(`Maximum number of notes (${maxNotes}) reached`);
                return null;
            }

            const noteId = savedData?.id || `note_${++this.noteIdCounter}`;
            
            // Prevent duplicate notes
            if (this.windows.has(noteId)) {
                console.warn(`Note with ID ${noteId} already exists`);
                return this.windows.get(noteId).window;
            }

            // Get screen dimensions for smart positioning
            const display = screen.getPrimaryDisplay();
            const { width: screenWidth, height: screenHeight } = display.workAreaSize;
            
            // Smart positioning
            let defaultX, defaultY;
            const defaultWidth = 300;
            const defaultHeight = 300;
            
            if (savedData?.bounds?.x !== undefined && savedData?.bounds?.y !== undefined) {
                defaultX = Math.max(0, Math.min(savedData.bounds.x, screenWidth - defaultWidth));
                defaultY = Math.max(0, Math.min(savedData.bounds.y, screenHeight - defaultHeight));
            } else {
                // Cascade new notes
                const offset = (this.windows.size % 10) * 30;
                defaultX = Math.min(100 + offset, screenWidth - defaultWidth);
                defaultY = Math.min(100 + offset, screenHeight - defaultHeight);
            }

            // Create the window with enhanced security settings
            const noteWindow = new BrowserWindow({
                x: defaultX,
                y: defaultY,
                width: savedData?.bounds?.width || defaultWidth,
                height: savedData?.bounds?.height || defaultHeight,
                frame: false,
                transparent: true,
                alwaysOnTop: true,
                resizable: true,
                movable: true,
                minimizable: false,
                maximizable: false,
                skipTaskbar: true,
                hasShadow: true,
                backgroundColor: '#2a2a2a',
                titleBarStyle: 'customButtonsOnHover',
                vibrancy: 'dark',
                visualEffectState: 'active',
                show: false, // Don't show until ready
                title: `Sticky Note - ${noteId}`,
                webPreferences: {
                    preload: path.join(__dirname, '../../preload.js'),
                    contextIsolation: true,
                    nodeIntegration: false,
                    sandbox: true,
                    webviewTag: false,
                    enableRemoteModule: false,
                    allowRunningInsecureContent: false,
                    experimentalFeatures: false,
                    safeDialogs: true,
                    navigateOnDragDrop: false
                }
            });

            // Track window and its resources
            const noteData = {
                window: noteWindow,
                id: noteId,
                content: savedData?.content || '',
                color: savedData?.color || 'gradient-1',
                bounds: noteWindow.getBounds(),
                created: savedData?.created || new Date().toISOString(),
                modified: savedData?.modified || new Date().toISOString()
            };
            
            this.windows.set(noteId, noteData);
            this.listeners.set(noteId, []);

            // Setup security restrictions
            this.setupSecurityRestrictions(noteWindow);

            // Setup event listeners with proper cleanup tracking
            this.setupEventListeners(noteId, noteWindow);

            // Load the HTML file
            noteWindow.loadFile('index.html');

            // Initialize note data when ready
            noteWindow.webContents.on('did-finish-load', () => {
                noteWindow.webContents.send('init-note', {
                    id: noteId,
                    content: noteData.content,
                    color: noteData.color
                });
                
                // Show window after initialization
                noteWindow.show();
                if (!savedData) {
                    noteWindow.focus();
                }
            });

            console.log(`Created sticky note: ${noteId}`);
            return noteWindow;

        } catch (error) {
            console.error('Error creating sticky note:', error);
            return null;
        }
    }

    /**
     * Setup security restrictions for the window
     */
    setupSecurityRestrictions(noteWindow) {
        // Block external navigation
        noteWindow.webContents.on('will-navigate', (event, navigationUrl) => {
            const parsedUrl = new URL(navigationUrl);
            if (parsedUrl.origin !== 'file://') {
                console.warn(`Blocked navigation to: ${navigationUrl}`);
                event.preventDefault();
            }
        });

        // Block new window creation
        noteWindow.webContents.on('new-window', (event) => {
            console.warn('Blocked new window creation');
            event.preventDefault();
        });

        // Block webview attachments
        noteWindow.webContents.on('will-attach-webview', (event) => {
            console.warn('Blocked webview attachment');
            event.preventDefault();
        });

        // Set Content Security Policy
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
    }

    /**
     * Setup event listeners with proper tracking for cleanup
     */
    setupEventListeners(noteId, noteWindow) {
        const noteData = this.windows.get(noteId);
        const listeners = [];

        // Save state handler with debouncing
        let saveTimeout;
        const saveState = () => {
            if (noteData && !noteWindow.isDestroyed()) {
                noteData.bounds = noteWindow.getBounds();
                noteData.modified = new Date().toISOString();
                
                // Debounced save
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    if (this.saveCallback) {
                        this.saveCallback();
                    }
                }, 500);
            }
        };

        // Track the save timeout for cleanup
        if (saveTimeout) {
            this.intervals.set(noteId, saveTimeout);
        }

        // Add event listeners and track them
        const addTrackedListener = (event, handler) => {
            noteWindow.on(event, handler);
            listeners.push({ event, handler });
        };

        addTrackedListener('moved', saveState);
        addTrackedListener('resized', saveState);

        // Handle window close with proper cleanup
        addTrackedListener('closed', () => {
            this.cleanup(noteId);
        });

        // Store all listeners for this note
        this.listeners.set(noteId, listeners);
    }

    /**
     * Clean up all resources for a specific note
     */
    cleanup(noteId) {
        console.log(`Cleaning up resources for note: ${noteId}`);
        
        // Remove all event listeners
        const listeners = this.listeners.get(noteId) || [];
        const noteData = this.windows.get(noteId);
        const window = noteData?.window;
        
        if (window && !window.isDestroyed()) {
            // Remove each tracked listener
            listeners.forEach(({ event, handler }) => {
                try {
                    window.removeListener(event, handler);
                } catch (error) {
                    console.warn(`Error removing listener for ${event}:`, error);
                }
            });
            
            // Force close if not already closed
            try {
                window.close();
            } catch (error) {
                console.warn('Error closing window:', error);
            }
        }

        // Clear any intervals or timeouts
        const interval = this.intervals.get(noteId);
        if (interval) {
            clearTimeout(interval);
            clearInterval(interval);
        }

        // Remove from tracking maps
        this.windows.delete(noteId);
        this.listeners.delete(noteId);
        this.intervals.delete(noteId);

        // Trigger save after cleanup
        if (this.saveCallback) {
            this.saveCallback();
        }

        console.log(`Cleanup complete for note: ${noteId}`);
    }

    /**
     * Clean up all windows and resources
     */
    cleanupAll() {
        console.log('Cleaning up all sticky notes...');
        
        // Create array of IDs to avoid mutation during iteration
        const noteIds = Array.from(this.windows.keys());
        
        noteIds.forEach(noteId => {
            this.cleanup(noteId);
        });

        // Clear all tracking maps
        this.windows.clear();
        this.listeners.clear();
        this.intervals.clear();

        console.log('All sticky notes cleaned up');
    }

    /**
     * Get all notes data for saving
     */
    getAllNotesData() {
        const notesData = [];
        const currentTime = new Date().toISOString();

        this.windows.forEach((noteData) => {
            if (noteData && noteData.id && noteData.window && !noteData.window.isDestroyed()) {
                notesData.push({
                    id: noteData.id,
                    content: noteData.content || '',
                    color: noteData.color || 'gradient-1',
                    bounds: noteData.bounds || noteData.window.getBounds(),
                    created: noteData.created || currentTime,
                    modified: currentTime
                });
            }
        });

        return notesData;
    }

    /**
     * Update note content
     */
    updateNoteContent(noteId, content) {
        const noteData = this.windows.get(noteId);
        if (noteData) {
            noteData.content = content;
            noteData.modified = new Date().toISOString();
        }
    }

    /**
     * Update note color
     */
    updateNoteColor(noteId, color) {
        const noteData = this.windows.get(noteId);
        if (noteData) {
            noteData.color = color;
            noteData.modified = new Date().toISOString();
        }
    }

    /**
     * Get note by ID
     */
    getNote(noteId) {
        return this.windows.get(noteId);
    }

    /**
     * Get all notes
     */
    getAllNotes() {
        return this.windows;
    }

    /**
     * Get note count
     */
    getNoteCount() {
        return this.windows.size;
    }

    /**
     * Check if note exists
     */
    hasNote(noteId) {
        return this.windows.has(noteId);
    }

    /**
     * Get current note ID counter
     */
    getNoteIdCounter() {
        return this.noteIdCounter;
    }

    /**
     * Set note ID counter (for persistence)
     */
    setNoteIdCounter(value) {
        this.noteIdCounter = value;
    }
}

module.exports = NoteWindowManager;