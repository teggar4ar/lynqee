import React from 'react';
import PropTypes from 'prop-types';
import { RESPONSIVE_PATTERNS } from '../../utils/mobileUtils';

/**
 * ProfileInfo Component
 * 
 * Displays user profile information including display name, username, and bio.
 * Features mobile-first responsive typography that scales beautifully across devices.
 * Supports multiple layout modes and size variants.
 */
const ProfileInfo = ({ 
  name, 
  username, 
  bio, 
  size = 'medium',
  layout = 'center',
  className = '' 
}) => {
  // Responsive typography configuration
  const sizeConfig = {
    small: {
      name: 'text-lg font-bold text-gray-900 sm:text-xl',
      username: name 
        ? 'text-gray-600 text-sm sm:text-base' 
        : 'text-lg font-bold text-gray-900 sm:text-xl',
      bio: 'text-sm text-gray-600 leading-relaxed'
    },
    medium: {
      name: 'text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl',
      username: name 
        ? 'text-gray-600 text-base sm:text-lg' 
        : 'text-xl font-bold text-gray-900 sm:text-2xl',
      bio: 'text-sm text-gray-600 leading-relaxed sm:text-base'
    },
    large: {
      name: 'text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl',
      username: name 
        ? 'text-gray-600 text-lg sm:text-xl' 
        : 'text-2xl font-bold text-gray-900 sm:text-3xl',
      bio: 'text-base text-gray-600 leading-relaxed sm:text-lg'
    }
  };

  // Layout configuration
  const layoutConfig = {
    center: 'text-center',
    left: 'text-left',
    compact: 'text-left'
  };

  // Bio constraints based on layout
  const bioConstraints = {
    center: 'max-w-xs mx-auto sm:max-w-sm md:max-w-md',
    left: 'max-w-sm',
    compact: 'max-w-xs'
  };

  const config = sizeConfig[size];
  const alignmentClass = layoutConfig[layout];
  const bioConstraint = bioConstraints[layout];

  return (
    <div className={`${alignmentClass} ${className}`}>
      {/* Display Name */}
      {name && (
        <h1 className={`${config.name} mb-1 ${layout === 'compact' ? 'truncate' : ''}`}>
          {name}
        </h1>
      )}
      
      {/* Username with conditional styling based on whether name exists */}
      <h2 className={`
        ${config.username}
        mb-2
        ${layout === 'compact' ? 'truncate' : ''}
      `}>
        @{username}
      </h2>
      
      {/* Bio with responsive constraints */}
      {bio && layout !== 'compact' && (
        <p className={`
          ${config.bio}
          ${bioConstraint}
        `}>
          {bio}
        </p>
      )}

      {/* Compact bio for minimal layouts */}
      {bio && layout === 'compact' && (
        <p className={`
          ${config.bio}
          ${bioConstraint}
          line-clamp-2
        `}>
          {bio}
        </p>
      )}

      {/* Profile metadata for larger layouts */}
      {size === 'large' && layout === 'center' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-50 rounded-full">
              📍 Member since 2024
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

ProfileInfo.propTypes = {
  /** User's display name (optional) */
  name: PropTypes.string,
  /** User's username (required) */
  username: PropTypes.string.isRequired,
  /** User's bio/description (optional) */
  bio: PropTypes.string,
  /** Size variant for responsive scaling */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Layout alignment */
  layout: PropTypes.oneOf(['center', 'left', 'compact']),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default ProfileInfo;
