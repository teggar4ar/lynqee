/**
 * useOptimisticUpdates Hook
 * 
 * Custom hook for handling optimistic UI updates
 * Provides utilities for updating UI immediately before server confirmation
 */

import { useCallback, useState } from 'react';

/**
 * Hook for managing optimistic updates with rollback capability
 * @param {Function} updateFunction - Function that performs the actual update
 * @param {Function} rollbackFunction - Function that rolls back on error
 * @returns {Object} { performOptimisticUpdate, isOptimisticallyUpdating }
 */
export const useOptimisticUpdates = (updateFunction, rollbackFunction) => {
  const [isOptimisticallyUpdating, setIsOptimisticallyUpdating] = useState(false);

  const performOptimisticUpdate = useCallback(async (optimisticData, actualUpdateFunction) => {
    try {
      setIsOptimisticallyUpdating(true);
      
      // Apply optimistic update immediately
      if (updateFunction) {
        updateFunction(optimisticData);
      }
      
      // Perform actual update
      const result = await actualUpdateFunction();
      
      return result;
    } catch (error) {
      console.error('[useOptimisticUpdates] Update failed, rolling back:', error);
      
      // Rollback on error
      if (rollbackFunction) {
        rollbackFunction();
      }
      
      throw error;
    } finally {
      setIsOptimisticallyUpdating(false);
    }
  }, [updateFunction, rollbackFunction]);

  return {
    performOptimisticUpdate,
    isOptimisticallyUpdating
  };
};

/**
 * Hook for dashboard data caching and invalidation
 * @returns {Object} { invalidateCache, getCachedData, setCachedData }
 */
export const useDashboardCache = () => {
  const [cache, setCache] = useState({
    profile: null,
    links: null,
    stats: null,
    lastUpdated: null
  });

  const invalidateCache = useCallback((keys = null) => {
    if (keys) {
      // Invalidate specific keys
      setCache(prev => {
        const newCache = { ...prev };
        if (Array.isArray(keys)) {
          keys.forEach(key => {
            newCache[key] = null;
          });
        } else {
          newCache[keys] = null;
        }
        return newCache;
      });
    } else {
      // Invalidate all cache
      setCache({
        profile: null,
        links: null,
        stats: null,
        lastUpdated: null
      });
    }
  }, []);

  const getCachedData = useCallback((key) => {
    return cache[key];
  }, [cache]);

  const setCachedData = useCallback((key, data) => {
    setCache(prev => ({
      ...prev,
      [key]: data,
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  return {
    invalidateCache,
    getCachedData,
    setCachedData,
    cache
  };
};
