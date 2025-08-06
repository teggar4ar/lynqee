/**
 * useAsync - Custom hook for async operations with loading states
 * 
 * Manages loading, error, and success states for async operations.
 * Provides consistent patterns for handling async calls in components.
 */

import { useState, useCallback } from 'react';

/**
 * Custom hook for managing async operations
 * @param {Function} asyncFunction - The async function to execute
 * @param {boolean} immediate - Whether to execute immediately on mount
 * @returns {Object} Async state and execution methods
 */
export const useAsync = (asyncFunction, immediate = false) => {
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Execute the async function
   * @param {...any} args - Arguments to pass to the async function
   * @returns {Promise} Promise that resolves with the result
   */
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await asyncFunction(...args);
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
