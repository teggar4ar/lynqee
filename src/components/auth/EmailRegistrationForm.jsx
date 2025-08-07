/**
 * EmailRegistrationForm - Email and password registration form
 * 
 * Features:
 * - Mobile-first form design with touch-optimized inputs
 * - Real-time validation with clear error feedback
 * - Password confirmation
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

const EmailRegistrationForm = ({ onSuccess, onError, className = '' }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const result = await signUp(
          validatedData.email, 
          validatedData.password,
          { signup_method: 'email' }
        );

        if (onSuccess) {
          onSuccess(result);
        }
      });

      if (!isValid) {
        console.warn('[EmailRegistrationForm] Form validation failed');
      }
    } catch (error) {
      console.error('[EmailRegistrationForm] Registration failed:', error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
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
        disabled={isSubmitting}
      />

      {/* Password Input */}
      <Input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        label="Password"
        placeholder="Create a password (min 8 characters)"
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
        label="Confirm Password"
        placeholder="Confirm your password"
        error={errors.confirmPassword}
        touched={touched.confirmPassword}
        required
        autoComplete="new-password"
        disabled={isSubmitting}
      />

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
          fullWidth
        >
          Create Account
        </Button>
      </div>

      {/* Terms Notice */}
      <p className="text-xs text-gray-600 text-center leading-relaxed">
        By creating an account, you agree to our{' '}
        <a href="/terms" className="text-blue-500 hover:text-blue-600 underline">
          Terms of Service
        </a>
        {' '}and{' '}
        <a href="/privacy" className="text-blue-500 hover:text-blue-600 underline">
          Privacy Policy
        </a>
      </p>
    </form>
  );
};

EmailRegistrationForm.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  className: PropTypes.string,
};

export default EmailRegistrationForm;
