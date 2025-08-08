/**
 * Dashboard - Protected dashboard page for authenticated users
 * 
 * Features:
 * - Protected route (requires authentication and profile)
 * - Mobile-first layout
 * - Profile management
 * - Link management (future)
 * - Analytics (future)
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useCurrentUserProfile } from '../hooks/useProfile.js';
import { Button, ErrorState, ProfileSetupGuard, ProtectedRoute } from '../components/common';
import { ProfileSettings } from '../components/profile';
import { getErrorType } from '../utils/errorUtils';

const Dashboard = () => {
  const { user, signOut, isLoading } = useAuth();
  const { profile, loading: profileLoading, error: profileError, refetch } = useCurrentUserProfile(user?.id);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      // The AuthContext will handle the redirect after successful sign out
      // No need for manual window.location.href = '/'
    } catch (error) {
      console.error('[Dashboard] Sign out failed:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const handleProfileUpdate = (_updatedProfile) => {
    // Trigger a refetch to get the latest data from the server
    refetch();
    setShowProfileSettings(false);
  };

  const handleCancelProfileEdit = () => {
    setShowProfileSettings(false);
  };

  const getPublicProfileUrl = () => {
    return profile?.username ? `${window.location.origin}/${profile.username}` : '';
  };

  return (
    <ProtectedRoute>
      <ProfileSetupGuard>
        <div className="min-h-screen bg-gray-50">
        {/* Header - Mobile optimized */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3 flex justify-between items-center md:max-w-7xl md:mx-auto md:px-6 md:py-4">
            <h1 className="text-lg font-bold text-gray-900 md:text-xl">Dashboard</h1>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isLoading}
              className="px-3 py-2 text-sm md:px-4 md:py-2"
            >
              Sign Out
            </Button>
          </div>
        </header>

        {/* Main Content - Mobile optimized */}
        <main className="px-4 py-4 md:max-w-7xl md:mx-auto md:px-6 md:py-8">
          {showProfileSettings && profile ? (
            <div className="mb-4">
              <ProfileSettings
                profile={profile}
                onUpdate={handleProfileUpdate}
                onCancel={handleCancelProfileEdit}
              />
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {/* Profile Overview - Mobile first */}
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                <div className="flex flex-col space-y-3 mb-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 md:text-xl">
                    Your Profile
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowProfileSettings(true)}
                    disabled={profileLoading}
                    className="w-full py-3 text-base md:w-auto md:py-2 md:text-sm"
                  >
                    Edit Profile
                  </Button>
                </div>
                
                {profileLoading ? (
                  <div className="flex items-center space-x-3 py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 md:h-6 md:w-6"></div>
                    <span className="text-gray-600 text-sm md:text-base">Loading profile...</span>
                  </div>
                ) : profileError ? (
                  <div className="py-4">
                    <ErrorState
                      type={getErrorType(profileError)}
                      error={profileError}
                      onRetry={refetch}
                      className="!p-4 !bg-white !border-red-200"
                      context={{
                        operation: 'Load Profile',
                        component: 'Dashboard'
                      }}
                    />
                  </div>
                ) : profile ? (
                  <div className="space-y-4">
                    {/* Profile Info - Mobile optimized */}
                    <div className="flex items-start space-x-3 md:space-x-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 md:w-16 md:h-16">
                        <span className="text-lg font-medium text-gray-600 md:text-xl">
                          {(profile.name || profile.username)?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 truncate md:text-lg">
                          {profile.name || 'Add your name'}
                        </h3>
                        <p className="text-sm text-gray-600 md:text-base">@{profile.username}</p>
                        {profile.bio && (
                          <p className="text-sm text-gray-700 mt-1 md:text-base">{profile.bio}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Public Profile Link - Mobile optimized */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-medium text-blue-700 mb-2 md:text-sm md:mb-1">Your public profile:</p>
                      <a
                        href={getPublicProfileUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs underline break-all md:text-sm"
                      >
                        {getPublicProfileUrl()}
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 py-4">Failed to load profile.</p>
                )}
              </div>

              {/* Links Management - Mobile optimized */}
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 md:text-xl md:mb-4">
                  Your Links
                </h2>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2 text-sm md:text-base">Coming Soon</h3>
                  <p className="text-blue-800 text-xs md:text-sm">
                    Link management functionality will be available here soon.
                  </p>
                </div>
              </div>

              {/* Account Information - Mobile optimized */}
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 md:text-xl md:mb-4">
                  Account Information
                </h2>
                {user && (
                  <div className="space-y-2 md:space-y-3">
                    <div className="text-sm md:text-base">
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="text-gray-600 ml-2 break-all">{user.email}</span>
                    </div>
                    <div className="text-sm md:text-base">
                      <span className="font-medium text-gray-700">Account created:</span>
                      <span className="text-gray-600 ml-2">{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      </ProfileSetupGuard>
    </ProtectedRoute>
  );
};

export default Dashboard;
