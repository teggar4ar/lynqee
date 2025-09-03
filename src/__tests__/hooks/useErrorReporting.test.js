/**
 * useErrorReporting Hook Tests
 * 
 * Tests for the comprehensive error reporting and tracking hook.
 * This hook provides centralized error categorization, reporting, and statistics.
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useErrorReporting } from '../../hooks/useErrorReporting.js';

// Mock console methods
const mockConsoleError = vi.fn();
const mockConsoleWarn = vi.fn();
const mockConsoleLog = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  global.console = {
    ...global.console,
    error: mockConsoleError,
    warn: mockConsoleWarn,
    log: mockConsoleLog,
  };
});

describe('useErrorReporting', () => {
  describe('Initialization', () => {
    it('initializes with default configuration', () => {
      const { result } = renderHook(() => useErrorReporting());
      
      expect(result.current.reportError).toBeInstanceOf(Function);
      expect(result.current.reportNetworkError).toBeInstanceOf(Function);
      expect(result.current.reportValidationError).toBeInstanceOf(Function);
      expect(result.current.getErrorStats).toBeInstanceOf(Function);
      expect(result.current.clearErrorStats).toBeInstanceOf(Function);
    });

    it('accepts custom configuration options', () => {
      const config = {
        component: 'TestComponent',
        module: 'TestModule',
        enableConsoleLogging: false,
        enableExternalReporting: true
      };
      
      const { result } = renderHook(() => useErrorReporting(config));
      expect(result.current.reportError).toBeInstanceOf(Function);
    });
  });

  describe('Error Reporting', () => {
    it('reports general errors correctly', () => {
      const { result } = renderHook(() => useErrorReporting({
        component: 'TestComponent',
        enableConsoleLogging: true
      }));
      
      const testError = new Error('Test error message');
      const context = { action: 'button_click' };
      
      act(() => {
        result.current.reportError(testError, context);
      });
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[TestComponent] Error:',
        testError,
        context
      );
    });

    it('reports network errors with endpoint information', () => {
      const { result } = renderHook(() => useErrorReporting({
        component: 'ApiComponent',
        enableConsoleLogging: true
      }));
      
      const networkError = new Error('Network request failed');
      const endpoint = '/api/users';
      
      act(() => {
        result.current.reportNetworkError(networkError, endpoint);
      });
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[ApiComponent] Network Error:',
        networkError,
        { endpoint, type: 'network' }
      );
    });

    it('reports validation errors with form data', () => {
      const { result } = renderHook(() => useErrorReporting({
        component: 'FormComponent',
        enableConsoleLogging: true
      }));
      
      const validationError = new Error('Validation failed');
      const formData = { email: 'invalid-email' };
      const field = 'email';
      
      act(() => {
        result.current.reportValidationError(validationError, formData, field);
      });
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[FormComponent] Validation Error:',
        validationError,
        { formData, field, type: 'validation' }
      );
    });
  });

  describe('Error Statistics', () => {
    it('tracks error counts correctly', () => {
      const { result } = renderHook(() => useErrorReporting());
      
      act(() => {
        result.current.reportError(new Error('Error 1'));
        result.current.reportError(new Error('Error 2'));
        result.current.reportNetworkError(new Error('Network error'));
      });
      
      const stats = result.current.getErrorStats();
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByType.general).toBe(2);
      expect(stats.errorsByType.network).toBe(1);
    });

    it('tracks error categories separately', () => {
      const { result } = renderHook(() => useErrorReporting());
      
      act(() => {
        result.current.reportError(new Error('General error'));
        result.current.reportNetworkError(new Error('Network error'));
        result.current.reportValidationError(new Error('Validation error'));
      });
      
      const stats = result.current.getErrorStats();
      expect(stats.errorsByType.general).toBe(1);
      expect(stats.errorsByType.network).toBe(1);
      expect(stats.errorsByType.validation).toBe(1);
    });

    it('tracks recent errors list', () => {
      const { result } = renderHook(() => useErrorReporting());
      
      const error1 = new Error('First error');
      const error2 = new Error('Second error');
      
      act(() => {
        result.current.reportError(error1);
        result.current.reportError(error2);
      });
      
      const stats = result.current.getErrorStats();
      expect(stats.recentErrors).toHaveLength(2);
      expect(stats.recentErrors[0].error.message).toBe('Second error');
      expect(stats.recentErrors[1].error.message).toBe('First error');
    });

    it('limits recent errors to maximum count', () => {
      const { result } = renderHook(() => useErrorReporting());
      
      act(() => {
        // Report more than 10 errors (default max)
        for (let i = 0; i < 15; i++) {
          result.current.reportError(new Error(`Error ${i}`));
        }
      });
      
      const stats = result.current.getErrorStats();
      expect(stats.recentErrors).toHaveLength(10);
      expect(stats.totalErrors).toBe(15);
    });
  });

  describe('Error Statistics Management', () => {
    it('clears error statistics correctly', () => {
      const { result } = renderHook(() => useErrorReporting());
      
      act(() => {
        result.current.reportError(new Error('Test error'));
        result.current.reportNetworkError(new Error('Network error'));
      });
      
      let stats = result.current.getErrorStats();
      expect(stats.totalErrors).toBe(2);
      
      act(() => {
        result.current.clearErrorStats();
      });
      
      stats = result.current.getErrorStats();
      expect(stats.totalErrors).toBe(0);
      expect(stats.errorsByType.general).toBe(0);
      expect(stats.errorsByType.network).toBe(0);
      expect(stats.recentErrors).toHaveLength(0);
    });
  });

  describe('Console Logging Control', () => {
    it('logs to console when enableConsoleLogging is true', () => {
      const { result } = renderHook(() => useErrorReporting({
        enableConsoleLogging: true
      }));
      
      act(() => {
        result.current.reportError(new Error('Test error'));
      });
      
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('does not log to console when enableConsoleLogging is false', () => {
      const { result } = renderHook(() => useErrorReporting({
        enableConsoleLogging: false
      }));
      
      act(() => {
        result.current.reportError(new Error('Test error'));
      });
      
      expect(mockConsoleError).not.toHaveBeenCalled();
    });
  });

  describe('Component and Module Context', () => {
    it('includes component name in error logs', () => {
      const { result } = renderHook(() => useErrorReporting({
        component: 'MyTestComponent',
        enableConsoleLogging: true
      }));
      
      act(() => {
        result.current.reportError(new Error('Test error'));
      });
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[MyTestComponent] Error:',
        expect.any(Error),
        undefined
      );
    });

    it('includes module name in context when provided', () => {
      const { result } = renderHook(() => useErrorReporting({
        component: 'TestComponent',
        module: 'UserManagement',
        enableConsoleLogging: true
      }));
      
      act(() => {
        result.current.reportError(new Error('Test error'));
      });
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[TestComponent] Error:',
        expect.any(Error),
        undefined
      );
    });
  });

  describe('External Reporting Integration', () => {
    it('prepares errors for external reporting when enabled', () => {
      const { result } = renderHook(() => useErrorReporting({
        enableExternalReporting: true
      }));
      
      act(() => {
        result.current.reportError(new Error('Test error'), { userId: '123' });
      });
      
      const stats = result.current.getErrorStats();
      expect(stats.recentErrors[0]).toMatchObject({
        error: expect.any(Error),
        context: { userId: '123' },
        timestamp: expect.any(Date),
        type: 'general'
      });
    });
  });

  describe('Error Context Handling', () => {
    it('handles undefined context gracefully', () => {
      const { result } = renderHook(() => useErrorReporting());
      
      act(() => {
        result.current.reportError(new Error('Test error'), undefined);
      });
      
      const stats = result.current.getErrorStats();
      expect(stats.totalErrors).toBe(1);
    });

    it('handles null context gracefully', () => {
      const { result } = renderHook(() => useErrorReporting());
      
      act(() => {
        result.current.reportError(new Error('Test error'), null);
      });
      
      const stats = result.current.getErrorStats();
      expect(stats.totalErrors).toBe(1);
    });

    it('preserves complex context objects', () => {
      const { result } = renderHook(() => useErrorReporting());
      
      const complexContext = {
        user: { id: '123', name: 'Test User' },
        action: 'form_submit',
        metadata: { formId: 'contact-form' }
      };
      
      act(() => {
        result.current.reportError(new Error('Test error'), complexContext);
      });
      
      const stats = result.current.getErrorStats();
      expect(stats.recentErrors[0].context).toEqual(complexContext);
    });
  });

  describe('Error Type Detection', () => {
    it('correctly categorizes different error types', () => {
      const { result } = renderHook(() => useErrorReporting());
      
      act(() => {
        result.current.reportError(new Error('General error'));
        result.current.reportNetworkError(new Error('Network error'));
        result.current.reportValidationError(new Error('Validation error'));
      });
      
      const stats = result.current.getErrorStats();
      const types = stats.recentErrors.map(e => e.type);
      expect(types).toContain('general');
      expect(types).toContain('network');
      expect(types).toContain('validation');
    });
  });

  describe('Timestamp Tracking', () => {
    it('includes timestamps for all reported errors', () => {
      const { result } = renderHook(() => useErrorReporting());
      
      const startTime = new Date();
      
      act(() => {
        result.current.reportError(new Error('Test error'));
      });
      
      const endTime = new Date();
      const stats = result.current.getErrorStats();
      const errorTimestamp = stats.recentErrors[0].timestamp;
      
      expect(errorTimestamp).toBeInstanceOf(Date);
      expect(errorTimestamp.getTime()).toBeGreaterThanOrEqual(startTime.getTime());
      expect(errorTimestamp.getTime()).toBeLessThanOrEqual(endTime.getTime());
    });
  });
});
