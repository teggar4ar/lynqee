import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, Mail, RefreshCw } from 'lucide-react';

const EmailVerification = ({ email, onBackToSignIn }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  // Cooldown timer effect
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      setResendSuccess(true);
      setResendCooldown(60); // 60 second cooldown
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('[EmailVerification] Resend failed:', error);
      setResendError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-mint-cream flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Main Content */}
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            {/* Email Icon */}
            <div className="w-20 h-20 bg-golden-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-golden-yellow" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-forest-green mb-4">
              Check Your Email
            </h1>
            <p className="text-sage-gray text-lg leading-body mb-6">
              We've sent a verification link to your email address. Click the link to verify your account and get started.
            </p>

            {/* Email Display */}
            <div className="bg-white border-2 border-golden-yellow/30 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-5 h-5 text-sage-gray" />
                <span className="text-forest-green font-medium break-all">
                  {email || 'your-email@example.com'}
                </span>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {resendSuccess && (
            <div className="bg-forest-green/10 border border-forest-green/20 rounded-lg p-4 mb-6 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-forest-green flex-shrink-0" />
              <p className="text-forest-green font-medium">
                Verification email sent successfully! Check your inbox.
              </p>
            </div>
          )}

          {/* Error Message */}
          {resendError && (
            <div className="bg-coral-red/10 border border-coral-red/30 rounded-lg p-4 mb-6">
              <p className="text-coral-red font-medium">
                {resendError}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Resend Button */}
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              className="w-full bg-golden-yellow text-forest-green font-semibold py-3 px-4 rounded-lg hover:bg-golden-yellow/80 focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock className="w-5 h-5 mr-2" />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Resend Verification Email
                </>
              )}
            </button>

            {/* Back to Sign In */}
            <button
              onClick={onBackToSignIn}
              className="w-full bg-white text-sage-gray font-medium py-3 px-4 rounded-lg border border-sage-gray/30 hover:border-sage-gray/50 hover:bg-sage-gray/5 focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Sign In
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sage-gray text-sm leading-body">
              Didn't receive the email? Check your spam folder or try resending the verification email.
            </p>
          </div>
        </div>

        {/* Illustration Section */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="bg-gradient-to-br from-coral-pink/20 to-coral-red/20 rounded-3xl p-8 transform rotate-2 hover:rotate-1 transition-transform duration-500">
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-deep-forest/10">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-coral-pink rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-forest-green mb-2">Email Verification</h3>
                    <p className="text-sage-gray text-sm">Secure your account in just one click</p>
                  </div>

                  {/* Email Flow Visualization */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-mint-cream rounded-lg">
                      <div className="w-8 h-8 bg-golden-yellow/20 rounded-full flex items-center justify-center">
                        <span className="text-golden-yellow font-bold text-sm">1</span>
                      </div>
                      <div>
                        <div className="text-forest-green font-medium text-sm">Email Sent</div>
                        <div className="text-sage-gray text-xs">Verification link delivered</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-mint-cream rounded-lg">
                      <div className="w-8 h-8 bg-coral-pink/20 rounded-full flex items-center justify-center">
                        <span className="text-coral-pink font-bold text-sm">2</span>
                      </div>
                      <div>
                        <div className="text-forest-green font-medium text-sm">Click Link</div>
                        <div className="text-sage-gray text-xs">Open email and click verify</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-mint-cream rounded-lg">
                      <div className="w-8 h-8 bg-coral-red/20 rounded-full flex items-center justify-center">
                        <span className="text-coral-red font-bold text-sm">3</span>
                      </div>
                      <div>
                        <div className="text-forest-green font-medium text-sm">Account Active</div>
                        <div className="text-sage-gray text-xs">Start using Lynqee</div>
                      </div>
                    </div>
                  </div>

                  {/* Security Features */}
                  <div className="bg-gradient-to-r from-golden-yellow/10 to-coral-pink/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-forest-green">Security Features</div>
                      <CheckCircle className="w-4 h-4 text-forest-green" />
                    </div>
                    <div className="space-y-2 text-xs text-sage-gray">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-golden-yellow rounded-full mr-2"></div>
                        Encrypted email delivery
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-coral-pink rounded-full mr-2"></div>
                        Secure verification tokens
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-coral-red rounded-full mr-2"></div>
                        Time-limited links
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-sage-gray/20">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-forest-green">99.9%</div>
                      <div className="text-xs text-sage-gray">Delivery Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-forest-green">&lt;30s</div>
                      <div className="text-xs text-sage-gray">Avg. Delivery</div>
                    </div>
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

export default EmailVerification;