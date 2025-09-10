/**
 * Advanced Connection Manager for Real-Time WebSocket Connections
 * 
 * Provides sophisticated connection management including:
 * - Intelligent exponential backoff with jitter
 * - Connection quality monitoring and assessment
 * - Mobile-specific optimizations
 * - Background state management
 * - Performance monitoring and optimization
 */

/**
 * Connection quality states
 */
export const CONNECTION_QUALITY = {
  EXCELLENT: 'excellent',   // < 100ms response, stable
  GOOD: 'good',            // 100-300ms response, mostly stable  
  FAIR: 'fair',            // 300-1000ms response, some instability
  POOR: 'poor',            // > 1000ms response, frequent disconnects
  UNKNOWN: 'unknown'       // Insufficient data
};

/**
 * Connection states with enhanced information
 */
export const CONNECTION_STATE = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting', 
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  FAILED: 'failed',
  SUSPENDED: 'suspended'    // Intentionally paused (background/battery)
};

/**
 * Reconnection strategy types
 */
export const RECONNECTION_STRATEGY = {
  IMMEDIATE: 'immediate',       // For good connections
  EXPONENTIAL: 'exponential',   // Standard backoff
  ADAPTIVE: 'adaptive',         // Based on connection quality
  AGGRESSIVE: 'aggressive',     // For critical operations
  CONSERVATIVE: 'conservative'  // For poor connections/mobile
};

/**
 * Enhanced Connection Manager Class
 */
export class ConnectionManager {
  constructor(options = {}) {
    // Configuration with intelligent defaults
    this.config = {
      maxReconnectAttempts: options.maxReconnectAttempts || 10,
      baseDelay: options.baseDelay || 1000,           // 1 second base
      maxDelay: options.maxDelay || 60000,            // 1 minute max
      jitterFactor: options.jitterFactor || 0.3,     // 30% randomization
      qualityCheckInterval: options.qualityCheckInterval || 30000, // 30 seconds
      connectionTimeout: options.connectionTimeout || 10000,      // 10 seconds
      heartbeatInterval: options.heartbeatInterval || 15000,      // 15 seconds
      ...options
    };

    // Connection state
    this.state = CONNECTION_STATE.DISCONNECTED;
    this.quality = CONNECTION_QUALITY.UNKNOWN;
    this.strategy = RECONNECTION_STRATEGY.EXPONENTIAL;
    
    // Attempt tracking
    this.attemptCount = 0;
    this.successCount = 0;
    this.failureCount = 0;
    this.lastConnectTime = null;
    this.lastDisconnectTime = null;
    
    // Quality metrics
    this.connectionMetrics = {
      responseTimes: [],
      disconnectCount: 0,
      avgResponseTime: 0,
      stabilityScore: 0,
      lastQualityCheck: Date.now()
    };
    
    // Mobile and environment detection
    this.isMobile = this.detectMobile();
    this.isBackground = false;
    this.networkType = this.detectNetworkType();
    
    // Timers and cleanup
    this.reconnectTimer = null;
    this.qualityTimer = null;
    this.heartbeatTimer = null;
    
    // Event listeners for mobile optimization
    this.setupEnvironmentListeners();
  }

  /**
   * Detect if running on mobile device
   */
  detectMobile() {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  }

