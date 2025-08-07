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
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  // 'loading' sekarang hanya berarti "memeriksa sesi awal"
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    let unsubscribe;

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
      console.log(`[AuthContext] Auth state changed: ${_event}`, session);
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
  const signOut = () => AuthService.signOut();
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;