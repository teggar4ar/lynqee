/**
 * ProfileSettings - Profile editing interface
 * 
 * Mobile-first component for editing user profile information.
 * Allows users to update their display name, bio, username, and avatar.
 * 
 * Features:
 * - Edit display name and bio
 * - Username change with availability checking
 * - Avatar upload and management
 * - Mobile-optimized form design
 * - Real-time validation
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AvatarUpload, Button, Input } from '../common';
import ErrorDisplay from '../common/error/ErrorDisplay.jsx';
import { ProfileService } from '../../services';
import { useAlerts, useAvatar } from '../../hooks';
import useAsync from '../../hooks/useAsync.js';
import { validateUsername } from '../../utils/validators.js';
import { SERVICE_ERROR_MESSAGES, VALIDATION_MESSAGES, formatMessage } from '../../constants/validationMessages';

const ProfileSettings = ({ profile, onUpdate, onCancel }) => {
  const { avatarUrl, updateAvatarUrl, refreshAvatar } = useAvatar(profile?.avatar_url);
  const { showSuccess } = useAlerts(); // Remove showError for inline-only validation
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    username: profile?.username || '',
  });
  
  const [originalUsername] = useState(profile?.username || '');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [avatarError, setAvatarError] = useState(null); // Add separate state for avatar errors
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const { loading, error, execute } = useAsync();

  const BIO_MAX_LENGTH = 160;
  const NAME_MAX_LENGTH = 50;

  // Check username availability when it changes
  useEffect(() => {
    const checkAvailability = async () => {
      // Skip if username hasn't changed
      if (formData.username === originalUsername) {
        setIsUsernameAvailable(null);
        return;
      }

      // Skip if username is clearly invalid (let validation handle it)
      const validation = validateUsername(formData.username);
      if (!validation.isValid) {
        setIsUsernameAvailable(null);
        return;
      }

      setCheckingUsername(true);
      try {
        const isAvailable = await ProfileService.isUsernameAvailable(formData.username);
        setIsUsernameAvailable(isAvailable);
      } catch (error) {
        console.error('Error checking username availability:', error);
        setIsUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username, originalUsername]);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Perform validation and set errors in one operation
    setErrors(prev => {
      const newErrors = { ...prev };
      
      // Remove any existing error for this field first
      delete newErrors[field];
      
      // Real-time validation for name field
      if (field === 'name' && value.length > NAME_MAX_LENGTH) {
        newErrors.name = VALIDATION_MESSAGES.PROFILE_NAME_TOO_LONG;
      }

      // Real-time validation for bio field  
      if (field === 'bio' && value.length > BIO_MAX_LENGTH) {
        newErrors.bio = formatMessage(VALIDATION_MESSAGES.PROFILE_BIO_TOO_LONG, BIO_MAX_LENGTH);
      }

      // Real-time validation for username
      if (field === 'username') {
        const validation = validateUsername(value);
        if (!validation.isValid) {
          newErrors.username = validation.error;
        }
      }
      
      return newErrors;
    });

    // For username, clear the availability state
    if (field === 'username') {
      setIsUsernameAvailable(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (formData.username !== originalUsername) {
      const validation = validateUsername(formData.username);
      if (!validation.isValid) {
        newErrors.username = validation.error;
      } else if (isUsernameAvailable === false) {
        newErrors.username = VALIDATION_MESSAGES.USERNAME_NOT_AVAILABLE;
      }
    }

    // Name validation
    if (formData.name && formData.name.length > NAME_MAX_LENGTH) {
      newErrors.name = VALIDATION_MESSAGES.PROFILE_NAME_TOO_LONG;
    }

    // Bio validation
    if (formData.bio && formData.bio.length > BIO_MAX_LENGTH) {
      newErrors.bio = formatMessage(VALIDATION_MESSAGES.PROFILE_BIO_TOO_LONG, BIO_MAX_LENGTH);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if username is still being validated
    if (formData.username !== originalUsername && checkingUsername) {
      return;
    }

    try {
      await execute(async () => {
        const updates = {
          name: formData.name,
          bio: formData.bio,
        };

        // Only include username if it changed
        if (formData.username !== originalUsername) {
          updates.username = formData.username;
        }

        // Include avatar_url in updates (it's managed by the avatar hook)
        updates.avatar_url = avatarUrl;

        const result = await ProfileService.updateProfile(profile.id, updates);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to update profile');
        }

        // Refresh avatar to ensure cache busting
        refreshAvatar();

        // Show success notification
        const changedFields = [];
        if (formData.name !== (profile?.name || '')) changedFields.push('display name');
        if (formData.bio !== (profile?.bio || '')) changedFields.push('bio');
        if (formData.username !== originalUsername) changedFields.push('username');
        if (avatarUrl !== (profile?.avatar_url || null)) changedFields.push('avatar');

        const successMessage = changedFields.length > 0 
          ? `Updated ${changedFields.join(', ')} successfully!`
          : 'Profile updated successfully!';

        showSuccess({
          title: 'Profile Updated',
          message: successMessage,
          duration: 3000,
          position: 'bottom-center'
        });
        
        onUpdate(result.data);
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Error handling is managed by useAsync hook
    }
  };

  // Handle avatar upload - update both local state and avatar hook
  const handleAvatarUpload = (newAvatarUrl) => {
    updateAvatarUrl(newAvatarUrl);
    setAvatarError(null); // Clear any previous avatar errors on successful upload
  };

  const handleAvatarError = (error) => {
    console.error('Avatar upload error:', error);
    const errorMessage = error.message || SERVICE_ERROR_MESSAGES.PROFILE.FAILED_UPLOAD;
    setAvatarError(errorMessage);
    
    // Keep inline error display only, no alert needed
  };

  const hasChanges = 
    formData.name !== (profile?.name || '') ||
    formData.bio !== (profile?.bio || '') ||
    formData.username !== originalUsername ||
    avatarUrl !== (profile?.avatar_url || null);

  // Determine if username change is valid
  const isUsernameChangeValid = formData.username === originalUsername || 
    (isUsernameAvailable === true && !errors.username);

  // Filter out empty string errors when counting
  const actualErrors = Object.fromEntries(
    Object.entries(errors).filter(([_key, value]) => value && value.trim() !== '')
  );

  const canSubmit = hasChanges && 
    !loading && 
    !checkingUsername && 
    Object.keys(actualErrors).length === 0 &&
    isUsernameChangeValid;

  const getUsernameStatus = () => {
    if (formData.username === originalUsername) return null;
    if (checkingUsername) return { icon: '⏳', text: 'Checking...', color: 'text-yellow-600' };
    if (isUsernameAvailable === true) return { icon: '✅', text: 'Available', color: 'text-green-600' };
    if (isUsernameAvailable === false) return { icon: '❌', text: 'Not available', color: 'text-red-600' };
    return null;
  };

  const usernameStatus = getUsernameStatus();

  return (
    <div className="w-full bg-white rounded-lg p-4 md:p-2 md:max-w-md md:mx-auto">
      {error && (
        <ErrorDisplay 
          error={error} 
          className="mb-4" 
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-4">
        {/* Avatar Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 md:text-base">
            Profile Photo
          </label>
          <AvatarUpload
            userId={profile.id}
            currentAvatarUrl={avatarUrl}
            fallbackText={formData.name || formData.username}
            onUploadComplete={handleAvatarUpload}
            onUploadError={handleAvatarError}
            size="medium"
          />
          {avatarError && (
            <ErrorDisplay 
              error={avatarError} 
              className="mt-2" 
            />
          )}
        </div>

        <Input
          label="Display Name"
          name="displayName"
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          placeholder="Your full name"
          error={errors.name}
          touched={touched.name}
          className="text-base md:text-sm"
        />

        <div>
          <Input
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange('username')}
            placeholder="Your username"
            error={errors.username}
            touched={touched.username}
            className="text-base md:text-sm"
            autoComplete="username"
          />
          
          {usernameStatus && (
            <div className={`mt-2 flex items-center text-sm ${usernameStatus.color}`}>
              <span className="mr-2">{usernameStatus.icon}</span>
              <span>{usernameStatus.text}</span>
            </div>
          )}
          
          {formData.username !== originalUsername && (
            <p className="mt-1 text-xs text-gray-500 md:text-sm">
              Your profile URL will be: lynqee.com/{formData.username}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="input-bio" className="block text-sm font-medium text-gray-700 mb-1 md:text-base">
            Bio
            <span className="text-gray-500 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            id="input-bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange('bio')}
            placeholder="Tell people a little about yourself..."
            rows={3}
            maxLength={BIO_MAX_LENGTH}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-yellow focus:border-golden-yellow resize-none text-base md:text-sm"
            style={{ minHeight: '44px' }}
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{errors.bio || ''}</span>
            <span>{formData.bio.length}/{BIO_MAX_LENGTH}</span>
          </div>
        </div>

        <div className="flex flex-row space-x-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={!canSubmit}
            className="flex-1 py-3 text-base min-h-[44px]"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 text-base min-h-[44px]"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

ProfileSettings.propTypes = {
  profile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    name: PropTypes.string,
    bio: PropTypes.string,
    avatar_url: PropTypes.string,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ProfileSettings;
