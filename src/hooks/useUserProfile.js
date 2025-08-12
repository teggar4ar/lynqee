/**
 * useUserProfile Hook
 * 
 * Hook for fetching and managing the current authenticated user's profile data
 * @param {string} userId - The user ID to fetch profile for
 * @returns {Object} { data, loading, error, refetch }
 */

import { useCallback, useEffect, useState } from 'react';
import { useAppState } from '../contexts/AppStateContext.jsx';
import ProfileService from '../services/ProfileService.js';

export const useUserProfile = (userId) => {
  const { 
    profileData, 
    hasProfileData, 
    updateProfile, 
    isRefreshingProfile, 
    setIsRefreshingProfile 
  } = useAppState();
  
  const [error, setError] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(!hasProfileData && !!userId);

  const fetchProfile = useCallback(async (showLoading = false) => {
    if (!userId) {
      setIsRefreshingProfile(false);
      return;
    }

    try {
      setError(null);
      if (showLoading) setIsRefreshingProfile(true);

      const profile = await ProfileService.getProfileById(userId);
      updateProfile(profile);
      
      if (!hasProfileData) {
        setIsInitialLoading(false);
      }
    } catch (err) {
      console.error('[useUserProfile] Error:', err);
      setError(err.message || 'Failed to fetch profile');
      if (!hasProfileData) {
        setIsInitialLoading(false);
      }
    } finally {
      if (showLoading) setIsRefreshingProfile(false);
    }
  }, [userId, updateProfile, setIsRefreshingProfile, hasProfileData]);

  // Initial fetch only if no cached data
  useEffect(() => {
    if (!userId) {
      setIsInitialLoading(false);
      setIsRefreshingProfile(false);
      return;
    }
    
    if (!hasProfileData) {
      fetchProfile(false);
    }
  }, [userId, hasProfileData, fetchProfile, setIsRefreshingProfile]);

  // Manual refresh function
  const refetch = useCallback(() => {
    fetchProfile(true);
  }, [fetchProfile]);

  return {
    data: profileData,
    loading: isInitialLoading,
    refreshing: isRefreshingProfile,
    error,
    refetch,
    hasData: hasProfileData
  };
};
