/**
 * ProfileSetupWizard - Multi-step profile setup wizard
 * 
 * Mobile-first wizard component that guides users through profile creation.
 * Includes username selection with real-time availability checking.
 * 
 * Features:
 * - Step-by-step interface
 * - Real-time username validation
 * - Touch-optimized inputs
 * - Progress indication
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import UsernameSelection from './UsernameSelection.jsx';
import ProfileInformation from './ProfileInformation.jsx';
import { Button } from '../common';

const ProfileSetupWizard = ({
  currentStep,
  onStepChange,
  onComplete,
  loading,
  error,
  userEmail,
}) => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: '',
  });

  const totalSteps = 2;

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
          <ProfileInformation
            initialData={{
              name: formData.name,
              bio: formData.bio,
            }}
            username={formData.username}
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
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Error display - Mobile optimized */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg md:mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
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
  error: PropTypes.string,
  userEmail: PropTypes.string.isRequired,
};

ProfileSetupWizard.defaultProps = {
  loading: false,
  error: null,
};

export default ProfileSetupWizard;
