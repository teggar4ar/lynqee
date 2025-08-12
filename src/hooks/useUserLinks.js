/**
 * useUserLinks Hook
 * 
 * Hook for fetching and managing the current authenticated user's links data
 * @param {string} userId - The user ID to fetch links for
 * @returns {Object} { data, loading, error, refetch }
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppState } from '../contexts/AppStateContext.jsx';
import LinksService from '../services/LinksService.js';
import { supabase } from '../services/supabase.js';

export const useUserLinks = (userId) => {
  const { 
    linksData, 
    dashboardStats,
    hasLinksData, 
    updateLinks, 
    addLinkOptimistic,
    removeLinkOptimistic,
    isRefreshingLinks, 
    setIsRefreshingLinks 
  } = useAppState();
  
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

      const links = await LinksService.getLinksByUserId(userId);
      updateLinks(links);
      
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

    console.warn('[useUserLinks] Setting up real-time subscription for user:', userId);

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
          console.warn('[useUserLinks] Real-time update received:', payload.eventType, 'for link:', payload.new?.id || payload.old?.id);
          
          switch (payload.eventType) {
            case 'INSERT':
              // Use functional update to get the current state
              updateLinks(currentLinks => {
                const links = currentLinks || [];
                const existingLink = links.find(link => link.id === payload.new.id);
                if (existingLink) {
                  console.warn('[useUserLinks] Link already exists, updating with server data. Total links:', links.length);
                  // Link already exists (likely from optimistic update), just update it with server data
                  return links.map(link => 
                    link.id === payload.new.id ? payload.new : link
                  );
                } else {
                  console.warn('[useUserLinks] Adding new link to existing', links.length, 'links');
                  // New link, add it to the list
                  const newLinks = [...links, payload.new];
                  console.warn('[useUserLinks] Total links after INSERT:', newLinks.length);
                  return newLinks;
                }
              });
              break;
              
            case 'UPDATE':
              // Update the existing link using functional update
              updateLinks(currentLinks => {
                const links = currentLinks || [];
                console.warn('[useUserLinks] Updating existing link in', links.length, 'links');
                return links.map(link => 
                  link.id === payload.new.id ? payload.new : link
                );
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
        if (status === 'SUBSCRIBED') {
          console.warn('[useUserLinks] Real-time subscription connected');
        }
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
        console.warn('[useUserLinks] Cleaning up real-time subscription (effect cleanup)');
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

  return {
    data: linksData || [],
    loading: isInitialLoading,
    refreshing: isRefreshingLinks,
    error,
    refetch,
    hasData: hasLinksData,
    isRealTimeConnected,
    stats: dashboardStats,
    // Optimistic update methods
    addOptimistic,
    removeOptimistic
  };
};
