/**
 * DashboardContext - Context for dashboard-related computed state
 * 
 * Handles dashboard statistics and other computed values that depend on
 * multiple data sources. This context composes data from ProfileContext
 * and LinksContext to provide derived state.
 * 
 * Part of the state management refactoring to break down AppStateContext
 * into smaller, more maintainable domain-specific contexts.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useProfile } from './ProfileContext.jsx';
import { useLinks } from './LinksContext.jsx';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const { linksData } = useLinks();
  const { profileData } = useProfile();
  
  // Dashboard-specific computed state
  const [dashboardStats, setDashboardStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    profileViews: 0
  });

  // Auto-update stats when links data changes
  useEffect(() => {
    const newStats = { 
      totalLinks: linksData?.length || 0, 
      totalClicks: 0, // TODO: Implement click tracking
      profileViews: 0 // TODO: Implement view tracking
    };
    setDashboardStats(newStats);
  }, [linksData]);

  // Memoized derived state to prevent unnecessary re-renders
  const derivedState = useMemo(() => ({
    hasData: !!(profileData && linksData?.length > 0),
    isDataComplete: !!(profileData?.username && linksData?.length > 0),
    totalDataItems: (profileData ? 1 : 0) + (linksData?.length || 0),
  }), [profileData, linksData]);

  const value = {
    // Dashboard statistics
    dashboardStats,
    
    // Derived state
    ...derivedState,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

DashboardProvider.propTypes = { 
  children: PropTypes.node.isRequired 
};

/**
 * Hook to access dashboard context
 * @returns {Object} Dashboard context value
 * @throws {Error} If used outside DashboardProvider
 */
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardContext;
