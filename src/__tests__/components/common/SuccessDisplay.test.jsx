/**
 * SuccessDisplay Component Tests
 * 
 * Tests for the success message display component used throughout forms and components.
 * This component shows user-friendly success messages with appropriate styling.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SuccessDisplay from "../../../components/common/SuccessDisplay.jsx";

describe('SuccessDisplay', () => {
  describe('Basic Rendering', () => {
    it('renders success message when message is a string', () => {
      render(<SuccessDisplay message="Operation completed successfully" />);
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    });

    it('does not render when message is null', () => {
      const { container } = render(<SuccessDisplay message={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('does not render when message is undefined', () => {
      const { container } = render(<SuccessDisplay message={undefined} />);
      expect(container.firstChild).toBeNull();
    });

    it('does not render when message is empty string', () => {
      const { container } = render(<SuccessDisplay message="" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Size Variants', () => {
    it('renders with small size styling', () => {
      render(<SuccessDisplay message="Success message" size="small" />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('text-xs', 'p-2');
    });

    it('renders with medium size styling (default)', () => {
      render(<SuccessDisplay message="Success message" size="default" />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('text-sm', 'p-3');
    });

    it('renders with large size styling', () => {
      render(<SuccessDisplay message="Success message" size="large" />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('text-base', 'p-4');
    });

    it('defaults to default size when size prop is not provided', () => {
      render(<SuccessDisplay message="Success message" />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('text-sm', 'p-3');
    });
  });

  describe('Icon Display', () => {
    it('shows icon by default', () => {
      render(<SuccessDisplay message="Success message" />);
      const iconContainer = screen.getByText('Success message').parentElement.querySelector('svg');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('w-4', 'h-4', 'text-green-500');
    });

    it('shows icon when showIcon is explicitly true', () => {
      render(<SuccessDisplay message="Success message" showIcon={true} />);
      const iconContainer = screen.getByText('Success message').parentElement.querySelector('svg');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('w-4', 'h-4', 'text-green-500');
    });

    it('hides icon when showIcon is false', () => {
      render(<SuccessDisplay message="Success message" showIcon={false} />);
      const iconContainer = screen.getByText('Success message').parentElement.querySelector('svg');
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe('Styling and Classes', () => {
    it('applies default success styling classes', () => {
      render(<SuccessDisplay message="Success message" />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('bg-green-50');
      expect(container).toHaveClass('border-green-200');
      expect(container).toHaveClass('rounded-lg');
    });

    it('applies custom className when provided', () => {
      render(<SuccessDisplay message="Success message" className="custom-class" />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('custom-class');
    });

    it('combines default and custom classes', () => {
      render(<SuccessDisplay message="Success message" className="mb-4" />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('bg-green-50');
      expect(container).toHaveClass('mb-4');
    });
  });

  describe('Accessibility', () => {
    it('has appropriate ARIA role for success message', () => {
      render(<SuccessDisplay message="Success message" />);
      const successElement = screen.getByRole('status');
      expect(successElement).toBeInTheDocument();
    });

    it('is announced to screen readers', () => {
      render(<SuccessDisplay message="Success message" />);
      const successElement = screen.getByRole('status');
      expect(successElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('applies mobile-first responsive classes', () => {
      render(<SuccessDisplay message="Success message" />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('p-3');
      expect(container).toHaveClass('rounded-lg');
    });

    it('has sufficient spacing for mobile viewing', () => {
      render(<SuccessDisplay message="Success message" />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('p-3');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long success messages', () => {
      const longMessage = 'This is a very long success message that should still be displayed properly without breaking the layout or causing any issues with the component rendering and styling';
      render(<SuccessDisplay message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('handles messages with special characters', () => {
      const specialMessage = 'Success! @#$%^&*()_+ message with symbols';
      render(<SuccessDisplay message={specialMessage} />);
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it('handles HTML entities in messages', () => {
      const entityMessage = 'Success &amp; completion message';
      render(<SuccessDisplay message={entityMessage} />);
      expect(screen.getByText(entityMessage)).toBeInTheDocument();
    });
  });
});
