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
  
  // Extract message properly from different error formats
  let errorMessage = '';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    errorMessage = error.message || String(error);
  } else {
    errorMessage = String(error);
  }
  
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
  
  // Authentication errors
  if (
    errorLower.includes('authentication') ||
    errorLower.includes('unauthorized') ||
    errorLower.includes('forbidden') ||
    errorLower.includes('access denied') ||
    errorLower.includes('invalid token') ||
    (error.status === 401) ||
    (error.status === 403)
  ) {
    return 'auth';
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
    errorLower.includes('required') ||
    errorLower.includes('email is required') ||
    errorLower.includes('invalid email format') ||
    (error.status === 400)
  ) {
    return 'validation';
  }
  
  // Duplicate/unique constraint errors (database conflicts)
  if (
    errorLower.includes('duplicate') ||
    errorLower.includes('unique') ||
    errorLower.includes('already exists') ||
    errorLower.includes('unique constraint') ||
    (error.status === 409)
  ) {
    return 'duplicate';
  }
  
  return 'general';
};

/**
 * Gets a user-friendly error message based on error type
 * @param {Error|string|any} error - The error to get message for
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
  // For string errors, check if they need type-based processing
  if (typeof error === 'string') {
    // Apply type detection to string errors too
    const errorType = getErrorType(error);
    if (errorType !== 'general') {
      // Return typed message instead of original string
      const messages = {
        network: 'Unable to connect to the server. Please check your internet connection and try again.',
        profileNotFound: 'The requested content was not found.',
        auth: 'Please check your sign in credentials and try again.',
        rateLimit: 'Please slow down and try again later.',
        validation: 'Please check your information is correct and try again.',
        duplicate: 'This item already exists. Please try a different value.',
      };
      return messages[errorType];
    }
    return error; // Return original string only for general type
  }
  
  // Handle objects with nested messages
  if (error && typeof error === 'object') {
    // Try to extract message from nested structures
    if (error.error && error.error.message) {
      return error.error.message;
    }
    if (error.details && error.details.message) {
      return error.details.message;
    }
    if (error.message) {
      // Apply type detection to extracted message
      const errorType = getErrorType(error);
      if (errorType !== 'general') {
        const messages = {
          network: 'Unable to connect to the server. Please check your internet connection and try again.',
          profileNotFound: 'The requested content was not found.',
          auth: 'Please check your sign in credentials and try again.',
          rateLimit: 'Please slow down and try again later.',
          validation: 'Please check your information is correct and try again.',
          duplicate: 'This item already exists. Please try a different value.',
        };
        return messages[errorType];
      }
      // For general errors from Error objects
      if (error instanceof Error) {
        // If the message looks like a generic error message, return user-friendly version
        const message = error.message.toLowerCase();
        if (message.includes('unknown error') || message.includes('error occurred') || message === 'error') {
          return 'An unexpected error occurred. Please try again.';
        }
        // Otherwise return the original message (for specific error messages)
        return error.message;
      }
      // For general errors from plain objects, return the original message
      return error.message;
    }
  }
  
  const errorType = getErrorType(error);
  
  // Only return generic message if we have no actual message to show
  const messages = {
    network: 'Unable to connect to the server. Please check your internet connection and try again.',
    profileNotFound: 'The requested content was not found.',
    auth: 'Please check your sign in credentials and try again.',
    rateLimit: 'Please slow down and try again later.',
    validation: 'Please check your information is correct and try again.',
    duplicate: 'This item already exists. Please try a different value.'
  };
  
  return messages[errorType] || 'An unexpected error occurred. Please try again.';
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
  
  const errorMessage = error instanceof Error ? error.message : 
                      (error && typeof error === 'object' && error.message) ? error.message : 
                      String(error);
  const errorLower = errorMessage.toLowerCase();
  
  return error?.code === 'NETWORK_ERROR' || 
         errorLower.includes('network') ||
         errorLower.includes('failed to fetch') ||
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
  
  const errorMessage = error instanceof Error ? error.message : 
                      (error && typeof error === 'object' && error.message) ? error.message : 
                      String(error);
  const errorLower = errorMessage.toLowerCase();
  
  return (error.status === 401) ||
         (error.status === 403) ||
         errorLower.includes('authentication') ||
         errorLower.includes('unauthorized') ||
         errorLower.includes('forbidden') ||
         errorLower.includes('access denied') ||
         errorLower.includes('invalid token');
};

/**
 * Checks if error is validation-related
 * @param {Error|string|any} error - The error to check
 * @returns {boolean} - True if error is validation-related
 */
export const isValidationError = (error) => {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : 
                      (error && typeof error === 'object' && error.message) ? error.message : 
                      String(error);
  const errorLower = errorMessage.toLowerCase();
  
  return (error.status === 400) ||
         errorLower.includes('validation') ||
         errorLower.includes('invalid') ||
         errorLower.includes('required');
};

/**
 * Checks if error is duplicate/unique constraint related
 * @param {Error|string|any} error - The error to check
 * @returns {boolean} - True if error is duplicate-related
 */
export const isDuplicateError = (error) => {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : 
                      (error && typeof error === 'object' && error.message) ? error.message : 
                      String(error);
  const errorLower = errorMessage.toLowerCase();
  
  return (error.status === 409) ||
         errorLower.includes('duplicate') ||
         errorLower.includes('unique') ||
         errorLower.includes('already exists');
};

/**
 * Gets a specific user-friendly message for link-related errors
 * @param {Error|string|any} error - The error to get message for
 * @param {string} context - The context (e.g., 'link', 'profile', 'user')
 * @returns {string} - Context-specific error message
 */
export const getContextualErrorMessage = (error, context = 'general') => {
  const errorType = getErrorType(error);
  
  // Context-specific messages for better UX
  const contextualMessages = {
    link: {
      duplicate: 'A link with this URL already exists in your collection.',
      validation: 'Please ensure you have a valid URL and link information, then try again.',
      network: 'Unable to save your link. Please check your connection and try again.',
      general: 'Failed to save the link. Please try again.'
    },
    profile: {
      duplicate: 'This username is already taken. Please choose a different profile name.',
      validation: 'Please check your profile information is in the correct format and try again.',
      network: 'Unable to update your profile. Please check your connection and try again.',
      general: 'Failed to update your profile. Please try again.'
    },
    auth: {
      duplicate: 'This email address is already registered. Please try signing in instead.',
      validation: 'Please check your email and password, then try again.',
      network: 'Unable to sign in. Please check your connection and try again.',
      auth: 'Please check your email and password, then sign in again.',
      general: 'Sign in failed. Please try again.'
    }
  };
  
  // For unknown contexts, return a generic unexpected error message
  if (context !== 'link' && context !== 'profile' && context !== 'auth') {
    return 'An unexpected error occurred. Please try again.';
  }
  
  // Return context-specific message if available, otherwise fall back to general
  return contextualMessages[context]?.[errorType] || getUserFriendlyErrorMessage(error);
};

/**
 * Determines if an error should be retried based on error type
 * @param {Error|string|any} error - The error to analyze
 * @returns {boolean} - True if the error should be retried
 */
export const shouldRetryError = (error) => {
  if (!error) return false;
  
  const errorType = getErrorType(error);
  
  // Retry network errors and rate limits, but not auth, validation, or duplicate errors
  const retryableTypes = ['network', 'rateLimit'];
  return retryableTypes.includes(errorType);
};
