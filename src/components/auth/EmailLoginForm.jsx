/**
 * EmailLoginForm - Email and password login form
 * 
 * Features:
 * - Mobile-first form design with touch-optimized inputs
 * - Real-time validation with clear error feedback
 * - "Forgot password" functionality
 * - Loading states and error handling
 * - Keyboard-friendly mobile experience
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import { useFormValidation } from '../../hooks/useFormValidation.js';
import { useAuth } from '../../hooks/useAuth.js';
import { VALIDATION_MESSAGES } from '../../constants/validationMessages.js';
import { isValidEmail } from '../../utils/validators.js';

const EmailLoginForm = ({ 
  onSuccess, 
  onError, 
  onForgotPassword,
  className = '' 
}) => {
  const { signIn, resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Validation rules
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    handleChange(name, value);
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

    try {
      const isValid = await submitForm(formData, async (validatedData) => {
        const result = await signIn(
          validatedData.email, 
          validatedData.password
        );

        if (onSuccess) {
          onSuccess(result);
        }
      });

      if (!isValid) {
        console.log('[EmailLoginForm] Form validation failed');
      }
    } catch (error) {
      console.error('[EmailLoginForm] Login failed:', error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!formData.email) {
      // Show error if no email entered
      handleBlur('email', '');
      return;
    }

    if (!isValidEmail(formData.email)) {
      handleBlur('email', formData.email);
      return;
    }

    setIsResettingPassword(true);

    try {
      await resetPassword(formData.email);
      
      if (onForgotPassword) {
        onForgotPassword(formData.email);
      } else {
        alert('Password reset link sent to your email!');
      }
    } catch (error) {
      console.error('[EmailLoginForm] Password reset failed:', error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Email Input */}
      <Input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        label="Email Address"
        placeholder="Enter your email"
        error={errors.email}
        touched={touched.email}
        required
        autoComplete="email"
        disabled={isSubmitting || isResettingPassword}
      />

      {/* Password Input */}
      <Input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        label="Password"
        placeholder="Enter your password"
        error={errors.password}
        touched={touched.password}
        required
        autoComplete="current-password"
        disabled={isSubmitting || isResettingPassword}
      />

      {/* Forgot Password Link */}
      <div className="text-right">
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={isSubmitting || isResettingPassword}
          className="text-sm text-blue-500 hover:text-blue-600 underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResettingPassword ? 'Sending...' : 'Forgot password?'}
        </button>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting || isResettingPassword}
          fullWidth
        >
          Sign In
        </Button>
      </div>
    </form>
  );
};

EmailLoginForm.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  onForgotPassword: PropTypes.func,
  className: PropTypes.string,
};

export default EmailLoginForm;
