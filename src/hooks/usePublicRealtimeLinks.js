/**
 * usePublicRealtimeLinks Hook
 * 
 * Hook for fetching public links data by username with real-time updates
 * @param {string} username - The username to fetch links for
 * @returns {Object} { data, loading, error, refetch, isRealTimeConnected }
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabase.js';
import LinksService from '../services/LinksService.js';

export const usePublicRealtimeLinks = (username) => {
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
        console.warn('[usePublicRealtimeLinks] Setting profileId from first link:', linksData[0].user_id);
        setProfileId(linksData[0].user_id);
      } else {
        console.warn('[usePublicRealtimeLinks] No links found, trying to get profile ID from profile service');
        // If no links, we need to get the profile ID another way
        try {
          const { ProfileService } = await import('../services');
          const profile = await ProfileService.getProfileByUsername(username);
          if (profile?.id) {
            console.warn('[usePublicRealtimeLinks] Setting profileId from profile service:', profile.id);
            setProfileId(profile.id);
          } else {
            console.warn('[usePublicRealtimeLinks] Could not get profile ID from profile service');
          }
        } catch (profileErr) {
          console.warn('[usePublicRealtimeLinks] Could not get profile ID for subscription:', profileErr);
        }
      }
      
    } catch (err) {
      console.error('[usePublicRealtimeLinks] Error fetching links:', err);
      setError(err.message || 'Failed to load links');
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Set up real-time subscription
  const setupRealTimeSubscription = useCallback(() => {
    if (!profileId) {
      console.warn('[usePublicRealtimeLinks] No profileId available for subscription');
      return;
    }
    
    if (subscriptionRef.current) {
      console.warn('[usePublicRealtimeLinks] Subscription already exists');
      return;
    }

    console.warn('[usePublicRealtimeLinks] Setting up real-time subscription for user:', profileId);

    const subscription = supabase
      .channel(`public-links-${profileId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'links',
          filter: `user_id=eq.${profileId}`
        },
        (payload) => {
          console.warn('[usePublicRealtimeLinks] Real-time update received:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              console.warn('[usePublicRealtimeLinks] Processing INSERT event for link:', payload.new.id);
              // Add the new link to the list
              setLinks(prevLinks => [...prevLinks, payload.new]);
              break;
              
            case 'UPDATE':
              console.warn('[usePublicRealtimeLinks] Processing UPDATE event for link:', payload.new.id);
              // Update the existing link
              setLinks(prevLinks => 
                prevLinks.map(link => 
                  link.id === payload.new.id ? payload.new : link
                )
              );
              break;
              
            case 'DELETE':
              console.warn('[usePublicRealtimeLinks] Processing DELETE event for link:', payload.old.id);
              // Remove the deleted link
              setLinks(prevLinks => 
                prevLinks.filter(link => link.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe((status) => {
        console.warn('[usePublicRealtimeLinks] Subscription status:', status);
        setIsRealTimeConnected(status === 'SUBSCRIBED');
      });

    subscriptionRef.current = subscription;
  }, [profileId]);

  // Clean up subscription
  const cleanupSubscription = useCallback(() => {
    if (subscriptionRef.current) {
      console.warn('[usePublicRealtimeLinks] Cleaning up real-time subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
      setIsRealTimeConnected(false);
    }
  }, []);

  // Fetch links when username changes
  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Set up subscription when profileId is available
  useEffect(() => {
    if (profileId) {
      setupRealTimeSubscription();
    }

    // Cleanup on unmount or when profileId changes
    return cleanupSubscription;
  }, [profileId, setupRealTimeSubscription, cleanupSubscription]);

  // Manual refresh function
  const refetch = useCallback(() => {
    fetchLinks();
  }, [fetchLinks]);

  return {
    data: links,
    loading,
    error,
    refetch,
    isRealTimeConnected,
    // Computed properties for common checks
    isEmpty: !loading && links.length === 0,
    count: links.length
  };
};
