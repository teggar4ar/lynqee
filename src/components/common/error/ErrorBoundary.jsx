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
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
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
