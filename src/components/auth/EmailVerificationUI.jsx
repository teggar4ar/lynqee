import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/useAuth.js';
import { ArrowLeft, CheckCircle, Clock, Mail, RefreshCw } from 'lucide-react';

const EmailVerificationUI = ({ email, onBackToSignIn }) => {
  const { resetPassword } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setResendError('');
    setResendSuccess(false);

    try {
      await resetPassword(email, `${window.location.origin}/verify-email`);
      setResendSuccess(true);
      setResendCooldown(60);

      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('[EmailVerificationUI] Resend failed:', error);
      setResendError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-mint-cream flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-golden-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-golden-yellow" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-forest-green mb-4">
              Check Your Email
            </h1>
            <p className="text-sage-gray text-lg leading-body mb-6">
              We've sent a verification link to your email address.
            </p>
            <div className="bg-white border-2 border-golden-yellow/30 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-5 h-5 text-sage-gray" />
                <span className="text-forest-green font-medium break-all">
                  {email || 'your-email@example.com'}
                </span>
              </div>
            </div>
          </div>

          {resendSuccess && (
            <div className="bg-forest-green/10 border border-forest-green/20 rounded-lg p-4 mb-6 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-forest-green flex-shrink-0" />
              <p className="text-forest-green font-medium">
                Verification email sent successfully!
              </p>
            </div>
          )}

          {resendError && (
            <div className="bg-coral-red/10 border border-coral-red/30 rounded-lg p-4 mb-6">
              <p className="text-coral-red font-medium">{resendError}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              className="w-full bg-forest-green text-white font-semibold py-3 px-4 rounded-lg hover:bg-deep-forest focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isResending ? (
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Sending...</>
              ) : resendCooldown > 0 ? (
                <><Clock className="w-5 h-5 mr-2" />Resend in {resendCooldown}s</>
              ) : (
                <><RefreshCw className="w-5 h-5 mr-2" />Resend Verification Email</>
              )}
            </button>

            <button
              onClick={onBackToSignIn}
              className="w-full bg-white text-sage-gray font-medium py-3 px-4 rounded-lg border border-sage-gray/30 hover:border-sage-gray/50 hover:bg-sage-gray/5 focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Sign In
            </button>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sage-gray text-sm leading-body">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </div>
        <div className="hidden lg:block">
            <div className="relative">
                <div className="bg-gradient-to-br from-coral-pink/20 to-coral-red/20 rounded-3xl p-8 transform rotate-2 hover:rotate-1 transition-transform duration-500">
                    <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-deep-forest/10">
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-coral-pink rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-forest-green mb-2">Email Verification</h3>
                                <p className="text-sage-gray text-sm">Secure your account in just one click</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

EmailVerificationUI.propTypes = {
  email: PropTypes.string.isRequired,
  onBackToSignIn: PropTypes.func.isRequired,
};

export default EmailVerificationUI;
