/**
 * useRealtimeLinks Hook
 * 
 * Enhanced version of useLinks with real-time updates for public profiles
 * Listens to database changes and updates links immediately
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabase.js';
import LinksService from '../services/LinksService.js';

/**
 * Hook for fetching links by username with real-time updates (public access)
 * @param {string} username - The username to fetch links for
 * @returns {Object} { links, loading, error, refetch, isRealTimeConnected }
 */
export const useRealtimeLinks = (username) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [profileId, setProfileId] = useState(null);
  
  // Subscription tracking
  const subscriptionRef = useRef(null);

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
      
      // Get the user_id from the first link to set up real-time subscription
      if (linksData.length > 0 && linksData[0].user_id) {
        setProfileId(linksData[0].user_id);
      } else {
        // If no links, we need to get the profile ID another way
        // For now, we'll handle this in the subscription setup
      }
      
    } catch (err) {
      console.error('[useRealtimeLinks] Error fetching links:', err);
      setError(err.message || 'Failed to load links');
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Handle real-time link changes
  const handleLinkChange = useCallback((payload) => {
    
    setLinks(currentLinks => {
      let newLinks = [...currentLinks];
      
      switch (payload.eventType) {
        case 'INSERT':
          // Add new link
          newLinks.push(payload.new);
          // Sort by position to maintain order
          newLinks.sort((a, b) => (a.position || 0) - (b.position || 0));
          break;
          
        case 'DELETE':
          // Remove deleted link
          newLinks = newLinks.filter(link => link.id !== payload.old.id);
          break;
          
        case 'UPDATE':
          // Update existing link
          newLinks = newLinks.map(link => 
            link.id === payload.new.id ? payload.new : link
          );
          // Re-sort in case position changed
          newLinks.sort((a, b) => (a.position || 0) - (b.position || 0));
          break;
          
        default:
          return currentLinks;
      }
      
      return newLinks;
    });
  }, []);

  // Get profile ID if we don't have it yet
  const getProfileId = useCallback(async () => {
    if (!username) return null;
    
    try {
      // We need to query the profiles table to get the user_id for this username
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', username)
        .single();
        
      if (error) {
        console.error('[useRealtimeLinks] Error getting profile ID:', error);
        return null;
      }
      
      return data?.user_id;
    } catch (err) {
      console.error('[useRealtimeLinks] Error in getProfileId:', err);
      return null;
    }
  }, [username]);

  // Setup real-time subscription
  useEffect(() => {
    let mounted = true;
    
    const setupSubscription = async () => {
      if (!username) {
        setIsRealTimeConnected(false);
        return;
      }

      // Get profile ID if we don't have it
      let userId = profileId;
      if (!userId) {
        userId = await getProfileId();
        if (userId && mounted) {
          setProfileId(userId);
        }
      }

      if (!userId) {
        setIsRealTimeConnected(false);
        return;
      }

      // Create subscription for this user's links
      const subscription = supabase
        .channel(`public_links_${userId}`)
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
          if (mounted) {
            setIsRealTimeConnected(status === 'SUBSCRIBED');
          }
        });

      subscriptionRef.current = subscription;
    };

    // Initial fetch
    fetchLinks().then(() => {
      if (mounted) {
        setupSubscription();
      }
    });

    // Cleanup subscription
    return () => {
      mounted = false;
      
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      
      setIsRealTimeConnected(false);
    };
  }, [username, profileId, fetchLinks, handleLinkChange, getProfileId]);

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    fetchLinks();
  }, [fetchLinks]);

  return {
    links,
    loading,
    error,
    refetch,
    isRealTimeConnected,
    // Computed properties
    hasLinks: links.length > 0,
    linkCount: links.length,
  };
};
