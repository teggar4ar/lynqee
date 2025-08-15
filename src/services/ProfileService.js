/**
 * ProfileService - Service layer for profile-related operations
 * 
 * This service abstracts all profile-related API calls to Supabase.
 * Components should not call supabase.from('profiles') directly, but use these service functions.
 */

import { SUPABASE_TABLES, supabase } from './supabase.js';

class ProfileService {
  /**
   * Standardize response format for consistent API
   * @param {Object} data - Supabase response data
   * @param {Object} error - Supabase error object
   * @returns {Object} Standardized response
   */
  static _formatResponse(data, error) {
    if (error) {
      // Log error for debugging even if it's from a response object
      console.error('[ProfileService] Error:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: data,
    };
  }

  /**
   * Create a new profile for a user
   * @param {Object} profileData - Profile data to create
   * @returns {Promise<Object>} Standardized response with created profile
   */
  static async createProfile(profileData) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .insert([profileData])
        .select()
        .single();

      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[ProfileService] createProfile error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }
  /**
   * Get profile by user ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Standardized response with profile data
   */
  static async getProfileByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .select('*')
        .eq('id', userId)
        .single();

      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[ProfileService] getProfileByUserId error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Get public profile by username
   * @param {string} username - The username to search for
   * @returns {Promise<Object>} Standardized response with profile data
   */
  static async getPublicProfileByUsername(username) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .select('*')
        .eq('username', username)
        .single();

      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[ProfileService] getPublicProfileByUsername error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Check username availability
   * @param {string} username - Username to check
   * @returns {Promise<Object>} Standardized response with availability
   */
  static async checkUsernameAvailability(username) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .select('username')
        .eq('username', username)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned - username is available
        return {
          success: true,
          error: null,
          available: true,
          data: null,
        };
      }

      if (error) {
        return this._formatResponse(null, error);
      }

      // Username exists - not available
      return {
        success: true,
        error: null,
        available: false,
        data: data,
      };
    } catch (error) {
      console.error('[ProfileService] checkUsernameAvailability error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Update a profile
   * @param {string} userId - The user ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Standardized response with updated profile
   */
  static async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[ProfileService] updateProfile error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Update username
   * @param {string} userId - The user ID
   * @param {string} newUsername - New username
   * @returns {Promise<Object>} Standardized response
   */
  static async updateUsername(userId, newUsername) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .update({ username: newUsername })
        .eq('id', userId)
        .select()
        .single();

      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[ProfileService] updateUsername error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Delete profile
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Standardized response
   */
  static async deleteProfile(userId) {
    try {
      const { error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .delete()
        .eq('id', userId);

      if (error) {
        return this._formatResponse(null, error);
      }

      return {
        success: true,
        error: null,
        data: null,
      };
    } catch (error) {
      console.error('[ProfileService] deleteProfile error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Upload avatar
   * @param {string} userId - The user ID
   * @param {File} file - Avatar file
   * @returns {Promise<Object>} Standardized response
   */
  static async uploadAvatar(userId, file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (error) {
        return this._formatResponse(null, error);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return {
        success: true,
        error: null,
        avatarUrl: publicUrl,
        data: { path: data.path, url: publicUrl },
      };
    } catch (error) {
      console.error('[ProfileService] uploadAvatar error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Delete avatar
   * @param {string} filePath - Avatar file path
   * @returns {Promise<Object>} Standardized response
   */
  static async deleteAvatar(filePath) {
    try {
      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (error) {
        return this._formatResponse(null, error);
      }

      return {
        success: true,
        error: null,
        data: null,
      };
    } catch (error) {
      console.error('[ProfileService] deleteAvatar error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Update privacy setting
   * @param {string} userId - The user ID
   * @param {string} setting - Privacy setting key
   * @param {boolean} value - Privacy setting value
   * @returns {Promise<Object>} Standardized response
   */
  static async updatePrivacySetting(userId, setting, value) {
    try {
      const updates = {};
      updates[setting] = value;

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[ProfileService] updatePrivacySetting error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Update user's avatar URL (legacy method)
   * @param {string} userId - The user ID
   * @param {string} avatarUrl - New avatar URL
   * @returns {Promise<Object>} Updated profile object
   */
  static async updateAvatarUrl(userId, avatarUrl) {
    return this.updateProfile(userId, { avatar_url: avatarUrl });
  }

  /**
   * Remove user's avatar URL (set to null) (legacy method)
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Updated profile object
   */
  static async removeAvatarUrl(userId) {
    return this.updateProfile(userId, { avatar_url: null });
  }

  /**
   * Get a profile by username (legacy method - alias for getPublicProfileByUsername)
   * @param {string} username - The username to search for
   * @returns {Promise<Object>} Profile object or null
   */
  static async getProfileByUsername(username) {
    const result = await this.getPublicProfileByUsername(username);
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error);
  }

  /**
   * Get profile by ID (legacy method - alias for getProfileByUserId)
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Profile object or null
   */
  static async getProfileById(userId) {
    const result = await this.getProfileByUserId(userId);
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error);
  }

  /**
   * Check if a user has a profile
   * @param {string} userId - The user ID
   * @returns {Promise<boolean>} True if user has a profile
   */
  static async userHasProfile(userId) {
    try {
      const result = await this.getProfileByUserId(userId);
      return result.success && result.data !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a username is available (legacy method)
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} True if username is available
   */
  static async isUsernameAvailable(username) {
    const result = await this.checkUsernameAvailability(username);
    if (result.success) {
      return result.available;
    }
    throw new Error(result.error);
  }
}

export default ProfileService;
