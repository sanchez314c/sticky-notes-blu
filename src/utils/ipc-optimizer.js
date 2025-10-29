/**
 * IPC Communication Optimizer
 * Addresses bottlenecks in Inter-Process Communication with batching, caching, and intelligent routing
 */

const { AsyncDebouncer, RateLimiter } = require('./swarm_outputs/async-utils');

class IPCOptimizer {
  constructor(options = {}) {
    this.options = {
      batchSize: 10,
      batchDelay: 50,
      cacheExpiry: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      ...options
    };
    
    this.debouncer = new AsyncDebouncer(this.options.batchDelay);
    this.rateLimiter = new RateLimiter(20, 1000);
    this.messageQueue = new Map();
    this.responseCache = new Map();
    this.pendingRequests = new Map();
    this.metrics = {
      messagesSent: 0,
      messagesReceived: 0,
      batchesSent: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0
    };
    
    this.setupCleanupInterval();
  }

  /**
   * Optimize IPC message sending with batching and deduplication
   */
  async sendOptimized(channel, data, options = {}) {
    const messageId = this.generateMessageId();
    const priority = options.priority || 'normal';
    const useCache = options.cache !== false;
    
    // Check cache first
    if (useCache) {
      const cacheKey = this.getCacheKey(channel, data);
      const cached = this.getCachedResponse(cacheKey);
      if (cached) {
        this.metrics.cacheHits++;
        return cached;
      }
      this.metrics.cacheMisses++;
    }
    
    // Add to batch queue
    return this.queueMessage({
      id: messageId,
      channel,
      data,
      priority,
      useCache,
      options,
      timestamp: Date.now()
    });
  }

  /**
   * Queue messages for batch processing
   */
  async queueMessage(message) {
    const batchKey = `${message.channel}_${message.priority}`;
    
    if (!this.messageQueue.has(batchKey)) {
      this.messageQueue.set(batchKey, []);
    }
    
    this.messageQueue.get(batchKey).push(message);
    
    // Process batch if it reaches the size limit
    if (this.messageQueue.get(batchKey).length >= this.options.batchSize) {
      return this.processBatch(batchKey);
    }
    
    // Debounced batch processing
    return this.debouncer.debounce(
      batchKey,
      () => this.processBatch(batchKey)
    );
  }

  /**
   * Process a batch of messages
   */
  async processBatch(batchKey) {
    const messages = this.messageQueue.get(batchKey);
    if (!messages || messages.length === 0) return;
    
    this.messageQueue.set(batchKey, []); // Clear the batch
    
    try {
      const result = await this.rateLimiter.execute(
        this.sendBatch.bind(this),
        messages
      );
      
      this.metrics.batchesSent++;
      return result;
    } catch (error) {
      this.metrics.errors++;
      // Re-queue failed messages with lower priority
      messages.forEach(msg => {
        msg.retryCount = (msg.retryCount || 0) + 1;
        if (msg.retryCount < this.options.maxRetries) {
          setTimeout(() => this.queueMessage(msg), this.options.retryDelay);
        }
      });
      throw error;
    }
  }

  /**
   * Send batch of messages to main process or renderer
   */
  async sendBatch(messages) {
    const results = new Map();
    
    // Group by channel for efficient processing
    const channelGroups = this.groupMessagesByChannel(messages);
    
    for (const [channel, channelMessages] of channelGroups) {
      try {
        const batchResult = await this.sendChannelBatch(channel, channelMessages);
        
        // Map results back to individual messages
        channelMessages.forEach((message, index) => {
          const result = batchResult[index] || batchResult;
          results.set(message.id, result);
          
          // Cache successful responses
          if (message.useCache && result && !result.error) {
            const cacheKey = this.getCacheKey(message.channel, message.data);
            this.setCachedResponse(cacheKey, result);
          }
        });
        
      } catch (error) {
        // Handle batch failure
        channelMessages.forEach(message => {
          results.set(message.id, { error: error.message });
        });
      }
    }
    
    this.metrics.messagesSent += messages.length;
    return results;
  }

