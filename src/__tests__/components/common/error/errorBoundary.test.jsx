/**
 * Error Boundary Test Suite
 * 
 * Comprehensive testing for error boundaries, error handling patterns,
 * and error recovery mechanisms.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ErrorBoundary, ErrorDisplay, ErrorState, GlobalErrorBoundary } from '../../../../components/common/error';
import { useAsync, useErrorReporting, useRetry } from '../../../../hooks';

// Mock component that throws errors on demand
const ErrorThrowingComponent = ({ shouldThrow = false, errorType = 'general' }) => {
  if (shouldThrow) {
    switch (errorType) {
      case 'network':
        throw new Error('Network error: Failed to fetch');
      case 'validation':
        throw new Error('Validation failed: Invalid input');
      case 'permission':
        throw new Error('Permission denied: Unauthorized access');
      default:
        throw new Error('Something went wrong');
    }
  }
  return <div data-testid="success-component">Component rendered successfully</div>;
};

// Mock component that uses hooks
const HookTestComponent = ({ hookType = 'async', options = {} }) => {
  const [shouldThrow, setShouldThrow] = React.useState(false);
  
  // Call all hooks unconditionally to avoid React hooks rules violation
  const asyncHook = useAsync();
  const retryHook = useRetry(async () => {
    if (shouldThrow) throw new Error('Test error');
    return 'success';
  }, options);
  const errorReportingHook = useErrorReporting(options);
  
  // Select which hook result to use
  let hookResult;
  switch (hookType) {
    case 'async':
      hookResult = asyncHook;
      break;
    case 'retry':
      hookResult = retryHook;
      break;
    case 'errorReporting':
      hookResult = errorReportingHook;
      break;
    default:
      hookResult = {};
  }

  return (
    <div>
      <button 
        data-testid="trigger-error" 
        onClick={() => setShouldThrow(true)}
      >
        Trigger Error
      </button>
      <div data-testid="hook-state">
        {JSON.stringify({
          loading: hookResult.loading || hookResult.isRetrying,
          error: hookResult.error?.message,
          isError: hookResult.isError
        })}
      </div>
    </div>
  );
};

describe('Error Boundary Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn(); // Suppress console.error in tests
  });

  describe('ErrorBoundary Component', () => {
    test('catches and displays error when child component throws', () => {
      render(
        <ErrorBoundary fallback={<div data-testid="error-fallback">Error occurred</div>}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    });

    test('renders children normally when no error occurs', () => {
      render(
        <ErrorBoundary fallback={<div data-testid="error-fallback">Error occurred</div>}>
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('success-component')).toBeInTheDocument();
      expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument();
    });

    test('logs error when error occurs', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary fallback={<div data-testid="error-fallback">Error occurred</div>}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('GlobalErrorBoundary Component', () => {
    test('catches unhandled errors and displays fallback UI', () => {
      render(
        <GlobalErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    test('provides error reporting functionality', () => {
      const onError = vi.fn();
      
      render(
        <GlobalErrorBoundary onError={onError}>
          <ErrorThrowingComponent shouldThrow={true} errorType="network" />
        </GlobalErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Network error') }),
        expect.any(Object)
      );
    });
  });

  describe('ErrorState Component', () => {
    test('renders different error types correctly', () => {
      const errorTypes = ['general', 'network', 'unauthorized', 'profileNotFound'];
      
      errorTypes.forEach(type => {
        const { unmount } = render(<ErrorState type={type} />);
        
        // Each error type should render appropriate content
        expect(screen.getByRole('heading')).toBeInTheDocument();
        
        unmount(); // Clean up between renders
      });
    });

    test('renders action buttons when provided', () => {
      // Mock window.location.reload in a way that works with JSDOM
      const originalLocation = window.location;
      const mockReload = vi.fn();
      
      // Replace the entire location object with a mock
      delete window.location;
      window.location = {
        ...originalLocation,
        reload: mockReload
      };

      render(
        <ErrorState 
          type="general"
          showRetry={true}
        />
      );

      const tryAgainButton = screen.getByText('Try Again');
      const goHomeButton = screen.getByText('Go Home');

      fireEvent.click(tryAgainButton);

      expect(mockReload).toHaveBeenCalledTimes(1);
      expect(tryAgainButton).toBeInTheDocument();
      expect(goHomeButton).toBeInTheDocument();
      
      // Restore original location
      window.location = originalLocation;
    });
  });

  describe('ErrorDisplay Component', () => {
    test('displays error message correctly', () => {
      const error = new Error('Test error message');
      
      render(<ErrorDisplay error={error} />);
      
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    test('handles string errors', () => {
      render(<ErrorDisplay error="String error message" />);
      
      expect(screen.getByText('String error message')).toBeInTheDocument();
    });

    test('renders with different sizes', () => {
      const { rerender } = render(<ErrorDisplay error="Test" size="small" />);
      const container = screen.getByRole('alert');
      expect(container).toHaveClass('text-xs');
      
      rerender(<ErrorDisplay error="Test" size="large" />);
      expect(container).toHaveClass('text-base');
    });
  });
});

describe('Error Handling Hooks Tests', () => {
  describe('useErrorReporting', () => {
    test('reports errors with correct context', () => {
      const { result } = renderHook(() => 
        useErrorReporting({ 
          component: 'TestComponent', 
          module: 'TestModule' 
        })
      );

      const error = new Error('Test error');
      const report = result.current.reportError(error, { action: 'Test Action' });

      expect(report).toMatchObject({
        component: 'TestComponent',
        module: 'TestModule',
        message: 'Test error',
        context: expect.objectContaining({
          action: 'Test Action'
        })
      });
    });

    test('tracks error statistics correctly', () => {
      const { result } = renderHook(() => useErrorReporting());

      // Report multiple errors
      result.current.reportError(new Error('Error 1'));
      result.current.reportError(new Error('Error 2'));
      result.current.reportNetworkError(new Error('Network error'), '/api/test');

      const stats = result.current.getErrorStats();

      expect(stats.totalErrors).toBe(3);
      expect(stats.recentErrors).toHaveLength(3);
      expect(stats.errorsByType).toHaveProperty('general');
      expect(stats.errorsByType).toHaveProperty('network');
    });
  });

  describe('useRetry', () => {
    test('retries failed operations correctly', async () => {
      let attemptCount = 0;
      const mockOperation = vi.fn().mockImplementation(async () => {
        attemptCount++;
        if (attemptCount <= 2) {
          throw new Error('Network error');
        }
        return 'success';
      });

      const { result } = renderHook(() => 
        useRetry(mockOperation, { maxAttempts: 3 })
      );

      await act(async () => {
        await result.current.retry();
      });

      expect(mockOperation).toHaveBeenCalledTimes(3);
      expect(result.current.attemptCount).toBe(3);
    });

    test('stops retrying after max attempts', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Persistent error'));

      const { result } = renderHook(() => 
        useRetry(mockOperation, { maxAttempts: 2 })
      );

      await act(async () => {
        try {
          await result.current.retry();
        } catch {
          // Expected to throw after max attempts
        }
      });

      expect(mockOperation).toHaveBeenCalledTimes(2);
      expect(result.current.maxAttemptsReached).toBe(true);
    });

    test('provides retry statistics', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => 
        useRetry(mockOperation, { maxAttempts: 3 })
      );

      await act(async () => {
        try {
          await result.current.retry();
        } catch {
          // Expected to throw
        }
      });

      const stats = result.current.retryStats;
      expect(stats.totalAttempts).toBe(3);
      expect(stats.maxAttempts).toBe(3);
      expect(stats.remainingAttempts).toBe(0);
    });
  });

  describe('useAsync', () => {
    test('handles async operations with error reporting', async () => {
      const mockAsyncFn = vi.fn().mockRejectedValue(new Error('Async error'));

      const { result } = renderHook(() => 
        useAsync(mockAsyncFn, false, { 
          context: 'test',
          maxRetries: 1 
        })
      );

      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
    });

    test('provides retry functionality', async () => {
      let callCount = 0;
      const mockAsyncFn = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Network error');
        }
        return 'success';
      });

      const { result } = renderHook(() => 
        useAsync(mockAsyncFn, false, { 
          maxRetries: 1,
          context: 'test'
        })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe('success');
      expect(mockAsyncFn).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Integration Tests', () => {
  test('error boundaries work with retry hooks', async () => {
    const TestComponent = () => {
      const { retry, isRetrying, lastError } = useRetry(
        async () => {
          throw new Error('Integration test error');
        },
        { maxAttempts: 2 }
      );

      return (
        <div>
          <button onClick={retry} data-testid="retry-button">
            Retry
          </button>
          {isRetrying && <div data-testid="retrying">Retrying...</div>}
          {lastError && <div data-testid="error">{lastError.message}</div>}
        </div>
      );
    };

    render(
      <ErrorBoundary fallback={<div data-testid="error-boundary">Boundary Error</div>}>
        <TestComponent />
      </ErrorBoundary>
    );

    const retryButton = screen.getByTestId('retry-button');
    
    await act(async () => {
      fireEvent.click(retryButton);
    });

    // Should show error but not trigger error boundary
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
  });

  test('complete error handling flow', async () => {
    const TestComponent = () => {
      const errorReporting = useErrorReporting({ 
        component: 'TestComponent' 
      });
      
      const { execute, isError, error } = useAsync(null, false, {
        onError: (error, context) => {
          errorReporting.reportError(error, context);
        }
      });

      const handleAsyncOperation = async () => {
        try {
          await execute(async () => {
            throw new Error('Test async error');
          });
        } catch {
          // Error handled by hook
        }
      };

      return (
        <div>
          <button onClick={handleAsyncOperation} data-testid="async-button">
            Execute Async
          </button>
          {isError && <div data-testid="error-display"><ErrorDisplay error={error} /></div>}
          <div data-testid="error-stats">
            {JSON.stringify(errorReporting.getErrorStats())}
          </div>
        </div>
      );
    };

    render(<TestComponent />);

    const asyncButton = screen.getByTestId('async-button');
    
    await act(async () => {
      fireEvent.click(asyncButton);
    });

    expect(screen.getByTestId('error-display')).toBeInTheDocument();
    
    const statsElement = screen.getByTestId('error-stats');
    const stats = JSON.parse(statsElement.textContent);
    expect(stats.totalErrors).toBe(1);
  });
});

export {
  ErrorThrowingComponent,
  HookTestComponent
};
