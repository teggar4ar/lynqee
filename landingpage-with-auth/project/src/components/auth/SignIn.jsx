import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';

const SignIn = ({ onSwitchToSignUp }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.warn('Sign in attempt:', formData);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-mint-cream flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Form Section */}
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
            {/* Email Field */}
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
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:border-transparent transition-colors ${
                    errors.email 
                      ? 'border-coral-red bg-coral-red/5' 
                      : 'border-sage-gray/30 bg-white hover:border-sage-gray/50'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-coral-red">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
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
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:border-transparent transition-colors ${
                    errors.password 
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
              {errors.password && (
                <p className="mt-1 text-sm text-coral-red">{errors.password}</p>
              )}
            </div>

            {/* Reset Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-sage-gray hover:text-forest-green transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-golden-yellow text-forest-green font-semibold py-3 px-4 rounded-lg hover:bg-golden-yellow/80 focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-forest-green border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>

            {/* Google Sign In */}
            <button
              type="button"
              className="w-full bg-white text-sage-gray font-medium py-3 px-4 rounded-lg border border-sage-gray/30 hover:border-sage-gray/50 hover:bg-sage-gray/5 focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            {/* Create Account Link */}
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

        {/* Illustration Section */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="bg-gradient-to-br from-coral-pink/20 to-golden-yellow/20 rounded-3xl p-8 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-deep-forest/10">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-golden-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-forest-green" />
                    </div>
                    <h3 className="text-xl font-bold text-forest-green mb-2">Secure Access</h3>
                    <p className="text-sage-gray text-sm">Your data is protected with enterprise-grade security</p>
                  </div>

                  {/* Features */}
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

                  {/* Stats */}
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

export default SignIn;