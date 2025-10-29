/**
 * MEMORY POOL MANAGER
 * Advanced memory management for zero-allocation runtime
 */

const { performance } = require('perf_hooks');

class MemoryPoolManager {
  constructor() {
    this.pools = new Map();
    this.allocations = new Map();
    this.metrics = {
      allocations: 0,
      deallocations: 0,
      reuses: 0,
      gcTriggers: 0,
      totalMemory: 0,
      activeMemory: 0
    };
    this.setupGCMonitoring();
  }

  // ==========================
  // OBJECT POOL IMPLEMENTATION
  // ==========================

  createObjectPool(className, factory, resetFn, size = 100) {
    const pool = {
      available: [],
      inUse: new Set(),
      factory,
      resetFn,
      className,
      stats: {
        created: 0,
        reused: 0,
        maxUsed: 0
      }
    };

    // Pre-allocate objects
    for (let i = 0; i < size; i++) {
      pool.available.push(factory());
      pool.stats.created++;
    }

    this.pools.set(className, pool);
    return pool;
  }

  acquire(className, ...args) {
    const pool = this.pools.get(className);
    if (!pool) throw new Error(`Pool for ${className} not found`);

    let obj;
    
    if (pool.available.length > 0) {
      // Reuse from pool
      obj = pool.available.pop();
      pool.stats.reused++;
      this.metrics.reuses++;
    } else {
      // Create new if pool is empty
      obj = pool.factory();
      pool.stats.created++;
      this.metrics.allocations++;
    }

    // Initialize object with arguments
    if (pool.resetFn) {
      pool.resetFn(obj, ...args);
    }

    pool.inUse.add(obj);
    pool.stats.maxUsed = Math.max(pool.stats.maxUsed, pool.inUse.size);
    
    return obj;
  }

  release(className, obj) {
    const pool = this.pools.get(className);
    if (!pool || !pool.inUse.has(obj)) return;

    pool.inUse.delete(obj);
    
    // Reset object state
    if (pool.resetFn) {
      pool.resetFn(obj);
    }

    pool.available.push(obj);
    this.metrics.deallocations++;
  }

  // ==========================
  // BUFFER POOL MANAGEMENT
  // ==========================

  createBufferPool(size, count = 50) {
    const bufferPool = {
      size,
      available: [],
      inUse: new Set(),
      stats: {
        created: 0,
        reused: 0
      }
    };

    // Pre-allocate buffers
    for (let i = 0; i < count; i++) {
      bufferPool.available.push(Buffer.allocUnsafe(size));
      bufferPool.stats.created++;
    }

    this.pools.set(`buffer_${size}`, bufferPool);
    return bufferPool;
  }

  acquireBuffer(size) {
    const poolKey = `buffer_${size}`;
    let pool = this.pools.get(poolKey);
    
    if (!pool) {
      pool = this.createBufferPool(size);
    }

    let buffer;
    
    if (pool.available.length > 0) {
      buffer = pool.available.pop();
      buffer.fill(0); // Clear buffer
      pool.stats.reused++;
      this.metrics.reuses++;
    } else {
      buffer = Buffer.allocUnsafe(size);
      pool.stats.created++;
      this.metrics.allocations++;
    }

    pool.inUse.add(buffer);
    return buffer;
  }

  releaseBuffer(buffer) {
    const size = buffer.length;
    const pool = this.pools.get(`buffer_${size}`);
    
    if (!pool || !pool.inUse.has(buffer)) return;

    pool.inUse.delete(buffer);
    buffer.fill(0); // Clear sensitive data
    pool.available.push(buffer);
    this.metrics.deallocations++;
  }

  // ==========================
  // TYPED ARRAY POOLS
  // ==========================

  createTypedArrayPool(TypedArrayClass, length, count = 50) {
    const className = TypedArrayClass.name;
    const pool = {
      TypedArrayClass,
      length,
      available: [],
      inUse: new Set(),
      stats: {
        created: 0,
        reused: 0
      }
    };

    // Pre-allocate typed arrays
    for (let i = 0; i < count; i++) {
      pool.available.push(new TypedArrayClass(length));
      pool.stats.created++;
    }

    this.pools.set(`${className}_${length}`, pool);
    return pool;
  }

