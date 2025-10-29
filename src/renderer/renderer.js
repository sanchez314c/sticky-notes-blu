// Renderer process script for sticky notes
let noteId = null;
let saveTimeout = null;
let lastSavedContent = '';

// DOM elements
const noteContent = document.getElementById('noteContent');
const stickyNote = document.getElementById('stickyNote');
const closeBtn = document.getElementById('closeBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const newBtn = document.getElementById('newBtn');
const colorPicker = document.getElementById('colorPicker');
const colorDropdown = document.getElementById('colorDropdown');
const noteFooter = document.getElementById('noteFooter');
const lastModified = document.getElementById('lastModified');

// Initialize note with data from main process
window.electronAPI.onInitNote((data) => {
  noteId = data.id;
  noteContent.value = data.content || '';
  lastSavedContent = data.content || '';
  
  // Set initial color
  if (data.color) {
    applyGradient(data.color);
  }
  
  updateLastModified();
});

// Notification system for user feedback
function showNotification(message, type = 'info', duration = 3000) {
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

// Enhanced auto-save functionality with comprehensive error handling and retry mechanism
function autoSave() {
  if (!noteId || !noteContent) {
    console.warn('Auto-save failed: Missing noteId or noteContent');
    return;
  }
  
  const currentContent = noteContent.value;
  if (currentContent === lastSavedContent) return;
  
  // Client-side validation before saving
  if (window.clientValidator && !window.clientValidator.isContentSafe(currentContent)) {
    showNotification('Content contains unsafe elements and cannot be saved', 'error');
    return;
  }
  
  try {
    window.electronAPI.saveNoteContent(noteId, currentContent);
    lastSavedContent = currentContent;
    updateLastModified();
    
    // Enhanced save indicator with animation
    const saveIndicator = document.getElementById('saveIndicator');
    if (saveIndicator) {
      saveIndicator.style.opacity = '1';
      saveIndicator.style.transform = 'scale(1.1)';
      saveIndicator.textContent = 'Saved';
      
      setTimeout(() => {
        saveIndicator.style.transform = 'scale(1)';
      }, 200);
      
      setTimeout(() => {
        saveIndicator.style.opacity = '0';
      }, 2000);
    }
    
    // Visual feedback on textarea
    noteContent.style.borderColor = '#28ca42';
    setTimeout(() => {
      noteContent.style.borderColor = '';
    }, 1000);
    
  } catch (error) {
    console.error('Auto-save error:', error);
    showNotification('Failed to save changes: ' + error.message, 'error');
    
    // Retry mechanism
    setTimeout(() => {
      console.log('Retrying auto-save...');
      autoSave();
    }, 2000);
    
    // Visual feedback for error
    noteContent.style.borderColor = '#ff5f57';
    setTimeout(() => {
      noteContent.style.borderColor = '';
    }, 2000);
  }
}

// Manual save function for explicit save operations
function forceSave() {
  if (!noteId || !noteContent) return false;
  
  const currentContent = noteContent.value;
  
  try {
    // Show saving indicator
    showNotification('Saving...', 'info', 1000);
    
    window.electronAPI.saveNoteContent(noteId, currentContent);
    lastSavedContent = currentContent;
    updateLastModified();
    
    showNotification('Note saved successfully', 'success', 2000);
    return true;
  } catch (error) {
    console.error('Force save error:', error);
    showNotification('Failed to save note: ' + error.message, 'error');
    return false;
  }
}

// Update last modified time
function updateLastModified() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  lastModified.textContent = `Modified ${timeString}`;
}

// Apply gradient to note
function applyGradient(gradientClass) {
  // Remove all gradient classes
  const gradients = [
    'gradient-1', 'gradient-2', 'gradient-3', 'gradient-4',
    'gradient-5', 'gradient-6', 'gradient-7', 'gradient-8',
    'gradient-9', 'gradient-10', 'gradient-11', 'gradient-12',
    'gradient-dark', 'gradient-light', 'gradient-gold', 'gradient-silver'
  ];
  
  gradients.forEach(g => stickyNote.classList.remove(g));
  colorPicker.classList.remove(...gradients);
  
  // Add new gradient class
  stickyNote.classList.add(gradientClass);
  colorPicker.classList.add(gradientClass);
  
  // Save color preference
  window.electronAPI.changeNoteColor(noteId, gradientClass);
  
  // Show notification for color change
  showNotification(`Color changed to ${gradientClass.replace('-', ' ')}`, 'info', 1500);
}

// Cycle through gradient colors
function cycleToNextColor() {
  const gradients = [
    'gradient-1', 'gradient-2', 'gradient-3', 'gradient-4',
    'gradient-5', 'gradient-6', 'gradient-7', 'gradient-8',
    'gradient-9', 'gradient-10', 'gradient-11', 'gradient-12',
    'gradient-dark', 'gradient-light', 'gradient-gold', 'gradient-silver'
  ];
  
  // Find current gradient
  let currentIndex = 0;
  for (let i = 0; i < gradients.length; i++) {
    if (stickyNote.classList.contains(gradients[i])) {
      currentIndex = i;
      break;
    }
  }
  
  // Move to next gradient (cycling back to start if at end)
  const nextIndex = (currentIndex + 1) % gradients.length;
  applyGradient(gradients[nextIndex]);
}

// Event listeners
noteContent.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(autoSave, 500); // Auto-save after 500ms of inactivity
});

