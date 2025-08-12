import { useCallback, useEffect, useState } from 'react';
import ProfileService from '../services/ProfileService';

const profileCache = new Map();

export const useProfile = (userId) => {
  const [profile, setProfile] = useState(profileCache.get(userId) || null);
  const [loading, setLoading] = useState(!profile && !!userId);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await ProfileService.getProfileById(userId);
      setProfile(data);
      profileCache.set(userId, data);
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!profile && userId) {
      fetchProfile();
    }
  }, [userId, profile, fetchProfile]);

  const refreshProfile = useCallback(() => {
    if (userId) {
      profileCache.delete(userId);
      fetchProfile();
    }
  }, [userId, fetchProfile]);

  const clearProfile = useCallback(() => {
    if (userId) {
      profileCache.delete(userId);
      setProfile(null);
    }
  }, [userId]);

  return {
    profile,
    loading,
    error,
    refreshProfile,
    clearProfile,
    hasProfile: !!profile,
  };
};
