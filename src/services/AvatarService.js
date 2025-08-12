/**
 * AvatarService - Avatar upload and management service
 * 
 * Handles avatar file operations with Supabase Storage.
 * Provides image optimization and secure file management.
 * 
 * Features:
 * - Upload avatars to user-specific folders
 * - Client-side image resizing for optimization
 * - Automatic file cleanup (delete old avatars)
 * - Secure file naming with user ID folders
 */

import { supabase } from './supabase.js';

class AvatarService {
  static BUCKET_NAME = 'avatars';
  static MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5MB (matches bucket limit)
  static ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  static AVATAR_SIZE = 400; // 400x400px square avatars

  /**
   * Upload avatar for a user
   * @param {string} userId - User ID
   * @param {File} file - Image file to upload
   * @returns {Promise<string>} Public URL of uploaded avatar
   */
  static async uploadAvatar(userId, file) {
    try {
      // Validate file
      this.validateFile(file);

      // Optimize image (resize to square)
      const optimizedFile = await this.optimizeImage(file);

      // Generate unique file path with timestamp for cache busting: {userId}/avatar_{timestamp}.{ext}
      const fileExt = file.name.split('.').pop().toLowerCase();
      const timestamp = Date.now();
      const fileName = `avatar_${timestamp}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Delete existing avatar if any
      await this.deleteExistingAvatar(userId);

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, optimizedFile, {
          cacheControl: '3600', // Cache for 1 hour
          upsert: false // Don't replace - we're using unique names
        });

      if (error) throw error;

      // Get public URL with cache busting parameter
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      // Add cache busting parameter to ensure fresh loads
      const avatarUrl = `${urlData.publicUrl}?t=${timestamp}`;
      
      return avatarUrl;
    } catch (error) {
      console.error('[AvatarService] uploadAvatar error:', error);
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }
  }

  /**
   * Delete user's existing avatar
   * @param {string} userId - User ID
   */
  static async deleteExistingAvatar(userId) {
    try {
      // List files in user's folder
      const { data: files } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(userId);

      if (files && files.length > 0) {
        // Delete all existing avatars (both old format 'avatar.*' and new format 'avatar_*')
        const avatarFiles = files.filter(file => 
          file.name.startsWith('avatar.') || file.name.startsWith('avatar_')
        );
        
        if (avatarFiles.length > 0) {
          const filePaths = avatarFiles.map(file => `${userId}/${file.name}`);
          const { error } = await supabase.storage
            .from(this.BUCKET_NAME)
            .remove(filePaths);

          if (error) {
            console.warn('[AvatarService] Failed to delete existing avatar:', error);
          }
        }
      }
    } catch (error) {
      console.warn('[AvatarService] deleteExistingAvatar error:', error);
      // Don't throw - this is not critical for upload flow
    }
  }

  /**
   * Delete user's avatar completely
   * @param {string} userId - User ID
   */
  static async deleteAvatar(userId) {
    try {
      await this.deleteExistingAvatar(userId);
    } catch (error) {
      console.error('[AvatarService] deleteAvatar error:', error);
      throw new Error(`Failed to delete avatar: ${error.message}`);
    }
  }

  /**
   * Get avatar URL for a user
   * @param {string} userId - User ID
   * @returns {Promise<string|null>} Avatar URL or null if not found
   */
  static async getAvatarUrl(userId) {
    try {
      const { data: files } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(userId);

      if (files && files.length > 0) {
        // Get the most recent avatar file (sorted by name which includes timestamp)
        const avatarFiles = files.filter(file => file.name.startsWith('avatar_'));
        if (avatarFiles.length > 0) {
          // Sort by filename to get the latest (highest timestamp)
          const latestAvatar = avatarFiles.sort((a, b) => b.name.localeCompare(a.name))[0];
          
          const { data: urlData } = supabase.storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(`${userId}/${latestAvatar.name}`);
          
          // Add cache busting parameter
          const timestamp = Date.now();
          return `${urlData.publicUrl}?t=${timestamp}`;
        }
      }

      return null;
    } catch (error) {
      console.error('[AvatarService] getAvatarUrl error:', error);
      return null;
    }
  }

  /**
   * Validate uploaded file
   * @param {File} file - File to validate
   */
  static validateFile(file) {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size must be less than ${Math.round(this.MAX_FILE_SIZE / 1024 / 1024)}MB`);
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed');
    }

    // Check if it's actually an image
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }
  }

  /**
   * Optimize image by resizing to square format
   * @param {File} file - Original image file
   * @returns {Promise<Blob>} Optimized image blob
   */
  static async optimizeImage(file) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas size to square
        canvas.width = this.AVATAR_SIZE;
        canvas.height = this.AVATAR_SIZE;

        // Calculate dimensions for center crop
        const minDim = Math.min(img.width, img.height);
        const scale = this.AVATAR_SIZE / minDim;
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        const offsetX = (this.AVATAR_SIZE - scaledWidth) / 2;
        const offsetY = (this.AVATAR_SIZE - scaledHeight) / 2;

        // Draw image centered and cropped
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to optimize image'));
            }
          },
          file.type,
          0.85 // 85% quality for good balance of size/quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

export default AvatarService;
