import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';
import { getUserFriendlyErrorMessage } from '../../../utils/errorUtils';

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
  // Handle different error types and extract message using errorUtils
  const formatError = (error) => {
    if (!error) return null;
    
    // Use getUserFriendlyErrorMessage for consistent error handling
    return getUserFriendlyErrorMessage(error);
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
        bg-coral-pink/20 
        border 
        border-coral-red/30 
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
            <AlertTriangle 
              className="w-4 h-4 text-coral-red" 
              aria-hidden="true"
            />
          </div>
        )}
        <p className="text-coral-red leading-relaxed">
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
