/**
 * PERFORMANCE MONITORING DASHBOARD
 * Real-time performance metrics and visualization
 */

const { performance, PerformanceObserver } = require('perf_hooks');
const { EventEmitter } = require('events');
const os = require('os');
const v8 = require('v8');

class PerformanceMonitorDashboard extends EventEmitter {
  constructor() {
    super();
    
    this.metrics = {
      cpu: [],
      memory: [],
      eventLoop: [],
      gc: [],
      network: [],
      disk: [],
      custom: new Map()
    };

    this.thresholds = {
      cpu: 80,           // CPU usage %
      memory: 90,        // Memory usage %
      eventLoopLag: 100, // ms
      gcPause: 50        // ms
    };

    this.alerts = [];
    this.recording = false;
    this.startTime = Date.now();
    
    this.initializeMonitoring();
  }

  // ==========================
  // INITIALIZATION
  // ==========================

  initializeMonitoring() {
    this.setupCPUMonitoring();
    this.setupMemoryMonitoring();
    this.setupEventLoopMonitoring();
    this.setupGCMonitoring();
    this.setupPerformanceObserver();
    this.setupProcessMonitoring();
  }

  // ==========================
  // CPU MONITORING
  // ==========================

  setupCPUMonitoring() {
    let previousCPU = process.cpuUsage();
    
    setInterval(() => {
      const currentCPU = process.cpuUsage(previousCPU);
      const totalCPU = currentCPU.user + currentCPU.system;
      const cpuPercent = (totalCPU / 1000000) * 100; // Convert to percentage
      
      const cpuData = {
        timestamp: Date.now(),
        user: currentCPU.user,
        system: currentCPU.system,
        percent: cpuPercent,
        cores: os.cpus().map(cpu => ({
          model: cpu.model,
          speed: cpu.speed,
          times: cpu.times
        }))
      };

      this.recordMetric('cpu', cpuData);
      
      if (cpuPercent > this.thresholds.cpu) {
        this.triggerAlert('CPU', `High CPU usage: ${cpuPercent.toFixed(2)}%`);
      }

      previousCPU = process.cpuUsage();
    }, 1000);
  }

  // ==========================
  // MEMORY MONITORING
  // ==========================

  setupMemoryMonitoring() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const heapStats = v8.getHeapStatistics();
      const heapSpaces = v8.getHeapSpaceStatistics();
      
      const memoryData = {
        timestamp: Date.now(),
        process: {
          rss: memUsage.rss,
          heapTotal: memUsage.heapTotal,
          heapUsed: memUsage.heapUsed,
          external: memUsage.external,
          arrayBuffers: memUsage.arrayBuffers
        },
        system: {
          total: totalMem,
          free: freeMem,
          used: totalMem - freeMem,
          percentUsed: ((totalMem - freeMem) / totalMem * 100)
        },
        heap: {
          totalHeapSize: heapStats.total_heap_size,
          totalHeapSizeExecutable: heapStats.total_heap_size_executable,
          totalPhysicalSize: heapStats.total_physical_size,
          totalAvailableSize: heapStats.total_available_size,
          usedHeapSize: heapStats.used_heap_size,
          heapSizeLimit: heapStats.heap_size_limit,
          mallocedMemory: heapStats.malloced_memory,
          peakMallocedMemory: heapStats.peak_malloced_memory,
          doesZapGarbage: heapStats.does_zap_garbage
        },
        spaces: heapSpaces.map(space => ({
          spaceName: space.space_name,
          spaceSize: space.space_size,
          spaceUsedSize: space.space_used_size,
          spaceAvailableSize: space.space_available_size,
          physicalSpaceSize: space.physical_space_size
        }))
      };

      this.recordMetric('memory', memoryData);
      
