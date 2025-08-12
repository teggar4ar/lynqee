/**
 * Activity Tracker Utility
 * 
 * Provides a clean, extensible interface for tracking user activity.
 * Designed to be framework-agnostic and easily testable.
 */

import { SESSION_CONFIG } from '../constants/session.js';

class ActivityTracker {
  constructor() {
    this.listeners = new Set();
    this.lastActivityTime = Date.now();
    this.isTracking = false;
    this.activityHandler = null;
  }

  /**
   * Start tracking user activity
   * @param {Function} onActivity - Callback function when activity is detected
   */
  startTracking(onActivity) {
    if (this.isTracking) {
      this.stopTracking();
    }

    this.activityHandler = this.createDebouncedHandler(onActivity);
    this.isTracking = true;

    // Add event listeners for activity detection
    SESSION_CONFIG.ACTIVITY_EVENTS.forEach(eventType => {
      document.addEventListener(eventType, this.activityHandler, { passive: true });
      this.listeners.add({ eventType, handler: this.activityHandler });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    this.listeners.add({ eventType: 'visibilitychange', handler: this.handleVisibilityChange.bind(this) });

    // Initialize last activity time
    this.updateLastActivity();
  }

  /**
   * Stop tracking user activity
   */
  stopTracking() {
    if (!this.isTracking) return;

    // Remove all event listeners
    this.listeners.forEach(({ eventType, handler }) => {
      document.removeEventListener(eventType, handler);
    });

    this.listeners.clear();
    this.isTracking = false;
    this.activityHandler = null;
  }

  /**
   * Get the last activity timestamp
   * @returns {number} Timestamp in milliseconds
   */
  getLastActivity() {
    // Check both memory and localStorage for cross-tab sync
    const stored = this.getStoredLastActivity();
    return Math.max(this.lastActivityTime, stored);
  }

  /**
   * Update the last activity timestamp
   */
  updateLastActivity() {
    const now = Date.now();
    this.lastActivityTime = now;
    this.storeLastActivity(now);
  }

  /**
   * Check if user has been inactive for the specified duration
   * @param {number} timeoutMs - Timeout duration in milliseconds
   * @returns {boolean} True if user has been inactive
   */
  isInactive(timeoutMs = SESSION_CONFIG.INACTIVITY_TIMEOUT) {
    const lastActivity = this.getLastActivity();
    return (Date.now() - lastActivity) > timeoutMs;
  }

  /**
   * Get time remaining before inactivity timeout
   * @param {number} timeoutMs - Timeout duration in milliseconds
   * @returns {number} Milliseconds remaining, or 0 if already timed out
   */
  getTimeRemaining(timeoutMs = SESSION_CONFIG.INACTIVITY_TIMEOUT) {
    const lastActivity = this.getLastActivity();
    const elapsed = Date.now() - lastActivity;
    return Math.max(0, timeoutMs - elapsed);
  }

  /**
   * Create a debounced activity handler to prevent excessive calls
   * @param {Function} callback - Original callback function
   * @returns {Function} Debounced callback
   */
  createDebouncedHandler(callback) {
    let timeoutId = null;

    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        this.updateLastActivity();
        callback?.();
      }, SESSION_CONFIG.ACTIVITY_DEBOUNCE);
    };
  }

  /**
   * Handle page visibility changes
   */
  handleVisibilityChange() {
    if (!document.hidden) {
      // Page became visible, treat as activity
      this.updateLastActivity();
    }
  }

  /**
   * Store last activity in localStorage for cross-tab sync
   * @param {number} timestamp - Activity timestamp
   */
  storeLastActivity(timestamp) {
    try {
      localStorage.setItem(SESSION_CONFIG.LAST_ACTIVITY_KEY, timestamp.toString());
    } catch (error) {
      // Silently handle localStorage errors (private browsing, etc.)
      console.warn('[ActivityTracker] Failed to store activity timestamp:', error);
    }
  }

  /**
   * Get stored last activity from localStorage
   * @returns {number} Stored timestamp or 0 if not found
   */
  getStoredLastActivity() {
    try {
      const stored = localStorage.getItem(SESSION_CONFIG.LAST_ACTIVITY_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      // Silently handle localStorage errors
      console.warn('[ActivityTracker] Failed to retrieve activity timestamp:', error);
      return 0;
    }
  }

  /**
   * Reset activity tracking (useful for testing or manual resets)
   */
  reset() {
    this.updateLastActivity();
  }
}

// Export singleton instance
export const activityTracker = new ActivityTracker();

// Export class for testing
export { ActivityTracker };

export default activityTracker;
