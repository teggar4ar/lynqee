/**
 * AvatarSelection - Avatar upload step for profile setup
 * 
 * Mobile-first component for selecting/uploading avatar during profile setup.
 * Second step in the profile setup wizard (after username, before profile info).
 * 
 * Features:
 * - Optional avatar upload
 * - Skip functionality for users who prefer initials
 * - Drag & drop support
 * - Mobile-optimized interface
 * - Error handling
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, AvatarUpload, Button, ErrorDisplay } from '../common';
import { RESPONSIVE_PATTERNS, TOUCH_SPACING, TOUCH_TARGETS } from '../../utils/mobileUtils';

const AvatarSelection = ({ 
  userId, 
  username, 
  initialAvatarUrl = null,
  onComplete, 
  loading = false 
}) => {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploadError, setUploadError] = useState('');

  const handleAvatarUpload = (newAvatarUrl) => {
    setAvatarUrl(newAvatarUrl);
    setUploadError('');
  };

  const handleUploadError = (error) => {
    setUploadError(error.message);
  };

  const handleContinue = () => {
    onComplete({ avatarUrl });
  };

  const handleSkip = () => {
    onComplete({ avatarUrl: null });
  };

  return (
    <div className="w-full">
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 md:text-xl md:mb-2">
          Add a profile photo
        </h2>
        <p className="text-sm text-gray-600 mb-1 md:text-base">
          Upload a photo to personalize your profile, or skip to use your initials.
        </p>
        <p className="text-xs text-gray-500 md:text-sm">
          You can always add or change this later.
        </p>
      </div>

      {/* Avatar Upload Component */}
      <div className="mb-6 md:mb-8">
        <AvatarUpload
          userId={userId}
          currentAvatarUrl={avatarUrl}
          fallbackText={username}
          onUploadComplete={handleAvatarUpload}
          onUploadError={handleUploadError}
          size="large"
          className="flex justify-center"
        />
      </div>

      {/* Error Display */}
      {uploadError && (
        <ErrorDisplay 
          error={uploadError} 
          className="mb-4" 
        />
      )}
      {/* Preview Section */}
      <div className={`mb-6 ${RESPONSIVE_PATTERNS.CONTAINER_PADDING} bg-gray-50 rounded-lg border border-gray-200`}>
        <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
          Profile Preview
        </p>
        <div className={`flex items-center ${TOUCH_SPACING.X_COMFORTABLE}`}>
          <Avatar
            src={avatarUrl}
            alt="Profile preview"
            fallbackText={username || ''}
            size="small"
            className="!w-12 !h-12 flex-shrink-0"
          />
          <div>
            <p className="font-medium text-gray-900">@{username}</p>
            <p className="text-sm text-gray-600">
              {avatarUrl ? 'Custom photo' : 'Default initials'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex flex-row ${TOUCH_SPACING.X_COMFORTABLE}`}>
        <Button
          type="button"
          variant="primary"
          onClick={handleContinue}
          disabled={loading}
          className={`flex-1 py-3 text-base ${TOUCH_TARGETS.MIN}`}
        >
          {loading ? 'Continuing...' : 'Continue'}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          onClick={handleSkip}
          disabled={loading}
          className={`flex-1 py-3 text-base ${TOUCH_TARGETS.MIN}`}
        >
          Skip for now
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 md:text-sm">
          {avatarUrl 
            ? 'Your photo will be visible on your public profile'
            : 'Your initials will be shown until you add a photo'
          }
        </p>
      </div>
    </div>
  );
};

AvatarSelection.propTypes = {
  /** User ID for avatar upload */
  userId: PropTypes.string.isRequired,
  /** Username for fallback initials */
  username: PropTypes.string.isRequired,
  /** Initial avatar URL if any */
  initialAvatarUrl: PropTypes.string,
  /** Callback when step is completed */
  onComplete: PropTypes.func.isRequired,
  /** Loading state */
  loading: PropTypes.bool,
};

export default AvatarSelection;
