/**
 * ResetPassword Page - Handles password reset from email links
 * 
 * This page is accessed when users click the reset password link in their email.
 * It extracts the access token from URL parameters and allows users to set a new password.
 * 
 * Features:
 * - Mobile-first responsive design
 * - Token validation and error handling
 * - New password form with confirmation
 * - Automatic redirect after successful reset
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import { useFormValidation } from '../hooks/useFormValidation.js';
import { useAuth } from '../hooks/useAuth.js';
import { VALIDATION_MESSAGES } from '../constants/validationMessages.js';
import AuthService from '../services/AuthService.js';
import ProfileService from '../services/ProfileService.js';
import { supabase } from '../services/supabase.js';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  
  // Get tokens from URL parameters (both search params and hash fragment)
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const type = searchParams.get('type');
  
  // Also check hash fragment (Supabase sometimes uses hash for auth tokens)
  const [hashParams, setHashParams] = useState(null);
  const [hashParsed, setHashParsed] = useState(false);
  
  useEffect(() => {
    // Parse hash fragment parameters
    const hash = window.location.hash.substring(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      setHashParams({
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token'),
        type: params.get('type')
      });
    }
    setHashParsed(true);
  }, []);
  
  // Use either search params or hash params
  const finalAccessToken = accessToken || hashParams?.access_token;
  const finalRefreshToken = refreshToken || hashParams?.refresh_token;
  const finalType = type || hashParams?.type;
  
  // State to prevent redirects during recovery process
  const [isInRecoveryFlow, setIsInRecoveryFlow] = useState(false);

  // Immediately mark as recovery flow if URL has recovery parameters
  useEffect(() => {
    if ((finalAccessToken && finalType === 'recovery') || (hashParams?.access_token && hashParams?.type === 'recovery')) {
      setIsInRecoveryFlow(true);
    }
  }, [finalAccessToken, finalType, finalRefreshToken, hashParams]);

  // Validation rules for password reset
  const validationRules = {
    password: (value) => {
      if (!value) return VALIDATION_MESSAGES.REQUIRED;
      if (value.length < 8) return VALIDATION_MESSAGES.PASSWORD_TOO_SHORT;
      return null;
    },
    confirmPassword: (value) => {
      if (!value) return VALIDATION_MESSAGES.REQUIRED;
      if (value !== formData.password) return VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH;
      return null;
    },
  };

  const {
    errors,
    touched,
    handleBlur,
    handleChange,
    submitForm,
  } = useFormValidation(validationRules);

  // Verify the reset token on component mount
  useEffect(() => {
    // Don't run verification until hash has been parsed
    if (!hashParsed) return;
    
    const verifyResetToken = async () => {
      try {
        // Check if we have the required parameters
        if (!finalAccessToken || finalType !== 'recovery') {
          setError('Invalid or expired reset link. Please request a new password reset.');
          setIsCheckingToken(false);
          return;
        }

        // First check if Supabase has already set a session from URL detection
        let currentSession;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          currentSession = session;
        } catch {
          // Silently continue if session retrieval fails
        }

        // If no session exists, manually set it using the tokens
        if (!currentSession) {
          const { data, error } = await supabase.auth.setSession({
            access_token: finalAccessToken,
            refresh_token: finalRefreshToken,
          });

          if (error) {
            console.error('[ResetPassword] Manual session setting failed:', error);
            setError(`Invalid or expired reset link: ${error.message}`);
            setIsCheckingToken(false);
            return;
          }
          currentSession = data?.session;
        }

        // Verify we have a valid session for password recovery
        if (currentSession?.user) {
          setIsValidToken(true);
          setIsInRecoveryFlow(true); // Ensure recovery flow state is maintained
          setError(null); // Clear any existing errors
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.');
          setIsInRecoveryFlow(false);
        }
      } catch (error) {
        console.error('[ResetPassword] Error in recovery flow:', error);
        setError('Something went wrong. Please try again or request a new reset link.');
        setIsInRecoveryFlow(false);
      } finally {
        setIsCheckingToken(false);
      }
    };

    // Only run verification if we have the required URL parameters
    if (finalAccessToken && finalType) {
      verifyResetToken();
    } else {
      // If no recovery parameters, this might be a direct visit to the page
      setTimeout(() => {
        if (!finalAccessToken && !finalType) {
          setError('Invalid or expired reset link. Please request a new password reset.');
          setIsInRecoveryFlow(false);
        }
        setIsCheckingToken(false);
      }, 100);
    }
  }, [finalAccessToken, finalRefreshToken, finalType, hashParsed]);

  // Redirect authenticated users who might have bookmarked this page
  // BUT NOT when they're in a password recovery flow
  useEffect(() => {
    // Only redirect if ALL of these conditions are met:
    // 1. User is authenticated 
    // 2. We're not currently checking tokens
    // 3. This is NOT a password recovery flow (multiple checks)
    // 4. There's no error state 
    if (user && !isCheckingToken && !isInRecoveryFlow && !isValidToken && !error) {
      navigate('/dashboard');
    }
  }, [user, navigate, isCheckingToken, isInRecoveryFlow, isValidToken, error]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    handleChange(name, value);
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  // Handle input blur
  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    handleBlur(name, value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const isValid = await submitForm(formData, async (validatedData) => {
        // Update the password using Supabase
        const { error } = await AuthService.updatePassword(validatedData.password);
        
        if (error) {
          throw new Error(error.message);
        }

        setSuccess('Password updated successfully! Redirecting...');
        
        // After password reset, sign out the temporary recovery session and redirect to login
        // This ensures a clean state and forces the user to log in with their new password
        setTimeout(async () => {
          try {
            // Sign out the recovery session
            await AuthService.signOut();
            
            // Redirect to login page with success message
            navigate('/?passwordReset=success');
          } catch (error) {
            console.error('[ResetPassword] Failed to sign out after password reset:', error);
            // Fallback: still redirect to login
            navigate('/');
          }
        }, 2000);
      });

      if (!isValid) {
        console.warn('[ResetPassword] Form validation failed');
      }
    } catch (error) {
      console.error('[ResetPassword] Password reset failed:', error);
      setError(error.message || 'Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking token
  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Verifying reset link...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your password reset link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for invalid tokens
  if (!isValidToken || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Reset Link Invalid
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error || 'This password reset link is invalid or has expired.'}
            </p>
            
            <div className="mt-6">
              <Button
                onClick={() => navigate('/')}
                variant="primary"
                fullWidth
              >
                Return to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Password Updated!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your password has been updated successfully. You'll be redirected shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main password reset form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Password Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password Input */}
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            label="New Password"
            placeholder="Enter your new password (min 8 characters)"
            error={errors.password}
            touched={touched.password}
            required
            autoComplete="new-password"
            disabled={isSubmitting}
          />

          {/* Confirm Password Input */}
          <Input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            label="Confirm New Password"
            placeholder="Confirm your new password"
            error={errors.confirmPassword}
            touched={touched.confirmPassword}
            required
            autoComplete="new-password"
            disabled={isSubmitting}
          />

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              fullWidth
            >
              Update Password
            </Button>
          </div>
        </form>

        {/* Back to Sign In Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-blue-500 hover:text-blue-600 underline"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
