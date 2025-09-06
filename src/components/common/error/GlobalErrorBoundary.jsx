import React from 'react';
import PropTypes from 'prop-types';
import ErrorState from './ErrorState';

/**
 * GlobalErrorBoundary Component
 * 
 * Application-wide error boundary that provides a fallback UI for uncaught JavaScript errors.
 * This component ensures the entire application doesn't crash when unexpected errors occur.
 * 
 * Features:
 * - Catches errors from anywhere in the component tree
 * - Provides retry functionality
 * - Logs errors for debugging
 * - Mobile-first error display
 * - Graceful fallback UI
 * 
 * Usage: 
 * Wrap your entire application or major sections:
 * <GlobalErrorBoundary>
 *   <App />
 * </GlobalErrorBoundary>
 */
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorId: Math.random().toString(36).substr(2, 9) // Generate unique error ID
    };
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error context for global boundary
    const errorContext = {
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount,
      boundaryType: 'GlobalErrorBoundary',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      componentStack: errorInfo.componentStack,
      // Add performance info if available
      memory: performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize
      } : undefined
    };
    
    console.error('🚨 Global Error Boundary - Enhanced Error Context:', errorContext);
    
    this.setState({
      error,
      errorInfo
    });

    // In production, you might want to send this to an error reporting service
    if (this.props.onError) {
      this.props.onError(errorContext);
    }
  }

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    const maxRetries = this.props.maxRetries || 2; // Global boundary should be more conservative
    
    if (newRetryCount > maxRetries) {
      console.warn(`GlobalErrorBoundary: Maximum retry attempts (${maxRetries}) reached`);
      return;
    }

    // Call custom retry handler if provided  
    if (this.props.onRetry) {
      try {
        this.props.onRetry(this.state.error, newRetryCount);
      } catch (retryError) {
        console.error('GlobalErrorBoundary: Custom retry handler failed:', retryError);
        return;
      }
    }

    // Reset error state to retry rendering
    setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        errorId: null,
        retryCount: newRetryCount
      });
    }, this.props.retryDelay || 200); // Slightly longer delay for global boundary
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function' 
          ? this.props.fallback(this.state.error, this.handleRetry)
          : this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <ErrorState
            type="general"
            error={this.state.error}
            onRetry={this.handleRetry}
            title="Application Error"
            message="Something unexpected happened. The error has been logged and we'll work to fix it."
            className={this.props.className}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

GlobalErrorBoundary.propTypes = {
  /** Child components to protect */
  children: PropTypes.node.isRequired,
  /** Custom fallback UI or function */
  fallback: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func
  ]),
  /** Callback when error occurs with enhanced error context */
  onError: PropTypes.func,
  /** Custom retry handler function */
  onRetry: PropTypes.func,
  /** Maximum retry attempts before giving up */
  maxRetries: PropTypes.number,
  /** Delay in ms before retry (default: 200ms) */
  retryDelay: PropTypes.number,
  /** Additional CSS classes */
  className: PropTypes.string,
};

/**
 * Higher-order component for easy error boundary wrapping
 */
// eslint-disable-next-line react-refresh/only-export-components
export const withGlobalErrorBoundary = (Component, boundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <GlobalErrorBoundary {...boundaryProps}>
      <Component {...props} />
    </GlobalErrorBoundary>
  );
  
  WrappedComponent.displayName = `withGlobalErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Hook for reporting errors specifically to the global error boundary
 * Note: For comprehensive error reporting, use useErrorReporting from hooks/
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useGlobalErrorReporting = () => {
  const reportError = React.useCallback((error, context = {}) => {
    console.error('Global Error Boundary - Error reported:', error, context);
    
    // In a real application, you might send this to an error reporting service
    // like Sentry, Bugsnag, or LogRocket
    
    // For now, we'll just throw the error to be caught by the boundary
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(typeof error === 'string' ? error : 'An error occurred');
    }
  }, []);

  return { reportError };
};

export default GlobalErrorBoundary;
