/**
 * useLinks Hook
 * 
 * Custom hook for fetching and managing links data
 * Provides loading states, error handling, and caching for link operations
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { LinksService } from '../services';
import { supabase } from '../services/supabase';

/**
 * Hook for fetching links by username (public access)
 * @param {string} username - The username to fetch links for
 * @returns {Object} { links, loading, error, refetch }
 */
export const usePublicLinks = (username) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLinks = useCallback(async () => {
    if (!username) {
      setLinks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const linksData = await LinksService.getLinksByUsername(username);
      setLinks(linksData);
    } catch (err) {
      console.error('[useLinks] Error fetching links:', err);
      setError(err.message || 'Failed to load links');
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Fetch links when username changes
  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    fetchLinks();
  }, [fetchLinks]);

  return {
    links,
    loading,
    error,
    refetch,
    // Computed properties
    hasLinks: links.length > 0,
    linkCount: links.length,
  };
};

/**
 * Hook for managing links for the current user (authenticated)
 * @param {string} userId - The user ID
 * @returns {Object} { links, loading, error, refetch, createLink, updateLink, deleteLink, reorderLinks }
 */
export const useLinks = (userId) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const subscriptionRef = useRef(null);

  const fetchLinks = useCallback(async () => {
    if (!userId) {
      setLinks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const linksData = await LinksService.getLinksByUserId(userId);
      setLinks(linksData);
    } catch (err) {
      console.error('[useLinks] Error fetching links:', err);
      setError(err.message || 'Failed to load links');
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleLinkChange = useCallback(
    (payload) => {
      setIsRealTimeConnected(true);
      switch (payload.eventType) {
        case 'INSERT':
          setLinks((current) =>
            [...current, payload.new].sort((a, b) => (a.position || 0) - (b.position || 0))
          );
          break;
        case 'DELETE':
          setLinks((current) => current.filter((link) => link.id !== payload.old.id));
          break;
        case 'UPDATE':
          setLinks((current) =>
            current.map((link) => (link.id === payload.new.id ? payload.new : link))
          );
          break;
        default:
          break;
      }
    },
    []
  );

  // Fetch links when userId changes
  useEffect(() => {
    fetchLinks();

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    if (userId) {
      subscriptionRef.current = supabase
        .channel(`links_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'links',
            filter: `user_id=eq.${userId}`,
          },
          handleLinkChange
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsRealTimeConnected(true);
          }
        });
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [fetchLinks, userId, handleLinkChange]);

  // Create new link with optimistic updates
  const createLink = useCallback(async (linkData) => {
    if (!userId) return;

    try {
      setError(null);
      
      // Add user_id to the link data
      const linkWithUserId = { ...linkData, user_id: userId };
      
      // Optimistic update
      const tempId = `temp_${Date.now()}`;
      const optimisticLink = { ...linkWithUserId, id: tempId, created_at: new Date().toISOString() };
      setLinks(prev => [...prev, optimisticLink]);
      
      // Actual creation
      const newLink = await LinksService.createLink(linkWithUserId);
      
      // Replace optimistic update with real data
      setLinks(prev => prev.map(link => 
        link.id === tempId ? newLink : link
      ));
      
      return newLink;
    } catch (err) {
      console.error('[useLinks] Error creating link:', err);
      setError(err.message || 'Failed to create link');
      
      // Remove optimistic update on error
      setLinks(prev => prev.filter(link => !link.id.toString().startsWith('temp_')));
      
      throw err;
    }
  }, [userId]);

  // Update existing link with optimistic updates
  const updateLink = useCallback(async (linkId, updates) => {
    try {
      setError(null);
      
      // Optimistic update
      setLinks(prev => prev.map(link => 
        link.id === linkId ? { ...link, ...updates } : link
      ));
      
      // Actual update
      const updatedLink = await LinksService.updateLink(linkId, updates);
      
      // Update with server response
      setLinks(prev => prev.map(link => 
        link.id === linkId ? updatedLink : link
      ));
      
      return updatedLink;
    } catch (err) {
      console.error('[useLinks] Error updating link:', err);
      setError(err.message || 'Failed to update link');
      
      // Revert optimistic update on error
      await fetchLinks();
      
      throw err;
    }
  }, [fetchLinks]);

  // Delete link with optimistic updates
  const deleteLink = useCallback(async (linkId) => {
    try {
      setError(null);
      
      // Optimistic update
      setLinks(prev => prev.filter(link => link.id !== linkId));
      
      // Actual deletion
      await LinksService.deleteLink(linkId);
      
      return true;
    } catch (err) {
      console.error('[useLinks] Error deleting link:', err);
      setError(err.message || 'Failed to delete link');
      
      // Revert optimistic update on error
      await fetchLinks();
      
      throw err;
    }
  }, [fetchLinks]);

  // Reorder links with optimistic updates
  const reorderLinks = useCallback(async (newOrder) => {
    try {
      setError(null);
      
      // Optimistic update
      setLinks(newOrder);
      
      // Prepare position updates
      const positionUpdates = newOrder.map((link, index) => ({
        id: link.id,
        position: index
      }));
      
      // Actual reorder
      await LinksService.updateLinkPositions(positionUpdates);
      
      return true;
    } catch (err) {
      console.error('[useLinks] Error reordering links:', err);
      setError(err.message || 'Failed to reorder links');
      
      // Revert optimistic update on error
      await fetchLinks();
      
      throw err;
    }
  }, [fetchLinks]);

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    fetchLinks();
  }, [fetchLinks]);

  return {
    links,
    loading,
    error,
    refetch,
    createLink,
    updateLink,
    deleteLink,
    reorderLinks,
    isRealTimeConnected,
    // Computed properties
    hasLinks: links.length > 0,
    linkCount: links.length,
  };
};
