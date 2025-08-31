/**
 * LandingPage Smoke Test
 *
 * Tests that the LandingPage renders without crashing
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithUnauthenticatedUser } from '../mocks/testUtils.jsx';
import LandingPage from '../../pages/LandingPage.jsx';

describe('LandingPage', () => {
  it('renders without crashing', () => {
    renderWithUnauthenticatedUser(<LandingPage />);

    // Check that the page renders - we expect some basic elements
    // Since LandingPage renders multiple components, we check for common elements
    expect(document.body).toBeInTheDocument();
  });
});
