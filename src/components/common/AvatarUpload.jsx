/**
 * AvatarUpload - Avatar upload component with drag & drop
 * 
 * Mobile-first avatar upload component with drag and drop functionality.
 * Features file validation, image preview, and upload progress.
 * 
 * Features:
 * - Touch-optimized file picker
 * - Drag & drop support for desktop
 * - Image preview with crop/resize
 * - Upload progress indicator
 * - Error handling and validation
 * - Fallback to initials when no image
 */

import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AvatarService } from '../../services';
import { TOUCH_SPACING, TOUCH_TARGETS } from '../../utils/mobileUtils';

const AvatarUpload = ({ 
  userId, 
  currentAvatarUrl = null, 
  fallbackText = '', 
  onUploadComplete, 
  onUploadError,
  className = '',
  size = 'large'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Size configuration - Mobile-first approach using design system
  const sizeConfig = {
    small: {
      avatar: 'w-16 h-16 md:w-20 md:h-20',
      text: 'text-sm md:text-base',
      instructions: 'text-xs md:text-sm',
      touchTarget: TOUCH_TARGETS.MIN
    },
    medium: {
      avatar: 'w-24 h-24 md:w-28 md:h-28',
      text: 'text-base md:text-lg',
      instructions: 'text-sm md:text-base',
      touchTarget: TOUCH_TARGETS.COMFORTABLE
    },
    large: {
      avatar: 'w-32 h-32 md:w-40 md:h-40',
      text: 'text-lg md:text-xl',
      instructions: 'text-sm md:text-base',
      touchTarget: TOUCH_TARGETS.LARGE
    }
  };

  const config = sizeConfig[size] || sizeConfig.large;

  // Get fallback initials
  const getInitials = () => {
    if (!fallbackText) return '?';
    return fallbackText
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (file) => {
    if (!file) return;

    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate file
      AvatarService.validateFile(file);

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Simulate upload progress (since we don't have real progress from Supabase)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload avatar
      const avatarUrl = await AvatarService.uploadAvatar(userId, file);
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Update preview with actual URL
      setPreviewUrl(avatarUrl);
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(avatarUrl);
      }

      // Clean up preview URL
      URL.revokeObjectURL(preview);

    } catch (err) {
      console.error('Avatar upload failed:', err);
      setError(err.message);
      setPreviewUrl(currentAvatarUrl); // Revert to original
      
      if (onUploadError) {
        onUploadError(err);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [userId, currentAvatarUrl, onUploadComplete, onUploadError]);

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Open file picker
  const openFilePicker = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    setError('');
    setIsUploading(true);

    try {
      await AvatarService.deleteAvatar(userId);
      setPreviewUrl(null);
      
      if (onUploadComplete) {
        onUploadComplete(null);
      }
    } catch (err) {
      console.error('Avatar removal failed:', err);
      setError(err.message);
      
      if (onUploadError) {
        onUploadError(err);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`${TOUCH_SPACING.COMFORTABLE} md:space-y-6 ${className}`}>
      {/* Avatar Preview - Mobile-first responsive with proper touch targets */}
      <div className={`flex flex-col items-center ${TOUCH_SPACING.COMFORTABLE} md:space-y-4`}>
        {/* Avatar Container Wrapper - for proper button positioning */}
        <div className="relative">
          <div
            className={`
              ${config.avatar}
              ${config.touchTarget}
              rounded-full
              border-2
              ${previewUrl ? 'border-solid border-gray-200' : 'border-dashed border-gray-300'}
              flex
              items-center
              justify-center
              overflow-hidden
              cursor-pointer
              transition-all
              duration-200
              ${isDragOver ? 'border-blue-500 bg-blue-50' : ''}
              ${isUploading ? 'opacity-75 cursor-not-allowed' : 'hover:border-gray-400'}
              relative
              group
              flex-shrink-0
            `}
            onClick={openFilePicker}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
          {/* Loading Overlay - Responsive sizing */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full z-10">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-white mx-auto mb-1"></div>
                <span className={`${config.instructions} font-medium`}>{uploadProgress}%</span>
              </div>
            </div>
          )}

          {/* Avatar or Placeholder */}
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center px-2">
              <span className={`${config.text} font-bold text-gray-400 block`}>
                {getInitials()}
              </span>
              <span className={`${config.instructions} text-gray-400 mt-1 block leading-tight`}>
                Tap to upload
              </span>
            </div>
          )}

          {/* Hover Overlay - Desktop only with responsive text */}
          <div className="absolute inset-0 bg-black bg-opacity-0 md:group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center rounded-full">
            <span className={`text-white ${config.instructions} opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 font-medium`}>
              {previewUrl ? 'Change' : 'Upload'}
            </span>
          </div>
          </div>

          {/* Remove Button - Clean white background with red icon */}
          {previewUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering file picker
                handleRemoveAvatar();
              }}
              disabled={isUploading}
              className="
                absolute -top-2 -right-2 
                w-8 h-8 md:w-9 md:h-9
                bg-white hover:bg-red-50 active:bg-red-100
                text-red-500 hover:text-red-600 active:text-red-700
                rounded-full
                border-2 border-red-200 hover:border-red-300 active:border-red-400
                shadow-lg hover:shadow-xl
                flex items-center justify-center
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                z-30
                group/btn
              "
              title="Remove photo"
              aria-label="Remove photo"
            >
              <svg 
                className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:scale-110 transition-transform duration-150" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                />
              </svg>
            </button>
          )}
        </div>

        {/* Upload Instructions - Mobile-optimized with responsive typography */}
        <div className="text-center px-4">
          <p className={`${config.instructions} text-gray-600 font-medium`}>
            {isDragOver ? 'Drop image here' : (
              <>
                <span className="md:hidden">Tap to upload a photo</span>
                <span className="hidden md:inline">Click to upload or drag & drop</span>
              </>
            )}
          </p>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            JPEG, PNG, WebP up to 1.5MB
          </p>
        </div>
      </div>

      {/* Error Message - Using responsive card pattern */}
      {error && (
        <div className="p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className={`${config.instructions} text-red-600 text-center font-medium`}>
            {error}
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};

AvatarUpload.propTypes = {
  /** User ID for avatar upload */
  userId: PropTypes.string.isRequired,
  /** Current avatar URL */
  currentAvatarUrl: PropTypes.string,
  /** Fallback text for initials */
  fallbackText: PropTypes.string,
  /** Callback when upload completes successfully */
  onUploadComplete: PropTypes.func,
  /** Callback when upload fails */
  onUploadError: PropTypes.func,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Size variant */
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default AvatarUpload;
