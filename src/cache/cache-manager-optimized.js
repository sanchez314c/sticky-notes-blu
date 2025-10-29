class MemoryOptimizedCacheManager {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000;
    this.maxAge = options.maxAge || 300000; // 5 minutes
    this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute
    
    this.cache = new Map();
    this.accessTimes = new Map();
    this.expirationTimes = new Map();
    this.sizeTracking = new Map();
    
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      cleanups: 0,
      totalSize: 0
    };
    
    this.cleanupTimer = null;
    this.isCleaningUp = false;
    this.weakRefs = new WeakMap();
    
    this.initializeOptimizations();
    this.startCleanupTimer();
  }

  initializeOptimizations() {
    this.memoryPressureHandler = () => {
      console.warn('Memory pressure detected, performing aggressive cleanup');
      this.aggressiveCleanup();
    };
    
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('low-memory', this.memoryPressureHandler);
    }
    
    if (typeof process !== 'undefined' && process.on) {
      process.on('warning', (warning) => {
        if (warning.name === 'MaxListenersExceededWarning' || 
            warning.message.includes('memory')) {
          this.aggressiveCleanup();
        }
      });
    }
  }

  calculateSize(value) {
    if (value === null || value === undefined) return 0;
    
    if (typeof value === 'string') {
      return value.length * 2; // Approximate UTF-16 size
    }
    
    if (typeof value === 'number') {
      return 8; // 64-bit number
    }
    
    if (typeof value === 'boolean') {
      return 4;
    }
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value).length * 2;
      } catch (error) {
        return 100; // Fallback estimate
      }
    }
    
    return 50; // Default estimate
  }

  set(key, value, options = {}) {
    if (typeof key !== 'string') {
      throw new Error('Cache key must be a string');
    }
    
    const now = Date.now();
    const size = this.calculateSize(value);
    const maxAge = options.maxAge || this.maxAge;
    
    // Check if we need to evict items
    if (this.cache.size >= this.maxSize || this.stats.totalSize + size > this.maxSize * 1000) {
      this.evictLeastRecentlyUsed();
    }
    
    // Remove old entry if exists
    if (this.cache.has(key)) {
      const oldSize = this.sizeTracking.get(key) || 0;
      this.stats.totalSize -= oldSize;
    }
    
    // Add new entry
    this.cache.set(key, value);
    this.accessTimes.set(key, now);
    this.expirationTimes.set(key, now + maxAge);
    this.sizeTracking.set(key, size);
    this.stats.totalSize += size;
    
    // Create weak reference for objects
    if (typeof value === 'object' && value !== null) {
      try {
        this.weakRefs.set(value, key);
      } catch (error) {
        // Ignore WeakMap errors for non-objects
      }
    }
    
    return true;
  }

  get(key) {
    if (typeof key !== 'string') {
      return undefined;
    }
    
    const now = Date.now();
    
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return undefined;
    }
    
    // Check expiration
    const expirationTime = this.expirationTimes.get(key);
    if (expirationTime && now > expirationTime) {
      this.delete(key);
      this.stats.misses++;
      return undefined;
    }
    
    // Update access time
    this.accessTimes.set(key, now);
    this.stats.hits++;
    
    return this.cache.get(key);
  }

  has(key) {
    if (typeof key !== 'string') {
      return false;
    }
    
    if (!this.cache.has(key)) {
      return false;
    }
    
    // Check expiration
    const now = Date.now();
    const expirationTime = this.expirationTimes.get(key);
    if (expirationTime && now > expirationTime) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key) {
    if (typeof key !== 'string') {
      return false;
    }
    
    if (!this.cache.has(key)) {
      return false;
    }
    
    const size = this.sizeTracking.get(key) || 0;
    this.stats.totalSize -= size;
    
    this.cache.delete(key);
    this.accessTimes.delete(key);
    this.expirationTimes.delete(key);
    this.sizeTracking.delete(key);
    
    return true;
  }

  clear() {
    this.cache.clear();
    this.accessTimes.clear();
    this.expirationTimes.clear();
    this.sizeTracking.clear();
    this.stats.totalSize = 0;
  }

  evictLeastRecentlyUsed() {
    const now = Date.now();
    const entries = Array.from(this.accessTimes.entries());
    
    // Sort by access time (oldest first)
    entries.sort((a, b) => a[1] - b[1]);
    
    // Evict oldest 25% or at least 1 item
    const evictCount = Math.max(1, Math.floor(entries.length * 0.25));
    
    for (let i = 0; i < evictCount && i < entries.length; i++) {
      const [key] = entries[i];
      this.delete(key);
      this.stats.evictions++;
    }
  }

  cleanup() {
    if (this.isCleaningUp) {
      return;
    }
    
    this.isCleaningUp = true;
    
    try {
      const now = Date.now();
      const keysToDelete = [];
      
      // Find expired entries
      for (const [key, expirationTime] of this.expirationTimes) {
        if (now > expirationTime) {
          keysToDelete.push(key);
        }
      }
      
      // Delete expired entries
      keysToDelete.forEach(key => {
        this.delete(key);
      });
      
      this.stats.cleanups++;
      
      if (keysToDelete.length > 0) {
        console.log(`Cache cleanup removed ${keysToDelete.length} expired entries`);
      }
      
      // Force garbage collection if available and cache is large
      if (this.cache.size > 500 && typeof global !== 'undefined' && global.gc) {
        try {
          global.gc();
        } catch (error) {
          // GC not available
        }
      }
      
    } catch (error) {
      console.error('Cache cleanup error:', error);
    } finally {
      this.isCleaningUp = false;
    }
  }

  aggressiveCleanup() {
    console.log('Performing aggressive cache cleanup due to memory pressure');
    
    // Clear 50% of cache, keeping most recently accessed
    const entries = Array.from(this.accessTimes.entries());
    entries.sort((a, b) => b[1] - a[1]); // Sort by access time (newest first)
    
    const keepCount = Math.floor(entries.length * 0.5);
    const deleteCount = entries.length - keepCount;
    
    for (let i = keepCount; i < entries.length; i++) {
      const [key] = entries[i];
      this.delete(key);
      this.stats.evictions++;
    }
    
    console.log(`Aggressive cleanup removed ${deleteCount} entries`);
    
    // Force GC if available
    if (typeof global !== 'undefined' && global.gc) {
      try {
        global.gc();
      } catch (error) {
        // GC not available
      }
    }
  }

  startCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
    
    // Ensure cleanup timer is cleared on exit
    if (typeof process !== 'undefined' && process.on) {
      process.on('exit', () => {
        this.destroy();
      });
    }
    
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('beforeunload', () => {
        this.destroy();
      });
    }
  }

  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : '0.00';
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      memoryUsage: `${Math.round(this.stats.totalSize / 1024)} KB`
    };
  }

  keys() {
    return Array.from(this.cache.keys());
  }

  values() {
    return Array.from(this.cache.values());
  }

  entries() {
    return Array.from(this.cache.entries());
  }

  size() {
    return this.cache.size;
  }

  // Memory optimization: create cached function wrapper
  memoize(fn, keyGenerator, options = {}) {
    if (typeof fn !== 'function') {
      throw new Error('First argument must be a function');
    }
    
    const cache = this;
    const prefix = options.prefix || 'memoized_';
    const generateKey = keyGenerator || ((...args) => `${prefix}${JSON.stringify(args)}`);
    
    return function memoizedFunction(...args) {
      const key = generateKey(...args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = fn.apply(this, args);
      cache.set(key, result, options);
      
      return result;
    };
  }

  // Bulk operations for better performance
  setMultiple(entries, options = {}) {
    const results = [];
    
    entries.forEach(([key, value]) => {
      try {
        results.push(this.set(key, value, options));
      } catch (error) {
        console.error(`Failed to set cache entry for key ${key}:`, error);
        results.push(false);
      }
    });
    
    return results;
  }

  getMultiple(keys) {
    const results = new Map();
    
    keys.forEach(key => {
      results.set(key, this.get(key));
    });
    
    return results;
  }

  deleteMultiple(keys) {
    const results = [];
    
    keys.forEach(key => {
      results.push(this.delete(key));
    });
    
    return results;
  }

  destroy() {
    console.log('Destroying cache manager...');
    
    try {
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = null;
      }
      
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('low-memory', this.memoryPressureHandler);
      }
      
      this.clear();
      
      // Clear all references
      this.cache = null;
      this.accessTimes = null;
      this.expirationTimes = null;
      this.sizeTracking = null;
      this.weakRefs = null;
      
    } catch (error) {
      console.error('Error destroying cache manager:', error);
    }
    
    console.log('Cache manager destroyed');
  }
}

// Global cache instance for application-wide use
if (typeof globalThis !== 'undefined') {
  if (!globalThis.memoryOptimizedCache) {
    globalThis.memoryOptimizedCache = new MemoryOptimizedCacheManager({
      maxSize: 1000,
      maxAge: 300000, // 5 minutes
      cleanupInterval: 60000 // 1 minute
    });
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MemoryOptimizedCacheManager;
} else if (typeof define === 'function' && define.amd) {
  define([], () => MemoryOptimizedCacheManager);
} else if (typeof globalThis !== 'undefined') {
  globalThis.MemoryOptimizedCacheManager = MemoryOptimizedCacheManager;
}

console.log('Memory optimized cache manager loaded successfully');