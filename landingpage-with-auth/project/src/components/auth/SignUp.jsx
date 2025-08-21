import React, { useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react';

const SignUp = ({ onSwitchToSignIn, onSignUpSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;
    
    return {
      score: strength,
      checks,
      label: strength < 2 ? 'Weak' : strength < 4 ? 'Medium' : 'Strong',
      color: strength < 2 ? 'coral-red' : strength < 4 ? 'golden-yellow' : 'forest-green'
    };
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // On successful signup, redirect to email verification
      onSignUpSuccess(formData.email);
    }, 1500);
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-mint-cream flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Illustration Section */}
        <div className="hidden lg:block order-2 lg:order-1">
          <div className="relative">
            <div className="bg-gradient-to-br from-golden-yellow/20 to-coral-red/20 rounded-3xl p-8 transform rotate-3 hover:rotate-1 transition-transform duration-500">
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-deep-forest/10">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-coral-pink rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-forest-green mb-2">Join Lynqee</h3>
                    <p className="text-sage-gray text-sm">Start building your digital presence today</p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-mint-cream rounded-lg">
                      <div className="w-6 h-6 bg-golden-yellow rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-forest-green" />
                      </div>
                      <div>
                        <div className="text-forest-green font-medium text-sm">Unlimited Links</div>
                        <div className="text-sage-gray text-xs">Add as many links as you want</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-mint-cream rounded-lg">
                      <div className="w-6 h-6 bg-coral-pink rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <div className="text-forest-green font-medium text-sm">Custom Themes</div>
                        <div className="text-sage-gray text-xs">Personalize your page design</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-mint-cream rounded-lg">
                      <div className="w-6 h-6 bg-coral-red rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <div className="text-forest-green font-medium text-sm">Analytics Dashboard</div>
                        <div className="text-sage-gray text-xs">Track your link performance</div>
                      </div>
                    </div>
                  </div>

                  {/* Social Proof */}
                  <div className="bg-gradient-to-r from-golden-yellow/10 to-coral-pink/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-forest-green">50,000+</div>
                        <div className="text-xs text-sage-gray">Happy Users</div>
                      </div>
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 bg-golden-yellow rounded-full border-2 border-white"></div>
                        <div className="w-8 h-8 bg-coral-pink rounded-full border-2 border-white"></div>
                        <div className="w-8 h-8 bg-coral-red rounded-full border-2 border-white"></div>
                        <div className="w-8 h-8 bg-forest-green rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs font-bold">+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-md mx-auto w-full order-1 lg:order-2">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-forest-green mb-2">
              Create Account
            </h1>
            <p className="text-sage-gray">
              Join thousands of creators on Lynqee
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
                  placeholder="Create a password"
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-sage-gray">Password strength:</span>
                    <span className={`text-xs font-medium text-${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-sage-gray/20 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 bg-${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center ${passwordStrength.checks.length ? 'text-forest-green' : 'text-sage-gray'}`}>
                      {passwordStrength.checks.length ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                      8+ characters
                    </div>
                    <div className={`flex items-center ${passwordStrength.checks.number ? 'text-forest-green' : 'text-sage-gray'}`}>
                      {passwordStrength.checks.number ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                      Number
                    </div>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-coral-red">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-forest-green mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-sage-gray" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:border-transparent transition-colors ${
                    errors.confirmPassword 
                      ? 'border-coral-red bg-coral-red/5' 
                      : 'border-sage-gray/30 bg-white hover:border-sage-gray/50'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-sage-gray hover:text-forest-green transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-sage-gray hover:text-forest-green transition-colors" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-coral-red">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-golden-yellow text-forest-green font-semibold py-3 px-4 rounded-lg hover:bg-golden-yellow/80 focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-forest-green border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sage-gray">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignIn}
                  className="text-forest-green font-medium hover:text-deep-forest transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;