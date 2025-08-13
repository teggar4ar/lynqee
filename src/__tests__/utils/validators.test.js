/**
 * Validation Utilities Test Suite
 * 
 * Tests for utility functions used across the application
 */

import { describe, expect, it } from 'vitest';
import { 
  isValidEmail, 
  isValidUrl, 
  validateLinkTitle, 
  validatePassword, 
  validateUsername 
} from '../../utils/validators.js';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'number123@test.com',
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('returns false for invalid emails', () => {
      const invalidEmails = [
        '',
        'invalid-email',
        'test@',
        '@example.com',
        'test.example.com',
        'test@.com',
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('isValidUrl', () => {
    it('returns true for valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://test.org',
        'https://subdomain.example.com/path',
        'https://example.com/path?query=value',
      ];

      validUrls.forEach(url => {
        expect(isValidUrl(url)).toBe(true);
      });
    });

    it('returns false for invalid URLs', () => {
      const invalidUrls = [
        '',
        'not-a-url',
        'example.com', // missing protocol
        'ftp://example.com', // invalid protocol
      ];

      invalidUrls.forEach(url => {
        expect(isValidUrl(url)).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    it('returns success for valid passwords', () => {
      const validPasswords = [
        'password123',
        'MySecurePass!',
        'longenoughpassword',
        '12345678',
      ];

      validPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    it('returns error for invalid passwords', () => {
      const invalidPasswords = [
        '',
        'short',
        '1234567', // 7 characters
      ];

      invalidPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(typeof result.error).toBe('string');
      });
    });
  });

  describe('validateUsername', () => {
    it('returns success for valid usernames', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'username',
        'user-name-123',
      ];

      validUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    it('returns error for invalid usernames', () => {
      const invalidUsernames = [
        '',
        'ab', // too short
        'user name', // space not allowed
        'user@name', // special character not allowed
      ];

      invalidUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(false);
        expect(typeof result.error).toBe('string');
      });
    });
  });

  describe('validateLinkTitle', () => {
    it('returns success for valid link titles', () => {
      const validTitles = [
        'My Website',
        'Portfolio Link',
        'GitHub Profile',
        'Blog Post #1',
      ];

      validTitles.forEach(title => {
        const result = validateLinkTitle(title);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    it('returns error for invalid link titles', () => {
      const invalidTitles = [
        '',
        '   ', // whitespace only
        null,
        undefined,
      ];

      invalidTitles.forEach(title => {
        const result = validateLinkTitle(title);
        expect(result.isValid).toBe(false);
        expect(typeof result.error).toBe('string');
      });
    });
  });
});
