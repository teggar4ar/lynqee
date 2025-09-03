import React, { useEffect, useState } from 'react';
import { AuthContainer } from '../components/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ErrorDisplay, SuccessDisplay } from '../components/common';

const Auth = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !isRedirecting) {
      setIsRedirecting(true);
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate, isRedirecting]);

  const handleAuthSuccess = () => {
    setError(null);
    setSuccess('Authentication successful! Redirecting...');
  };

  const handleAuthError = (error) => {
    setSuccess(null);
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
        {/* Display success/error messages */}
        {success && (
          <SuccessDisplay
            message={success}
            className="max-w-md mx-auto mt-4"
          />
        )}
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
