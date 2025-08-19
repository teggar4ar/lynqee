import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useFormValidation } from '../../hooks/useFormValidation.js';
import { useAuth } from '../../hooks/useAuth.js';
import { VALIDATION_MESSAGES } from '../../constants/validationMessages.js';
import { isValidEmail } from '../../utils/validators.js';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import GoogleOAuthButton from './GoogleOAuthButton.jsx';

const SignInForm = ({ onSwitchToSignUp, onSuccess, onError }) => {
  const { signIn, resetPassword } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validationRules = {
    email: (value) => {
      if (!value) return VALIDATION_MESSAGES.REQUIRED;
      if (!isValidEmail(value)) return VALIDATION_MESSAGES.INVALID_EMAIL;
      return null;
    },
    password: (value) => {
      if (!value) return VALIDATION_MESSAGES.REQUIRED;
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
        if (onSuccess) onSuccess(result);
      });
      if (!isValid) console.warn('[SignInForm] Form validation failed');
    } catch (error) {
      console.error('[SignInForm] Login failed:', error);
      if (onError) onError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email || !isValidEmail(formData.email)) {
      handleBlur('email', formData.email);
      return;
    }
    setIsResettingPassword(true);
    try {
      await resetPassword(formData.email);
      alert('Password reset link sent to your email!');
    } catch (error) {
      console.error('[SignInForm] Password reset failed:', error);
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
              <label htmlFor="email" className="block text-sm font-medium text-forest-green mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-sage-gray" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  disabled={isSubmitting || isResettingPassword}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:border-transparent transition-colors ${
                    errors.email && touched.email
                      ? 'border-coral-red bg-coral-red/5'
                      : 'border-sage-gray/30 bg-white hover:border-sage-gray/50'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && touched.email && (
                <p className="mt-1 text-sm text-coral-red">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-forest-green mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-sage-gray" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  disabled={isSubmitting || isResettingPassword}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:border-transparent transition-colors ${
                    errors.password && touched.password
                      ? 'border-coral-red bg-coral-red/5'
                      : 'border-sage-gray/30 bg-white hover:border-sage-gray/50'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-sage-gray hover:text-forest-green transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-sage-gray hover:text-forest-green transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1 text-sm text-coral-red">{errors.password}</p>
              )}
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-golden-yellow text-forest-green font-semibold py-3 px-4 rounded-lg hover:bg-golden-yellow/80 focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-forest-green border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>

            <GoogleOAuthButton
                onSuccess={onSuccess}
                onError={onError}
                redirectTo={`${window.location.origin}/dashboard`}
                className="w-full bg-white text-sage-gray font-medium py-3 px-4 rounded-lg border border-sage-gray/30 hover:border-sage-gray/50 hover:bg-sage-gray/5 focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
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
                    <div className="w-16 h-16 bg-golden-yellow rounded-full flex items-center justify-center mx-auto mb-4">
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
