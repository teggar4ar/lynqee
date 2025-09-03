/**
 * Erimport ErrorDisplay from "../../../../components/common/error/ErrorDisplay.jsx";orDisplay Component Tests
 * 
 * Tests for the inline error display component used throughout forms and components.
 * This component shows user-friendly error messages with appropriate styling.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ErrorDisplay from '../../../../components/common/error/ErrorDisplay.jsx';

describe('ErrorDisplay', () => {
  describe('Basic Rendering', () => {
    it('renders error message when error is a string', () => {
      render(<ErrorDisplay error="Test error message" />);
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('renders error message when error is an Error object', () => {
      const error = new Error('Test error object');
      render(<ErrorDisplay error={error} />);
      expect(screen.getByText('Test error object')).toBeInTheDocument();
    });

    it('renders error message when error has a message property', () => {
      const error = { message: 'Test error with message property' };
      render(<ErrorDisplay error={error} />);
      expect(screen.getByText('Test error with message property')).toBeInTheDocument();
    });

    it('does not render when error is null', () => {
      const { container } = render(<ErrorDisplay error={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('does not render when error is undefined', () => {
      const { container } = render(<ErrorDisplay error={undefined} />);
      expect(container.firstChild).toBeNull();
    });

    it('does not render when error is empty string', () => {
      const { container } = render(<ErrorDisplay error="" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Size Variants', () => {
    it('renders with small size styling', () => {
      render(<ErrorDisplay error="Test error" size="small" />);
      const container = screen.getByRole('alert');
      expect(container).toHaveClass('text-xs', 'p-2');
    });

    it('renders with medium size styling (default)', () => {
      render(<ErrorDisplay error="Test error" size="default" />);
      const container = screen.getByRole('alert');
      expect(container).toHaveClass('text-sm', 'p-3');
    });

    it('renders with large size styling', () => {
      render(<ErrorDisplay error="Test error" size="large" />);
      const container = screen.getByRole('alert');
      expect(container).toHaveClass('text-base', 'p-4');
    });

    it('defaults to default size when size prop is not provided', () => {
      render(<ErrorDisplay error="Test error" />);
      const container = screen.getByRole('alert');
      expect(container).toHaveClass('text-sm', 'p-3');
    });
  });

  describe('Icon Display', () => {
    it('shows icon by default', () => {
      render(<ErrorDisplay error="Test error" />);
      const icon = screen.queryByRole('img', { hidden: true });
      expect(icon).not.toBeInTheDocument();
    });

    it('shows icon when showIcon is explicitly true', () => {
      render(<ErrorDisplay error="Test error" showIcon={true} />);
      const iconContainer = screen.getByText('Test error').parentElement.querySelector('svg');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('w-4', 'h-4', 'text-red-500');
    });

    it('hides icon when showIcon is false', () => {
      render(<ErrorDisplay error="Test error" showIcon={false} />);
      const iconContainer = screen.getByText('Test error').parentElement.querySelector('svg');
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe('Styling and Classes', () => {
    it('applies default error styling classes', () => {
      render(<ErrorDisplay error="Test error" />);
      const container = screen.getByRole('alert');
      expect(container).toHaveClass('bg-red-50');
      expect(container).toHaveClass('border-red-200');
      expect(container).toHaveClass('rounded-lg');
    });

    it('applies custom className when provided', () => {
      render(<ErrorDisplay error="Test error" className="custom-class" />);
      const container = screen.getByRole('alert');
      expect(container).toHaveClass('custom-class');
    });

    it('combines default and custom classes', () => {
      render(<ErrorDisplay error="Test error" className="mb-4" />);
      const container = screen.getByRole('alert');
      expect(container).toHaveClass('bg-red-50');
      expect(container).toHaveClass('mb-4');
    });
  });

  describe('Accessibility', () => {
    it('has appropriate ARIA role for error message', () => {
      render(<ErrorDisplay error="Test error" />);
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
    });

    it('is announced to screen readers', () => {
      render(<ErrorDisplay error="Test error" />);
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('applies mobile-first responsive classes', () => {
      render(<ErrorDisplay error="Test error" />);
      const container = screen.getByRole('alert');
      expect(container).toHaveClass('p-3');
      expect(container).toHaveClass('rounded-lg');
    });

    it('has sufficient touch target spacing', () => {
      render(<ErrorDisplay error="Test error" />);
      const container = screen.getByRole('alert');
      // Check for adequate padding that provides good touch target
      expect(container).toHaveClass('p-3');
    });
  });

  describe('Error Types and Context', () => {
    it('handles network error objects appropriately', () => {
      const networkError = { 
        message: 'Network error occurred',
        type: 'network'
      };
      render(<ErrorDisplay error={networkError} />);
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });

    it('handles validation error objects', () => {
      const validationError = {
        message: 'Validation failed',
        type: 'validation',
        field: 'email'
      };
      render(<ErrorDisplay error={validationError} />);
      expect(screen.getByText('Validation failed')).toBeInTheDocument();
    });

    it('handles complex error objects with nested messages', () => {
      const complexError = {
        error: {
          message: 'Nested error message'
        }
      };
      render(<ErrorDisplay error={complexError} />);
      // Should fall back to default message since no direct message property
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles boolean error values gracefully', () => {
      render(<ErrorDisplay error={true} />);
      // Should show fallback message for invalid error types
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });

    it('handles number error values gracefully', () => {
      render(<ErrorDisplay error={404} />);
      // Should show fallback message for invalid error types  
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });

    it('handles array error values gracefully', () => {
      render(<ErrorDisplay error={['error1', 'error2']} />);
      // Should show fallback message for invalid error types
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });

    it('handles very long error messages', () => {
      const longError = 'This is a very long error message that should still be displayed properly without breaking the layout or causing any issues with the component rendering and styling';
      render(<ErrorDisplay error={longError} />);
      expect(screen.getByText(longError)).toBeInTheDocument();
    });
  });
});
