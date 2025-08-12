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

import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth.js';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute is now simpler.
 * It only checks the authentication status.
 * The redirect logic is handled at the router/app level.
 */
const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login',
  // You can add other properties like requirePermission if needed
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // For initial loading, return null and let AuthProvider handle the loading screen
  // This prevents multiple loading screens stacking up
  if (isLoading) {
    return null; // AuthProvider shows the initial loading
  }

  // If not authenticated, redirect to the login page
  if (!isAuthenticated) {
    // 'replace' prevents the user from pressing the "back" button in the browser to return to the protected page.
    // 'state' is useful for redirecting the user back to the page they were trying to access after logging in.
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // If authenticated, display the protected content.
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
};

export default ProtectedRoute;