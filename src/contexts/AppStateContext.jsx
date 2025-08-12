/**
 * AppStateContext - Global application state management
 * 
 * Provides persistent data across route navigation to prevent unnecessary loading screens.
 * Simple and clean implementation without over-engineering.
 * 
 * Features:
 * - Profile data caching
 * - Links data caching
 * - Background data refresh
 * - Optimistic updates
 */

// contexts/AppStateContext.jsx

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext.jsx';

const AppStateContext = createContext(null);

export const AppStateProvider = ({ children }) => {
  // =================================================================
  // BARIS INI ADALAH KUNCINYA. PASTIKAN IA ADA DI SINI.
  const { isAuthenticated } = useAuth();
  // =================================================================

  // State-state Anda
  const [profileData, setProfileData] = useState(null);
  const [linksData, setLinksData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({ totalLinks: 0, totalClicks: 0, profileViews: 0 });
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const [isRefreshingLinks, setIsRefreshingLinks] = useState(false);

  // Auto-update stats when links data changes
  useEffect(() => {
    const newStats = { 
      totalLinks: linksData?.length || 0, 
      totalClicks: 0, 
      profileViews: 0 
    };
    setDashboardStats(newStats);
  }, [linksData]);

  const clearData = useCallback(() => {
    setProfileData(null);
    setLinksData([]);
    setDashboardStats({ totalLinks: 0, totalClicks: 0, profileViews: 0 });
  }, []);

  // useEffect yang bergantung pada isAuthenticated
  useEffect(() => {
    // Jika pengguna tidak lagi terotentikasi, bersihkan semua data.
    if (!isAuthenticated) {
      clearData();
    }
  }, [isAuthenticated, clearData]);

  // Sisa kode di bawah ini tidak ada perubahan sama sekali
  const updateProfile = useCallback((profile) => { setProfileData(profile); }, []);
  const updateLinks = useCallback((linksOrUpdater) => {
    // Handle functional updates
    if (typeof linksOrUpdater === 'function') {
      setLinksData(currentLinks => {
        const newLinks = linksOrUpdater(currentLinks);
        
        // Ensure the result is an array
        if (!Array.isArray(newLinks)) {
          console.error('[AppStateContext] updateLinks functional update returned non-array:', typeof newLinks, newLinks);
          return currentLinks; // Keep current state if invalid
        }
        
        // Ensure no duplicates by ID (safety check)
        const uniqueLinks = newLinks.reduce((acc, link) => {
          if (!acc.find(existing => existing.id === link.id)) {
            acc.push(link);
          }
          return acc;
        }, []);
        
        return uniqueLinks;
      });
      return;
    }
    
    // Handle direct array updates
    const links = linksOrUpdater;
    
    // Ensure links is always an array
    if (!Array.isArray(links)) {
      console.error('[AppStateContext] updateLinks called with non-array:', typeof links, links);
      return;
    }
    
    // Ensure no duplicates by ID (safety check)
    const uniqueLinks = links.reduce((acc, link) => {
      if (!acc.find(existing => existing.id === link.id)) {
        acc.push(link);
      }
      return acc;
    }, []);
    
    setLinksData(uniqueLinks);
  }, []);
  const addLinkOptimistic = useCallback((newLink) => {
    setLinksData(current => [...current, newLink]);
  }, []);
  const removeLinkOptimistic = useCallback((linkId) => {
    setLinksData(current => current.filter(link => link.id !== linkId));
  }, []);

  const value = {
    profileData, linksData, dashboardStats,
    isRefreshingProfile, isRefreshingLinks,
    updateProfile, updateLinks, addLinkOptimistic, removeLinkOptimistic, clearData,
    setIsRefreshingProfile, setIsRefreshingLinks,
    hasProfileData: !!profileData,
    hasLinksData: linksData.length > 0,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

AppStateProvider.propTypes = { children: PropTypes.node.isRequired };

// eslint-disable-next-line react-refresh/only-export-components
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

export default AppStateContext;