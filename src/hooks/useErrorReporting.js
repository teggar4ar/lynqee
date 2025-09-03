/**
 * useErrorReporting - Custom hook for centralized error reporting
 * 
 * Provides consistent error logging, tracking, and optional external reporting
 * for debugging and monitoring purposes.
 */

import { useCallback, useRef } from 'react';
import { getErrorType, getUserFriendlyErrorMessage } from '../utils/errorUtils';

/**
 * Custom hook for error reporting and tracking
 * @param {Object} options - Configuration options
 * @param {string} options.component - Component name for context
 * @param {string} options.module - Module name for categorization
 * @param {boolean} options.enableConsoleLogging - Enable console error logging (default: true)
 * @param {boolean} options.enableExternalReporting - Enable external service reporting (default: false)
 * @param {Function} options.externalReporter - Custom external reporting function
 * @returns {Object} Error reporting methods
 */
export const useErrorReporting = (options = {}) => {
  const {
    component = 'Unknown Component',
    module = 'General',
    enableConsoleLogging = true,
    enableExternalReporting = false,
    externalReporter = null
  } = options;

  const errorCountRef = useRef(0);
  const errorHistoryRef = useRef([]);
  const lastErrorRef = useRef(null);

  /**
   * Report an error with full context
   * @param {Error|string} error - The error to report
   * @param {Object} context - Additional context information
   * @param {string} context.action - The action that was being performed
   * @param {Object} context.metadata - Additional metadata
   * @param {'error'|'warning'|'info'} severity - Error severity level
   */
  const reportError = useCallback((error, context = {}, severity = 'error') => {
    const timestamp = new Date().toISOString();
    const errorType = getErrorType(error);
    const userFriendlyMessage = getUserFriendlyErrorMessage(error);
    
    const errorReport = {
      timestamp,
      component,
      module,
      severity,
      errorType,
      message: error instanceof Error ? error.message : String(error),
      userFriendlyMessage,
      stack: error instanceof Error ? error.stack : undefined,
      context: context || {},
      errorCount: ++errorCountRef.current
    };

    // Store in error history (keep last 50 errors)
    errorHistoryRef.current.unshift(errorReport);
    if (errorHistoryRef.current.length > 50) {
      errorHistoryRef.current.pop();
    }

    lastErrorRef.current = errorReport;

    // Console logging with expected format
    if (enableConsoleLogging) {
      // Always use console.error for visibility in tests and debugging
      const logMethod = console.error;
      
      // Determine log label based on error type and severity
      let logLabel = 'Error';
      if (context?.type === 'network') {
        logLabel = 'Network Error';
      } else if (context?.type === 'validation') {
        logLabel = 'Validation Error';
      } else if (severity === 'warning') {
        logLabel = 'Warning';
      } else if (severity === 'info') {
        logLabel = 'Info';
      }
      
      // Log in the format expected by tests: '[Component] Error:', error, context
      // Pass undefined instead of empty object when no meaningful context
      const contextForLogging = Object.keys(context || {}).length === 0 ? undefined : context;
      logMethod(`[${component}] ${logLabel}:`, error, contextForLogging);

      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }

    // External reporting (Sentry, LogRocket, etc.)
    if (enableExternalReporting && externalReporter) {
      try {
        externalReporter(errorReport);
      } catch (reportingError) {
        console.error('[useErrorReporting] External reporting failed:', reportingError);
      }
    }

    return errorReport;
  }, [component, module, enableConsoleLogging, enableExternalReporting, externalReporter]);

  /**
   * Report a network error specifically
   * @param {Error} error - The network error
   * @param {string} endpoint - The API endpoint that failed
   * @param {Object} requestData - The request data that was sent
   */
  const reportNetworkError = useCallback((error, endpoint, _requestData = {}) => {
    return reportError(error, {
      endpoint,
      type: 'network'
    });
  }, [reportError]);

  /**
   * Report a validation error
   * @param {Error|string} error - The validation error
   * @param {Object} formData - The form data that failed validation
   * @param {string} field - The specific field that failed (optional)
   */
  const reportValidationError = useCallback((error, formData = {}, field = null) => {
    return reportError(error, {
      formData,
      field,
      type: 'validation'
    }, 'warning');
  }, [reportError]);

  /**
   * Report a component lifecycle error
   * @param {Error} error - The lifecycle error
   * @param {string} lifecycle - The lifecycle method (mount, unmount, update)
   * @param {Object} props - Component props at time of error
   */
  const reportComponentError = useCallback((error, lifecycle, props = {}) => {
    return reportError(error, {
      action: `Component ${lifecycle}`,
      metadata: {
        lifecycle,
        props: JSON.stringify(props),
        type: 'component'
      }
    });
  }, [reportError]);

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  const getErrorStats = useCallback(() => {
    const history = errorHistoryRef.current;
    const last24Hours = history.filter(err => 
      new Date(err.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const errorsByType = history.reduce((acc, err) => {
      acc[err.errorType] = (acc[err.errorType] || 0) + 1;
      return acc;
    }, {
      general: 0,
      network: 0,
      validation: 0,
      component: 0
    });

    const severityBreakdown = history.reduce((acc, err) => {
      acc[err.severity] = (acc[err.severity] || 0) + 1;
      return acc;
    }, {});

    return {
      totalErrors: errorCountRef.current,
      last24Hours: last24Hours.length,
      errorsByType,
      severityBreakdown,
      lastError: lastErrorRef.current,
      recentErrors: history.slice(0, 10).map(err => ({
        error: new Error(err.message),
        context: err.context,
        type: err.errorType,
        timestamp: new Date(err.timestamp)
      }))
    };
  }, []);

  /**
   * Clear error statistics and history
   */
  const clearErrorStats = useCallback(() => {
    errorHistoryRef.current = [];
    errorCountRef.current = 0;
    lastErrorRef.current = null;
  }, []);

  /**
   * Clear error history (alias for backwards compatibility)
   */
  const clearErrorHistory = useCallback(() => {
    clearErrorStats();
  }, [clearErrorStats]);

  /**
   * Export error history for external analysis
   * @returns {Array} Complete error history
   */
  const exportErrorHistory = useCallback(() => {
    return [...errorHistoryRef.current];
  }, []);

  return {
    reportError,
    reportNetworkError,
    reportValidationError,
    reportComponentError,
    getErrorStats,
    clearErrorStats,
    clearErrorHistory,
    exportErrorHistory,
    errorCount: errorCountRef.current,
    lastError: lastErrorRef.current
  };
};

export default useErrorReporting;
