import React from 'react';
import PropTypes from 'prop-types';

/**
 * LoadingSpinner Component
 * 
 * A reusable loading component with various styles including skeleton loaders.
 * Mobile-optimized with proper spacing and touch-friendly design.
 */
const LoadingSpinner = ({ 
  type = 'spinner', 
  size = 'medium',
  className = '',
  message = ''
}) => {
  // Define size variants
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  if (type === 'profile-skeleton') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white min-h-screen md:max-w-lg md:my-8 md:rounded-lg md:shadow-sm">
          {/* Profile header skeleton */}
          <div className="px-4 py-6 text-center border-b border-gray-100 md:px-6 md:py-8">
            {/* Avatar skeleton */}
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full animate-pulse md:w-24 md:h-24"></div>
            {/* Name skeleton */}
            <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
            {/* Bio skeleton */}
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
          </div>
          {/* Links skeleton */}
          <div className="px-4 py-6 md:px-6">
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'links-skeleton') {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        border-2 
        border-gray-300 
        border-t-blue-500 
        rounded-full 
        animate-spin
      `}></div>
      {message && (
        <span className="ml-2 text-sm text-gray-600">{message}</span>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  /** Type of loading indicator */
  type: PropTypes.oneOf(['spinner', 'profile-skeleton', 'links-skeleton']),
  /** Size of the spinner */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Optional loading message */
  message: PropTypes.string,
};

export default LoadingSpinner;
