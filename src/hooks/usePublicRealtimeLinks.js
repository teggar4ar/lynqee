import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabase.js';
import LinksService from '../services/LinksService.js';
import ProfileService from '../services/ProfileService.js';

export const usePublicRealtimeLinks = (username) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const subscriptionRef = useRef(null);

  const fetchLinks = useCallback(async (userId) => {
    if (!userId) return;

    try {
      const linksData = await LinksService.getLinksByUserId(userId);
      setLinks(linksData);
    } catch (err) {
      setError(err.message || 'Failed to load links');
    }
  }, []);

  const handleLinkChange = useCallback((payload) => {
    setLinks((currentLinks) => {
      let newLinks = [...currentLinks];
      switch (payload.eventType) {
        case 'INSERT':
          newLinks.push(payload.new);
          break;
        case 'DELETE':
          newLinks = newLinks.filter((link) => link.id !== payload.old.id);
          break;
        case 'UPDATE':
          newLinks = newLinks.map((link) =>
            link.id === payload.new.id ? payload.new : link
          );
          break;
        default:
          return currentLinks;
      }
      return newLinks.sort((a, b) => (a.position || 0) - (b.position || 0));
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const setupSubscription = (userId) => {
      if (!userId) return;
      subscriptionRef.current = supabase
        .channel(`public_links_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'links',
            filter: `user_id=eq.${userId}`,
          },
          handleLinkChange
        )
        .subscribe((status) => {
          if (mounted) {
            setIsRealTimeConnected(status === 'SUBSCRIBED');
          }
        });
    };

    const getProfileAndLinks = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const profile = await ProfileService.getProfileByUsername(username);
        if (profile) {
          await fetchLinks(profile.id);
          if (mounted) {
            setupSubscription(profile.id);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile or links');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getProfileAndLinks();

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [username, fetchLinks, handleLinkChange]);

  return {
    links,
    loading,
    error,
    isRealTimeConnected,
    hasLinks: links.length > 0,
  };
};
