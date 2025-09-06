import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useFormValidation } from '../../hooks/useFormValidation.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useAlerts } from '../../hooks';
import { VALIDATION_MESSAGES } from '../../constants/validationMessages.js';
import { isValidEmail } from '../../utils/validators.js';
import { getUserFriendlyErrorMessage } from '../../utils/errorUtils.js';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import GoogleOAuthButton from './GoogleOAuthButton.jsx';
import { Button, Input } from '../common';

const SignInForm = ({ onSwitchToSignUp, onSuccess, onError }) => {
  const { signIn, resetPassword } = useAuth();
  const { showSuccess, showError, showInfo } = useAlerts();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validationRules = {
    email: (value) => {
      if (!value) return VALIDATION_MESSAGES.EMAIL_IS_REQUIRED;
      if (!isValidEmail(value)) return VALIDATION_MESSAGES.INVALID_EMAIL;
      return null;
    },
    password: (value) => {
      if (!value) return VALIDATION_MESSAGES.PASSWORD_IS_REQUIRED;
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    handleChange(name, value);
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    handleBlur(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isValid = await submitForm(formData, async (validatedData) => {
        const result = await signIn(validatedData.email, validatedData.password);
        if (result.error) {
          const friendlyMessage = getUserFriendlyErrorMessage(result.error);
          showError({
            title: 'Sign In Failed',
            message: friendlyMessage
          });
          if (onError) onError({ 
            message: friendlyMessage,
            skipInlineDisplay: true // Flag to prevent duplicate display
          });
        } else {
          showSuccess({
            title: 'Welcome Back!',
            message: 'Successfully signed in to your account'
          });
          if (onSuccess) onSuccess(result);
        }
      }, { 
        showAlerts: false  // Disable automatic validation alerts to prevent duplicates
      });
      if (!isValid) {
        // This path is taken if form validation fails before submitting
        setIsSubmitting(false);
        return;
      };
    } catch (error) {
      console.error('[SignInForm] Login failed:', error);
      showError({
        title: 'Authentication Error',
        message: getUserFriendlyErrorMessage(error)
      });
      if (onError) onError({
        ...error,
        skipInlineDisplay: true // Flag to prevent duplicate display
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email || !isValidEmail(formData.email)) {
      handleBlur('email', formData.email);
      showInfo({
        title: 'Email Required',
        message: 'Please enter a valid email address to reset your password'
      });
      return;
    }
    setIsResettingPassword(true);
    try {
      await resetPassword(formData.email);
      showSuccess({
        title: 'Email Sent',
        message: 'Verification email sent successfully! Please check your inbox.',
        duration: 8000
      });
    } catch (error) {
      console.error('[SignInForm] Password reset failed:', error);
      showError({
        title: 'Reset Failed',
        message: getUserFriendlyErrorMessage(error)
      });
      if (onError) onError(error);
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-mint-cream flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-forest-green mb-2">
              Welcome Back
            </h1>
            <p className="text-sage-gray">
              Sign in to your Lynqee account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                disabled={isSubmitting || isResettingPassword}
                placeholder="Enter your email"
                error={errors.email}
                touched={touched.email}
                icon={<Mail className="h-5 w-5 text-sage-gray" />}
              />
            </div>

            <div>
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                disabled={isSubmitting || isResettingPassword}
                placeholder="Enter your password"
                error={errors.password}
                touched={touched.password}
                icon={<Lock className="h-5 w-5 text-sage-gray" />}
                rightElement={
                  <button
                    type="button"
                    className="flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-sage-gray hover:text-forest-green transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-sage-gray hover:text-forest-green transition-colors" />
                    )}
                  </button>
                }
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isSubmitting || isResettingPassword}
                className="text-sm text-sage-gray hover:text-forest-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResettingPassword ? 'Sending...' : 'Forgot your password?'}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              fullWidth
              className="flex items-center justify-center"
            >
              Sign In
              {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>

            <GoogleOAuthButton
                onSuccess={onSuccess}
                onError={onError}
                redirectTo={`${window.location.origin}/dashboard`}
                className="w-full bg-white text-sage-gray font-medium py-3 px-4 rounded-lg border border-sage-gray/30 hover:border-sage-gray/50 hover:bg-sage-gray/5 focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
            />

            <div className="text-center">
              <p className="text-sage-gray">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="text-forest-green font-medium hover:text-deep-forest transition-colors"
                >
                  Create Account
                </button>
              </p>
            </div>
          </form>
        </div>

        <div className="hidden lg:block">
          <div className="relative">
            <div className="bg-gradient-to-br from-coral-pink/20 to-golden-yellow/20 rounded-3xl p-8 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-deep-forest/10">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-forest-green" />
                    </div>
                    <h3 className="text-xl font-bold text-forest-green mb-2">Secure Access</h3>
                    <p className="text-sage-gray text-sm">Your data is protected with enterprise-grade security</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-mint-cream rounded-lg">
                      <div className="w-8 h-8 bg-coral-pink/20 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-coral-pink rounded-full"></div>
                      </div>
                      <span className="text-forest-green font-medium text-sm">Two-factor authentication</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-mint-cream rounded-lg">
                      <div className="w-8 h-8 bg-golden-yellow/20 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-golden-yellow rounded-full"></div>
                      </div>
                      <span className="text-forest-green font-medium text-sm">End-to-end encryption</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-mint-cream rounded-lg">
                      <div className="w-8 h-8 bg-coral-red/20 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-coral-red rounded-full"></div>
                      </div>
                      <span className="text-forest-green font-medium text-sm">Regular security audits</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-sage-gray/20">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-forest-green">99.9%</div>
                      <div className="text-xs text-sage-gray">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-forest-green">50K+</div>
                      <div className="text-xs text-sage-gray">Secure Users</div>
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

SignInForm.propTypes = {
  onSwitchToSignUp: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};

export default SignInForm;
