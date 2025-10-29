// ================= RENDERER PROCESS =================
// Production-ready renderer for StickyNotes application

// ================= STATE MANAGEMENT =================

let noteId = null;
let saveTimeout = null;
let lastSavedContent = '';
let isDragging = false;
let isResizing = false;
let dragOffset = { x: 0, y: 0 };
let resizeStart = { x: 0, y: 0, width: 0, height: 0 };
let contextMenu = null;
let currentColor = 'gradient-1';
let currentFontSize = 14;
let isPinned = false;

// ================= DOM ELEMENTS =================

const elements = {
  noteContent: null,
  stickyNote: null,
  closeBtn: null,
  minimizeBtn: null,
  newBtn: null,
  colorPicker: null,
  colorDropdown: null,
  noteFooter: null,
  lastModified: null,
  saveIndicator: null,
  resizeHandles: null
};

// ================= INITIALIZATION =================

document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  setupEventListeners();
  setupKeyboardShortcuts();
  setupContextMenu();
  setupAutoSave();
  setupResizeObserver();
});

function initializeElements() {
  elements.noteContent = document.getElementById('noteContent');
  elements.stickyNote = document.getElementById('stickyNote');
  elements.closeBtn = document.getElementById('closeBtn');
  elements.minimizeBtn = document.getElementById('minimizeBtn');
  elements.newBtn = document.getElementById('newBtn');
  elements.colorPicker = document.getElementById('colorPicker');
  elements.colorDropdown = document.getElementById('colorDropdown');
  elements.noteFooter = document.getElementById('noteFooter');
  elements.lastModified = document.getElementById('lastModified');
  elements.saveIndicator = document.getElementById('saveIndicator');
  elements.resizeHandles = document.querySelectorAll('.resize-handle');
  
  // Create save indicator if not exists
  if (!elements.saveIndicator) {
    elements.saveIndicator = document.createElement('div');
    elements.saveIndicator.id = 'saveIndicator';
    elements.saveIndicator.className = 'save-indicator';
    elements.saveIndicator.textContent = 'Saved';
    elements.noteFooter.appendChild(elements.saveIndicator);
  }
}

// ================= IPC COMMUNICATION =================

// Initialize note with data from main process
if (window.electronAPI) {
  window.electronAPI.onInitNote((data) => {
    noteId = data.id;
    elements.noteContent.value = data.content || '';
    lastSavedContent = data.content || '';
    currentColor = data.color || 'gradient-1';
    currentFontSize = data.fontSize || 14;
    isPinned = data.isPinned || false;
    
    applyGradient(currentColor);
    applyFontSize(currentFontSize);
    updateLastModified(data.modified);
    
    // Focus content area
    elements.noteContent.focus();
  });
  
  // Handle window focus events
  window.electronAPI.onWindowFocused(() => {
    elements.stickyNote.classList.add('focused');
  });
  
  window.electronAPI.onWindowBlurred(() => {
    elements.stickyNote.classList.remove('focused');
    saveNote();
  });
  
  // Handle export/import events
  window.electronAPI.onExportNotes(() => {
    window.electronAPI.exportNotes();
  });
  
  window.electronAPI.onImportNotes(() => {
    window.electronAPI.importNotes();
  });
  
  // Handle pin toggle response
  window.electronAPI.onPinToggled((pinned) => {
    isPinned = pinned;
    updatePinIndicator();
  });
}

// ================= EVENT LISTENERS =================

function setupEventListeners() {
  // Button click handlers
  elements.closeBtn.addEventListener('click', handleClose);
  elements.minimizeBtn.addEventListener('click', handleMinimize);
  elements.newBtn.addEventListener('click', handleNewNote);
  
  // Color picker
  elements.colorPicker.addEventListener('click', toggleColorDropdown);
  
  // Color swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      const gradient = e.target.dataset.gradient;
      applyGradient(gradient);
      hideColorDropdown();
      saveColor(gradient);
    });
  });
  
  // Content changes
  elements.noteContent.addEventListener('input', handleContentChange);
  elements.noteContent.addEventListener('paste', handlePaste);
  
  // Drag and drop
  setupDragAndDrop();
  
  // Resize handles
  setupResizeHandles();
  
  // Click outside to close dropdowns
  document.addEventListener('click', (e) => {
    if (!elements.colorPicker.contains(e.target) && !elements.colorDropdown.contains(e.target)) {
      hideColorDropdown();
    }
  });
  
  // Prevent default context menu in some areas
  elements.stickyNote.addEventListener('contextmenu', (e) => {
    if (!elements.noteContent.contains(e.target)) {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY);
    }
  });
}

