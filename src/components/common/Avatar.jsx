import React from 'react';
import PropTypes from 'prop-types';
import { getCacheBustedAvatarUrl } from '../../utils/imageUtils.js';

/**
 * Avatar Component
 * 
 * A reusable avatar component with responsive sizing for different devices.
 * Supports both image avatars and fallback initials with cache busting.
 * Mobile-first design with touch-optimized sizing.
 */
const Avatar = ({ 
  src, 
  alt, 
  fallbackText = '', 
  size = 'medium',
  className = '',
  forceRefresh = false
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(null);

  // Define size variants with mobile-first approach
  const sizeClasses = {
    small: 'w-12 h-12 text-lg md:w-14 md:h-14 md:text-xl',
    medium: 'w-20 h-20 text-2xl md:w-24 md:h-24 md:text-3xl',
    large: 'w-32 h-32 text-4xl md:w-40 md:h-40 md:text-5xl'
  };

  // Get fallback initial (first character of fallbackText)
  const fallbackInitial = fallbackText ? fallbackText.charAt(0).toUpperCase() : '?';

  // Update src with cache busting when src changes or forceRefresh is true
  React.useEffect(() => {
    if (src) {
      setImageError(false);
      const cacheBustedSrc = forceRefresh ? getCacheBustedAvatarUrl(src) : src;
      setCurrentSrc(cacheBustedSrc);
    } else {
      setCurrentSrc(null);
    }
  }, [src, forceRefresh]);

  // Handle image loading error
  const handleImageError = React.useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div className={`
      ${sizeClasses[size]} 
      rounded-full 
      flex 
      items-center 
      justify-center 
      overflow-hidden 
      bg-gray-200 
      ${className}
    `}>
      {currentSrc && !imageError ? (
        <img 
          src={currentSrc} 
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <span className="font-bold text-gray-500 flex items-center justify-center w-full h-full">
          {fallbackInitial}
        </span>
      )}
    </div>
  );
};

Avatar.propTypes = {
  /** Source URL for the avatar image */
  src: PropTypes.string,
  /** Alt text for the avatar image */
  alt: PropTypes.string,
  /** Text to use for fallback initials (typically name or username) */
  fallbackText: PropTypes.string,
  /** Size variant of the avatar */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Force refresh of cached images */
  forceRefresh: PropTypes.bool,
};

export default Avatar;
