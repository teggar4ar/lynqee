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
import { Avatar, Button } from '../common';

const ProfileQuickPreview = ({ 
  profile, 
  onEditProfile, 
  onViewPublicProfile,
  loading = false,
  className = '' 
}) => {
  if (!profile) {
    return null;
  }

  const getPublicProfileUrl = () => {
    return profile.username ? `/${profile.username}` : '';
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
                <svg 
                  className="w-4 h-4 md:w-5 md:h-5 text-golden-yellow" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-900 mb-0.5 md:mb-1">
                  Public Profile
                </p>
                <p className="text-xs md:text-sm text-gray-600 truncate">
                  {getPublicProfileUrl() || 'Set up your username first'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onViewPublicProfile}
              disabled={!profile.username}
              className="
                px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium
                bg-white/80 backdrop-blur-sm
                border-golden-yellow/50 text-golden-yellow
                hover:bg-golden-yellow/10 hover:border-golden-yellow
                transition-all duration-200
                min-w-[60px] md:min-w-[80px]
              "
            >
              View
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
  onViewPublicProfile: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

export default ProfileQuickPreview;
