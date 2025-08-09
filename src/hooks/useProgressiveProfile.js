/**
 * useProgressiveProfile - Progressive profile data loading
 * 
 * Returns cached profile data immediately while refreshing in background.
 * Eliminates loading screens on navigation.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAppState } from '../contexts/AppStateContext.jsx';
import ProfileService from '../services/ProfileService.js';

export const useProgressiveProfile = (userId) => {
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
      setIsRefreshingProfile(false); // Stop any ongoing refresh
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
      console.error('[useProgressiveProfile] Error:', err);
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
      // Clear loading state when user is null (e.g., during sign out)
      setIsInitialLoading(false);
      setIsRefreshingProfile(false);
      return;
    }
    
    if (!hasProfileData) {
      fetchProfile(false);
    }
  }, [userId, hasProfileData, fetchProfile, setIsRefreshingProfile]);

  // Background refresh function
  const refreshProfile = () => {
    fetchProfile(true);
  };

  return {
    profile: profileData,
    loading: isInitialLoading, // Only true for very first load
    refreshing: isRefreshingProfile, // Background refresh indicator
    error,
    refetch: refreshProfile,
    hasData: hasProfileData
  };
};
