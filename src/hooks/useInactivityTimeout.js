/**
 * useInactivityTimeout Hook
 * 
 * Provides automatic logout functionality based on user inactivity.
 * Designed for extensibility and clean integration with existing auth systems.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { SESSION_CONFIG, SESSION_EVENTS } from '../constants/session.js';
import { activityTracker } from '../utils/activityTracker.js';

export const useInactivityTimeout = ({
  onInactivityTimeout,
  timeoutMs = SESSION_CONFIG.INACTIVITY_TIMEOUT,
  checkIntervalMs = SESSION_CONFIG.CHECK_INTERVAL,
  isEnabled = true,
  onActivity = null, // Optional callback for activity events (extensibility)
}) => {
  const [isActive, setIsActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const timeoutRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const isEnabledRef = useRef(isEnabled);

  // Update ref when isEnabled changes
  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  /**
   * Handle detected user activity
   */
  const handleActivity = useCallback(() => {
    if (!isEnabledRef.current) return;

    const now = Date.now();
    setIsActive(true);
    setLastActivity(now);

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Broadcast activity to other tabs
    try {
      localStorage.setItem(SESSION_CONFIG.SESSION_EVENT_KEY, JSON.stringify({
        type: SESSION_EVENTS.ACTIVITY_DETECTED,
        timestamp: now
      }));
    } catch (error) {
      // Silently handle localStorage errors
      console.warn('[useInactivityTimeout] Failed to broadcast activity:', error);
    }

    // Call extensibility callback
    onActivity?.(now);
  }, [onActivity]);

  /**
   * Handle inactivity timeout
   */
  const handleTimeout = useCallback(() => {
    if (!isEnabledRef.current) return;

    setIsActive(false);

    // Broadcast timeout event to other tabs
    try {
      localStorage.setItem(SESSION_CONFIG.SESSION_EVENT_KEY, JSON.stringify({
        type: SESSION_EVENTS.INACTIVITY_TIMEOUT,
        timestamp: Date.now()
      }));
    } catch (error) {
      // Silently handle localStorage errors
      console.warn('[useInactivityTimeout] Failed to broadcast timeout:', error);
    }

    // Execute timeout callback
    onInactivityTimeout?.();
  }, [onInactivityTimeout]);

  /**
   * Check for inactivity
   */
  const checkInactivity = useCallback(() => {
    if (!isEnabledRef.current) return;

    if (activityTracker.isInactive(timeoutMs)) {
      handleTimeout();
    }
  }, [timeoutMs, handleTimeout]);

  /**
   * Handle cross-tab session events
   */
  const handleStorageEvent = useCallback((event) => {
    if (event.key !== SESSION_CONFIG.SESSION_EVENT_KEY) return;

    try {
      const sessionEvent = JSON.parse(event.newValue || '{}');
      
      switch (sessionEvent.type) {
        case SESSION_EVENTS.ACTIVITY_DETECTED:
          // Activity in another tab - update our state
          if (isEnabledRef.current) {
            setIsActive(true);
            setLastActivity(sessionEvent.timestamp);
            
            // Clear any pending timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }
          break;
          
        case SESSION_EVENTS.INACTIVITY_TIMEOUT:
          // Timeout occurred in another tab - trigger our timeout too
          if (isEnabledRef.current) {
            handleTimeout();
          }
          break;
          
        case SESSION_EVENTS.MANUAL_LOGOUT:
          // Manual logout in another tab - trigger our timeout
          if (isEnabledRef.current) {
            handleTimeout();
          }
          break;
          
        default:
          // Future extensibility - handle unknown events gracefully
          break;
      }
    } catch (error) {
      // Silently handle JSON parsing errors
      console.warn('[useInactivityTimeout] Failed to parse session event:', error);
    }
  }, [handleTimeout]);

  /**
   * Reset the inactivity timer (useful for programmatic extension)
   */
  const resetTimer = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    activityTracker.reset();
    handleActivity();
  }, [handleActivity]);

  /**
   * Get time remaining before timeout
   */
  const getTimeRemaining = useCallback(() => {
    return activityTracker.getTimeRemaining(timeoutMs);
  }, [timeoutMs]);

  /**
   * Manually trigger timeout (useful for testing)
   */
  const triggerTimeout = useCallback(() => {
    handleTimeout();
  }, [handleTimeout]);

  // Set up activity tracking
  useEffect(() => {
    if (!isEnabled) return;

    // Start activity tracking
    activityTracker.startTracking(handleActivity);

    // Set up periodic inactivity checks
    checkIntervalRef.current = setInterval(checkInactivity, checkIntervalMs);

    // Listen for cross-tab events
    window.addEventListener('storage', handleStorageEvent);

    // Cleanup function
    return () => {
      activityTracker.stopTracking();
      
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [isEnabled, handleActivity, checkInactivity, checkIntervalMs, handleStorageEvent]);

  // Return state and control methods for extensibility
  return {
    isActive,
    lastActivity,
    timeRemaining: getTimeRemaining(),
    resetTimer,
    triggerTimeout, // For testing/debugging
    
    // Extensibility methods
    getTimeRemaining,
    
    // Read-only state
    isEnabled: isEnabledRef.current,
  };
};

export default useInactivityTimeout;