// ================= BUTTON HANDLERS =================

function handleClose() {
  if (hasUnsavedChanges()) {
    if (confirm('You have unsaved changes. Close anyway?')) {
      closeNote();
    }
  } else {
    closeNote();
  }
}

function closeNote() {
  if (window.electronAPI && noteId) {
    saveNote();
    window.electronAPI.closeNote(noteId);
  }
}

function handleMinimize() {
  if (window.electronAPI && noteId) {
    saveNote();
    window.electronAPI.minimizeNote(noteId);
  }
}

async function handleNewNote() {
  try {
    showNotification('Creating new note...', 'info');
    if (window.electronAPI) {
      const newNoteId = await window.electronAPI.createNewNote();
      if (newNoteId) {
        showNotification('New note created', 'success');
      }
    }
  } catch (error) {
    console.error('Error creating new note:', error);
    showNotification('Failed to create new note', 'error');
  }
}

// ================= COLOR MANAGEMENT =================

function toggleColorDropdown() {
  elements.colorDropdown.classList.toggle('show');
}

function hideColorDropdown() {
  elements.colorDropdown.classList.remove('show');
}

function applyGradient(gradientClass) {
  // Remove all gradient classes
  elements.stickyNote.className = elements.stickyNote.className
    .replace(/gradient-\w+/g, '')
    .trim();
  
  // Add new gradient class
  elements.stickyNote.classList.add('sticky-note', gradientClass);
  
  // Update color picker preview
  elements.colorPicker.className = `color-picker ${gradientClass}`;
  
  currentColor = gradientClass;
}

function saveColor(color) {
  if (window.electronAPI && noteId) {
    window.electronAPI.updateNoteColor(noteId, color);
  }
}

// ================= CONTENT MANAGEMENT =================

function handleContentChange() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveNote();
  }, 500);
  
  // Show typing indicator
  elements.saveIndicator.textContent = 'Typing...';
  elements.saveIndicator.style.opacity = '1';
}

function handlePaste(e) {
  e.preventDefault();
  
  // Get plain text from clipboard
  const text = (e.clipboardData || window.clipboardData).getData('text/plain');
  
  // Insert at cursor position
  const start = elements.noteContent.selectionStart;
  const end = elements.noteContent.selectionEnd;
  const value = elements.noteContent.value;
  
  elements.noteContent.value = value.substring(0, start) + text + value.substring(end);
  elements.noteContent.selectionStart = elements.noteContent.selectionEnd = start + text.length;
  
  handleContentChange();
}

function saveNote() {
  if (!noteId || !elements.noteContent) return;
  
  const content = elements.noteContent.value;
  if (content === lastSavedContent) return;
  
  if (window.electronAPI) {
    window.electronAPI.saveNoteContent(noteId, content);
    lastSavedContent = content;
    
    // Update save indicator
    elements.saveIndicator.textContent = 'Saved';
    elements.saveIndicator.style.opacity = '1';
    setTimeout(() => {
      elements.saveIndicator.style.opacity = '0';
    }, 2000);
    
    updateLastModified();
  }
}

function hasUnsavedChanges() {
  return elements.noteContent.value !== lastSavedContent;
}

// ================= AUTO-SAVE =================

function setupAutoSave() {
  // Save on window blur
  window.addEventListener('blur', () => {
    saveNote();
  });
  
  // Save before unload
  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges()) {
      saveNote();
      e.preventDefault();
      e.returnValue = '';
    }
  });
  
  // Periodic auto-save
  setInterval(() => {
    if (hasUnsavedChanges()) {
      saveNote();
    }
  }, 30000); // Every 30 seconds
}

// ================= DRAG AND DROP =================

function setupDragAndDrop() {
  const header = document.querySelector('.note-header');
  
  header.addEventListener('mousedown', (e) => {
    // Don't drag if clicking on buttons or color picker
    if (e.target.closest('.note-controls') || e.target.closest('.note-actions')) {
      return;
    }
    
    isDragging = true;
    dragOffset.x = e.clientX;
    dragOffset.y = e.clientY;
    
    elements.stickyNote.classList.add('dragging');
    document.body.style.cursor = 'move';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragOffset.x;
    const deltaY = e.clientY - dragOffset.y;
    
    // Move window (handled by Electron's -webkit-app-region: drag)
    // This is just for visual feedback
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      elements.stickyNote.classList.remove('dragging');
      document.body.style.cursor = '';
    }
  });
}

