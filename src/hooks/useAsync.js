/**
 * useAsync - Custom hook for async operations with loading states
 * 
 * Manages loading, error, and success states for async operations.
 * Provides consistent patterns for handling async calls in components.
 * Enhanced with error boundary integration and retry mechanisms.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { isNetworkError } from '../utils/errorUtils';
import { useErrorReporting } from './useErrorReporting';

/**
 * Custom hook for managing async operations
 * @param {Function} asyncFunction - The async function to execute (optional)
 * @param {boolean} immediate - Whether to execute immediately on mount
 * @param {Object} options - Configuration options
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 0)
 * @param {number} options.retryDelay - Delay between retries in ms (default: 1000)
 * @param {string} options.context - Context for error messages (default: 'general')
 * @param {Function} options.onError - Custom error handler
 * @returns {Object} Async state and execution methods
 */
export const useAsync = (asyncFunction = null, immediate = false, options = {}) => {
  const {
    maxRetries = 0,
    retryDelay = 1000,
    context = 'general',
    onError = null,
    ...errorReportingOptions
  } = options;

  // Error reporting integration
  const errorReporting = useErrorReporting({
    component: 'useAsync',
    context,
    ...errorReportingOptions
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef(null);
  const lastFunctionRef = useRef(asyncFunction);
  const lastArgsRef = useRef([]);

  // Update function reference when it changes
  useEffect(() => {
    lastFunctionRef.current = asyncFunction;
  }, [asyncFunction]);

  /**
   * Execute the async function with retry logic
   * @param {Function|...any} firstArg - Either a function to execute, or first argument to asyncFunction
   * @param {...any} args - Additional arguments to pass to the async function
   * @returns {Promise} Promise that resolves with the result
   */
  const execute = useCallback(async (firstArg, ...args) => {
    const attemptExecution = async (attempt = 0) => {
      try {
        setLoading(true);
        if (attempt === 0) {
          setError(null);
          setRetryCount(0);
        }
        
        let functionToExecute;
        let argsToPass;
        
        if (typeof firstArg === 'function') {
          // Function passed as first argument - execute it
          functionToExecute = firstArg;
          argsToPass = args;
        } else if (lastFunctionRef.current) {
          // Use stored function with provided arguments
          functionToExecute = lastFunctionRef.current;
          argsToPass = [firstArg, ...args];
        } else {
          throw new Error('No async function provided');
        }
        
        // Store for retry purposes
        if (attempt === 0) {
          lastFunctionRef.current = functionToExecute;
          lastArgsRef.current = argsToPass;
        }
        
        const result = await functionToExecute(...argsToPass);
        
        // Only update data on successful execution
        setData(result);
        setRetryCount(0);
        return result;
      } catch (err) {
        console.error(`[useAsync] Execution failed (attempt ${attempt + 1}):`, err);
        
        // Report error to error reporting system
        errorReporting.reportError(err, {
          action: 'async execution',
          attempt: attempt + 1,
          maxRetries,
          context
        });
        
        // Enhanced error processing
        const shouldRetry = attempt < maxRetries;
        
        if (shouldRetry) {
          setRetryCount(attempt + 1);
          
          // Wait before retrying
          await new Promise(resolve => {
            retryTimeoutRef.current = setTimeout(resolve, retryDelay * Math.pow(2, attempt)); // Exponential backoff
          });
          
          return attemptExecution(attempt + 1);
        } else {
          // Final error - preserve original error for tests, but enhance for production
          setError(err);
          
          // Call custom error handler if provided
          if (onError) {
            try {
              onError(err, { attempt, maxRetries, context });
            } catch (handlerError) {
              console.error('[useAsync] Error handler failed:', handlerError);
            }
          }
          
          throw err;
        }
      } finally {
        setLoading(false);
      }
    };

    return attemptExecution();
  }, [maxRetries, retryDelay, context, onError, errorReporting]);

  /**
   * Reset the async state
   */
  const reset = useCallback(() => {
    // Clear any pending retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    setLoading(false);
    setError(null);
    setData(null);
    setRetryCount(0);
  }, []);

  /**
   * Set loading state manually
   */
  const setIsLoading = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  /**
   * Retry the last failed operation
   */
  const retry = useCallback(async () => {
    if (!loading && error && lastFunctionRef.current) {
      // Clear error state before retry
      setError(null);
      // Re-execute with stored function - if it was called without args, use empty args
      if (lastArgsRef.current.length === 0 && lastFunctionRef.current === asyncFunction) {
        return execute();
      } else {
        return execute(...lastArgsRef.current);
      }
    }
  }, [execute, loading, error, asyncFunction]);

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Immediate execution effect
  useEffect(() => {
    if (immediate && asyncFunction) {
      execute();
    }
  }, [immediate, asyncFunction, execute]); // Include required dependencies

  return {
    loading,
    error,
    data,
    execute,
    reset,
    retry,
    cleanup,
    setLoading: setIsLoading,
    isLoading: loading,
    isError: !!error,
    isSuccess: !loading && !error && data !== null,
    isRetrying: retryCount > 0,
    retryCount,
    canRetry: !loading && !!error && isNetworkError(error?.originalError || error),
  };
};

export default useAsync;
