import { VALIDATION_RULES } from '../constants';
import { VALIDATION_MESSAGES, formatMessage } from '../constants/validationMessages';

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
    return { isValid: false, error: VALIDATION_MESSAGES.USERNAME_REQUIRED };
  }
  
  if (username.length < 3) {
    return { isValid: false, error: VALIDATION_MESSAGES.USERNAME_TOO_SHORT };
  }
  
  if (username.length > 30) {
    return { isValid: false, error: VALIDATION_MESSAGES.USERNAME_TOO_LONG };
  }
  
  if (!VALIDATION_RULES.USERNAME_PATTERN.test(username)) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.USERNAME_INVALID_CHARS
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
    return { isValid: false, error: VALIDATION_MESSAGES.PASSWORD_IS_REQUIRED };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: VALIDATION_MESSAGES.PASSWORD_TOO_SHORT };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates a link title
 * @param {string} title - The link title to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validateLinkTitle = (title) => {
  if (!title || !title.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.LINK_TITLE_REQUIRED };
  }
  
  const trimmedTitle = title.trim();
  
  if (trimmedTitle.length < 1) {
    return { isValid: false, error: VALIDATION_MESSAGES.LINK_TITLE_EMPTY };
  }
  
  if (trimmedTitle.length > 50) {
    return { isValid: false, error: VALIDATION_MESSAGES.LINK_TITLE_TOO_LONG };
  }
  
  // Check for potentially problematic characters
  if (trimmedTitle.includes('\n') || trimmedTitle.includes('\r')) {
    return { isValid: false, error: VALIDATION_MESSAGES.LINK_TITLE_LINE_BREAKS };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates a link URL with enhanced checking
 * @param {string} url - The URL to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validateLinkUrl = (url) => {
  if (!url || !url.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.LINK_URL_REQUIRED };
  }
  
  const trimmedUrl = url.trim();
  
  // Check basic URL pattern
  if (!VALIDATION_RULES.URL_PATTERN.test(trimmedUrl)) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.LINK_URL_PROTOCOL_REQUIRED
    };
  }
  
  // Additional URL validation
  try {
    const urlObj = new URL(trimmedUrl);
    
    // Check for localhost or private networks in production
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return { 
        isValid: false, 
        error: VALIDATION_MESSAGES.LINK_URL_PRIVATE_NETWORK
      };
    }
    
    // Check for valid domain structure
    if (!hostname.includes('.') && hostname !== 'localhost') {
      return { 
        isValid: false, 
        error: VALIDATION_MESSAGES.LINK_URL_INVALID_DOMAIN
      };
    }
    
  } catch {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.LINK_URL_INVALID
    };
  }
  
  // More realistic URL length limit
  if (trimmedUrl.length > 500) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.LINK_URL_TOO_LONG
    };
  }
  
  // Check for suspicious characters
  if (trimmedUrl.includes(' ') || trimmedUrl.includes('\n') || trimmedUrl.includes('\r')) {
    return { 
      isValid: false, 
      error: VALIDATION_MESSAGES.LINK_URL_INVALID_CHARS
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates complete link data
 * @param {Object} linkData - Object containing title and url
 * @param {Array} existingLinks - Array of existing links to check for duplicates (optional)
 * @param {string} currentLinkId - ID of current link being edited (optional, for edit mode)
 * @returns {Object} Validation result with isValid, errors object, and hasErrors boolean
 */
export const validateLinkData = (linkData, existingLinks = [], currentLinkId = null) => {
  const { title, url } = linkData;
  
  const titleValidation = validateLinkTitle(title);
  const urlValidation = validateLinkUrl(url);
  
  const errors = {};
  
  if (!titleValidation.isValid) {
    errors.title = titleValidation.error;
  }
  
  if (!urlValidation.isValid) {
    errors.url = urlValidation.error;
  }
  
  // Check for duplicate URL (if existing links provided)
  if (urlValidation.isValid && existingLinks && existingLinks.length > 0) {
    const duplicateLink = existingLinks.find(link => {
      // Skip current link in edit mode
      if (currentLinkId && link.id === currentLinkId) {
        return false;
      }
      // Normalize URLs for comparison
      const normalizedExisting = normalizeUrlForComparison(link.url);
      const normalizedNew = normalizeUrlForComparison(url);
      return normalizedExisting === normalizedNew;
    });
    
    if (duplicateLink) {
      errors.url = formatMessage(VALIDATION_MESSAGES.LINK_URL_DUPLICATE, duplicateLink.title);
    }
  }
  
  // Check for duplicate title (if existing links provided)
  if (titleValidation.isValid && existingLinks && existingLinks.length > 0) {
    const duplicateTitle = existingLinks.find(link => {
      // Skip current link in edit mode
      if (currentLinkId && link.id === currentLinkId) {
        return false;
      }
      return link.title && link.title.trim().toLowerCase() === title.trim().toLowerCase();
    });
    
    if (duplicateTitle) {
      errors.title = formatMessage(VALIDATION_MESSAGES.LINK_TITLE_DUPLICATE, duplicateTitle.title);
    }
  }
  
  const hasErrors = Object.keys(errors).length > 0;
  
  return {
    isValid: !hasErrors,
    errors,
    hasErrors
  };
};

/**
 * Normalize URL for comparison (remove trailing slashes, convert to lowercase, etc.)
 * @param {string} url - URL to normalize
 * @returns {string} Normalized URL
 */
export const normalizeUrlForComparison = (url) => {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    // Remove trailing slash, convert to lowercase
    let normalized = urlObj.toString().toLowerCase();
    if (normalized.endsWith('/') && normalized !== urlObj.protocol + '//') {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    // If URL parsing fails, just do basic normalization
    return url.toLowerCase().replace(/\/$/, '');
  }
};
