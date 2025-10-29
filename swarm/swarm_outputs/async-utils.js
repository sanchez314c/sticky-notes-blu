/**
 * Async utilities for improved concurrency and non-blocking operations
 */

const { Worker } = require('worker_threads');

/**
 * Enhanced debounce with promise support and cancellation
 */
class AsyncDebouncer {
  constructor(delay = 300) {
    this.delay = delay;
    this.timers = new Map();
    this.promises = new Map();
  }

  debounce(key, fn, ...args) {
    return new Promise((resolve, reject) => {
      // Cancel existing timer
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        
        // Reject previous promise
        const prevPromise = this.promises.get(key);
        if (prevPromise && prevPromise.reject) {
          prevPromise.reject(new Error('Debounced operation cancelled'));
        }
      }

      // Store promise resolvers
      this.promises.set(key, { resolve, reject });

      // Set new timer
      const timer = setTimeout(async () => {
        try {
          const result = await fn(...args);
          const promise = this.promises.get(key);
          if (promise && promise.resolve) {
            promise.resolve(result);
          }
        } catch (error) {
          const promise = this.promises.get(key);
          if (promise && promise.reject) {
            promise.reject(error);
          }
        } finally {
          this.timers.delete(key);
          this.promises.delete(key);
        }
      }, this.delay);

      this.timers.set(key, timer);
    });
  }

  cancel(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
      
      const promise = this.promises.get(key);
      if (promise && promise.reject) {
        promise.reject(new Error('Operation cancelled'));
      }
      this.promises.delete(key);
    }
  }

  cancelAll() {
    for (const key of this.timers.keys()) {
      this.cancel(key);
    }
  }
}

/**
 * Rate limiter with queue support
 */
class RateLimiter {
  constructor(maxConcurrent = 5, interval = 1000) {
    this.maxConcurrent = maxConcurrent;
    this.interval = interval;
    this.queue = [];
    this.running = 0;
    this.lastReset = Date.now();
    this.executedInInterval = 0;
  }

  async execute(fn, ...args) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, args, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const now = Date.now();
    if (now - this.lastReset >= this.interval) {
      this.lastReset = now;
      this.executedInInterval = 0;
    }

    if (this.executedInInterval >= this.maxConcurrent) {
      // Wait until next interval
      setTimeout(() => this.processQueue(), this.interval - (now - this.lastReset));
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.running++;
    this.executedInInterval++;

    try {
      const result = await task.fn(...task.args);
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      this.running--;
      // Process next task
      setImmediate(() => this.processQueue());
    }
  }
}

/**
 * Worker thread pool for CPU-intensive tasks
 */
class WorkerPool {
  constructor(workerScript, poolSize = require('os').cpus().length) {
    this.workerScript = workerScript;
    this.poolSize = poolSize;
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerScript);
      
      worker.on('error', (error) => {
        console.error(`Worker ${i} error:`, error);
        this.replaceWorker(worker);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker ${i} exited with code ${code}`);
          this.replaceWorker(worker);
        }
      });

      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }

    this.initialized = true;
  }

  async execute(data, transferList = []) {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const task = { data, transferList, resolve, reject };
      
      if (this.availableWorkers.length > 0) {
        this.runTask(task);
      } else {
        this.taskQueue.push(task);
      }
    });
  }

  runTask(task) {
    const worker = this.availableWorkers.pop();
    
    const onMessage = (result) => {
      worker.off('message', onMessage);
      worker.off('error', onError);
      this.availableWorkers.push(worker);
      task.resolve(result);
      this.processQueue();
    };

    const onError = (error) => {
      worker.off('message', onMessage);
      worker.off('error', onError);
      this.availableWorkers.push(worker);
      task.reject(error);
      this.processQueue();
    };

    worker.on('message', onMessage);
    worker.on('error', onError);
    worker.postMessage(task.data, task.transferList);
  }

  processQueue() {
    if (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift();
      this.runTask(task);
    }
  }

  replaceWorker(oldWorker) {
    const index = this.workers.indexOf(oldWorker);
    if (index !== -1) {
      oldWorker.terminate();
      
      const newWorker = new Worker(this.workerScript);
      this.workers[index] = newWorker;
      
      // Add to available workers if the old one was available
      const availableIndex = this.availableWorkers.indexOf(oldWorker);
      if (availableIndex !== -1) {
        this.availableWorkers[availableIndex] = newWorker;
      }
    }
  }

  async terminate() {
    const promises = this.workers.map(worker => worker.terminate());
    await Promise.all(promises);
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
    this.initialized = false;
  }
}

/**
 * Async batch processor for bulk operations
 */
class BatchProcessor {
  constructor(batchSize = 10, delay = 100) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.processing = false;
  }

  async add(item) {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });
      
      if (!this.processing) {
        this.processing = true;
        setImmediate(() => this.processBatch());
      }
    });
  }

  async processBatch() {
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      
      try {
        const results = await this.executeBatch(batch.map(b => b.item));
        
        batch.forEach((item, index) => {
          item.resolve(results[index]);
        });
      } catch (error) {
        batch.forEach(item => {
          item.reject(error);
        });
      }

      // Small delay between batches to prevent blocking
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }

    this.processing = false;
  }

  // Override this method in implementations
  async executeBatch(items) {
    return items;
  }
}

/**
 * Circuit breaker for fault tolerance
 */
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = 0;
  }

  async execute(fn, ...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

/**
 * Async event emitter with better error handling
 */
class AsyncEventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }

  off(event, listener) {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event);
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  async emit(event, ...args) {
    if (!this.listeners.has(event)) return;

    const listeners = this.listeners.get(event);
    const promises = listeners.map(async (listener) => {
      try {
        return await listener(...args);
      } catch (error) {
        console.error(`Error in listener for event ${event}:`, error);
        return null;
      }
    });

    return Promise.allSettled(promises);
  }

  async emitSerial(event, ...args) {
    if (!this.listeners.has(event)) return;

    const listeners = this.listeners.get(event);
    const results = [];

    for (const listener of listeners) {
      try {
        const result = await listener(...args);
        results.push(result);
      } catch (error) {
        console.error(`Error in listener for event ${event}:`, error);
        results.push(null);
      }
    }

    return results;
  }
}

module.exports = {
  AsyncDebouncer,
  RateLimiter,
  WorkerPool,
  BatchProcessor,
  CircuitBreaker,
  AsyncEventEmitter
};