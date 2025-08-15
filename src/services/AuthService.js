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
   * Standardize response format for consistent API
   * @param {Object} data - Supabase response data
   * @param {Object} error - Supabase error object
   * @returns {Object} Standardized response
   */
  static _formatResponse(data, error) {
    if (error) {
      return {
        success: false,
        error: error.message,
        user: null,
        session: null,
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      user: data?.user || null,
      session: data?.session || null,
      data: data || null,
    };
  }

  /**
   * Get the current authenticated user session
   * @returns {Promise<Object>} Standardized response with session
   */
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return this._formatResponse(null, error);
      }
      
      return {
        success: true,
        error: null,
        session: session,
        user: session?.user || null,
        data: { session },
      };
    } catch (error) {
      console.error('[AuthService] getCurrentSession error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Get the current authenticated user
   * @returns {Promise<Object>} Standardized response with user
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return this._formatResponse(null, error);
      }
      
      return {
        success: true,
        error: null,
        user: user,
        session: null,
        data: { user },
      };
    } catch (error) {
      console.error('[AuthService] getCurrentUser error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Sign up with email and password (alias for signUpWithEmail)
   * @param {Object} userData - User data {email, password, full_name}
   * @returns {Promise<Object>} Standardized authentication result
   */
  static async signUp(userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { full_name: userData.full_name },
        },
      });

      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[AuthService] signUp error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Sign up with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} metadata - Additional user metadata
   * @returns {Promise<Object>} Standardized authentication result
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

      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[AuthService] signUpWithEmail error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Sign in with email and password (alias for signInWithEmail)
   * @param {Object} credentials - Login credentials {email, password}
   * @returns {Promise<Object>} Standardized authentication result
   */
  static async signIn(credentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[AuthService] signIn error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Standardized authentication result
   */
  static async signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[AuthService] signInWithEmail error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Sign in with Google OAuth
   * @param {string} redirectTo - URL to redirect after successful authentication
   * @returns {Promise<Object>} Standardized OAuth result
   */
  static async signInWithGoogle(redirectTo = window.location.origin) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: SUPABASE_AUTH_PROVIDERS.GOOGLE,
        options: {
          redirectTo,
        },
      });

      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[AuthService] signInWithGoogle error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<Object>} Standardized response
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return this._formatResponse(null, error);
      }
      
      return {
        success: true,
        error: null,
        user: null,
        session: null,
        data: null,
      };
    } catch (error) {
      console.error('[AuthService] signOut error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Reset password for a given email
   * @param {string} email - User email
   * @param {string} redirectTo - URL to redirect for password reset
   * @returns {Promise<Object>} Standardized response
   */
  static async resetPassword(email, redirectTo = `${window.location.origin}/reset-password`) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        return this._formatResponse(null, error);
      }
      
      return {
        success: true,
        error: null,
        user: null,
        session: null,
        data: { email },
      };
    } catch (error) {
      console.error('[AuthService] resetPassword error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Verify OTP token for password reset
   * @param {Object} params - OTP verification parameters
   * @returns {Promise<Object>} Standardized verification result
   */
  static async verifyOtp(params) {
    try {
      const { data, error } = await supabase.auth.verifyOtp(params);
      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[AuthService] verifyOtp error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Update user's password
   * @param {string} password - New password
   * @returns {Promise<Object>} Standardized update result
   */
  static async updatePassword(password) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[AuthService] updatePassword error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Update user profile data
   * @param {Object} updateData - User data to update
   * @returns {Promise<Object>} Standardized update result
   */
  static async updateUserProfile(updateData) {
    try {
      const { data, error } = await supabase.auth.updateUser(updateData);

      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[AuthService] updateUserProfile error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Resend verification email
   * @param {Object} resendData - Resend parameters {type, email}
   * @returns {Promise<Object>} Standardized response
   */
  static async resendVerification(resendData) {
    try {
      const { data, error } = await supabase.auth.resend(resendData);

      if (error) {
        return this._formatResponse(null, error);
      }
      
      return {
        success: true,
        error: null,
        user: null,
        session: null,
        data: data,
      };
    } catch (error) {
      console.error('[AuthService] resendVerification error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Listen to authentication state changes
   * @param {Function} callback - Callback function for auth state changes
   * @returns {Object} Subscription object with unsubscribe function
   */
  static onAuthStateChange(callback) {
    try {
      const subscription = supabase.auth.onAuthStateChange(callback);
      return {
        unsubscribe: subscription.data.subscription.unsubscribe,
        subscription: subscription.data.subscription,
      };
    } catch (error) {
      console.error('[AuthService] onAuthStateChange error:', error);
      return { unsubscribe: () => {} };
    }
  }
}

export default AuthService;
