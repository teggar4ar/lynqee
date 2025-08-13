/**
 * LandingPage - Main landing page with authentication
 * 
 * Features:
 * - Mobile-first responsive design
 * - Toggle between login and registration forms
 * - Google OAuth integration
 * - Error handling and success feedback
 * - Clean, modern UI optimized for touch devices
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmailLoginForm, EmailRegistrationForm, EmailVerificationPending, GoogleOAuthButton } from '../components/auth';
import { Button, ErrorDisplay } from '../components/common';
import { useAuth } from '../hooks/useAuth.js';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', or 'verify-email'
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null);

  // Check for password reset success message
  useEffect(() => {
    const passwordReset = searchParams.get('passwordReset');
    if (passwordReset === 'success') {
      setSuccess('Password updated successfully! You can now sign in with your new password.');
      // Clear the URL parameter
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('passwordReset');
      navigate({ search: newSearchParams.toString() }, { replace: true });
    }
  }, [searchParams, navigate]);

  // Track if we've already initiated a redirect to prevent race conditions
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect authenticated users to dashboard - SINGLE SOURCE OF TRUTH
  useEffect(() => {
    if (!isLoading && user && !isRedirecting) {
      setIsRedirecting(true);
      // Use replace to avoid back button issues
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate, isRedirecting]);

  // Handle authentication success
  const handleAuthSuccess = (result) => {
    setError(null);
    
    // Check if this is a registration that needs email verification
    if (result?.user && !result.session) {
      // User was created but needs email verification
      setPendingVerificationEmail(result.user.email);
      setAuthMode('verify-email');
      setSuccess('Registration successful! Please check your email to verify your account.');
      return;
    }
    
    // For successful login, just show success message
    // The useEffect will handle navigation when user state updates
    setSuccess('Authentication successful! Redirecting...');
    
    // Don't manually navigate here - let the useEffect handle it
    // This prevents race conditions and double navigation
  };

  // Handle authentication error
  const handleAuthError = (error) => {
    console.error('[LandingPage] Auth error:', error);
    setSuccess(null);
    
    // Check for specific error types and provide user-friendly messages
    if (error.message && error.message.includes('Invalid login credentials')) {
      setError('Account not verified or invalid credentials. Please check your email for a verification link, or try registering again.');
    } else if (error.message && error.message.includes('Email not confirmed')) {
      setError('Please verify your email address before signing in. Check your inbox for a verification link.');
    } else if (error.message && error.message.includes('only request this after')) {
      setError('Please wait a moment before requesting another password reset email.');
    } else if (error.message && error.message.includes('Too Many Requests')) {
      setError('Too many requests. Please wait a moment and try again.');
    } else {
      setError(error.message || 'Authentication failed. Please try again.');
    }
  };

  // Handle forgot password
  const handleForgotPassword = (email) => {
    setError(null);
    setSuccess(`Password reset link sent to ${email}. Check your email!`);
  };

  // Toggle between login and register
  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login');
    setError(null);
    setSuccess(null);
    setPendingVerificationEmail(null);
  };

  // Handle back to login from verification screen
  const handleBackToLogin = () => {
    setAuthMode('login');
    setError(null);
    setSuccess(null);
    setPendingVerificationEmail(null);
  };

  // Show loading state while checking authentication or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isRedirecting ? 'Redirecting to dashboard...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Lynqee</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-4 py-8 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your links, all in one place
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Create a simple page with all your important links. 
              Perfect for social media bios, business cards, and more.
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}

            {error && (
              <ErrorDisplay 
                error={error} 
                className="mb-6" 
              />
            )}

            {/* Auth Mode Title */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {authMode === 'login' && 'Welcome back'}
                {authMode === 'register' && 'Create your account'}
                {authMode === 'verify-email' && 'Verify your email'}
              </h3>
              <p className="text-gray-600 mt-2">
                {authMode === 'login' && 'Sign in to manage your links'}
                {authMode === 'register' && 'Get started with your link page'}
                {authMode === 'verify-email' && 'Complete your registration'}
              </p>
            </div>

            {/* Render different content based on auth mode */}
            {authMode === 'verify-email' ? (
              <EmailVerificationPending
                email={pendingVerificationEmail}
                onBackToLogin={handleBackToLogin}
              />
            ) : (
              <>
                {/* Google OAuth Button */}
                <div className="mb-6">
                  <GoogleOAuthButton
                    onSuccess={handleAuthSuccess}
                    onError={handleAuthError}
                    // --- PERBAIKAN DI SINI ---
                    // Arahkan ke dashboard setelah login berhasil.
                    // Pastikan URL origin tetap ada untuk membentuk URL yang lengkap.
                    redirectTo={`${window.location.origin}/dashboard`} 
                  >
                    {authMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
                  </GoogleOAuthButton>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                {/* Email Form */}
                {authMode === 'login' ? (
                  <EmailLoginForm
                    key="login-form" // Prevent remounting when switching modes
                    onSuccess={handleAuthSuccess}
                    onError={handleAuthError}
                    onForgotPassword={handleForgotPassword}
                  />
                ) : (
                  <EmailRegistrationForm
                    key="register-form" // Prevent remounting when switching modes
                    onSuccess={handleAuthSuccess}
                    onError={handleAuthError}
                  />
                )}

                {/* Toggle Auth Mode */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600 text-sm">
                    {authMode === 'login' 
                      ? "Don't have an account? " 
                      : "Already have an account? "}
                    <button
                      onClick={toggleAuthMode}
                      className="text-blue-500 hover:text-blue-600 font-medium underline"
                    >
                      {authMode === 'login' ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Feature Preview */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Example: <span className="font-mono text-blue-500">lynqee.com/yourname</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2025 Lynqee. Made for creators, by creators.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
