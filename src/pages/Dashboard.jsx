/**
 * Dashboard - Protected dashboard page for authenticated users (UNIFIED)
 * 
 * Features:
 * - Protected route (requires authentication and profile)
 * - Mobile-first layout with bottom navigation
 * - Unified real-time data management
 * - Profile management
 * - Real-time stats and link preview
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useCurrentUserProfile } from '../hooks/useProfile.js';
import { useRealtimeDashboard } from '../hooks/useRealtimeDashboard.js';
import { Button, ErrorState, ProfileSetupGuard, ProtectedRoute } from '../components/common';
import { ProfileSettings } from '../components/profile';
import { DashboardLayout, DashboardStats, ProfileQuickPreview } from '../components/dashboard';
import { getErrorType } from '../utils/errorUtils';

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useCurrentUserProfile(user?.id);
  
  // Unified real-time dashboard data (replaces separate hooks)
  const { 
    links, 
    stats, 
    loading: dashboardLoading, 
    error: dashboardError, 
    isRealTimeConnected, 
    lastUpdated,
    refetch: refetchDashboard,
    hasLinks
  } = useRealtimeDashboard(user?.id);

  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const handleProfileUpdate = (_updatedProfile) => {
    refetchProfile();
    setShowProfileSettings(false);
  };

  const handleCancelProfileEdit = () => {
    setShowProfileSettings(false);
  };

  const handleViewPublicProfile = () => {
    if (profile?.username) {
      window.open(`/${profile.username}`, '_blank');
    }
  };

  // Refresh all dashboard data
  const handleRefreshData = () => {
    refetchProfile();
    refetchDashboard();
  };

  // Determine overall loading state
  const isLoading = profileLoading || dashboardLoading;
  
  // Determine if there are any errors
  const hasError = profileError || dashboardError;
  const primaryError = profileError || dashboardError;

  // Header actions for the dashboard layout
  const headerActions = showProfileSettings ? null : (
    <Button
      variant="outline"
      onClick={() => setShowProfileSettings(true)}
      disabled={isLoading}
      className="px-3 py-2 text-sm md:px-4 md:py-2"
    >
      Edit Profile
    </Button>
  );

  return (
    <ProtectedRoute>
      <ProfileSetupGuard>
        <DashboardLayout 
          title="Dashboard" 
          headerActions={headerActions}
        >
          {showProfileSettings && profile ? (
            <ProfileSettings
              profile={profile}
              onUpdate={handleProfileUpdate}
              onCancel={handleCancelProfileEdit}
            />
          ) : isLoading ? (
            <>
              {/* Loading state for profile */}
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              
              {/* Loading state for stats */}
              <DashboardStats loading={true} />
            </>
          ) : hasError ? (
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <ErrorState
                type={getErrorType(primaryError)}
                error={primaryError}
                onRetry={handleRefreshData}
                className="!p-4 !bg-white !border-red-200"
                context={{
                  operation: 'Load Dashboard Data',
                  component: 'Dashboard'
                }}
              />
            </div>
          ) : profile ? (
            <>
              {/* Profile Quick Preview */}
              <ProfileQuickPreview
                profile={profile}
                onEditProfile={() => setShowProfileSettings(true)}
                onViewPublicProfile={handleViewPublicProfile}
              />

              {/* Dashboard Stats - unified real-time data */}
              <DashboardStats 
                stats={stats}
                loading={dashboardLoading}
                showRealTimeIndicator={isRealTimeConnected}
              />

              {/* Links Preview - Real data from unified hook */}
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold text-gray-900 md:text-xl">
                      Your Links
                    </h2>
                    {isRealTimeConnected && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-600 hidden md:inline">Live</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    disabled={true}
                    className="px-3 py-2 text-sm opacity-50"
                  >
                    Add Link
                  </Button>
                </div>
                
                {dashboardLoading ? (
                  // Loading state for links
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : dashboardError ? (
                  // Error state for links
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Failed to load links
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {dashboardError}
                    </p>
                    <Button
                      variant="outline"
                      onClick={refetchDashboard}
                      className="px-4 py-2"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : hasLinks ? (
                  // Display actual links
                  <div className="space-y-3">
                    {links.slice(0, 3).map((link) => (
                      <div key={link.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {link.title}
                          </h3>
                          <p className="text-xs text-gray-600 truncate">
                            {link.url}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {links.length > 3 && (
                      <div className="text-center pt-2">
                        <span className="text-sm text-gray-600">
                          +{links.length - 3} more links
                        </span>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-gray-200">
                      <Button
                        variant="outline"
                        disabled={true}
                        className="w-full py-2 text-sm opacity-50"
                      >
                        Manage Links (Coming Soon)
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Empty state - no links yet
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No links yet
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                      Link management functionality will be available soon. You'll be able to add and organize your links here.
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Coming in Sprint 4.2
                    </div>
                  </div>
                )}
              </div>

              {/* Account Information - Compact Mobile Version */}
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 md:text-xl">
                    Account Details
                  </h2>
                  {lastUpdated && (
                    <span className="text-xs text-gray-500">
                      Updated {new Date(lastUpdated).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                {user && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">Email</span>
                      <span className="text-sm text-gray-600 break-all">{user.email}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">Member since</span>
                      <span className="text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2">
                      <span className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">Account status</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                        Active
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 text-center py-8">
              <p className="text-gray-600">Failed to load dashboard data. Please try refreshing the page.</p>
              <Button
                variant="outline"
                onClick={handleRefreshData}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}
        </DashboardLayout>
      </ProfileSetupGuard>
    </ProtectedRoute>
  );
};

export default Dashboard;
