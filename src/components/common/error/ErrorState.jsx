import React from 'react';
import PropTypes from 'prop-types';
import { RESPONSIVE_PATTERNS, TOUCH_TARGETS } from '../../../utils/mobileUtils';

/**
 * ErrorState Component
 * 
 * Reusable error state component for different error scenarios.
 * Mobile-first design with touch-optimized retry actions.
 * Provides consistent error handling UI across the application.
 */
const ErrorState = ({
  type = 'general',
  error = null,
  onRetry = null,
  title = null,
  message = null,
  showRetry = true,
  className = ''
}) => {
  // Error type configurations
  const errorTypes = {
    general: {
      icon: '⚠️',
      defaultTitle: 'Something went wrong',
      defaultMessage: 'An unexpected error occurred. Please try again.',
      retryText: 'Try Again'
    },
    network: {
      icon: '📡',
      defaultTitle: 'Connection Error',
      defaultMessage: 'Unable to connect to the server. Please check your internet connection.',
      retryText: 'Retry Connection'
    },
    notFound: {
      icon: '🔍',
      defaultTitle: 'Not Found',
      defaultMessage: 'The content you\'re looking for doesn\'t exist.',
      retryText: 'Go Back'
    },
    profileNotFound: {
      icon: '👤',
      defaultTitle: 'Profile Not Found',
      defaultMessage: 'This user profile doesn\'t exist or has been removed.',
      retryText: 'Search Again'
    },
    linksError: {
      icon: '🔗',
      defaultTitle: 'Failed to Load Links',
      defaultMessage: 'Unable to load links at the moment.',
      retryText: 'Retry Loading'
    },
    unauthorized: {
      icon: '🔒',
      defaultTitle: 'Access Denied',
      defaultMessage: 'You don\'t have permission to view this content.',
      retryText: 'Sign In'
    },
    rateLimit: {
      icon: '⏰',
      defaultTitle: 'Too Many Requests',
      defaultMessage: 'Please wait a moment before trying again.',
      retryText: 'Try Later'
    },
    maintenance: {
      icon: '🔧',
      defaultTitle: 'Under Maintenance',
      defaultMessage: 'We\'re performing maintenance. Please try again later.',
      retryText: 'Check Status'
    }
  };

  const config = errorTypes[type] || errorTypes.general;
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || error?.message || config.defaultMessage;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (type === 'notFound' || type === 'profileNotFound') {
      window.history.back();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={`
      ${RESPONSIVE_PATTERNS.CONTAINER}
      text-center 
      space-y-6
      py-12
      sm:py-16
      md:py-20
      ${className}
    `}>
      
      {/* Error Icon */}
      <div className="text-5xl sm:text-6xl md:text-7xl">
        {config.icon}
      </div>
      
      {/* Error Content */}
      <div className="space-y-3 sm:space-y-4">
        <h1 className={`
          ${RESPONSIVE_PATTERNS.HEADING}
          text-red-600
        `}>
          {displayTitle}
        </h1>
        
        <p className={`
          ${RESPONSIVE_PATTERNS.BODY}
          text-red-500
          max-w-md
          mx-auto
        `}>
          {displayMessage}
        </p>
        
  {/* Technical error details (development only) */}
  {import.meta.env.DEV && error?.stack && (
          <details className="text-left max-w-lg mx-auto mt-4">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              Technical Details (Dev Only)
            </summary>
            <pre className="text-xs text-gray-400 mt-2 p-2 bg-gray-100 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
      
      {/* Action Buttons */}
      {showRetry && (
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center">
          <button
            onClick={handleRetry}
            className={`
              ${RESPONSIVE_PATTERNS.BUTTON}
              ${TOUCH_TARGETS.COMFORTABLE}
              bg-red-600 
              text-white 
              hover:bg-red-700 
              focus:ring-red-500
            `}
            aria-label={config.retryText}
          >
            {config.retryText}
          </button>
          
          {/* Secondary action */}
          {type !== 'notFound' && type !== 'profileNotFound' && (
            <button
              onClick={() => window.location.href = '/'}
              className={`
                ${RESPONSIVE_PATTERNS.BUTTON}
                ${TOUCH_TARGETS.COMFORTABLE}
                bg-gray-200 
                text-gray-700 
                hover:bg-gray-300 
                focus:ring-gray-500
              `}
            >
              Go Home
            </button>
          )}
        </div>
      )}
      
      {/* Additional Help Text */}
      <div className="pt-4 border-t border-gray-100 max-w-md mx-auto">
        <p className="text-xs text-gray-400 sm:text-sm">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
};

ErrorState.propTypes = {
  /** Type of error to display */
  type: PropTypes.oneOf([
    'general',
    'network',
    'notFound',
    'profileNotFound',
    'linksError',
    'unauthorized',
    'rateLimit',
    'maintenance'
  ]),
  /** Error object with message and stack trace */
  error: PropTypes.shape({
    message: PropTypes.string,
    stack: PropTypes.string
  }),
  /** Custom retry handler function */
  onRetry: PropTypes.func,
  /** Custom title to override default */
  title: PropTypes.string,
  /** Custom message to override default */
  message: PropTypes.string,
  /** Whether to show retry button */
  showRetry: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default ErrorState;
