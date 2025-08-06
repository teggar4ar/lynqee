import { VALIDATION_RULES } from '../constants';

/**
 * Validation utilities for form inputs
 */

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  return VALIDATION_RULES.EMAIL_PATTERN.test(email);
};

/**
 * Validates a URL
 * @param {string} url - The URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  return VALIDATION_RULES.URL_PATTERN.test(url);
};

/**
 * Validates a username
 * @param {string} username - The username to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validateUsername = (username) => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 30) {
    return { isValid: false, error: 'Username must be no more than 30 characters' };
  }
  
  if (!VALIDATION_RULES.USERNAME_PATTERN.test(username)) {
    return { 
      isValid: false, 
      error: 'Username can only contain letters, numbers, hyphens, and underscores' 
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates a password
 * @param {string} password - The password to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }
  
  return { isValid: true, error: null };
};
