/**
 * ProfileSetupWizard - Multi-step profile setup wizard
 * 
 * Mobile-first wizard component that guides users through profile creation.
 * Includes username selection, avatar upload, and profile information.
 * 
 * Features:
 * - Step-by-step interface
 * - Real-time username validation
 * - Avatar upload with drag & drop
 * - Touch-optimized inputs
 * - Progress indication
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth.js';
import UsernameSelection from './UsernameSelection.jsx';
import AvatarSelection from './AvatarSelection.jsx';
import ProfileInformation from './ProfileInformation.jsx';
import ErrorDisplay from '../common/error/ErrorDisplay.jsx';
import { Button } from '../common';

const ProfileSetupWizard = ({
  currentStep,
  onStepChange,
  onComplete,
  loading,
  error,
  userEmail,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    avatarUrl: null,
    name: '',
    bio: '',
  });

  const totalSteps = 3;

  const handleStepComplete = (stepData) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);

    if (currentStep < totalSteps) {
      onStepChange(currentStep + 1);
    } else {
      // Final step - create profile
      onComplete(updatedData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <UsernameSelection
            initialUsername={formData.username}
            onComplete={handleStepComplete}
            userEmail={userEmail}
          />
        );
      case 2:
        return (
          <AvatarSelection
            userId={user?.id}
            username={formData.username}
            initialAvatarUrl={formData.avatarUrl}
            onComplete={handleStepComplete}
            loading={loading}
          />
        );
      case 3:
        return (
          <ProfileInformation
            initialData={{
              name: formData.name,
              bio: formData.bio,
            }}
            username={formData.username}
            avatarUrl={formData.avatarUrl}
            onComplete={handleStepComplete}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress indicator - Mobile optimized */}
      <div className="mb-4 md:mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600 md:text-sm">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-xs text-gray-500 md:text-sm">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-golden-yellow h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Error display - Mobile optimized */}
      {error && (
        <ErrorDisplay 
          error={error} 
          className="mb-3 md:mb-4" 
        />
      )}

      {/* Current step content - Mobile optimized */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        {renderStep()}
      </div>

      {/* Navigation - Mobile optimized */}
      {currentStep > 1 && (
        <div className="mt-3 flex justify-start md:mt-4">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={loading}
            className="text-gray-600 hover:text-gray-800 py-2 px-3 text-sm md:py-2 md:px-4"
          >
            ← Previous step
          </Button>
        </div>
      )}
    </div>
  );
};

ProfileSetupWizard.propTypes = {
  currentStep: PropTypes.number.isRequired,
  onStepChange: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Error),
    PropTypes.shape({ 
      message: PropTypes.string 
    })
  ]),
  userEmail: PropTypes.string.isRequired,
};

ProfileSetupWizard.defaultProps = {
  loading: false,
  error: null,
};

export default ProfileSetupWizard;
