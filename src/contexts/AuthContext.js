/**
 * AuthContext - Global authentication state management
 * 
 * Provides authentication state and methods to all components via React Context.
 * Handles session persistence, loading states, and auth state changes.
 * 
 * Follows clean architecture principles:
 * - Centralized state management
 * - Clear API boundaries
 * - Proper error handling
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import AuthService from '../services/AuthService.js';

// Create the context
const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signIn: () => {},
  signUp: () => {},
  signInWithGoogle: () => {},
  signOut: () => {},
  resetPassword: () => {},
});

/**
 * AuthProvider component that wraps the app and provides auth state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    let unsubscribe;

    const initializeAuth = async () => {
      try {
        // Get current session
        const currentSession = await AuthService.getCurrentSession();
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
      } catch (error) {
        console.error('[AuthContext] Failed to initialize auth:', error);
      } finally {
        setLoading(false);
      }
    };

    // Setup auth state listener
    const setupAuthListener = () => {
      unsubscribe = AuthService.onAuthStateChange((event, session) => {
        console.warn('[AuthContext] Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Stop loading when we get any auth state change
        setLoading(false);
      });
    };

    initializeAuth();
    setupAuthListener();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const result = await AuthService.signInWithEmail(email, password);
      return result;
    } catch (error) {
      console.error('[AuthContext] Sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      const result = await AuthService.signUpWithEmail(email, password, metadata);
      return result;
    } catch (error) {
      console.error('[AuthContext] Sign up failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = async (redirectTo) => {
    try {
      setLoading(true);
      const result = await AuthService.signInWithGoogle(redirectTo);
      return result;
    } catch (error) {
      console.error('[AuthContext] Google sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      setLoading(true);
      await AuthService.signOut();
      // Auth state listener will handle clearing user/session
    } catch (error) {
      console.error('[AuthContext] Sign out failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password for email
   */
  const resetPassword = async (email, redirectTo) => {
    try {
      await AuthService.resetPassword(email, redirectTo);
    } catch (error) {
      console.error('[AuthContext] Password reset failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    // Helper computed properties
    isAuthenticated: !!user,
    isLoading: loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to use the Auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
