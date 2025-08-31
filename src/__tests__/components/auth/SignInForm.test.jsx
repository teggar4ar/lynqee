/**
 * SignInForm Component Tests
 *
 * Tests the sign-in form with email/password authentication,
 * form validation, password reset, and Google OAuth integration.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithUnauthenticatedUser } from '../../mocks/testUtils.jsx';
import SignInForm from '../../../components/auth/SignInForm.jsx';

// Mock the useAuth hook
const mockSignIn = vi.fn();
const mockResetPassword = vi.fn();

vi.mock('../../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    resetPassword: mockResetPassword,
  }),
}));

describe('SignInForm', () => {
  beforeEach(() => {
    mockSignIn.mockClear();
    mockResetPassword.mockClear();
  });

  it('renders sign-in form with all required elements', () => {
    const mockOnSwitchToSignUp = vi.fn();
    renderWithUnauthenticatedUser(
      <SignInForm onSwitchToSignUp={mockOnSwitchToSignUp} />
    );

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your Lynqee account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty form submission', async () => {
    renderWithUnauthenticatedUser(<SignInForm onSwitchToSignUp={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(screen.getByText('Email address is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderWithUnauthenticatedUser(<SignInForm onSwitchToSignUp={() => {}} />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('calls signIn with correct credentials on valid form submission', async () => {
    mockSignIn.mockResolvedValue({ user: { id: '1' } });

    renderWithUnauthenticatedUser(<SignInForm onSwitchToSignUp={() => {}} />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows loading state during sign-in and becomes enabled after', async () => {
  // Mock dibuat agar ada sedikit delay
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ user: { id: '1' } }), 50)));

    renderWithUnauthenticatedUser(<SignInForm onSwitchToSignUp={() => {}} />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.click(submitButton);

    // Saat diklik, tombol harus langsung disabled
    expect(submitButton).toBeDisabled();

    // Tunggu hingga tombolnya kembali aktif setelah mock signIn selesai
    await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
    });
  });

  it('calls onSuccess callback on successful sign-in', async () => {
    const mockOnSuccess = vi.fn();
    mockSignIn.mockResolvedValue({ user: { id: '1' } });

    renderWithUnauthenticatedUser(<SignInForm onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({ user: { id: '1' } });
    });
  });

  it('calls onError callback on sign-in failure', async () => {
    const mockOnError = vi.fn();
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'));

    renderWithUnauthenticatedUser(<SignInForm onError={mockOnError} />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(new Error('Invalid credentials'));
    });
  });

// D:\BELAJAR\lynqee\src\__tests__\components\auth\SignInForm.test.jsx

  it('toggles password visibility', () => {
    renderWithUnauthenticatedUser(<SignInForm onSwitchToSignUp={() => {}} />);

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    // Gunakan getByLabelText yang lebih andal
    const toggleButton = screen.getByLabelText(/show password/i); 

    expect(passwordInput).toHaveAttribute('type', 'password');

    // Klik untuk menampilkan password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    // Label tombol sekarang berubah menjadi "Hide password"
    expect(screen.getByLabelText(/hide password/i)).toBeInTheDocument();

    // Klik lagi untuk menyembunyikan
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText(/show password/i)).toBeInTheDocument();
  });

  it('handles forgot password functionality', async () => {
    mockResetPassword.mockResolvedValue({ success: true });

    renderWithUnauthenticatedUser(<SignInForm onSwitchToSignUp={() => {}} />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const forgotPasswordButton = screen.getByText(/forgot your password/i);

    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.click(forgotPasswordButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows success message after password reset', async () => {
    mockResetPassword.mockResolvedValue({ success: true });

    renderWithUnauthenticatedUser(<SignInForm onSwitchToSignUp={() => {}} />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const forgotPasswordButton = screen.getByText(/forgot your password/i);

    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.click(forgotPasswordButton);

    await waitFor(() => {
      expect(screen.getByText('Verification email sent successfully! Please check your inbox.')).toBeInTheDocument();
    });
  });

  it('validates email before password reset', () => {
    renderWithUnauthenticatedUser(<SignInForm onSwitchToSignUp={() => {}} />);

    const forgotPasswordButton = screen.getByText(/forgot your password/i);
    fireEvent.click(forgotPasswordButton);

    expect(mockResetPassword).not.toHaveBeenCalled();
    expect(screen.getByText('Email address is required')).toBeInTheDocument();
  });

  it('calls onSwitchToSignUp when sign up link is clicked', () => {
    const mockOnSwitchToSignUp = vi.fn();
    renderWithUnauthenticatedUser(
      <SignInForm onSwitchToSignUp={mockOnSwitchToSignUp} />
    );

    const signUpButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(signUpButton);

    expect(mockOnSwitchToSignUp).toHaveBeenCalled();
  });

  it('renders Google OAuth button', () => {
    renderWithUnauthenticatedUser(<SignInForm onSwitchToSignUp={() => {}} />);

    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });
});