// Enhanced button click handlers with comprehensive error handling and improved visual feedback
closeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  
  try {
    // Enhanced visual feedback with animation
    closeBtn.style.transform = 'scale(0.95)';
    closeBtn.style.opacity = '0.8';
    setTimeout(() => {
      closeBtn.style.transform = '';
      closeBtn.style.opacity = '';
    }, 150);
    
    // Force save content before closing with confirmation
    if (noteId && noteContent.value !== lastSavedContent) {
      window.electronAPI.saveNoteContent(noteId, noteContent.value);
      showNotification('Note saved before closing', 'success', 1500);
    }
    
    // Fade out animation before close
    stickyNote.style.opacity = '0.5';
    stickyNote.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      window.electronAPI.closeNote(noteId);
    }, 200);
  } catch (error) {
    console.error('Error closing note:', error);
    showNotification('Error closing note: ' + error.message, 'error');
    
    // Reset visual state on error
    closeBtn.style.transform = '';
    closeBtn.style.opacity = '';
    stickyNote.style.opacity = '';
    stickyNote.style.transform = '';
  }
});

minimizeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  
  try {
    // Enhanced visual feedback
    minimizeBtn.style.transform = 'scale(0.95)';
    minimizeBtn.style.opacity = '0.8';
    setTimeout(() => {
      minimizeBtn.style.transform = '';
      minimizeBtn.style.opacity = '';
    }, 150);
    
    if (noteId) {
      // Save before minimizing
      if (noteContent.value !== lastSavedContent) {
        window.electronAPI.saveNoteContent(noteId, noteContent.value);
      }
      
      // Shrink animation before minimize
      stickyNote.style.transition = 'transform 0.2s ease-out';
      stickyNote.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        window.electronAPI.minimizeNote(noteId);
        stickyNote.style.transition = '';
        stickyNote.style.transform = '';
      }, 200);
    } else {
      showNotification('No note ID available', 'error');
    }
  } catch (error) {
    console.error('Error minimizing note:', error);
    showNotification('Error minimizing note: ' + error.message, 'error');
    
    // Reset visual state on error
    minimizeBtn.style.transform = '';
    minimizeBtn.style.opacity = '';
    stickyNote.style.transition = '';
    stickyNote.style.transform = '';
  }
});

newBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  
  try {
    // Enhanced visual feedback with pulse animation
    newBtn.style.transform = 'scale(0.95)';
    newBtn.style.opacity = '0.8';
    setTimeout(() => {
      newBtn.style.transform = '';
      newBtn.style.opacity = '';
    }, 150);
    
    // Save current note before creating new one
    if (noteId && noteContent.value !== lastSavedContent) {
      window.electronAPI.saveNoteContent(noteId, noteContent.value);
    }
    
    window.electronAPI.createNewNote();
    showNotification('Creating new note...', 'info', 2000);
  } catch (error) {
    console.error('Error creating new note:', error);
    showNotification('Error creating new note: ' + error.message, 'error');
    
    // Reset visual state on error
    newBtn.style.transform = '';
    newBtn.style.opacity = '';
  }
});

// Color picker functionality
colorPicker.addEventListener('click', (e) => {
  e.stopPropagation();
  colorDropdown.classList.toggle('show');
});

// Close color dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!colorDropdown.contains(e.target) && e.target !== colorPicker) {
    colorDropdown.classList.remove('show');
  }
});