// ================= RESIZE FUNCTIONALITY =================

function setupResizeHandles() {
  elements.resizeHandles.forEach(handle => {
    handle.addEventListener('mousedown', startResize);
  });
  
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
}

function startResize(e) {
  isResizing = true;
  resizeStart.x = e.clientX;
  resizeStart.y = e.clientY;
  resizeStart.width = window.innerWidth;
  resizeStart.height = window.innerHeight;
  
  elements.stickyNote.classList.add('resizing');
  e.preventDefault();
}

function handleResize(e) {
  if (!isResizing) return;
  
  const deltaX = e.clientX - resizeStart.x;
  const deltaY = e.clientY - resizeStart.y;
  
  const handle = document.querySelector('.resizing');
  const direction = handle?.dataset?.direction;
  
  let newWidth = resizeStart.width;
  let newHeight = resizeStart.height;
  
  if (direction?.includes('e')) {
    newWidth = Math.max(200, Math.min(800, resizeStart.width + deltaX));
  }
  
  if (direction?.includes('s')) {
    newHeight = Math.max(200, Math.min(800, resizeStart.height + deltaY));
  }
  
  // Request window resize through IPC
  if (window.electronAPI && noteId) {
    window.electronAPI.resizeWindow(noteId, newWidth, newHeight);
  }
}

function stopResize() {
  if (isResizing) {
    isResizing = false;
    elements.stickyNote.classList.remove('resizing');
    saveNote();
  }
}

// ================= RESIZE OBSERVER =================

function setupResizeObserver() {
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      // Adjust textarea to fill available space
      const contentHeight = entry.contentRect.height;
      const headerHeight = 32;
      const footerHeight = 32;
      const padding = 32;
      
      const textareaHeight = contentHeight - headerHeight - footerHeight - padding;
      if (textareaHeight > 0) {
        elements.noteContent.style.height = `${textareaHeight}px`;
      }
    }
  });
  
  resizeObserver.observe(elements.stickyNote);
}

// ================= KEYBOARD SHORTCUTS =================

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;
    
    // Save (Cmd/Ctrl + S)
    if (modifier && e.key === 's') {
      e.preventDefault();
      saveNote();
      showNotification('Note saved', 'success');
    }
    
    // New Note (Cmd/Ctrl + N)
    if (modifier && e.key === 'n') {
      e.preventDefault();
      handleNewNote();
    }
    
    // Close (Cmd/Ctrl + W)
    if (modifier && e.key === 'w') {
      e.preventDefault();
      handleClose();
    }
    
    // Color shortcuts (Cmd/Ctrl + 1-9)
    if (modifier && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const colorIndex = parseInt(e.key) - 1;
      const swatches = document.querySelectorAll('.color-swatch');
      if (swatches[colorIndex]) {
        const gradient = swatches[colorIndex].dataset.gradient;
        applyGradient(gradient);
        saveColor(gradient);
      }
    }
    
    // Cycle colors (Cmd/Ctrl + C when not in textarea)
    if (modifier && e.key === 'c' && document.activeElement !== elements.noteContent) {
      e.preventDefault();
      cycleColors();
    }
    
    // Font size (Cmd/Ctrl + Plus/Minus)
    if (modifier && (e.key === '+' || e.key === '=')) {
      e.preventDefault();
      adjustFontSize(1);
    }
    
    if (modifier && e.key === '-') {
      e.preventDefault();
      adjustFontSize(-1);
    }
    
    // Toggle pin (Cmd/Ctrl + P)
    if (modifier && e.key === 'p') {
      e.preventDefault();
      togglePin();
    }
    
    // Focus content (Cmd/Ctrl + F)
    if (modifier && e.key === 'f' && document.activeElement !== elements.noteContent) {
      e.preventDefault();
      elements.noteContent.focus();
      elements.noteContent.select();
    }
  });
}

// ================= CONTEXT MENU =================

