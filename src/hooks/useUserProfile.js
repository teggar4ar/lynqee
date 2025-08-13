/**
 * useUserProfile Hook
 * 
 * Enhanced hook for fetching and managing the current authenticated user's profile data
 * Now uses the refactored ProfileContext and progressive loading pattern.
 * 
 * @param {string} userId - The user ID to fetch profile for
 * @returns {Object} { data, loading, error, refetch }
 */

import { useCallback, useEffect, useState } from 'react';
import { useProfile } from '../contexts/ProfileContext.jsx';
import ProfileService from '../services/ProfileService.js';
import { withProgressiveLoading } from './withProgressiveLoading.js';

/**
 * Base hook for profile data fetching (without progressive loading)
 */
const useBaseUserProfile = (userId) => {
  const { 
    profileData, 
    hasProfileData, 
    updateProfile, 
    isRefreshingProfile, 
    setIsRefreshingProfile 
  } = useProfile();
  
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

/**
 * Enhanced hook with progressive loading
 * Uses cached data from previous navigation while fetching fresh data
 */
export const useUserProfile = withProgressiveLoading(useBaseUserProfile, {
  getCacheKey: (userId) => `user-profile-${userId}`,
  enableCache: true,
});

export default useUserProfile;
