/**
 * LinksService CRUD Tests
 * 
 * Comprehensive test suite for all link-related CRUD operations
 * Following the testing patterns established in the project
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the supabase module before importing the service
vi.mock('../../services/supabase.js', () => {
  const mockSupabaseClient = {
    from: vi.fn(),
  };
  
  return {
    supabase: mockSupabaseClient,
    SUPABASE_TABLES: {
      LINKS: 'links',
      PROFILES: 'profiles',
    },
  };
});

import LinksService from '../../services/LinksService.js';
import { mockLinks, mockUser } from '../mocks/testUtils.jsx';
import { supabase } from '../../services/supabase.js';

describe('LinksService CRUD Operations', () => {
  let consoleErrorSpy;
  
  beforeEach(() => {
    // Reset all mocks before each test
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('CREATE Operations', () => {
    it('should create a new link successfully', async () => {
      const newLinkData = {
        title: 'New Test Link',
        url: 'https://newtest.com',
        user_id: mockUser.id,
        position: 1,
      };

      const expectedCreatedLink = {
        id: 'new-link-id',
        ...newLinkData,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      // Mock Supabase chain for create operation
      const mockSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: expectedCreatedLink,
          error: null,
        }),
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      supabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const result = await LinksService.createLink(newLinkData);

      expect(supabase.from).toHaveBeenCalledWith('links');
      expect(mockInsert).toHaveBeenCalledWith([newLinkData]);
      expect(mockSelect).toHaveBeenCalled();
      expect(result).toEqual(expectedCreatedLink);
    });

    it('should handle create link errors', async () => {
      const newLinkData = {
        title: 'Failed Link',
        url: 'https://fail.com',
        user_id: mockUser.id,
        position: 1,
      };

      const mockError = new Error('Database connection failed');

      const mockSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockRejectedValue(mockError),
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      supabase.from.mockReturnValue({
        insert: mockInsert,
      });

      await expect(LinksService.createLink(newLinkData)).rejects.toThrow(
        'Failed to create link: Database connection failed'
      );
    });

    it('should create link with correct data structure', async () => {
      const linkData = {
        title: 'Valid Link',
        url: 'https://valid.com',
        user_id: 'user-123',
        position: 3,
      };

      const mockChain = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'link-123', ...linkData },
              error: null,
            }),
          }),
        }),
      };

      supabase.from.mockReturnValue(mockChain);

      await LinksService.createLink(linkData);

      expect(mockChain.insert).toHaveBeenCalledWith([linkData]);
    });
  });

  describe('READ Operations', () => {
    it('should get links by user ID successfully', async () => {
      const userId = mockUser.id;

      const mockOrder = vi.fn().mockResolvedValue({
        data: mockLinks,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await LinksService.getLinksByUserId(userId);

      expect(supabase.from).toHaveBeenCalledWith('links');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', userId);
      expect(mockOrder).toHaveBeenCalledWith('position', { ascending: true });
      expect(result).toEqual(mockLinks);
    });

    it('should return empty array when no links found', async () => {
      const userId = 'user-with-no-links';

      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await LinksService.getLinksByUserId(userId);

      expect(result).toEqual([]);
    });

    it('should get links by username successfully', async () => {
      const username = 'testuser';

      const mockOrder = vi.fn().mockResolvedValue({
        data: mockLinks,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await LinksService.getLinksByUsername(username);

      expect(supabase.from).toHaveBeenCalledWith('links');
      expect(mockSelect).toHaveBeenCalledWith(`
          *,
          profiles!inner(username)
        `);
      expect(mockEq).toHaveBeenCalledWith('profiles.username', username);
      expect(result).toEqual(mockLinks);
    });

    it('should handle read operation errors', async () => {
      const userId = mockUser.id;
      const mockError = new Error('Network error');

      const mockOrder = vi.fn().mockRejectedValue(mockError);

      const mockEq = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
      });

      await expect(LinksService.getLinksByUserId(userId)).rejects.toThrow(
        'Failed to get links: Network error'
      );
    });
  });

  describe('UPDATE Operations', () => {
    it('should update a link successfully', async () => {
      const linkId = 'link-1';
      const updates = {
        title: 'Updated Title',
        url: 'https://updated.com',
      };

      const updatedLink = {
        id: linkId,
        ...updates,
        user_id: mockUser.id,
        position: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: updatedLink,
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      supabase.from.mockReturnValue({
        update: mockUpdate,
      });

      const result = await LinksService.updateLink(linkId, updates);

      expect(supabase.from).toHaveBeenCalledWith('links');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', linkId);
      expect(result).toEqual(updatedLink);
    });

    it('should handle update errors', async () => {
      const linkId = 'link-1';
      const updates = { title: 'Failed Update' };
      const mockError = new Error('Update failed');

      const mockSingle = vi.fn().mockRejectedValue(mockError);

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      supabase.from.mockReturnValue({
        update: mockUpdate,
      });

      await expect(LinksService.updateLink(linkId, updates)).rejects.toThrow(
        'Failed to update link: Update failed'
      );
    });

    it('should update link positions successfully', async () => {
      const linkUpdates = [
        { id: 'link-1', position: 2 },
        { id: 'link-2', position: 1 },
      ];

      // Mock individual update calls
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'link-1', position: 2 },
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      supabase.from.mockReturnValue({
        update: mockUpdate,
      });

      const result = await LinksService.updateLinkPositions(linkUpdates);

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });
  });

  describe('DELETE Operations', () => {
    it('should delete a link successfully', async () => {
      const linkId = 'link-to-delete';

      const mockEq = vi.fn().mockResolvedValue({
        error: null,
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      supabase.from.mockReturnValue({
        delete: mockDelete,
      });

      const result = await LinksService.deleteLink(linkId);

      expect(supabase.from).toHaveBeenCalledWith('links');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', linkId);
      expect(result).toBe(true);
    });

    it('should handle delete errors', async () => {
      const linkId = 'link-to-delete';
      const mockError = new Error('Delete failed');

      const mockEq = vi.fn().mockRejectedValue(mockError);

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      supabase.from.mockReturnValue({
        delete: mockDelete,
      });

      await expect(LinksService.deleteLink(linkId)).rejects.toThrow(
        'Failed to delete link: Delete failed'
      );
    });

    it('should not affect other links when deleting', async () => {
      const linkId = 'specific-link-id';

      const mockEq = vi.fn().mockResolvedValue({
        error: null,
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      supabase.from.mockReturnValue({
        delete: mockDelete,
      });

      await LinksService.deleteLink(linkId);

      // Verify it only targets the specific link
      expect(mockEq).toHaveBeenCalledWith('id', linkId);
      expect(mockEq).toHaveBeenCalledTimes(1);
    });
  });

  describe('Complex CRUD Scenarios', () => {
    it('should handle multiple operations in sequence', async () => {
      // Create a link
      const newLink = {
        title: 'Test Link',
        url: 'https://test.com',
        user_id: mockUser.id,
        position: 1,
      };

      const createdLink = { id: 'new-id', ...newLink };

      // Mock create operation
      supabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: createdLink,
              error: null,
            }),
          }),
        }),
      });

      const created = await LinksService.createLink(newLink);
      expect(created).toEqual(createdLink);

      // Update the link
      const updates = { title: 'Updated Test Link' };
      const updatedLink = { ...createdLink, ...updates };

      supabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: updatedLink,
                error: null,
              }),
            }),
          }),
        }),
      });

      const updated = await LinksService.updateLink(created.id, updates);
      expect(updated).toEqual(updatedLink);

      // Delete the link
      supabase.from.mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      const deleted = await LinksService.deleteLink(created.id);
      expect(deleted).toBe(true);
    });

    it('should handle bulk operations correctly', async () => {
      const linkUpdates = [
        { id: 'link-1', position: 3 },
        { id: 'link-2', position: 1 },
        { id: 'link-3', position: 2 },
      ];

      // Mock successful updates for all links
      supabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'mock-id', position: 1 },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await LinksService.updateLinkPositions(linkUpdates);

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed success/failure scenarios', async () => {
      const linkUpdates = [
        { id: 'link-success', position: 1 },
        { id: 'link-fail', position: 2 },
      ];

      // First call succeeds, second fails
      supabase.from
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'link-success', position: 1 },
                  error: null,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Update failed'),
                }),
              }),
            }),
          }),
        });

      await expect(LinksService.updateLinkPositions(linkUpdates)).rejects.toThrow();
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle empty data responses gracefully', async () => {
      const userId = 'user-with-no-data';

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      const result = await LinksService.getLinksByUserId(userId);
      expect(result).toEqual([]);
    });

    it('should handle undefined data responses gracefully', async () => {
      const userId = 'user-undefined-data';

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: undefined,
              error: null,
            }),
          }),
        }),
      });

      const result = await LinksService.getLinksByUserId(userId);
      expect(result).toEqual([]);
    });

    it('should preserve data integrity during updates', async () => {
      const linkId = 'preserve-test';
      const originalData = {
        id: linkId,
        title: 'Original',
        url: 'https://original.com',
        user_id: 'user-123',
        position: 1,
        created_at: '2024-01-01T00:00:00.000Z',
      };

      const updates = { title: 'Updated' };
      const expectedResult = { ...originalData, ...updates };

      supabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: expectedResult,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await LinksService.updateLink(linkId, updates);

      expect(result).toEqual(expectedResult);
      expect(result.id).toBe(originalData.id);
      expect(result.user_id).toBe(originalData.user_id);
      expect(result.created_at).toBe(originalData.created_at);
    });
  });
});
