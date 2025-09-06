/**
 * Enhanced errorUtils Tests
 * 
 * Tests for the enhanced error utility functions including duplicate detection,
 * context-specific messaging, and comprehensive error type detection.
 */

import { describe, expect, it } from 'vitest';
import {
  getContextualErrorMessage,
  getErrorType,
  getUserFriendlyErrorMessage,
  isAuthError,
  isDuplicateError,
  isNetworkError,
  isValidationError,
  shouldRetryError
} from '../../utils/errorUtils.js';

describe('errorUtils (Enhanced)', () => {
  describe('getErrorType', () => {
    it('detects network errors correctly', () => {
      const networkError = new Error('Failed to fetch');
      expect(getErrorType(networkError)).toBe('network');
      
      const timeoutError = new Error('Network timeout');
      expect(getErrorType(timeoutError)).toBe('network');
      
      const connectionError = { message: 'Connection refused' };
      expect(getErrorType(connectionError)).toBe('network');
    });

    it('detects authentication errors correctly', () => {
      const authError = new Error('Authentication failed');
      expect(getErrorType(authError)).toBe('auth');
      
      const unauthorizedError = { message: 'Unauthorized access' };
      expect(getErrorType(unauthorizedError)).toBe('auth');
      
      const tokenError = new Error('Invalid token');
      expect(getErrorType(tokenError)).toBe('auth');
    });

    it('detects validation errors correctly', () => {
      const validationError = new Error('Validation failed');
      expect(getErrorType(validationError)).toBe('validation');
      
      const requiredError = { message: 'Email is required' };
      expect(getErrorType(requiredError)).toBe('validation');
      
      const formatError = new Error('Invalid email format');
      expect(getErrorType(formatError)).toBe('validation');
    });

    it('detects duplicate errors correctly', () => {
      const duplicateError = new Error('Duplicate entry');
      expect(getErrorType(duplicateError)).toBe('duplicate');
      
      const uniqueError = { message: 'Unique constraint violation' };
      expect(getErrorType(uniqueError)).toBe('duplicate');
      
      const existsError = new Error('Already exists');
      expect(getErrorType(existsError)).toBe('duplicate');
    });

    it('detects rate limit errors correctly', () => {
      const rateLimitError = new Error('Rate limit exceeded');
      expect(getErrorType(rateLimitError)).toBe('rateLimit');
      
      const tooManyError = { message: 'Too many requests' };
      expect(getErrorType(tooManyError)).toBe('rateLimit');
    });

    it('defaults to general for unknown errors', () => {
      const unknownError = new Error('Some unknown error');
      expect(getErrorType(unknownError)).toBe('general');
      
      const customError = { message: 'Custom application error' };
      expect(getErrorType(customError)).toBe('general');
    });

    it('handles null and undefined errors', () => {
      expect(getErrorType(null)).toBe('general');
      expect(getErrorType(undefined)).toBe('general');
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('returns user-friendly messages for network errors', () => {
      const networkError = new Error('Failed to fetch');
      const message = getUserFriendlyErrorMessage(networkError);
      expect(message).toContain('connection');
      expect(message).toContain('check your internet');
    });

    it('returns user-friendly messages for auth errors', () => {
      const authError = new Error('Authentication failed');
      const message = getUserFriendlyErrorMessage(authError);
      expect(message).toContain('email or password');
      expect(message).toContain('incorrect');
    });

    it('returns user-friendly messages for validation errors', () => {
      const validationError = new Error('Validation failed');
      const message = getUserFriendlyErrorMessage(validationError);
      expect(message).toContain('information');
      expect(message).toContain('correct');
    });

    it('returns user-friendly messages for duplicate errors', () => {
      const duplicateError = new Error('Duplicate entry');
      const message = getUserFriendlyErrorMessage(duplicateError);
      expect(message).toContain('already exists');
      expect(message).toContain('different');
    });

    it('returns user-friendly messages for rate limit errors', () => {
      const rateLimitError = new Error('Rate limit exceeded');
      const message = getUserFriendlyErrorMessage(rateLimitError);
      expect(message).toContain('Too many attempts');
      expect(message).toContain('wait a few minutes');
    });

    it('returns generic message for unknown errors', () => {
      const unknownError = new Error('Unknown error');
      const message = getUserFriendlyErrorMessage(unknownError);
      expect(message).toContain('unexpected error');
      expect(message).toContain('try again');
    });

    it('handles string errors', () => {
      const message = getUserFriendlyErrorMessage('Simple error message');
      expect(message).toBe('Simple error message');
    });

    it('handles error objects with nested messages', () => {
      const complexError = {
        error: {
          message: 'Nested error message'
        }
      };
      const message = getUserFriendlyErrorMessage(complexError);
      expect(message).toBe('Nested error message');
    });
  });

  describe('getContextualErrorMessage', () => {
    describe('Link context', () => {
      it('provides context-specific messages for link duplicate errors', () => {
        const duplicateError = new Error('Duplicate entry');
        const message = getContextualErrorMessage(duplicateError, 'link');
        expect(message).toContain('link with this URL');
        expect(message).toContain('already exists');
      });

      it('provides context-specific messages for link validation errors', () => {
        const validationError = new Error('Invalid URL format');
        const message = getContextualErrorMessage(validationError, 'link');
        expect(message).toContain('valid URL');
        expect(message).toContain('link information');
      });

      it('provides context-specific messages for link network errors', () => {
        const networkError = new Error('Failed to fetch');
        const message = getContextualErrorMessage(networkError, 'link');
        expect(message).toContain('save your link');
        expect(message).toContain('connection');
      });
    });

    describe('Profile context', () => {
      it('provides context-specific messages for profile duplicate errors', () => {
        const duplicateError = new Error('Unique constraint violation');
        const message = getContextualErrorMessage(duplicateError, 'profile');
        expect(message).toContain('username');
        expect(message).toContain('already taken');
      });

      it('provides context-specific messages for profile validation errors', () => {
        const validationError = new Error('Validation failed');
        const message = getContextualErrorMessage(validationError, 'profile');
        expect(message).toContain('profile information');
        expect(message).toContain('correct format');
      });
    });

    describe('Auth context', () => {
      it('provides context-specific messages for auth errors', () => {
        const authError = new Error('Authentication failed');
        const message = getContextualErrorMessage(authError, 'auth');
        expect(message).toContain('email and password');
        expect(message).toContain('sign in');
      });

      it('provides context-specific messages for auth duplicate errors', () => {
        const duplicateError = new Error('User already exists');
        const message = getContextualErrorMessage(duplicateError, 'auth');
        expect(message).toContain('email address');
        expect(message).toContain('already registered');
      });
    });

    it('falls back to general message for unknown contexts', () => {
      const error = new Error('Test error');
      const message = getContextualErrorMessage(error, 'unknown-context');
      expect(message).toContain('unexpected error');
    });

    it('handles missing context parameter', () => {
      const error = new Error('Test error');
      const message = getContextualErrorMessage(error);
      expect(message).toContain('unexpected error');
    });
  });

  describe('Error Type Checkers', () => {
    describe('isNetworkError', () => {
      it('identifies network errors correctly', () => {
        expect(isNetworkError(new Error('Failed to fetch'))).toBe(true);
        expect(isNetworkError(new Error('Network timeout'))).toBe(true);
        expect(isNetworkError({ message: 'Connection refused' })).toBe(true);
        expect(isNetworkError(new Error('General error'))).toBe(false);
      });
    });

    describe('isAuthError', () => {
      it('identifies authentication errors correctly', () => {
        expect(isAuthError(new Error('Authentication failed'))).toBe(true);
        expect(isAuthError(new Error('Unauthorized'))).toBe(true);
        expect(isAuthError({ message: 'Invalid token' })).toBe(true);
        expect(isAuthError(new Error('Validation error'))).toBe(false);
      });
    });

    describe('isValidationError', () => {
      it('identifies validation errors correctly', () => {
        expect(isValidationError(new Error('Validation failed'))).toBe(true);
        expect(isValidationError(new Error('Required field missing'))).toBe(true);
        expect(isValidationError({ message: 'Invalid format' })).toBe(true);
        expect(isValidationError(new Error('Network error'))).toBe(false);
      });
    });

    describe('isDuplicateError', () => {
      it('identifies duplicate errors correctly', () => {
        expect(isDuplicateError(new Error('Duplicate entry'))).toBe(true);
        expect(isDuplicateError(new Error('Already exists'))).toBe(true);
        expect(isDuplicateError({ message: 'Unique constraint' })).toBe(true);
        expect(isDuplicateError(new Error('Validation failed'))).toBe(false);
      });
    });
  });

  describe('shouldRetryError', () => {
    it('recommends retry for network errors', () => {
      const networkError = new Error('Failed to fetch');
      expect(shouldRetryError(networkError)).toBe(true);
      
      const timeoutError = new Error('Request timeout');
      expect(shouldRetryError(timeoutError)).toBe(true);
    });

    it('recommends retry for rate limit errors', () => {
      const rateLimitError = new Error('Rate limit exceeded');
      expect(shouldRetryError(rateLimitError)).toBe(true);
    });

    it('does not recommend retry for auth errors', () => {
      const authError = new Error('Authentication failed');
      expect(shouldRetryError(authError)).toBe(false);
      
      const unauthorizedError = new Error('Unauthorized');
      expect(shouldRetryError(unauthorizedError)).toBe(false);
    });

    it('does not recommend retry for validation errors', () => {
      const validationError = new Error('Validation failed');
      expect(shouldRetryError(validationError)).toBe(false);
      
      const requiredError = new Error('Required field');
      expect(shouldRetryError(requiredError)).toBe(false);
    });

    it('does not recommend retry for duplicate errors', () => {
      const duplicateError = new Error('Duplicate entry');
      expect(shouldRetryError(duplicateError)).toBe(false);
    });

    it('handles edge cases gracefully', () => {
      expect(shouldRetryError(null)).toBe(false);
      expect(shouldRetryError(undefined)).toBe(false);
      expect(shouldRetryError('')).toBe(false);
    });
  });

  describe('Error Message Extraction', () => {
    it('extracts message from Error objects', () => {
      const error = new Error('Test error message');
      expect(getUserFriendlyErrorMessage(error)).toContain('Test error message');
    });

    it('extracts message from plain objects', () => {
      const error = { message: 'Plain object error' };
      expect(getUserFriendlyErrorMessage(error)).toBe('Plain object error');
    });

    it('extracts nested error messages', () => {
      const error = {
        error: {
          message: 'Deeply nested error'
        }
      };
      expect(getUserFriendlyErrorMessage(error)).toBe('Deeply nested error');
    });

    it('handles complex error structures', () => {
      const error = {
        response: {
          data: {
            error: {
              message: 'API error message'
            }
          }
        }
      };
      const message = getUserFriendlyErrorMessage(error);
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });

    it('handles string errors directly', () => {
      const error = 'Direct string error';
      expect(getUserFriendlyErrorMessage(error)).toBe('Direct string error');
    });
  });

  describe('Error Context Combinations', () => {
    it('handles multiple error characteristics', () => {
      const complexError = new Error('Network validation failed for duplicate entry');
      
      // Should prioritize the most specific error type
      const type = getErrorType(complexError);
      expect(['network', 'validation', 'duplicate']).toContain(type);
    });

    it('provides appropriate contextual messages for complex errors', () => {
      const complexError = new Error('Unique constraint violation on network request');
      
      const linkMessage = getContextualErrorMessage(complexError, 'link');
      const profileMessage = getContextualErrorMessage(complexError, 'profile');
      
      expect(linkMessage).not.toBe(profileMessage);
      expect(linkMessage).toContain('link');
      expect(profileMessage).toContain('profile');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles circular references in error objects', () => {
      const circularError = { message: 'Circular error' };
      circularError.self = circularError;
      
      expect(() => getErrorType(circularError)).not.toThrow();
      expect(() => getUserFriendlyErrorMessage(circularError)).not.toThrow();
    });

    it('handles very long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      const longError = new Error(longMessage);
      
      const friendlyMessage = getUserFriendlyErrorMessage(longError);
      expect(typeof friendlyMessage).toBe('string');
      expect(friendlyMessage.length).toBeGreaterThan(0);
    });

    it('handles non-string, non-object errors', () => {
      expect(() => getErrorType(123)).not.toThrow();
      expect(() => getErrorType(true)).not.toThrow();
      expect(() => getErrorType([])).not.toThrow();
      
      expect(getErrorType(123)).toBe('general');
      expect(getErrorType(true)).toBe('general');
      expect(getErrorType([])).toBe('general');
    });
  });
});
