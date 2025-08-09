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
  const updateLinks = useCallback((links) => {
    setLinksData(links);
    setDashboardStats({ totalLinks: links.length, totalClicks: 0, profileViews: 0 });
  }, []);
  const addLinkOptimistic = useCallback((newLink) => {
    setLinksData(current => [...current, newLink]);
    setDashboardStats(current => ({ ...current, totalLinks: current.totalLinks + 1 }));
  }, []);
  const removeLinkOptimistic = useCallback((linkId) => {
    setLinksData(current => current.filter(link => link.id !== linkId));
    setDashboardStats(current => ({ ...current, totalLinks: Math.max(0, current.totalLinks - 1) }));
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

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

export default AppStateContext;