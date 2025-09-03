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
import { useInactivityTimeout } from '../hooks/useInactivityTimeout.js';
import { SESSION_CONFIG } from '../constants/session.js';
import { InitialLoading } from '../components/common/ModernLoading.jsx';

// Create the context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  // 'loading' sekarang hanya berarti "memeriksa sesi awal"
  const [loadingInitial, setLoadingInitial] = useState(true);

  /**
   * Handle automatic logout due to inactivity
   */
  const handleInactivityLogout = async () => {
    if (!user) return; // Already logged out
    
    try {
      // Broadcast manual logout to other tabs before signing out
      try {
        localStorage.setItem(SESSION_CONFIG.SESSION_EVENT_KEY, JSON.stringify({
          type: 'manual_logout',
          timestamp: Date.now()
        }));
      } catch (error) {
        // Silently handle localStorage errors
        console.warn('[AuthContext] Failed to broadcast logout:', error);
      }

      // Sign out the user
      await AuthService.signOut();
      
      // The auth state change listener will handle updating the UI state
    } catch (error) {
      console.error('[AuthContext] Failed to sign out due to inactivity:', error);
      
      // Force local state update if signOut fails
      setUser(null);
      setSession(null);
    }
  };

  /**
   * Set up inactivity timeout monitoring
   * Only enabled when user is authenticated
   */
  const inactivityTimeout = useInactivityTimeout({
    onInactivityTimeout: handleInactivityLogout,
    timeoutMs: SESSION_CONFIG.INACTIVITY_TIMEOUT,
    isEnabled: !!user, // Only track when user is logged in
    onActivity: () => {
      // Optional: Add activity logging here for analytics/debugging
      // console.log('[AuthContext] User activity detected');
    },
  });

  useEffect(() => {
    // Cek sesi yang ada saat aplikasi pertama kali dimuat
    // Supabase client secara otomatis menangani sesi dari URL jika dikonfigurasi.
    AuthService.getCurrentSession()
      .then(currentSession => {
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
      })
      .catch(error => console.error('[AuthContext] Failed to get initial session:', error))
      .finally(() => {
        // Tandai bahwa pemeriksaan awal selesai
        setLoadingInitial(false);
      });

    // Pasang listener dan simpan subscription object-nya
    const authListener = AuthService.onAuthStateChange((event, session) => {
      // Prevent unnecessary state updates if the session hasn't actually changed
      setSession(prevSession => {
        // Compare session tokens to avoid unnecessary updates
        if (prevSession?.access_token === session?.access_token) {
          return prevSession;
        }
        return session;
      });
      
      setUser(prevUser => {
        const newUser = session?.user ?? null;
        // Compare user IDs to avoid unnecessary updates
        if (prevUser?.id === newUser?.id) {
          return prevUser;
        }
        return newUser;
      });
    });
    
    // Cleanup subscription on unmount
    return () => {
      // AMBIL SUBSCRIPTION DARI LISTENER DAN UNSUBSCRIBE
      // Ini adalah cara yang paling aman.
      // `authListener.data.subscription.unsubscribe()`
      authListener?.data?.subscription?.unsubscribe();
    };
  }, []);
  
  // Fungsi-fungsi ini tidak perlu lagi mengatur 'loading'
  // karena listener onAuthStateChange akan menangani pembaruan state secara reaktif.
  const signIn = (email, password) => AuthService.signInWithEmail(email, password);
  const signUp = (email, password, metadata) => AuthService.signUpWithEmail(email, password, metadata);
  const signInWithGoogle = (redirectTo) => AuthService.signInWithGoogle(redirectTo);
  
  const signOut = async () => {
    try {
      // Broadcast manual logout to other tabs before signing out
      try {
        localStorage.setItem(SESSION_CONFIG.SESSION_EVENT_KEY, JSON.stringify({
          type: 'manual_logout',
          timestamp: Date.now()
        }));
      } catch (error) {
        // Silently handle localStorage errors
        console.warn('[AuthContext] Failed to broadcast logout:', error);
      }

      return await AuthService.signOut();
    } catch (error) {
      console.error('[AuthContext] Sign out error:', error);
      throw error;
    }
  };
  
  const resetPassword = (email, redirectTo) => AuthService.resetPassword(email, redirectTo);

  const value = {
    user,
    session,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
    // Gunakan loadingInitial untuk state loading awal aplikasi
    isLoading: loadingInitial,
    
    // Expose inactivity timeout state for potential future UI features
    inactivityTimeout: {
      isActive: inactivityTimeout.isActive,
      timeRemaining: inactivityTimeout.timeRemaining,
      resetTimer: inactivityTimeout.resetTimer,
      // Future extensibility: add methods for session warnings, extensions, etc.
    },
  };

  // Don't render the loading screen immediately on app start
  // This prevents the flash when the user is already authenticated
  // Only show loading after a brief delay to allow for fast auth resolution
  const [showLoading, setShowLoading] = useState(false);
  
  useEffect(() => {
    if (loadingInitial) {
      // Add a small delay before showing loading to prevent flash
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [loadingInitial]);

  // Only show loading screen if we've been loading for a while
  // This prevents the flash for users who are already authenticated
  if (loadingInitial && showLoading) {
    return (
      <InitialLoading message="Initializing Application..." />
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;