/**
 * Progressive Loading Higher-Order Hook
 * 
 * Implements progressive loading pattern where cached data is returned immediately
 * while fresh data is fetched in the background. This prevents unnecessary 
 * loading screens when navigating between routes.
 * 
 * Part of the state management refactoring to extract progressive loading
 * logic into a reusable pattern.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Cache manager for storing and retrieving cached data
 */
class ProgressiveCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.maxAge = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cached data if it exists and is not stale
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null
   */
  get(key) {
    if (!this.cache.has(key)) return null;
    
    const timestamp = this.timestamps.get(key);
    const isStale = Date.now() - timestamp > this.maxAge;
    
    if (isStale) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  /**
   * Set cached data with timestamp
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  set(key, data) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now());
  }

  /**
   * Clear cached data for a specific key
   * @param {string} key - Cache key
   */
  clear(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  /**
   * Clear all cached data
   */
  clearAll() {
    this.cache.clear();
    this.timestamps.clear();
  }
}

// Global cache instance
const progressiveCache = new ProgressiveCache();

/**
 * Higher-order hook that adds progressive loading capabilities to any data fetching hook
 * 
 * @param {Function} useDataHook - The original hook to enhance
 * @param {Object} options - Configuration options
 * @param {Function} options.getCacheKey - Function to generate cache key from hook arguments
 * @param {boolean} options.enableCache - Whether to enable caching (default: true)
 * @returns {Function} Enhanced hook with progressive loading
 */
export const withProgressiveLoading = (useDataHook, options = {}) => {
  const {
    getCacheKey = (...args) => JSON.stringify(args),
    enableCache = true,
  } = options;

  return (...args) => {
    const cacheKey = getCacheKey(...args);
    const hookResult = useDataHook(...args);
    const [progressiveData, setProgressiveData] = useState(null);
    const [isProgressiveLoading, setIsProgressiveLoading] = useState(true);
    const initializedRef = useRef(false);

    // Get cached data on first render
    useEffect(() => {
      if (!enableCache || initializedRef.current) return;
      
      const cachedData = progressiveCache.get(cacheKey);
      if (cachedData) {
        setProgressiveData(cachedData);
        setIsProgressiveLoading(false);
      }
      initializedRef.current = true;
    }, [cacheKey, enableCache]);

    // Update cache when new data is available
    useEffect(() => {
      if (!enableCache || !hookResult.data) return;
      
      progressiveCache.set(cacheKey, hookResult.data);
      setProgressiveData(hookResult.data);
      setIsProgressiveLoading(false);
    }, [hookResult.data, cacheKey, enableCache]);

    // Update progressive loading state based on hook loading state
    useEffect(() => {
      if (hookResult.loading && !progressiveData) {
        setIsProgressiveLoading(true);
      } else {
        setIsProgressiveLoading(false);
      }
    }, [hookResult.loading, progressiveData]);

    // Clear cache function
    const clearCache = useCallback(() => {
      if (enableCache) {
        progressiveCache.clear(cacheKey);
      }
    }, [cacheKey, enableCache]);

    // Clear all cache function
    const clearAllCache = useCallback(() => {
      if (enableCache) {
        progressiveCache.clearAll();
      }
    }, [enableCache]);

    return {
      ...hookResult,
      data: progressiveData || hookResult.data,
      loading: isProgressiveLoading,
      isBackgroundRefresh: !!(progressiveData && hookResult.loading),
      hasCache: !!progressiveData,
      clearCache,
      clearAllCache,
    };
  };
};

/**
 * Hook for manual cache management
 * @returns {Object} Cache management functions
 */
export const useProgressiveCache = () => {
  const clearCache = useCallback((key) => {
    progressiveCache.clear(key);
  }, []);

  const clearAllCache = useCallback(() => {
    progressiveCache.clearAll();
  }, []);

  const getCache = useCallback((key) => {
    return progressiveCache.get(key);
  }, []);

  const setCache = useCallback((key, data) => {
    progressiveCache.set(key, data);
  }, []);

  return {
    clearCache,
    clearAllCache,
    getCache,
    setCache,
  };
};

export default withProgressiveLoading;
