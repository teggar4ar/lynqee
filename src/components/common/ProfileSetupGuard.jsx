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
import { useAppState } from '../../contexts/AppStateContext.jsx';
import { ProfileService } from '../../services';
import { InitialLoading } from './ModernLoading.jsx';

const ProfileSetupGuard = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { hasProfileData } = useAppState();
  const [profileCheckLoading, setProfileCheckLoading] = useState(!hasProfileData);
  const [hasProfile, setHasProfile] = useState(hasProfileData);

  useEffect(() => {
    let isMounted = true;

    const checkProfile = async () => {
      // If we already have profile data cached, no need to check again
      if (hasProfileData) {
        if (isMounted) {
          setHasProfile(true);
          setProfileCheckLoading(false);
        }
        return;
      }

      if (!isAuthenticated || !user) {
        if (isMounted) {
          setProfileCheckLoading(false);
        }
        return;
      }

      try {
        const userHasProfile = await ProfileService.userHasProfile(user.id);
        
        if (isMounted) {
          setHasProfile(userHasProfile);

          if (!userHasProfile) {
            navigate('/setup', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('[ProfileSetupGuard] Failed to check profile:', error);
        // On error, allow access by keeping hasProfile=true
        if (isMounted) {
          setHasProfile(true);
        }
      } finally {
        if (isMounted) {
          setProfileCheckLoading(false);
        }
      }
    };

    if (!isLoading) {
      checkProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, isLoading, hasProfileData, navigate]);

  // Show minimal loading only when absolutely necessary
  if (isLoading || (profileCheckLoading && !hasProfileData)) {
    return <InitialLoading message="Checking profile..." />;
  }

  // If not authenticated, let ProtectedRoute handle the redirect
  if (!isAuthenticated) {
    return children;
  }

  // If user doesn't have profile, we've already redirected to setup, show minimal loading
  if (!hasProfile) {
    return <InitialLoading message="Setting up your profile..." />;
  }

  // User has profile, render children
  return children;
};

ProfileSetupGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProfileSetupGuard;
