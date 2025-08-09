/**
 * useProgressiveLinks - Progressive links data loading
 * 
 * Returns cached links data immediately while refreshing in background.
 * Supports real-time updates and optimistic UI updates.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppState } from '../contexts/AppStateContext.jsx';
import LinksService from '../services/LinksService.js';
import { supabase } from '../services/supabase.js';

export const useProgressiveLinks = (userId) => {
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
      setIsRefreshingLinks(false); // Stop any ongoing refresh
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
      console.error('[useProgressiveLinks] Error:', err);
      setError(err.message || 'Failed to fetch links');
      if (!hasLinksData) {
        setIsInitialLoading(false);
      }
    } finally {
      if (showLoading) setIsRefreshingLinks(false);
    }
  }, [userId, updateLinks, setIsRefreshingLinks, hasLinksData]);

  // Handle real-time link changes
  const handleLinkChange = useCallback((payload) => {
    setIsRealTimeConnected(true);
    
    switch (payload.eventType) {
      case 'INSERT':
        addLinkOptimistic(payload.new);
        break;
      case 'DELETE':
        removeLinkOptimistic(payload.old.id);
        break;
      case 'UPDATE':
        // Refresh data for updates to ensure consistency
        fetchLinks(false);
        break;
      default:
        break;
    }
  }, [addLinkOptimistic, removeLinkOptimistic, fetchLinks]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) {
      // Clear states when user is null (e.g., during sign out)
      setIsInitialLoading(false);
      setIsRefreshingLinks(false);
      return;
    }

    // Initial fetch only if no cached data
    if (!hasLinksData) {
      fetchLinks(false);
    }

    // Set up real-time subscription
    subscriptionRef.current = supabase
      .channel(`links_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'links',
          filter: `user_id=eq.${userId}`
        },
        handleLinkChange
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealTimeConnected(true);
        } else if (status === 'CHANNEL_ERROR') {
          setIsRealTimeConnected(false);
          console.warn('[useProgressiveLinks] Real-time subscription error');
        }
      });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        setIsRealTimeConnected(false);
      }
    };
  }, [userId, hasLinksData, handleLinkChange, fetchLinks, setIsRefreshingLinks]);

  // Background refresh function
  const refreshLinks = () => {
    fetchLinks(true);
  };

  return {
    links: linksData,
    stats: dashboardStats,
    loading: isInitialLoading, // Only true for very first load
    refreshing: isRefreshingLinks, // Background refresh indicator
    error,
    isRealTimeConnected,
    refetch: refreshLinks,
    hasData: hasLinksData,
    // Helper properties
    hasLinks: linksData.length > 0
  };
};
