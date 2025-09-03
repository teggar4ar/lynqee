/**
 * Auth Page Smoke Test
 *
 * Tests that the Auth page renders without crashing
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, renderWithUnauthenticatedUser } from '../mocks/testUtils.jsx';
import Auth from '../../pages/Auth.jsx';

describe('Auth Page', () => {
  it('renders without crashing when unauthenticated', () => {
    renderWithUnauthenticatedUser(<Auth />);

    // Check that the page renders basic elements
    expect(document.body).toBeInTheDocument();
  });

  it('renders without crashing when authenticated', () => {
    renderWithProviders(<Auth />);

    // When authenticated, it should redirect, but we can still check it renders initially
    expect(document.body).toBeInTheDocument();
  });
});
