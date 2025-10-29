const { contextBridge, ipcRenderer } = require('electron');

class MemoryOptimizedPreload {
  constructor() {
    this.rateLimits = new Map();
    this.eventListeners = new Map();
    this.cleanupTasks = new Set();
    this.messageQueue = [];
    this.isProcessingQueue = false;
    
    this.initializeMemoryOptimizations();
    this.setupCleanupHandlers();
  }

  initializeMemoryOptimizations() {
    this.setupWeakReferences();
    this.optimizeEventListeners();
    this.implementMemoryPooling();
  }

  setupWeakReferences() {
    this.weakCallbackRefs = new WeakMap();
    this.weakElementRefs = new WeakMap();
  }

  optimizeEventListeners() {
    const originalOn = ipcRenderer.on.bind(ipcRenderer);
    const originalOnce = ipcRenderer.once.bind(ipcRenderer);
    const originalRemoveListener = ipcRenderer.removeListener.bind(ipcRenderer);
    
    ipcRenderer.on = (channel, listener) => {
      const wrappedListener = this.createMemoryOptimizedListener(listener);
      this.trackEventListener(channel, wrappedListener);
      return originalOn(channel, wrappedListener);
    };
    
    ipcRenderer.once = (channel, listener) => {
      const wrappedListener = this.createMemoryOptimizedListener(listener, true);
      this.trackEventListener(channel, wrappedListener);
      return originalOnce(channel, wrappedListener);
    };
    
    ipcRenderer.removeListener = (channel, listener) => {
      this.untrackEventListener(channel, listener);
      return originalRemoveListener(channel, listener);
    };
  }

  createMemoryOptimizedListener(listener, isOnce = false) {
    const wrappedListener = (...args) => {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error('IPC listener error:', error);
      } finally {
        if (isOnce) {
          this.cleanupListener(wrappedListener);
        }
      }
    };
    