  acquireTypedArray(TypedArrayClass, length) {
    const poolKey = `${TypedArrayClass.name}_${length}`;
    let pool = this.pools.get(poolKey);
    
    if (!pool) {
      pool = this.createTypedArrayPool(TypedArrayClass, length);
    }

    let array;
    
    if (pool.available.length > 0) {
      array = pool.available.pop();
      array.fill(0); // Clear array
      pool.stats.reused++;
      this.metrics.reuses++;
    } else {
      array = new TypedArrayClass(length);
      pool.stats.created++;
      this.metrics.allocations++;
    }

    pool.inUse.add(array);
    return array;
  }

  releaseTypedArray(array) {
    const className = array.constructor.name;
    const length = array.length;
    const pool = this.pools.get(`${className}_${length}`);
    
    if (!pool || !pool.inUse.has(array)) return;

    pool.inUse.delete(array);
    array.fill(0); // Clear data
    pool.available.push(array);
    this.metrics.deallocations++;
  }

  // ==========================
  // SLAB ALLOCATOR
  // ==========================

  createSlabAllocator(slabSize = 1024 * 1024) {
    const slab = {
      buffer: Buffer.allocUnsafe(slabSize),
      offset: 0,
      allocations: new Map(),
      freeList: [],
      stats: {
        allocated: 0,
        freed: 0,
        fragmentation: 0
      }
    };

    this.pools.set('slab', slab);
    return slab;
  }

  slabAllocate(size) {
    let slab = this.pools.get('slab');
    if (!slab) {
      slab = this.createSlabAllocator();
    }

    // Try to find a free block
    for (let i = 0; i < slab.freeList.length; i++) {
      const block = slab.freeList[i];
      if (block.size >= size) {
        slab.freeList.splice(i, 1);
        slab.allocations.set(block.offset, block);
        slab.stats.allocated += size;
        return slab.buffer.slice(block.offset, block.offset + size);
      }
    }

    // Allocate from end of slab
    if (slab.offset + size <= slab.buffer.length) {
      const offset = slab.offset;
      slab.offset += size;
      
      const allocation = { offset, size };
      slab.allocations.set(offset, allocation);
      slab.stats.allocated += size;
      
      return slab.buffer.slice(offset, offset + size);
    }

    // Slab is full, need compaction or new slab
    this.compactSlab(slab);
    
    if (slab.offset + size <= slab.buffer.length) {
      return this.slabAllocate(size);
    }

    throw new Error('Slab allocator out of memory');
  }

  slabFree(buffer) {
    const slab = this.pools.get('slab');
    if (!slab) return;

    // Find allocation
    for (const [offset, allocation] of slab.allocations) {
      if (buffer.buffer === slab.buffer.buffer && 
          buffer.byteOffset === offset) {
        slab.allocations.delete(offset);
        slab.freeList.push(allocation);
        slab.stats.freed += allocation.size;
        buffer.fill(0); // Clear data
        return;
      }
    }
  }

  compactSlab(slab) {
    const newBuffer = Buffer.allocUnsafe(slab.buffer.length);
    let newOffset = 0;
    const newAllocations = new Map();

    // Copy active allocations
    for (const [offset, allocation] of slab.allocations) {
      slab.buffer.copy(newBuffer, newOffset, offset, offset + allocation.size);
      newAllocations.set(newOffset, {
        offset: newOffset,
        size: allocation.size
      });
      newOffset += allocation.size;
    }

    slab.buffer = newBuffer;
    slab.offset = newOffset;
    slab.allocations = newAllocations;
    slab.freeList = [];
    slab.stats.fragmentation = 0;
  }

  // ==========================
  // ARENA ALLOCATOR
  // ==========================

  createArena(size = 1024 * 1024) {
    const arena = {
      buffer: Buffer.allocUnsafe(size),
      offset: 0,
      marks: [],
      stats: {
        allocated: 0,
        resets: 0
      }
    };

    return arena;
  }

  arenaAllocate(arena, size) {
    if (arena.offset + size > arena.buffer.length) {
      throw new Error('Arena out of memory');
    }

    const offset = arena.offset;
    arena.offset += size;
    arena.stats.allocated += size;
    
    return arena.buffer.slice(offset, offset + size);
  }

  arenaMark(arena) {
    arena.marks.push(arena.offset);
  }

  arenaReset(arena, mark = null) {
    if (mark !== null && arena.marks.includes(mark)) {
      arena.offset = mark;
    } else {
      arena.offset = 0;
      arena.marks = [];
    }
    arena.stats.resets++;
  }

  // ==========================
  // RING BUFFER ALLOCATOR
  // ==========================

