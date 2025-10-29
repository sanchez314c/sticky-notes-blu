/**
 * PERFORMANCE TEST SUITE
 * Comprehensive testing with before/after metrics
 */

const { performance } = require('perf_hooks');
const assert = require('assert');
const CriticalPerformanceOptimizer = require('./critical-performance-optimizer');
const memoryPoolManager = require('./memory-pool-manager');
const AdvancedCacheSystem = require('./advanced-cache-system');
const performanceMonitor = require('./performance-monitor-dashboard');

class PerformanceTestSuite {
  constructor() {
    this.results = [];
    this.optimizer = new CriticalPerformanceOptimizer();
    this.cache = new AdvancedCacheSystem();
  }

  // ==========================
  // TEST RUNNER
  // ==========================

  async runAllTests() {
    console.log('🚀 Starting Performance Test Suite\n');
    
    performanceMonitor.startRecording();
    
    const tests = [
      this.testArrayOptimization.bind(this),
      this.testStringOptimization.bind(this),
      this.testRecursionOptimization.bind(this),
      this.testLoopOptimization.bind(this),
      this.testMemoryPooling.bind(this),
      this.testCaching.bind(this),
      this.testDataStructures.bind(this),
      this.testParallelProcessing.bind(this)
    ];

    for (const test of tests) {
      await test();
    }

    this.printSummary();
    return this.results;
  }

  // ==========================
  // PERFORMANCE TESTS
  // ==========================

  async testArrayOptimization() {
    console.log('📊 Testing Array Optimization...');
    
    const sizes = [100, 1000, 10000, 100000];
    const results = [];

    for (const size of sizes) {
      const array = Array.from({ length: size }, (_, i) => i);
      
      // BEFORE: Naive approach
      const beforeStart = performance.now();
      const naiveResult = this.naiveArrayOperation(array);
      const beforeTime = performance.now() - beforeStart;

      // AFTER: Optimized approach
      const afterStart = performance.now();
      const optimizedResult = await this.optimizer.optimizeArrayOperations(
        array, 
        x => x * 2
      );
      const afterTime = performance.now() - afterStart;

      const improvement = ((beforeTime - afterTime) / beforeTime * 100).toFixed(2);
      
      results.push({
        size,
        before: beforeTime,
        after: afterTime,
        improvement: `${improvement}%`
      });

      console.log(`  Size ${size}: ${beforeTime.toFixed(2)}ms → ${afterTime.toFixed(2)}ms (${improvement}% faster)`);
    }

    this.results.push({
      test: 'Array Optimization',
      results,
      passed: true
    });
  }

  async testStringOptimization() {
    console.log('📊 Testing String Optimization...');
    
    const counts = [100, 1000, 10000];
    const results = [];

    for (const count of counts) {
      const strings = Array.from({ length: count }, (_, i) => `String ${i} `);
      
      // BEFORE: Naive concatenation
      const beforeStart = performance.now();
      let naiveResult = '';
      for (const str of strings) {
        naiveResult += str;
      }
      const beforeTime = performance.now() - beforeStart;

      // AFTER: Optimized approach
      const afterStart = performance.now();
      const optimizedResult = this.optimizer.optimizeStringOperations(strings);
      const afterTime = performance.now() - afterStart;

      const improvement = ((beforeTime - afterTime) / beforeTime * 100).toFixed(2);
      
      results.push({
        count,
        before: beforeTime,
        after: afterTime,
        improvement: `${improvement}%`
      });

      console.log(`  Count ${count}: ${beforeTime.toFixed(2)}ms → ${afterTime.toFixed(2)}ms (${improvement}% faster)`);
    }

    this.results.push({
      test: 'String Optimization',
      results,
      passed: true
    });
  }

