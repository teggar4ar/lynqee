import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the supabase client before importing AuthService
vi.mock('../../services/supabase.js', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      verifyOtp: vi.fn(),
      resend: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
  SUPABASE_AUTH_PROVIDERS: {},
}));

import AuthService from '../../services/AuthService.js';
import { supabase } from '../../services/supabase.js';

// Mock data
const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' },
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00.000Z',
};

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

const mockAuthResponse = {
  data: { user: mockUser, session: mockSession },
  error: null,
};

describe('AuthService CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CREATE Operations (Sign Up)', () => {
    it('should successfully create a new user account', async () => {
      supabase.auth.signUp.mockResolvedValue(mockAuthResponse);

      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        full_name: 'New User',
      };

      const result = await AuthService.signUp(userData);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: userData.email,
        password: userData.password,
        options: {
          data: { full_name: userData.full_name },
          emailRedirectTo: 'http://localhost:3000/verify-email',
        },
      });
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
    });

    it('should prevent sign up with existing email address', async () => {
      // Mock Supabase returning error for existing user
      const errorResponse = {
        data: { user: null, session: null },
        error: { message: 'User already registered', code: 'signup_disabled' },
      };
      supabase.auth.signUp.mockResolvedValue(errorResponse);

      const userData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        full_name: 'Existing User',
      };

      const result = await AuthService.signUp(userData);

      expect(supabase.auth.signUp).toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toContain('account with this email address already exists');
    });

    it('should handle sign up validation errors', async () => {
      const errorResponse = {
        data: { user: null, session: null },
        error: { message: 'Invalid email format', code: 'invalid_email' },
      };
      supabase.auth.signUp.mockResolvedValue(errorResponse);

      const userData = {
        email: 'invalid-email',
        password: 'weak',
        full_name: 'Test User',
      };

      const result = await AuthService.signUp(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email format');
    });

    it('should handle sign up network errors', async () => {
      supabase.auth.signUp.mockRejectedValue(new Error('Network connection failed'));
      console.error = vi.fn(); // Mock console.error to avoid noise

      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        full_name: 'Test User',
      };

      const result = await AuthService.signUp(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network connection failed');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('READ Operations (Sign In & Session)', () => {
    it('should successfully authenticate existing user', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue(mockAuthResponse);

      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      const result = await AuthService.signIn(credentials);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password,
      });
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
    });

    it('should handle invalid credentials', async () => {
      const errorResponse = {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', code: 'invalid_credentials' },
      };
      supabase.auth.signInWithPassword.mockResolvedValue(errorResponse);

      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const result = await AuthService.signIn(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid login credentials');
    });

    it('should get current session successfully', async () => {
      const sessionResponse = {
        data: { session: mockSession },
        error: null,
      };
      supabase.auth.getSession.mockResolvedValue(sessionResponse);

      const result = await AuthService.getCurrentSession();

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.session).toEqual(mockSession);
    });

    it('should handle no active session', async () => {
      const sessionResponse = {
        data: { session: null },
        error: null,
      };
      supabase.auth.getSession.mockResolvedValue(sessionResponse);

      const result = await AuthService.getCurrentSession();

      expect(result.success).toBe(true);
      expect(result.session).toBeNull();
    });
  });

  describe('UPDATE Operations (Password & Profile)', () => {
    it('should successfully initiate password reset', async () => {
      const resetResponse = {
        data: {},
        error: null,
      };
      supabase.auth.resetPasswordForEmail.mockResolvedValue(resetResponse);

      const result = await AuthService.resetPassword('test@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      expect(result.success).toBe(true);
    });

    it('should handle password reset errors', async () => {
      const errorResponse = {
        data: {},
        error: { message: 'User not found', code: 'user_not_found' },
      };
      supabase.auth.resetPasswordForEmail.mockResolvedValue(errorResponse);

      const result = await AuthService.resetPassword('nonexistent@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toContain('User not found');
    });

    it('should successfully update user profile', async () => {
      const updateResponse = {
        data: { user: { ...mockUser, user_metadata: { full_name: 'Updated Name' } } },
        error: null,
      };
      supabase.auth.updateUser.mockResolvedValue(updateResponse);

      const updateData = { data: { full_name: 'Updated Name' } };
      const result = await AuthService.updateUserProfile(updateData);

      expect(supabase.auth.updateUser).toHaveBeenCalledWith(updateData);
      expect(result.success).toBe(true);
      expect(result.user.user_metadata.full_name).toBe('Updated Name');
    });

    it('should update user password successfully', async () => {
      const updateResponse = {
        data: { user: mockUser },
        error: null,
      };
      supabase.auth.updateUser.mockResolvedValue(updateResponse);

      const result = await AuthService.updatePassword('newSecurePassword123!');

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newSecurePassword123!',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('DELETE Operations (Sign Out)', () => {
    it('should successfully sign out user', async () => {
      const signOutResponse = { error: null };
      supabase.auth.signOut.mockResolvedValue(signOutResponse);

      const result = await AuthService.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should handle sign out errors', async () => {
      const errorResponse = {
        error: { message: 'Sign out failed', code: 'signout_error' },
      };
      supabase.auth.signOut.mockResolvedValue(errorResponse);

      const result = await AuthService.signOut();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Sign out failed');
    });
  });

  describe('VERIFICATION Operations', () => {
    it('should verify OTP successfully', async () => {
      const verifyResponse = {
        data: { user: mockUser, session: mockSession },
        error: null,
      };
      supabase.auth.verifyOtp.mockResolvedValue(verifyResponse);

      const otpData = {
        email: 'test@example.com',
        token: '123456',
        type: 'email',
      };

      const result = await AuthService.verifyOtp(otpData);

      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith(otpData);
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should handle invalid OTP', async () => {
      const errorResponse = {
        data: { user: null, session: null },
        error: { message: 'Invalid OTP', code: 'invalid_otp' },
      };
      supabase.auth.verifyOtp.mockResolvedValue(errorResponse);

      const otpData = {
        email: 'test@example.com',
        token: 'invalid',
        type: 'email',
      };

      const result = await AuthService.verifyOtp(otpData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid OTP');
    });

    it('should resend verification email', async () => {
      const resendResponse = {
        data: {},
        error: null,
      };
      supabase.auth.resend.mockResolvedValue(resendResponse);

      const resendData = {
        type: 'signup',
        email: 'test@example.com',
      };

      const result = await AuthService.resendVerification(resendData);

      expect(supabase.auth.resend).toHaveBeenCalledWith({
        ...resendData,
        options: {
          emailRedirectTo: 'http://localhost:3000/verify-email',
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('AUTH STATE Management', () => {
    it('should set up auth state change listener', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      
      supabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const result = AuthService.onAuthStateChange(mockCallback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
      expect(typeof result.unsubscribe).toBe('function');
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle network timeouts', async () => {
      supabase.auth.signInWithPassword.mockRejectedValue(new Error('Request timeout'));
      console.error = vi.fn();

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await AuthService.signIn(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Request timeout');
    });

    it('should handle malformed API responses', async () => {
      supabase.auth.signUp.mockResolvedValue(null);

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      };

      const result = await AuthService.signUp(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('destructure');
    });
  });

  describe('Complex Authentication Scenarios', () => {
    it('should handle complete authentication lifecycle', async () => {
      // Sign up
      supabase.auth.signUp.mockResolvedValueOnce(mockAuthResponse);
      const signUpResult = await AuthService.signUp({
        email: 'lifecycle@example.com',
        password: 'password123',
        full_name: 'Lifecycle User',
      });
      expect(signUpResult.success).toBe(true);

      // Sign out
      supabase.auth.signOut.mockResolvedValueOnce({ error: null });
      const signOutResult = await AuthService.signOut();
      expect(signOutResult.success).toBe(true);

      // Sign in
      supabase.auth.signInWithPassword.mockResolvedValueOnce(mockAuthResponse);
      const signInResult = await AuthService.signIn({
        email: 'lifecycle@example.com',
        password: 'password123',
      });
      expect(signInResult.success).toBe(true);
    });

    it('should handle concurrent auth operations', async () => {
      // Clear any previous mocks to avoid interference
      vi.clearAllMocks();
      
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });
      supabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const authPromises = [
        AuthService.getCurrentSession(),
        AuthService.resetPassword('test1@example.com'),
        AuthService.resetPassword('test2@example.com'),
      ];

      const results = await Promise.all(authPromises);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[2].success).toBe(true);
    });
  });
});
