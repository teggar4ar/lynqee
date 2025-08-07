import React from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useProfile } from '../hooks/useProfile';
import { useLinks } from '../hooks/useLinks';
import { NotFound } from '../pages';

/**
 * PublicProfile Component
 * 
 * Displays a public profile page for a user accessible via /:username
 * This component handles:
 * - Loading profile data by username
 * - Displaying profile information and links
 * - Handling 404 cases for non-existent users
 * - Mobile-first responsive design
 */
const PublicProfile = () => {
  const { username } = useParams();
  
  // Fetch profile and links data
  const { profile, loading: profileLoading, error: profileError, notFound } = useProfile(username);
  const { links, loading: linksLoading, error: linksError } = useLinks(username);

  // Handle case where username is missing (shouldn't happen with proper routing)
  if (!username) {
    return <NotFound type="profile" />;
  }

  // Handle profile not found
  if (notFound) {
    return <NotFound type="profile" username={username} />;
  }

  // Handle loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white min-h-screen md:max-w-lg md:my-8 md:rounded-lg md:shadow-sm">
          {/* Loading skeleton */}
          <div className="px-4 py-6 text-center border-b border-gray-100 md:px-6 md:py-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full animate-pulse md:w-24 md:h-24"></div>
            <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
          </div>
          <div className="px-4 py-6 md:px-6">
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle profile error
  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Profile
          </h1>
          <p className="text-gray-600 mb-4">
            {profileError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first design with responsive container */}
      <div className="max-w-md mx-auto bg-white min-h-screen md:max-w-lg md:my-8 md:rounded-lg md:shadow-sm">
        
        {/* Profile Header Section */}
        <div className="px-4 py-6 text-center border-b border-gray-100 md:px-6 md:py-8">
          
          {/* Avatar */}
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center md:w-24 md:h-24 overflow-hidden">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={`${profile.name || username}'s avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-gray-500 uppercase md:text-3xl">
                {(profile?.name || username).charAt(0)}
              </span>
            )}
          </div>
          
          {/* Display Name and Username */}
          {profile?.name && (
            <h1 className="text-xl font-bold text-gray-900 mb-1 md:text-2xl">
              {profile.name}
            </h1>
          )}
          <h2 className={`${profile?.name ? 'text-gray-600 text-lg' : 'text-xl font-bold text-gray-900'} mb-2 md:text-xl`}>
            @{username}
          </h2>
          
          {/* Bio */}
          {profile?.bio && (
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto md:text-base md:max-w-sm">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links Section */}
        <div className="px-4 py-6 md:px-6">
          {linksLoading ? (
            // Links loading state
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : linksError ? (
            // Links error state
            <div className="text-center text-red-500 py-8">
              <p className="text-sm">Failed to load links</p>
              <p className="text-xs mt-2 text-gray-400">{linksError}</p>
            </div>
          ) : links.length > 0 ? (
            // Display links
            <div className="space-y-3">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 group-hover:text-gray-800">
                      {link.title || link.url}
                    </span>
                    <svg 
                      className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  {link.title && link.title !== link.url && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {link.url}
                    </p>
                  )}
                </a>
              ))}
            </div>
          ) : (
            // No links state
            <div className="text-center text-gray-500 py-8">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <p className="text-sm">No links added yet</p>
              <p className="text-xs mt-1 text-gray-400">
                @{username} hasn't shared any links yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer with branding */}
        <div className="px-4 py-6 text-center border-t border-gray-100 md:px-6">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-semibold">Lynqee</span>
          </p>
        </div>
      </div>
    </div>
  );
};

PublicProfile.propTypes = {
  // No props needed as this component gets data from URL params
};

export default PublicProfile;
