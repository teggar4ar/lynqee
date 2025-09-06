/**
 * LinksService - Service layer for link-related operations
 * 
 * This service abstracts all link-related API calls to Supabase.
 * Components should not call supabase.from('links') directly, but use these service functions.
 */

import { SUPABASE_TABLES, supabase } from './supabase.js';
import { APP_CONFIG } from '../constants/index.js';
import { SERVICE_ERROR_MESSAGES } from '../constants/validationMessages.js';

class LinksService {
  // Request timeout in milliseconds
  static REQUEST_TIMEOUT = 15000; // 15 seconds

  /**
   * Create a timeout promise that rejects after specified time
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} Promise that rejects with timeout error
   */
  static _createTimeoutPromise(timeout = this.REQUEST_TIMEOUT) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout / 1000} seconds`));
      }, timeout);
    });
  }

  /**
   * Wrap a Supabase request with timeout handling
   * @param {Promise} request - The Supabase request promise
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} Promise that resolves with data or rejects with timeout
   */
  static async _withTimeout(request, timeout = this.REQUEST_TIMEOUT) {
    return Promise.race([
      request,
      this._createTimeoutPromise(timeout)
    ]);
  }
  /**
   * Standardize response format for consistent API
   * @param {Object} data - Supabase response data
   * @param {Object} error - Supabase error object
   * @returns {Object} Standardized response
   */
  static _formatResponse(data, error) {
    if (error) {
      console.error('[LinksService] Error:', error);
      
      // Enhanced error handling with specific error types
      let errorMessage = error.message;
      let httpStatus = null;
      
      // Extract HTTP status if available
      if (error.code) {
        // Map common Supabase error codes to HTTP statuses
        switch (error.code) {
          case 'PGRST301':
            errorMessage = SERVICE_ERROR_MESSAGES.LINKS.PERMISSION_DENIED;
            httpStatus = 403;
            break;
          case 'PGRST116':
            errorMessage = SERVICE_ERROR_MESSAGES.LINKS.NOT_FOUND;
            httpStatus = 404;
            break;
          case '23505': // Unique constraint violation
            if (error.message.includes('url')) {
              errorMessage = SERVICE_ERROR_MESSAGES.LINKS.URL_DUPLICATE;
            } else if (error.message.includes('title')) {
              errorMessage = SERVICE_ERROR_MESSAGES.LINKS.TITLE_DUPLICATE;
            } else {
              errorMessage = SERVICE_ERROR_MESSAGES.LINKS.CONFLICT;
            }
            httpStatus = 409;
            break;
          case '23503': // Foreign key constraint violation
            errorMessage = SERVICE_ERROR_MESSAGES.LINKS.AUTH_REQUIRED;
            httpStatus = 400;
            break;
          case '23514': // Check constraint violation
            errorMessage = SERVICE_ERROR_MESSAGES.LINKS.INVALID_DATA;
            httpStatus = 400;
            break;
          case 'PGRST204':
            errorMessage = SERVICE_ERROR_MESSAGES.LINKS.TIMEOUT;
            httpStatus = 408;
            break;
          case '429':
          case 'RATE_LIMIT':
          case 'TOO_MANY_REQUESTS':
            errorMessage = SERVICE_ERROR_MESSAGES.LINKS.RATE_LIMIT;
            httpStatus = 429;
            break;
          default:
            // Keep original message for unknown codes
            break;
        }
      }
      
      // Handle network and timeout errors
      if (error.message && (
        error.message.includes('timeout') ||
        error.message.includes('network') ||
        error.message.includes('fetch')
      )) {
        errorMessage = SERVICE_ERROR_MESSAGES.LINKS.NETWORK;
        httpStatus = httpStatus || 0; // Network error
      }
      
      // Check for rate limiting patterns in message
      if (error.message && (
        error.message.toLowerCase().includes('rate') ||
        error.message.toLowerCase().includes('limit') ||
        error.message.toLowerCase().includes('429') ||
        error.message.toLowerCase().includes('too many')
      )) {
        httpStatus = 429;
      }
      
      // Check for link limit exceeded error
      if (error.message && error.message.includes('maximum limit')) {
        httpStatus = 403; // Forbidden - user has exceeded their quota
      }
      
      return {
        success: false,
        error: errorMessage,
        data: null,
        errorCode: error.code || null,
        httpStatus: httpStatus,
      };
    }

    return {
      success: true,
      error: null,
      data: data,
      errorCode: null,
      httpStatus: 200,
    };
  }

  /**
   * Get all links for a user by their profile ID (public access)
   * @param {string} userId - The user/profile ID
   * @returns {Promise<Object>} Standardized response with array of link objects
   */
  static async getLinksByUserId(userId) {
    try {
      const request = supabase
        .from(SUPABASE_TABLES.LINKS)
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      const { data, error } = await this._withTimeout(request);
      return this._formatResponse(data || [], error);
    } catch (error) {
      console.error('[LinksService] getLinksByUserId error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Get all links for a user by their username (public access)
   * This combines profile lookup with links fetch for public profile pages
   * @param {string} username - The username to get links for
   * @returns {Promise<Object>} Standardized response with array of link objects
   */
  static async getLinksByUsername(username) {
    try {
      // Join links with profiles to get links by username
      const request = supabase
        .from(SUPABASE_TABLES.LINKS)
        .select(`
          *,
          profiles!inner(username)
        `)
        .eq('profiles.username', username)
        .order('position', { ascending: true });

      const { data, error } = await this._withTimeout(request);
      return this._formatResponse(data || [], error);
    } catch (error) {
      console.error('[LinksService] getLinksByUsername error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Get the total count of links for a user
   * @param {string} userId - The user ID to count links for
   * @returns {Promise<Object>} Standardized response with count
   */
  static async getLinkCountByUserId(userId) {
    try {
      const request = supabase
        .from(SUPABASE_TABLES.LINKS)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count, error } = await this._withTimeout(request);
      
      if (error) {
        return this._formatResponse(null, error);
      }

      return this._formatResponse(count || 0, null);
    } catch (error) {
      console.error('[LinksService] getLinkCountByUserId error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Create a new link for the authenticated user
   * @param {Object} linkData - Link data { title, url, position }
   * @returns {Promise<Object>} Standardized response with created link object
   */
  static async createLink(linkData) {
    try {
      // Add basic validation before sending to database
      if (!linkData.title || !linkData.url || !linkData.user_id) {
        throw new Error(SERVICE_ERROR_MESSAGES.LINKS.MISSING_DATA);
      }

      // Check link count limit before creating
      const countResult = await this.getLinkCountByUserId(linkData.user_id);
      if (!countResult.success) {
        throw new Error(countResult.error || 'Failed to check link limit');
      }

      if (countResult.data >= APP_CONFIG.MAX_LINKS_PER_USER) {
        throw new Error(`You have reached the maximum limit of ${APP_CONFIG.MAX_LINKS_PER_USER} links per profile`);
      }

      // Sanitize data
      const sanitizedData = {
        ...linkData,
        title: linkData.title.trim(),
        url: linkData.url.trim(),
      };

      const request = supabase
        .from(SUPABASE_TABLES.LINKS)
        .insert([sanitizedData])
        .select()
        .single();

      const { data, error } = await this._withTimeout(request);
      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[LinksService] createLink error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Update an existing link
   * @param {string} linkId - The link ID to update
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Standardized response with updated link object
   */
  static async updateLink(linkId, updates) {
    try {
      if (!linkId) {
        throw new Error('Link ID is required for update');
      }

      // Sanitize update data
      const sanitizedUpdates = {};
      if (updates.title !== undefined) {
        sanitizedUpdates.title = updates.title.trim();
      }
      if (updates.url !== undefined) {
        sanitizedUpdates.url = updates.url.trim();
      }
      if (updates.position !== undefined) {
        sanitizedUpdates.position = updates.position;
      }

      const request = supabase
        .from(SUPABASE_TABLES.LINKS)
        .update(sanitizedUpdates)
        .eq('id', linkId)
        .select()
        .single();

      const { data, error } = await this._withTimeout(request);
      return this._formatResponse(data, error);
    } catch (error) {
      console.error('[LinksService] updateLink error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Delete a link
   * @param {string} linkId - The link ID to delete
   * @returns {Promise<Object>} Standardized response
   */
  static async deleteLink(linkId) {
    try {
      if (!linkId) {
        throw new Error('Link ID is required for deletion');
      }

      const request = supabase
        .from(SUPABASE_TABLES.LINKS)
        .delete()
        .eq('id', linkId);

      const { error } = await this._withTimeout(request);

      if (error) {
        return this._formatResponse(null, error);
      }

      return {
        success: true,
        error: null,
        data: null,
        errorCode: null,
      };
    } catch (error) {
      console.error('[LinksService] deleteLink error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }

  /**
   * Update the position order of multiple links
   * @param {Array} linkUpdates - Array of { id, position } objects
   * @returns {Promise<Object>} Standardized response
   */
  static async updateLinkPositions(linkUpdates) {
    try {
      // Update links sequentially to avoid race conditions in real-time subscriptions
      for (const { id, position } of linkUpdates) {
        const result = await this.updateLink(id, { position });
        if (!result.success) {
          throw new Error(result.error);
        }
      }

      return {
        success: true,
        error: null,
        data: null,
      };
    } catch (error) {
      console.error('[LinksService] updateLinkPositions error:', error);
      return this._formatResponse(null, { message: error.message });
    }
  }
}

export default LinksService;