      const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      if (heapPercent > this.thresholds.memory) {
        this.triggerAlert('Memory', `High memory usage: ${heapPercent.toFixed(2)}%`);
      }
    }, 5000);
  }

  // ==========================
  // EVENT LOOP MONITORING
  // ==========================

  setupEventLoopMonitoring() {
    let lastCheck = Date.now();
    
    const checkEventLoop = () => {
      const now = Date.now();
      const delay = now - lastCheck - 100; // Expected 100ms interval
      
      if (delay > 0) {
        const eventLoopData = {
          timestamp: now,
          lag: delay,
          blocked: delay > 50
        };

        this.recordMetric('eventLoop', eventLoopData);
        
        if (delay > this.thresholds.eventLoopLag) {
          this.triggerAlert('EventLoop', `Event loop lag: ${delay}ms`);
        }
      }

      lastCheck = now;
      setTimeout(checkEventLoop, 100);
    };

    setTimeout(checkEventLoop, 100);
  }

  // ==========================
  // GARBAGE COLLECTION MONITORING
  // ==========================

  setupGCMonitoring() {
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'gc') {
          const gcData = {
            timestamp: Date.now(),
            duration: entry.duration,
            type: this.getGCType(entry.kind),
            flags: entry.flags
          };

          this.recordMetric('gc', gcData);
          
          if (entry.duration > this.thresholds.gcPause) {
            this.triggerAlert('GC', `Long GC pause: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
    });

    obs.observe({ entryTypes: ['gc'], buffered: true });
  }

  getGCType(kind) {
    const types = {
      1: 'Scavenge',
      2: 'Mark/Sweep/Compact',
      4: 'Incremental marking',
      8: 'Weak/Phantom callback processing',
      15: 'All'
    };
    return types[kind] || 'Unknown';
  }

  // ==========================
  // PERFORMANCE OBSERVER
  // ==========================

  setupPerformanceObserver() {
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          this.recordCustomMetric(entry.name, {
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });
    });

    obs.observe({ entryTypes: ['measure', 'mark'], buffered: true });
  }

  // ==========================
  // PROCESS MONITORING
  // ==========================

  setupProcessMonitoring() {
    // Monitor unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.triggerAlert('Process', `Unhandled rejection: ${reason}`);
    });

    // Monitor uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.triggerAlert('Process', `Uncaught exception: ${error.message}`);
    });

    // Monitor warnings
    process.on('warning', (warning) => {
      this.triggerAlert('Process', `Warning: ${warning.message}`);
    });
  }

  // ==========================
  // CUSTOM METRICS
  // ==========================

  startTimer(name) {
    performance.mark(`${name}-start`);
  }

  endTimer(name) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }

  recordCustomMetric(name, value) {
    if (!this.metrics.custom.has(name)) {
      this.metrics.custom.set(name, []);
    }
    
    const metric = {
      timestamp: Date.now(),
      value: typeof value === 'object' ? value : { value }
    };
    
    this.metrics.custom.get(name).push(metric);
    this.trimMetrics(this.metrics.custom.get(name));
  }

  // ==========================
  // DATA MANAGEMENT
  // ==========================

  recordMetric(type, data) {
    if (!this.metrics[type]) {
      this.metrics[type] = [];
    }
    
    this.metrics[type].push(data);
    this.trimMetrics(this.metrics[type]);
    
    this.emit('metric', { type, data });
  }

  trimMetrics(metricArray, maxSize = 1000) {
    if (metricArray.length > maxSize) {
      metricArray.splice(0, metricArray.length - maxSize);
    }
  }

  // ==========================
  // ALERTING
  // ==========================

  triggerAlert(type, message) {
    const alert = {
      timestamp: Date.now(),
      type,
      message,
      resolved: false
    };
    
    this.alerts.push(alert);
    this.emit('alert', alert);
    
    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
  }

  setThreshold(metric, value) {
    this.thresholds[metric] = value;
  }

  // ==========================
  // REPORTING
  // ==========================

  generateReport(duration = 60000) {
    const now = Date.now();
    const startTime = now - duration;
    
    const report = {
      timestamp: now,
      duration,
      summary: this.generateSummary(startTime, now),
      details: this.generateDetails(startTime, now),
      alerts: this.getRecentAlerts(startTime, now),
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  generateSummary(startTime, endTime) {
    const cpuMetrics = this.filterMetrics(this.metrics.cpu, startTime, endTime);
    const memoryMetrics = this.filterMetrics(this.metrics.memory, startTime, endTime);
    const eventLoopMetrics = this.filterMetrics(this.metrics.eventLoop, startTime, endTime);
    const gcMetrics = this.filterMetrics(this.metrics.gc, startTime, endTime);
    
    return {
      cpu: {
        average: this.average(cpuMetrics.map(m => m.percent)),
        max: Math.max(...cpuMetrics.map(m => m.percent)),
        min: Math.min(...cpuMetrics.map(m => m.percent))
      },
      memory: {
        average: this.average(memoryMetrics.map(m => m.process.heapUsed)),
        max: Math.max(...memoryMetrics.map(m => m.process.heapUsed)),
        min: Math.min(...memoryMetrics.map(m => m.process.heapUsed))
      },
      eventLoop: {
        averageLag: this.average(eventLoopMetrics.map(m => m.lag)),
        maxLag: Math.max(...eventLoopMetrics.map(m => m.lag)),
        blocked: eventLoopMetrics.filter(m => m.blocked).length
      },
      gc: {
        count: gcMetrics.length,
        totalPause: gcMetrics.reduce((sum, m) => sum + m.duration, 0),
        averagePause: this.average(gcMetrics.map(m => m.duration))
      }
    };
  }

  generateDetails(startTime, endTime) {
    return {
      cpu: this.filterMetrics(this.metrics.cpu, startTime, endTime),
      memory: this.filterMetrics(this.metrics.memory, startTime, endTime),
      eventLoop: this.filterMetrics(this.metrics.eventLoop, startTime, endTime),
      gc: this.filterMetrics(this.metrics.gc, startTime, endTime),
      custom: this.filterCustomMetrics(startTime, endTime)
    };
  }

  generateRecommendations() {
    const recommendations = [];
    const recentCPU = this.getRecentMetrics('cpu', 10);
    const recentMemory = this.getRecentMetrics('memory', 10);
    const recentEventLoop = this.getRecentMetrics('eventLoop', 10);
    
    // CPU recommendations
    if (recentCPU.length > 0) {
      const avgCPU = this.average(recentCPU.map(m => m.percent));
      if (avgCPU > 70) {
        recommendations.push({
          type: 'CPU',
          severity: 'high',
          message: 'Consider optimizing CPU-intensive operations or scaling horizontally'
        });
      }
    }
    
    // Memory recommendations
    if (recentMemory.length > 0) {
      const avgHeapUsed = this.average(recentMemory.map(m => m.process.heapUsed));
      const avgHeapTotal = this.average(recentMemory.map(m => m.process.heapTotal));
      const heapUtilization = (avgHeapUsed / avgHeapTotal) * 100;
      
      if (heapUtilization > 80) {
        recommendations.push({
          type: 'Memory',
          severity: 'high',
          message: 'High heap utilization detected. Consider memory optimization or increasing heap size'
        });
      }
    }
    
    // Event loop recommendations
    if (recentEventLoop.length > 0) {
      const blockedCount = recentEventLoop.filter(m => m.blocked).length;
      if (blockedCount > 5) {
        recommendations.push({
          type: 'EventLoop',
          severity: 'medium',
          message: 'Event loop blocking detected. Consider using worker threads for CPU-intensive tasks'
        });
      }
    }
    
    return recommendations;
  }

  // ==========================
  // UTILITIES
  // ==========================

  filterMetrics(metrics, startTime, endTime) {
    return metrics.filter(m => m.timestamp >= startTime && m.timestamp <= endTime);
  }

  filterCustomMetrics(startTime, endTime) {
    const filtered = {};
    
    this.metrics.custom.forEach((metrics, name) => {
      filtered[name] = this.filterMetrics(metrics, startTime, endTime);
    });
    
    return filtered;
  }

  getRecentMetrics(type, count = 10) {
    const metrics = this.metrics[type] || [];
    return metrics.slice(-count);
  }

  getRecentAlerts(startTime, endTime) {
    return this.alerts.filter(a => a.timestamp >= startTime && a.timestamp <= endTime);
  }

  average(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  // ==========================
  // EXPORT & VISUALIZATION
  // ==========================

  exportMetrics(format = 'json') {
    const data = {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      metrics: this.metrics,
      alerts: this.alerts,
      thresholds: this.thresholds
    };
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(data);
    }
    
    return data;
  }

  convertToCSV(data) {
    // Simplified CSV conversion for metrics
    const rows = [];
    rows.push('Timestamp,Type,Value');
    
    Object.entries(data.metrics).forEach(([type, metrics]) => {
      if (Array.isArray(metrics)) {
        metrics.forEach(metric => {
          rows.push(`${metric.timestamp},${type},${JSON.stringify(metric)}`);
        });
      }
    });
    
    return rows.join('\n');
  }

  getDashboardHTML() {
    const report = this.generateReport();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Performance Dashboard</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #1a1a1a; color: #fff; }
          .metric { background: #2a2a2a; padding: 15px; margin: 10px 0; border-radius: 8px; }
          .metric h3 { margin-top: 0; color: #4CAF50; }
          .value { font-size: 24px; font-weight: bold; }
          .alert { background: #f44336; padding: 10px; margin: 5px 0; border-radius: 4px; }
          .recommendation { background: #ff9800; padding: 10px; margin: 5px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>Performance Monitoring Dashboard</h1>
        
        <div class="metric">
          <h3>CPU Usage</h3>
          <div class="value">${report.summary.cpu.average.toFixed(2)}%</div>
          <div>Max: ${report.summary.cpu.max.toFixed(2)}% | Min: ${report.summary.cpu.min.toFixed(2)}%</div>
        </div>
        
        <div class="metric">
          <h3>Memory Usage</h3>
          <div class="value">${(report.summary.memory.average / 1024 / 1024).toFixed(2)} MB</div>
          <div>Max: ${(report.summary.memory.max / 1024 / 1024).toFixed(2)} MB</div>
        </div>
        
        <div class="metric">
          <h3>Event Loop</h3>
          <div class="value">${report.summary.eventLoop.averageLag.toFixed(2)} ms</div>
          <div>Max Lag: ${report.summary.eventLoop.maxLag} ms | Blocked: ${report.summary.eventLoop.blocked}</div>
        </div>
        
        <div class="metric">
          <h3>Garbage Collection</h3>
          <div class="value">${report.summary.gc.count} collections</div>
          <div>Total Pause: ${report.summary.gc.totalPause.toFixed(2)} ms | Avg: ${report.summary.gc.averagePause.toFixed(2)} ms</div>
        </div>
        
        <h2>Recent Alerts</h2>
        ${report.alerts.map(alert => `
          <div class="alert">
            ${new Date(alert.timestamp).toLocaleTimeString()} - ${alert.type}: ${alert.message}
          </div>
        `).join('')}
        
        <h2>Recommendations</h2>
        ${report.recommendations.map(rec => `
          <div class="recommendation">
            ${rec.type} (${rec.severity}): ${rec.message}
          </div>
        `).join('')}
        
        <script>
          // Auto-refresh every 5 seconds
          setTimeout(() => location.reload(), 5000);
        </script>
      </body>
      </html>
    `;
  }

  // ==========================
  // CONTROL
  // ==========================

  startRecording() {
    this.recording = true;
    this.emit('recording', { started: true });
  }

  stopRecording() {
    this.recording = false;
    this.emit('recording', { started: false });
  }

  reset() {
    this.metrics = {
      cpu: [],
      memory: [],
      eventLoop: [],
      gc: [],
      network: [],
      disk: [],
      custom: new Map()
    };
    this.alerts = [];
    this.startTime = Date.now();
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitorDashboard();

module.exports = performanceMonitor;