/**
 * useAsync - Custom hook for async operations with loading states
 * 
 * Manages loading, error, and success states for async operations.
 * Provides consistent patterns for handling async calls in components.
 */

import { useCallback, useState } from 'react';

/**
 * Custom hook for managing async operations
 * @param {Function} asyncFunction - The async function to execute (optional)
 * @param {boolean} immediate - Whether to execute immediately on mount
 * @returns {Object} Async state and execution methods
 */
export const useAsync = (asyncFunction = null, immediate = false) => {
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Execute the async function
   * @param {Function|...any} firstArg - Either a function to execute, or first argument to asyncFunction
   * @param {...any} args - Additional arguments to pass to the async function
   * @returns {Promise} Promise that resolves with the result
   */
  const execute = useCallback(async (firstArg, ...args) => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (typeof firstArg === 'function' && !asyncFunction) {
        // If no asyncFunction was provided, treat firstArg as the function to execute
        result = await firstArg();
      } else if (asyncFunction) {
        // If asyncFunction was provided, pass all arguments to it
        result = await asyncFunction(firstArg, ...args);
      } else {
        throw new Error('No async function provided');
      }
      
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  /**
   * Reset the async state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  /**
   * Set loading state manually
   */
  const setIsLoading = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
    setLoading: setIsLoading,
    isLoading: loading,
    isError: !!error,
    isSuccess: !loading && !error && data !== null,
  };
};

export default useAsync;