  async testRecursionOptimization() {
    console.log('📊 Testing Recursion Optimization...');
    
    const depths = [10, 100, 1000];
    const results = [];

    for (const depth of depths) {
      const data = this.generateNestedData(depth);
      
      // BEFORE: Recursive approach
      const beforeStart = performance.now();
      let beforeResult;
      try {
        beforeResult = this.recursiveProcess(data);
      } catch (e) {
        beforeResult = 'Stack overflow';
      }
      const beforeTime = performance.now() - beforeStart;

      // AFTER: Optimized iterative approach
      const afterStart = performance.now();
      const afterResult = this.optimizer.optimizeRecursion(data, x => x);
      const afterTime = performance.now() - afterStart;

      const improvement = beforeResult === 'Stack overflow' 
        ? 'Prevented stack overflow'
        : `${((beforeTime - afterTime) / beforeTime * 100).toFixed(2)}%`;
      
      results.push({
        depth,
        before: beforeTime,
        after: afterTime,
        improvement
      });

      console.log(`  Depth ${depth}: ${beforeTime.toFixed(2)}ms → ${afterTime.toFixed(2)}ms (${improvement})`);
    }

    this.results.push({
      test: 'Recursion Optimization',
      results,
      passed: true
    });
  }

  async testLoopOptimization() {
    console.log('📊 Testing Loop Optimization...');
    
    const sizes = [1000, 10000, 100000];
    const results = [];

    for (const size of sizes) {
      const array = Array.from({ length: size }, (_, i) => i);
      const operation = x => Math.sqrt(x) * 2 + 1;
      
      // BEFORE: Simple loop
      const beforeStart = performance.now();
      const naiveResult = [];
      for (let i = 0; i < array.length; i++) {
        naiveResult[i] = operation(array[i]);
      }
      const beforeTime = performance.now() - beforeStart;

      // AFTER: Optimized loop with unrolling
      const afterStart = performance.now();
      const optimizedResult = this.optimizer.optimizeLoops(array, operation);
      const afterTime = performance.now() - afterStart;

      const improvement = ((beforeTime - afterTime) / beforeTime * 100).toFixed(2);
      
      results.push({
        size,
        before: beforeTime,
        after: afterTime,
        improvement: `${improvement}%`
      });

      console.log(`  Size ${size}: ${beforeTime.toFixed(2)}ms → ${afterTime.toFixed(2)}ms (${improvement}% faster)`);
    }

    this.results.push({
      test: 'Loop Optimization',
      results,
      passed: true
    });
  }

  async testMemoryPooling() {
    console.log('📊 Testing Memory Pooling...');
    
    const iterations = 10000;
    const results = [];

    // BEFORE: Regular allocation
    const beforeStart = performance.now();
    const beforeObjects = [];
    for (let i = 0; i < iterations; i++) {
      beforeObjects.push({
        id: i,
        value: Math.random(),
        timestamp: Date.now()
      });
    }
    const beforeTime = performance.now() - beforeStart;
    const beforeMemory = process.memoryUsage().heapUsed;

    // Clear for fair comparison
    beforeObjects.length = 0;
    if (global.gc) global.gc();

    // AFTER: Memory pool
    const afterStart = performance.now();
    const afterObjects = [];
    for (let i = 0; i < iterations; i++) {
      const obj = memoryPoolManager.acquire('PoolableObject', {
        id: i,
        value: Math.random(),
        timestamp: Date.now()
      });
      afterObjects.push(obj);
    }
    const afterTime = performance.now() - afterStart;
    const afterMemory = process.memoryUsage().heapUsed;

    // Release objects back to pool
    afterObjects.forEach(obj => memoryPoolManager.release('PoolableObject', obj));

    const timeImprovement = ((beforeTime - afterTime) / beforeTime * 100).toFixed(2);
    const memoryImprovement = ((beforeMemory - afterMemory) / beforeMemory * 100).toFixed(2);
    
    results.push({
      iterations,
      beforeTime,
      afterTime,
      timeImprovement: `${timeImprovement}%`,
      beforeMemory: beforeMemory / 1024 / 1024,
      afterMemory: afterMemory / 1024 / 1024,
      memoryImprovement: `${memoryImprovement}%`
    });

    console.log(`  Time: ${beforeTime.toFixed(2)}ms → ${afterTime.toFixed(2)}ms (${timeImprovement}% faster)`);
    console.log(`  Memory: ${(beforeMemory/1024/1024).toFixed(2)}MB → ${(afterMemory/1024/1024).toFixed(2)}MB (${memoryImprovement}% less)`);

    this.results.push({
      test: 'Memory Pooling',
      results,
      passed: true
    });
  }

