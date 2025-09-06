/**
 * Alert Performance Monitor
 * 
 * Utilities for monitoring and optimizing alert system performance
 */

export class AlertPerformanceMonitor {
  constructor() {
    this.metrics = {
      totalAlertsShown: 0,
      averageDisplayTime: 0,
      memoryUsage: [],
      renderTimes: [],
      interactionTimes: []
    };
    
    this.startTime = Date.now();
  }

  /**
   * Track when an alert is shown
   */
  trackAlertShown() {
    this.metrics.totalAlertsShown++;
    
    // Monitor memory usage periodically
    if (performance.memory) {
      this.metrics.memoryUsage.push({
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        timestamp: Date.now()
      });
      
      // Keep only last 100 measurements
      if (this.metrics.memoryUsage.length > 100) {
        this.metrics.memoryUsage.shift();
      }
    }
  }

  /**
   * Track alert render performance
   */
  trackRenderTime(startTime, endTime) {
    const renderTime = endTime - startTime;
    this.metrics.renderTimes.push(renderTime);
    
    // Keep only last 50 measurements
    if (this.metrics.renderTimes.length > 50) {
      this.metrics.renderTimes.shift();
    }
  }

  /**
   * Track user interaction times (touch, click, etc.)
   */
  trackInteractionTime(interactionType, responseTime) {
    this.metrics.interactionTimes.push({
      type: interactionType,
      time: responseTime,
      timestamp: Date.now()
    });
    
    // Keep only last 50 measurements
    if (this.metrics.interactionTimes.length > 50) {
      this.metrics.interactionTimes.shift();
    }
  }

  /**
   * Get performance summary
   */
  getMetrics() {
    const avgRenderTime = this.metrics.renderTimes.length > 0 
      ? this.metrics.renderTimes.reduce((a, b) => a + b, 0) / this.metrics.renderTimes.length 
      : 0;

    const avgInteractionTime = this.metrics.interactionTimes.length > 0
      ? this.metrics.interactionTimes.reduce((a, b) => a + b.time, 0) / this.metrics.interactionTimes.length
      : 0;

    return {
      ...this.metrics,
      avgRenderTime,
      avgInteractionTime,
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Check if performance is within acceptable bounds
   */
  isPerformanceHealthy() {
    const metrics = this.getMetrics();
    
    return {
      renderPerformance: metrics.avgRenderTime < 16, // 60fps threshold
      memoryHealthy: this.isMemoryUsageHealthy(),
      interactionResponsive: metrics.avgInteractionTime < 100 // 100ms threshold
    };
  }

  /**
   * Check memory usage trends
   */
  isMemoryUsageHealthy() {
    if (this.metrics.memoryUsage.length < 10) return true;
    
    const recent = this.metrics.memoryUsage.slice(-10);
    const growth = recent[recent.length - 1].used - recent[0].used;
    
    // Flag if memory grew by more than 5MB in recent measurements
    return growth < 5 * 1024 * 1024;
  }

  /**
   * Clear old metrics to free memory
   */
  cleanup() {
    // Keep only recent metrics
    this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-50);
    this.metrics.renderTimes = this.metrics.renderTimes.slice(-25);
    this.metrics.interactionTimes = this.metrics.interactionTimes.slice(-25);
  }

  /**
   * Log performance warnings if needed
   */
  logPerformanceWarnings() {
    const health = this.isPerformanceHealthy();
    
    if (!health.renderPerformance) {
      console.warn('[AlertSystem] Render performance below 60fps threshold');
    }
    
    if (!health.memoryHealthy) {
      console.warn('[AlertSystem] Memory usage growing rapidly');
    }
    
    if (!health.interactionResponsive) {
      console.warn('[AlertSystem] Interaction response times above 100ms');
    }
  }
}

// Global instance
export const alertPerformanceMonitor = new AlertPerformanceMonitor();

// Hook for using performance monitoring in components
export const useAlertPerformance = () => {
  return {
    trackRender: alertPerformanceMonitor.trackRenderTime.bind(alertPerformanceMonitor),
    trackInteraction: alertPerformanceMonitor.trackInteractionTime.bind(alertPerformanceMonitor),
    getMetrics: alertPerformanceMonitor.getMetrics.bind(alertPerformanceMonitor),
    isHealthy: alertPerformanceMonitor.isPerformanceHealthy.bind(alertPerformanceMonitor)
  };
};