function setupContextMenu() {
  // Create context menu element
  contextMenu = document.createElement('div');
  contextMenu.className = 'context-menu';
  contextMenu.style.cssText = `
    position: fixed;
    background: rgba(30, 30, 30, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    padding: 8px 0;
    min-width: 180px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    display: none;
  `;
  
  const menuItems = [
    { label: 'Cut', shortcut: 'Cmd+X', action: () => document.execCommand('cut') },
    { label: 'Copy', shortcut: 'Cmd+C', action: () => document.execCommand('copy') },
    { label: 'Paste', shortcut: 'Cmd+V', action: () => document.execCommand('paste') },
    { type: 'separator' },
    { label: 'Select All', shortcut: 'Cmd+A', action: () => elements.noteContent.select() },
    { type: 'separator' },
    { label: 'New Note', shortcut: 'Cmd+N', action: handleNewNote },
    { label: 'Save', shortcut: 'Cmd+S', action: () => { saveNote(); showNotification('Saved', 'success'); } },
    { label: 'Close', shortcut: 'Cmd+W', action: handleClose },
    { type: 'separator' },
    { label: 'Pin Note', shortcut: 'Cmd+P', action: togglePin },
    { label: 'Change Color', action: () => elements.colorPicker.click() }
  ];
  
  menuItems.forEach(item => {
    if (item.type === 'separator') {
      const separator = document.createElement('div');
      separator.style.cssText = 'height: 1px; background: rgba(255,255,255,0.1); margin: 4px 0;';
      contextMenu.appendChild(separator);
    } else {
      const menuItem = document.createElement('div');
      menuItem.style.cssText = `
        padding: 8px 16px;
        color: white;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        transition: background 0.2s;
      `;
      menuItem.innerHTML = `
        <span>${item.label}</span>
        ${item.shortcut ? `<span style="opacity: 0.5; font-size: 11px;">${item.shortcut}</span>` : ''}
      `;
      menuItem.addEventListener('click', () => {
        item.action();
        hideContextMenu();
      });
      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.background = 'rgba(255, 255, 255, 0.1)';
      });
      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.background = '';
      });
      contextMenu.appendChild(menuItem);
    }
  });
  
  document.body.appendChild(contextMenu);
}

function showContextMenu(x, y) {
  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
  contextMenu.style.display = 'block';
  
  // Adjust position if menu goes off screen
  const rect = contextMenu.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    contextMenu.style.left = `${window.innerWidth - rect.width - 10}px`;
  }
  if (rect.bottom > window.innerHeight) {
    contextMenu.style.top = `${window.innerHeight - rect.height - 10}px`;
  }
  
  // Hide on next click
  setTimeout(() => {
    document.addEventListener('click', hideContextMenu, { once: true });
  }, 0);
}

function hideContextMenu() {
  if (contextMenu) {
    contextMenu.style.display = 'none';
  }
}

// ================= UTILITY FUNCTIONS =================

function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 40px;
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
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

function updateLastModified(dateString = null) {
  const date = dateString ? new Date(dateString) : new Date();
  const now = new Date();
  const diff = now - date;
  
  let text = '';
  if (diff < 60000) {
    text = 'Just now';
  } else if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    text = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    text = `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    text = date.toLocaleDateString();
  }
  
  if (elements.lastModified) {
    elements.lastModified.textContent = text;
  }
}

function cycleColors() {
  const swatches = Array.from(document.querySelectorAll('.color-swatch'));
  const currentIndex = swatches.findIndex(s => s.dataset.gradient === currentColor);
  const nextIndex = (currentIndex + 1) % swatches.length;
  const nextGradient = swatches[nextIndex].dataset.gradient;
  
  applyGradient(nextGradient);
  saveColor(nextGradient);
  showNotification('Color changed', 'info', 1000);
}

function adjustFontSize(delta) {
  currentFontSize = Math.max(10, Math.min(24, currentFontSize + delta));
  applyFontSize(currentFontSize);
  
  if (window.electronAPI && noteId) {
    window.electronAPI.updateFontSize(noteId, currentFontSize);
  }
  
  showNotification(`Font size: ${currentFontSize}px`, 'info', 1000);
}

function applyFontSize(size) {
  elements.noteContent.style.fontSize = `${size}px`;
  currentFontSize = size;
}

function togglePin() {
  if (window.electronAPI && noteId) {
    window.electronAPI.togglePin(noteId);
    isPinned = !isPinned;
    updatePinIndicator();
    showNotification(isPinned ? 'Note pinned' : 'Note unpinned', 'info', 1000);
  }
}

function updatePinIndicator() {
  // Add visual indicator for pinned state
  if (isPinned) {
    elements.stickyNote.classList.add('pinned');
  } else {
    elements.stickyNote.classList.remove('pinned');
  }
}

// ================= PERFORMANCE OPTIMIZATION =================

// Throttle function for performance
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ================= ERROR HANDLING =================

window.addEventListener('error', (event) => {
  console.error('Renderer error:', event.error);
  showNotification('An error occurred', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});