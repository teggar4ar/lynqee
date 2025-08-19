import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useFormValidation } from '../../hooks/useFormValidation.js';
import { useAuth } from '../../hooks/useAuth.js';
import { VALIDATION_MESSAGES } from '../../constants/validationMessages.js';
import { isValidEmail } from '../../utils/validators.js';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Check, X, User } from 'lucide-react';

const SignUpForm = ({ onSwitchToSignIn, onSignUpSuccess, onError }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation rules
  const validationRules = {
    email: (value) => {
      if (!value) return VALIDATION_MESSAGES.REQUIRED;
      if (!isValidEmail(value)) return VALIDATION_MESSAGES.INVALID_EMAIL;
      return null;
    },
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
        const result = await signUp(
          validatedData.email,
          validatedData.password,
          { signup_method: 'email' }
        );

        if (result.error) {
          if (onError) onError({ message: result.error });
        } else if (result.user) {
          if (onSignUpSuccess) onSignUpSuccess(result.user.email);
        }
      });

      if (!isValid) {
        setIsSubmitting(false);
        return;
      };
    } catch (error) {
      console.error('[SignUpForm] Registration failed:', error);
      if (onError) onError(error);
    } finally {
      setIsSubmitting(false);
    }
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

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-mint-cream flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        <div className="hidden lg:block order-2 lg:order-1">
          <div className="relative">
            <div className="bg-gradient-to-br from-golden-yellow/20 to-coral-red/20 rounded-3xl p-8 transform rotate-3 hover:rotate-1 transition-transform duration-500">
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-deep-forest/10">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-coral-pink rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-forest-green mb-2">Join Lynqee</h3>
                    <p className="text-sage-gray text-sm">Start building your digital presence today</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-mint-cream rounded-lg">
                      <div className="w-6 h-6 bg-golden-yellow rounded-full flex items-center justify-center mt-0.5"><Check className="w-3 h-3 text-forest-green" /></div>
                      <div>
                        <div className="text-forest-green font-medium text-sm">Unlimited Links</div>
                        <div className="text-sage-gray text-xs">Add as many links as you want</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-mint-cream rounded-lg">
                      <div className="w-6 h-6 bg-coral-pink rounded-full flex items-center justify-center mt-0.5"><Check className="w-3 h-3 text-white" /></div>
                      <div>
                        <div className="text-forest-green font-medium text-sm">Custom Themes</div>
                        <div className="text-sage-gray text-xs">Personalize your page design</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-mint-cream rounded-lg">
                      <div className="w-6 h-6 bg-coral-red rounded-full flex items-center justify-center mt-0.5"><Check className="w-3 h-3 text-white" /></div>
                      <div>
                        <div className="text-forest-green font-medium text-sm">Analytics Dashboard</div>
                        <div className="text-sage-gray text-xs">Track your link performance</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto w-full order-1 lg:order-2">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-forest-green mb-2">Create Account</h1>
            <p className="text-sage-gray">Join thousands of creators on Lynqee</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-forest-green mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-sage-gray" /></div>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} onBlur={handleInputBlur} disabled={isSubmitting} className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:border-transparent transition-colors ${errors.email && touched.email ? 'border-coral-red bg-coral-red/5' : 'border-sage-gray/30 bg-white hover:border-sage-gray/50'}`} placeholder="Enter your email" />
              </div>
              {errors.email && touched.email && <p className="mt-1 text-sm text-coral-red">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-forest-green mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-sage-gray" /></div>
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} onBlur={handleInputBlur} disabled={isSubmitting} className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:border-transparent transition-colors ${errors.password && touched.password ? 'border-coral-red bg-coral-red/5' : 'border-sage-gray/30 bg-white hover:border-sage-gray/50'}`} placeholder="Create a password" />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-5 w-5 text-sage-gray hover:text-forest-green transition-colors" /> : <Eye className="h-5 w-5 text-sage-gray hover:text-forest-green transition-colors" />}</button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-sage-gray">Password strength:</span>
                    <span className={`text-xs font-medium text-${passwordStrength.color}`}>{passwordStrength.label}</span>
                  </div>
                  <div className="w-full bg-sage-gray/20 rounded-full h-2"><div className={`h-2 rounded-full transition-all duration-300 bg-${passwordStrength.color}`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }}></div></div>
                </div>
              )}
              {errors.password && touched.password && <p className="mt-1 text-sm text-coral-red">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-forest-green mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-sage-gray" /></div>
                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange} onBlur={handleInputBlur} disabled={isSubmitting} className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:border-transparent transition-colors ${errors.confirmPassword && touched.confirmPassword ? 'border-coral-red bg-coral-red/5' : 'border-sage-gray/30 bg-white hover:border-sage-gray/50'}`} placeholder="Confirm your password" />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff className="h-5 w-5 text-sage-gray hover:text-forest-green transition-colors" /> : <Eye className="h-5 w-5 text-sage-gray hover:text-forest-green transition-colors" />}</button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && <p className="mt-1 text-sm text-coral-red">{errors.confirmPassword}</p>}
            </div>
            <p className="text-xs text-sage-gray text-center leading-relaxed">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-forest-green hover:text-deep-forest underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-forest-green hover:text-deep-forest underline">Privacy Policy</a>.
            </p>
            <button type="submit" disabled={isSubmitting} className="w-full bg-golden-yellow text-forest-green font-semibold py-3 px-4 rounded-lg hover:bg-golden-yellow/80 focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center">
              {isSubmitting ? <div className="w-5 h-5 border-2 border-forest-green border-t-transparent rounded-full animate-spin"></div> : <>Create Account <ArrowRight className="ml-2 h-5 w-5" /></>}
            </button>
            <div className="text-center">
              <p className="text-sage-gray">
                Already have an account?{' '}
                <button type="button" onClick={onSwitchToSignIn} className="text-forest-green font-medium hover:text-deep-forest transition-colors">Sign In</button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

SignUpForm.propTypes = {
  onSwitchToSignIn: PropTypes.func.isRequired,
  onSignUpSuccess: PropTypes.func,
  onError: PropTypes.func,
};

export default SignUpForm;
