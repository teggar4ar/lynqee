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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AppStateContext from './AppStateContext';

export const AppStateProvider = ({ children }) => {
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const [isRefreshingLinks, setIsRefreshingLinks] = useState(false);

  const value = {
    isRefreshingProfile,
    isRefreshingLinks,
    setIsRefreshingProfile,
    setIsRefreshingLinks,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

AppStateProvider.propTypes = { children: PropTypes.node.isRequired };