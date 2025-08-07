/**
 * ProtectedRoute - Higher-Order Component for route protection
 * 
 * Wraps routes that require authentication. Redirects unauthenticated
 * users to the login page and handles loading states gracefully.
 * 
 * Features:
 * - Authentication checking
 * - Loading state handling
 * - Configurable redirect behavior
 * - Role-based permissions (future-ready)
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * Check if the current URL contains OAuth redirect parameters
 * This helps prevent showing "Authentication Required" during OAuth flows
 */
const hasOAuthParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  // Check for common OAuth parameters
  return (
    urlParams.has('access_token') ||
    urlParams.has('refresh_token') ||
    urlParams.has('code') ||
    hashParams.has('access_token') ||
    hashParams.has('refresh_token')
  );
};

/**
 * ProtectedRoute component that guards routes requiring authentication
 */
const ProtectedRoute = ({ 
  children, 
  fallback = null, 
  redirectTo = '/login',
  requirePermission = null,
  showLoading = true 
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, checkPermission } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  // Handle redirect when not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !redirecting) {
      setRedirecting(true);
      navigate(redirectTo, { replace: true });
    }
  }, [isLoading, isAuthenticated, redirecting, navigate, redirectTo]);

  // Show loading state while auth is being determined OR if OAuth params are present
  if (isLoading || (!isAuthenticated && hasOAuthParams())) {
    if (showLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {hasOAuthParams() ? 'Completing sign in...' : 'Loading...'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  // Check authentication
  if (!isAuthenticated) {
    // If a custom fallback is provided, render it
    if (fallback) {
      return fallback;
    }
    
    // Show loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check permissions if required
  if (requirePermission && !checkPermission(requirePermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access this resource.
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated and has required permissions
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  redirectTo: PropTypes.string,
  requirePermission: PropTypes.string,
  showLoading: PropTypes.bool,
};

export default ProtectedRoute;
