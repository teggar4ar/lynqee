/**
 * ProfileContext - Domain-specific context for profile data management
 * 
 * Handles user profile state including:
 * - Profile data caching
 * - Background data refresh
 * - Loading states
 * 
 * Part of the state management refactoring to break down AppStateContext
 * into smaller, more maintainable domain-specific contexts.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext.jsx';

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Profile-specific state
  const [profileData, setProfileData] = useState(null);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);

  /**
   * Update profile data
   * @param {Object} profile - The profile data to store
   */
  const updateProfile = useCallback((profile) => {
    setProfileData(profile);
  }, []);

  /**
   * Clear all profile data
   */
  const clearProfileData = useCallback(() => {
    setProfileData(null);
  }, []);

  // Clear profile data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearProfileData();
    }
  }, [isAuthenticated, clearProfileData]);

  const value = {
    // Data
    profileData,
    hasProfileData: !!profileData,
    
    // Loading states
    isRefreshingProfile,
    setIsRefreshingProfile,
    
    // Actions
    updateProfile,
    clearProfileData,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

ProfileProvider.propTypes = { 
  children: PropTypes.node.isRequired 
};

/**
 * Hook to access profile context
 * @returns {Object} Profile context value
 * @throws {Error} If used outside ProfileProvider
 */
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export default ProfileContext;
