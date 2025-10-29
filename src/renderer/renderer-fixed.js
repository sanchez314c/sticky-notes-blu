// Enhanced Renderer process script for sticky notes
// Improved event system coordination and error handling

class StickyNoteRenderer {
  constructor() {
    this.noteId = null;
    this.saveTimeout = null;
    this.lastSavedContent = '';
    this.isDragging = false;
    this.isResizing = false;
    this.dragOffset = { x: 0, y: 0 };
    this.contextMenu = null;
    this.savePromise = null;
    
    // Event system coordination
    this.eventEmitter = new EventTarget();
    this.initialized = false;
    
    // DOM elements (will be set after DOM loads)
    this.elements = {};
    
    // Performance optimization
    this.lastSaveTime = 0;
    this.saveThrottleDelay = 500;
    
    // Bind methods to preserve context
    this.handleInput = this.handleInput.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleKeyboard = this.handleKeyboard.bind(this);
    
    this.init();
  }
  
  // Initialize the renderer
  async init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupDOM());
    } else {
      this.setupDOM();
    }
    
    // Setup IPC error handling
    this.setupErrorHandling();
  }
  
  // Setup DOM elements and event listeners
  setupDOM() {
    // Cache DOM elements
    this.elements = {
      noteContent: document.getElementById('noteContent'),
      stickyNote: document.getElementById('stickyNote'),
      closeBtn: document.getElementById('closeBtn'),
      minimizeBtn: document.getElementById('minimizeBtn'),
      newBtn: document.getElementById('newBtn'),
      colorPicker: document.getElementById('colorPicker'),
      colorDropdown: document.getElementById('colorDropdown'),
      noteFooter: document.getElementById('noteFooter'),
      lastModified: document.getElementById('lastModified'),
      saveIndicator: document.getElementById('saveIndicator'),
      noteHeader: document.querySelector('.note-header')
    };
    
    // Validate required elements exist
    const requiredElements = ['noteContent', 'stickyNote', 'closeBtn', 'minimizeBtn', 'newBtn'];
    const missingElements = requiredElements.filter(key => !this.elements[key]);
    
    if (missingElements.length > 0) {
      console.error('Missing required DOM elements:', missingElements);
      this.showNotification('Application initialization error', 'error');
      return;
    }
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup IPC communication
    this.setupIPC();
    
    // Setup drag and drop
    this.setupDragAndDrop();
    
    // Setup resize functionality
    this.setupResize();
    
    // Setup context menu
    this.setupContextMenu();
    
    // Focus on textarea
    this.elements.noteContent.focus();
    
    this.initialized = true;
    this.emit('initialized');
    console.log('StickyNote renderer initialized successfully');
  }
  
  // Setup error handling for IPC and general errors
  setupErrorHandling() {
    // Handle IPC errors
    if (window.electronAPI && window.electronAPI.addEventListener) {
      window.electronAPI.addEventListener('ipcError', (event) => {
        const { action, error } = event.detail;
        console.error(`IPC Error in ${action}:`, error);
        this.showNotification(`Error: ${error}`, 'error');
      });
    }
    
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Renderer error:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    });
  }
  
  // Setup IPC communication
  setupIPC() {
    if (!window.electronAPI) {
      console.error('ElectronAPI not available');
      this.showNotification('IPC communication not available', 'error');
      return;
    }
    
    // Listen for initialization data
    window.electronAPI.onInitNote((data) => {
      this.initializeNote(data);
    });
  }
  
  // Initialize note with data from main process
  initializeNote(data) {
    try {
      this.noteId = data.id;
      this.elements.noteContent.value = data.content || '';
      this.lastSavedContent = data.content || '';
      
      // Set initial color
      if (data.color) {
        this.applyGradient(data.color);
      }
      
      this.updateLastModified();
      this.emit('noteInitialized', { id: this.noteId, content: this.lastSavedContent });
      
      console.log(`Note initialized: ${this.noteId}`);
    } catch (error) {
      console.error('Error initializing note:', error);
      this.showNotification('Failed to initialize note', 'error');
    }
  }
  
  // Setup event listeners
  setupEventListeners() {
    const { noteContent, closeBtn, minimizeBtn, newBtn, colorPicker, colorDropdown } = this.elements;
    
    // Content input handling
    noteContent.addEventListener('input', this.handleInput);
    noteContent.addEventListener('blur', () => this.handleSave());
    noteContent.addEventListener('contextmenu', this.handleContextMenu);
    noteContent.addEventListener('mousedown', (e) => e.stopPropagation());
    
    // Button handling with error catching
    this.addButtonListener(closeBtn, 'close', () => this.closeNote());
    this.addButtonListener(minimizeBtn, 'minimize', () => this.minimizeNote());
    this.addButtonListener(newBtn, 'new', () => this.createNewNote());
    
    // Color picker
    colorPicker.addEventListener('click', (e) => {
      e.stopPropagation();
      colorDropdown.classList.toggle('show');
    });
    
    // Color selection
    colorDropdown.addEventListener('click', (e) => {
      if (e.target.classList.contains('color-swatch')) {
        const gradientClass = e.target.dataset.gradient;
        this.applyGradient(gradientClass);
        colorDropdown.classList.remove('show');
      }
    });
    
    // Close color dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!colorDropdown.contains(e.target) && e.target !== colorPicker) {
        colorDropdown.classList.remove('show');
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboard);
    
    // Window events
    window.addEventListener('blur', () => this.handleSave());
    window.addEventListener('beforeunload', () => this.handleSave(true));
    
    console.log('Event listeners setup complete');
  }
  
  // Helper method to add button listeners with error handling
  addButtonListener(element, action, handler) {
    if (!element) {
      console.warn(`Button element for ${action} not found`);
      return;
    }
    
    element.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Visual feedback
      element.style.transform = 'scale(0.95)';
      setTimeout(() => element.style.transform = '', 100);
      
      try {
        await handler();
      } catch (error) {
        console.error(`Error in ${action} handler:`, error);
        this.showNotification(`Error: ${error.message}`, 'error');
      }
    });
  }
  
  // Handle content input with debouncing
  handleInput() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.handleSave(), this.saveThrottleDelay);
  }
  
  // Enhanced save functionality with promise coordination
  async handleSave(force = false) {
    if (!this.noteId || !this.elements.noteContent) return;
    
    const currentContent = this.elements.noteContent.value;
    
    // Skip if content hasn't changed and not forced
    if (!force && currentContent === this.lastSavedContent) return;
    
    // Prevent concurrent saves
    if (this.savePromise && !force) return this.savePromise;
    
    // Throttle saves for performance
    const now = Date.now();
    if (!force && (now - this.lastSaveTime) < 300) {
      return;
    }
    
    this.lastSaveTime = now;
    
    try {
      // Show save indicator
      this.showSaveIndicator();
      
      // Create save promise
      this.savePromise = window.electronAPI.saveNoteContent(this.noteId, currentContent);
      
      await this.savePromise;
      
      this.lastSavedContent = currentContent;
      this.updateLastModified();
      this.emit('noteSaved', { id: this.noteId, content: currentContent });
      
      console.log(`Note ${this.noteId} saved successfully`);
      
    } catch (error) {
      console.error('Save error:', error);
      this.showNotification('Failed to save changes', 'error');
      throw error;
    } finally {
      this.savePromise = null;
      this.hideSaveIndicator();
    }
  }
  
  // Enhanced button actions with proper error handling
  async closeNote() {
    if (!this.noteId) return;
    
    try {
      // Save before closing
      if (this.elements.noteContent.value !== this.lastSavedContent) {
        await this.handleSave(true);
      }
      
      await window.electronAPI.closeNote(this.noteId);
      this.emit('noteClosed', { id: this.noteId });
    } catch (error) {
      console.error('Error closing note:', error);
      throw error;
    }
  }
  
  async minimizeNote() {
    if (!this.noteId) return;
    
    try {
      await window.electronAPI.minimizeNote(this.noteId);
      this.emit('noteMinimized', { id: this.noteId });
    } catch (error) {
      console.error('Error minimizing note:', error);
      throw error;
    }
  }
  
  async createNewNote() {
    try {
      await window.electronAPI.createNewNote();
      this.emit('newNoteCreated');
    } catch (error) {
      console.error('Error creating new note:', error);
      throw error;
    }
  }
  
  // Apply gradient with error handling and IPC communication
  async applyGradient(gradientClass) {
    if (!gradientClass || !this.noteId) return;
    
    try {
      const gradients = [
        'gradient-1', 'gradient-2', 'gradient-3', 'gradient-4',
        'gradient-5', 'gradient-6', 'gradient-7', 'gradient-8',
        'gradient-9', 'gradient-10', 'gradient-11', 'gradient-12',
        'gradient-dark', 'gradient-light', 'gradient-gold', 'gradient-silver'
      ];
      
      // Validate gradient class
      if (!gradients.includes(gradientClass)) {
        console.warn('Invalid gradient class:', gradientClass);
        return;
      }
      
      // Remove all gradient classes
      gradients.forEach(g => {
        this.elements.stickyNote.classList.remove(g);
        this.elements.colorPicker.classList.remove(g);
      });
      
      // Add new gradient class
      this.elements.stickyNote.classList.add(gradientClass);
      this.elements.colorPicker.classList.add(gradientClass);
      
      // Save color preference via IPC
      await window.electronAPI.changeNoteColor(this.noteId, gradientClass);
      this.emit('colorChanged', { id: this.noteId, color: gradientClass });
      
      console.log(`Color changed to ${gradientClass}`);
    } catch (error) {
      console.error('Error applying gradient:', error);
      this.showNotification('Failed to change color', 'error');
    }
  }
  
  // Enhanced drag and drop functionality
  setupDragAndDrop() {
    const { noteHeader, noteContent } = this.elements;
    
    if (!noteHeader) {
      console.warn('Note header not found, drag functionality disabled');
      return;
    }
    
    noteHeader.addEventListener('mousedown', (e) => this.initiateDrag(e));
    
    // Enhanced text drag and drop within textarea
    noteContent.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    
    noteContent.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const text = e.dataTransfer.getData('text/plain');
      if (text) {
        this.insertTextAtCursor(text);
      }
    });
  }
  
  // Initiate drag operation
  initiateDrag(e) {
    // Only start drag if clicking on the draggable area (not buttons)
    if (e.target.closest('.note-controls') || e.target.closest('.note-actions')) {
      return;
    }
    
    this.isDragging = true;
    const rect = this.elements.stickyNote.getBoundingClientRect();
    this.dragOffset.x = e.clientX - rect.left;
    this.dragOffset.y = e.clientY - rect.top;
    
    document.addEventListener('mousemove', this.handleDrag.bind(this));
    document.addEventListener('mouseup', this.finishDrag.bind(this));
    
    // Visual feedback
    this.elements.stickyNote.style.transition = 'none';
    this.elements.stickyNote.style.cursor = 'grabbing';
    e.preventDefault();
  }
  
  // Handle drag movement
  async handleDrag(e) {
    if (!this.isDragging) return;
    
    try {
      const x = e.screenX - this.dragOffset.x;
      const y = e.screenY - this.dragOffset.y;
      
      // Update window position via Electron API
      await window.electronAPI.moveWindow(this.noteId, x, y);
    } catch (error) {
      console.error('Error moving window:', error);
    }
  }
  
  // Finish drag operation
  finishDrag() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.finishDrag);
    
    // Reset visual state
    this.elements.stickyNote.style.transition = '';
    this.elements.stickyNote.style.cursor = '';
  }
  
  // Setup resize functionality
  setupResize() {
    const resizeHandles = document.querySelectorAll('.resize-handle');
    resizeHandles.forEach(handle => {
      handle.addEventListener('mousedown', (e) => this.initResize(e));
    });
  }
  
  // Initialize resize operation
  initResize(e) {
    e.preventDefault();
    e.stopPropagation();
    
    this.isResizing = true;
    this.resizeDirection = e.target.dataset.direction;
    
    this.initialMousePos = { x: e.clientX, y: e.clientY };
    
    // Get current window size
    const rect = this.elements.stickyNote.getBoundingClientRect();
    this.initialSize = { width: rect.width, height: rect.height };
    
    document.addEventListener('mousemove', this.handleResize.bind(this));
    document.addEventListener('mouseup', this.finishResize.bind(this));
    
    // Visual feedback
    document.body.style.cursor = this.getResizeCursor(this.resizeDirection);
    this.elements.stickyNote.style.transition = 'none';
  }
  
  // Handle resize movement
  async handleResize(e) {
    if (!this.isResizing) return;
    
    try {
      const deltaX = e.clientX - this.initialMousePos.x;
      const deltaY = e.clientY - this.initialMousePos.y;
      
      let newWidth = this.initialSize.width;
      let newHeight = this.initialSize.height;
      
      // Calculate new dimensions based on resize direction
      switch (this.resizeDirection) {
        case 'se': // Southeast (bottom-right)
          newWidth = this.initialSize.width + deltaX;
          newHeight = this.initialSize.height + deltaY;
          break;
        case 's': // South (bottom)
          newHeight = this.initialSize.height + deltaY;
          break;
        case 'e': // East (right)
          newWidth = this.initialSize.width + deltaX;
          break;
      }
      
      // Apply size constraints
      const minWidth = 250;
      const minHeight = 200;
      const maxWidth = 800;
      const maxHeight = 600;
      
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      
      // Apply new size via Electron API
      await window.electronAPI.resizeWindow(this.noteId, newWidth, newHeight);
    } catch (error) {
      console.error('Error resizing window:', error);
    }
  }
  
  // Finish resize operation
  finishResize() {
    if (!this.isResizing) return;
    
    this.isResizing = false;
    this.resizeDirection = null;
    
    document.removeEventListener('mousemove', this.handleResize);
    document.removeEventListener('mouseup', this.finishResize);
    
    // Reset visual state
    document.body.style.cursor = '';
    this.elements.stickyNote.style.transition = '';
  }
  
  // Get appropriate cursor for resize direction
  getResizeCursor(direction) {
    const cursors = {
      'se': 'se-resize',
      's': 's-resize',
      'e': 'e-resize'
    };
    return cursors[direction] || 'default';
  }
  
  // Setup context menu
  setupContextMenu() {
    this.elements.noteContent.addEventListener('contextmenu', this.handleContextMenu);
    
    // Hide context menu on various events
    document.addEventListener('click', (e) => {
      if (this.contextMenu && !this.contextMenu.contains(e.target)) {
        this.hideContextMenu();
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideContextMenu();
      }
    });
    
    window.addEventListener('blur', () => this.hideContextMenu());
    window.addEventListener('resize', () => this.hideContextMenu());
  }
  
  // Handle context menu creation and display
  handleContextMenu(e) {
    e.preventDefault();
    this.showContextMenu(e.clientX, e.clientY);
  }
  
  // Show context menu at specified coordinates
  showContextMenu(x, y) {
    this.createContextMenu();
    
    // Position menu with screen bounds checking
    const menuRect = this.contextMenu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let menuX = x;
    let menuY = y;
    
    // Adjust if menu would go off-screen
    if (x + menuRect.width > windowWidth) {
      menuX = windowWidth - menuRect.width - 10;
    }
    if (y + menuRect.height > windowHeight) {
      menuY = windowHeight - menuRect.height - 10;
    }
    
    this.contextMenu.style.left = `${Math.max(10, menuX)}px`;
    this.contextMenu.style.top = `${Math.max(10, menuY)}px`;
    this.contextMenu.style.display = 'block';
    
    // Animate in
    this.contextMenu.style.opacity = '0';
    this.contextMenu.style.transform = 'scale(0.95)';
    requestAnimationFrame(() => {
      this.contextMenu.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
      this.contextMenu.style.opacity = '1';
      this.contextMenu.style.transform = 'scale(1)';
    });
  }
  
  // Create context menu HTML
  createContextMenu() {
    // Remove existing menu if present
    if (this.contextMenu) {
      this.contextMenu.remove();
    }
    
    this.contextMenu = document.createElement('div');
    this.contextMenu.className = 'context-menu';
    this.contextMenu.style.cssText = `
      position: fixed;
      background: rgba(30, 30, 30, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 6px 0;
      min-width: 150px;
      z-index: 10000;
      display: none;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      font-size: 13px;
    `;
    
    const menuItems = [
      {
        text: 'Cut',
        shortcut: 'Cmd+X',
        action: () => this.cutText(),
        enabled: () => this.getSelectedText().length > 0
      },
      {
        text: 'Copy',
        shortcut: 'Cmd+C', 
        action: () => this.copyText(),
        enabled: () => this.getSelectedText().length > 0
      },
      {
        text: 'Paste',
        shortcut: 'Cmd+V',
        action: () => this.pasteText(),
        enabled: () => true
      },
      { separator: true },
      {
        text: 'Select All',
        shortcut: 'Cmd+A',
        action: () => this.elements.noteContent.select(),
        enabled: () => this.elements.noteContent.value.length > 0
      },
      { separator: true },
      {
        text: 'New Note',
        shortcut: 'Cmd+N',
        action: () => this.createNewNote(),
        enabled: () => true
      },
      {
        text: 'Minimize',
        shortcut: 'Cmd+M',
        action: () => this.minimizeNote(),
        enabled: () => true
      },
      {
        text: 'Close Note',
        shortcut: 'Cmd+W',
        action: () => this.closeNote(),
        enabled: () => true
      }
    ];
    
    this.buildContextMenuItems(menuItems);
    document.body.appendChild(this.contextMenu);
  }
  
  // Build context menu items
  buildContextMenuItems(menuItems) {
    menuItems.forEach(item => {
      if (item.separator) {
        const separator = document.createElement('div');
        separator.style.cssText = `
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 4px 12px;
        `;
        this.contextMenu.appendChild(separator);
      } else {
        const menuItem = document.createElement('div');
        const isEnabled = item.enabled();
        
        menuItem.style.cssText = `
          padding: 8px 16px;
          color: ${isEnabled ? 'white' : 'rgba(255, 255, 255, 0.5)'};
          cursor: ${isEnabled ? 'pointer' : 'default'};
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background-color 0.1s ease;
        `;
        
        if (isEnabled) {
          menuItem.addEventListener('mouseenter', () => {
            menuItem.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          });
          
          menuItem.addEventListener('mouseleave', () => {
            menuItem.style.backgroundColor = 'transparent';
          });
          
          menuItem.addEventListener('click', async () => {
            try {
              await item.action();
              this.hideContextMenu();
            } catch (error) {
              console.error('Context menu action error:', error);
              this.showNotification(`Error: ${error.message}`, 'error');
            }
          });
        }
        
        menuItem.innerHTML = `
          <span>${item.text}</span>
          ${item.shortcut ? `<span style="opacity: 0.6; font-size: 11px;">${item.shortcut}</span>` : ''}
        `;
        
        this.contextMenu.appendChild(menuItem);
      }
    });
  }
  
  // Hide context menu
  hideContextMenu() {
    if (this.contextMenu) {
      this.contextMenu.style.opacity = '0';
      this.contextMenu.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (this.contextMenu) {
          this.contextMenu.remove();
          this.contextMenu = null;
        }
      }, 150);
    }
  }
  
  // Text manipulation methods
  getSelectedText() {
    if (document.activeElement === this.elements.noteContent) {
      return this.elements.noteContent.value.substring(
        this.elements.noteContent.selectionStart, 
        this.elements.noteContent.selectionEnd
      );
    }
    return window.getSelection().toString();
  }
  
  async cutText() {
    const selectedText = this.getSelectedText();
    if (selectedText) {
      await navigator.clipboard.writeText(selectedText);
      this.replaceSelectedText('');
    }
  }
  
  async copyText() {
    const selectedText = this.getSelectedText();
    if (selectedText) {
      await navigator.clipboard.writeText(selectedText);
    }
  }
  
  async pasteText() {
    try {
      const text = await navigator.clipboard.readText();
      this.replaceSelectedText(text);
    } catch (error) {
      console.error('Paste error:', error);
    }
  }
  
  replaceSelectedText(newText) {
    const textarea = this.elements.noteContent;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + newText.length;
    
    // Trigger input event for auto-save
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  insertTextAtCursor(text) {
    const textarea = this.elements.noteContent;
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(cursorPos);
    
    textarea.value = textBefore + text + textAfter;
    textarea.selectionStart = textarea.selectionEnd = cursorPos + text.length;
    
    // Trigger auto-save
    this.handleInput();
  }
  
  // Keyboard shortcut handling
  handleKeyboard(e) {
    const shortcuts = {
      save: { key: 's', modifiers: ['metaKey', 'ctrlKey'], action: () => this.handleSave(true) },
      newNote: { key: 'n', modifiers: ['metaKey', 'ctrlKey'], action: () => this.createNewNote() },
      closeNote: { key: 'w', modifiers: ['metaKey', 'ctrlKey'], action: () => this.closeNote() },
      minimize: { key: 'm', modifiers: ['metaKey', 'ctrlKey'], action: () => this.minimizeNote() },
      escape: { key: 'Escape', modifiers: [], action: () => {
        this.hideContextMenu();
        if (this.elements.colorDropdown.classList.contains('show')) {
          this.elements.colorDropdown.classList.remove('show');
        }
      }}
    };
    
    // Check each shortcut
    for (const [name, shortcut] of Object.entries(shortcuts)) {
      if (e.key === shortcut.key || e.code === shortcut.key) {
        const modifierMatch = shortcut.modifiers.length === 0 || 
          shortcut.modifiers.some(modifier => e[modifier]);
        
        if (modifierMatch) {
          e.preventDefault();
          try {
            shortcut.action();
          } catch (error) {
            console.error(`Error executing shortcut ${name}:`, error);
            this.showNotification(`Error: ${error.message}`, 'error');
          }
          return;
        }
      }
    }
  }
  
  // UI Helper methods
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 10px 16px;
      border-radius: 6px;
      color: white;
      font-size: 12px;
      z-index: 10000;
      transition: all 0.3s ease;
      background: ${type === 'error' ? '#ff5f57' : type === 'success' ? '#28ca42' : '#007aff'};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after duration
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
  
  showSaveIndicator() {
    if (this.elements.saveIndicator) {
      this.elements.saveIndicator.style.opacity = '1';
    }
  }
  
  hideSaveIndicator() {
    if (this.elements.saveIndicator) {
      setTimeout(() => {
        if (this.elements.saveIndicator) {
          this.elements.saveIndicator.style.opacity = '0';
        }
      }, 1000);
    }
  }
  
  updateLastModified() {
    if (!this.elements.lastModified) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    this.elements.lastModified.textContent = `Modified ${timeString}`;
  }
  
  // Event emitter methods
  emit(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    this.eventEmitter.dispatchEvent(event);
  }
  
  on(eventName, callback) {
    this.eventEmitter.addEventListener(eventName, callback);
  }
  
  off(eventName, callback) {
    this.eventEmitter.removeEventListener(eventName, callback);
  }
  
  // Cleanup method
  destroy() {
    // Clear timeouts
    clearTimeout(this.saveTimeout);
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyboard);
    window.removeEventListener('blur', this.handleSave);
    
    // Clear IPC listeners
    if (window.electronAPI && window.electronAPI.removeAllListeners) {
      window.electronAPI.removeAllListeners('init-note');
    }
    
    // Remove context menu
    this.hideContextMenu();
    
    console.log('StickyNote renderer destroyed');
  }
}

// Initialize the sticky note renderer
const stickyNoteRenderer = new StickyNoteRenderer();

// Make it available globally for debugging
if (process.env.NODE_ENV === 'development') {
  window.stickyNoteRenderer = stickyNoteRenderer;
}

// Update time every minute
setInterval(() => {
  if (stickyNoteRenderer.elements.lastModified) {
    stickyNoteRenderer.updateLastModified();
  }
}, 60000);

console.log('Enhanced StickyNote renderer script loaded');