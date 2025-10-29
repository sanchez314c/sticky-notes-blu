/**
 * Enhanced Window Lifecycle Manager
 * Handles window creation, management, state persistence, and cleanup
 */

const { BrowserWindow, screen } = require('electron');
const path = require('path');
const { EventEmitter } = require('events');

class WindowLifecycleManager extends EventEmitter {
  constructor(store, defaultConfig) {
    super();
    this.store = store;
    this.defaultConfig = defaultConfig;
    this.windows = new Map(); // Map of noteId -> window data
    this.windowCounter = 0;
    this.cleanupTimeout = null;
    this.saveTimeout = null;
    
    // Window state tracking
    this.windowStates = new Map();
    
    // Setup periodic cleanup
    this.setupPeriodicCleanup();
    
    console.log('WindowLifecycleManager initialized');
  }
  
  /**
   * Create a new window with enhanced lifecycle management
   */
  createWindow(savedData = null) {
    try {
      const noteId = savedData?.id || this.generateNoteId();
      
      // Prevent duplicate windows
      if (this.windows.has(noteId)) {
        console.warn(`Window ${noteId} already exists`);
        return this.windows.get(noteId).window;
      }
      
      // Check window limit
      if (this.windows.size >= this.store.get('settings.maxNotes', 50)) {
        throw new Error('Maximum number of windows reached');
      }
      
      // Calculate window position
      const bounds = this.calculateWindowBounds(savedData?.bounds);
      
      // Create window with enhanced configuration
      const windowConfig = {
        ...this.defaultConfig,
        ...bounds,
        show: false, // Show after initialization
        title: `Sticky Note - ${noteId}`
      };
      
      const window = new BrowserWindow(windowConfig);
      
      // Setup window lifecycle handlers
      this.setupWindowHandlers(window, noteId);
      
      // Load content
      window.loadFile('index.html');
      
      // Store window data
      const windowData = {
        window,
        id: noteId,
        content: savedData?.content || '',
        color: savedData?.color || 'gradient-1',
        bounds: window.getBounds(),
        created: savedData?.created || new Date().toISOString(),
        modified: savedData?.modified || new Date().toISOString(),
        isReady: false,
        isClosing: false,
        saveTimeout: null
      };
      
      this.windows.set(noteId, windowData);
      this.windowStates.set(noteId, 'creating');
      
      // Initialize window when ready
      window.webContents.once('did-finish-load', () => {
        this.initializeWindow(noteId, savedData);
      });
      
      this.emit('windowCreated', { id: noteId, window });
      console.log(`Window created: ${noteId}`);
      
      return window;
      
    } catch (error) {
      console.error('Error creating window:', error);
      this.emit('windowError', { error: error.message, type: 'creation' });
      return null;
    }
  }
  
  /**
   * Initialize window with data and show it
   */
  initializeWindow(noteId, savedData = null) {
    const windowData = this.windows.get(noteId);
    if (!windowData || windowData.window.isDestroyed()) {
      console.warn(`Cannot initialize destroyed window: ${noteId}`);
      return;
    }
    
    try {
      // Send initialization data
      windowData.window.webContents.send('init-note', {
        id: noteId,
        content: savedData?.content || '',
        color: savedData?.color || 'gradient-1'
      });
      
      // Mark as ready and show
      windowData.isReady = true;
      this.windowStates.set(noteId, 'ready');
      
      // Show window
      windowData.window.show();
      
      if (!savedData) {
        windowData.window.focus();
      }
      
      this.emit('windowInitialized', { id: noteId });
      console.log(`Window initialized: ${noteId}`);
      
    } catch (error) {
      console.error(`Error initializing window ${noteId}:`, error);
      this.emit('windowError', { id: noteId, error: error.message, type: 'initialization' });
    }
  }
  
