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
      errorId: null 
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
    // Log error details for debugging
    console.error('🚨 Global Error Boundary - Error:', error);
    console.error('🚨 Global Error Boundary - Error Info:', errorInfo);
    console.error('🚨 Global Error Boundary - Component Stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });

    // In production, you might want to send this to an error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
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
  /** Callback when error occurs */
  onError: PropTypes.func,
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
 * Hook for reporting errors to the global error boundary
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useErrorReporting = () => {
  const reportError = React.useCallback((error, context = {}) => {
    console.error('Error reported:', error, context);
    
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
