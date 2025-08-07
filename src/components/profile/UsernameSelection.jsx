/**
 * UsernameSelection - Username selection with real-time availability
 * 
 * Mobile-first component for selecting a unique username.
 * Features real-time validation and availability checking.
 * 
 * Features:
 * - Real-time username availability checking
 * - Format validation (alphanumeric, hyphens, underscores)
 * - Mobile-optimized input design
 * - Visual feedback for availability status
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from '../common';
import { ProfileService } from '../../services';
import useAsync from '../../hooks/useAsync.js';
import { validateUsername } from '../../utils/validators.js';

const UsernameSelection = ({ initialUsername, onComplete, userEmail }) => {
  const [username, setUsername] = useState(initialUsername || '');
  const [validationError, setValidationError] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const { execute } = useAsync();

  // Debounced availability check
  const checkAvailability = useCallback(
    async (usernameToCheck) => {
      if (!usernameToCheck || validationError) {
        setIsAvailable(null);
        return;
      }

      setIsChecking(true);
      try {
        await execute(async () => {
          const isAvailable = await ProfileService.isUsernameAvailable(usernameToCheck);
          setIsAvailable(isAvailable);
        });
      } catch (error) {
        console.error('Error checking username availability:', error);
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    },
    [execute, validationError]
  );

  // Debounce availability checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username) {
        checkAvailability(username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, checkAvailability]);

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);

    // Validate format
    const validation = validateUsername(value);
    setValidationError(validation.error);
    
    if (!validation.isValid) {
      setIsAvailable(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateUsername(username);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    if (isAvailable === false) {
      setValidationError('This username is not available');
      return;
    }

    if (isAvailable === true) {
      onComplete({ username });
    }
  };

  const canProceed = username && !validationError && isAvailable === true && !isChecking;

  // Generate suggested username from email
  const suggestedUsername = userEmail ? userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : '';

  const getStatusIcon = () => {
    if (isChecking) return '⏳';
    if (isAvailable === true) return '✅';
    if (isAvailable === false) return '❌';
    return '';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking availability...';
    if (isAvailable === true) return 'Username is available!';
    if (isAvailable === false) return 'Username is taken';
    return '';
  };

  const getStatusColor = () => {
    if (isChecking) return 'text-yellow-600';
    if (isAvailable === true) return 'text-green-600';
    if (isAvailable === false) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 md:text-xl md:mb-2">
          Choose your username
        </h2>
        <p className="text-sm text-gray-600 mb-2 md:text-base">
          Your username will be part of your unique Lynqee URL:
        </p>
        <p className="text-sm font-medium text-blue-600 md:text-base">
          lynqee.com/<span className="bg-blue-50 px-1 rounded">{username || 'username'}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
        <div>
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter your username"
            error={validationError}
            className="text-base md:text-sm" // Mobile-friendly text size
            autoComplete="username"
            autoFocus
          />
          
          {/* Availability status */}
          {username && !validationError && (
            <div className={`mt-2 flex items-center text-sm ${getStatusColor()}`}>
              <span className="mr-2">{getStatusIcon()}</span>
              <span>{getStatusText()}</span>
            </div>
          )}
        </div>

        {/* Username requirements - Mobile optimized */}
        <div className="text-xs text-gray-500 md:text-sm">
          <p className="mb-1 font-medium">Username requirements:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-400 text-xs">
            <li>3-30 characters long</li>
            <li>Letters, numbers, hyphens, and underscores only</li>
            <li>Must start and end with a letter or number</li>
          </ul>
        </div>

        {/* Suggested username - Mobile optimized */}
        {suggestedUsername && suggestedUsername !== username && !username && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 mb-2 md:text-sm">Suggestion:</p>
            <button
              type="button"
              onClick={() => setUsername(suggestedUsername)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 underline md:text-sm"
            >
              Use "{suggestedUsername}"
            </button>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={!canProceed}
          className="w-full py-3 text-base md:py-2 md:text-sm" // Touch-friendly button
        >
          {isChecking ? 'Checking...' : 'Continue'}
        </Button>
      </form>
    </div>
  );
};

UsernameSelection.propTypes = {
  initialUsername: PropTypes.string,
  onComplete: PropTypes.func.isRequired,
  userEmail: PropTypes.string.isRequired,
};

UsernameSelection.defaultProps = {
  initialUsername: '',
};

export default UsernameSelection;
