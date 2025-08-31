import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

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
      <div className="max-w-md w-full text-center">
        
        {/* 404 Visual Indicator */}
        <div className="mb-6">
          <div className="text-6xl font-bold text-gray-300 mb-2 md:text-7xl">
            404
          </div>
          <div className="w-16 h-1 bg-golden-yellow mx-auto rounded-full"></div>
        </div>

        {/* Error Content */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-3 md:text-2xl">
            {errorInfo.title}
          </h1>
          <p className="text-gray-600 mb-4 leading-relaxed">
            {errorInfo.message}
          </p>
          <p className="text-sm text-gray-500">
            {errorInfo.suggestion}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-golden-yellow text-deep-forest rounded-lg font-semibold hover:bg-golden-yellow/80 transition-colors"
          >
            Go to Home
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>

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
