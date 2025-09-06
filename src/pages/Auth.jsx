import React, { useEffect, useState } from 'react';
import { AuthContainer } from '../components/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ErrorDisplay } from '../components/common';

const Auth = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [error, setError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle redirect after authentication
  useEffect(() => {
    if (!isLoading && user && !isRedirecting) {
      // Simply redirect to dashboard without showing any alerts
      setIsRedirecting(true);
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate, isRedirecting]);

  const handleAuthSuccess = () => {
    setError(null);
    // Success is now handled by individual auth components via toast alerts
  };

  const handleAuthError = (error) => {
    // Only for errors that don't come from SignInForm or SignUpForm
    // since those components already handle showing toast alerts
    if (error && error.skipInlineDisplay) {
      return;
    }
    setError(error.message || 'Authentication failed. Please try again.');
  };

  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen bg-mint-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-green mx-auto mb-4"></div>
          <p className="text-sage-gray">
            {isRedirecting ? 'Redirecting to dashboard...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mint-cream">
      <main>
        {/* Display inline error messages for non-toast errors */}
        {error && (
          <ErrorDisplay
            error={error}
            className="max-w-md mx-auto mt-4"
          />
        )}

        <AuthContainer onSuccess={handleAuthSuccess} onError={handleAuthError} />
      </main>
    </div>
  );
};

export default Auth;
