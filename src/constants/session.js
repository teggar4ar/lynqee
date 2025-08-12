/**
 * Session configuration constants
 * 
 * Centralized configuration for session management.
 * Designed for easy modification and future extensibility.
 */

export const SESSION_CONFIG = {
    // Inactivity timeout in milliseconds (1 hour)
    INACTIVITY_TIMEOUT: 60 * 60 * 1000,
    // How often to check for inactivity (30 seconds)
    CHECK_INTERVAL: 30 * 1000,
    
    // Activity events to listen for
    ACTIVITY_EVENTS: [
        'mousedown',
        'mousemove',
        'keypress',
        'scroll',
        'touchstart',
        'click'
    ],
    
    // LocalStorage key for cross-tab synchronization
    LAST_ACTIVITY_KEY: 'lynqee_last_activity',
    
    // Event name for cross-tab session events
    SESSION_EVENT_KEY: 'lynqee_session_event',
    
    // Debounce time for activity tracking (prevent excessive updates)
    ACTIVITY_DEBOUNCE: 1000,
};

export const SESSION_EVENTS = {
  ACTIVITY_DETECTED: 'activity_detected',
  INACTIVITY_TIMEOUT: 'inactivity_timeout',
  SESSION_EXTENDED: 'session_extended',
  MANUAL_LOGOUT: 'manual_logout',
};

export default SESSION_CONFIG;