// Color swatch selection
colorDropdown.addEventListener('click', (e) => {
  if (e.target.classList.contains('color-swatch')) {
    const gradientClass = e.target.dataset.gradient;
    applyGradient(gradientClass);
    colorDropdown.classList.remove('show');
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Cmd/Ctrl + S to save immediately
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    autoSave();
  }
  
  // Cmd/Ctrl + N for new note
  if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
    e.preventDefault();
    window.electronAPI.createNewNote();
  }
  
  // Cmd/Ctrl + W to close note
  if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
    e.preventDefault();
    if (noteContent.value !== lastSavedContent) {
      window.electronAPI.saveNoteContent(noteId, noteContent.value);
    }
    window.electronAPI.closeNote(noteId);
  }
  
  // Escape to close color dropdown
  if (e.key === 'Escape') {
    colorDropdown.classList.remove('show');
  }
});

// Save on window blur (when user switches to another app)
window.addEventListener('blur', () => {
  if (noteContent.value !== lastSavedContent) {
    autoSave();
  }
});

// Enhanced drag and drop functionality with improved error handling and visual feedback
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let dragStartPos = { x: 0, y: 0 };
let dragThreshold = 5; // Minimum distance to start drag

// Drag functionality for the note header
const noteHeader = document.querySelector('.note-header');
if (noteHeader) {
  noteHeader.addEventListener('mousedown', initiateDrag);
}

function initiateDrag(e) {
  // Only start drag if clicking on the draggable area (not buttons)
  if (e.target.closest('.note-controls') || e.target.closest('.note-actions')) {
    return;
  }
  
  // Prevent text selection while dragging
  e.preventDefault();
  
  // Store initial position for threshold check
  dragStartPos.x = e.clientX;
  dragStartPos.y = e.clientY;
  
  const rect = stickyNote.getBoundingClientRect();
  dragOffset.x = e.clientX - rect.left;
  dragOffset.y = e.clientY - rect.top;
  
  // Add temporary listeners to detect actual drag
  document.addEventListener('mousemove', checkDragThreshold);
  document.addEventListener('mouseup', cancelDragInit);
}

function checkDragThreshold(e) {
  const deltaX = Math.abs(e.clientX - dragStartPos.x);
  const deltaY = Math.abs(e.clientY - dragStartPos.y);
  
  if (deltaX > dragThreshold || deltaY > dragThreshold) {
    // Start actual drag
    startDrag(e);
  }
}

function startDrag(e) {
  isDragging = true;
  
  // Remove threshold listeners and add drag listeners
  document.removeEventListener('mousemove', checkDragThreshold);
  document.removeEventListener('mouseup', cancelDragInit);
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', finishDrag);
  
  // Visual feedback
  stickyNote.style.transition = 'none';
  stickyNote.style.cursor = 'grabbing';
  stickyNote.style.opacity = '0.9';
  stickyNote.style.zIndex = '10000';
  
  // Add dragging class for additional styling
  stickyNote.classList.add('dragging');
  
  // Prevent text selection during drag
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
}

function handleDrag(e) {
  if (!isDragging) return;
  
  try {
    const x = e.screenX - dragOffset.x;
    const y = e.screenY - dragOffset.y;
    
    // Validate coordinates
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
      console.warn('Invalid drag coordinates:', x, y);
      return;
    }
    
    // Update window position via Electron API with error handling
    if (window.electronAPI && window.electronAPI.moveWindow && noteId) {
      window.electronAPI.moveWindow(noteId, x, y);
    } else {
      console.warn('Cannot move window: Missing electronAPI or noteId');
    }
  } catch (error) {
    console.error('Error during drag:', error);
    finishDrag(); // Stop dragging on error
  }
}

function finishDrag() {
  if (!isDragging) return;
  
  isDragging = false;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', finishDrag);
  
  // Reset visual state
  stickyNote.style.transition = '';
  stickyNote.style.cursor = '';
  stickyNote.style.opacity = '';
  stickyNote.style.zIndex = '';
  stickyNote.classList.remove('dragging');
  
  // Re-enable text selection
  document.body.style.userSelect = '';
  document.body.style.webkitUserSelect = '';
  
  // Auto-save after moving
  setTimeout(() => {
    if (noteContent.value !== lastSavedContent) {
      autoSave();
    }
  }, 500);
}

function cancelDragInit() {
  // Clean up if drag was cancelled before threshold
  document.removeEventListener('mousemove', checkDragThreshold);
  document.removeEventListener('mouseup', cancelDragInit);
}

// Prevent default drag behavior for the textarea
noteContent.addEventListener('dragstart', (e) => {
  if (e.target === noteContent) {
    e.preventDefault();
  }
});

// Text selection drag and drop within textarea
let isTextDragging = false;

