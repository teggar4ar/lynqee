import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorType } from '../utils/errorUtils';

/**
 * useRetry Hook
 * 
 * Enhanced retry functionality for failed operations with intelligent retry logic,
 * exponential backoff, and error type-based retry decisions.
 * 
 * @param {Function} operation - The async operation to retry
 * @param {Object} options - Configuration options
 * @param {number} options.maxAttempts - Maximum retry attempts (default: 3)
 * @param {number} options.baseDelay - Base delay between retries in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay between retries in ms (default: 30000)
 * @param {boolean} options.exponentialBackoff - Use exponential backoff (default: true)
 * @param {Function} options.shouldRetry - Custom function to determine if error should be retried
 * @param {Function} options.onRetry - Callback when retry attempt is made
 * @param {Function} options.onMaxAttemptsReached - Callback when max attempts reached
 * @returns {Object} Retry state and functions
 */
export const useRetry = (operation, options = {}) => {
  const { 
    maxAttempts = 3,
    baseDelay = 1000,
    delay = options.delay || baseDelay, // Support both 'delay' and 'baseDelay'
    maxDelay = 30000,
    exponentialBackoff = true,
    shouldRetry = null,
    onRetry = null,
    onMaxAttemptsReached = null,
    timeout = null,
    jitter = false
  } = options;

  // Normalize maxAttempts to be at least 1
  const normalizedMaxAttempts = Math.max(1, maxAttempts || 3);

  // Use delay if provided, otherwise baseDelay
  const actualBaseDelay = typeof delay === 'function' ? delay : delay;

  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [retryHistory, setRetryHistory] = useState([]);
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Default retry logic - retry any error up to max attempts
  const defaultShouldRetry = useCallback((error, attempt) => {
    return attempt < normalizedMaxAttempts;
  }, [normalizedMaxAttempts]);

  const calculateDelay = useCallback((attempt) => {
    // If delay is a function, call it with the attempt number
    if (typeof delay === 'function') {
      return delay(attempt);
    }
    
    if (!exponentialBackoff) {
      let calculatedDelay = actualBaseDelay;
      
      // Apply jitter if enabled
      if (jitter) {
        calculatedDelay = actualBaseDelay + (Math.random() * actualBaseDelay * 0.1);
      }
      
      return calculatedDelay;
    }
    
    let delayCalc = actualBaseDelay * Math.pow(2, attempt - 1);
    
    // Apply jitter if enabled
    if (jitter) {
      delayCalc = delayCalc + (Math.random() * delayCalc * 0.1);
    }
    
    return Math.min(delayCalc, maxDelay);
  }, [delay, actualBaseDelay, maxDelay, exponentialBackoff, jitter]);

  const retry = useCallback(async (...args) => {
    // Prevent concurrent retries
    if (isRetrying) {
      return Promise.reject(new Error('Retry already in progress'));
    }

    // Reset state for new retry sequence
    setAttemptCount(0);
    setLastError(null);
    setRetryHistory([]);

    // Create new abort controller for this retry sequence
    abortControllerRef.current = new AbortController();
    
    let currentAttempt = 0;
    const attemptHistory = [];
    
    const attempt = async () => {
      if (abortControllerRef.current?.signal.aborted) {
        const abortError = new Error('Retry sequence aborted');
        abortError.name = 'AbortError';
        abortError.aborted = true;
        throw abortError;
      }
      
      currentAttempt++;
      setAttemptCount(currentAttempt);
      setIsRetrying(true);
      
      const attemptStart = Date.now();
      
      try {
        let operationPromise = operation(...args);
        
        // Add timeout if specified
        if (timeout) {
          operationPromise = Promise.race([
            operationPromise,
            new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error(`Operation timed out after ${timeout}ms`));
              }, timeout);
            })
          ]);
        }
        
        const result = await operationPromise;
        
        // Success - update final state but preserve attempt count
        setIsRetrying(false);
        setLastError(null);
        // Keep attemptCount to show total attempts made
        
        return result;
      } catch (error) {
        const attemptEnd = Date.now();
        const attemptDuration = attemptEnd - attemptStart;
        
        const attemptInfo = {
          attempt: currentAttempt,
          error: error.message,
          errorType: getErrorType(error),
          duration: attemptDuration,
          timestamp: new Date().toISOString()
        };
        
        attemptHistory.push(attemptInfo);
        setRetryHistory([...attemptHistory]);
        setLastError(error);
        
        // Determine if we should retry
        const retryDecision = shouldRetry ? shouldRetry(error, currentAttempt) : defaultShouldRetry(error, currentAttempt);
        
        if (!retryDecision || abortControllerRef.current?.signal.aborted) {
          setIsRetrying(false);
          
          if (abortControllerRef.current?.signal.aborted) {
            // If aborted, throw abort error
            const abortError = new Error('Retry sequence aborted');
            abortError.name = 'AbortError';
            abortError.aborted = true;
            throw abortError;
          }
          
          if (currentAttempt >= normalizedMaxAttempts && onMaxAttemptsReached) {
            onMaxAttemptsReached(error, attemptHistory);
          }
          
          // Enhance error with retry information
          const enhancedError = new Error(error.message);
          enhancedError.originalError = error;
          enhancedError.attemptCount = currentAttempt;
          enhancedError.retryHistory = attemptHistory;
          enhancedError.maxAttemptsReached = currentAttempt >= normalizedMaxAttempts;
          
          throw enhancedError;
        }
        
        // Calculate delay for next attempt
        const delay = calculateDelay(currentAttempt);
        
        if (onRetry) {
          onRetry(error, currentAttempt, delay);
        }
        
        // Wait before next attempt
        return new Promise((resolve, reject) => {
          timeoutRef.current = setTimeout(async () => {
            if (abortControllerRef.current?.signal.aborted) {
              const abortError = new Error('Retry sequence aborted');
              abortError.name = 'AbortError';
              abortError.aborted = true;
              reject(abortError);
              return;
            }
            
            try {
              const result = await attempt();
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        });
      }
    };
    
    return attempt();
  }, [operation, isRetrying, shouldRetry, defaultShouldRetry, calculateDelay, onRetry, onMaxAttemptsReached, timeout, normalizedMaxAttempts]);

  const reset = useCallback(() => {
    // Cancel any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Abort any ongoing retry sequence
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsRetrying(false);
    setAttemptCount(0);
    setLastError(null);
    setRetryHistory([]);
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Clear timeout immediately to prevent delays
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsRetrying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const canRetry = !isRetrying && attemptCount < normalizedMaxAttempts;
  const shouldRetryError = lastError ? (shouldRetry ? shouldRetry(lastError, attemptCount) : defaultShouldRetry(lastError, attemptCount)) : true;

  return {
    retry,
    reset,
    abort,
    isRetrying,
    attemptCount,
    lastError,
    retryHistory,
    canRetry: canRetry && shouldRetryError,
    maxAttemptsReached: attemptCount >= normalizedMaxAttempts,
    nextRetryDelay: canRetry ? calculateDelay(attemptCount + 1) : null,
    retryStats: {
      totalAttempts: attemptCount,
      maxAttempts: normalizedMaxAttempts,
      remainingAttempts: Math.max(0, normalizedMaxAttempts - attemptCount),
      successfulRetries: !lastError && attemptCount > 1 ? 1 : 0,
      failedRetries: lastError ? attemptCount : Math.max(0, attemptCount - 1),
      averageAttemptDuration: retryHistory.length > 0 
        ? retryHistory.reduce((sum, attempt) => sum + attempt.duration, 0) / retryHistory.length 
        : 0,
      averageRetryDelay: retryHistory.length >= 1 ? actualBaseDelay : 0,
      lastAttemptTime: retryHistory.length > 0 ? new Date(retryHistory[retryHistory.length - 1].timestamp) : null
    }
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
