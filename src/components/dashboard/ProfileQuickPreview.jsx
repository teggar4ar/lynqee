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
import { Button } from '../common';

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

  const getInitials = () => {
    const name = profile.name || profile.username || '';
    return name.charAt(0).toUpperCase() || '?';
  };

  const getPublicProfileUrl = () => {
    return profile.username ? `/${profile.username}` : '';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 md:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 md:text-xl">
          Profile Overview
        </h2>
        {/* Edit button - visible on mobile, hidden on desktop (handled by header) */}
        <Button
          variant="outline"
          onClick={onEditProfile}
          disabled={loading}
          className="flex md:hidden px-3 py-2 text-sm"
        >
          Edit
        </Button>
      </div>

      <div className="space-y-4">
        {/* Profile Info - Optimized for mobile */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Avatar */}
          <div className="
            w-14 h-14 md:w-16 md:h-16 
            bg-gradient-to-br from-blue-400 to-blue-600 
            rounded-full flex items-center justify-center 
            flex-shrink-0 shadow-sm
          ">
            <span className="text-xl md:text-2xl font-semibold text-white">
              {getInitials()}
            </span>
          </div>

          {/* Profile Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-medium text-gray-900 truncate">
              {profile.name || 'Add your name'}
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              @{profile.username}
            </p>
            {profile.bio && (
              <p className="text-sm text-gray-700 mt-1 line-clamp-2 md:text-base">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions - Mobile optimized */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {/* Public Profile Link */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-700 mb-1 md:text-sm">
                  Public Profile
                </p>
                <p className="text-xs text-blue-600 truncate md:text-sm">
                  {getPublicProfileUrl()}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={onViewPublicProfile}
                className="
                  ml-2 px-3 py-2 text-xs text-blue-600 
                  hover:bg-blue-100 min-w-[44px] min-h-[44px]
                  md:text-sm
                "
                aria-label="View public profile"
              >
                View
              </Button>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 md:text-xl">
                0
              </p>
              <p className="text-xs text-gray-600 md:text-sm">
                Links
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Mobile-specific quick actions */}
        {/* <div className="flex flex-col space-y-2 md:hidden">
          <Button
            variant="outline"
            onClick={onViewPublicProfile}
            className="w-full py-3 text-base font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Public Profile
          </Button>
        </div> */}
      </div>
    </div>
  );
};

ProfileQuickPreview.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string,
    username: PropTypes.string.isRequired,
    bio: PropTypes.string,
  }),
  onEditProfile: PropTypes.func.isRequired,
  onViewPublicProfile: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

export default ProfileQuickPreview;
