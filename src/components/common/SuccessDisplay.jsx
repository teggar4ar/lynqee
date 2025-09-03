import React from 'react';
import PropTypes from 'prop-types';

/**
 * SuccessDisplay Component
 * 
 * Universal inline success component for consistent success messaging.
 * Handles different success types (strings, objects) gracefully.
 * Mobile-first design with proper touch accessibility.
 * 
 * Usage:
 * <SuccessDisplay message="String success" />
 * <SuccessDisplay message={{ message: "Custom success object" }} />
 */
const SuccessDisplay = ({ 
  message, 
  className = '', 
  size = 'default',
  showIcon = true 
}) => {
  // Handle different message types and extract content
  const formatMessage = (message) => {
    if (!message) return null;
    if (typeof message === 'string') return message;
    if (message.message) return message.message;
    return 'Operation completed successfully';
  };

  const successMessage = formatMessage(message);
  
  // Don't render if no message
  if (!successMessage) return null;

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
        bg-green-50 
        border 
        border-green-200 
        rounded-lg 
        ${textSizeClass}
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start space-x-2">
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            <svg 
              className="w-4 h-4 text-green-500" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
        <p className="text-green-700 leading-relaxed">
          {successMessage}
        </p>
      </div>
    </div>
  );
};

SuccessDisplay.propTypes = {
  /** Success message to display - can be string or object with message property */
  message: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ 
      message: PropTypes.string 
    })
  ]),
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Size variant */
  size: PropTypes.oneOf(['small', 'default', 'large']),
  /** Whether to show success icon */
  showIcon: PropTypes.bool
};

export default SuccessDisplay;
