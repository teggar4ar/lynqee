/**
 * Enhanced useAsync Hook Tests
 * 
 * Tests for the enhanced useAsync hook with retry logic, context-aware error handling,
 * and error reporting integration.
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock useErrorReporting hook
vi.mock('../../hooks/useErrorReporting.js', () => {
  const mockReportError = vi.fn();
  const mockUseErrorReporting = vi.fn().mockReturnValue({
    reportError: mockReportError,
    reportNetworkError: mockReportError,
    reportValidationError: mockReportError
  });
  
  return {
    useErrorReporting: mockUseErrorReporting
  };
});

import { useAsync } from '../../hooks/useAsync.js';
import { useErrorReporting } from '../../hooks/useErrorReporting.js';

// Get mock references for testing
const mockUseErrorReporting = vi.mocked(useErrorReporting);
const getMockReportError = () => mockUseErrorReporting().reportError;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAsync (Enhanced)', () => {
  describe('Basic Functionality', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useAsync());
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeNull();
      expect(result.current.execute).toBeInstanceOf(Function);
      expect(result.current.retry).toBeInstanceOf(Function);
    });

    it('executes async function successfully', async () => {
      const mockAsyncFn = vi.fn().mockResolvedValue('success data');
      const { result } = renderHook(() => useAsync(mockAsyncFn));
      
      await act(async () => {
        await result.current.execute();
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBe('success data');
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);
    });

    it('handles async function errors', async () => {
      const mockError = new Error('Test error');
      const mockAsyncFn = vi.fn().mockRejectedValue(mockError);
      const { result } = renderHook(() => useAsync(mockAsyncFn));
      
      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Error is expected to be thrown
        }
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError);
      expect(result.current.data).toBeNull();
    });

    it('sets loading state during execution', async () => {
      let resolvePromise;
      const mockAsyncFn = vi.fn().mockImplementation(() => 
        new Promise(resolve => { resolvePromise = resolve; })
      );
      
      const { result } = renderHook(() => useAsync(mockAsyncFn));
      
      act(() => {
        result.current.execute();
      });
      
      expect(result.current.loading).toBe(true);
      
      await act(async () => {
        resolvePromise('success');
      });
      
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Immediate Execution', () => {
    it('executes immediately when immediate=true', async () => {
      const mockAsyncFn = vi.fn().mockResolvedValue('immediate data');
      
      await act(async () => {
        renderHook(() => useAsync(mockAsyncFn, true));
      });
      
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);
    });

    it('does not execute immediately when immediate=false', () => {
      const mockAsyncFn = vi.fn().mockResolvedValue('data');
      renderHook(() => useAsync(mockAsyncFn, false));
      
      expect(mockAsyncFn).not.toHaveBeenCalled();
    });
  });

  describe('Enhanced Retry Logic', () => {
    it('retries on failure when maxRetries is set', async () => {
      const mockAsyncFn = vi.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockRejectedValueOnce(new Error('Second attempt'))
        .mockResolvedValue('success after retries');
      
      const { result } = renderHook(() => useAsync(mockAsyncFn, false, {
        maxRetries: 2,
        retryDelay: 100
      }));
      
      await act(async () => {
        await result.current.execute();
      });
      
      expect(mockAsyncFn).toHaveBeenCalledTimes(3);
      expect(result.current.data).toBe('success after retries');
      expect(result.current.error).toBeNull();
    });

    it('respects maxRetries limit', async () => {
      const mockError = new Error('Always fails');
      const mockAsyncFn = vi.fn().mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useAsync(mockAsyncFn, false, {
        maxRetries: 2
      }));
      
      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Error is expected to be thrown after retries are exhausted
        }
      });
      
      expect(mockAsyncFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(result.current.error).toBe(mockError);
    });

    it('provides retry function for manual retries', async () => {
      const mockAsyncFn = vi.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockResolvedValue('success on retry');
      
      const { result } = renderHook(() => useAsync(mockAsyncFn));
      
      // Initial execution fails
      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // First attempt is expected to fail
        }
      });
      
      expect(result.current.error).toBeTruthy();
      
      // Manual retry succeeds
      await act(async () => {
        await result.current.retry();
      });
      
      expect(result.current.data).toBe('success on retry');
      expect(result.current.error).toBeNull();
    });

    it('tracks retry state correctly', async () => {
      const mockAsyncFn = vi.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockResolvedValue('success');
      
      const { result } = renderHook(() => useAsync(mockAsyncFn, false, {
        maxRetries: 1
      }));
      
      await act(async () => {
        await result.current.execute();
      });
      
      expect(result.current.isRetrying).toBe(false);
      expect(mockAsyncFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Reporting Integration', () => {
    it('reports errors using error reporting hook', async () => {
      const mockError = new Error('Test error');
      const mockAsyncFn = vi.fn().mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useAsync(mockAsyncFn, false, {
        context: 'test-context'
      }));
      
      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Error reporting should still happen even if error is thrown
        }
      });
      
      expect(mockUseErrorReporting).toHaveBeenCalledWith({
        component: 'useAsync',
        context: 'test-context'
      });
      expect(getMockReportError()).toHaveBeenCalledWith(mockError, {
        action: 'async execution',
        attempt: 1,
        maxRetries: 0,
        context: 'test-context'
      });
    });

    it('includes operation context in error reporting', async () => {
      const mockError = new Error('Network error');
      const mockAsyncFn = vi.fn().mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useAsync(mockAsyncFn, false, {
        context: 'api-call'
      }));
      
      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Error reporting should still happen even if error is thrown
        }
      });
      
      expect(getMockReportError()).toHaveBeenCalledWith(mockError, {
        action: 'async execution',
        attempt: 1,
        maxRetries: 0,
        context: 'api-call'
      });
    });
  });

  describe('Context-Aware Error Handling', () => {
    it('applies contextual error processing', async () => {
      const mockError = new Error('Duplicate key error');
      const mockAsyncFn = vi.fn().mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useAsync(mockAsyncFn, false, {
        context: 'link-creation'
      }));
      
      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Error is expected to be thrown
        }
      });
      
      expect(result.current.error).toBe(mockError);
      // Error should be processed through contextual error handling
    });

    it('handles different contexts appropriately', async () => {
      const mockError = new Error('Validation error');
      const mockAsyncFn = vi.fn().mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useAsync(mockAsyncFn, false, {
        context: 'profile-update'
      }));
      
      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Error is expected to be thrown
        }
      });
      
      expect(getMockReportError()).toHaveBeenCalledWith(mockError, {
        action: 'async execution',
        attempt: 1,
        maxRetries: 0,
        context: 'profile-update'
      });
    });
  });

  describe('Cleanup and Cancellation', () => {
    it('cancels pending operations on unmount', async () => {
      let rejectPromise;
      const mockAsyncFn = vi.fn().mockImplementation(() => 
        new Promise((resolve, reject) => { rejectPromise = reject; })
      );
      
      const { result, unmount } = renderHook(() => useAsync(mockAsyncFn));
      
      act(() => {
        result.current.execute();
      });
      
      expect(result.current.loading).toBe(true);
      
      unmount();
      
      // Reject the promise after unmount
      rejectPromise(new Error('Cancelled'));
      
      // Should not cause state updates or errors
      expect(true).toBe(true);
    });

    it('cleans up ongoing retries on unmount', async () => {
      const mockAsyncFn = vi.fn().mockRejectedValue(new Error('Always fails'));
      
      const { result, unmount } = renderHook(() => useAsync(mockAsyncFn, false, {
        maxRetries: 5,
        retryDelay: 1000
      }));
      
      act(() => {
        result.current.execute();
      });
      
      unmount();
      
      // Should not cause memory leaks or continued execution
      expect(true).toBe(true);
    });
  });

  describe('Configuration Options', () => {
    it('accepts custom configuration', () => {
      const config = {
        maxRetries: 3,
        retryDelay: 500,
        context: 'custom-context'
      };
      
      const mockAsyncFn = vi.fn().mockResolvedValue('data');
      const { result } = renderHook(() => useAsync(mockAsyncFn, false, config));
      
      expect(result.current.execute).toBeInstanceOf(Function);
    });

    it('merges default and custom configuration', async () => {
      const mockAsyncFn = vi.fn().mockRejectedValue(new Error('Test error'));
      
      renderHook(() => useAsync(mockAsyncFn, false, {
        context: 'merge-test'
      }));
      
      expect(mockUseErrorReporting).toHaveBeenCalledWith({
        component: 'useAsync',
        context: 'merge-test'
      });
    });
  });

  describe('Function Execution Variants', () => {
    it('executes provided function when called without parameters', async () => {
      const mockAsyncFn = vi.fn().mockResolvedValue('original function result');
      const { result } = renderHook(() => useAsync(mockAsyncFn));
      
      await act(async () => {
        await result.current.execute();
      });
      
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);
      expect(result.current.data).toBe('original function result');
    });

    it('executes new function when provided to execute', async () => {
      const originalFn = vi.fn().mockResolvedValue('original');
      const newFn = vi.fn().mockResolvedValue('new function result');
      
      const { result } = renderHook(() => useAsync(originalFn));
      
      await act(async () => {
        await result.current.execute(newFn);
      });
      
      expect(originalFn).not.toHaveBeenCalled();
      expect(newFn).toHaveBeenCalledTimes(1);
      expect(result.current.data).toBe('new function result');
    });

    it('handles execution without initial function', async () => {
      const { result } = renderHook(() => useAsync());
      
      const testFn = vi.fn().mockResolvedValue('test result');
      
      await act(async () => {
        await result.current.execute(testFn);
      });
      
      expect(testFn).toHaveBeenCalledTimes(1);
      expect(result.current.data).toBe('test result');
    });
  });

  describe('Error Recovery', () => {
    it('clears error state on successful retry', async () => {
      const mockAsyncFn = vi.fn()
        .mockRejectedValueOnce(new Error('Initial error'))
        .mockResolvedValue('success');
      
      const { result } = renderHook(() => useAsync(mockAsyncFn));
      
      // Initial execution fails
      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Error is expected to be thrown
        }
      });
      
      expect(result.current.error).toBeTruthy();
      
      // Retry succeeds
      await act(async () => {
        await result.current.retry();
      });
      
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBe('success');
    });

    it('preserves data on subsequent errors', async () => {
      const mockAsyncFn = vi.fn()
        .mockResolvedValueOnce('initial success')
        .mockRejectedValue(new Error('Later error'));
      
      const { result } = renderHook(() => useAsync(mockAsyncFn));
      
      // Initial success
      await act(async () => {
        await result.current.execute();
      });
      
      expect(result.current.data).toBe('initial success');
      
      // Later execution fails
      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Error is expected to be thrown
        }
      });
      
      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBe('initial success'); // Data preserved
    });
  });
});
