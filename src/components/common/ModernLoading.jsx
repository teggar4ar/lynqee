/**
 * ModernLoading - Clean, modern loading components
 *
 * Replaces full-screen loaders with subtle, progressive loading indicators.
 * Mobile-first design with smooth animations and improved accessibility.
 */

import React from 'react';
import PropTypes from 'prop-types';

// Modern loading spinner with gradient and smooth animation
export const CompactSpinner = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer ring with gradient */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-golden-yellow via-amber-400 to-golden-yellow animate-spin opacity-75"></div>
      {/* Inner ring */}
      <div className="absolute inset-1 rounded-full bg-white"></div>
      {/* Center dot */}
      <div className="absolute inset-1/2 w-1 h-1 -m-0.5 bg-golden-yellow rounded-full animate-pulse"></div>
      <span className="sr-only">Loading</span>
    </div>
  );
};

CompactSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  className: PropTypes.string
};

// Enhanced refresh indicator with better contrast and modern design
export const RefreshIndicator = ({ isVisible, className = '' }) => {
  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300 ${className}`}>
      <div className="bg-gradient-to-r from-golden-yellow to-amber-500 text-deep-forest px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 shadow-lg border border-golden-yellow/20 backdrop-blur-sm">
        <CompactSpinner size="xs" />
        <span className="font-semibold">Updating...</span>
      </div>
    </div>
  );
};

RefreshIndicator.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  className: PropTypes.string
};

// Shimmer effect component for skeleton loaders
const Shimmer = ({ className = '' }) => (
  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer ${className}`} />
);

// Enhanced profile skeleton with shimmer effect
export const ProfileSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden ${className}`}>
    <Shimmer />
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="h-6 bg-gray-200 rounded-lg w-32 mb-2" />
        <div className="h-4 bg-gray-200 rounded-lg w-24" />
      </div>
      <div className="h-9 bg-gray-200 rounded-lg w-20" />
    </div>

    <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-200 rounded-lg w-1/2" />
        <div className="h-4 bg-gray-200 rounded-lg w-full" />
      </div>
    </div>
  </div>
);

ProfileSkeleton.propTypes = {
  className: PropTypes.string
};

// Enhanced stats skeleton with modern card design
export const StatsSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 relative overflow-hidden ${className}`}>
    <Shimmer />
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="text-center p-3 rounded-lg bg-gray-50/50">
          <div className="h-8 bg-gray-200 rounded-lg w-12 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded-lg w-16 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

StatsSkeleton.propTypes = {
  className: PropTypes.string
};

// Enhanced links skeleton with card-based design
export const LinksSkeleton = ({ count = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 relative overflow-hidden shadow-sm">
        <Shimmer />
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
            <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

LinksSkeleton.propTypes = {
  count: PropTypes.number,
  className: PropTypes.string
};

// Modern initial loading with gradient background and enhanced animation
export const InitialLoading = ({ message = 'Loading...', className = '' }) => (
  <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 ${className}`}>
    <div className="text-center space-y-6">
      {/* Animated logo/icon placeholder */}
      <div className="relative">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-golden-yellow to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
          <CompactSpinner size="md" className="text-white" />
        </div>
        {/* Pulsing ring effect */}
        <div className="absolute inset-0 w-16 h-16 mx-auto bg-golden-yellow rounded-2xl animate-ping opacity-20"></div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">Welcome to Lynqee</h2>
        <p className="text-gray-600 text-sm animate-pulse">{message}</p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center space-x-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 bg-golden-yellow rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

InitialLoading.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string
};

// Loading overlay for modal or section loading
export const LoadingOverlay = ({ isVisible, message = 'Loading...', className = '' }) => {
  if (!isVisible) return null;

  return (
    <div className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg ${className}`}>
      <div className="text-center space-y-3">
        <CompactSpinner size="md" />
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

LoadingOverlay.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  message: PropTypes.string,
  className: PropTypes.string
};

// Button loading state
export const ButtonLoader = ({ size = 'sm', className = '' }) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <CompactSpinner size={size} />
    <span className="text-sm font-medium">Loading...</span>
  </div>
);

ButtonLoader.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  className: PropTypes.string
};

export default {
  CompactSpinner,
  RefreshIndicator,
  ProfileSkeleton,
  StatsSkeleton,
  LinksSkeleton,
  InitialLoading,
  LoadingOverlay,
  ButtonLoader
};
