/**
 * ProfileInformation - Profile information setup step
 * 
 * Mobile-first component for collecting additional profile information.
 * Second step in the profile setup wizard.
 * 
 * Features:
 * - Name and bio collection
 * - Character limits with live feedback
 * - Mobile-optimized form design
 * - Optional fields with clear indication
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Button, Input } from '../common';

const ProfileInformation = ({ initialData, username, avatarUrl, onComplete, loading }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    bio: initialData.bio || '',
  });

  const [errors, setErrors] = useState({});

  const BIO_MAX_LENGTH = 160;

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
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation (optional but if provided, should be reasonable)
    if (formData.name && formData.name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }

    // Bio validation
    if (formData.bio && formData.bio.length > BIO_MAX_LENGTH) {
      newErrors.bio = `Bio must be ${BIO_MAX_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onComplete(formData);
    }
  };

  const handleSkip = () => {
    onComplete({ name: '', bio: '' });
  };

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 md:text-xl md:mb-2">
          Tell us about yourself
        </h2>
        <p className="text-sm text-gray-600 mb-1 md:text-base">
          Add your name and a short bio to personalize your profile.
        </p>
        <p className="text-xs text-gray-500 md:text-sm">
          These fields are optional and can be updated later.
        </p>
      </div>

      {/* Preview - Mobile optimized */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 md:mb-6 md:p-4">
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
          Preview
        </p>
        <div className="flex items-start space-x-3">
          <Avatar
            src={avatarUrl}
            alt="Profile preview"
            fallbackText={formData.name || username || ''}
            size="small"
            className="!w-10 !h-10 md:!w-12 md:!h-12 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate md:text-base">
              {formData.name || 'Your Name'}
            </h3>
            <p className="text-xs text-gray-600 md:text-sm">@{username}</p>
            {formData.bio && (
              <p className="text-xs text-gray-700 mt-1 md:text-sm md:text-base">{formData.bio}</p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
        <Input
          label="Display Name"
          name="displayName"
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          placeholder="Your full name"
          error={errors.name}
          className="text-base md:text-sm" // Mobile-friendly text size
          autoComplete="name"
        />

        <div>
          <label htmlFor="input-profile-bio" className="block text-sm font-medium text-gray-700 mb-1 md:text-base">
            Bio
            <span className="text-gray-500 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            id="input-profile-bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange('bio')}
            placeholder="Tell people a little about yourself..."
            rows={3}
            maxLength={BIO_MAX_LENGTH}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base md:text-sm"
            style={{ minHeight: '44px' }}
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{errors.bio || ''}</span>
            <span>{formData.bio.length}/{BIO_MAX_LENGTH}</span>
          </div>
        </div>

        <div className="flex flex-col space-y-2 pt-2 md:flex-row md:space-y-0 md:space-x-3 md:pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full py-3 text-base md:flex-1 md:py-2 md:text-sm" // Touch-friendly button
          >
            {loading ? 'Creating Profile...' : 'Create Profile'}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            disabled={loading}
            className="w-full py-3 text-base md:flex-1 md:py-2 md:text-sm"
          >
            Skip for now
          </Button>
        </div>
      </form>
    </div>
  );
};

ProfileInformation.propTypes = {
  initialData: PropTypes.shape({
    name: PropTypes.string,
    bio: PropTypes.string,
  }).isRequired,
  username: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  onComplete: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

ProfileInformation.defaultProps = {
  loading: false,
};

export default ProfileInformation;
