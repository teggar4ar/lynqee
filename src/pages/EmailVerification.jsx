/**
 * EmailVerification - Handle email verification from Supabase links
 * 
 * This page handles the email verification process when users click
 * verification links sent by Supabase.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { Button, ErrorDisplay } from '../components/common';
import { InitialLoading } from '../components/common/ModernLoading.jsx';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [error, setError] = useState('');

  useEffect(() => {
    // If user is already authenticated after verification, redirect to dashboard
    if (!isLoading && user) {
      setStatus('success');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    } else if (!isLoading && !user) {
      // Check if there was an error in the URL
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (errorParam) {
        setStatus('error');
        setError(errorDescription || 'Email verification failed. The link may be expired or invalid.');
      } else {
        // Check for access_token which indicates successful verification
        const accessToken = searchParams.get('access_token');
        if (accessToken) {
          setStatus('success');
          // The auth state should update automatically through Supabase
        } else {
          setStatus('error');
          setError('Invalid verification link. Please try again or request a new verification email.');
        }
      }
    }
  }, [user, isLoading, searchParams, navigate]);

  const handleGoToLogin = () => {
    navigate('/', { replace: true });
  };

  // Show loading while checking auth state
  if (isLoading || status === 'verifying') {
    return (
      <InitialLoading message="Verifying your email..." />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-6">
        {status === 'success' ? (
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You're being redirected to setup your profile...
            </p>
            
            {/* <Button
              onClick={handleGoToLogin}
              variant="primary"
              fullWidth
            >
              Continue to Dashboard
            </Button> */}
          </div>
        ) : (
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            
            <ErrorDisplay
              error={error}
              size="large"
              showIcon={false}
              className="mb-6 max-w-md mx-auto"
            />
            
            <Button
              onClick={handleGoToLogin}
              variant="primary"
              fullWidth
            >
              Back to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