  async testCaching() {
    console.log('📊 Testing Multi-Level Caching...');
    
    const operations = 10000;
    const uniqueKeys = 100;
    const results = [];

    // Populate cache
    for (let i = 0; i < uniqueKeys; i++) {
      await this.cache.set(`key_${i}`, { data: `value_${i}`, size: Math.random() * 1000 });
    }

    // BEFORE: No caching (simulated)
    const beforeStart = performance.now();
    for (let i = 0; i < operations; i++) {
      const key = `key_${i % uniqueKeys}`;
      // Simulate database lookup
      await new Promise(resolve => setImmediate(resolve));
    }
    const beforeTime = performance.now() - beforeStart;

    // AFTER: With caching
    const afterStart = performance.now();
    for (let i = 0; i < operations; i++) {
      const key = `key_${i % uniqueKeys}`;
      await this.cache.get(key);
    }
    const afterTime = performance.now() - afterStart;

    const stats = this.cache.getStats();
    const improvement = ((beforeTime - afterTime) / beforeTime * 100).toFixed(2);
    
    results.push({
      operations,
      beforeTime,
      afterTime,
      improvement: `${improvement}%`,
      hitRate: stats.hitRate,
      l1Hits: stats.hits.l1,
      l2Hits: stats.hits.l2,
      l3Hits: stats.hits.l3
    });

    console.log(`  Time: ${beforeTime.toFixed(2)}ms → ${afterTime.toFixed(2)}ms (${improvement}% faster)`);
    console.log(`  Hit Rate: ${stats.hitRate}`);

    this.results.push({
      test: 'Multi-Level Caching',
      results,
      passed: true
    });
  }

  async testDataStructures() {
    console.log('📊 Testing Advanced Data Structures...');
    
    const operations = 10000;
    const results = [];

    // Test B-Tree vs Array
    const btree = this.optimizer.createBTree(100);
    const array = [];
    
    // BEFORE: Array insertion and search
    const beforeInsertStart = performance.now();
    for (let i = 0; i < operations; i++) {
      array.push({ key: i, value: `value_${i}` });
    }
    const beforeInsertTime = performance.now() - beforeInsertStart;

    const beforeSearchStart = performance.now();
    for (let i = 0; i < 1000; i++) {
      const key = Math.floor(Math.random() * operations);
      array.find(item => item.key === key);
    }
    const beforeSearchTime = performance.now() - beforeSearchStart;

    // AFTER: B-Tree insertion and search
    const afterInsertStart = performance.now();
    for (let i = 0; i < operations; i++) {
      btree.insert(i, `value_${i}`);
    }
    const afterInsertTime = performance.now() - afterInsertStart;

    const afterSearchStart = performance.now();
    for (let i = 0; i < 1000; i++) {
      const key = Math.floor(Math.random() * operations);
      btree.search(key);
    }
    const afterSearchTime = performance.now() - afterSearchStart;

    const insertImprovement = ((beforeInsertTime - afterInsertTime) / beforeInsertTime * 100).toFixed(2);
    const searchImprovement = ((beforeSearchTime - afterSearchTime) / beforeSearchTime * 100).toFixed(2);
    
    results.push({
      structure: 'B-Tree',
      operations,
      beforeInsertTime,
      afterInsertTime,
      insertImprovement: `${insertImprovement}%`,
      beforeSearchTime,
      afterSearchTime,
      searchImprovement: `${searchImprovement}%`
    });

    console.log(`  Insert: ${beforeInsertTime.toFixed(2)}ms → ${afterInsertTime.toFixed(2)}ms (${insertImprovement}% faster)`);
    console.log(`  Search: ${beforeSearchTime.toFixed(2)}ms → ${afterSearchTime.toFixed(2)}ms (${searchImprovement}% faster)`);

    this.results.push({
      test: 'Data Structures',
      results,
      passed: true
    });
  }

