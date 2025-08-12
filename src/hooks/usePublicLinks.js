/**
 * usePublicLinks Hook
 * 
 * Hook for fetching public links data by username
 * @param {string} username - The username to fetch links for
 * @returns {Object} { data, loading, error, refetch }
 */

import { useCallback, useEffect, useState } from 'react';
import { LinksService } from '../services';

export const usePublicLinks = (username) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLinks = useCallback(async () => {
    if (!username) {
      setLinks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const linksData = await LinksService.getLinksByUsername(username);
      setLinks(linksData);
    } catch (err) {
      console.error('[usePublicLinks] Error fetching links:', err);
      setError(err.message || 'Failed to load links');
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Fetch links when username changes
  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Manual refresh function
  const refetch = useCallback(() => {
    fetchLinks();
  }, [fetchLinks]);

  return {
    data: links,
    loading,
    error,
    refetch,
    // Computed properties for common checks
    isEmpty: !loading && links.length === 0,
    count: links.length
  };
};
