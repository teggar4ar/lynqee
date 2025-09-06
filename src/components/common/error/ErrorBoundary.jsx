import React from 'react';
import PropTypes from 'prop-types';
import ErrorState from './ErrorState';

/**
 * ErrorBoundary Component
 * 
 * React error boundary that catches JavaScript errors anywhere in the child 
 * component tree and displays a fallback UI. Essential for production apps.
 * 
 * Usage: Wrap components that might throw errors
 * <ErrorBoundary fallback={<CustomError />}>
 *   <ComponentThatMightCrash />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error logging with more context
    const errorContext = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      retryCount: this.state.retryCount,
      boundaryName: this.constructor.name,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      componentStack: errorInfo.componentStack
    };
    
    console.error('ErrorBoundary caught an error:', errorContext);
    
    this.setState({
      error,
      errorInfo
    });

    // Call onError prop if provided with enhanced context
    if (this.props.onError) {
      this.props.onError(errorContext);
    }
  }

  handleRetry = () => {
    // Increment retry count and check if we should allow retry
    const newRetryCount = this.state.retryCount + 1;
    
    // Maximum retry attempts (configurable via props)
    const maxRetries = this.props.maxRetries || 3;
    
    if (newRetryCount > maxRetries) {
      console.warn(`ErrorBoundary: Maximum retry attempts (${maxRetries}) reached`);
      return;
    }

    // Call custom retry handler if provided
    if (this.props.onRetry) {
      try {
        this.props.onRetry(this.state.error, newRetryCount);
      } catch (retryError) {
        console.error('ErrorBoundary: Custom retry handler failed:', retryError);
        return;
      }
    }

    // Reset error state with slight delay to allow cleanup
    setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        retryCount: newRetryCount
      });
    }, this.props.retryDelay || 100);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with enhanced error details
      return (
        <ErrorState
          type="general"
          error={this.state.error}
          onRetry={this.handleRetry}
          title="Application Error"
          message="Something unexpected happened. The error has been logged and we'll work to fix it."
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  /** Child components that might throw errors */
  children: PropTypes.node.isRequired,
  /** Custom fallback component to render on error */
  fallback: PropTypes.node,
  /** Additional CSS classes for the error container */
  className: PropTypes.string,
  /** Callback when error occurs with enhanced error context */
  onError: PropTypes.func,
  /** Custom retry handler function */
  onRetry: PropTypes.func,
  /** Maximum retry attempts before giving up */
  maxRetries: PropTypes.number,
  /** Delay in ms before retry (default: 100ms) */
  retryDelay: PropTypes.number,
};

/**
 * Higher-order component for wrapping components with error boundary
 */
// eslint-disable-next-line react-refresh/only-export-components
export const withErrorBoundary = (Component, fallbackComponent = null) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary fallback={fallbackComponent}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Hook for error handling in functional components
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by nearest error boundary
  if (error) {
    throw error;
  }

  return { handleError, clearError };
};

export default ErrorBoundary;
