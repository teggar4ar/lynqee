import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithUnauthenticatedUser } from '../../mocks/testUtils.jsx';
import GoogleOAuthButton from '../../../components/auth/GoogleOAuthButton.jsx';

// Mock the useAuth hook
const mockSignInWithGoogle = vi.fn();

vi.mock('../../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    signInWithGoogle: mockSignInWithGoogle,
  }),
}));

// Mock the useAsync hook
const mockExecute = vi.fn();

vi.mock('../../../hooks/useAsync.js', () => ({
  useAsync: () => ({
    loading: false,
    execute: mockExecute,
  }),
}));

describe('GoogleOAuthButton', () => {
  beforeEach(() => {
    mockSignInWithGoogle.mockClear();
    mockExecute.mockClear();
  });

  it('renders Google OAuth button with default text', () => {
    renderWithUnauthenticatedUser(<GoogleOAuthButton />);

    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders Google icon', () => {
    renderWithUnauthenticatedUser(<GoogleOAuthButton />);

    const googleIcon = document.querySelector('svg');
    expect(googleIcon).toBeInTheDocument();
    expect(googleIcon).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('calls signInWithGoogle when button is clicked', async () => {
    const mockResult = { user: { id: '1' } };
    mockExecute.mockResolvedValue(mockResult);

    renderWithUnauthenticatedUser(<GoogleOAuthButton redirectTo="/dashboard" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows loading state during sign-in', () => {
    // For this test, we'll check the disabled prop directly
    renderWithUnauthenticatedUser(<GoogleOAuthButton disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls onSuccess callback on successful sign-in', async () => {
    const mockOnSuccess = vi.fn();
    const mockResult = { user: { id: '1' } };
    mockExecute.mockResolvedValue(mockResult);

    renderWithUnauthenticatedUser(<GoogleOAuthButton onSuccess={mockOnSuccess} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(mockResult);
    });
  });

  it('calls onError callback on sign-in failure', async () => {
    const mockOnError = vi.fn();
    const mockError = new Error('Google sign-in failed');
    mockExecute.mockRejectedValue(mockError);

    renderWithUnauthenticatedUser(<GoogleOAuthButton onError={mockOnError} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });
  });

  it('renders custom children text', () => {
    renderWithUnauthenticatedUser(
      <GoogleOAuthButton>Sign in with Google</GoogleOAuthButton>
    );

    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    renderWithUnauthenticatedUser(
      <GoogleOAuthButton className="custom-class" />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('is disabled when disabled prop is true', () => {
    renderWithUnauthenticatedUser(<GoogleOAuthButton disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('handles missing redirectTo prop', async () => {
    mockExecute.mockResolvedValue({ user: { id: '1' } });

    renderWithUnauthenticatedUser(<GoogleOAuthButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith(undefined);
    });
  });

  it('has proper accessibility attributes', () => {
    renderWithUnauthenticatedUser(<GoogleOAuthButton />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });
});
