/**
 * ErrorState Component Tests
 * 
 * Tests for the full-page error state component that displays different types
 * of error scenarios with appropriate messaging and recovery options.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ErrorState from '../../../../components/common/error/ErrorState.jsx';

// Helper to render with router context
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ErrorState', () => {
  describe('Error Types', () => {
    it('renders general error state', () => {
      renderWithRouter(<ErrorState type="general" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });

    it('renders network error state', () => {
      renderWithRouter(<ErrorState type="network" />);
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
    });

    it('renders unauthorized error state', () => {
      renderWithRouter(<ErrorState type="unauthorized" />);
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
    });

    it('renders profile not found error state', () => {
      renderWithRouter(<ErrorState type="profileNotFound" />);
      expect(screen.getByText('Profile Not Found')).toBeInTheDocument();
      expect(screen.getByText(/user profile doesn't exist/i)).toBeInTheDocument();
    });

    it('renders rate limit error state', () => {
      renderWithRouter(<ErrorState type="rateLimit" />);
      expect(screen.getByText('Too Many Requests')).toBeInTheDocument();
      expect(screen.getByText(/wait a moment/i)).toBeInTheDocument();
    });

    it('renders maintenance error state', () => {
      renderWithRouter(<ErrorState type="maintenance" />);
      expect(screen.getByText('Under Maintenance')).toBeInTheDocument();
      expect(screen.getByText(/performing maintenance/i)).toBeInTheDocument();
    });

    it('defaults to general error for unknown types', () => {
      renderWithRouter(<ErrorState type="unknown" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Custom Content', () => {
    it('renders custom title when provided', () => {
      renderWithRouter(
        <ErrorState 
          type="general" 
          title="Custom Error Title" 
        />
      );
      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    });

    it('renders custom message when provided', () => {
      renderWithRouter(
        <ErrorState 
          type="general" 
          message="This is a custom error message" 
        />
      );
      expect(screen.getByText('This is a custom error message')).toBeInTheDocument();
    });

    it('uses custom content over default type content', () => {
      renderWithRouter(
        <ErrorState 
          type="network" 
          title="Custom Title"
          message="Custom message"
        />
      );
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom message')).toBeInTheDocument();
      expect(screen.queryByText('Connection Problem')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders primary action button when onRetry is provided', () => {
      const handleAction = vi.fn();
      renderWithRouter(
        <ErrorState 
          type="general" 
          onRetry={handleAction}
        />
      );
      
      const actionButton = screen.getByRole('button', { name: 'Try Again' });
      expect(actionButton).toBeInTheDocument();
    });

    it('calls onRetry when primary action button is clicked', () => {
      const handleAction = vi.fn();
      renderWithRouter(
        <ErrorState 
          type="general" 
          onRetry={handleAction}
        />
      );
      
      const actionButton = screen.getByRole('button', { name: 'Try Again' });
      fireEvent.click(actionButton);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('renders secondary action button when available', () => {
      renderWithRouter(
        <ErrorState 
          type="general"
        />
      );
      
      const secondaryButton = screen.getByRole('button', { name: 'Go Home' });
      expect(secondaryButton).toBeInTheDocument();
    });

    it('does not render secondary button for notFound types', () => {
      renderWithRouter(
        <ErrorState 
          type="notFound"
        />
      );
      
      const secondaryButton = screen.queryByRole('button', { name: 'Go Home' });
      expect(secondaryButton).not.toBeInTheDocument();
    });

    it('renders both primary and secondary action buttons', () => {
      const handleAction = vi.fn();
      renderWithRouter(
        <ErrorState 
          type="general" 
          onRetry={handleAction}
        />
      );
      
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go Home' })).toBeInTheDocument();
    });

    it('does not render action buttons when showRetry is false', () => {
      renderWithRouter(<ErrorState type="general" showRetry={false} />);
      
      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });
  });

  describe('Default Actions', () => {
    it('renders default "Search Again" button for profile not found', () => {
      renderWithRouter(<ErrorState type="profileNotFound" />);
      expect(screen.getByRole('button', { name: 'Search Again' })).toBeInTheDocument();
    });

    it('renders default "Retry Connection" button for network errors', () => {
      renderWithRouter(<ErrorState type="network" />);
      expect(screen.getByRole('button', { name: 'Retry Connection' })).toBeInTheDocument();
    });

    it('renders default "Sign In" button for unauthorized errors', () => {
      renderWithRouter(<ErrorState type="unauthorized" />);
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('applies centered layout classes', () => {
      renderWithRouter(<ErrorState type="general" />);
      // Find the container by finding the emoji icon and going up
      const container = screen.getByText('⚠️').parentElement;
      expect(container).toHaveClass('text-center');
      expect(container).toHaveClass('space-y-6');
    });

    it('applies mobile-first responsive padding', () => {
      renderWithRouter(<ErrorState type="general" />);
      const container = screen.getByText('⚠️').parentElement;
      expect(container).toHaveClass('py-12');
    });

    it('has appropriate text alignment for mobile', () => {
      renderWithRouter(<ErrorState type="general" />);
      const container = screen.getByText('⚠️').parentElement;
      expect(container).toHaveClass('text-center');
    });
  });

  describe('Accessibility', () => {
    it('has properly structured headings', () => {
      renderWithRouter(<ErrorState type="general" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Something went wrong');
    });

    it('action buttons have proper button semantics', () => {
      const handleAction = vi.fn();
      renderWithRouter(
        <ErrorState 
          type="general" 
          onRetry={handleAction}
        />
      );
      
      const button = screen.getByRole('button', { name: 'Try Again' });
      expect(button).toBeInTheDocument();
    });

    it('buttons have proper accessibility labels', () => {
      renderWithRouter(<ErrorState type="profileNotFound" />);
      const button = screen.getByRole('button', { name: 'Search Again' });
      expect(button).toHaveAttribute('aria-label', 'Search Again');
    });
  });

  describe('Mobile Touch Targets', () => {
    it('action buttons have sufficient touch target size', () => {
      const handleAction = vi.fn();
      renderWithRouter(
        <ErrorState 
          type="general" 
          onRetry={handleAction}
        />
      );
      
      const button = screen.getByRole('button', { name: 'Try Again' });
      expect(button).toHaveClass('py-3'); // Ensures adequate touch target height
      expect(button).toHaveClass('px-4'); // Ensures adequate touch target width
    });
  });

  describe('Error Icon Display', () => {
    it('displays appropriate error emoji', () => {
      renderWithRouter(<ErrorState type="general" />);
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('displays different emojis for different error types', () => {
      renderWithRouter(<ErrorState type="network" />);
      expect(screen.getByText('📡')).toBeInTheDocument();
    });

    it('emoji has appropriate size for mobile viewing', () => {
      renderWithRouter(<ErrorState type="general" />);
      const emojiContainer = screen.getByText('⚠️').closest('div');
      expect(emojiContainer).toHaveClass('text-5xl');
      expect(emojiContainer).toHaveClass('sm:text-6xl');
      expect(emojiContainer).toHaveClass('md:text-7xl');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing type gracefully', () => {
      renderWithRouter(<ErrorState />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('handles empty string type', () => {
      renderWithRouter(<ErrorState type="" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('handles null onRetry gracefully', () => {
      renderWithRouter(
        <ErrorState 
          type="general" 
          onRetry={null}
        />
      );
      
      const button = screen.getByRole('button', { name: 'Try Again' });
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });
});
