/**
 * usePublicProfile Hook
 * 
 * Hook for fetching public profile data by username
 * @param {string} username - The username to fetch profile for
 * @returns {Object} { data, loading, error, refetch }
 */

import { useCallback, useEffect, useState } from 'react';
import { ProfileService } from '../services';

export const usePublicProfile = (username) => {
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
      console.error('[usePublicProfile] Error fetching profile:', err);
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

  // Manual refresh function
  const refetch = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    data: profile,
    loading,
    error,
    refetch,
    // Computed properties for common checks
    exists: profile !== null,
    notFound: !loading && !error && profile === null,
  };
};
