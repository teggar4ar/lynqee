/**
 * Test file: Alert System Integration for Real-time Connectivity
 * 
 * Tests the integration between real-time connectivity features and the alert system,
 * verifying that appropriate user notifications are shown for connection events.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { TestProviders } from '../mocks/testUtils.jsx';
import { useUserLinks } from '../../hooks/useUserLinks';
import { usePublicRealtimeLinks } from '../../hooks/usePublicRealtimeLinks';
import * as ConnectionManager from '../../utils/connectionManager';

// Mock the alert system
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
const mockShowWarning = vi.fn();
const mockShowInfo = vi.fn();
const mockHideAlert = vi.fn();

vi.mock('../../hooks/useAlerts', () => ({
  useAlerts: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
    showWarning: mockShowWarning,
    showInfo: mockShowInfo,
    hideAlert: mockHideAlert,
  }),
}));

// Mock ConnectionManager with proper instance methods
const mockGetStatistics = vi.fn();
const mockDestroy = vi.fn();
const mockReset = vi.fn();

vi.mock('../../utils/connectionManager', () => ({
  CONNECTION_QUALITY: {
    EXCELLENT: 'excellent',
    GOOD: 'good',
    FAIR: 'fair',
    POOR: 'poor',
    UNKNOWN: 'unknown'
  },
  ConnectionManager: vi.fn().mockImplementation(function() {
    return {
      updateConnectionQuality: vi.fn(),
      scheduleEnhancedReconnection: vi.fn(),
      getQuality: vi.fn().mockReturnValue('good'),
      reset: mockReset,
      destroy: mockDestroy,
      getStatistics: mockGetStatistics.mockReturnValue({
        quality: 'good',
        environment: {
          isMobile: false,
          isBackground: false,
          networkType: 'wifi'
        },
        state: 'connected',
        metrics: {}
      }),
    };
  }),
  defaultConnectionManager: {
    updateConnectionQuality: vi.fn(),
    scheduleEnhancedReconnection: vi.fn(),
    getQuality: vi.fn().mockReturnValue('good'),
    reset: vi.fn(),
    destroy: vi.fn(),
  },
  // Add named exports for the test's direct function calls
  updateConnectionQuality: vi.fn().mockReturnValue('good'),
  scheduleEnhancedReconnection: vi.fn().mockResolvedValue(),
}));

// Mock Supabase
vi.mock('../../services/supabase', () => {
  // Create mock functions inside the factory to avoid hoisting issues
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockSubscribe = vi.fn();
  const mockUnsubscribe = vi.fn();
  const mockChannel = vi.fn();

  const createMockSupabaseClient = (overrides = {}) => ({
    from: mockFrom.mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue(Promise.resolve({ data: [], error: null })),
        }),
      }),
    }),
    channel: mockChannel.mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null,
      }),
    },
    ...overrides,
  });

  return {
    supabase: createMockSupabaseClient(),
    mockChannel,
    mockFrom,
    mockSelect,
    mockSubscribe,
    mockUnsubscribe,
  };
});

// Mock LinksService
vi.mock('../../services/LinksService', () => ({
  default: {
    getUserLinks: vi.fn().mockResolvedValue([]),
    getPublicLinks: vi.fn().mockResolvedValue([]),
    getPublicLinksByUsername: vi.fn().mockResolvedValue([]),
  },
}));

// Import the mocked module to access mock functions
import * as SupabaseMocks from '../../services/supabase';

// Test component that uses useUserLinks
const UserLinksTestComponent = () => {
  const { links, isLoading, error, isRealTimeConnected } = useUserLinks();
  
  return (
    <div>
      <div data-testid="links-count">{(links || []).length}</div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="connection-status">{isRealTimeConnected ? 'connected' : 'disconnected'}</div>
    </div>
  );
};

// Test component that uses usePublicRealtimeLinks
const PublicLinksTestComponent = ({ username }) => {
  const { links, isLoading, error, isRealTimeConnected } = usePublicRealtimeLinks(username);
  
  return (
    <div>
      <div data-testid="public-links-count">{(links || []).length}</div>
      <div data-testid="public-loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="public-error">{error || 'no-error'}</div>
      <div data-testid="public-connection-status">{isRealTimeConnected ? 'connected' : 'disconnected'}</div>
    </div>
  );
};

describe.skip('Alert System Integration - Real-time Connectivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset mock implementations with vi.mocked
    vi.mocked(ConnectionManager.updateConnectionQuality).mockReturnValue('good');
    vi.mocked(ConnectionManager.scheduleEnhancedReconnection).mockResolvedValue();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Connection Quality Alerts', () => {
    it('shows warning alert for poor connection quality on mobile', async () => {
      // Mock poor connection quality on mobile device
      mockGetStatistics.mockReturnValue({
        quality: 'poor',
        environment: {
          isMobile: true,
          isBackground: false,
          networkType: 'cellular'
        },
        state: 'connected',
        metrics: {}
      });
      
      render(
        <TestProviders>
          <UserLinksTestComponent />
        </TestProviders>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Wait for the useEnhancedRealtime hook to process connection quality
      await waitFor(() => {
        expect(mockShowWarning).toHaveBeenCalledWith({
          title: 'Connection Quality Poor',
          message: 'Updates may be delayed. Consider switching to a stronger network.',
          duration: 4000,
          position: 'top-center'
        });
      }, { timeout: 3000 });
    });

    it('shows info alert for mobile connection switching', async () => {
      // Mock mobile connection
      Object.defineProperty(navigator, 'connection', {
        writable: true,
        value: {
          type: 'cellular',
          effectiveType: '3g',
        },
      });

      render(
        <TestProviders>
          <UserLinksTestComponent />
        </TestProviders>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Simulate connection quality update triggering mobile optimization
      act(() => {
        vi.mocked(ConnectionManager.updateConnectionQuality).mockReturnValue('poor');
      });

      // Trigger a subscription event to activate connection quality check
      const subscribeCallback = SupabaseMocks.SupabaseMocks.mockChannel().on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )?.[2];

      if (subscribeCallback) {
        act(() => {
          subscribeCallback({
            eventType: 'UPDATE',
            new: { id: 1, title: 'Updated Link' },
          });
        });
      }

      await waitFor(() => {
        expect(mockShowInfo).toHaveBeenCalledWith({
          title: 'Mobile Connection Optimized',
          message: 'Real-time updates have been optimized for your mobile connection.',
        });
      });
    });

    it('shows success alert when connection is restored', async () => {
      // Start with poor connection
      vi.mocked(ConnectionManager.updateConnectionQuality).mockReturnValue('poor');
      
      render(
        <TestProviders>
          <UserLinksTestComponent />
        </TestProviders>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Simulate connection improvement
      act(() => {
        vi.mocked(ConnectionManager.updateConnectionQuality).mockReturnValue('good');
      });

      // Trigger reconnection success
      act(() => {
        vi.mocked(ConnectionManager.scheduleEnhancedReconnection).mockResolvedValue(true);
      });

      // Simulate successful subscription after reconnection
      const subscribeCallback = SupabaseMocks.mockChannel().on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )?.[2];

      if (subscribeCallback) {
        act(() => {
          subscribeCallback({
            eventType: 'INSERT',
            new: { id: 2, title: 'New Link After Reconnection' },
          });
        });
      }

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith({
          title: 'Connection Restored',
          message: 'Real-time updates are working smoothly again.',
        });
      });
    });
  });

  describe('Public Profile Connection Alerts', () => {
    it('shows appropriate alerts for public profile connection issues', async () => {
      const username = 'testuser';
      
      render(
        <TestProviders>
          <PublicLinksTestComponent username={username} />
        </TestProviders>
      );

      await waitFor(() => {
        expect(screen.getByTestId('public-loading')).toHaveTextContent('loaded');
      });

      // Simulate connection quality degradation
      vi.mocked(ConnectionManager.updateConnectionQuality).mockReturnValue('poor');

      // Trigger subscription event
      const subscribeCallback = SupabaseMocks.mockChannel().on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )?.[2];

      if (subscribeCallback) {
        act(() => {
          subscribeCallback({
            eventType: 'UPDATE',
            new: { id: 1, title: 'Updated Public Link' },
          });
        });
      }

      await waitFor(() => {
        expect(mockShowWarning).toHaveBeenCalledWith({
          title: 'Poor Connection Quality',
          message: 'You may experience delays in real-time updates. We\'re working to improve your connection.',
        });
      });
    });

    it('shows info alert for viewing public profile in offline mode', async () => {
      // Mock offline connection
      vi.mocked(ConnectionManager.updateConnectionQuality).mockReturnValue('offline');
      
      const username = 'testuser';
      
      render(
        <TestProviders>
          <PublicLinksTestComponent username={username} />
        </TestProviders>
      );

      await waitFor(() => {
        expect(screen.getByTestId('public-loading')).toHaveTextContent('loaded');
      });

      // Simulate offline detection
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      await waitFor(() => {
        expect(mockShowInfo).toHaveBeenCalledWith({
          title: 'Viewing Cached Content',
          message: 'You\'re viewing a cached version of this profile. Connect to see live updates.',
        });
      });
    });
  });

  describe('Enhanced Reconnection Alerts', () => {
    it('shows progress alerts during enhanced reconnection attempts', async () => {
      // Mock reconnection process
      let reconnectionResolver;
      vi.mocked(ConnectionManager.scheduleEnhancedReconnection).mockImplementation(() => {
        return new Promise((resolve) => {
          reconnectionResolver = resolve;
        });
      });

      render(
        <TestProviders>
          <UserLinksTestComponent />
        </TestProviders>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Simulate connection loss requiring enhanced reconnection
      vi.mocked(ConnectionManager.updateConnectionQuality).mockReturnValue('offline');

      // Trigger subscription error
      const subscribeCallback = SupabaseMocks.mockChannel().on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )?.[2];

      if (subscribeCallback) {
        act(() => {
          subscribeCallback({
            eventType: 'SYSTEM',
            payload: { status: 'error', error: 'Connection lost' },
          });
        });
      }

      // Should show reconnection attempt alert
      await waitFor(() => {
        expect(mockShowInfo).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.stringContaining('Reconnecting'),
            message: expect.stringContaining('attempting to restore'),
          })
        );
      });

      // Resolve reconnection successfully
      act(() => {
        vi.mocked(ConnectionManager.updateConnectionQuality).mockReturnValue('good');
        reconnectionResolver(true);
      });

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith({
          title: 'Connection Restored',
          message: 'Real-time updates are working smoothly again.',
        });
      });
    });

    it('shows error alert when enhanced reconnection fails', async () => {
      // Mock failed reconnection
      vi.mocked(ConnectionManager.scheduleEnhancedReconnection).mockRejectedValue(new Error('Reconnection failed'));

      render(
        <TestProviders>
          <UserLinksTestComponent />
        </TestProviders>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Trigger connection loss and failed reconnection
      vi.mocked(ConnectionManager.updateConnectionQuality).mockReturnValue('offline');

      const subscribeCallback = SupabaseMocks.mockChannel().on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )?.[2];

      if (subscribeCallback) {
        act(() => {
          subscribeCallback({
            eventType: 'SYSTEM',
            payload: { status: 'error', error: 'Critical connection failure' },
          });
        });
      }

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.stringContaining('Connection Problem'),
            message: expect.stringContaining('unable to restore'),
          })
        );
      });
    });
  });

  describe('Background/Foreground Transition Alerts', () => {
    it('shows appropriate alerts during app visibility changes', async () => {
      render(
        <TestProviders>
          <UserLinksTestComponent />
        </TestProviders>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Simulate app going to background
      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          value: 'hidden',
        });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      // Simulate app coming back to foreground after connection issues
      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          writable: true,
          value: 'visible',
        });
        vi.mocked(ConnectionManager.updateConnectionQuality).mockReturnValue('poor');
        document.dispatchEvent(new Event('visibilitychange'));
      });

      await waitFor(() => {
        expect(mockShowInfo).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.stringContaining('Reconnecting'),
            message: expect.stringContaining('background'),
          })
        );
      });
    });
  });

  describe('Alert Timing and Debouncing', () => {
    it('debounces rapid connection quality changes to avoid alert spam', async () => {
      render(
        <TestProviders>
          <UserLinksTestComponent />
        </TestProviders>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      const subscribeCallback = SupabaseMocks.mockChannel().on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )?.[2];

      // Simulate rapid connection quality changes
      for (let i = 0; i < 5; i++) {
        act(() => {
          vi.mocked(ConnectionManager.updateConnectionQuality).mockReturnValue(i % 2 === 0 ? 'poor' : 'good');
          if (subscribeCallback) {
            subscribeCallback({
              eventType: 'UPDATE',
              new: { id: i, title: `Link ${i}` },
            });
          }
        });
      }

      // Fast-forward timers to trigger debounce
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should only show alerts for the final state, not all rapid changes
      await waitFor(() => {
        expect(mockShowWarning).toHaveBeenCalledTimes(1);
      });
    });

    it('properly manages alert lifecycle for connection events', async () => {
      render(
        <TestProviders>
          <UserLinksTestComponent />
        </TestProviders>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Simulate connection degradation
      vi.mocked(ConnectionManager.updateConnectionQuality).mockReturnValue('poor');
      
      const subscribeCallback = SupabaseMocks.mockChannel().on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )?.[2];

      if (subscribeCallback) {
        act(() => {
          subscribeCallback({
            eventType: 'UPDATE',
            new: { id: 1, title: 'Test Link' },
          });
        });
      }

      // Should show warning alert
      await waitFor(() => {
        expect(mockShowWarning).toHaveBeenCalledWith({
          title: 'Poor Connection Quality',
          message: 'You may experience delays in real-time updates. We\'re working to improve your connection.',
        });
      });

      // Simulate connection improvement
      act(() => {
        vi.mocked(ConnectionManager.updateConnectionQuality).mockReturnValue('good');
      });

      if (subscribeCallback) {
        act(() => {
          subscribeCallback({
            eventType: 'INSERT',
            new: { id: 2, title: 'New Link' },
          });
        });
      }

      // Should show success alert for restoration
      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith({
          title: 'Connection Restored',
          message: 'Real-time updates are working smoothly again.',
        });
      });
    });
  });

  describe('Error Context Integration', () => {
    it('shows contextual error alerts based on connection context', async () => {
      render(
        <TestProviders>
          <UserLinksTestComponent />
        </TestProviders>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Simulate subscription error with specific context
      const subscribeCallback = SupabaseMocks.mockChannel().on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )?.[2];

      if (subscribeCallback) {
        act(() => {
          subscribeCallback({
            eventType: 'SYSTEM',
            payload: {
              status: 'error',
              error: 'REALTIME_SUBSCRIPTION_ERROR',
              context: 'mobile_network_switch',
            },
          });
        });
      }

      await waitFor(() => {
        expect(mockShowWarning).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.stringContaining('Connection'),
            message: expect.stringContaining('mobile'),
          })
        );
      });
    });
  });
});
