import React from 'react';
import PropTypes from 'prop-types';
import { ExternalLink } from 'lucide-react';
import Avatar from '../common/Avatar';
import ProfileInfo from './ProfileInfo';
import { RESPONSIVE_PATTERNS } from '../../utils/mobileUtils';

/**
 * ProfileHeader Component
 * 
 * Main profile header container optimized for mobile-first responsive design.
 * Combines avatar and profile information with touch-optimized layout and spacing.
 * Features responsive typography and spacing that scales from mobile to desktop.
 */
const ProfileHeader = ({ 
  profile, 
  username, 
  size = 'medium',
  showBio = true,
  layout = 'vertical',
  className = '' 
}) => {
  // Responsive sizing configuration
  const sizeConfig = {
    small: {
      container: 'py-4 px-4 sm:px-6',
      spacing: 'space-y-3',
      avatar: 'small'
    },
    medium: {
      container: 'py-6 px-4 sm:px-6 md:py-8 md:px-8',
      spacing: 'space-y-4 sm:space-y-5',
      avatar: 'medium'
    },
    large: {
      container: 'py-8 px-4 sm:px-6 md:py-12 md:px-8',
      spacing: 'space-y-5 sm:space-y-6',
      avatar: 'large'
    }
  };

  const config = sizeConfig[size];

  // Layout configuration
  const layoutClasses = {
    vertical: 'text-center',
    horizontal: 'flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 sm:text-left',
    minimal: 'flex items-center space-x-4'
  };

  return (
    <header className={`
      ${config.container}
      ${layoutClasses[layout]}
      ${className}
    `}>
      
      {layout === 'minimal' ? (
        <>
          {/* Minimal horizontal layout for compact spaces */}
          <Avatar
            src={profile?.avatar_url}
            alt={`${profile?.display_name || profile?.name || username}'s avatar`}
            fallbackText={profile?.display_name || profile?.name || username}
            size="small"
            className="flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <ProfileInfo
              name={profile?.display_name || profile?.name}
              username={username}
              bio={showBio ? profile?.bio : null}
              layout="compact"
            />
          </div>
        </>
      ) : (
        <>
          {/* Standard vertical or horizontal layouts */}
          <div className={layout === 'horizontal' ? 'flex-shrink-0' : 'mb-4 sm:mb-5'}>
            <Avatar
              src={profile?.avatar_url}
              alt={`${profile?.display_name || profile?.name || username}'s avatar`}
              fallbackText={profile?.display_name || profile?.name || username}
              size={config.avatar}
              className={layout === 'vertical' ? 'mx-auto' : ''}
            />
          </div>
          
          <div className={layout === 'horizontal' ? 'min-w-0 flex-1' : ''}>
            <ProfileInfo
              name={profile?.display_name || profile?.name}
              username={username}
              bio={showBio ? profile?.bio : null}
              size={size}
              layout={layout === 'horizontal' ? 'left' : 'center'}
            />
          </div>
        </>
      )}

      {/* Optional profile metadata */}
      {profile?.website && (
        <div className="mt-4 sm:mt-5">
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              ${RESPONSIVE_PATTERNS.BUTTON}
              bg-gray-100 
              text-gray-700 
              hover:bg-gray-200 
              focus:ring-gray-500
              text-sm
              inline-flex
              items-center
              space-x-2
            `}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Visit Website</span>
          </a>
        </div>
      )}
    </header>
  );
};

ProfileHeader.propTypes = {
  /** Profile data object containing name, bio, avatar_url, etc. */
  profile: PropTypes.shape({
    name: PropTypes.string,
    display_name: PropTypes.string,
    bio: PropTypes.string,
    avatar_url: PropTypes.string,
    website: PropTypes.string,
  }),
  /** Username (required, used as fallback if profile.name is not available) */
  username: PropTypes.string.isRequired,
  /** Size variant for responsive scaling */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Whether to show bio text */
  showBio: PropTypes.bool,
  /** Layout variant */
  layout: PropTypes.oneOf(['vertical', 'horizontal', 'minimal']),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default ProfileHeader;