    this.weakCallbackRefs.set(wrappedListener, listener);
    return wrappedListener;
  }

  trackEventListener(channel, listener) {
    if (!this.eventListeners.has(channel)) {
      this.eventListeners.set(channel, new Set());
    }
    this.eventListeners.get(channel).add(listener);
  }

  untrackEventListener(channel, listener) {
    const listeners = this.eventListeners.get(channel);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(channel);
      }
    }
  }

  cleanupListener(listener) {
    this.weakCallbackRefs.delete(listener);
  }

  implementMemoryPooling() {
    this.objectPool = {
      validationResults: [],
      messageObjects: [],
      dataObjects: []
    };
  }

  borrowFromPool(poolName) {
    const pool = this.objectPool[poolName];
    return pool.length > 0 ? pool.pop() : {};
  }

  returnToPool(poolName, obj) {
    const pool = this.objectPool[poolName];
    if (pool.length < 50) {
      Object.keys(obj).forEach(key => delete obj[key]);
      pool.push(obj);
    }
  }

  validateNoteId(id) {
    if (typeof id !== 'string' || id.length === 0 || id.length > 100) {
      throw new Error('Invalid note ID: must be non-empty string under 100 characters');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      throw new Error('Note ID contains invalid characters: only alphanumeric, underscore, and hyphen allowed');
    }
    
    return id;
  }

  validateContent(content) {
    if (typeof content !== 'string') {
      throw new Error('Content must be a string');
    }
    
    if (content.length > 500000) {
      throw new Error('Content too long: maximum 500KB allowed');
    }
    
    return content;
  }

  validateColor(color) {
    if (typeof color !== 'string') {
      throw new Error('Color must be a string');
    }
    
    const allowedColors = [
      'gradient-1', 'gradient-2', 'gradient-3', 'gradient-4',
      'gradient-5', 'gradient-6', 'gradient-7', 'gradient-8',
      'gradient-9', 'gradient-10', 'gradient-11', 'gradient-12',
      'gradient-dark', 'gradient-light', 'gradient-gold', 'gradient-silver'
    ];
    
    if (!allowedColors.includes(color)) {
      throw new Error(`Invalid color: must be one of ${allowedColors.join(', ')}`);
    }
    
    return color;
  }

  validateCoordinates(x, y) {
    if (typeof x !== 'number' || typeof y !== 'number') {
      throw new Error('Coordinates must be numbers');
    }
    
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error('Coordinates must be finite numbers');
    }
    
    if (x < -10000 || x > 10000 || y < -10000 || y > 10000) {
      throw new Error('Coordinates out of range (-10000 to 10000)');
    }
    
    return { x, y };
  }

  validateDimensions(width, height) {
    if (typeof width !== 'number' || typeof height !== 'number') {
      throw new Error('Dimensions must be numbers');
    }
    
    if (!Number.isFinite(width) || !Number.isFinite(height)) {
      throw new Error('Dimensions must be finite numbers');
    }
    
    const minWidth = 200, minHeight = 150;
    const maxWidth = 2000, maxHeight = 1500;
    
    if (width < minWidth || height < minHeight) {
      throw new Error(`Dimensions too small: minimum ${minWidth}x${minHeight}`);
    }
    
    if (width > maxWidth || height > maxHeight) {
      throw new Error(`Dimensions too large: maximum ${maxWidth}x${maxHeight}`);
    }
    
    return { width, height };
  }

  checkRateLimit(action, limit = 30, timeWindow = 1000) {
    const now = Date.now();
    const key = action;
    
    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, { count: 1, resetTime: now + timeWindow });
      return true;
    }
    
    const rateLimit = this.rateLimits.get(key);
    
    if (now > rateLimit.resetTime) {
      rateLimit.count = 1;
      rateLimit.resetTime = now + timeWindow;
      return true;
    }
    
    if (rateLimit.count >= limit) {
      console.warn(`Rate limit exceeded for action: ${action} (${rateLimit.count}/${limit})`);
      return false;
    }
    
    rateLimit.count++;
    return true;
  }

  queueMessage(message) {
    this.messageQueue.push(message);
    
    if (!this.isProcessingQueue) {
      this.processMessageQueue();
    }
  }

  async processMessageQueue() {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    try {
      const batchSize = 10;
      
      while (this.messageQueue.length > 0) {
        const batch = this.messageQueue.splice(0, batchSize);
        
        await Promise.allSettled(
          batch.map(message => this.sendMessage(message))
        );
        
        if (this.messageQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    } catch (error) {
      console.error('Error processing message queue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  async sendMessage(message) {
    try {
      const result = ipcRenderer.invoke(message.channel, message.data);
      
      if (message.resolve) {
        message.resolve(await result);
      }
      
      return result;
    } catch (error) {
      console.error(`IPC message failed (${message.channel}):`, error);
      
      if (message.reject) {
        message.reject(error);
      }
      
      throw error;
    }
  }

  createSecureAPI() {
    return {
      saveNoteContent: (id, content) => {
        return new Promise((resolve, reject) => {
          try {
            if (!this.checkRateLimit('saveNoteContent', 50, 1000)) {
              reject(new Error('Rate limit exceeded'));
              return;
            }
            
            const validId = this.validateNoteId(id);
            const validContent = this.validateContent(content);
            
            this.queueMessage({
              channel: 'save-note-content',
              data: { id: validId, content: validContent },
              resolve,
              reject
            });
          } catch (error) {
            reject(error);
          }
        });
      },
      
      changeNoteColor: (id, color) => {
        return new Promise((resolve, reject) => {
          try {
            if (!this.checkRateLimit('changeNoteColor', 10, 1000)) {
              reject(new Error('Rate limit exceeded'));
              return;
            }
            
            const validId = this.validateNoteId(id);
            const validColor = this.validateColor(color);
            
            this.queueMessage({
              channel: 'change-note-color',
              data: { id: validId, color: validColor },
              resolve,
              reject
            });
          } catch (error) {
            reject(error);
          }
        });
      },
      
      closeNote: (id) => {
        return new Promise((resolve, reject) => {
          try {
            if (!this.checkRateLimit('closeNote', 10, 1000)) {
              reject(new Error('Rate limit exceeded'));
              return;
            }
            
            const validId = this.validateNoteId(id);
            
            this.queueMessage({
              channel: 'close-note',
              data: validId,
              resolve,
              reject
            });
          } catch (error) {
            reject(error);
          }
        });
      },
      
      createNewNote: () => {
        return new Promise((resolve, reject) => {
          try {
            if (!this.checkRateLimit('createNewNote', 5, 1000)) {
              reject(new Error('Rate limit exceeded'));
              return;
            }
            
            this.queueMessage({
              channel: 'create-new-note',
              data: {},
              resolve,
              reject
            });
          } catch (error) {
            reject(error);
          }
        });
      },
      
      minimizeNote: (id) => {
        return new Promise((resolve, reject) => {
          try {
            if (!this.checkRateLimit('minimizeNote', 10, 1000)) {
              reject(new Error('Rate limit exceeded'));
              return;
            }
            
            const validId = this.validateNoteId(id);
            
            this.queueMessage({
              channel: 'minimize-note',
              data: validId,
              resolve,
              reject
            });
          } catch (error) {
            reject(error);
          }
        });
      },
      
      moveWindow: (id, x, y) => {
        return new Promise((resolve, reject) => {
          try {
            if (!this.checkRateLimit('moveWindow', 100, 1000)) {
              reject(new Error('Rate limit exceeded'));
              return;
            }
            
            const validId = this.validateNoteId(id);
            const validCoords = this.validateCoordinates(x, y);
            
            this.queueMessage({
              channel: 'move-window',
              data: { id: validId, x: validCoords.x, y: validCoords.y },
              resolve,
              reject
            });
          } catch (error) {
            reject(error);
          }
        });
      },
      
      resizeWindow: (id, width, height) => {
        return new Promise((resolve, reject) => {
          try {
            if (!this.checkRateLimit('resizeWindow', 30, 1000)) {
              reject(new Error('Rate limit exceeded'));
              return;
            }
            
            const validId = this.validateNoteId(id);
            const validDims = this.validateDimensions(width, height);
            
            this.queueMessage({
              channel: 'resize-window',
              data: { id: validId, width: validDims.width, height: validDims.height },
              resolve,
              reject
            });
          } catch (error) {
            reject(error);
          }
        });
      },
      
      onInitNote: (callback) => {
        if (typeof callback !== 'function') {
          throw new Error('Callback must be a function');
        }
        
        const wrappedCallback = (event, data) => {
          try {
            callback(data);
          } catch (error) {
            console.error('Init note callback error:', error);
          }
        };
        
        ipcRenderer.on('init-note', wrappedCallback);
        this.trackEventListener('init-note', wrappedCallback);
        
        this.cleanupTasks.add(() => {
          ipcRenderer.removeListener('init-note', wrappedCallback);
          this.untrackEventListener('init-note', wrappedCallback);
        });
      },
      
      removeAllListeners: (channel) => {
        if (typeof channel !== 'string') {
          throw new Error('Channel must be a string');
        }
        
        const listeners = this.eventListeners.get(channel);
        if (listeners) {
          listeners.forEach(listener => {
            ipcRenderer.removeListener(channel, listener);
          });
          this.eventListeners.delete(channel);
        }
      },
      
      cleanup: () => {
        this.cleanup();
      }
    };
  }

  setupCleanupHandlers() {
    const cleanup = () => this.cleanup();
    
    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', cleanup);
      window.addEventListener('unload', cleanup);
    }
  }

  cleanup() {
    console.log('Starting preload cleanup...');
    
    try {
      this.cleanupTasks.forEach(task => {
        try {
          task();
        } catch (error) {
          console.error('Cleanup task failed:', error);
        }
      });
      this.cleanupTasks.clear();
      
      this.eventListeners.forEach((listeners, channel) => {
        listeners.forEach(listener => {
          try {
            ipcRenderer.removeListener(channel, listener);
          } catch (error) {
            console.error(`Error removing listener for ${channel}:`, error);
          }
        });
      });
      this.eventListeners.clear();
      
      this.rateLimits.clear();
      this.messageQueue.length = 0;
      
      this.weakCallbackRefs = null;
      this.weakElementRefs = null;
      
      Object.values(this.objectPool).forEach(pool => {
        pool.length = 0;
      });
      
      if (global.gc) {
        try {
          global.gc();
        } catch (error) {
          console.warn('Manual GC failed:', error);
        }
      }
      
    } catch (error) {
      console.error('Error during preload cleanup:', error);
    }
    
    console.log('Preload cleanup completed');
  }
}

const memoryOptimizedPreload = new MemoryOptimizedPreload();

contextBridge.exposeInMainWorld('electronAPI', memoryOptimizedPreload.createSecureAPI());

console.log('Memory optimized preload script loaded successfully');