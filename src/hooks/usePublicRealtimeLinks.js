/**
 * usePublicRealtimeLinks Hook
 * 
 * Hook for fetching public links data by username with real-time updates
 * Uses useEnhancedRealtime for centralized connection management
 * @param {string} username - The username to fetch links for
 * @returns {Object} { data, loading, error, refetch, isRealTimeConnected }
 */

import { useCallback, useEffect, useState } from 'react';
import { ProfileService } from '../services';
import LinksService from '../services/LinksService.js';
import { useAlerts } from './useAlerts.js';
import { useEnhancedRealtime } from './useEnhancedRealtime.js';

export const usePublicRealtimeLinks = (username) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileId, setProfileId] = useState(null);
  
  const { showInfo } = useAlerts();

  // Handle real-time events for public links
  const handleRealtimeEvent = useCallback((payload) => {
    if (!payload || !profileId) return;

    console.warn('[usePublicRealtimeLinks] Received real-time event:', payload);
    
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          if (newRecord && newRecord.user_id === profileId && newRecord.is_public) {
            setLinks(prevLinks => {
              // Check if link already exists to prevent duplicates
              const existingLinkIndex = prevLinks.findIndex(link => link.id === newRecord.id);
              if (existingLinkIndex === -1) {
                return [...prevLinks, newRecord].sort((a, b) => (a.position || 0) - (b.position || 0));
              }
              return prevLinks;
            });
          }
          break;
          
        case 'UPDATE':
          if (newRecord && newRecord.user_id === profileId) {
            setLinks(prevLinks => {
              const existingLinkIndex = prevLinks.findIndex(link => link.id === newRecord.id);
              
              if (newRecord.is_public) {
                // Link is now public or updated
                if (existingLinkIndex >= 0) {
                  // Update existing public link
                  const updatedLinks = prevLinks.map(link => 
                    link.id === newRecord.id ? { ...link, ...newRecord } : link
                  );
                  return updatedLinks.sort((a, b) => (a.position || 0) - (b.position || 0));
                } else {
                  // Add newly public link
                  const newLinks = [...prevLinks, newRecord];
                  return newLinks.sort((a, b) => (a.position || 0) - (b.position || 0));
                }
              } else {
                // Link is now private - remove it if it was public
                return prevLinks.filter(link => link.id !== newRecord.id);
              }
            });
          }
          break;
          
        case 'DELETE':
          if (oldRecord && oldRecord.user_id === profileId) {
            setLinks(prevLinks => prevLinks.filter(link => link.id !== oldRecord.id));
          }
          break;
          
        default:
          console.warn('[usePublicRealtimeLinks] Unknown event type:', eventType);
      }
    } catch (error) {
      console.error('[usePublicRealtimeLinks] Error handling real-time event:', error);
    }
  }, [profileId]);

  // Use enhanced real-time connection management
  const {
    isConnected: isRealTimeConnected,
    connectionError,
    connectionQuality,
    reconnectInfo,
    forceReconnect,
    cancelReconnection
  } = useEnhancedRealtime({
    channelName: profileId ? `public-links-${profileId}` : null,
    subscriptionConfig: profileId ? {
      event: '*',
      schema: 'public',
      table: 'links',
      filter: `user_id=eq.${profileId}`
    } : null,
    onPayload: handleRealtimeEvent,
    enabled: !!profileId && !!username
  });

  // Fetch public links by username
  const fetchLinks = useCallback(async () => {
    if (!username) {
      setLinks([]);
      setLoading(false);
      setProfileId(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await LinksService.getPublicLinksByUsername(username);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch links');
      }
      
      const linksData = result.data;
      setLinks(linksData);
      
      // Get the user_id from the first link to set up real-time subscription
      if (linksData.length > 0 && linksData[0].user_id) {
        setProfileId(linksData[0].user_id);
      } else {
        // If no links, we need to get the profile ID another way
        try {
          const profileResult = await ProfileService.getPublicProfileByUsername(username);
          if (profileResult.success && profileResult.data?.id) {
            setProfileId(profileResult.data.id);
          }
        } catch (profileErr) {
          console.error('[usePublicRealtimeLinks] Could not get profile ID for subscription:', profileErr);
          // Still set profileId to null to cleanup any existing subscriptions
          setProfileId(null);
        }
      }
      
    } catch (err) {
      console.error('[usePublicRealtimeLinks] Error fetching links:', err);
      setError(err.message || 'Failed to load links');
      setLinks([]);
      setProfileId(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Fetch links when username changes
  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Manual refresh function with contextual feedback
  const refetch = useCallback(() => {
    // Show contextual message when real-time is unavailable
    if (!isRealTimeConnected && !loading) {
      showInfo({
        title: 'Getting Latest Updates',
        message: 'Refreshing to ensure you have the most current information',
        duration: 2000,
        position: 'top-center'
      });
    }
    
    return fetchLinks();
  }, [fetchLinks, isRealTimeConnected, loading, showInfo]);

  return {
    data: links,
    loading,
    error,
    refetch,
    isRealTimeConnected,
    connectionError,
    connectionQuality,
    reconnectInfo,
    // Computed properties for common checks
    isEmpty: !loading && links.length === 0,
    count: links.length,
    // Enhanced connection management
    forceReconnect,
    cancelReconnection
  };
};

export default usePublicRealtimeLinks;
