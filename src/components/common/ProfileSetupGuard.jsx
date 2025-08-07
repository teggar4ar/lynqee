/**
 * ProfileSetupGuard - HOC that redirects users to profile setup if needed
 * 
 * This component checks if the authenticated user has completed their profile setup.
 * If not, it redirects them to the profile setup wizard.
 * 
 * Used to wrap protected routes that require a complete profile.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth.js';
import { ProfileService } from '../../services';

const ProfileSetupGuard = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [profileCheckLoading, setProfileCheckLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    const checkProfile = async () => {
      if (!isAuthenticated || !user) {
        if (isMounted) {
          setProfileCheckLoading(false);
        }
        return;
      }

      try {
        const userHasProfile = await ProfileService.userHasProfile(user.id);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setHasProfile(userHasProfile);

          if (!userHasProfile) {
            // Redirect to profile setup
            navigate('/setup', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('[ProfileSetupGuard] Failed to check profile:', error);
        // On error, allow access but log the issue
      } finally {
        if (isMounted) {
          setProfileCheckLoading(false);
        }
      }
    };

    if (!isLoading) {
      checkProfile();
    }

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, isLoading, navigate]);

  // Show loading while checking authentication or profile
  if (isLoading || profileCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, let ProtectedRoute handle the redirect
  if (!isAuthenticated) {
    return children;
  }

  // If user doesn't have profile, we've already redirected to setup, show loading
  if (!hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  // User has profile, render children
  return children;
};

ProfileSetupGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProfileSetupGuard;
