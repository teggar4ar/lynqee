/**
 * AlertContext - Global alert system management
 * 
 * Provides alert state and methods to all components via React Context.
 * Handles alert queue, priority system, auto-dismiss, and alert grouping.
 * 
 * Follows clean architecture principles:
 * - Centralized state management
 * - Clear API boundaries
 * - Proper error handling
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { AlertContainer } from '../components/common/alerts/AlertContainer';

// Create the context
const AlertContext = createContext(null);

/**
 * Generate a unique ID for each alert
 * @returns {string} Unique ID
 */
const generateAlertId = () => uuidv4();

/**
 * Alert Provider Component
 * 
 * Manages alert state and provides methods to interact with alerts.
 */
export const AlertProvider = ({ children }) => {
  // Main alerts queue state
  const [alerts, setAlerts] = useState([]);
  
  // Store timer refs to prevent memory leaks
  const timersRef = useRef(new Map());
  
  // Maximum number of alerts to prevent memory issues
  const MAX_ALERTS = 10;
  
  /**
   * Adds a new alert to the queue
   * @param {Object} config Alert configuration object
   * @param {('success'|'error'|'warning'|'info')} config.type Alert type
   * @param {string} config.message Alert message
   * @param {number} [config.duration] Time in ms before auto-dismiss (0 for persistent)
   * @param {('toast'|'banner'|'inline')} [config.variant='toast'] Visual variant
   * @param {('low'|'medium'|'high'|'critical')} [config.priority='medium'] Alert priority
   * @param {boolean} [config.dismissible=true] Whether alert can be manually dismissed
   * @returns {string} ID of the created alert
   */
  const showAlert = useCallback((config) => {
    // Validate required props
    if (!config.type || !config.message) {
      console.error('Alert requires type and message properties');
      return null;
    }
    
    // Create alert object with defaults
    const id = generateAlertId();
    const alert = {
      id,
      type: config.type,
      message: config.message,
      timestamp: Date.now(),
      duration: config.duration ?? (config.type === 'error' ? 0 : 5000), // Default: errors are persistent, others 5s
      variant: config.variant || 'toast',
      priority: config.priority || 'medium',
      dismissible: config.dismissible !== false,
      // Optional properties
      title: config.title || null,
      icon: config.icon || null,
      action: config.action || null,
      groupId: config.groupId || null,
      position: config.position || 'top-right', // top-right, top-center, bottom-right, etc.
    };
    
    // Check for duplicates by comparing message & type if it happened within the last 3s
    const isDuplicate = alerts.some((existingAlert) => {
      return (
        existingAlert.message === alert.message &&
        existingAlert.type === alert.type &&
        Date.now() - existingAlert.timestamp < 3000
      );
    });
    
    if (!isDuplicate) {
      setAlerts((prevAlerts) => {
        // Sort by priority (critical > high > medium > low)
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        
        let newAlerts = [...prevAlerts, alert].sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
        
        // Enforce maximum alert limit to prevent memory issues
        if (newAlerts.length > MAX_ALERTS) {
          // Remove oldest non-critical alerts first
          const criticalAlerts = newAlerts.filter(a => a.priority === 'critical');
          const nonCriticalAlerts = newAlerts.filter(a => a.priority !== 'critical');
          
          // Remove excess non-critical alerts first
          if (nonCriticalAlerts.length > MAX_ALERTS - criticalAlerts.length) {
            const excessAlerts = nonCriticalAlerts.slice(0, nonCriticalAlerts.length - (MAX_ALERTS - criticalAlerts.length));
            excessAlerts.forEach(excessAlert => {
              if (timersRef.current.has(excessAlert.id)) {
                clearTimeout(timersRef.current.get(excessAlert.id));
                timersRef.current.delete(excessAlert.id);
              }
            });
            newAlerts = [...criticalAlerts, ...nonCriticalAlerts.slice(-(MAX_ALERTS - criticalAlerts.length))];
          } else {
            newAlerts = newAlerts.slice(-MAX_ALERTS);
          }
        }
        
        return newAlerts;
      });
    }
    
    return id;
  }, [alerts]);
  
  /**
   * Removes an alert by ID with proper cleanup
   * @param {string} id Alert ID
   */
  const hideAlert = useCallback((id) => {
    // Clear any associated timer
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
    
    setAlerts((prevAlerts) => {
      const filtered = prevAlerts.filter((alert) => alert.id !== id);
      
      // Performance: If we're at max capacity, ensure we don't exceed it
      if (filtered.length > MAX_ALERTS) {
        // Remove oldest alerts first (FIFO)
        const excess = filtered.slice(0, filtered.length - MAX_ALERTS);
        excess.forEach(alert => {
          if (timersRef.current.has(alert.id)) {
            clearTimeout(timersRef.current.get(alert.id));
            timersRef.current.delete(alert.id);
          }
        });
        return filtered.slice(-MAX_ALERTS);
      }
      
      return filtered;
    });
  }, [MAX_ALERTS]);
  
  /**
   * Updates an existing alert
   * @param {string} id Alert ID
   * @param {Object} config Updated alert configuration
   */
  const updateAlert = useCallback((id, config) => {
    setAlerts((prevAlerts) => {
      return prevAlerts.map((alert) => {
        if (alert.id === id) {
          return { ...alert, ...config };
        }
        return alert;
      });
    });
  }, []);
  
  /**
   * Removes all alerts from the queue with proper cleanup
   */
  const clearAlerts = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach((timer) => {
      clearTimeout(timer);
    });
    timersRef.current.clear();
    
    setAlerts([]);
  }, []);
  
  /**
   * Handle auto-dismiss for alerts with duration > 0
   * Improved memory management with proper timer cleanup
   */
  useEffect(() => {
    alerts.forEach((alert) => {
      // Only set timer if alert has duration and timer doesn't already exist
      if (alert.duration > 0 && !timersRef.current.has(alert.id)) {
        const timer = setTimeout(() => {
          hideAlert(alert.id);
        }, alert.duration);
        
        timersRef.current.set(alert.id, timer);
      }
    });
    
    // Cleanup timers for alerts that no longer exist
    const currentAlertIds = new Set(alerts.map(alert => alert.id));
    timersRef.current.forEach((timer, alertId) => {
      if (!currentAlertIds.has(alertId)) {
        clearTimeout(timer);
        timersRef.current.delete(alertId);
      }
    });
  }, [alerts, hideAlert]);
  
  /**
   * Cleanup all timers when component unmounts
   */
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => {
        clearTimeout(timer);
      });
      timers.clear();
    };
  }, []);

  /**
   * Global keyboard navigation
   * Escape key dismisses the topmost (most recent) alert
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && alerts.length > 0) {
        // Dismiss the most recent alert (last in the array)
        const topAlert = alerts[alerts.length - 1];
        if (topAlert && topAlert.dismissible !== false) {
          hideAlert(topAlert.id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [alerts, hideAlert]);
  
  // Value object passed to context consumers
  const contextValue = {
    alerts,
    showAlert,
    hideAlert,
    updateAlert,
    clearAlerts
  };
  
  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <AlertContainer alerts={alerts} onDismiss={hideAlert} />
    </AlertContext.Provider>
  );
};

AlertProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to access the AlertContext
 * @returns {Object} Alert context value
 */
export const useAlertContext = () => {
  const context = useContext(AlertContext);
  
  if (!context) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  
  return context;
};

export default AlertContext;
