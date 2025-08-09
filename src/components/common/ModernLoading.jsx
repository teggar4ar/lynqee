/**
 * ModernLoading - Clean, modern loading components
 * 
 * Replaces full-screen loaders with subtle, progressive loading indicators.
 * Mobile-first design with smooth animations.
 */

import React from 'react';
import PropTypes from 'prop-types';

// Compact loading spinner for buttons and small spaces
export const CompactSpinner = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${sizeClasses[size]} ${className}`}
      aria-label="Loading"
    />
  );
};

CompactSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  className: PropTypes.string
};

// Refresh indicator for background updates
export const RefreshIndicator = ({ isVisible, className = '' }) => {
  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2 shadow-lg">
        <CompactSpinner size="xs" className="border-white border-t-blue-200" />
        <span>Updating...</span>
      </div>
    </div>
  );
};

RefreshIndicator.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  className: PropTypes.string
};

// Content skeleton for profile sections
export const ProfileSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
      </div>
      <div className="h-9 bg-gray-200 rounded w-20 animate-pulse" />
    </div>
    
    <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-2xl animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
      </div>
    </div>
  </div>
);

ProfileSkeleton.propTypes = {
  className: PropTypes.string
};

// Content skeleton for stats cards
export const StatsSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm p-4 md:p-6 ${className}`}>
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="text-center">
          <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

StatsSkeleton.propTypes = {
  className: PropTypes.string
};

// Content skeleton for link lists
export const LinksSkeleton = ({ count = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
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

// Minimal initial loading for first app load
export const InitialLoading = ({ message = 'Loading...', className = '' }) => (
  <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
    <div className="text-center">
      <CompactSpinner size="lg" className="mx-auto mb-4" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  </div>
);

InitialLoading.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string
};

export default {
  CompactSpinner,
  RefreshIndicator,
  ProfileSkeleton,
  StatsSkeleton,
  LinksSkeleton,
  InitialLoading
};