  /**
   * Send messages for a specific channel
   */
  async sendChannelBatch(channel, messages) {
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Renderer process
      return this.sendFromRenderer(channel, messages);
    } else if (typeof require !== 'undefined') {
      // Main process
      return this.sendFromMain(channel, messages);
    } else {
      throw new Error('Unknown process context');
    }
  }

  /**
   * Send from renderer process
   */
  async sendFromRenderer(channel, messages) {
    const electronAPI = window.electronAPI;
    
    // Check if batch operation is supported
    if (electronAPI[`${channel}Batch`]) {
      return electronAPI[`${channel}Batch`](messages.map(m => m.data));
    }
    
    // Fallback to individual calls with concurrency control
    const concurrencyLimit = 3;
    const results = [];
    
    for (let i = 0; i < messages.length; i += concurrencyLimit) {
      const batch = messages.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map(async (message) => {
        try {
          return await electronAPI[channel](message.data);
        } catch (error) {
          return { error: error.message };
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : r.reason));
    }
    
    return results;
  }

  /**
   * Send from main process
   */
  async sendFromMain(channel, messages) {
    const { BrowserWindow } = require('electron');
    
    // Get focused window or first available window
    const window = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (!window) {
      throw new Error('No window available for IPC communication');
    }
    
    // Send batch to renderer
    return new Promise((resolve, reject) => {
      const batchId = this.generateMessageId();
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(batchId);
        reject(new Error('IPC batch timeout'));
      }, 10000);
      
      this.pendingRequests.set(batchId, { resolve, reject, timeout });
      
      window.webContents.send(`${channel}-batch`, {
        batchId,
        messages: messages.map(m => m.data)
      });
    });
  }

  /**
   * Handle batch responses
   */
  handleBatchResponse(batchId, results) {
    const pending = this.pendingRequests.get(batchId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(batchId);
      pending.resolve(results);
      this.metrics.messagesReceived += results.length;
    }
  }

  /**
   * Group messages by channel for efficient processing
   */
  groupMessagesByChannel(messages) {
    const groups = new Map();
    
    for (const message of messages) {
      if (!groups.has(message.channel)) {
        groups.set(message.channel, []);
      }
      groups.get(message.channel).push(message);
    }
    
    return groups;
  }

  /**
   * Cache management
   */
  getCacheKey(channel, data) {
    return `${channel}:${JSON.stringify(data)}`;
  }

  getCachedResponse(key) {
    const cached = this.responseCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.options.cacheExpiry) {
      this.responseCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  setCachedResponse(key, data) {
    this.responseCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Stream large data transfers
   */
  async streamLargeData(channel, data, options = {}) {
    const chunkSize = options.chunkSize || 64 * 1024; // 64KB chunks
    const chunks = this.chunkData(data, chunkSize);
    const streamId = this.generateMessageId();
    
    // Send stream initialization
    await this.sendOptimized(`${channel}-stream-init`, {
      streamId,
      totalChunks: chunks.length,
      totalSize: JSON.stringify(data).length
    });
    
    // Send chunks with progress tracking
    for (let i = 0; i < chunks.length; i++) {
      await this.sendOptimized(`${channel}-stream-chunk`, {
        streamId,
        chunkIndex: i,
        chunk: chunks[i],
        isLast: i === chunks.length - 1
      });
      
      // Yield control between chunks
      await new Promise(resolve => setImmediate(resolve));
    }
    
    return streamId;
  }

  /**
   * Chunk data for streaming
   */
  chunkData(data, chunkSize) {
    const serialized = JSON.stringify(data);
    const chunks = [];
    
    for (let i = 0; i < serialized.length; i += chunkSize) {
      chunks.push(serialized.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  /**
   * Connection health monitoring
   */
  async testConnection() {
    const startTime = Date.now();
    
    try {
      await this.sendOptimized('ping', { timestamp: startTime }, { cache: false });
      const latency = Date.now() - startTime;
      return { healthy: true, latency };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }

  /**
   * Performance monitoring
   */
  getMetrics() {
    return {
      ...this.metrics,
      queuedMessages: Array.from(this.messageQueue.values()).reduce((sum, queue) => sum + queue.length, 0),
      cacheSize: this.responseCache.size,
      pendingRequests: this.pendingRequests.size,
      cacheHitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100
    };
  }

  /**
   * Utility methods
   */
  generateMessageId() {
      return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  setupCleanupInterval() {
    setInterval(() => {
      this.cleanupCache();
      this.cleanupPendingRequests();
    }, 30000); // Cleanup every 30 seconds
  }

  cleanupCache() {
    const now = Date.now();
    for (const [key, cached] of this.responseCache.entries()) {
      if (now - cached.timestamp > this.options.cacheExpiry) {
        this.responseCache.delete(key);
      }
    }
  }

  cleanupPendingRequests() {
    const now = Date.now();
    for (const [id, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > 30000) { // 30 second timeout
        clearTimeout(request.timeout);
        request.reject(new Error('Request timeout'));
        this.pendingRequests.delete(id);
      }
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    // Process remaining queued messages
    const promises = [];
    for (const batchKey of this.messageQueue.keys()) {
      promises.push(this.processBatch(batchKey));
    }
    
    await Promise.allSettled(promises);
    
    // Cleanup
    this.debouncer.cancelAll();
    this.messageQueue.clear();
    this.responseCache.clear();
    this.pendingRequests.clear();
  }
}

module.exports = IPCOptimizer;