  /**
   * Setup window event handlers for lifecycle management
   */
  setupWindowHandlers(window, noteId) {
    // Window ready to show
    window.once('ready-to-show', () => {
      this.windowStates.set(noteId, 'ready-to-show');
    });
    
    // Window shown
    window.on('show', () => {
      this.windowStates.set(noteId, 'visible');
      this.emit('windowShown', { id: noteId });
    });
    
    // Window hidden
    window.on('hide', () => {
      this.windowStates.set(noteId, 'hidden');
      this.emit('windowHidden', { id: noteId });
    });
    
    // Window focused
    window.on('focus', () => {
      this.emit('windowFocused', { id: noteId });
    });
    
    // Window blurred
    window.on('blur', () => {
      this.emit('windowBlurred', { id: noteId });
      // Auto-save on blur
      this.saveWindowData(noteId);
    });
    
    // Window moved
    window.on('moved', () => {
      this.handleWindowMove(noteId);
    });
    
    // Window resized
    window.on('resized', () => {
      this.handleWindowResize(noteId);
    });
    
    // Window minimized
    window.on('minimize', () => {
      this.windowStates.set(noteId, 'minimized');
      this.emit('windowMinimized', { id: noteId });
    });
    
    // Window restored
    window.on('restore', () => {
      this.windowStates.set(noteId, 'restored');
      this.emit('windowRestored', { id: noteId });
    });
    
    // Window close event (before closing)
    window.on('close', (event) => {
      this.handleWindowClose(noteId, event);
    });
    
    // Window closed (after closing)
    window.on('closed', () => {
      this.handleWindowClosed(noteId);
    });
    
    // Handle unresponsive window
    window.on('unresponsive', () => {
      console.warn(`Window ${noteId} became unresponsive`);
      this.emit('windowUnresponsive', { id: noteId });
    });
    
    // Handle responsive window
    window.on('responsive', () => {
      console.log(`Window ${noteId} became responsive again`);
      this.emit('windowResponsive', { id: noteId });
    });
    
    // Handle page title changes
    window.webContents.on('page-title-updated', (event, title) => {
      this.emit('windowTitleChanged', { id: noteId, title });
    });
    
    // Handle navigation (security)
    window.webContents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      if (parsedUrl.origin !== 'file://') {
        console.warn(`Blocked navigation to: ${navigationUrl}`);
        event.preventDefault();
      }
    });
    
    // Handle new window creation (security)
    window.webContents.on('new-window', (event, navigationUrl) => {
      console.warn(`Blocked new window creation to: ${navigationUrl}`);
      event.preventDefault();
    });
  }
  
  /**
   * Handle window move event
   */
  handleWindowMove(noteId) {
    const windowData = this.windows.get(noteId);
    if (!windowData || windowData.window.isDestroyed()) return;
    
    try {
      // Update bounds
      windowData.bounds = windowData.window.getBounds();
      windowData.modified = new Date().toISOString();
      
      // Debounce save to prevent excessive writes
      this.debounceSave(noteId);
      
      this.emit('windowMoved', { id: noteId, bounds: windowData.bounds });
    } catch (error) {
      console.error(`Error handling window move for ${noteId}:`, error);
    }
  }
  
  /**
   * Handle window resize event
   */
  handleWindowResize(noteId) {
    const windowData = this.windows.get(noteId);
    if (!windowData || windowData.window.isDestroyed()) return;
    
    try {
      // Update bounds
      windowData.bounds = windowData.window.getBounds();
      windowData.modified = new Date().toISOString();
      
      // Debounce save
      this.debounceSave(noteId);
      
      this.emit('windowResized', { id: noteId, bounds: windowData.bounds });
    } catch (error) {
      console.error(`Error handling window resize for ${noteId}:`, error);
    }
  }
  
  /**
   * Handle window close event (before closing)
   */
  handleWindowClose(noteId, event) {
    const windowData = this.windows.get(noteId);
    if (!windowData) return;
    
    // Mark as closing
    windowData.isClosing = true;
    this.windowStates.set(noteId, 'closing');
    
    // Save data before closing
    try {
      this.saveWindowData(noteId, true); // Force save
      this.emit('windowClosing', { id: noteId });
    } catch (error) {
      console.error(`Error saving data for closing window ${noteId}:`, error);
    }
  }
  
  /**
   * Handle window closed event (after closing)
   */
  handleWindowClosed(noteId) {
    try {
      // Cleanup window data
      const windowData = this.windows.get(noteId);
      if (windowData) {
        // Clear any pending timeouts
        if (windowData.saveTimeout) {
          clearTimeout(windowData.saveTimeout);
        }
      }
      
      // Remove from tracking
      this.windows.delete(noteId);
      this.windowStates.delete(noteId);
      
      // Final save
      this.saveAllWindows();
      
      this.emit('windowClosed', { id: noteId });
      console.log(`Window closed and cleaned up: ${noteId}`);
      
    } catch (error) {
      console.error(`Error cleaning up closed window ${noteId}:`, error);
    }
  }
  
  /**
   * Calculate optimal window bounds
   */
  calculateWindowBounds(savedBounds = null) {
    try {
      const display = screen.getPrimaryDisplay();
      const { width: screenWidth, height: screenHeight } = display.workAreaSize;
      
      if (savedBounds) {
        // Validate and adjust saved bounds
        const x = Math.max(0, Math.min(savedBounds.x || 0, screenWidth - (savedBounds.width || this.defaultConfig.width)));
        const y = Math.max(0, Math.min(savedBounds.y || 0, screenHeight - (savedBounds.height || this.defaultConfig.height)));
        const width = Math.max(200, Math.min(savedBounds.width || this.defaultConfig.width, screenWidth));
        const height = Math.max(150, Math.min(savedBounds.height || this.defaultConfig.height, screenHeight));
        
        return { x, y, width, height };
      } else {
        // Calculate cascaded position for new windows
        const offset = (this.windows.size % 10) * 30;
        const x = Math.min(100 + offset, screenWidth - this.defaultConfig.width);
        const y = Math.min(100 + offset, screenHeight - this.defaultConfig.height);
        
        return {
          x,
          y,
          width: this.defaultConfig.width,
          height: this.defaultConfig.height
        };
      }
    } catch (error) {
      console.error('Error calculating window bounds:', error);
      return {
        x: 100,
        y: 100,
        width: this.defaultConfig.width,
        height: this.defaultConfig.height
      };
    }
  }
  
  /**
   * Generate unique note ID
   */
  generateNoteId() {
    this.windowCounter++;
    const timestamp = Date.now().toString(36);
    return `note_${timestamp}_${this.windowCounter}`;
  }
  
  /**
   * Update window content
   */
  updateWindowContent(noteId, content) {
    const windowData = this.windows.get(noteId);
    if (!windowData || windowData.window.isDestroyed()) {
      console.warn(`Cannot update content for non-existent window: ${noteId}`);
      return false;
    }
    
    try {
      windowData.content = content;
      windowData.modified = new Date().toISOString();
      this.debounceSave(noteId);
      
      this.emit('windowContentUpdated', { id: noteId, content });
      return true;
    } catch (error) {
      console.error(`Error updating content for window ${noteId}:`, error);
      return false;
    }
  }
  
  /**
   * Update window color
   */
  updateWindowColor(noteId, color) {
    const windowData = this.windows.get(noteId);
    if (!windowData || windowData.window.isDestroyed()) {
      console.warn(`Cannot update color for non-existent window: ${noteId}`);
      return false;
    }
    
    try {
      windowData.color = color;
      windowData.modified = new Date().toISOString();
      this.debounceSave(noteId);
      
      this.emit('windowColorUpdated', { id: noteId, color });
      return true;
    } catch (error) {
      console.error(`Error updating color for window ${noteId}:`, error);
      return false;
    }
  }
  
  /**
   * Debounced save for a specific window
   */
  debounceSave(noteId, delay = 1000) {
    const windowData = this.windows.get(noteId);
    if (!windowData) return;
    
    // Clear existing timeout
    if (windowData.saveTimeout) {
      clearTimeout(windowData.saveTimeout);
    }
    
    // Set new timeout
    windowData.saveTimeout = setTimeout(() => {
      this.saveWindowData(noteId);
    }, delay);
  }
  
  /**
   * Save data for a specific window
   */
  saveWindowData(noteId, force = false) {
    const windowData = this.windows.get(noteId);
    if (!windowData) return;
    
    try {
      // Update bounds if window exists
      if (!windowData.window.isDestroyed()) {
        windowData.bounds = windowData.window.getBounds();
      }
      
      // Trigger global save
      this.saveAllWindows();
      
      this.emit('windowDataSaved', { id: noteId });
    } catch (error) {
      console.error(`Error saving data for window ${noteId}:`, error);
    }
  }
  
  /**
   * Save all windows data to store
   */
  saveAllWindows() {
    try {
      const windowsData = [];
      const currentTime = new Date().toISOString();
      
      this.windows.forEach((windowData, noteId) => {
        if (windowData && windowData.id) {
          // Get current bounds if window exists
          let bounds = windowData.bounds;
          if (windowData.window && !windowData.window.isDestroyed()) {
            bounds = windowData.window.getBounds();
          }
          
          windowsData.push({
            id: windowData.id,
            content: windowData.content || '',
            color: windowData.color || 'gradient-1',
            bounds: bounds || { x: 100, y: 100, width: 300, height: 300 },
            created: windowData.created || currentTime,
            modified: windowData.modified || currentTime
          });
        }
      });
      
      // Save to store
      this.store.set('stickyNotes', windowsData);
      this.store.set('lastNoteId', this.windowCounter);
      
      this.emit('allWindowsDataSaved', { count: windowsData.length });
      console.log(`Saved ${windowsData.length} windows to store`);
      
    } catch (error) {
      console.error('Error saving all windows data:', error);
      this.emit('saveError', { error: error.message });
    }
  }
  
  /**
   * Get window by ID
   */
  getWindow(noteId) {
    const windowData = this.windows.get(noteId);
    return windowData?.window;
  }
  
  /**
   * Get window data by ID
   */
  getWindowData(noteId) {
    return this.windows.get(noteId);
  }
  
  /**
   * Get all windows
   */
  getAllWindows() {
    return Array.from(this.windows.values()).map(data => data.window);
  }
  
  /**
   * Get all window data
   */
  getAllWindowsData() {
    return Array.from(this.windows.values());
  }
  
  /**
   * Close window by ID
   */
  closeWindow(noteId) {
    const windowData = this.windows.get(noteId);
    if (!windowData || windowData.window.isDestroyed()) {
      console.warn(`Cannot close non-existent window: ${noteId}`);
      return false;
    }
    
    try {
      windowData.window.close();
      return true;
    } catch (error) {
      console.error(`Error closing window ${noteId}:`, error);
      return false;
    }
  }
  
  /**
   * Close all windows
   */
  closeAllWindows() {
    const windows = Array.from(this.windows.keys());
    let closedCount = 0;
    
    windows.forEach(noteId => {
      if (this.closeWindow(noteId)) {
        closedCount++;
      }
    });
    
    console.log(`Closed ${closedCount} windows`);
    return closedCount;
  }
  
  /**
   * Show all windows
   */
  showAllWindows() {
    let shownCount = 0;
    
    this.windows.forEach((windowData) => {
      if (!windowData.window.isDestroyed()) {
        windowData.window.show();
        shownCount++;
      }
    });
    
    this.emit('allWindowsShown', { count: shownCount });
    return shownCount;
  }
  
  /**
   * Hide all windows
   */
  hideAllWindows() {
    let hiddenCount = 0;
    
    this.windows.forEach((windowData) => {
      if (!windowData.window.isDestroyed()) {
        windowData.window.hide();
        hiddenCount++;
      }
    });
    
    this.emit('allWindowsHidden', { count: hiddenCount });
    return hiddenCount;
  }
  
  /**
   * Focus next window (cycling)
   */
  focusNextWindow() {
    const visibleWindows = Array.from(this.windows.values())
      .filter(data => !data.window.isDestroyed() && data.window.isVisible());
    
    if (visibleWindows.length === 0) return null;
    
    // Simple random selection for now
    const randomWindow = visibleWindows[Math.floor(Math.random() * visibleWindows.length)];
    randomWindow.window.focus();
    
    return randomWindow.id;
  }
  
  /**
   * Get window count
   */
  getWindowCount() {
    return this.windows.size;
  }
  
  /**
   * Get window states
   */
  getWindowStates() {
    return new Map(this.windowStates);
  }
  
  /**
   * Setup periodic cleanup of destroyed windows
   */
  setupPeriodicCleanup() {
    this.cleanupTimeout = setInterval(() => {
      this.performCleanup();
    }, 30000); // Every 30 seconds
  }
  
  /**
   * Perform cleanup of destroyed windows
   */
  performCleanup() {
    let cleanedCount = 0;
    
    for (const [noteId, windowData] of this.windows.entries()) {
      if (windowData.window.isDestroyed()) {
        this.windows.delete(noteId);
        this.windowStates.delete(noteId);
        cleanedCount++;
        console.log(`Cleaned up destroyed window: ${noteId}`);
      }
    }
    
    if (cleanedCount > 0) {
      this.emit('cleanupPerformed', { count: cleanedCount });
    }
  }
  
  /**
   * Destroy the lifecycle manager
   */
  destroy() {
    try {
      // Save all data
      this.saveAllWindows();
      
      // Close all windows
      this.closeAllWindows();
      
      // Clear timeouts
      if (this.cleanupTimeout) {
        clearInterval(this.cleanupTimeout);
      }
      
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }
      
      // Clear window data
      this.windows.clear();
      this.windowStates.clear();
      
      // Remove all listeners
      this.removeAllListeners();
      
      console.log('WindowLifecycleManager destroyed');
    } catch (error) {
      console.error('Error destroying WindowLifecycleManager:', error);
    }
  }
}

module.exports = { WindowLifecycleManager };