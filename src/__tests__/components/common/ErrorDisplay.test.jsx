import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorDisplay from '../../../components/common/ErrorDisplay';

describe('ErrorDisplay', () => {
  it('renders string error correctly', () => {
    render(<ErrorDisplay error="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders Error object correctly', () => {
    const error = new Error('Test error object');
    render(<ErrorDisplay error={error} />);
    expect(screen.getByText('Test error object')).toBeInTheDocument();
  });

  it('renders object with message property correctly', () => {
    const error = { message: 'Test object message' };
    render(<ErrorDisplay error={error} />);
    expect(screen.getByText('Test object message')).toBeInTheDocument();
  });

  it('does not render when error is null', () => {
    const { container } = render(<ErrorDisplay error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows icon when showIcon is true', () => {
    render(<ErrorDisplay error="Test error" showIcon={true} />);
    expect(screen.getByRole('alert')).toContainHTML('svg');
  });

  it('applies custom className', () => {
    render(<ErrorDisplay error="Test error" className="custom-class" />);
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });

  it('applies correct size classes', () => {
    render(<ErrorDisplay error="Test error" size="large" />);
    expect(screen.getByRole('alert')).toHaveClass('text-base', 'p-4');
  });
});
