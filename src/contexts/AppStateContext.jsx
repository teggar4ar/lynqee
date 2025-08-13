/**
 * AppStateContext - Backward-compatible global application state management
 * 
 * REFACTORED: This context now composes ProfileContext, LinksContext, and DashboardContext
 * to maintain backward compatibility while transitioning to a more modular architecture.
 * 
 * The original functionality is preserved, but the implementation now delegates
 * to domain-specific contexts for better separation of concerns.
 * 
 * Features:
 * - Profile data caching (via ProfileContext)
 * - Links data caching (via LinksContext)
 * - Dashboard statistics (via DashboardContext)
 * - Background data refresh
 * - Optimistic updates
 * - Backward compatibility with existing components
 */

import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ProfileProvider, useProfile } from './ProfileContext.jsx';
import { LinksProvider, useLinks } from './LinksContext.jsx';
import { DashboardProvider, useDashboard } from './DashboardContext.jsx';

const AppStateContext = createContext(null);

/**
 * Internal component that provides the composed app state
 * This component has access to all the domain-specific contexts
 */
const AppStateValue = ({ children }) => {
  // Get state from domain-specific contexts
  const profileContext = useProfile();
  const linksContext = useLinks();
  const dashboardContext = useDashboard();

  // Compose the backward-compatible API
  const value = useMemo(() => ({
    // Profile data (from ProfileContext)
    profileData: profileContext.profileData,
    hasProfileData: profileContext.hasProfileData,
    isRefreshingProfile: profileContext.isRefreshingProfile,
    updateProfile: profileContext.updateProfile,
    setIsRefreshingProfile: profileContext.setIsRefreshingProfile,
    
    // Links data (from LinksContext)
    linksData: linksContext.linksData,
    hasLinksData: linksContext.hasLinksData,
    isRefreshingLinks: linksContext.isRefreshingLinks,
    updateLinks: linksContext.updateLinks,
    addLinkOptimistic: linksContext.addLinkOptimistic,
    removeLinkOptimistic: linksContext.removeLinkOptimistic,
    setIsRefreshingLinks: linksContext.setIsRefreshingLinks,
    
    // Dashboard data (from DashboardContext)
    dashboardStats: dashboardContext.dashboardStats,
    
    // Combined actions
    clearData: () => {
      profileContext.clearProfileData();
      linksContext.clearLinksData();
    },
  }), [profileContext, linksContext, dashboardContext]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

/**
 * Main AppStateProvider that sets up all the domain-specific providers
 * and the composed AppStateContext for backward compatibility
 */
export const AppStateProvider = ({ children }) => {
  return (
    <ProfileProvider>
      <LinksProvider>
        <DashboardProvider>
          <AppStateValue>
            {children}
          </AppStateValue>
        </DashboardProvider>
      </LinksProvider>
    </ProfileProvider>
  );
};

AppStateProvider.propTypes = { children: PropTypes.node.isRequired };

/**
 * Hook to access the composed app state (backward compatible)
 * @returns {Object} App state value
 * @throws {Error} If used outside AppStateProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

export default AppStateContext;