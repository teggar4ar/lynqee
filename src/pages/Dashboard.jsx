/**
 * Dashboard - Protected dashboard page for authenticated users (UNIFIED)
 * 
 * Features:
 * - Protected route (requires authentication and profile)
 * - Mobile-first layout with bottom navigation
 * - Progressive data loading
 * - Profile management
 * - Real-time stats and link preview
 * - Link management (add, edit, delete)
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useUserProfile } from '../hooks/useUserProfile.js';
import { useUserLinks } from '../hooks/useUserLinks.js';
import { useDashboard } from '../contexts/DashboardContext.jsx';
import { Button, ErrorState, ProfileSetupGuard, ProtectedRoute } from '../components/common';
import { ProfileSkeleton, RefreshIndicator, StatsSkeleton } from '../components/common/ModernLoading.jsx';
import { ProfileSettings } from '../components/profile';
import { DashboardLayout, DashboardStats, ProfileQuickPreview } from '../components/dashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: profile, loading: profileLoading, refreshing: profileRefreshing, error: profileError, refetch: refetchProfile } = useUserProfile(user?.id);
  
  // Progressive dashboard data (eliminates loading screens on navigation)
  const { 
    data: links, 
    loading: linksLoading, 
    refreshing: linksRefreshing,
    error: linksError, 
    isRealTimeConnected, 
    refetch: refetchLinks,
    hasData: hasLinks
  } = useUserLinks(user?.id);

  // Dashboard statistics from DashboardContext
  const { dashboardStats: stats } = useDashboard();

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
    refetchLinks();
  };

  // Determine overall loading state (only for initial loads)
  const isRefreshing = profileRefreshing || linksRefreshing;

  return (
    <ProtectedRoute>
      <ProfileSetupGuard>
        <DashboardLayout title="Dashboard">
          {/* Background refresh indicator */}
          <RefreshIndicator isVisible={isRefreshing} />
          
          {showProfileSettings && profile ? (
            <ProfileSettings
              profile={profile}
              onUpdate={handleProfileUpdate}
              onCancel={handleCancelProfileEdit}
            />
          ) : (
            <>
              {/* Profile Quick Preview - show skeleton only on initial load */}
              {profileLoading ? (
                <ProfileSkeleton />
              ) : profile ? (
                <ProfileQuickPreview
                  profile={profile}
                  onEditProfile={() => setShowProfileSettings(true)}
                  onViewPublicProfile={handleViewPublicProfile}
                />
              ) : profileError ? (
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                  <div className="text-center py-6">
                    <h3 className="text-lg font-medium text-red-600 mb-2">Profile Error</h3>
                    <p className="text-gray-600 mb-4">{profileError}</p>
                    <Button onClick={refetchProfile} variant="outline">Retry</Button>
                  </div>
                </div>
              ) : (
                // Show skeleton while waiting for data
                <ProfileSkeleton />
              )}

              {/* Dashboard Stats - show skeleton only on initial load */}
              {linksLoading ? (
                <StatsSkeleton />
              ) : (
                <DashboardStats 
                  stats={stats}
                  loading={false}
                  isRealTimeConnected={isRealTimeConnected}
                  onRefresh={handleRefreshData}
                />
              )}

              {/* Links Preview - Simplified for Dashboard */}
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
                  
                  {/* View All Links Button */}
                  {hasLinks && (
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/links'}
                      className="px-3 py-2 text-sm"
                    >
                      View All
                    </Button>
                  )}
                </div>
                
                {linksError ? (
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
                      {linksError}
                    </p>
                    <Button
                      variant="outline"
                      onClick={refetchLinks}
                      className="px-4 py-2"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : hasLinks ? (
                  // Display preview of first 3 links only
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
                    
                    {/* Show quick summary if more links exist */}
                    {links.length > 3 && (
                      <div className="text-center pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          And {links.length - 3} more link{links.length - 3 !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
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
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                      Start building your link collection! Use the + button to add your first link.
                    </p>
                    <div className="text-sm text-gray-500">
                      Use the floating + button (mobile) or Add Link button (desktop) to get started
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DashboardLayout>
      </ProfileSetupGuard>
    </ProtectedRoute>
  );
};

export default Dashboard;
