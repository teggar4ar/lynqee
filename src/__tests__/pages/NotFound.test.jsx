/**
 * NotFound Page Smoke Test
 *
 * Tests that the NotFound page renders without crashing
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../mocks/testUtils.jsx';
import NotFound from '../../pages/NotFound.jsx';

describe('NotFound Page', () => {
  it('renders without crashing', () => {
    renderWithProviders(<NotFound />);

    // Check that the page renders basic elements
    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders profile not found variant', () => {
    renderWithProviders(<NotFound type="profile" username="testuser" />);

    expect(screen.getByText('👤')).toBeInTheDocument();
    expect(screen.getByText('Profile Not Found')).toBeInTheDocument();
    expect(screen.getByText('The profile "@testuser" doesn\'t exist or has been removed.')).toBeInTheDocument();
  });

  it('renders with navigation buttons', () => {
    renderWithProviders(<NotFound />);

    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });
});