  createRingBuffer(size = 1024 * 1024) {
    const ringBuffer = {
      buffer: Buffer.allocUnsafe(size),
      head: 0,
      tail: 0,
      size,
      allocations: new Map(),
      stats: {
        writes: 0,
        reads: 0,
        overwrites: 0
      }
    };

    this.pools.set('ringBuffer', ringBuffer);
    return ringBuffer;
  }

  ringAllocate(size) {
    const ring = this.pools.get('ringBuffer');
    if (!ring) {
      this.createRingBuffer();
      return this.ringAllocate(size);
    }

    if (size > ring.size) {
      throw new Error('Allocation too large for ring buffer');
    }

    const start = ring.head;
    ring.head = (ring.head + size) % ring.size;
    
    // Check for overwrites
    if (ring.head > ring.tail && start < ring.tail) {
      ring.stats.overwrites++;
      ring.tail = ring.head;
    }

    ring.stats.writes++;
    
    return {
      buffer: ring.buffer,
      offset: start,
      size
    };
  }

  ringRead(allocation) {
    const ring = this.pools.get('ringBuffer');
    if (!ring) return null;

    ring.stats.reads++;
    return ring.buffer.slice(allocation.offset, allocation.offset + allocation.size);
  }

  // ==========================
  // GC MONITORING & OPTIMIZATION
  // ==========================

  setupGCMonitoring() {
    if (global.gc) {
      const originalGC = global.gc;
      global.gc = () => {
        this.metrics.gcTriggers++;
        console.log('Manual GC triggered', this.getMemoryStats());
        originalGC();
      };
    }

    // Monitor memory pressure
    setInterval(() => {
      const usage = process.memoryUsage();
      this.metrics.totalMemory = usage.heapTotal;
      this.metrics.activeMemory = usage.heapUsed;
      
      // Trigger cleanup if memory pressure is high
      if (usage.heapUsed / usage.heapTotal > 0.9) {
        this.cleanup();
      }
    }, 10000);
  }

  cleanup() {
    // Release unused objects back to pools
    this.pools.forEach((pool, name) => {
      if (pool.inUse && pool.available) {
        // Trim excess available objects
        const excess = pool.available.length - 10;
        if (excess > 0) {
          pool.available.splice(0, excess);
        }
      }
    });

    // Trigger GC if available
    if (global.gc) {
      global.gc();
    }
  }

  // ==========================
  // STATISTICS & MONITORING
  // ==========================

  getPoolStats() {
    const stats = {};
    
    this.pools.forEach((pool, name) => {
      if (pool.stats) {
        stats[name] = {
          ...pool.stats,
          available: pool.available ? pool.available.length : 0,
          inUse: pool.inUse ? pool.inUse.size : 0
        };
      }
    });

    return stats;
  }

  getMemoryStats() {
    const usage = process.memoryUsage();
    
    return {
      ...this.metrics,
      heap: {
        used: usage.heapUsed,
        total: usage.heapTotal,
        utilization: (usage.heapUsed / usage.heapTotal * 100).toFixed(2) + '%'
      },
      external: usage.external,
      pools: this.getPoolStats()
    };
  }

  reset() {
    this.pools.forEach((pool) => {
      if (pool.available) pool.available = [];
      if (pool.inUse) pool.inUse.clear();
      if (pool.stats) {
        pool.stats.created = 0;
        pool.stats.reused = 0;
      }
    });

    this.metrics = {
      allocations: 0,
      deallocations: 0,
      reuses: 0,
      gcTriggers: 0,
      totalMemory: 0,
      activeMemory: 0
    };
  }
}

// ==========================
// EXAMPLE USAGE PATTERNS
// ==========================

class PoolableObject {
  constructor() {
    this.reset();
  }

  reset(data = null) {
    this.id = data?.id || 0;
    this.value = data?.value || null;
    this.timestamp = data?.timestamp || Date.now();
  }
}

// Singleton instance
const memoryPoolManager = new MemoryPoolManager();

// Initialize common pools
memoryPoolManager.createObjectPool(
  'PoolableObject',
  () => new PoolableObject(),
  (obj, data) => obj.reset(data),
  100
);

memoryPoolManager.createBufferPool(1024, 50);  // 1KB buffers
memoryPoolManager.createBufferPool(4096, 25);  // 4KB buffers
memoryPoolManager.createBufferPool(16384, 10); // 16KB buffers

memoryPoolManager.createTypedArrayPool(Float32Array, 1000, 20);
memoryPoolManager.createTypedArrayPool(Uint8Array, 256, 50);

module.exports = memoryPoolManager;