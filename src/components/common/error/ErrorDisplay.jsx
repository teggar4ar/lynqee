import React from 'react';
import PropTypes from 'prop-types';

/**
 * ErrorDisplay Component
 * 
 * Universal inline error component for consistent error messaging.
 * Handles different error types (strings, Error objects) gracefully.
 * Mobile-first design with proper touch accessibility.
 * 
 * Usage:
 * <ErrorDisplay error="String error" />
 * <ErrorDisplay error={new Error("Error object")} />
 * <ErrorDisplay error={{ message: "Custom error object" }} />
 */
const ErrorDisplay = ({ 
  error, 
  className = '', 
  size = 'default',
  showIcon = false 
}) => {
  // Handle different error types and extract message
  const formatError = (error) => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return 'An unexpected error occurred';
  };

  const errorMessage = formatError(error);
  
  // Don't render if no error
  if (!errorMessage) return null;

  // Size configurations
  const sizeClasses = {
    small: 'text-xs p-2',
    default: 'text-sm p-3',
    large: 'text-base p-4'
  };

  const textSizeClass = sizeClasses[size] || sizeClasses.default;

  return (
    <div 
      className={`
        bg-red-50 
        border 
        border-red-200 
        rounded-lg 
        ${textSizeClass}
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start space-x-2">
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            <svg 
              className="w-4 h-4 text-red-500" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
        <p className="text-red-700 leading-relaxed">
          {errorMessage}
        </p>
      </div>
    </div>
  );
};

ErrorDisplay.propTypes = {
  /** Error to display - can be string, Error object, or object with message property */
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Error),
    PropTypes.shape({ 
      message: PropTypes.string 
    })
  ]),
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Size variant */
  size: PropTypes.oneOf(['small', 'default', 'large']),
  /** Whether to show error icon */
  showIcon: PropTypes.bool
};

export default ErrorDisplay;
