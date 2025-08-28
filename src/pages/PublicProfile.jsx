import React from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { usePublicRealtimeLinks } from '../hooks/usePublicRealtimeLinks';
import { ProfileHeader } from '../components/profile';
import { 
  ErrorBoundary,
  ErrorState,
  LinksSkeleton,
  ProfileSkeleton
} from '../components/common';
import { LinkList } from '../components/links';
import { RESPONSIVE_PATTERNS, TOUCH_TARGETS } from '../utils/mobileUtils';
import { getErrorType } from '../utils/errorUtils';

/**
 * PublicProfile Component
 * 
 * Displays a public profile page for a user accessible via /:username
 * This component handles:
 * - Loading profile data by username
 * - Displaying profile information and links
 * - Handling 404 cases for non-existent users
 * - Mobile-first responsive design with touch optimization
 * - Responsive design testing in development
 */
const PublicProfile = () => {
  const { username } = useParams();
  
  // Fetch profile and links data
  const { data: profile, loading: profileLoading, error: profileError, notFound } = usePublicProfile(username);
  const { data: links, loading: linksLoading, error: linksError, isRealTimeConnected } = usePublicRealtimeLinks(username);

  // Handle case where username is missing (shouldn't happen with proper routing)
  if (!username) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          type="profileNotFound"
          title="Invalid Profile URL"
          message="No username provided in the URL."
          onRetry={() => window.location.href = '/'}
        />
      </div>
    );
  }

  // Handle profile not found
  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          type="profileNotFound"
          onRetry={() => window.location.href = '/'}
          context={{
            operation: 'Load Profile',
            username: username
          }}
        />
      </div>
    );
  }

  // Handle loading state with enhanced skeleton
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
          <div className="
            w-full 
            mx-auto 
            bg-white 
            min-h-screen
            
            sm:max-w-md 
            sm:my-4 
            sm:rounded-lg 
            sm:shadow-sm 
            sm:min-h-0
            
            md:max-w-lg 
            md:my-8 
            md:shadow-md
            
            lg:max-w-xl
          ">
            
            {/* Profile Header Skeleton */}
            <div className="
              p-4 
              border-b 
              border-gray-100
              
              sm:p-6 
              sm:rounded-t-lg
              
              md:p-8
            ">
              <ProfileSkeleton />
            </div>

            {/* Links Section Skeleton */}
            <div className="
              px-4 
              py-6 
              
              sm:px-6 
              sm:py-8
              
              md:px-8
            ">
              <LinksSkeleton count={3} />
            </div>

            {/* Footer */}
            <div className="
              px-4 
              py-6 
              text-center 
              border-t 
              border-gray-100
              
              sm:px-6 
              sm:rounded-b-lg
              
              md:px-8
            ">
              <div className="w-32 h-3 bg-gray-200 rounded mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
    );
  }

  // Handle profile error with enhanced error state
  if (profileError) {
    const errorType = getErrorType(profileError);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState
          type={errorType}
          error={profileError}
          onRetry={() => window.location.reload()}
          context={{
            operation: 'Load Profile',
            username: username
          }}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile-first responsive container */}
        <div className="
          w-full 
          mx-auto 
          bg-white 
          min-h-screen
          
          sm:max-w-md 
          sm:my-4 
          sm:rounded-lg 
          sm:shadow-sm 
          sm:min-h-0
          
          md:max-w-lg 
          md:my-8 
          md:shadow-md
          
          lg:max-w-xl
        ">
          
          {/* Profile Header Section - Enhanced with responsive design */}
          <section 
            aria-labelledby="profile-header"
            className="relative"
          >
            <ProfileHeader 
              profile={profile} 
              username={username}
              className="
                p-4 
                border-b 
                border-gray-100
                
                sm:p-6 
                sm:rounded-t-lg
                
                md:p-8
              "
            />
          </section>

          {/* Links Section - Enhanced with loading states */}
          <section 
            aria-labelledby="user-links"
            className="
              px-4 
              py-6 
              
              sm:px-6 
              sm:py-8
              
              md:px-8
            "
          >
            <h2 id="user-links" className="sr-only">
              {username}'s Links
            </h2>
            
            {/* Real-time indicator for links */}
            {isRealTimeConnected && (
              <div className="mb-4 flex items-center justify-center">
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-700 font-medium">Live updates</span>
                </div>
              </div>
            )}
            
            
            {/* Enhanced LinkList with error state handling */}
            <ErrorBoundary 
              fallback={
                <ErrorState
                  type="linksError"
                  title="Failed to Load Links"
                  message="Unable to load links for this profile."
                  onRetry={() => window.location.reload()}
                />
              }
            >
              <LinkList
                links={links}
                loading={linksLoading}
                error={linksError}
                emptyMessage="No links added yet"
                emptySubtext={`@${username} hasn't shared any links yet.`}
                spacing="comfortable"
                className="space-y-3 sm:space-y-4"
                showAnimation={true}
              />
            </ErrorBoundary>
          </section>

          {/* Footer with branding - Mobile-optimized */}
          <footer className="
            px-4 
            py-6 
            text-center 
            border-t 
            border-gray-100
            
            sm:px-6 
            sm:rounded-b-lg
            
            md:px-8
          ">
            <p className="text-xs text-gray-400">
              Powered by <span className="font-semibold text-gray-500">Lynqee</span>
            </p>
          </footer>

          {/* Safe area spacing for mobile devices */}
          <div className="h-safe-area-inset-bottom sm:hidden" aria-hidden="true" />
        </div>
      </div>
    </ErrorBoundary>
  );
};

PublicProfile.propTypes = {
  // No props needed as this component gets data from URL params
};

export default PublicProfile;
