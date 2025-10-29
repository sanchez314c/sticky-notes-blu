/**
 * ADVANCED CACHE SYSTEM
 * Multi-layer caching with intelligent eviction and preloading
 */

const crypto = require('crypto');
const { EventEmitter } = require('events');

class AdvancedCacheSystem extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      l1Size: config.l1Size || 100,        // Hot cache (in-memory)
      l2Size: config.l2Size || 1000,       // Warm cache (in-memory)
      l3Size: config.l3Size || 10000,      // Cold cache (disk/persistent)
      ttl: config.ttl || 3600000,          // Default TTL: 1 hour
      compressionThreshold: config.compressionThreshold || 1024, // Compress if > 1KB
      ...config
    };

    // Multi-level cache structure
    this.l1Cache = new Map(); // Hottest data
    this.l2Cache = new Map(); // Warm data
    this.l3Cache = new Map(); // Cold data (simulated disk)
    
    // Metadata tracking
    this.accessCounts = new Map();
    this.accessTimes = new Map();
    this.sizes = new Map();
    
    // Statistics
    this.stats = {
      hits: { l1: 0, l2: 0, l3: 0 },
      misses: 0,
      evictions: { l1: 0, l2: 0, l3: 0 },
      compressions: 0,
      decompressions: 0
    };

    // Bloom filter for quick existence check
    this.bloomFilter = new BloomFilter(10000, 4);
    
    // Predictive preloading
    this.accessPatterns = new Map();
    this.prefetchQueue = [];
    
    this.startMaintenanceLoop();
  }

  // ==========================
  // CORE CACHE OPERATIONS
  // ==========================

  async get(key, options = {}) {
    const startTime = Date.now();
    
    // Check bloom filter first
    if (!this.bloomFilter.has(key) && !options.skipBloom) {
      this.stats.misses++;
      this.emit('miss', { key, time: Date.now() - startTime });
      return null;
    }

    // L1 Cache (hottest)
    if (this.l1Cache.has(key)) {
      const entry = this.l1Cache.get(key);
      if (this.isValid(entry)) {
        this.stats.hits.l1++;
        this.updateAccessMetadata(key, 'l1');
        this.recordAccessPattern(key);
        this.emit('hit', { key, level: 'l1', time: Date.now() - startTime });
        return this.decompress(entry.value);
      }
      this.l1Cache.delete(key);
    }

    // L2 Cache (warm)
    if (this.l2Cache.has(key)) {
      const entry = this.l2Cache.get(key);
      if (this.isValid(entry)) {
        this.stats.hits.l2++;
        this.promoteToL1(key, entry);
        this.updateAccessMetadata(key, 'l2');
        this.recordAccessPattern(key);
        this.emit('hit', { key, level: 'l2', time: Date.now() - startTime });
        return this.decompress(entry.value);
      }
      this.l2Cache.delete(key);
    }

    // L3 Cache (cold)
    if (this.l3Cache.has(key)) {
      const entry = this.l3Cache.get(key);
      if (this.isValid(entry)) {
        this.stats.hits.l3++;
        this.promoteToL2(key, entry);
        this.updateAccessMetadata(key, 'l3');
        this.recordAccessPattern(key);
        this.emit('hit', { key, level: 'l3', time: Date.now() - startTime });
        return this.decompress(entry.value);
      }
      this.l3Cache.delete(key);
    }

    // Cache miss
    this.stats.misses++;
    this.emit('miss', { key, time: Date.now() - startTime });
    
    // Trigger predictive prefetching
    this.triggerPrefetch(key);
    
    return null;
  }

  async set(key, value, options = {}) {
    const ttl = options.ttl || this.config.ttl;
    const priority = options.priority || 'normal';
    
    // Compress if needed
    const compressed = this.compress(value);
    
    const entry = {
      value: compressed,
      expires: Date.now() + ttl,
      priority,
      compressed: compressed !== value,
      size: this.getSize(compressed)
    };

    // Add to bloom filter
    this.bloomFilter.add(key);
    
    // Update size tracking
    this.sizes.set(key, entry.size);
    
    // Determine initial cache level based on priority
    if (priority === 'high' || this.isHot(key)) {
      this.setL1(key, entry);
    } else if (priority === 'medium' || this.isWarm(key)) {
      this.setL2(key, entry);
    } else {
      this.setL3(key, entry);
    }

    // Update access metadata
    this.updateAccessMetadata(key, 'set');
    
    this.emit('set', { key, size: entry.size, level: this.getCacheLevel(key) });
  }

  async delete(key) {
    this.l1Cache.delete(key);
    this.l2Cache.delete(key);
    this.l3Cache.delete(key);
    this.accessCounts.delete(key);
    this.accessTimes.delete(key);
    this.sizes.delete(key);
    this.bloomFilter.remove(key);
    
    this.emit('delete', { key });
  }

  // ==========================
  // MULTI-LEVEL CACHE MANAGEMENT
  // ==========================

  setL1(key, entry) {
    // Check if L1 is full
    if (this.l1Cache.size >= this.config.l1Size) {
      this.evictFromL1();
    }
    
    this.l1Cache.set(key, entry);
  }

  setL2(key, entry) {
    // Check if L2 is full
    if (this.l2Cache.size >= this.config.l2Size) {
      this.evictFromL2();
    }
    
    this.l2Cache.set(key, entry);
  }

  setL3(key, entry) {
    // Check if L3 is full
    if (this.l3Cache.size >= this.config.l3Size) {
      this.evictFromL3();
    }
    
    this.l3Cache.set(key, entry);
  }

  promoteToL1(key, entry) {
    this.l2Cache.delete(key);
    this.setL1(key, entry);
  }

  promoteToL2(key, entry) {
    this.l3Cache.delete(key);
    this.setL2(key, entry);
  }

  demoteFromL1(key, entry) {
    this.l1Cache.delete(key);
    this.setL2(key, entry);
  }

  demoteFromL2(key, entry) {
    this.l2Cache.delete(key);
    this.setL3(key, entry);
  }

  // ==========================
  // EVICTION STRATEGIES
  // ==========================

  evictFromL1() {
    const victim = this.selectEvictionVictim(this.l1Cache, 'l1');
    if (victim) {
      const entry = this.l1Cache.get(victim);
      this.demoteFromL1(victim, entry);
      this.stats.evictions.l1++;
      this.emit('eviction', { key: victim, level: 'l1', demoted: true });
    }
  }

  evictFromL2() {
    const victim = this.selectEvictionVictim(this.l2Cache, 'l2');
    if (victim) {
      const entry = this.l2Cache.get(victim);
      this.demoteFromL2(victim, entry);
      this.stats.evictions.l2++;
      this.emit('eviction', { key: victim, level: 'l2', demoted: true });
    }
  }

  evictFromL3() {
    const victim = this.selectEvictionVictim(this.l3Cache, 'l3');
    if (victim) {
      this.l3Cache.delete(victim);
      this.bloomFilter.remove(victim);
      this.stats.evictions.l3++;
      this.emit('eviction', { key: victim, level: 'l3', demoted: false });
    }
  }

  selectEvictionVictim(cache, level) {
    // Adaptive Replacement Cache (ARC) algorithm
    let victim = null;
    let minScore = Infinity;

    for (const [key, entry] of cache) {
      // Skip high priority items
      if (entry.priority === 'high') continue;

      const score = this.calculateEvictionScore(key, entry, level);
      if (score < minScore) {
        minScore = score;
        victim = key;
      }
    }

    return victim;
  }

  calculateEvictionScore(key, entry, level) {
    const accessCount = this.accessCounts.get(key) || 0;
    const lastAccess = this.accessTimes.get(key) || 0;
    const age = Date.now() - lastAccess;
    const size = entry.size || 1;

    // Multi-factor scoring:
    // - Frequency (higher is better)
    // - Recency (more recent is better)
    // - Size (smaller is better)
    // - TTL remaining (less time remaining is worse)
    
    const frequencyScore = accessCount;
    const recencyScore = 1 / (age + 1);
    const sizeScore = 1 / size;
    const ttlScore = (entry.expires - Date.now()) / this.config.ttl;

    // Weighted combination
    return (
      frequencyScore * 0.4 +
      recencyScore * 0.3 +
      sizeScore * 0.2 +
      ttlScore * 0.1
    );
  }

  // ==========================
  // COMPRESSION
  // ==========================

  compress(value) {
    const serialized = JSON.stringify(value);
    
    if (serialized.length < this.config.compressionThreshold) {
      return value;
    }

    try {
      const zlib = require('zlib');
      const compressed = zlib.gzipSync(serialized);
      this.stats.compressions++;
      return compressed;
    } catch (error) {
      return value;
    }
  }

  decompress(value) {
    if (!Buffer.isBuffer(value)) {
      return value;
    }

    try {
      const zlib = require('zlib');
      const decompressed = zlib.gunzipSync(value);
      this.stats.decompressions++;
      return JSON.parse(decompressed.toString());
    } catch (error) {
      return value;
    }
  }

  // ==========================
  // PREDICTIVE PREFETCHING
  // ==========================

  recordAccessPattern(key) {
    const patterns = this.accessPatterns.get(key) || [];
    const timestamp = Date.now();
    
    patterns.push({
      time: timestamp,
      subsequent: []
    });

    // Keep only recent patterns
    if (patterns.length > 10) {
      patterns.shift();
    }

    this.accessPatterns.set(key, patterns);

    // Record subsequent accesses for pattern learning
    this.accessPatterns.forEach((patternsArray, otherKey) => {
      if (otherKey !== key) {
        patternsArray.forEach(pattern => {
          if (timestamp - pattern.time < 5000) { // Within 5 seconds
            pattern.subsequent.push(key);
          }
        });
      }
    });
  }

  triggerPrefetch(key) {
    const patterns = this.accessPatterns.get(key);
    if (!patterns || patterns.length === 0) return;

    // Analyze patterns to predict next likely accesses
    const predictions = new Map();
    
    patterns.forEach(pattern => {
      pattern.subsequent.forEach(subsequentKey => {
        predictions.set(subsequentKey, (predictions.get(subsequentKey) || 0) + 1);
      });
    });

    // Prefetch top predictions
    const sortedPredictions = Array.from(predictions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    sortedPredictions.forEach(([predictedKey]) => {
      if (!this.l1Cache.has(predictedKey) && !this.prefetchQueue.includes(predictedKey)) {
        this.prefetchQueue.push(predictedKey);
        this.emit('prefetch', { key: predictedKey, trigger: key });
      }
    });
  }

  // ==========================
  // METADATA & MONITORING
  // ==========================

  updateAccessMetadata(key, operation) {
    const count = this.accessCounts.get(key) || 0;
    this.accessCounts.set(key, count + 1);
    this.accessTimes.set(key, Date.now());
  }

  isHot(key) {
    const count = this.accessCounts.get(key) || 0;
    const lastAccess = this.accessTimes.get(key) || 0;
    const recency = Date.now() - lastAccess;
    
    return count > 10 && recency < 60000; // >10 accesses in last minute
  }

  isWarm(key) {
    const count = this.accessCounts.get(key) || 0;
    const lastAccess = this.accessTimes.get(key) || 0;
    const recency = Date.now() - lastAccess;
    
    return count > 5 && recency < 300000; // >5 accesses in last 5 minutes
  }

  isValid(entry) {
    return entry && entry.expires > Date.now();
  }

  getCacheLevel(key) {
    if (this.l1Cache.has(key)) return 'l1';
    if (this.l2Cache.has(key)) return 'l2';
    if (this.l3Cache.has(key)) return 'l3';
    return null;
  }

  getSize(value) {
    if (Buffer.isBuffer(value)) {
      return value.length;
    }
    return JSON.stringify(value).length;
  }

  // ==========================
  // MAINTENANCE
  // ==========================

  startMaintenanceLoop() {
    // Periodic cleanup
    setInterval(() => {
      this.cleanup();
    }, 60000); // Every minute

    // Periodic rebalancing
    setInterval(() => {
      this.rebalance();
    }, 300000); // Every 5 minutes
  }

  cleanup() {
    let cleaned = 0;
    
    // Clean expired entries from all levels
    [this.l1Cache, this.l2Cache, this.l3Cache].forEach((cache, level) => {
      for (const [key, entry] of cache) {
        if (!this.isValid(entry)) {
          cache.delete(key);
          this.bloomFilter.remove(key);
          cleaned++;
        }
      }
    });

    if (cleaned > 0) {
      this.emit('cleanup', { removed: cleaned });
    }
  }

  rebalance() {
    // Move hot items up, cold items down
    const movements = [];

    // Check L2 for hot items
    for (const [key, entry] of this.l2Cache) {
      if (this.isHot(key)) {
        movements.push({ key, entry, from: 'l2', to: 'l1' });
      }
    }

    // Check L3 for warm items
    for (const [key, entry] of this.l3Cache) {
      if (this.isWarm(key)) {
        movements.push({ key, entry, from: 'l3', to: 'l2' });
      }
    }

    // Check L1 for cold items
    for (const [key, entry] of this.l1Cache) {
      if (!this.isWarm(key)) {
        movements.push({ key, entry, from: 'l1', to: 'l2' });
      }
    }

    // Execute movements
    movements.forEach(({ key, entry, from, to }) => {
      if (from === 'l1') this.l1Cache.delete(key);
      if (from === 'l2') this.l2Cache.delete(key);
      if (from === 'l3') this.l3Cache.delete(key);

      if (to === 'l1') this.setL1(key, entry);
      if (to === 'l2') this.setL2(key, entry);
      if (to === 'l3') this.setL3(key, entry);
    });

    if (movements.length > 0) {
      this.emit('rebalance', { movements: movements.length });
    }
  }

  // ==========================
  // STATISTICS
  // ==========================

  getStats() {
    const totalHits = this.stats.hits.l1 + this.stats.hits.l2 + this.stats.hits.l3;
    const totalRequests = totalHits + this.stats.misses;
    
    return {
      ...this.stats,
      hitRate: totalRequests > 0 ? (totalHits / totalRequests * 100).toFixed(2) + '%' : '0%',
      sizes: {
        l1: this.l1Cache.size,
        l2: this.l2Cache.size,
        l3: this.l3Cache.size
      },
      memory: {
        l1: Array.from(this.l1Cache.values()).reduce((sum, e) => sum + e.size, 0),
        l2: Array.from(this.l2Cache.values()).reduce((sum, e) => sum + e.size, 0),
        l3: Array.from(this.l3Cache.values()).reduce((sum, e) => sum + e.size, 0)
      }
    };
  }

  clear() {
    this.l1Cache.clear();
    this.l2Cache.clear();
    this.l3Cache.clear();
    this.accessCounts.clear();
    this.accessTimes.clear();
    this.sizes.clear();
    this.accessPatterns.clear();
    this.bloomFilter.clear();
    this.prefetchQueue = [];
    
    this.emit('clear');
  }
}

// ==========================
// BLOOM FILTER
// ==========================

class BloomFilter {
  constructor(size, hashCount) {
    this.size = size;
    this.hashCount = hashCount;
    this.bits = new Uint8Array(Math.ceil(size / 8));
  }

  hash(value, seed) {
    const hash = crypto.createHash('sha256');
    hash.update(value + seed);
    return parseInt(hash.digest('hex').slice(0, 8), 16) % this.size;
  }

  add(key) {
    for (let i = 0; i < this.hashCount; i++) {
      const index = this.hash(key, i);
      const byteIndex = Math.floor(index / 8);
      const bitIndex = index % 8;
      this.bits[byteIndex] |= (1 << bitIndex);
    }
  }

  has(key) {
    for (let i = 0; i < this.hashCount; i++) {
      const index = this.hash(key, i);
      const byteIndex = Math.floor(index / 8);
      const bitIndex = index % 8;
      if (!(this.bits[byteIndex] & (1 << bitIndex))) {
        return false;
      }
    }
    return true;
  }

  remove(key) {
    // Bloom filters don't support removal, but we track for consistency
    // In production, you'd use a counting bloom filter
  }

  clear() {
    this.bits.fill(0);
  }
}

module.exports = AdvancedCacheSystem;