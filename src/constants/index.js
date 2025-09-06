// Application-wide constants

// App configuration
export const APP_CONFIG = {
  APP_NAME: 'Lynqee',
  APP_VERSION: '1.0.0',
  MAX_LINKS_PER_USER: 150,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
};

// Session management
export { SESSION_CONFIG, SESSION_EVENTS } from './session.js';

// Route paths
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROFILE_SETUP: '/setup',
  PUBLIC_PROFILE: '/:username',
};

// API endpoints (if needed for external APIs)
export const API_ENDPOINTS = {
  // Example: EXTERNAL_API: 'https://api.example.com',
};

// Validation rules
export const VALIDATION_RULES = {
  USERNAME_PATTERN: /^[a-zA-Z0-9_-]+$/,
  URL_PATTERN: /^https?:\/\/.+/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// UI constants
export const UI_CONSTANTS = {
  MOBILE_BREAKPOINT: 768,
  TOUCH_TARGET_MIN_SIZE: 44, // pixels
  ANIMATION_DURATION: 200, // milliseconds
};
