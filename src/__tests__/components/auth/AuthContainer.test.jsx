/**
 * AuthContainer Component Tests
 *
 * Tests the authentication container that manages switching between
 * sign-in and sign-up forms, navigation, and callback handling.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import { renderWithUnauthenticatedUser } from '../../mocks/testUtils.jsx';
import AuthContainer from '../../../components/auth/AuthContainer.jsx';

// Mock react-router-dom
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock child components to return actual JSX for testing
vi.mock('../../../components/auth/SignInForm.jsx', () => ({
  default: ({ onSwitchToSignUp, onSuccess, onError }) => (
    <div data-testid="signin-form">
      <button data-testid="switch-to-signup" onClick={onSwitchToSignUp}>
        Switch to Sign Up
      </button>
      <button data-testid="signin-success" onClick={() => onSuccess && onSuccess()}>
        Sign In Success
      </button>
      {onError && (
        <button data-testid="signin-error" onClick={() => onError(new Error('Sign in failed'))}>
          Sign In Error
        </button>
      )}
    </div>
  ),
}));

vi.mock('../../../components/auth/SignUpForm.jsx', () => ({
  default: ({ onSwitchToSignIn, onSignUpSuccess, onError }) => (
    <div data-testid="signup-form">
      <button data-testid="switch-to-signin" onClick={onSwitchToSignIn}>
        Switch to Sign In
      </button>
      <button data-testid="signup-success" onClick={() => onSignUpSuccess('test@example.com')}>
        Sign Up Success
      </button>
      {onError && (
        <button data-testid="signup-error" onClick={() => onError(new Error('Sign up failed'))}>
          Sign Up Error
        </button>
      )}
    </div>
  ),
}));

describe('AuthContainer', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders SignInForm by default', () => {
    renderWithUnauthenticatedUser(<AuthContainer />);

    expect(screen.getByTestId('signin-form')).toBeInTheDocument();
    expect(screen.queryByTestId('signup-form')).not.toBeInTheDocument();
  });

  it('switches to SignUpForm when switch button is clicked', () => {
    renderWithUnauthenticatedUser(<AuthContainer />);

    act(() => {
      fireEvent.click(screen.getByTestId('switch-to-signup'));
    });

    expect(screen.queryByTestId('signin-form')).not.toBeInTheDocument();
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
  });

  it('switches back to SignInForm when switch button is clicked', () => {
    renderWithUnauthenticatedUser(<AuthContainer />);

    // Switch to signup
    act(() => {
      fireEvent.click(screen.getByTestId('switch-to-signup'));
    });

    // Switch back to signin
    act(() => {
      fireEvent.click(screen.getByTestId('switch-to-signin'));
    });

    expect(screen.getByTestId('signin-form')).toBeInTheDocument();
    expect(screen.queryByTestId('signup-form')).not.toBeInTheDocument();
  });

  it('navigates to check-email page on successful signup', () => {
    const mockOnSuccess = vi.fn();

    renderWithUnauthenticatedUser(<AuthContainer onSuccess={mockOnSuccess} />);

    // Switch to signup
    act(() => {
      fireEvent.click(screen.getByTestId('switch-to-signup'));
    });

    // Trigger signup success
    act(() => {
      fireEvent.click(screen.getByTestId('signup-success'));
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/check-email', {
      state: { email: 'test@example.com' },
    });
  });

  it('handles successful signup without onSuccess callback', () => {
    renderWithUnauthenticatedUser(<AuthContainer />);

    // Switch to signup
    act(() => {
      fireEvent.click(screen.getByTestId('switch-to-signup'));
    });

    // Trigger signup success
    act(() => {
      fireEvent.click(screen.getByTestId('signup-success'));
    });

    expect(mockNavigate).toHaveBeenCalledWith('/check-email', {
      state: { email: 'test@example.com' },
    });
  });

  it('passes onSuccess prop to SignInForm', () => {
    const mockOnSuccess = vi.fn();

    renderWithUnauthenticatedUser(<AuthContainer onSuccess={mockOnSuccess} />);

    act(() => {
      fireEvent.click(screen.getByTestId('signin-success'));
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('passes onError prop to both forms', () => {
    const mockOnError = vi.fn();

    renderWithUnauthenticatedUser(<AuthContainer onError={mockOnError} />);

    // Test signin error
    act(() => {
      fireEvent.click(screen.getByTestId('signin-error'));
    });

    expect(mockOnError).toHaveBeenCalledWith(new Error('Sign in failed'));

    // Switch to signup and test signup error
    act(() => {
      fireEvent.click(screen.getByTestId('switch-to-signup'));
    });

    mockOnError.mockClear();

    act(() => {
      fireEvent.click(screen.getByTestId('signup-error'));
    });

    expect(mockOnError).toHaveBeenCalledWith(new Error('Sign up failed'));
  });

  it('maintains view state across re-renders', () => {
    const { rerender } = renderWithUnauthenticatedUser(<AuthContainer />);

    // Switch to signup
    act(() => {
      fireEvent.click(screen.getByTestId('switch-to-signup'));
    });

    // Re-render the same component
    rerender(<AuthContainer />);

    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    expect(screen.queryByTestId('signin-form')).not.toBeInTheDocument();
  });
});
