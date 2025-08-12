/**
 * useAvatar - Avatar state management hook
 * 
 * Custom hook for managing avatar state with cache busting and refresh capabilities.
 * Handles avatar updates and ensures UI reflects changes immediately.
 */

import { useCallback, useEffect, useState } from 'react';
import { getCacheBustedAvatarUrl } from '../utils/imageUtils.js';

const useAvatar = (initialAvatarUrl = null) => {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync internal state with prop changes
  useEffect(() => {
    setAvatarUrl(initialAvatarUrl);
  }, [initialAvatarUrl]);

  // Get cache-busted avatar URL
  const getCacheBustedUrl = useCallback(() => {
    if (!avatarUrl) return null;
    return getCacheBustedAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  // Update avatar URL and trigger refresh
  const updateAvatarUrl = useCallback((newUrl) => {
    setAvatarUrl(newUrl);
    setRefreshKey(prev => prev + 1); // Force component re-render
  }, []);

  // Force refresh of current avatar
  const refreshAvatar = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Clear avatar
  const clearAvatar = useCallback(() => {
    setAvatarUrl(null);
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    avatarUrl: getCacheBustedUrl(),
    rawAvatarUrl: avatarUrl,
    refreshKey,
    updateAvatarUrl,
    refreshAvatar,
    clearAvatar,
    hasAvatar: !!avatarUrl
  };
};

export default useAvatar;