noteContent.addEventListener('mousedown', (e) => {
  // Allow text selection but prevent note dragging when interacting with textarea
  e.stopPropagation();
});

// Enhanced text drag and drop within the textarea
noteContent.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

noteContent.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  // Handle text drop
  const text = e.dataTransfer.getData('text/plain');
  if (text) {
    const cursorPos = noteContent.selectionStart;
    const textBefore = noteContent.value.substring(0, cursorPos);
    const textAfter = noteContent.value.substring(cursorPos);
    
    noteContent.value = textBefore + text + textAfter;
    noteContent.selectionStart = noteContent.selectionEnd = cursorPos + text.length;
    
    // Trigger auto-save
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(autoSave, 500);
  }
});

// Auto-focus on the textarea when the window is focused
window.addEventListener('focus', () => {
  noteContent.focus();
});

// Initial focus
noteContent.focus();

// Update time every minute
setInterval(updateLastModified, 60000);

// Enhanced Context Menu Implementation with modern clipboard API
let contextMenu = null;
let contextMenuTimeout = null;

function createContextMenu() {
  // Remove existing menu if present
  if (contextMenu) {
    contextMenu.remove();
  }
  
  contextMenu = document.createElement('div');
  contextMenu.className = 'context-menu';
  contextMenu.style.cssText = `
    position: fixed;
    background: rgba(30, 30, 30, 0.96);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 8px 0;
    min-width: 180px;
    z-index: 10000;
    display: none;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: contextMenuFadeIn 0.15s ease-out;
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes contextMenuFadeIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-5px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
  
  const menuItems = [
    {
      text: 'Cut',
      icon: '✂️',
      shortcut: 'Cmd+X',
      action: () => handleCut(),
      enabled: () => getSelectedText().length > 0
    },
    {
      text: 'Copy',
      icon: '📋',
      shortcut: 'Cmd+C', 
      action: () => handleCopy(),
      enabled: () => getSelectedText().length > 0
    },
    {
      text: 'Paste',
      icon: '📄',
      shortcut: 'Cmd+V',
      action: () => handlePaste(),
      enabled: () => true
    },
    { separator: true },
    {
      text: 'Select All',
      icon: '🔘',
      shortcut: 'Cmd+A',
      action: () => noteContent.select(),
      enabled: () => noteContent.value.length > 0
    },
    {
      text: 'Clear All',
      icon: '🗑️',
      shortcut: '',
      action: () => handleClearAll(),
      enabled: () => noteContent.value.length > 0
    },
    { separator: true },
    {
      text: 'Save Note',
      icon: '💾',
      shortcut: 'Cmd+S',
      action: () => forceSave(),
      enabled: () => noteContent.value !== lastSavedContent
    },
    { separator: true },
    {
      text: 'New Note',
      icon: '➕',
      shortcut: 'Cmd+N',
      action: () => {
        try {
          window.electronAPI.createNewNote();
        } catch (error) {
          console.error('Error creating new note:', error);
          showNotification('Failed to create new note', 'error');
        }
      },
      enabled: () => true
    },
    {
      text: 'Minimize',
      icon: '🔽',
      shortcut: 'Cmd+M',
      action: () => {
        try {
          window.electronAPI.minimizeNote(noteId);
        } catch (error) {
          console.error('Error minimizing note:', error);
          showNotification('Failed to minimize note', 'error');
        }
      },
      enabled: () => true
    },
    {
      text: 'Close Note',
      icon: '❌',
      shortcut: 'Cmd+W',
      action: () => {
        try {
          if (noteContent.value !== lastSavedContent) {
            forceSave();
            setTimeout(() => {
              window.electronAPI.closeNote(noteId);
            }, 500);
          } else {
            window.electronAPI.closeNote(noteId);
          }
        } catch (error) {
          console.error('Error closing note:', error);
          showNotification('Failed to close note', 'error');
        }
      },
      enabled: () => true
    }
  ];
  
  menuItems.forEach(item => {
    if (item.separator) {
      const separator = document.createElement('div');
      separator.style.cssText = `
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
        margin: 4px 12px;
      `;
      contextMenu.appendChild(separator);
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
        
        menuItem.addEventListener('click', () => {
          item.action();
          hideContextMenu();
        });
      }
      
      menuItem.innerHTML = `
        <span>${item.text}</span>
        ${item.shortcut ? `<span style="opacity: 0.6; font-size: 11px;">${item.shortcut}</span>` : ''}
      `;
      
      contextMenu.appendChild(menuItem);
    }
  });
  
  document.body.appendChild(contextMenu);
}

function showContextMenu(x, y) {
  createContextMenu();
  
  // Position menu with screen bounds checking
  const menuRect = contextMenu.getBoundingClientRect();
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
  
  contextMenu.style.left = `${Math.max(10, menuX)}px`;
  contextMenu.style.top = `${Math.max(10, menuY)}px`;
  contextMenu.style.display = 'block';
  
  // Animate in
  contextMenu.style.opacity = '0';
  contextMenu.style.transform = 'scale(0.95)';
  requestAnimationFrame(() => {
    contextMenu.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    contextMenu.style.opacity = '1';
    contextMenu.style.transform = 'scale(1)';
  });
}

function hideContextMenu() {
  if (contextMenu) {
    contextMenu.style.opacity = '0';
    contextMenu.style.transform = 'scale(0.95)';
    setTimeout(() => {
      if (contextMenu) {
        contextMenu.remove();
        contextMenu = null;
      }
    }, 150);
  }
}

function getSelectedText() {
  if (document.activeElement === noteContent) {
    return noteContent.value.substring(noteContent.selectionStart, noteContent.selectionEnd);
  }
  return window.getSelection().toString();
}

// Enhanced clipboard handlers using modern Clipboard API with fallbacks
async function handleCut() {
  try {
    const selectedText = getSelectedText();
    if (!selectedText) {
      showNotification('No text selected to cut', 'info');
      return;
    }
    
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(selectedText);
    } else {
      // Fallback to execCommand
      document.execCommand('cut');
    }
    
    // Remove selected text from textarea
    const start = noteContent.selectionStart;
    const end = noteContent.selectionEnd;
    const currentValue = noteContent.value;
    noteContent.value = currentValue.slice(0, start) + currentValue.slice(end);
    noteContent.setSelectionRange(start, start);
    
    // Trigger auto-save
    setTimeout(autoSave, 100);
    showNotification('Text cut to clipboard', 'success', 1500);
  } catch (error) {
    console.error('Error cutting text:', error);
    showNotification('Failed to cut text', 'error');
  }
}

async function handleCopy() {
  try {
    const selectedText = getSelectedText();
    if (!selectedText) {
      showNotification('No text selected to copy', 'info');
      return;
    }
    
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(selectedText);
    } else {
      // Fallback to execCommand
      document.execCommand('copy');
    }
    
    showNotification('Text copied to clipboard', 'success', 1500);
  } catch (error) {
    console.error('Error copying text:', error);
    showNotification('Failed to copy text', 'error');
  }
}

async function handlePaste() {
  try {
    let textToPaste = '';
    
    if (navigator.clipboard) {
      textToPaste = await navigator.clipboard.readText();
    } else {
      // Fallback - let browser handle it
      document.execCommand('paste');
      return;
    }
    
    if (!textToPaste) {
      showNotification('Clipboard is empty', 'info');
      return;
    }
    
    // Sanitize the pasted content if client validator is available
    if (window.clientValidator) {
      textToPaste = window.clientValidator.sanitizeNoteContent(textToPaste);
    }
    
    // Insert at current cursor position
    const start = noteContent.selectionStart;
    const end = noteContent.selectionEnd;
    const currentValue = noteContent.value;
    noteContent.value = currentValue.slice(0, start) + textToPaste + currentValue.slice(end);
    noteContent.setSelectionRange(start + textToPaste.length, start + textToPaste.length);
    
    // Trigger auto-save
    setTimeout(autoSave, 100);
    showNotification('Text pasted from clipboard', 'success', 1500);
  } catch (error) {
    console.error('Error pasting text:', error);
    showNotification('Failed to paste text', 'error');
  }
}

function handleClearAll() {
  if (noteContent.value.length === 0) {
    showNotification('Note is already empty', 'info');
    return;
  }
  
  if (confirm('Are you sure you want to clear all content? This cannot be undone.')) {
    noteContent.value = '';
    noteContent.focus();
    setTimeout(autoSave, 100);
    showNotification('Note content cleared', 'success');
  }
}

// Context menu event listeners
noteContent.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  showContextMenu(e.clientX, e.clientY);
});

// Hide context menu on various events
document.addEventListener('click', (e) => {
  if (contextMenu && !contextMenu.contains(e.target)) {
    hideContextMenu();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideContextMenu();
  }
});

window.addEventListener('blur', hideContextMenu);
window.addEventListener('resize', hideContextMenu);

// Enhanced Resize Functionality with improved error handling and smooth performance
let isResizing = false;
let resizeDirection = null;
let initialMousePos = { x: 0, y: 0 };
let initialSize = { width: 0, height: 0 };
let resizeThrottleTimeout = null;

// Setup resize handles with improved event handling
const resizeHandles = document.querySelectorAll('.resize-handle');
resizeHandles.forEach(handle => {
  handle.addEventListener('mousedown', initResize);
  
  // Add hover effects for better UX
  handle.addEventListener('mouseenter', () => {
    if (!isResizing) {
      handle.style.opacity = '1';
      document.body.style.cursor = getResizeCursor(handle.dataset.direction);
    }
  });
  
  handle.addEventListener('mouseleave', () => {
    if (!isResizing) {
      handle.style.opacity = '';
      document.body.style.cursor = '';
    }
  });
});

function initResize(e) {
  e.preventDefault();
  e.stopPropagation();
  
  // Prevent resize during drag operation
  if (isDragging) return;
  
  isResizing = true;
  resizeDirection = e.target.dataset.direction;
  
  initialMousePos.x = e.clientX;
  initialMousePos.y = e.clientY;
  
  // Get current window size from the sticky note element
  const rect = stickyNote.getBoundingClientRect();
  initialSize.width = rect.width;
  initialSize.height = rect.height;
  
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', finishResize);
  
  // Enhanced visual feedback
  document.body.style.cursor = getResizeCursor(resizeDirection);
  stickyNote.style.transition = 'none';
  stickyNote.classList.add('resizing');
  
  // Prevent text selection during resize
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
}

function handleResize(e) {
  if (!isResizing) return;
  
  // Throttle resize operations for better performance (60fps)
  if (resizeThrottleTimeout) return;
  
  resizeThrottleTimeout = setTimeout(() => {
    resizeThrottleTimeout = null;
    performResize(e);
  }, 16);
}

function performResize(e) {
  try {
    const deltaX = e.clientX - initialMousePos.x;
    const deltaY = e.clientY - initialMousePos.y;
    
    let newWidth = initialSize.width;
    let newHeight = initialSize.height;
    
    // Calculate new dimensions based on resize direction
    switch (resizeDirection) {
      case 'se': // Southeast (bottom-right)
        newWidth = initialSize.width + deltaX;
        newHeight = initialSize.height + deltaY;
        break;
      case 's': // South (bottom)
        newHeight = initialSize.height + deltaY;
        break;
      case 'e': // East (right)
        newWidth = initialSize.width + deltaX;
        break;
    }
    
    // Apply improved size constraints
    const minWidth = 280;
    const minHeight = 220;
    const maxWidth = Math.min(1200, window.screen.width * 0.8);
    const maxHeight = Math.min(800, window.screen.height * 0.8);
    
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
    
    // Apply new size via Electron API with error handling
    if (window.electronAPI && window.electronAPI.resizeWindow && noteId) {
      window.electronAPI.resizeWindow(noteId, Math.round(newWidth), Math.round(newHeight));
    } else {
      console.warn('Cannot resize: Missing API, method, or noteId');
    }
  } catch (error) {
    console.error('Error during resize:', error);
    finishResize();
  }
}

function finishResize() {
  if (!isResizing) return;
  
  isResizing = false;
  resizeDirection = null;
  
  // Clear any pending resize operations
  if (resizeThrottleTimeout) {
    clearTimeout(resizeThrottleTimeout);
    resizeThrottleTimeout = null;
  }
  
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', finishResize);
  
  // Reset visual state
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
  document.body.style.webkitUserSelect = '';
  stickyNote.style.transition = '';
  stickyNote.classList.remove('resizing');
  
  // Auto-save after resize
  setTimeout(() => {
    if (noteContent.value !== lastSavedContent) {
      autoSave();
    }
  }, 500);
}

function getResizeCursor(direction) {
  const cursors = {
    'se': 'se-resize',
    's': 's-resize',
    'e': 'e-resize',
    'sw': 'sw-resize',
    'ne': 'ne-resize',
    'nw': 'nw-resize',
    'n': 'n-resize',
    'w': 'w-resize'
  };
  return cursors[direction] || 'default';
}

// Enhanced keyboard shortcuts with better organization
const keyboardShortcuts = {
  save: { key: 's', modifiers: ['metaKey', 'ctrlKey'], action: () => {
    autoSave();
    showNotification('Note saved', 'success', 1500);
  }},
  newNote: { key: 'n', modifiers: ['metaKey', 'ctrlKey'], action: () => window.electronAPI.createNewNote() },
  closeNote: { key: 'w', modifiers: ['metaKey', 'ctrlKey'], action: () => {
    if (noteContent.value !== lastSavedContent) {
      window.electronAPI.saveNoteContent(noteId, noteContent.value);
    }
    window.electronAPI.closeNote(noteId);
  }},
  minimize: { key: 'm', modifiers: ['metaKey', 'ctrlKey'], action: () => window.electronAPI.minimizeNote(noteId) },
  
  // Text formatting shortcuts
  selectAll: { key: 'a', modifiers: ['metaKey', 'ctrlKey'], action: () => noteContent.select() },
  
  // Color cycling shortcuts
  cycleColor: { key: 'c', modifiers: ['metaKey', 'ctrlKey'], action: () => cycleToNextColor() },
  
  // Quick color shortcuts (numbers 1-9)
  color1: { key: '1', modifiers: ['metaKey', 'ctrlKey'], action: () => applyGradient('gradient-1') },
  color2: { key: '2', modifiers: ['metaKey', 'ctrlKey'], action: () => applyGradient('gradient-2') },
  color3: { key: '3', modifiers: ['metaKey', 'ctrlKey'], action: () => applyGradient('gradient-3') },
  color4: { key: '4', modifiers: ['metaKey', 'ctrlKey'], action: () => applyGradient('gradient-4') },
  color5: { key: '5', modifiers: ['metaKey', 'ctrlKey'], action: () => applyGradient('gradient-5') },
  color6: { key: '6', modifiers: ['metaKey', 'ctrlKey'], action: () => applyGradient('gradient-6') },
  color7: { key: '7', modifiers: ['metaKey', 'ctrlKey'], action: () => applyGradient('gradient-7') },
  color8: { key: '8', modifiers: ['metaKey', 'ctrlKey'], action: () => applyGradient('gradient-8') },
  color9: { key: '9', modifiers: ['metaKey', 'ctrlKey'], action: () => applyGradient('gradient-9') },
  
  // Special color shortcuts
  colorDark: { key: 'd', modifiers: ['metaKey', 'ctrlKey'], action: () => applyGradient('gradient-dark') },
  colorLight: { key: 'l', modifiers: ['metaKey', 'ctrlKey'], action: () => applyGradient('gradient-light') },
  
  // Utility shortcuts
  escape: { key: 'Escape', modifiers: [], action: () => {
    hideContextMenu();
    if (colorDropdown.classList.contains('show')) {
      colorDropdown.classList.remove('show');
    }
  }},
  
  // Focus shortcuts
  focusContent: { key: 'f', modifiers: ['metaKey', 'ctrlKey'], action: () => noteContent.focus() }
};

// Replace existing keyboard event listener
document.removeEventListener('keydown', handleKeyboardShortcuts);

function handleKeyboardShortcuts(e) {
  // Check each shortcut
  for (const [name, shortcut] of Object.entries(keyboardShortcuts)) {
    if (e.key === shortcut.key || e.code === shortcut.key) {
      const modifierMatch = shortcut.modifiers.length === 0 || 
        shortcut.modifiers.some(modifier => e[modifier]);
      
      if (modifierMatch) {
        e.preventDefault();
        try {
          shortcut.action();
        } catch (error) {
          console.error(`Error executing shortcut ${name}:`, error);
          showNotification(`Error: ${error.message}`, 'error');
        }
        return;
      }
    }
  }
}

document.addEventListener('keydown', handleKeyboardShortcuts);

// Additional utility functions for enhanced UI interactions

// Color cycling function
function cycleToNextColor() {
  const gradients = [
    'gradient-1', 'gradient-2', 'gradient-3', 'gradient-4',
    'gradient-5', 'gradient-6', 'gradient-7', 'gradient-8',
    'gradient-9', 'gradient-10', 'gradient-11', 'gradient-12',
    'gradient-dark', 'gradient-light', 'gradient-gold', 'gradient-silver'
  ];
  
  const currentClass = stickyNote.className.split(' ').find(cls => cls.startsWith('gradient-'));
  const currentIndex = gradients.indexOf(currentClass);
  const nextIndex = (currentIndex + 1) % gradients.length;
  
  applyGradient(gradients[nextIndex]);
  showNotification(`Switched to ${gradients[nextIndex]}`, 'info', 1000);
}

// Enhanced window state management
function toggleFullscreen() {
  try {
    if (window.electronAPI && window.electronAPI.toggleFullscreen && noteId) {
      window.electronAPI.toggleFullscreen(noteId);
    }
  } catch (error) {
    console.error('Error toggling fullscreen:', error);
    showNotification('Cannot toggle fullscreen', 'error');
  }
}

// Text statistics function
function getTextStats() {
  const content = noteContent.value;
  const stats = {
    characters: content.length,
    charactersNoSpaces: content.replace(/\s/g, '').length,
    words: content.trim() ? content.trim().split(/\s+/).length : 0,
    lines: content.split('\n').length,
    paragraphs: content.trim() ? content.trim().split(/\n\s*\n/).length : 0
  };
  return stats;
}

// Show text statistics
function showTextStats() {
  const stats = getTextStats();
  const message = `Characters: ${stats.characters} | Words: ${stats.words} | Lines: ${stats.lines}`;
  showNotification(message, 'info', 4000);
}

// Text formatting utilities
function insertDateTimeAtCursor() {
  const now = new Date();
  const dateTime = now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const cursorPos = noteContent.selectionStart;
  const textBefore = noteContent.value.substring(0, cursorPos);
  const textAfter = noteContent.value.substring(cursorPos);
  
  noteContent.value = textBefore + dateTime + textAfter;
  noteContent.setSelectionRange(cursorPos + dateTime.length, cursorPos + dateTime.length);
  
  setTimeout(autoSave, 100);
  showNotification('Date/time inserted', 'success', 1500);
}

// Word wrap toggle
function toggleWordWrap() {
  const isWrapped = noteContent.style.whiteSpace === 'pre-wrap';
  noteContent.style.whiteSpace = isWrapped ? 'pre' : 'pre-wrap';
  noteContent.style.overflowX = isWrapped ? 'auto' : 'hidden';
  
  showNotification(isWrapped ? 'Word wrap disabled' : 'Word wrap enabled', 'info', 1500);
}

// Font size adjustment
let currentFontSize = 14;
function adjustFontSize(delta) {
  currentFontSize = Math.max(10, Math.min(24, currentFontSize + delta));
  noteContent.style.fontSize = currentFontSize + 'px';
  showNotification(`Font size: ${currentFontSize}px`, 'info', 1000);
}

// Enhanced keyboard shortcuts - add more utilities
const additionalShortcuts = {
  // Text statistics
  showStats: { key: 'i', modifiers: ['metaKey', 'ctrlKey'], action: () => showTextStats() },
  
  // Insert date/time
  insertDateTime: { key: 't', modifiers: ['metaKey', 'ctrlKey'], action: () => insertDateTimeAtCursor() },
  
  // Word wrap toggle
  toggleWrap: { key: 'w', modifiers: ['metaKey', 'ctrlKey', 'shiftKey'], action: () => toggleWordWrap() },
  
  // Font size adjustment
  fontSizeUp: { key: '=', modifiers: ['metaKey', 'ctrlKey'], action: () => adjustFontSize(1) },
  fontSizeDown: { key: '-', modifiers: ['metaKey', 'ctrlKey'], action: () => adjustFontSize(-1) },
  fontSizeReset: { key: '0', modifiers: ['metaKey', 'ctrlKey'], action: () => {
    currentFontSize = 14;
    noteContent.style.fontSize = '14px';
    showNotification('Font size reset', 'info', 1000);
  }},
  
  // Quick resize shortcuts
  resizeSmall: { key: '1', modifiers: ['metaKey', 'ctrlKey', 'shiftKey'], action: () => quickResize(300, 300) },
  resizeMedium: { key: '2', modifiers: ['metaKey', 'ctrlKey', 'shiftKey'], action: () => quickResize(400, 400) },
  resizeLarge: { key: '3', modifiers: ['metaKey', 'ctrlKey', 'shiftKey'], action: () => quickResize(500, 500) }
};

// Merge additional shortcuts with main shortcuts
Object.assign(keyboardShortcuts, additionalShortcuts);

// Quick resize function
function quickResize(width, height) {
  try {
    if (window.electronAPI && window.electronAPI.resizeWindow && noteId) {
      window.electronAPI.resizeWindow(noteId, width, height);
      showNotification(`Resized to ${width}x${height}`, 'success', 1500);
    }
  } catch (error) {
    console.error('Error quick resizing:', error);
    showNotification('Failed to resize window', 'error');
  }
}

// Enhanced error handling and recovery
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  showNotification('An error occurred. Please try again.', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  showNotification('An operation failed. Please try again.', 'error');
});

console.log('Enhanced UI components and interactions loaded successfully');