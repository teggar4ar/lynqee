import React from 'react';
import PropTypes from 'prop-types';
import { RESPONSIVE_PATTERNS } from '../../utils/mobileUtils';

/**
 * SkeletonLoader Component
 * 
 * Reusable skeleton loading component for different content types.
 * Provides smooth loading animations while content is being fetched.
 * Mobile-first responsive design with proper accessibility.
 */
const SkeletonLoader = ({ 
  type = 'default',
  count = 1,
  animate = true,
  className = ''
}) => {
  const skeletonTypes = {
    // Default rectangular skeleton
    default: {
      container: 'space-y-3',
      item: 'h-4 bg-gray-200 rounded'
    },
    
    // Profile header skeleton
    profileHeader: {
      container: `${RESPONSIVE_PATTERNS.CARD} text-center space-y-4`,
      item: ''
    },
    
    // Link card skeleton
    linkCard: {
      container: 'space-y-3 sm:space-y-4',
      item: `${RESPONSIVE_PATTERNS.CARD} min-h-16 sm:min-h-20`
    },
    
    // Profile info skeleton
    profileInfo: {
      container: 'text-center space-y-3',
      item: ''
    },
    
    // Link list skeleton
    linkList: {
      container: 'space-y-3 sm:space-y-4',
      item: ''
    },
    
    // Avatar skeleton
    avatar: {
      container: '',
      item: 'rounded-full bg-gray-200'
    },
    
    // Text lines skeleton
    text: {
      container: 'space-y-2',
      item: 'h-4 bg-gray-200 rounded'
    }
  };

  const config = skeletonTypes[type] || skeletonTypes.default;
  const animationClass = animate ? 'animate-pulse' : '';

  // Render specific skeleton types
  const renderSkeleton = () => {
    switch (type) {
      case 'profileHeader':
        return (
          <div className={`${config.container} ${animationClass}`}>
            {/* Avatar skeleton */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full"></div>
            </div>
            
            {/* Name skeleton */}
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-32 mx-auto sm:h-7 sm:w-40"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto sm:h-5 sm:w-28"></div>
            </div>
            
            {/* Bio skeleton */}
            <div className="space-y-2 max-w-xs mx-auto">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5 mx-auto"></div>
            </div>
          </div>
        );

      case 'linkCard':
        return (
          <div className={`${config.container}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div 
                key={index} 
                className={`${config.item} ${animationClass}`}
              >
                <div className="flex items-center space-x-3 p-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'profileInfo':
        return (
          <div className={`${config.container} ${animationClass}`}>
            <div className="h-6 bg-gray-200 rounded w-32 mx-auto sm:h-7 sm:w-40"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mx-auto sm:h-5 sm:w-28"></div>
            <div className="space-y-2 max-w-xs mx-auto">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5 mx-auto"></div>
            </div>
          </div>
        );

      case 'avatar':
        return (
          <div className={`${config.item} ${animationClass}`} style={{
            width: count || '2.5rem',
            height: count || '2.5rem'
          }}></div>
        );

      case 'text':
        return (
          <div className={`${config.container} ${animationClass}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div 
                key={index}
                className={`${config.item}`}
                style={{
                  width: index === count - 1 ? '75%' : '100%'
                }}
              ></div>
            ))}
          </div>
        );

      case 'linkList':
        return (
          <div className={config.container}>
            {Array.from({ length: count }).map((_, index) => (
              <div 
                key={index}
                className={`${RESPONSIVE_PATTERNS.CARD} min-h-16 sm:min-h-20 ${animationClass}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className={`${config.container} ${animationClass}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className={config.item}></div>
            ))}
          </div>
        );
    }
  };

  return (
    <div 
      className={className}
      role="status"
      aria-label="Loading content"
      aria-live="polite"
    >
      {renderSkeleton()}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

SkeletonLoader.propTypes = {
  /** Type of skeleton to render */
  type: PropTypes.oneOf([
    'default',
    'profileHeader', 
    'linkCard',
    'profileInfo',
    'linkList',
    'avatar',
    'text'
  ]),
  /** Number of skeleton items to render */
  count: PropTypes.number,
  /** Whether to animate the skeleton */
  animate: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default SkeletonLoader;
