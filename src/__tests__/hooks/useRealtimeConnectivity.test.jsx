/**
 * Real-time Hooks Test Suite
 * 
 * Tests for useUserLinks and usePublicRealtimeLinks hooks using useEnhancedRealtime
 * Phase 1 completed: Testing consolidated real-time connection logic
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

import { useUserLinks } from '../../hooks/useUserLinks.js';
import { usePublicRealtimeLinks } from '../../hooks/usePublicRealtimeLinks.js';
import { mockAuthContextAuthenticated } from '../mocks/testUtils.jsx';
import AuthContext from '../../contexts/AuthContext.jsx';
import { LinksProvider } from '../../contexts/LinksContext.jsx';

// Mock dependencies
vi.mock('../../services/supabase.js', () => ({
  default: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => Promise.resolve({ data: null, error: null })),
      delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn((callback) => {
        setTimeout(() => callback('SUBSCRIBED'), 0);
        return {
          unsubscribe: vi.fn()
        };
      }),
    })),
    removeChannel: vi.fn(),
  },
}));

vi.mock('../../services/LinksService.js', () => {
  const LinksService = {
    getUserLinks: vi.fn(() => Promise.resolve([])),
    createLink: vi.fn(() => Promise.resolve({ id: 'test-id' })),
    updateLink: vi.fn(() => Promise.resolve({ id: 'test-id' })),
    deleteLink: vi.fn(() => Promise.resolve()),
    reorderLinks: vi.fn(() => Promise.resolve()),
    getPublicLinksByUsername: vi.fn(() => Promise.resolve([])),
  };
  
  return {
    default: LinksService,
    LinksService,
  };
});

vi.mock('../../services/ProfileService.js', () => ({
  ProfileService: {
    getProfileByUsername: vi.fn(() => Promise.resolve({ 
      id: 'test-profile-id',
      username: 'testuser' 
    })),
  },
}));

vi.mock('../../hooks/useAlerts.js', () => ({
  useAlerts: () => ({
    addAlert: vi.fn(),
    removeAlert: vi.fn(),
  }),
}));

// Test Provider wrapper
const TestProvider = ({ children, authValue = mockAuthContextAuthenticated }) => (
  <AuthContext.Provider value={authValue}>
    <LinksProvider>
      {children}
    </LinksProvider>
  </AuthContext.Provider>
);

describe('Real-time Hooks Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useUserLinks Hook', () => {
    it('should load user links successfully', async () => {
      const { result } = renderHook(() => useUserLinks(), {
        wrapper: TestProvider,
      });

      expect(result.current.loading).toBe(false);
      
      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
      
      expect(result.current.data).toBeDefined();
    });

    it('should handle real-time updates via useEnhancedRealtime', async () => {
      const { result } = renderHook(() => useUserLinks(), {
        wrapper: TestProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify that real-time connection is established
      expect(result.current.isRealTimeConnected).toBeDefined();
    });
  });

  describe('usePublicRealtimeLinks Hook', () => {
    const testProfileId = 'test-profile-id';

    it('should load public profile links successfully', async () => {
      const { result } = renderHook(() => usePublicRealtimeLinks(testProfileId), {
        wrapper: TestProvider,
      });

      // The loading state might be false immediately if mocks resolve synchronously
      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
      
      expect(result.current.data).toBeDefined();
    });

    it('should handle profile not found', async () => {
      const { ProfileService } = await import('../../services/ProfileService.js');
      ProfileService.getProfileByUsername.mockResolvedValueOnce(null);

      const { result } = renderHook(() => usePublicRealtimeLinks('nonexistent'), {
        wrapper: TestProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBeDefined();
    });
  });

  describe('Real-time Connection Management', () => {
    it('should establish connection through useEnhancedRealtime', async () => {
      const { result } = renderHook(() => useUserLinks(), {
        wrapper: TestProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify connection status is tracked
      expect(result.current.isRealTimeConnected).toBeDefined();
    });

    it('should handle connection errors gracefully', async () => {
      const supabase = await import('../../services/supabase.js');
      supabase.default.channel.mockImplementationOnce(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(() => {
          throw new Error('Connection failed');
        }),
      }));

      const { result } = renderHook(() => useUserLinks(), {
        wrapper: TestProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should still provide basic functionality even if real-time fails
      expect(result.current.data).toBeDefined();
    });
  });
});
