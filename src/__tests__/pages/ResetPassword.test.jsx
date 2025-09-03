/**
 * ResetPassword Page Tests
 *
 * Tests the password reset flow including authentication state handling
 */

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { mockAuthContextAuthenticated, renderWithProviders, renderWithUnauthenticatedUser } from '../mocks/testUtils.jsx';
import ResetPassword from '../../pages/ResetPassword.jsx';

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to render with authenticated user
const renderWithAuthenticatedUser = (ui, options = {}) => {
  return renderWithProviders(ui, {
    authValue: mockAuthContextAuthenticated,
    ...options,
  });
};

describe('ResetPassword Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders without crashing', () => {
    renderWithUnauthenticatedUser(<ResetPassword />);
    expect(document.body).toBeInTheDocument();
  });

  it('shows invalid link error for unauthenticated user after loading', async () => {
    renderWithUnauthenticatedUser(<ResetPassword />);
    
    // Wait for the loading state to finish and error to appear
    await waitFor(() => {
      expect(screen.getByText('Invalid Link')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Password reset link is invalid or has expired.')).toBeInTheDocument();
  });

  it('shows password reset form for authenticated user (valid reset link)', async () => {
    renderWithAuthenticatedUser(<ResetPassword />);
    
    // Wait for the component to detect authentication and show the form
    await waitFor(() => {
      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    });
    
    expect(screen.getByPlaceholderText('Minimum 8 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Retype your new password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  it('shows verifying state with correct English text', async () => {
    // Render with loading auth state to trigger verifying status
    renderWithProviders(<ResetPassword />, {
      authValue: {
        ...mockAuthContextAuthenticated,
        isLoading: true,
      },
    });

    expect(screen.getByText('Verifying link...')).toBeInTheDocument();
  });
});