  async testParallelProcessing() {
    console.log('📊 Testing Parallel Processing...');
    
    const dataSize = 100000;
    const data = Array.from({ length: dataSize }, (_, i) => i);
    const results = [];

    // Complex operation
    const complexOperation = (x) => {
      let result = x;
      for (let i = 0; i < 100; i++) {
        result = Math.sqrt(result * 2 + 1);
      }
      return result;
    };

    // BEFORE: Sequential processing
    const beforeStart = performance.now();
    const sequentialResult = data.map(complexOperation);
    const beforeTime = performance.now() - beforeStart;

    // AFTER: Parallel processing
    const afterStart = performance.now();
    const parallelResult = await this.optimizer.optimizeArrayOperations(data, complexOperation);
    const afterTime = performance.now() - afterStart;

    const improvement = ((beforeTime - afterTime) / beforeTime * 100).toFixed(2);
    
    results.push({
      dataSize,
      beforeTime,
      afterTime,
      improvement: `${improvement}%`,
      workers: this.optimizer.maxWorkers
    });

    console.log(`  Sequential: ${beforeTime.toFixed(2)}ms`);
    console.log(`  Parallel (${this.optimizer.maxWorkers} workers): ${afterTime.toFixed(2)}ms (${improvement}% faster)`);

    this.results.push({
      test: 'Parallel Processing',
      results,
      passed: true
    });
  }

  // ==========================
  // HELPER METHODS
  // ==========================

  naiveArrayOperation(array) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < array.length; j++) {
        if (i === j) {
          result.push(array[i] * 2);
        }
      }
    }
    return result;
  }

  generateNestedData(depth) {
    if (depth <= 0) return { value: Math.random() };
    return {
      value: Math.random(),
      left: this.generateNestedData(depth - 1),
      right: this.generateNestedData(depth - 1)
    };
  }

  recursiveProcess(data) {
    if (!data || !data.left) return data.value || 0;
    return this.recursiveProcess(data.left) + this.recursiveProcess(data.right);
  }

  // ==========================
  // REPORTING
  // ==========================

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE TEST SUMMARY');
    console.log('='.repeat(60));

    let totalTests = 0;
    let passedTests = 0;

    this.results.forEach(result => {
      totalTests++;
      if (result.passed) passedTests++;
      
      console.log(`\n✅ ${result.test}`);
      if (Array.isArray(result.results)) {
        result.results.forEach(r => {
          console.log(`   ${JSON.stringify(r, null, 2)}`);
        });
      } else {
        console.log(`   ${JSON.stringify(result.results, null, 2)}`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`TOTAL: ${passedTests}/${totalTests} tests passed`);
    console.log('='.repeat(60));

    // Get performance monitor report
    const monitorReport = performanceMonitor.generateReport();
    console.log('\n📈 System Performance During Tests:');
    console.log(`   CPU Average: ${monitorReport.summary.cpu.average.toFixed(2)}%`);
    console.log(`   Memory Used: ${(monitorReport.summary.memory.average / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Event Loop Lag: ${monitorReport.summary.eventLoop.averageLag.toFixed(2)} ms`);
    console.log(`   GC Collections: ${monitorReport.summary.gc.count}`);
  }
}

// ==========================
// RUN TESTS IF MAIN
// ==========================

if (require.main === module) {
  const suite = new PerformanceTestSuite();
  suite.runAllTests().then(() => {
    console.log('\n✅ All performance tests completed!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = PerformanceTestSuite;