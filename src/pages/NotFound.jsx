import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ErrorState } from '../components/common';

/**
 * NotFound Component
 * 
 * Displays a 404 error page for:
 * - Non-existent usernames
 * - Invalid routes
 * - Any unmatched paths
 * 
 * Features:
 * - Mobile-first responsive design
 * - Clear navigation options
 * - SEO-friendly structure
 */
const NotFound = ({ type = 'page', username = null }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getErrorMessage = () => {
    switch (type) {
      case 'profile':
        return {
          title: 'Profile Not Found',
          message: username 
            ? `The profile "@${username}" doesn't exist or has been removed.`
            : 'The profile you\'re looking for doesn\'t exist.',
          suggestion: 'Check the username and try again, or explore other profiles.'
        };
      case 'page':
      default:
        return {
          title: 'Page Not Found',
          message: `The page "${location.pathname}" doesn't exist.`,
          suggestion: 'Check the URL and try again, or go back to the home page.'
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full">
        <ErrorState
          type={type === 'profile' ? 'profileNotFound' : 'notFound'}
          title={errorInfo.title}
          message={errorInfo.message}
          onRetry={() => navigate('/')}
        />

        {/* Additional Help for Profile Not Found */}
        {type === 'profile' && (
          <div className="mt-8 p-4 bg-mint-cream rounded-lg border border-golden-yellow/30">
            <h3 className="text-sm font-medium text-forest-green mb-2">
              Looking to create your own profile?
            </h3>
            <p className="text-xs text-sage-gray mb-3">
              Sign up to create your personalized link page and share all your important links in one place.
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-xs font-semibold text-deep-forest hover:text-forest-green underline"
            >
              Get Started →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

NotFound.propTypes = {
  type: PropTypes.oneOf(['page', 'profile']),
  username: PropTypes.string,
};

export default NotFound;
