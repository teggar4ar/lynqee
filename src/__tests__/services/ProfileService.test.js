import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase client before importing ProfileService
vi.mock('../../services/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      single: vi.fn(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
  },
  SUPABASE_TABLES: {
    PROFILES: 'profiles',
    LINKS: 'links',
  },
}));

import ProfileService from '../../services/ProfileService.js';
import { supabase } from '../../services/supabase.js';

// Mock data
const mockProfile = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  username: 'testuser',
  full_name: 'Test User',
  bio: 'Test bio description',
  avatar_url: 'https://example.com/avatar.jpg',
  is_private: false,
  link_count: 3,
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
};

const mockPublicProfile = {
  username: 'testuser',
  full_name: 'Test User',
  bio: 'Test bio description',
  avatar_url: 'https://example.com/avatar.jpg',
  is_private: false,
  link_count: 3,
};

describe('ProfileService CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the mock implementation
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    };
    
    supabase.from.mockReturnValue(mockChain);
  });

  describe('CREATE Operations', () => {
    it('should create a new profile successfully', async () => {
      const mockResponse = { data: mockProfile, error: null };
      
      supabase.from().insert().select().single.mockResolvedValue(mockResponse);

      const profileData = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'newuser',
        full_name: 'New User',
        bio: 'New user bio',
      };

      const result = await ProfileService.createProfile(profileData);

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
    });

    it('should handle profile creation errors', async () => {
      const errorResponse = {
        data: null,
        error: { message: 'Username already exists', code: 'unique_violation' },
      };
      
      supabase.from().insert().select().single.mockResolvedValue(errorResponse);
      console.error = vi.fn(); // Mock console.error

      const profileData = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'existinguser',
        full_name: 'Test User',
      };

      const result = await ProfileService.createProfile(profileData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Username already exists');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle network errors during creation', async () => {
      supabase.from().insert().select().single.mockRejectedValue(new Error('Network error'));
      console.error = vi.fn();

      const profileData = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        full_name: 'Test User',
      };

      const result = await ProfileService.createProfile(profileData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('READ Operations', () => {
    it('should get profile by user ID successfully', async () => {
      const mockResponse = { data: mockProfile, error: null };
      
      supabase.from().select().eq().single.mockResolvedValue(mockResponse);

      const result = await ProfileService.getProfileByUserId('123e4567-e89b-12d3-a456-426614174000');

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
    });

    it('should get public profile by username successfully', async () => {
      const mockResponse = { data: mockPublicProfile, error: null };
      
      supabase.from().select().eq().single.mockResolvedValue(mockResponse);

      const result = await ProfileService.getPublicProfileByUsername('testuser');

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPublicProfile);
    });

    it('should handle profile not found', async () => {
      const errorResponse = {
        data: null,
        error: { message: 'No rows returned', code: 'PGRST116' },
      };
      
      supabase.from().select().eq().single.mockResolvedValue(errorResponse);

      const result = await ProfileService.getProfileByUserId('nonexistent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No rows returned');
    });

    it('should check username availability - available', async () => {
      const mockResponse = { data: null, error: { code: 'PGRST116' } }; // No rows found
      
      supabase.from().select().eq().single.mockResolvedValue(mockResponse);

      const result = await ProfileService.checkUsernameAvailability('availableuser');

      expect(result.available).toBe(true);
    });

    it('should check username availability - not available', async () => {
      const mockResponse = { data: { username: 'existinguser' }, error: null };
      
      supabase.from().select().eq().single.mockResolvedValue(mockResponse);

      const result = await ProfileService.checkUsernameAvailability('existinguser');

      expect(result.available).toBe(false);
    });
  });

  describe('UPDATE Operations', () => {
    it('should update profile successfully', async () => {
      const updatedProfile = { ...mockProfile, full_name: 'Updated Name', bio: 'Updated bio' };
      const mockResponse = { data: updatedProfile, error: null };
      
      supabase.from().update().eq().select().single.mockResolvedValue(mockResponse);

      const updateData = {
        full_name: 'Updated Name',
        bio: 'Updated bio',
      };

      const result = await ProfileService.updateProfile('123e4567-e89b-12d3-a456-426614174000', updateData);

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(result.success).toBe(true);
      expect(result.data.full_name).toBe('Updated Name');
      expect(result.data.bio).toBe('Updated bio');
    });

    it('should handle update errors', async () => {
      const errorResponse = {
        data: null,
        error: { message: 'Update failed', code: 'update_error' },
      };
      
      supabase.from().update().eq().select().single.mockResolvedValue(errorResponse);
      console.error = vi.fn();

      const updateData = { bio: 'New bio' };
      const result = await ProfileService.updateProfile('123e4567-e89b-12d3-a456-426614174000', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Update failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should update username successfully', async () => {
      const updatedProfile = { ...mockProfile, username: 'newusername' };
      const mockResponse = { data: updatedProfile, error: null };
      
      supabase.from().update().eq().select().single.mockResolvedValue(mockResponse);

      const result = await ProfileService.updateUsername('123e4567-e89b-12d3-a456-426614174000', 'newusername');

      expect(result.success).toBe(true);
      expect(result.data.username).toBe('newusername');
    });

    it('should handle username conflict during update', async () => {
      const errorResponse = {
        data: null,
        error: { message: 'Username already taken', code: 'unique_violation' },
      };
      
      supabase.from().update().eq().select().single.mockResolvedValue(errorResponse);

      const result = await ProfileService.updateUsername('123e4567-e89b-12d3-a456-426614174000', 'takenusername');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Username already taken');
    });
  });

  describe('DELETE Operations', () => {
    it('should delete profile successfully', async () => {
      const mockResponse = { data: null, error: null };
      
      supabase.from().delete().eq.mockResolvedValue(mockResponse);

      const result = await ProfileService.deleteProfile('123e4567-e89b-12d3-a456-426614174000');

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(result.success).toBe(true);
    });

    it('should handle delete errors', async () => {
      const errorResponse = {
        data: null,
        error: { message: 'Delete failed', code: 'delete_error' },
      };
      
      supabase.from().delete().eq.mockResolvedValue(errorResponse);
      console.error = vi.fn();

      const result = await ProfileService.deleteProfile('123e4567-e89b-12d3-a456-426614174000');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Delete failed');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Avatar Management', () => {
    it('should upload avatar successfully', async () => {
      const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
      const mockUploadResponse = {
        data: { path: 'avatars/123e4567-e89b-12d3-a456-426614174000/avatar.jpg' },
        error: null,
      };
      const mockUrlResponse = {
        data: { publicUrl: 'https://example.com/avatar.jpg' },
      };

      const mockStorage = {
        upload: vi.fn().mockResolvedValue(mockUploadResponse),
        getPublicUrl: vi.fn().mockReturnValue(mockUrlResponse),
      };
      
      supabase.storage.from.mockReturnValue(mockStorage);

      const result = await ProfileService.uploadAvatar('123e4567-e89b-12d3-a456-426614174000', mockFile);

      expect(supabase.storage.from).toHaveBeenCalledWith('avatars');
      expect(result.success).toBe(true);
      expect(result.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should handle avatar upload errors', async () => {
      const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
      const errorResponse = {
        data: null,
        error: { message: 'Upload failed', code: 'upload_error' },
      };

      const mockStorage = {
        upload: vi.fn().mockResolvedValue(errorResponse),
      };
      
      supabase.storage.from.mockReturnValue(mockStorage);
      console.error = vi.fn();

      const result = await ProfileService.uploadAvatar('123e4567-e89b-12d3-a456-426614174000', mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Upload failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should delete avatar successfully', async () => {
      const mockResponse = { data: null, error: null };

      const mockStorage = {
        remove: vi.fn().mockResolvedValue(mockResponse),
      };
      
      supabase.storage.from.mockReturnValue(mockStorage);

      const result = await ProfileService.deleteAvatar('avatars/123e4567-e89b-12d3-a456-426614174000/avatar.jpg');

      expect(supabase.storage.from).toHaveBeenCalledWith('avatars');
      expect(result.success).toBe(true);
    });
  });

  describe('Privacy Settings', () => {
    it('should update privacy setting successfully', async () => {
      const updatedProfile = { ...mockProfile, is_private: true };
      const mockResponse = { data: updatedProfile, error: null };
      
      supabase.from().update().eq().select().single.mockResolvedValue(mockResponse);

      const result = await ProfileService.updatePrivacySetting('123e4567-e89b-12d3-a456-426614174000', true);

      expect(result.success).toBe(true);
      expect(result.data.is_private).toBe(true);
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle malformed responses', async () => {
      supabase.from().select().eq().single.mockResolvedValue(null);

      const result = await ProfileService.getProfileByUserId('123e4567-e89b-12d3-a456-426614174000');

      expect(result.success).toBe(false);
      expect(result.error).toContain('destructure');
    });

    it('should handle concurrent operations', async () => {
      const mockResponses = [
        { data: mockProfile, error: null },
        { data: mockPublicProfile, error: null },
        { available: true },
      ];

      supabase.from().select().eq().single
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      const operations = [
        ProfileService.getProfileByUserId('user1'),
        ProfileService.getPublicProfileByUsername('user2'),
        ProfileService.checkUsernameAvailability('newuser'),
      ];

      const results = await Promise.all(operations);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[2].available).toBe(true);
    });
  });

  describe('Complex Profile Scenarios', () => {
    it('should handle complete profile lifecycle', async () => {
      // Create profile
      const createResponse = { data: mockProfile, error: null };
      supabase.from().insert().select().single.mockResolvedValueOnce(createResponse);

      const createResult = await ProfileService.createProfile({
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'lifecycleuser',
        full_name: 'Lifecycle User',
      });
      expect(createResult.success).toBe(true);

      // Update profile
      const updatedProfile = { ...mockProfile, bio: 'Updated lifecycle bio' };
      const updateResponse = { data: updatedProfile, error: null };
      supabase.from().update().eq().select().single.mockResolvedValueOnce(updateResponse);

      const updateResult = await ProfileService.updateProfile('123e4567-e89b-12d3-a456-426614174000', {
        bio: 'Updated lifecycle bio',
      });
      expect(updateResult.success).toBe(true);

      // Delete profile
      const deleteResponse = { data: null, error: null };
      supabase.from().delete().eq.mockResolvedValueOnce(deleteResponse);

      const deleteResult = await ProfileService.deleteProfile('123e4567-e89b-12d3-a456-426614174000');
      expect(deleteResult.success).toBe(true);
    });

    it('should handle batch username validation', async () => {
      const usernames = ['user1', 'user2', 'user3'];
      
      supabase.from().select().eq().single
        .mockResolvedValueOnce({ data: { username: 'user1' }, error: null }) // taken
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // available
        .mockResolvedValueOnce({ data: { username: 'user3' }, error: null }); // taken

      const results = await Promise.all(
        usernames.map(username => ProfileService.checkUsernameAvailability(username))
      );

      expect(results[0].available).toBe(false); // user1 taken
      expect(results[1].available).toBe(true);  // user2 available
      expect(results[2].available).toBe(false); // user3 taken
    });
  });
});
