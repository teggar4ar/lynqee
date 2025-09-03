/**
 * ProfileSetup - Profile setup wizard page
 * 
 * This page guides new users through setting up their profile after registration.
 * Mobile-first design with clean, step-by-step interface.
 * 
 * Features:
 * - Username selection with real-time availability
 * - Profile information setup (name, bio)
 * - Mobile-optimized form design
 * - Cross-tab synchronization for profile creation
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import useAsync from '../hooks/useAsync.js';
import ProfileSetupWizard from '../components/profile/ProfileSetupWizard.jsx';
import { ProfileService } from '../services';
import { supabase } from '../services/supabase.js';
import { InitialLoading } from '../components/common/ModernLoading.jsx';


const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const { loading, error, execute } = useAsync();
  const subscriptionRef = useRef(null);

  // Set up real-time monitoring for profile creation in other tabs
  useEffect(() => {
    if (!user?.id) return;

    const setupProfileMonitoring = () => {
      if (subscriptionRef.current) return;

      // Set up real-time monitoring for profile creation
      const subscription = supabase
        .channel(`profile-setup-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (_payload) => {
            // Profile was created in another tab, redirect immediately
            navigate('/dashboard', { replace: true });
          }
        )
        .subscribe();

      subscriptionRef.current = subscription;
    };

    setupProfileMonitoring();

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        // Clean up real-time subscription
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, navigate]);

  // Check if user already has a profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!isAuthenticated || !user) {
        setCheckingProfile(false);
        return;
      }

      try {
        const hasProfile = await ProfileService.userHasProfile(user.id);
        if (hasProfile) {
          // User already has a profile, redirect to dashboard
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Failed to check existing profile:', error);
        // Continue with setup on error
      } finally {
        setCheckingProfile(false);
      }
    };

    if (!isLoading) {
      checkExistingProfile();
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  const handleProfileCreated = async (profileData) => {
    try {
      await execute(async () => {
        const newProfile = await ProfileService.createOrGetProfile({
          id: user.id,
          username: profileData.username,
          name: profileData.name || '',
          bio: profileData.bio || '',
          avatar_url: profileData.avatarUrl || null,
        });

        if (!newProfile.success) {
          throw new Error(newProfile.error || 'Failed to create profile');
        }

        // Update auth context to reflect profile creation
        if (updateUserProfile) {
          await updateUserProfile({ has_profile: true });
        }

        return newProfile;
      });

      // Redirect to dashboard after successful profile creation
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to create profile:', err);
    }
  };

  const handleSkipToStep = (step) => {
    setCurrentStep(step);
  };

  if (!user) {
    // Redirect to landing if not authenticated
    navigate('/', { replace: true });
    return null;
  }

  // Show loading while checking profile
  if (isLoading || checkingProfile) {
    return (
      <InitialLoading message="Setting up your profile..." />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:bg-white">
      {/* Mobile-first header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
        <h1 className="text-lg font-semibold text-gray-900 md:text-xl">
          Set up your profile
        </h1>
        <p className="text-sm text-gray-600 mt-1 md:text-base">
          Let's create your unique Lynqee page
        </p>
      </div>

      {/* Main content */}
      <div className="px-4 py-6 md:px-6 md:py-8 md:max-w-2xl md:mx-auto">
        <ProfileSetupWizard
          currentStep={currentStep}
          onStepChange={handleSkipToStep}
          onComplete={handleProfileCreated}
          loading={loading}
          error={error}
          userEmail={user.email}
        />
      </div>
    </div>
  );
};

export default ProfileSetup;
