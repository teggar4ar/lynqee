/**
 * useProfile Hook
 * 
 * Custom hook for fetching and managing profile data
 * Provides loading states, error handling, and caching for profile operations
 */

import { useCallback, useEffect, useState } from 'react';
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