  /**
   * Detect network connection type
   */
  detectNetworkType() {
    if (typeof navigator !== 'undefined' && navigator.connection) {
      return navigator.connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  /**
   * Setup environment listeners for mobile optimization
   */
  setupEnvironmentListeners() {
    if (typeof window === 'undefined') return;

    // Page visibility for background detection
    document.addEventListener('visibilitychange', () => {
      this.isBackground = document.hidden;
      this.handleVisibilityChange();
    });

    // Network change detection
    if (navigator.connection) {
      navigator.connection.addEventListener('change', () => {
        this.networkType = this.detectNetworkType();
        this.handleNetworkChange();
      });
    }

    // Online/offline detection
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  /**
   * Calculate next delay with intelligent backoff
   */
  calculateDelay(attemptNumber, strategy = null) {
    const currentStrategy = strategy || this.strategy;
    let delay;

    switch (currentStrategy) {
      case RECONNECTION_STRATEGY.IMMEDIATE:
        delay = 0;
        break;
        
      case RECONNECTION_STRATEGY.EXPONENTIAL:
        delay = Math.min(
          this.config.baseDelay * Math.pow(2, attemptNumber),
          this.config.maxDelay
        );
        break;
        
      case RECONNECTION_STRATEGY.ADAPTIVE: {
        // Adjust based on connection quality
        const qualityMultiplier = this.getQualityMultiplier();
        delay = Math.min(
          this.config.baseDelay * Math.pow(2, attemptNumber) * qualityMultiplier,
          this.config.maxDelay
        );
        break;
      }
        
      case RECONNECTION_STRATEGY.AGGRESSIVE:
        delay = Math.min(
          this.config.baseDelay * Math.pow(1.5, attemptNumber),
          this.config.maxDelay / 2
        );
        break;
        
      case RECONNECTION_STRATEGY.CONSERVATIVE:
        delay = Math.min(
          this.config.baseDelay * Math.pow(3, attemptNumber),
          this.config.maxDelay * 2
        );
        break;
        
      default:
        delay = this.config.baseDelay * Math.pow(2, attemptNumber);
    }

    // Add jitter to prevent thundering herd
    const jitter = delay * this.config.jitterFactor * (Math.random() - 0.5);
    delay = Math.max(0, delay + jitter);

    // Mobile optimizations
    if (this.isMobile) {
      delay = this.applyMobileOptimizations(delay);
    }

    return Math.round(delay);
  }

  /**
   * Get quality-based delay multiplier
   */
  getQualityMultiplier() {
    switch (this.quality) {
      case CONNECTION_QUALITY.EXCELLENT:
        return 0.5;  // Faster reconnection for good connections
      case CONNECTION_QUALITY.GOOD:
        return 0.8;
      case CONNECTION_QUALITY.FAIR:
        return 1.2;
      case CONNECTION_QUALITY.POOR:
        return 2.0;  // Slower reconnection for poor connections
      default:
        return 1.0;
    }
  }

  /**
   * Apply mobile-specific optimizations to delay
   */
  applyMobileOptimizations(delay) {
    // Longer delays in background to save battery
    if (this.isBackground) {
      delay *= 2;
    }

    // Adjust based on network type
    switch (this.networkType) {
      case 'slow-2g':
        delay *= 3;
        break;
      case '2g':
        delay *= 2;
        break;
      case '3g':
        delay *= 1.5;
        break;
      case '4g':
      case '5g':
        // No adjustment for fast networks
        break;
      default:
        delay *= 1.2; // Conservative for unknown
    }

    return delay;
  }

  /**
   * Assess connection quality based on metrics
   */
  assessConnectionQuality() {
    const metrics = this.connectionMetrics;
    
    if (metrics.responseTimes.length < 3) {
      this.quality = CONNECTION_QUALITY.UNKNOWN;
      return;
    }

    const avgResponseTime = metrics.avgResponseTime;
    const disconnectRate = metrics.disconnectCount / (this.successCount + this.failureCount + 1);
    
    // Quality scoring based on response time and stability
    if (avgResponseTime < 100 && disconnectRate < 0.1) {
      this.quality = CONNECTION_QUALITY.EXCELLENT;
    } else if (avgResponseTime < 300 && disconnectRate < 0.2) {
      this.quality = CONNECTION_QUALITY.GOOD;
    } else if (avgResponseTime < 1000 && disconnectRate < 0.4) {
      this.quality = CONNECTION_QUALITY.FAIR;
    } else {
      this.quality = CONNECTION_QUALITY.POOR;
    }

    // Adjust strategy based on quality
    this.adjustStrategy();
  }

  /**
   * Adjust reconnection strategy based on connection quality
   */
  adjustStrategy() {
    switch (this.quality) {
      case CONNECTION_QUALITY.EXCELLENT:
        this.strategy = RECONNECTION_STRATEGY.IMMEDIATE;
        break;
      case CONNECTION_QUALITY.GOOD:
        this.strategy = RECONNECTION_STRATEGY.EXPONENTIAL;
        break;
      case CONNECTION_QUALITY.FAIR:
        this.strategy = RECONNECTION_STRATEGY.ADAPTIVE;
        break;
      case CONNECTION_QUALITY.POOR:
        this.strategy = this.isMobile ? 
          RECONNECTION_STRATEGY.CONSERVATIVE : 
          RECONNECTION_STRATEGY.ADAPTIVE;
        break;
      default:
        this.strategy = RECONNECTION_STRATEGY.EXPONENTIAL;
    }
  }

  /**
   * Record connection metrics for quality assessment
   */
  recordConnectionMetric(responseTime, success = true) {
    const metrics = this.connectionMetrics;
    
    if (success && responseTime) {
      metrics.responseTimes.push(responseTime);
      
      // Keep only last 20 measurements
      if (metrics.responseTimes.length > 20) {
        metrics.responseTimes.shift();
      }
      
      // Calculate average
      metrics.avgResponseTime = 
        metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
    }

    // Update quality periodically
    const now = Date.now();
    if (now - metrics.lastQualityCheck > this.config.qualityCheckInterval) {
      this.assessConnectionQuality();
      metrics.lastQualityCheck = now;
    }
  }

  /**
   * Handle connection success
   */
  onConnectionSuccess(responseTime = null) {
    this.state = CONNECTION_STATE.CONNECTED;
    this.successCount++;
    this.attemptCount = 0; // Reset on success
    this.lastConnectTime = Date.now();
    
    if (responseTime) {
      this.recordConnectionMetric(responseTime, true);
    }

    this.clearTimers();
  }

  /**
   * Handle connection failure
   */
  onConnectionFailure(_error = null) {
    this.state = CONNECTION_STATE.DISCONNECTED;
    this.failureCount++;
    this.lastDisconnectTime = Date.now();
    this.connectionMetrics.disconnectCount++;
    
    this.recordConnectionMetric(null, false);
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnection(callback, options = {}) {
    if (this.state === CONNECTION_STATE.SUSPENDED) {
      console.warn('[ConnectionManager] Reconnection suspended');
      return null;
    }

    if (this.state === CONNECTION_STATE.FAILED) {
      console.warn('[ConnectionManager] Connection failed, not attempting reconnection');
      return null;
    }

    if (this.state === CONNECTION_STATE.RECONNECTING || this.state === CONNECTION_STATE.CONNECTING) {
      console.warn('[ConnectionManager] Reconnection already in progress');
      return null;
    }

    if (this.reconnectTimer) {
      console.warn('[ConnectionManager] Reconnection timer already active');
      return null;
    }

    if (this.attemptCount >= this.config.maxReconnectAttempts) {
      console.warn('[ConnectionManager] Max reconnection attempts reached');
      this.state = CONNECTION_STATE.FAILED;
      return null;
    }

    const delay = this.calculateDelay(this.attemptCount, options.strategy);
    this.attemptCount++;
    this.state = CONNECTION_STATE.RECONNECTING;

    console.warn(
      `[ConnectionManager] Scheduling reconnection attempt ${this.attemptCount}/${this.config.maxReconnectAttempts} ` +
      `in ${delay}ms (strategy: ${this.strategy}, quality: ${this.quality})`
    );

    this.reconnectTimer = setTimeout(() => {
      if (this.state === CONNECTION_STATE.RECONNECTING) {
        this.state = CONNECTION_STATE.CONNECTING;
        callback();
      }
    }, delay);

    return {
      attemptNumber: this.attemptCount,
      delay,
      strategy: this.strategy,
      quality: this.quality
    };
  }

  /**
   * Cancel scheduled reconnection
   */
  cancelReconnection() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.state === CONNECTION_STATE.RECONNECTING) {
      this.state = CONNECTION_STATE.DISCONNECTED;
    }
  }

  /**
   * Reset the connection manager to allow fresh reconnection attempts
   */
  reset() {
    this.cancelReconnection();
    this.attemptCount = 0;
    this.state = CONNECTION_STATE.DISCONNECTED;
    this.quality = CONNECTION_QUALITY.UNKNOWN;
    this.connectionMetrics.responseTimes = [];
    this.connectionMetrics.disconnectCount = 0;
    console.warn('[ConnectionManager] Reset - ready for fresh connection attempts');
  }

  /**
   * Suspend reconnection attempts (e.g., for background state)
   */
  suspend() {
    this.state = CONNECTION_STATE.SUSPENDED;
    this.clearTimers();
  }

  /**
   * Resume reconnection attempts
   */
  resume() {
    if (this.state === CONNECTION_STATE.SUSPENDED) {
      this.state = CONNECTION_STATE.DISCONNECTED;
    }
  }

  /**
   * Environment event handlers
   */
  handleVisibilityChange() {
    if (this.isBackground) {
      // Suspend aggressive reconnection in background
      if (this.isMobile && this.state === CONNECTION_STATE.RECONNECTING) {
        this.cancelReconnection();
        this.suspend();
      }
    } else {
      // Resume when coming back to foreground
      this.resume();
    }
  }

  handleNetworkChange() {
    // Reset quality assessment on network change
    this.quality = CONNECTION_QUALITY.UNKNOWN;
    this.connectionMetrics.responseTimes = [];
    
    // Trigger immediate reconnection attempt on network improvement
    if (['4g', '5g'].includes(this.networkType) && 
        this.state === CONNECTION_STATE.DISCONNECTED) {
      this.attemptCount = Math.max(0, this.attemptCount - 2); // Reduce attempt count
    }
  }

  handleOnline() {
    this.resume();
    // Reset attempt count for immediate retry when coming back online
    this.attemptCount = 0;
  }

  handleOffline() {
    this.suspend();
  }

  /**
   * Clean up timers
   */
  clearTimers() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.qualityTimer) {
      clearTimeout(this.qualityTimer);
      this.qualityTimer = null;
    }
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Get current connection statistics
   */
  getStatistics() {
    return {
      state: this.state,
      quality: this.quality,
      strategy: this.strategy,
      attemptCount: this.attemptCount,
      successCount: this.successCount,
      failureCount: this.failureCount,
      metrics: { ...this.connectionMetrics },
      environment: {
        isMobile: this.isMobile,
        isBackground: this.isBackground,
        networkType: this.networkType
      }
    };
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    this.clearTimers();
    
    // Remove event listeners
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    
    if (navigator.connection) {
      navigator.connection.removeEventListener('change', this.handleNetworkChange);
    }
  }
}

/**
 * Default connection manager instance
 */
export const defaultConnectionManager = new ConnectionManager();
