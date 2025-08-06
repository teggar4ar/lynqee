/**
 * useAuth - Custom hook for authentication logic
 * 
 * Provides authentication state and methods to components.
 * Acts as a bridge between components and the AuthContext.
 * 
 * This hook encapsulates authentication business logic and provides
 * a clean interface for components to interact with auth state.
 */

import { useAuth as useAuthContext } from '../contexts/AuthContext.jsx';

/**
 * Custom hook that provides authentication state and methods
 * @returns {Object} Authentication state and methods
 */
export const useAuth = () => {
  const authContext = useAuthContext();

  // Additional helper methods can be added here
  const hasProfile = authContext.user?.user_metadata?.has_profile || false;
  const userEmail = authContext.user?.email;
  const userId = authContext.user?.id;

  return {
    // Core auth state
    ...authContext,
    
    // Helper computed properties
    hasProfile,
    userEmail,
    userId,
    
    // Helper methods
    requireAuth: () => {
      if (!authContext.isAuthenticated) {
        throw new Error('Authentication required');
      }
    },
    
    checkPermission: (permission) => {
      // Placeholder for future role-based permissions
      return authContext.isAuthenticated;
    },
  };
};

export default useAuth;
