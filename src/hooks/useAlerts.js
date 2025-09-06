/**
 * useAlerts - Custom hook for the alert system
 * 
 * Provides a clean API for interacting with the alert system.
 * Acts as a bridge between components and the AlertContext.
 * 
 * This hook encapsulates alert business logic and provides
 * a clean interface for components to interact with alerts.
 */

import { useAlertContext } from '../contexts/AlertContext';

/**
 * Predefined alert type configurations
 */
const AlertTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

/**
 * Custom hook that provides alert functionality
 * @returns {Object} Alert methods and helpers
 */
export const useAlerts = () => {
  const alertContext = useAlertContext();
  
  /**
   * Show a success alert
   * @param {string|Object} message Alert message or object with title/message
   * @param {Object} options Additional alert options
   * @returns {string} Alert ID
   */
  const showSuccess = (message, options = {}) => {
    // Check if the first argument is an object with title and message
    if (typeof message === 'object' && message !== null && 'title' in message && 'message' in message) {
      return alertContext.showAlert({
        type: AlertTypes.SUCCESS,
        title: message.title,
        message: message.message,
        ...options,
      });
    }
    
    return alertContext.showAlert({
      type: AlertTypes.SUCCESS,
      message,
      ...options,
    });
  };
  
  /**
   * Show an error alert
   * @param {string|Error|Object} error Error message, Error object, or object with title/message
   * @param {Object} options Additional alert options
   * @returns {string} Alert ID
   */
  const showError = (error, options = {}) => {
    // Check if the first argument is an object with title and message
    if (typeof error === 'object' && error !== null && 'title' in error && 'message' in error) {
      return alertContext.showAlert({
        type: AlertTypes.ERROR,
        title: error.title,
        message: error.message,
        duration: 0, // Errors are persistent by default
        ...options,
      });
    }
    
    // Handle different error types (original behavior)
    const message = typeof error === 'string' 
      ? error 
      : error?.message || 'An unexpected error occurred';
    
    return alertContext.showAlert({
      type: AlertTypes.ERROR,
      message,
      duration: 0, // Errors are persistent by default
      ...options,
    });
  };
  
  /**
   * Show a warning alert
   * @param {string|Object} message Warning message or object with title/message
   * @param {Object} options Additional alert options
   * @returns {string} Alert ID
   */
  const showWarning = (message, options = {}) => {
    // Check if the first argument is an object with title and message
    if (typeof message === 'object' && message !== null && 'title' in message && 'message' in message) {
      return alertContext.showAlert({
        type: AlertTypes.WARNING,
        title: message.title,
        message: message.message,
        ...options,
      });
    }
    
    return alertContext.showAlert({
      type: AlertTypes.WARNING,
      message,
      ...options,
    });
  };
  
  /**
   * Show an info alert
   * @param {string|Object} message Info message or object with title/message
   * @param {Object} options Additional alert options
   * @returns {string} Alert ID
   */
  const showInfo = (message, options = {}) => {
    // Check if the first argument is an object with title and message
    if (typeof message === 'object' && message !== null && 'title' in message && 'message' in message) {
      return alertContext.showAlert({
        type: AlertTypes.INFO,
        title: message.title,
        message: message.message,
        ...options,
      });
    }
    
    return alertContext.showAlert({
      type: AlertTypes.INFO,
      message,
      ...options,
    });
  };
  
  /**
   * Show a generic alert with custom configuration
   * @param {Object} config Alert configuration
   * @returns {string} Alert ID
   */
  const showAlert = (config) => {
    try {
      // Validate required fields
      if (!config.type || !config.message) {
        throw new Error('Alert requires type and message properties');
      }
      
      // Validate alert type
      if (!Object.values(AlertTypes).includes(config.type)) {
        throw new Error(`Invalid alert type: ${config.type}. Must be one of: ${Object.values(AlertTypes).join(', ')}`);
      }
      
      return alertContext.showAlert(config);
    } catch (error) {
      console.error('Error showing alert:', error);
      return null;
    }
  };
  
  return {
    // Re-export base methods from context
    hideAlert: alertContext.hideAlert,
    clearAlerts: alertContext.clearAlerts,
    updateAlert: alertContext.updateAlert,
    
    // Type-specific convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Generic method
    showAlert,
    
    // Constants
    AlertTypes,
  };
};

export default useAlerts;
