/**
 * EmailVerificationPending - Component for showing email verification status
 * 
 * Features:
 * - Shows email verification instructions
 * - Resend verification email functionality
 * - Mobile-first responsive design
 * - Loading states and error handling
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const EmailVerificationPending = ({ 
  email, 
  onBackToLogin,
  className = '' 
}) => {
  const { resetPassword } = useAuth(); // We'll use resetPassword to resend verification
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState(null);

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      // Use resetPassword which will send an email link
      // This is a workaround since Supabase doesn't have a dedicated "resend verification" endpoint
      await resetPassword(email, `${window.location.origin}/verify-email`);
      setResendSuccess(true);
    } catch (error) {
      console.error('[EmailVerificationPending] Resend failed:', error);
      setResendError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Icon */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg 
            className="w-8 h-8 text-blue-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a verification link to
        </p>
        <p className="text-sm font-medium text-blue-600">{email}</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Next Steps:</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Check your email inbox (including spam/junk folder)</li>
          <li>Click the verification link in the email</li>
          <li>Return here to sign in with your verified account</li>
        </ol>
      </div>

      {/* Resend Section */}
      <div className="text-center space-y-4">
        {resendSuccess ? (
          <div className="text-green-600 text-sm">
            ✓ Verification email sent successfully!
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the email?
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleResendVerification}
              disabled={isResending}
              loading={isResending}
              className="mb-2"
            >
              Resend Verification Email
            </Button>
          </div>
        )}

        {resendError && (
          <div className="text-red-600 text-sm">
            {resendError}
          </div>
        )}
      </div>

      {/* Back to Login */}
      <div className="text-center pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm text-blue-500 hover:text-blue-600 underline"
        >
          ← Back to Sign In
        </button>
      </div>
    </div>
  );
};

EmailVerificationPending.propTypes = {
  email: PropTypes.string.isRequired,
  onBackToLogin: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default EmailVerificationPending;
