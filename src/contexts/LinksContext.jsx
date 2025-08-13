/**
 * LinksContext - Domain-specific context for links data management
 * 
 * Handles user links state including:
 * - Links data caching
 * - Background data refresh
 * - Optimistic updates
 * - Loading states
 * 
 * Part of the state management refactoring to break down AppStateContext
 * into smaller, more maintainable domain-specific contexts.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext.jsx';

const LinksContext = createContext(null);

export const LinksProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Links-specific state
  const [linksData, setLinksData] = useState([]);
  const [isRefreshingLinks, setIsRefreshingLinks] = useState(false);

  /**
   * Update links data with support for functional updates
   * @param {Array|Function} linksOrUpdater - Array of links or updater function
   */
  const updateLinks = useCallback((linksOrUpdater) => {
    // Handle functional updates
    if (typeof linksOrUpdater === 'function') {
      setLinksData(currentLinks => {
        const newLinks = linksOrUpdater(currentLinks);
        
        // Ensure the result is an array
        if (!Array.isArray(newLinks)) {
          console.error('[LinksContext] updateLinks functional update returned non-array:', typeof newLinks, newLinks);
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
      console.error('[LinksContext] updateLinks called with non-array:', typeof links, links);
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

  /**
   * Add a link optimistically (for immediate UI feedback)
   * @param {Object} newLink - The link to add
   */
  const addLinkOptimistic = useCallback((newLink) => {
    setLinksData(current => [...current, newLink]);
  }, []);

  /**
   * Remove a link optimistically (for immediate UI feedback)
   * @param {string} linkId - The ID of the link to remove
   */
  const removeLinkOptimistic = useCallback((linkId) => {
    setLinksData(current => current.filter(link => link.id !== linkId));
  }, []);

  /**
   * Clear all links data
   */
  const clearLinksData = useCallback(() => {
    setLinksData([]);
  }, []);

  // Clear links data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearLinksData();
    }
  }, [isAuthenticated, clearLinksData]);

  const value = {
    // Data
    linksData,
    hasLinksData: linksData.length > 0,
    
    // Loading states
    isRefreshingLinks,
    setIsRefreshingLinks,
    
    // Actions
    updateLinks,
    addLinkOptimistic,
    removeLinkOptimistic,
    clearLinksData,
  };

  return (
    <LinksContext.Provider value={value}>
      {children}
    </LinksContext.Provider>
  );
};

LinksProvider.propTypes = { 
  children: PropTypes.node.isRequired 
};

/**
 * Hook to access links context
 * @returns {Object} Links context value
 * @throws {Error} If used outside LinksProvider
 */
export const useLinks = () => {
  const context = useContext(LinksContext);
  if (context === undefined) {
    throw new Error('useLinks must be used within a LinksProvider');
  }
  return context;
};

export default LinksContext;
