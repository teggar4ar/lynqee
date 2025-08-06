/**
 * AuthService - Service layer for all authentication operations
 * 
 * This service abstracts all authentication-related API calls to Supabase.
 * Components should not call Supabase auth directly, but use these service functions.
 * 
 * Follows clean architecture principles:
 * - Clear API boundaries
 * - Error handling abstraction
 * - Session management separation
 */

import { SUPABASE_AUTH_PROVIDERS, supabase } from './supabase.js';

class AuthService {
  /**
   * Get the current authenticated user session
   * @returns {Promise<Object>} User session object or null
   */
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('[AuthService] getCurrentSession error:', error);
      throw new Error(`Failed to get current session: ${error.message}`);
    }
  }

  /**
   * Get the current authenticated user
   * @returns {Promise<Object>} User object or null
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('[AuthService] getCurrentUser error:', error);
      throw new Error(`Failed to get current user: ${error.message}`);
    }
  }

  /**
   * Sign up with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} metadata - Additional user metadata
   * @returns {Promise<Object>} Authentication result
   */
  static async signUpWithEmail(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[AuthService] signUpWithEmail error:', error);
      throw new Error(`Failed to sign up: ${error.message}`);
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication result
   */
  static async signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[AuthService] signInWithEmail error:', error);
      throw new Error(`Failed to sign in: ${error.message}`);
    }
  }

  /**
   * Sign in with Google OAuth
   * @param {string} redirectTo - URL to redirect after successful authentication
   * @returns {Promise<Object>} OAuth URL or authentication result
   */
  static async signInWithGoogle(redirectTo = window.location.origin) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: SUPABASE_AUTH_PROVIDERS.GOOGLE,
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[AuthService] signInWithGoogle error:', error);
      throw new Error(`Failed to sign in with Google: ${error.message}`);
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
    } catch (error) {
      console.error('[AuthService] signOut error:', error);
      throw new Error(`Failed to sign out: ${error.message}`);
    }
  }

  /**
   * Reset password for a given email
   * @param {string} email - User email
   * @param {string} redirectTo - URL to redirect for password reset
   * @returns {Promise<void>}
   */
  static async resetPassword(email, redirectTo = window.location.origin) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;
    } catch (error) {
      console.error('[AuthService] resetPassword error:', error);
      throw new Error(`Failed to reset password: ${error.message}`);
    }
  }

  /**
   * Listen to authentication state changes
   * @param {Function} callback - Callback function for auth state changes
   * @returns {Function} Unsubscribe function
   */
  static onAuthStateChange(callback) {
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          callback(event, session);
        }
      );

      // Return unsubscribe function
      return () => subscription.unsubscribe();
    } catch (error) {
      console.error('[AuthService] onAuthStateChange error:', error);
      throw new Error(`Failed to setup auth state listener: ${error.message}`);
    }
  }
}

export default AuthService;
