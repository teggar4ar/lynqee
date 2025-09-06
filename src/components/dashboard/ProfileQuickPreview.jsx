/**
 * ProfileQuickPreview - Mobile-optimized profile preview component
 * 
 * Features:
 * - Compact design for mobile screens
 * - Touch-optimized buttons
 * - Quick access to profile actions
 * - Responsive layout
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Copy, ExternalLink } from 'lucide-react';
import { Avatar, Button } from '../common';
import { useAlerts } from '../../hooks';

const ProfileQuickPreview = ({ 
  profile, 
  onEditProfile, 
  loading = false,
  className = '' 
}) => {
  const { showSuccess, showError } = useAlerts();

  if (!profile) {
    return null;
  }

  const getPublicProfileUrl = () => {
    return profile.username ? `${window.location.origin}/${profile.username}` : '';
  };

  const getDisplayPath = () => {
    return profile.username ? `/${profile.username}` : '';
  };

  const handleCopyProfileUrl = async () => {
    const url = getPublicProfileUrl();
    if (!url) {
      showError({
        title: 'No Profile URL',
        message: 'Please set up your username first to copy your profile URL.',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      showSuccess({
        title: 'Copied!',
        message: 'Profile URL copied to clipboard',
      });
    } catch (error) {
      console.error('Failed to copy URL:', error);
      showError({
        title: 'Copy Failed',
        message: 'Could not copy URL to clipboard. Please try again.',
      });
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8 ${className}`}>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-gray-900">
            Profile Overview
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Manage your public profile
          </p>
        </div>
        {/* Edit button - modern design */}
        <Button
          variant="outline"
          onClick={onEditProfile}
          disabled={loading}
          className="
            px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium
            bg-gray-50 border-gray-200 text-gray-700
            hover:bg-gray-100 hover:border-gray-300
            transition-all duration-200
          "
        >
          Edit Profile
        </Button>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Profile Info - Modern card design */}
        <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50/50 rounded-xl border border-gray-100">
          {/* Avatar */}
          <Avatar
            src={profile.avatar_url}
            alt={`${profile.name || profile.username}'s avatar`}
            fallbackText={profile.name || profile.username || ''}
            size="medium"
            className="flex-shrink-0 shadow-lg !rounded-2xl !w-12 !h-12 md:!w-20 md:!h-20"
            forceRefresh={false}
          />

          {/* Profile Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-xl font-semibold text-gray-900 truncate">
              {profile.name || 'Add your name'}
            </h3>
            <p className="text-sm md:text-lg text-golden-yellow font-medium">
              @{profile.username}
            </p>
            {profile.bio && (
              <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2 line-clamp-2 leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Public Profile Action - Modern single card */}
        <div className="p-3 md:p-4 bg-gradient-to-r from-mint-cream to-golden-yellow/10 rounded-xl border border-golden-yellow/30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-golden-yellow/20 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-4 h-4 md:w-5 md:h-5 text-golden-yellow" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-900 mb-0.5 md:mb-1">
                  Public Profile URL
                </p>
                <p className="text-xs md:text-sm text-gray-600 truncate">
                  {getDisplayPath() || 'Set up your username first'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleCopyProfileUrl}
              disabled={!profile.username}
              aria-label="Copy profile URL"
              className="
                p-4 md:p-3
                bg-white/80 backdrop-blur-sm
                border-golden-yellow/50 text-golden-yellow
                hover:bg-golden-yellow/10 hover:border-golden-yellow
                transition-all duration-200
                w-12 h-12 md:w-10 md:h-10
              "
            >
              <Copy className="w-4 h-4 md:w-5 md:h-5 text-golden-yellow" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

ProfileQuickPreview.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string,
    username: PropTypes.string.isRequired,
    bio: PropTypes.string,
    avatar_url: PropTypes.string,
  }),
  onEditProfile: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

export default ProfileQuickPreview;
