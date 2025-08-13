/**
 * Avatar Component Test Suite
 * 
 * Tests for the Avatar component including image display and fallbacks
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from '../../../components/common/Avatar.jsx';

describe('Avatar Component', () => {
  it('renders with image when src is provided', () => {
    render(
      <Avatar 
        src="https://example.com/avatar.jpg" 
        alt="User avatar" 
      />
    );
    
    const img = screen.getByRole('img', { name: /user avatar/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders fallback when no src is provided', () => {
    render(<Avatar name="John Doe" />);
    
    // Should show fallback text
    const fallback = screen.getByText('?');
    expect(fallback).toBeInTheDocument();
  });

  it('applies correct classes', () => {
    render(<Avatar name="John Doe" />);
    
    // Should have the basic avatar structure with rounded-full class
    const avatarContainer = document.querySelector('[class*="rounded-full"]');
    expect(avatarContainer).toBeInTheDocument();
    expect(avatarContainer).toHaveClass('rounded-full');
  });
});
