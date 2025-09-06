import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithUnauthenticatedUser } from '../../mocks/testUtils.jsx';
import EmailVerificationUI from '../../../components/auth/EmailVerificationUI.jsx';

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the useAuth hook
const mockResetPassword = vi.fn();

vi.mock('../../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    resetPassword: mockResetPassword,
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowLeft: () => React.createElement('div', { 'data-testid': 'arrow-left-icon' }),
  CheckCircle: () => React.createElement('div', { 'data-testid': 'check-circle-icon' }),
  Clock: () => React.createElement('div', { 'data-testid': 'clock-icon' }),
  Mail: () => React.createElement('div', { 'data-testid': 'mail-icon' }),
  RefreshCw: () => React.createElement('div', { 'data-testid': 'refresh-cw-icon' }),
  // Additional icons for Toast component
  XCircle: () => React.createElement('div', { 'data-testid': 'x-circle-icon' }),
  AlertTriangle: () => React.createElement('div', { 'data-testid': 'alert-triangle-icon' }),
  Info: () => React.createElement('div', { 'data-testid': 'info-icon' }),
  X: () => React.createElement('div', { 'data-testid': 'x-icon' }),
}));

describe('EmailVerificationUI', () => {
  const mockOnBackToSignIn = vi.fn();
  const testEmail = 'test@example.com';

  beforeEach(() => {
    mockResetPassword.mockClear();
    mockOnBackToSignIn.mockClear();
    mockNavigate.mockClear();
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

  // Note: Authentication state monitoring test would require complex mock setup
  // The useEffect in EmailVerificationUI now monitors authentication state changes
  // and redirects to /dashboard when user becomes authenticated
});
