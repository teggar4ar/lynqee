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
    const authListener = AuthService.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
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

  // Jangan render apapun sampai pemeriksaan otentikasi awal selesai.
  // Ini mencegah "flash" dari halaman yang dilindungi ke halaman login saat refresh.
  if (loadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Application...</p>
        </div>
      </div>
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