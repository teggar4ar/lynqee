/**
 * ProfileSettings - Profile editing interface
 * 
 * Mobile-first component for editing user profile information.
 * Allows users to update their display name, bio, and username.
 * 
 * Features:
 * - Edit display name and bio
 * - Username change with availability checking
 * - Mobile-optimized form design
 * - Real-time validation
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from '../common';
import { ProfileService } from '../../services';
import useAsync from '../../hooks/useAsync.js';
import { validateUsername } from '../../utils/validators.js';

const ProfileSettings = ({ profile, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    username: profile?.username || '',
  });
  
  const [originalUsername] = useState(profile?.username || '');
  const [errors, setErrors] = useState({});
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const { loading, error, execute } = useAsync();

  const BIO_MAX_LENGTH = 160;
  const NAME_MAX_LENGTH = 50;

  // Check username availability when it changes
  useEffect(() => {
    const checkAvailability = async () => {
      // Skip if username hasn't changed or is invalid
      if (formData.username === originalUsername || errors.username) {
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
  }, [formData.username, originalUsername, errors.username]);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Validate username on change
    if (field === 'username') {
      const validation = validateUsername(value);
      if (!validation.isValid) {
        setErrors(prev => ({
          ...prev,
          username: validation.error
        }));
      }
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
        newErrors.username = 'This username is not available';
      }
    }

    // Name validation
    if (formData.name && formData.name.length > NAME_MAX_LENGTH) {
      newErrors.name = `Name must be ${NAME_MAX_LENGTH} characters or less`;
    }

    // Bio validation
    if (formData.bio && formData.bio.length > BIO_MAX_LENGTH) {
      newErrors.bio = `Bio must be ${BIO_MAX_LENGTH} characters or less`;
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

        const updatedProfile = await ProfileService.updateProfile(profile.id, updates);
        onUpdate(updatedProfile);
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const hasChanges = 
    formData.name !== (profile?.name || '') ||
    formData.bio !== (profile?.bio || '') ||
    formData.username !== originalUsername;

  const canSubmit = hasChanges && 
    !loading && 
    !checkingUsername && 
    Object.keys(errors).length === 0 &&
    (formData.username === originalUsername || isUsernameAvailable === true);

  const getUsernameStatus = () => {
    if (formData.username === originalUsername) return null;
    if (checkingUsername) return { icon: '⏳', text: 'Checking...', color: 'text-yellow-600' };
    if (isUsernameAvailable === true) return { icon: '✅', text: 'Available', color: 'text-green-600' };
    if (isUsernameAvailable === false) return { icon: '❌', text: 'Not available', color: 'text-red-600' };
    return null;
  };

  const usernameStatus = getUsernameStatus();

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-4 md:p-6 md:max-w-md md:mx-auto">
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 md:text-xl md:mb-2">
          Edit Profile
        </h2>
        <p className="text-sm text-gray-600 md:text-base">
          Update your profile information and settings.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-4">
        <Input
          label="Display Name"
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          placeholder="Your full name"
          error={errors.name}
          className="text-base md:text-sm"
          maxLength={NAME_MAX_LENGTH}
        />

        <div>
          <Input
            label="Username"
            type="text"
            value={formData.username}
            onChange={handleInputChange('username')}
            placeholder="Your username"
            error={errors.username}
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
          <label className="block text-sm font-medium text-gray-700 mb-1 md:text-base">
            Bio
            <span className="text-gray-500 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            value={formData.bio}
            onChange={handleInputChange('bio')}
            placeholder="Tell people a little about yourself..."
            rows={3}
            maxLength={BIO_MAX_LENGTH}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base md:text-sm"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{errors.bio || ''}</span>
            <span>{formData.bio.length}/{BIO_MAX_LENGTH}</span>
          </div>
        </div>

        <div className="flex flex-col space-y-3 pt-2 md:flex-row md:space-y-0 md:space-x-3 md:pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={!canSubmit}
            className="w-full py-3 text-base md:flex-1 md:py-2 md:text-sm"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="w-full py-3 text-base md:flex-1 md:py-2 md:text-sm"
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
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ProfileSettings;
