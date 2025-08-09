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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
            Profile Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your public profile
          </p>
        </div>
        {/* Edit button - modern design */}
        <Button
          variant="outline"
          onClick={onEditProfile}
          disabled={loading}
          className="
            px-4 py-2 text-sm font-medium
            bg-gray-50 border-gray-200 text-gray-700
            hover:bg-gray-100 hover:border-gray-300
            transition-all duration-200
          "
        >
          Edit Profile
        </Button>
      </div>

      <div className="space-y-6">
        {/* Profile Info - Modern card design */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
          {/* Avatar */}
          <div className="
            w-16 h-16 md:w-20 md:h-20 
            bg-gradient-to-br from-blue-500 to-purple-600 
            rounded-2xl flex items-center justify-center 
            flex-shrink-0 shadow-lg
          ">
            <span className="text-xl md:text-2xl font-bold text-white">
              {getInitials()}
            </span>
          </div>

          {/* Profile Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
              {profile.name || 'Add your name'}
            </h3>
            <p className="text-base md:text-lg text-blue-600 font-medium">
              @{profile.username}
            </p>
            {profile.bio && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2 md:text-base leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Public Profile Action - Modern single card */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-blue-600" 
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
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Public Profile
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {getPublicProfileUrl() || 'Set up your username first'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onViewPublicProfile}
              disabled={!profile.username}
              className="
                px-4 py-2 text-sm font-medium
                bg-white/80 backdrop-blur-sm
                border-blue-200 text-blue-700
                hover:bg-blue-50 hover:border-blue-300
                transition-all duration-200
                min-w-[80px]
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
  }),
  onEditProfile: PropTypes.func.isRequired,
  onViewPublicProfile: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

export default ProfileQuickPreview;
