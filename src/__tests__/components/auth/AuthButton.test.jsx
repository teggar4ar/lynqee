/**
 * AuthButton Component Tests
 *
 * Tests the generic authentication button component with different
 * action types, loading states, and customization options.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import { renderWithUnauthenticatedUser } from '../../mocks/testUtils.jsx';
import AuthButton from '../../../components/auth/AuthButton.jsx';

// Mock the Button component
vi.mock('../../../components/common/Button.jsx', () => ({
  default: ({
    children,
    type,
    variant,
    loading,
    disabled,
    onClick,
    fullWidth,
    className,
    ...props
  }) => (
    <button
      type={type}
      data-testid="auth-button"
      data-variant={variant}
      data-loading={loading}
      data-disabled={disabled}
      data-fullwidth={fullWidth}
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span data-testid="loading-spinner">Loading...</span>}
      {children}
    </button>
  ),
}));

describe('AuthButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders with default login action', () => {
    renderWithUnauthenticatedUser(
      <AuthButton onClick={mockOnClick} />
    );

    const button = screen.getByTestId('auth-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Sign In');
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).toHaveAttribute('data-fullwidth', 'true');
  });

  it('renders with register action', () => {
    renderWithUnauthenticatedUser(
      <AuthButton action="register" onClick={mockOnClick} />
    );

    const button = screen.getByTestId('auth-button');
    expect(button).toHaveTextContent('Create Account');
    expect(button).toHaveAttribute('data-variant', 'primary');
  });

  it('renders with logout action', () => {
    renderWithUnauthenticatedUser(
      <AuthButton action="logout" onClick={mockOnClick} />
    );

    const button = screen.getByTestId('auth-button');
    expect(button).toHaveTextContent('Sign Out');
    expect(button).toHaveAttribute('data-variant', 'secondary');
  });

  it('renders with submit action', () => {
    renderWithUnauthenticatedUser(
      <AuthButton action="submit" onClick={mockOnClick} />
    );

    const button = screen.getByTestId('auth-button');
    expect(button).toHaveTextContent('Submit');
    expect(button).toHaveAttribute('data-variant', 'primary');
  });

  it('renders with custom children', () => {
    renderWithUnauthenticatedUser(
      <AuthButton onClick={mockOnClick}>
        Custom Button Text
      </AuthButton>
    );

    const button = screen.getByTestId('auth-button');
    expect(button).toHaveTextContent('Custom Button Text');
  });

  it('applies custom className', () => {
    renderWithUnauthenticatedUser(
      <AuthButton onClick={mockOnClick} className="custom-class" />
    );

    const button = screen.getByTestId('auth-button');
    expect(button).toHaveClass('custom-class');
  });

  it('handles loading state', () => {
    renderWithUnauthenticatedUser(
      <AuthButton onClick={mockOnClick} loading={true} />
    );

    const button = screen.getByTestId('auth-button');
    expect(button).toHaveAttribute('data-loading', 'true');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    renderWithUnauthenticatedUser(
      <AuthButton onClick={mockOnClick} disabled={true} />
    );

    const button = screen.getByTestId('auth-button');
    expect(button).toHaveAttribute('data-disabled', 'true');
    expect(button).toBeDisabled();
  });

  it('calls onClick when clicked', () => {
    renderWithUnauthenticatedUser(
      <AuthButton onClick={mockOnClick} />
    );

    const button = screen.getByTestId('auth-button');

    act(() => {
      fireEvent.click(button);
    });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    renderWithUnauthenticatedUser(
      <AuthButton onClick={mockOnClick} disabled={true} />
    );

    const button = screen.getByTestId('auth-button');

    act(() => {
      fireEvent.click(button);
    });

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    renderWithUnauthenticatedUser(
      <AuthButton onClick={mockOnClick} loading={true} />
    );

    const button = screen.getByTestId('auth-button');

    act(() => {
      fireEvent.click(button);
    });

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies custom variant', () => {
    renderWithUnauthenticatedUser(
      <AuthButton onClick={mockOnClick} variant="outline" />
    );

    const button = screen.getByTestId('auth-button');
    expect(button).toHaveAttribute('data-variant', 'outline');
  });

  it('passes through additional props', () => {
    renderWithUnauthenticatedUser(
      <AuthButton
        onClick={mockOnClick}
        data-testid="custom-button"
        aria-label="Custom Label"
      />
    );

    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom Label');
  });

  it('has correct button type', () => {
    renderWithUnauthenticatedUser(
      <AuthButton onClick={mockOnClick} />
    );

    const button = screen.getByTestId('auth-button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('defaults to primary variant when action is unknown', () => {
    renderWithUnauthenticatedUser(
      <AuthButton action="unknown" onClick={mockOnClick} />
    );

    const button = screen.getByTestId('auth-button');
    expect(button).toHaveAttribute('data-variant', 'primary');
  });

  it('defaults to Submit text when action is unknown', () => {
    renderWithUnauthenticatedUser(
      <AuthButton action="unknown" onClick={mockOnClick} />
    );

    const button = screen.getByTestId('auth-button');
    expect(button).toHaveTextContent('Submit');
  });
});
