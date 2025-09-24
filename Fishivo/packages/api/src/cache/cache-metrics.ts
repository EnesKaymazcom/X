/**
 * Cache Performance Metrics & Monitoring
 * Professional monitoring like Facebook/Meta uses
 */

export interface CacheMetrics {
  // Hit/Miss statistics
  hits: number;
  misses: number;
  hitRate: number;
  
  // Operation counters
  gets: number;
  sets: number;
  deletes: number;
  invalidations: number;
  
  // Performance metrics
  avgGetTime: number;
  avgSetTime: number;
  maxGetTime: number;
  maxSetTime: number;
  
  // Memory usage
  l1Size: number;        // Memory cache size
  l2Size: number;        // AsyncStorage cache size
  totalSize: number;     // Combined size
  
  // Error tracking
  errors: number;
  lastError?: string;
  
  // Time-based metrics
  startTime: number;
  lastResetTime: number;
}

export interface CacheAlert {
  type: 'warning' | 'error' | 'info';
  metric: string;
  threshold: number;
  currentValue: number;
  message: string;
  timestamp: number;
}

export class CacheMetricsCollector {
  private static instance: CacheMetricsCollector;
  
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    gets: 0,
    sets: 0,
    deletes: 0,
    invalidations: 0,
    avgGetTime: 0,
    avgSetTime: 0,
    maxGetTime: 0,
    maxSetTime: 0,
    l1Size: 0,
    l2Size: 0,
    totalSize: 0,
    errors: 0,
    startTime: Date.now(),
    lastResetTime: Date.now()
  };
  private getTimes: number[] = [];
  private setTimes: number[] = [];
  private alerts: CacheAlert[] = [];
  
  // Thresholds for alerts
  private readonly THRESHOLDS = {
    LOW_HIT_RATE: 0.7,        // Below 70% hit rate
    HIGH_GET_TIME: 100,       // Above 100ms average get time
    HIGH_SET_TIME: 200,       // Above 200ms average set time
    HIGH_ERROR_RATE: 0.05,    // Above 5% error rate
    MEMORY_WARNING: 0.8       // Above 80% of max memory
  };

  private constructor() {
    this.resetMetrics();
  }

  static getInstance(): CacheMetricsCollector {
    if (!CacheMetricsCollector.instance) {
      CacheMetricsCollector.instance = new CacheMetricsCollector();
    }
    return CacheMetricsCollector.instance;
  }

  // Record cache operations
  recordGet(duration: number, hit: boolean): void {
    this.metrics.gets++;
    if (hit) {
      this.metrics.hits++;
    } else {
      this.metrics.misses++;
    }
    
    this.getTimes.push(duration);
    if (this.getTimes.length > 100) {
      this.getTimes.shift(); // Keep only last 100 measurements
    }
    
    this.updateAverages();
    this.checkThresholds();
  }

  recordSet(duration: number): void {
    this.metrics.sets++;
    this.setTimes.push(duration);
    
    if (this.setTimes.length > 100) {
      this.setTimes.shift();
    }
    
    this.updateAverages();
  }

  recordDelete(): void {
    this.metrics.deletes++;
  }

  recordInvalidation(keysCount: number = 1): void {
    this.metrics.invalidations += keysCount;
  }

  recordError(error: string): void {
    this.metrics.errors++;
    this.metrics.lastError = error;
    
    this.checkErrorRate();
  }

  updateCacheSizes(l1Size: number, l2Size: number): void {
    this.metrics.l1Size = l1Size;
    this.metrics.l2Size = l2Size;
    this.metrics.totalSize = l1Size + l2Size;
    
    this.checkMemoryUsage();
  }

  // Get current metrics
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  // Get alerts
  getAlerts(): CacheAlert[] {
    return [...this.alerts];
  }

  // Get performance summary
  getPerformanceSummary(): {
    hitRate: string;
    avgResponseTime: string;
    totalOperations: number;
    uptime: string;
    alertsCount: number;
  } {
    const now = Date.now();
    const uptimeMs = now - this.metrics.startTime;
    const uptimeHours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      hitRate: `${(this.metrics.hitRate * 100).toFixed(1)}%`,
      avgResponseTime: `${this.metrics.avgGetTime.toFixed(1)}ms`,
      totalOperations: this.metrics.gets + this.metrics.sets + this.metrics.deletes,
      uptime: `${uptimeHours}h ${uptimeMinutes}m`,
      alertsCount: this.alerts.length
    };
  }

  // Export metrics for external monitoring
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      metrics: this.metrics,
      alerts: this.alerts.slice(-10), // Last 10 alerts
      performance: this.getPerformanceSummary()
    }, null, 2);
  }

  // Clear old alerts
  clearOldAlerts(olderThanMs: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThanMs;
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
  }

  // Reset all metrics
  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      gets: 0,
      sets: 0,
      deletes: 0,
      invalidations: 0,
      avgGetTime: 0,
      avgSetTime: 0,
      maxGetTime: 0,
      maxSetTime: 0,
      l1Size: 0,
      l2Size: 0,
      totalSize: 0,
      errors: 0,
      startTime: Date.now(),
      lastResetTime: Date.now()
    };
    
    this.getTimes = [];
    this.setTimes = [];
    this.alerts = [];
  }

  private updateAverages(): void {
    // Update hit rate
    const totalRequests = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = totalRequests > 0 ? this.metrics.hits / totalRequests : 0;
    
    // Update get time averages
    if (this.getTimes.length > 0) {
      const sum = this.getTimes.reduce((a, b) => a + b, 0);
      this.metrics.avgGetTime = sum / this.getTimes.length;
      this.metrics.maxGetTime = Math.max(...this.getTimes);
    }
    
    // Update set time averages
    if (this.setTimes.length > 0) {
      const sum = this.setTimes.reduce((a, b) => a + b, 0);
      this.metrics.avgSetTime = sum / this.setTimes.length;
      this.metrics.maxSetTime = Math.max(...this.setTimes);
    }
  }

  private checkThresholds(): void {
    // Check hit rate
    if (this.metrics.hitRate < this.THRESHOLDS.LOW_HIT_RATE && this.metrics.gets > 50) {
      this.addAlert('warning', 'hitRate', this.THRESHOLDS.LOW_HIT_RATE, this.metrics.hitRate,
        `Low cache hit rate: ${(this.metrics.hitRate * 100).toFixed(1)}%`);
    }
    
    // Check response times
    if (this.metrics.avgGetTime > this.THRESHOLDS.HIGH_GET_TIME) {
      this.addAlert('warning', 'avgGetTime', this.THRESHOLDS.HIGH_GET_TIME, this.metrics.avgGetTime,
        `High average get time: ${this.metrics.avgGetTime.toFixed(1)}ms`);
    }
    
    if (this.metrics.avgSetTime > this.THRESHOLDS.HIGH_SET_TIME) {
      this.addAlert('warning', 'avgSetTime', this.THRESHOLDS.HIGH_SET_TIME, this.metrics.avgSetTime,
        `High average set time: ${this.metrics.avgSetTime.toFixed(1)}ms`);
    }
  }

  private checkErrorRate(): void {
    const totalOps = this.metrics.gets + this.metrics.sets;
    if (totalOps > 0) {
      const errorRate = this.metrics.errors / totalOps;
      if (errorRate > this.THRESHOLDS.HIGH_ERROR_RATE) {
        this.addAlert('error', 'errorRate', this.THRESHOLDS.HIGH_ERROR_RATE, errorRate,
          `High error rate: ${(errorRate * 100).toFixed(1)}%`);
      }
    }
  }

  private checkMemoryUsage(): void {
    // This would check against actual memory limits in a real implementation
    // For now, we'll use a simple size-based check
    const memoryUsageRatio = this.metrics.l1Size / (50 * 1024 * 1024); // 50MB limit
    
    if (memoryUsageRatio > this.THRESHOLDS.MEMORY_WARNING) {
      this.addAlert('warning', 'memoryUsage', this.THRESHOLDS.MEMORY_WARNING, memoryUsageRatio,
        `High memory usage: ${(memoryUsageRatio * 100).toFixed(1)}%`);
    }
  }

  private addAlert(
    type: CacheAlert['type'],
    metric: string,
    threshold: number,
    currentValue: number,
    message: string
  ): void {
    // Don't add duplicate alerts for the same metric within 5 minutes
    const now = Date.now();
    const recentAlert = this.alerts.find(
      alert => alert.metric === metric && 
               alert.type === type && 
               (now - alert.timestamp) < 5 * 60 * 1000
    );
    
    if (!recentAlert) {
      this.alerts.push({
        type,
        metric,
        threshold,
        currentValue,
        message,
        timestamp: now
      });
      
      // Keep only last 50 alerts
      if (this.alerts.length > 50) {
        this.alerts = this.alerts.slice(-50);
      }
      
      // DISABLED - Too noisy
      // if (type === 'error') {
      //   console.error('Cache Alert:', message);
      // } else if (type === 'warning') {
      //   console.warn('Cache Alert:', message);
      // }
    }
  }
}

// Global metrics collector
export const metricsCollector = CacheMetricsCollector.getInstance();

// Helper function to format metrics for display
export function formatMetricsForDisplay(metrics: CacheMetrics): string {
  return `
📊 Cache Metrics:
├─ Hit Rate: ${(metrics.hitRate * 100).toFixed(1)}%
├─ Operations: ${metrics.gets + metrics.sets + metrics.deletes}
├─ Avg Get Time: ${metrics.avgGetTime.toFixed(1)}ms
├─ Avg Set Time: ${metrics.avgSetTime.toFixed(1)}ms
├─ Cache Size: L1=${Math.round(metrics.l1Size / 1024)}KB, L2=${Math.round(metrics.l2Size / 1024)}KB
└─ Errors: ${metrics.errors}
  `.trim();
}