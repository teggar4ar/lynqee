/**
 * LinksService - Service layer for link-related operations
 * 
 * This service abstracts all link-related API calls to Supabase.
 * Components should not call supabase.from('links') directly, but use these service functions.
 */

import { SUPABASE_TABLES, supabase } from './supabase.js';

class LinksService {
  /**
   * Get all links for a user by their profile ID (public access)
   * @param {string} userId - The user/profile ID
   * @returns {Promise<Array>} Array of link objects ordered by position
   */
  static async getLinksByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.LINKS)
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[LinksService] getLinksByUserId error:', error);
      throw new Error(`Failed to get links: ${error.message}`);
    }
  }

  /**
   * Get all links for a user by their username (public access)
   * This combines profile lookup with links fetch for public profile pages
   * @param {string} username - The username to get links for
   * @returns {Promise<Array>} Array of link objects ordered by position
   */
  static async getLinksByUsername(username) {
    try {
      // Join links with profiles to get links by username
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.LINKS)
        .select(`
          *,
          profiles!inner(username)
        `)
        .eq('profiles.username', username)
        .order('position', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[LinksService] getLinksByUsername error:', error);
      throw new Error(`Failed to get links by username: ${error.message}`);
    }
  }

  /**
   * Create a new link for the authenticated user
   * @param {Object} linkData - Link data { title, url, position }
   * @returns {Promise<Object>} Created link object
   */
  static async createLink(linkData) {
    try {
      // console.log('[LinksService] Creating link with data:', linkData);
      
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.LINKS)
        .insert([linkData])
        .select()
        .single();

      if (error) {
        console.error('[LinksService] Supabase error:', error);
        throw error;
      }

      // console.log('[LinksService] Successfully created link:', data);
      return data;
    } catch (error) {
      console.error('[LinksService] createLink error:', error);
      throw new Error(`Failed to create link: ${error.message}`);
    }
  }

  /**
   * Update an existing link
   * @param {string} linkId - The link ID to update
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated link object
   */
  static async updateLink(linkId, updates) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.LINKS)
        .update(updates)
        .eq('id', linkId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('[LinksService] updateLink error:', error);
      throw new Error(`Failed to update link: ${error.message}`);
    }
  }

  /**
   * Delete a link
   * @param {string} linkId - The link ID to delete
   * @returns {Promise<boolean>} Success status
   */
  static async deleteLink(linkId) {
    try {
      const { error } = await supabase
        .from(SUPABASE_TABLES.LINKS)
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('[LinksService] deleteLink error:', error);
      throw new Error(`Failed to delete link: ${error.message}`);
    }
  }

  /**
   * Update the position order of multiple links
   * @param {Array} linkUpdates - Array of { id, position } objects
   * @returns {Promise<boolean>} Success status
   */
  static async updateLinkPositions(linkUpdates) {
    try {
      // Use a transaction to update multiple links
      const updates = linkUpdates.map(({ id, position }) => ({
        id,
        position,
        updated_at: new Date().toISOString()
      }));

      // Update each link individually (Supabase doesn't support bulk updates easily)
      const promises = updates.map(update => 
        this.updateLink(update.id, { position: update.position })
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('[LinksService] updateLinkPositions error:', error);
      throw new Error(`Failed to update link positions: ${error.message}`);
    }
  }
}

export default LinksService;
