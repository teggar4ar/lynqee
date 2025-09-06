/**
 * useUserLinks Hook
 * 
 * Enhanced hook for fetching and managing the current authenticated user's links data
 * Now uses the refactored LinksContext and progressive loading pattern.
 * 
 * @param {string} userId - The user ID to fetch links for
 * @returns {Object} { data, loading, error, refetch }
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLinks } from '../contexts/LinksContext.jsx';
import LinksService from '../services/LinksService.js';
import { supabase } from '../services/supabase.js';
import { withProgressiveLoading } from './withProgressiveLoading.js';

/**
 * Base hook for links data fetching (without progressive loading)
 */
const useBaseUserLinks = (userId) => {
  const { 
    linksData, 
    hasLinksData, 
    updateLinks, 
    addLinkOptimistic,
    removeLinkOptimistic,
    isRefreshingLinks, 
    setIsRefreshingLinks 
  } = useLinks();
  
  const [error, setError] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(!hasLinksData && !!userId);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  
  const subscriptionRef = useRef(null);

  const fetchLinks = useCallback(async (showLoading = false) => {
    if (!userId) {
      setIsInitialLoading(false);
      setIsRefreshingLinks(false);
      return;
    }

    try {
      setError(null);
      if (showLoading) setIsRefreshingLinks(true);

      const result = await LinksService.getLinksByUserId(userId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch links');
      }
      
      updateLinks(result.data);
      
      if (!hasLinksData) {
        setIsInitialLoading(false);
      }
    } catch (err) {
      console.error('[useUserLinks] Error:', err);
      setError(err.message || 'Failed to fetch links');
      if (!hasLinksData) {
        setIsInitialLoading(false);
      }
    } finally {
      if (showLoading) setIsRefreshingLinks(false);
    }
  }, [userId, updateLinks, setIsRefreshingLinks, hasLinksData]);

  // Set up real-time subscription for user's own links
  const setupRealTimeSubscription = useCallback(() => {
    if (!userId || subscriptionRef.current) return;

    // Initialize real-time monitoring for user links
    const subscription = supabase
      .channel(`user-links-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'links',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              // Use functional update to get the current state
              updateLinks(currentLinks => {
                const links = currentLinks || [];
                const existingLink = links.find(link => link.id === payload.new.id);
                if (existingLink) {
                  // Link already exists (likely from optimistic update), just update it with server data
                  const updatedLinks = links.map(link => 
                    link.id === payload.new.id ? payload.new : link
                  );
                  // Sort by position to maintain correct order
                  return updatedLinks.sort((a, b) => (a.position || 0) - (b.position || 0));
                } else {
                  // New link, add it to the list and sort by position
                  const newLinks = [...links, payload.new];
                  return newLinks.sort((a, b) => (a.position || 0) - (b.position || 0));
                }
              });
              break;
              
            case 'UPDATE':
              // Update the existing link using functional update
              updateLinks(currentLinks => {
                const links = currentLinks || [];
                const updatedLinks = links.map(link => 
                  link.id === payload.new.id ? payload.new : link
                );
                // Sort by position to maintain correct order after position updates
                const sortedLinks = updatedLinks.sort((a, b) => (a.position || 0) - (b.position || 0));
                return sortedLinks;
              });
              break;
              
            case 'DELETE':
              // Remove the deleted link using functional update
              updateLinks(currentLinks => 
                (currentLinks || []).filter(link => link.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe((status) => {
        setIsRealTimeConnected(status === 'SUBSCRIBED');
      });

    subscriptionRef.current = subscription;
  }, [userId, updateLinks]);

  // Initial fetch effect - only runs when userId or hasLinksData changes
  useEffect(() => {
    if (!userId) {
      setIsInitialLoading(false);
      setIsRefreshingLinks(false);
      return;
    }
    
    if (!hasLinksData) {
      fetchLinks(false);
    }
  }, [userId, hasLinksData, fetchLinks, setIsRefreshingLinks]);

  // Real-time subscription effect - only runs when userId changes
  useEffect(() => {
    if (!userId) {
      return;
    }
    
    // Set up real-time subscription
    setupRealTimeSubscription();

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        // Clean up real-time subscription
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
        setIsRealTimeConnected(false);
      }
    };
  }, [userId, setupRealTimeSubscription]); // Only run when userId changes

  // Manual refresh function
  const refetch = useCallback(() => {
    fetchLinks(true);
  }, [fetchLinks]);

  // Optimistic update functions
  const addOptimistic = useCallback((newLink) => {
    addLinkOptimistic(newLink);
  }, [addLinkOptimistic]);

  const removeOptimistic = useCallback((linkId) => {
    removeLinkOptimistic(linkId);
  }, [removeLinkOptimistic]);

  // Visibility management functions
  const toggleVisibility = useCallback(async (linkId, isPublic) => {
    try {
      // Optimistic update first
      updateLinks(currentLinks => {
        const links = currentLinks || [];
        return links.map(link => 
          link.id === linkId ? { ...link, is_public: isPublic } : link
        );
      });

      const result = await LinksService.toggleLinkVisibility(linkId, isPublic);
      
      if (!result.success) {
        // Revert optimistic update on error
        updateLinks(currentLinks => {
          const links = currentLinks || [];
          return links.map(link => 
            link.id === linkId ? { ...link, is_public: !isPublic } : link
          );
        });
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to toggle link visibility:', error);
      throw error;
    }
  }, [updateLinks]);

  const bulkToggleVisibility = useCallback(async (linkIds, isPublic) => {
    try {
      const results = await Promise.all(
        linkIds.map(linkId => toggleVisibility(linkId, isPublic))
      );
      return results;
    } catch (error) {
      console.error('Failed to bulk toggle visibility:', error);
      throw error;
    }
  }, [toggleVisibility]);

  // Computed properties for link visibility stats
  const linksArray = linksData || [];
  const publicLinks = linksArray.filter(link => link.is_public);
  const privateLinks = linksArray.filter(link => !link.is_public);
  
  const stats = {
    total: linksArray.length,
    public: publicLinks.length,
    private: privateLinks.length
  };

  return {
    data: linksData || [],
    loading: isInitialLoading,
    refreshing: isRefreshingLinks,
    error,
    refetch,
    hasData: hasLinksData,
    isRealTimeConnected,
    // Optimistic update methods
    addOptimistic,
    removeOptimistic,
    // New computed properties
    publicLinks,
    privateLinks,
    stats,
    // New visibility management methods
    toggleVisibility,
    bulkToggleVisibility
  };
};

/**
 * Enhanced hook with progressive loading
 * Uses cached data from previous navigation while fetching fresh data
 */
export const useUserLinks = withProgressiveLoading(useBaseUserLinks, {
  getCacheKey: (userId) => `user-links-${userId}`,
  enableCache: true,
});

export default useUserLinks;
