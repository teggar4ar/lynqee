import { useCallback, useState } from 'react';

/**
 * useRetry Hook
 * 
 * Simple retry functionality for failed operations.
 * 
 * @param {Function} operation - The async operation to retry
 * @param {Object} options - Configuration options
 * @returns {Object} Retry state and functions
 */
export const useRetry = (operation, options = {}) => {
  const { maxAttempts = 3 } = options;
  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastError, setLastError] = useState(null);

  const retry = useCallback(async (...args) => {
    if (isRetrying || attemptCount >= maxAttempts) {
      return;
    }
    
    setIsRetrying(true);
    
    try {
      const result = await operation(...args);
      // Reset state on success
      setIsRetrying(false);
      setAttemptCount(0);
      setLastError(null);
      return result;
    } catch (error) {
      setLastError(error);
      setAttemptCount(prev => prev + 1);
      setIsRetrying(false);
      throw error;
    }
  }, [operation, isRetrying, attemptCount, maxAttempts]);

  const reset = useCallback(() => {
    setIsRetrying(false);
    setAttemptCount(0);
    setLastError(null);
  }, []);

  return {
    retry,
    reset,
    isRetrying,
    attemptCount,
    lastError,
    canRetry: attemptCount < maxAttempts,
    hasExhaustedRetries: attemptCount >= maxAttempts,
  };
};

/**
 * useAsyncRetry Hook
 * 
 * Simple hook combining async state management with basic retry functionality.
 * 
 * @param {Function} asyncFunction - The async function to execute
 * @returns {Object} Async state with retry capabilities
 */
export const useAsyncRetry = (asyncFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction(...args);
      setData(result);
      setLoading(false);
      return result;
    } catch (error) {
      setError(error);
      setLoading(false);
      throw error;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    isLoading: loading,
    execute,
    reset
  };
};

export default useRetry;
