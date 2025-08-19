import React, { useState, useEffect } from 'react';
import { AuthContainer } from '../components/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ErrorDisplay } from '../components/common';

const AuthPage = () => {
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

  const handleAuthSuccess = (result) => {
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
      <header className="bg-mint-cream border-b border-deep-forest/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-forest-green hover:text-deep-forest transition-colors duration-200">
                Lynqee
              </h1>
            </Link>
          </div>
        </div>
      </header>
      <main>
        {/* Display success/error messages */}
        {success && (
          <div className="max-w-md mx-auto mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
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

export default AuthPage;
