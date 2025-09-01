/**
 * SignUpForm Component Tests
 *
 * Tests the sign-up form with email/password registration,
 * form validation, password confirmation, and Google OAuth integration.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithUnauthenticatedUser } from '../../mocks/testUtils.jsx';
import SignUpForm from '../../../components/auth/SignUpForm.jsx';

// Mock the useAuth hook
const mockSignUp = vi.fn();

vi.mock('../../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SignUpForm', () => {
  beforeEach(() => {
    mockSignUp.mockClear();
    mockNavigate.mockClear();
  });

  it('renders sign-up form with all required elements', () => {
    const mockOnSwitchToSignIn = vi.fn();
    renderWithUnauthenticatedUser(
      <SignUpForm onSwitchToSignIn={mockOnSwitchToSignIn} />
    );

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText('Join thousands of creators on Lynqee')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty form submission', async () => {
    renderWithUnauthenticatedUser(<SignUpForm />);

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(screen.getByText('Email address is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
        expect(screen.getByText('Confirm password is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for password too short', async () => {
    renderWithUnauthenticatedUser(<SignUpForm />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
    
    // Trigger blur to mark fields as touched
    fireEvent.blur(passwordInput);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('shows validation error for mismatched passwords', async () => {
    renderWithUnauthenticatedUser(<SignUpForm />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    
    // Trigger blur to mark fields as touched
    fireEvent.blur(confirmPasswordInput);
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('calls signUp with correct data on valid form submission', async () => {
    mockSignUp.mockResolvedValue({ user: { email: 'test@example.com' } });

    renderWithUnauthenticatedUser(<SignUpForm />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123', { signup_method: 'email' });
    });
  });

  it('handles user already exists error correctly', async () => {
    const mockOnError = vi.fn();
    mockSignUp.mockResolvedValue({ 
      error: 'An account with this email address already exists. Please sign in instead or use the forgot password option if you need to reset your password.'
    });

    renderWithUnauthenticatedUser(<SignUpForm onError={mockOnError} />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith({
        message: 'An account with this email address already exists. Please sign in instead or use the forgot password option if you need to reset your password.',
        type: 'user_exists',
        email: 'existing@example.com'
      });
    });
  });

  it('shows loading state during sign-up', async () => {
    mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ user: { email: 'test@example.com' } }), 100)));

    renderWithUnauthenticatedUser(<SignUpForm />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Create Account');
  });

  it('calls onSignUpSuccess and navigates on successful sign-up', async () => {
    const mockOnSignUpSuccess = vi.fn();
    mockSignUp.mockResolvedValue({ user: { email: 'test@example.com' } });

    renderWithUnauthenticatedUser(
      <SignUpForm onSignUpSuccess={mockOnSignUpSuccess} />
    );

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSignUpSuccess).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('calls onError callback on sign-up failure', async () => {
    const mockOnError = vi.fn();
    mockSignUp.mockRejectedValue(new Error('Email already exists'));

    renderWithUnauthenticatedUser(<SignUpForm onError={mockOnError} />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(new Error('Email already exists'));
    });
  });

  it('toggles password visibility for both password fields', () => {
    renderWithUnauthenticatedUser(<SignUpForm />);

    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const toggleButtons = screen.getAllByRole('button', { hidden: true }); // Password toggle buttons are inside input containers

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Toggle main password
    fireEvent.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Toggle confirm password
    fireEvent.click(toggleButtons[1]);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');

    // Toggle back
    fireEvent.click(toggleButtons[0]);
    fireEvent.click(toggleButtons[1]);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('calls onSwitchToSignIn when sign in link is clicked', () => {
    const mockOnSwitchToSignIn = vi.fn();
    renderWithUnauthenticatedUser(
      <SignUpForm onSwitchToSignIn={mockOnSwitchToSignIn} />
    );

    const signInLink = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInLink);

    expect(mockOnSwitchToSignIn).toHaveBeenCalled();
  });

  it('validates email format', async () => {
    renderWithUnauthenticatedUser(<SignUpForm />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    // Trigger blur to mark email field as touched
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });
});
