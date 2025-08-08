/**
 * useRealtimeDashboard Hook - Unified Real-Time Dashboard Data Management
 * 
 * This hook combines all real-time dashboard functionality into one cohesive system:
 * - Real-time stats computation
 * - Link data synchronization  
 * - Profile updates
 * - Connection status management
 * - Optimistic updates support
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabase.js';
import LinksService from '../services/LinksService.js';

/**
 * Unified hook for all real-time dashboard data
 * @param {string} userId - The user ID to track data for
 * @returns {Object} Complete dashboard data with real-time updates
 */
export const useRealtimeDashboard = (userId) => {
  // Core data state
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    profileViews: 0
  });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Real-time connection state
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Subscription tracking
  const subscriptionRef = useRef(null);
  const profileSubscriptionRef = useRef(null);

  // Helper function to compute stats from links
  const computeStats = useCallback((linksData) => {
    return {
      totalLinks: linksData.length,
      totalClicks: 0, // TODO: Sum clicks from links when click tracking is implemented
      profileViews: 0, // TODO: Get from analytics when implemented
    };
  }, []);

  // Fetch initial data
  const fetchDashboardData = useCallback(async () => {
    if (!userId) {
      setLinks([]);
      setStats({ totalLinks: 0, totalClicks: 0, profileViews: 0 });
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Fetch links data
      const linksData = await LinksService.getLinksByUserId(userId);
      
      // Update state
      setLinks(linksData);
      const newStats = computeStats(linksData);
      setStats(newStats);
      setLastUpdated(new Date().toISOString());
      
    } catch (err) {
      console.error('[useRealtimeDashboard] Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [userId, computeStats]);

  // Handle real-time link changes with optimistic updates
  const handleLinkChange = useCallback((payload) => {
    
    setLinks(currentLinks => {
      let newLinks = [...currentLinks];
      
      switch (payload.eventType) {
        case 'INSERT':
          // Add new link optimistically
          newLinks.push(payload.new);
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
          break;
          
        default:
          return currentLinks;
      }
      
      // Compute new stats immediately
      const newStats = computeStats(newLinks);
      setStats(newStats);
      setLastUpdated(new Date().toISOString());
      
      return newLinks;
    });
  }, [computeStats]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!userId) {
      setIsRealTimeConnected(false);
      return;
    }

    // Links subscription
    const linksSubscription = supabase
      .channel(`dashboard_links_${userId}`)
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
        setIsRealTimeConnected(status === 'SUBSCRIBED');
      });

    // Profile subscription (for future use when profile changes affect dashboard)
    const profileSubscription = supabase
      .channel(`dashboard_profile_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`
        },
        (_payload) => {
          // Future: Handle profile changes that affect dashboard
        }
      )
      .subscribe();

    subscriptionRef.current = linksSubscription;
    profileSubscriptionRef.current = profileSubscription;

    // Initial data fetch
    fetchDashboardData();

    // Cleanup subscriptions
    return () => {
      
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      
      if (profileSubscriptionRef.current) {
        supabase.removeChannel(profileSubscriptionRef.current);
        profileSubscriptionRef.current = null;
      }
      
      setIsRealTimeConnected(false);
    };
  }, [userId, handleLinkChange, fetchDashboardData]);

  // Manual refresh function
  const refetch = useCallback(() => {
    setLoading(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Optimistic update helpers for future CRUD operations
  const optimisticUpdate = useCallback((updateType, data) => {
    switch (updateType) {
      case 'ADD_LINK':
        setLinks(prev => [...prev, { ...data, id: `temp_${Date.now()}` }]);
        setStats(prev => ({ ...prev, totalLinks: prev.totalLinks + 1 }));
        break;
      case 'REMOVE_LINK':
        setLinks(prev => prev.filter(link => link.id !== data.id));
        setStats(prev => ({ ...prev, totalLinks: Math.max(0, prev.totalLinks - 1) }));
        break;
      case 'UPDATE_LINK':
        setLinks(prev => prev.map(link => link.id === data.id ? { ...link, ...data } : link));
        break;
    }
    setLastUpdated(new Date().toISOString());
  }, []);

  return {
    // Data
    links,
    stats,
    
    // States
    loading,
    error,
    isRealTimeConnected,
    lastUpdated,
    
    // Actions
    refetch,
    optimisticUpdate,
    
    // Computed properties
    hasLinks: links.length > 0,
    isEmpty: !loading && links.length === 0,
    isStale: !isRealTimeConnected && !loading,
  };
};
