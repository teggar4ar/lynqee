/**
 * useProfile Hook
 * 
 * Custom hook for fetching and managing profile data
 * Provides loading states, error handling, and caching for profile operations
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ProfileService } from '../services';

/**
 * Hook for fetching a profile by username (public access)
 * @param {string} username - The username to fetch
 * @returns {Object} { profile, loading, error, refetch }
 */
export const useProfile = (username) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!username) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const profileData = await ProfileService.getProfileByUsername(username);
      setProfile(profileData);
    } catch (err) {
      console.error('[useProfile] Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Fetch profile when username changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch,
    // Computed properties for common checks
    exists: profile !== null,
    notFound: !loading && !error && profile === null,
  };
};

/**
 * Hook for fetching the current user's profile
 * @param {string} userId - The user ID
 * @returns {Object} { profile, loading, error, refetch, updateProfile }
 */
export const useCurrentUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchedUserId, setLastFetchedUserId] = useState(null);
  
  // Use refs to avoid stale closure issues
  const profileRef = useRef(profile);
  const errorRef = useRef(error);
  const lastFetchedUserIdRef = useRef(lastFetchedUserId);

  // Update refs when state changes
  useEffect(() => {
    profileRef.current = profile;
    errorRef.current = error;
    lastFetchedUserIdRef.current = lastFetchedUserId;
  }, [profile, error, lastFetchedUserId]);

  const fetchProfile = useCallback(async (forceRefetch = false) => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      setLastFetchedUserId(null);
      return;
    }

    // Skip fetch if we already have data for this user and it's not a forced refetch
    // Use refs to get current values and avoid stale closures
    if (!forceRefetch && 
        lastFetchedUserIdRef.current === userId && 
        profileRef.current && 
        !errorRef.current) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const profileData = await ProfileService.getProfileById(userId);
      setProfile(profileData);
      setLastFetchedUserId(userId);
    } catch (err) {
      console.error('[useCurrentUserProfile] Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
      setProfile(null);
      setLastFetchedUserId(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch profile when userId changes or on first load
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); // Depend on fetchProfile since it's memoized with userId

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    fetchProfile(true); // Force refetch
  }, [fetchProfile]);

  // Update profile function with optimistic updates
  const updateProfile = useCallback(async (updates) => {
    if (!userId || !profile) return;

    try {
      setError(null);
      
      // Optimistic update
      const optimisticProfile = { ...profile, ...updates };
      setProfile(optimisticProfile);
      
      // Actual update
      const updatedProfile = await ProfileService.updateProfile(userId, updates);
      setProfile(updatedProfile);
      
      return updatedProfile;
    } catch (err) {
      console.error('[useCurrentUserProfile] Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      
      // Revert optimistic update on error
      await fetchProfile(true);
      
      throw err;
    }
  }, [userId, profile, fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch,
    updateProfile,
    // Computed properties
    exists: profile !== null,
    hasUsername: profile && profile.username,
    needsSetup: profile && !profile.username,
  };
};
