/**
 * Error Detection and Formatting Utilities
 * 
 * Comprehensive utilities for handling different types of errors consistently
 * across the application. Provides type detection, formatting, and user-friendly
 * messaging for various error scenarios.
 */

/**
 * Determines the error type based on error details
 * @param {Error|string|any} error - The error to analyze
 * @returns {string} - The error type identifier
 */
export const getErrorType = (error) => {
  if (!error) return 'general';
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorLower = errorMessage.toLowerCase();
  
  // Network-related errors
  if (
    errorLower.includes('failed to fetch') ||
    errorLower.includes('network error') ||
    errorLower.includes('connection') ||
    errorLower.includes('timeout')
  ) {
    return 'network';
  }
  
  // Not found errors (404)
  if (
    errorLower.includes('not found') ||
    errorLower.includes('404') ||
    (error.status === 404)
  ) {
    return 'profileNotFound';
  }
  
  // Unauthorized access (401, 403)
  if (
    errorLower.includes('unauthorized') ||
    errorLower.includes('forbidden') ||
    errorLower.includes('access denied') ||
    (error.status === 401) ||
    (error.status === 403)
  ) {
    return 'unauthorized';
  }
  
  // Rate limiting errors
  if (
    errorLower.includes('rate limit') ||
    errorLower.includes('too many requests') ||
    (error.status === 429)
  ) {
    return 'rateLimit';
  }
  
  // Validation errors
  if (
    errorLower.includes('validation') ||
    errorLower.includes('invalid') ||
    (error.status === 400)
  ) {
    return 'validation';
  }
  
  return 'general';
};

/**
 * Gets a user-friendly error message based on error type
 * @param {Error|string|any} error - The error to get message for
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
  const errorType = getErrorType(error);
  
  const messages = {
    network: 'Unable to connect to the server. Please check your internet connection and try again.',
    profileNotFound: 'The requested content was not found.',
    unauthorized: 'You don\'t have permission to access this content.',
    rateLimit: 'Too many requests. Please wait a moment and try again.',
    validation: 'Please check your input and try again.',
    general: 'Something went wrong. Please try again.'
  };
  
  return messages[errorType] || messages.general;
};

/**
 * Formats error for display, handling different error types
 * @param {Error|string|any} error - The error to format
 * @returns {string|null} - Formatted error message or null if no error
 */
export const formatError = (error) => {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return 'An unexpected error occurred';
};

/**
 * Checks if error is network-related
 * @param {Error|string|any} error - The error to check
 * @returns {boolean} - True if error is network-related
 */
export const isNetworkError = (error) => {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorLower = errorMessage.toLowerCase();
  
  return error?.code === 'NETWORK_ERROR' || 
         errorLower.includes('network') ||
         errorLower.includes('fetch') ||
         errorLower.includes('connection') ||
         errorLower.includes('timeout');
};

/**
 * Checks if error is authorization-related
 * @param {Error|string|any} error - The error to check
 * @returns {boolean} - True if error is authorization-related
 */
export const isAuthError = (error) => {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorLower = errorMessage.toLowerCase();
  
  return (error.status === 401) ||
         (error.status === 403) ||
         errorLower.includes('unauthorized') ||
         errorLower.includes('forbidden') ||
         errorLower.includes('access denied');
};

/**
 * Checks if error is validation-related
 * @param {Error|string|any} error - The error to check
 * @returns {boolean} - True if error is validation-related
 */
export const isValidationError = (error) => {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorLower = errorMessage.toLowerCase();
  
  return (error.status === 400) ||
         errorLower.includes('validation') ||
         errorLower.includes('invalid') ||
         errorLower.includes('required');
};
