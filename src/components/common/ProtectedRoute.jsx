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
 * ProtectedRoute sekarang lebih sederhana.
 * Ia hanya memeriksa status otentikasi.
 * Logika redirect ditangani di level router/app.
 */
const ProtectedRoute = ({ 
  children, 
  redirectTo = '/',
  // Anda bisa menambahkan properti lain seperti requirePermission jika perlu
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // For initial loading, return null and let AuthProvider handle the loading screen
  // This prevents multiple loading screens stacking up
  if (isLoading) {
    return null; // AuthProvider shows the initial loading
  }

  // Jika tidak terotentikasi, alihkan ke halaman login
  if (!isAuthenticated) {
    // 'replace' mencegah pengguna menekan tombol "kembali" di browser untuk kembali ke halaman yang dilindungi.
    // 'state' berguna untuk mengarahkan pengguna kembali ke halaman yang mereka coba akses setelah login.
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // Jika terotentikasi, tampilkan konten yang dilindungi.
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
};

export default ProtectedRoute;