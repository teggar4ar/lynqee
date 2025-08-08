/**
 * Error Detection Utilities
 * 
 * Simple utilities for handling common errors.
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
    errorLower.includes('connection')
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
    general: 'Something went wrong. Please try again.'
  };
  
  return messages[errorType] || messages.general;
};
