/**
 * ResetPassword Page - Handles password reset from email links
 * 
 * This page is accessed when users click the reset password link in their email.
 * It extracts the access token from URL parameters and allows users to set a new password.
 * 
 * Features:
 * - Mobile-first responsive design
 * - Token validation and error handling
 * - New password form with confirmation
 * - Automatic redirect after successful reset
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase.js';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import { ErrorDisplay } from '../components/common/index.js';
import { useFormValidation } from '../hooks/useFormValidation.js';
import { VALIDATION_MESSAGES } from '../constants/validationMessages.js';
import { InitialLoading } from '../components/common/ModernLoading.jsx';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [status, setStatus] = useState('verifying'); // 'verifying', 'ready', 'error', 'success'
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasBeenAuthenticated, setHasBeenAuthenticated] = useState(false); // Track if we were ever authenticated

  // Effect to handle authentication state changes
  useEffect(() => {
    // Don't do anything if AuthContext is still loading initial session
    if (isLoading) {
      return;
    }

    // If we're authenticated, mark that we've been authenticated and set ready status
    if (isAuthenticated) {
      setHasBeenAuthenticated(true);
      setStatus('ready');
    } else {
      // Only show error if we were never authenticated (invalid link)
      // If we were authenticated before, it means we successfully reset password and signed out
      if (!hasBeenAuthenticated) {
        setError('Password reset link is invalid or has expired.');
        setStatus('error');
      }
      // If hasBeenAuthenticated is true, don't change status - keep current state
    }
  }, [isLoading, isAuthenticated, hasBeenAuthenticated]);

  // Aturan validasi (tidak berubah)
  const validationRules = {
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

  const { errors, touched, handleBlur, handleChange, submitForm } = useFormValidation(validationRules);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      await submitForm(formData, async (validatedData) => {
        const { error: updateError } = await supabase.auth.updateUser({
          password: validatedData.password,
        });

        if (updateError) {
          throw updateError;
        }

        setStatus('success');
        
        // Redirect to dashboard after successful password reset (keep user logged in)
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }, {
        showAlerts: false  // Disable automatic validation alerts
      });
    } catch (err) {
      console.error('[ResetPassword] Password reset failed:', err);
      setError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    handleChange(name, value);
    if (error) setError('');
  };

  // ----- UI Display Based on Status -----
  
  // Show spinner while AuthContext is still working or we're still 'verifying'
  if (isLoading || status === 'verifying') {
    return (
      <InitialLoading message="Verifying link..." />
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <h2 className="text-xl font-semibold text-red-600">Invalid Link</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => navigate('/')} variant="primary">Back to Login Page</Button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <h2 className="text-xl font-semibold text-green-600">Password Successfully Changed!</h2>
          <p className="text-gray-600">You will be redirected to the dashboard in a few seconds.</p>
        </div>
      </div>
    );
  }

  // If status === 'ready', show form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your new password below</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="password" name="password" value={formData.password} onChange={handleInputChange} onBlur={handleBlur} label="New Password" placeholder="Minimum 8 characters" error={errors.password} touched={touched.password} required disabled={isSubmitting} />
          <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} onBlur={handleBlur} label="Confirm New Password" placeholder="Retype your new password" error={errors.confirmPassword} touched={touched.confirmPassword} required disabled={isSubmitting} />
          {error && 
            <ErrorDisplay 
              error={error} 
              className="mb-3 md:mb-4"
            />
          }
          <div className="pt-2">
            <Button type="submit" variant="primary" loading={isSubmitting} fullWidth>Change Password</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;