// Validation error messages
export const VALIDATION_MESSAGES = {
  // General validation
  REQUIRED: 'This field is required',
  
  // Email validation
  EMAIL_IS_REQUIRED: 'Email address is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  
  // Password validation
  PASSWORD_IS_REQUIRED: 'Password is required',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  
  // Username validation
  USERNAME_REQUIRED: 'Username is required',
  USERNAME_TOO_SHORT: 'Username must be at least 3 characters',
  USERNAME_TOO_LONG: 'Username must be no more than 30 characters',
  USERNAME_INVALID_CHARS: 'Username can only contain letters, numbers, hyphens, and underscores',
  USERNAME_TAKEN: 'This username is already taken',
  USERNAME_NOT_AVAILABLE: 'This username is not available',
  
  // Link validation
  LINK_TITLE_REQUIRED: 'Link title is required',
  LINK_TITLE_EMPTY: 'Link title cannot be empty',
  LINK_TITLE_TOO_LONG: 'Link title must be no more than 50 characters',
  LINK_TITLE_LINE_BREAKS: 'Link title cannot contain line breaks',
  LINK_URL_REQUIRED: 'URL is required',
  LINK_URL_INVALID: 'Please enter a valid URL',
  LINK_URL_PROTOCOL_REQUIRED: 'URL must start with http:// or https://',
  LINK_URL_PRIVATE_NETWORK: 'Local and private network URLs are not allowed',
  LINK_URL_INVALID_DOMAIN: 'Please enter a valid URL with a proper domain',
  LINK_URL_TOO_LONG: 'URL must be no more than 500 characters',
  LINK_URL_INVALID_CHARS: 'URL cannot contain spaces or line breaks',
  LINK_LIMIT_EXCEEDED: 'You have reached the maximum number of links allowed for your profile',
  
  // Profile validation
  PROFILE_NAME_TOO_LONG: 'Name must be 50 characters or less',
  PROFILE_BIO_TOO_LONG: 'Bio must be {0} characters or less',
  
  // Dynamic duplicate messages
  LINK_URL_DUPLICATE: 'This URL already exists in your links: "{0}"',
  LINK_TITLE_DUPLICATE: 'A link with this title already exists: "{0}"',
  
  // General errors
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// Error messages for different contexts
export const ERROR_MESSAGES = {
  // User-friendly error messages by type
  TYPE: {
    network: 'Unable to connect to the server. Please check your internet connection and try again.',
    profileNotFound: 'The requested content was not found.',
    auth: 'The email or password you entered is incorrect. Please check and try again.',
    emailVerification: 'Please verify your email address before signing in. Check your inbox for a verification link.',
    rateLimit: 'Too many attempts. Please wait a few minutes before trying again.',
    validation: 'Please check your information is correct and try again.',
    duplicate: 'This item already exists. Please try a different value.',
    linkLimit: 'You have reached the maximum number of links allowed. Please delete some links before adding new ones.',
    general: 'An unexpected error occurred. Please try again.'
  },
  
  // Context-specific error messages
  CONTEXT: {
    link: {
      duplicate: 'A link with this URL already exists in your collection.',
      validation: 'Please ensure you have a valid URL and link information, then try again.',
      network: 'Unable to save your link. Please check your connection and try again.',
      linkLimit: 'You have reached the maximum number of links allowed for your profile. Please delete some links before adding new ones.',
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
  }
};

// Service-specific error messages
export const SERVICE_ERROR_MESSAGES = {
  // LinksService error messages
  LINKS: {
    PERMISSION_DENIED: 'You do not have permission to perform this action',
    NOT_FOUND: 'The link you are trying to access no longer exists',
    URL_DUPLICATE: 'A link with this URL already exists in your profile',
    TITLE_DUPLICATE: 'A link with this title already exists in your profile',
    CONFLICT: 'This link conflicts with an existing link',
    AUTH_REQUIRED: 'Unable to save link. Please try logging out and back in',
    INVALID_DATA: 'Invalid link data. Please check your input and try again',
    TIMEOUT: 'Request timeout. Please check your connection and try again',
    RATE_LIMIT: 'Rate limit exceeded. Please wait a moment and try again',
    NETWORK: 'Network error. Please check your connection and try again',
    MISSING_DATA: 'Missing required link data (title, url, or user_id)'
  },
  
  // Profile service error messages
  PROFILE: {
    FAILED_UPLOAD: 'Failed to upload avatar'
  },
  
  // Form validation error messages
  FORM: {
    VALIDATION_TITLE: 'Form Validation',
    VALIDATION_MESSAGE: 'Please fill in all required fields correctly.',
    VALIDATION_ERROR_TITLE: 'Validation Error'
  }
};

// Utility function to format messages with placeholders
export const formatMessage = (template, ...values) => {
  return template.replace(/{(\d+)}/g, (match, index) => {
    return values[index] !== undefined ? values[index] : match;
  });
};
