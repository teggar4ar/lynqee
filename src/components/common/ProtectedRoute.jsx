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

import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth.js';

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
  const { isAuthenticated, isLoading, checkPermission } = useAuth();

  // Show loading state while auth is being determined
  if (isLoading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    // If a custom fallback is provided, render it
    if (fallback) {
      return fallback;
    }
    
    // Otherwise redirect to login (in a real app, you'd use React Router)
    // For now, we'll show a simple unauthorized message
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            You need to be logged in to access this page.
          </p>
          <button
            onClick={() => window.location.href = redirectTo}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </button>
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
