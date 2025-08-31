import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithUnauthenticatedUser } from '../../mocks/testUtils.jsx';
import EmailVerificationUI from '../../../components/auth/EmailVerificationUI.jsx';

// Mock the useAuth hook
const mockResetPassword = vi.fn();

vi.mock('../../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    resetPassword: mockResetPassword,
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowLeft: () => React.createElement('div', { 'data-testid': 'arrow-left-icon' }),
  CheckCircle: () => React.createElement('div', { 'data-testid': 'check-circle-icon' }),
  Clock: () => React.createElement('div', { 'data-testid': 'clock-icon' }),
  Mail: () => React.createElement('div', { 'data-testid': 'mail-icon' }),
  RefreshCw: () => React.createElement('div', { 'data-testid': 'refresh-cw-icon' }),
}));

describe('EmailVerificationUI', () => {
  const mockOnBackToSignIn = vi.fn();
  const testEmail = 'test@example.com';

  beforeEach(() => {
    mockResetPassword.mockClear();
    mockOnBackToSignIn.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with email display', () => {
    renderWithUnauthenticatedUser(
      React.createElement(EmailVerificationUI, { email: testEmail, onBackToSignIn: mockOnBackToSignIn })
    );

    expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    expect(screen.getByText('We\'ve sent a verification link to your email address.')).toBeInTheDocument();
    expect(screen.getByText(testEmail)).toBeInTheDocument();
  });

  it('renders with default email when none provided', () => {
    renderWithUnauthenticatedUser(
      React.createElement(EmailVerificationUI, { email: '', onBackToSignIn: mockOnBackToSignIn })
    );

    expect(screen.getByText('your-email@example.com')).toBeInTheDocument();
  });

  it('displays resend button initially', () => {
    renderWithUnauthenticatedUser(
      React.createElement(EmailVerificationUI, { email: testEmail, onBackToSignIn: mockOnBackToSignIn })
    );

    const resendButton = screen.getByText('Resend Verification Email');
    expect(resendButton).toBeInTheDocument();
    expect(resendButton).not.toBeDisabled();
  });

  it('calls onBackToSignIn when back button is clicked', () => {
    renderWithUnauthenticatedUser(
      React.createElement(EmailVerificationUI, { email: testEmail, onBackToSignIn: mockOnBackToSignIn })
    );

    const backButton = screen.getByText('Back to Sign In');
    fireEvent.click(backButton);

    expect(mockOnBackToSignIn).toHaveBeenCalledTimes(1);
  });

  it('displays help text', () => {
    renderWithUnauthenticatedUser(
      React.createElement(EmailVerificationUI, { email: testEmail, onBackToSignIn: mockOnBackToSignIn })
    );

    expect(screen.getByText('Didn\'t receive the email? Check your spam folder or try resending.')).toBeInTheDocument();
  });

  it('renders decorative elements on large screens', () => {
    renderWithUnauthenticatedUser(
      React.createElement(EmailVerificationUI, { email: testEmail, onBackToSignIn: mockOnBackToSignIn })
    );

    expect(screen.getByText('Email Verification')).toBeInTheDocument();
    expect(screen.getByText('Secure your account in just one click')).toBeInTheDocument();
  });
});
