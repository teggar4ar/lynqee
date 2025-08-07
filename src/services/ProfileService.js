/**
 * ProfileService - Service layer for profile-related operations
 * 
 * This service abstracts all profile-related API calls to Supabase.
 * Components should not call supabase.from('profiles') directly, but use these service functions.
 */

import { SUPABASE_TABLES, supabase } from './supabase.js';

class ProfileService {
  /**
   * Get a profile by username (public access)
   * @param {string} username - The username to search for
   * @returns {Promise<Object>} Profile object or null
   */
  static async getProfileByUsername(username) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .select('*')
        .eq('username', username)
        .limit(1);

      if (error) throw error;

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('[ProfileService] getProfileByUsername error:', error);
      throw new Error(`Failed to get profile: ${error.message}`);
    }
  }

  /**
   * Get the current user's profile
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Profile object or null
   */
  static async getProfileById(userId) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (error) throw error;

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('[ProfileService] getProfileById error:', error);
      throw new Error(`Failed to get profile: ${error.message}`);
    }
  }

  /**
   * Create a new profile for a user
   * @param {Object} profileData - Profile data to create
   * @returns {Promise<Object>} Created profile object
   */
  static async createProfile(profileData) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[ProfileService] createProfile error:', error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }
  }

  /**
   * Update a profile
   * @param {string} userId - The user ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated profile object
   */
  static async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .update(updates)
        .eq('id', userId)
        .select()
        .limit(1);

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('[ProfileService] updateProfile error:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  /**
   * Check if a user has a profile
   * @param {string} userId - The user ID
   * @returns {Promise<boolean>} True if user has a profile
   */
  static async userHasProfile(userId) {
    try {
      const profile = await this.getProfileById(userId);
      return profile !== null;
    } catch (error) {
      console.error('[ProfileService] userHasProfile error:', error);
      return false;
    }
  }

  /**
   * Check if a username is available
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} True if username is available
   */
  static async isUsernameAvailable(username) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .select('username')
        .eq('username', username)
        .limit(1);

      if (error) throw error;

      // If no data is returned, username is available
      return !data || data.length === 0;
    } catch (error) {
      console.error('[ProfileService] isUsernameAvailable error:', error);
      throw new Error(`Failed to check username availability: ${error.message}`);
    }
  }
}

export default ProfileService;
