/**
 * usePublicRealtimeLinks Hook
 * 
 * Hook for fetching public links data by username with real-time updates
 * @param {string} username - The username to fetch links for
 * @returns {Object} { data, loading, error, refetch, isRealTimeConnected }
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabase.js';
import { ProfileService } from '../services';
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
        setProfileId(linksData[0].user_id);
      } else {
        // If no links, we need to get the profile ID another way
        try {
          const profile = await ProfileService.getProfileByUsername(username);
          if (profile?.id) {
            setProfileId(profile.id);
          }
        } catch (profileErr) {
          console.error('[usePublicRealtimeLinks] Could not get profile ID for subscription:', profileErr);
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
      return;
    }
    
    if (subscriptionRef.current) {
      return;
    }

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
          switch (payload.eventType) {
            case 'INSERT':
              // Add the new link to the list and sort by position
              setLinks(prevLinks => {
                const newLinks = [...prevLinks, payload.new];
                const sortedLinks = newLinks.sort((a, b) => (a.position || 0) - (b.position || 0));
                return sortedLinks;
              });
              break;
              
            case 'UPDATE':
              // Update the existing link and re-sort by position
              setLinks(prevLinks => {
                const updatedLinks = prevLinks.map(link => 
                  link.id === payload.new.id ? payload.new : link
                );
                const sortedLinks = updatedLinks.sort((a, b) => (a.position || 0) - (b.position || 0));
                return sortedLinks;
              });
              break;
              
            case 'DELETE':
              // Remove the deleted link
              setLinks(prevLinks => {
                const filteredLinks = prevLinks.filter(link => link.id !== payload.old.id);
                return filteredLinks;
              });
              break;
          }
        }
      )
      .subscribe((status) => {
        setIsRealTimeConnected(status === 'SUBSCRIBED');
      });

    subscriptionRef.current = subscription;
  }, [profileId]);

  // Clean up subscription
  const cleanupSubscription = useCallback(() => {
    if (subscriptionRef.current) {
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
