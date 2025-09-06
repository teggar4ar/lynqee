/**
 * GoogleOAuthButton - OAuth button for Google authentication
 * 
 * Features:
 * - Mobile-optimized design with proper touch targets
 * - Google branding compliance
 * - Loading states
 * - Error handling
 */

import React from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useAlerts } from '../../hooks';
import { useAsync } from '../../hooks/useAsync.js';

const GoogleOAuthButton = ({ 
  onSuccess, 
  onError, 
  redirectTo,
  disabled = false,
  className = '',
  children = 'Continue with Google'
}) => {
  const { signInWithGoogle } = useAuth();
  const { showError } = useAlerts();
  const { loading, execute } = useAsync(signInWithGoogle);

  const handleGoogleSignIn = async () => {
    try {
      // Execute the Google sign-in flow
      const result = await execute(redirectTo);
      
      // No success message - just continue with the OAuth flow
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('[GoogleOAuthButton] Sign in failed:', error);
      
      // Provide specific error messages for common OAuth errors
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.message?.includes('popup')) {
        errorMessage = 'Google sign-in popup was closed or blocked';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error during Google sign-in';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError({
        title: 'Google Sign-in Failed',
        message: errorMessage,
        position: 'top-right'
      });
      
      if (onError) {
        onError(error);
      }
    }
  };

  // Google logo SVG (simplified)
  const GoogleIcon = () => (
    <svg
      className="w-5 h-5 mr-3"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={disabled || loading}
      loading={loading}
      fullWidth
      className={`
        border-gray-300 text-gray-700 bg-white
        hover:bg-gray-50 hover:border-gray-400
        focus:ring-gray-500
        ${className}
      `}
    >
      {!loading && <GoogleIcon />}
      {children}
    </Button>
  );
};

GoogleOAuthButton.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  redirectTo: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default GoogleOAuthButton;
