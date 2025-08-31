/**
 * ProfileSetup Page Smoke Test
 *
 * Tests that the ProfileSetup page renders without crashing
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../mocks/testUtils.jsx';
import ProfileSetup from '../../pages/ProfileSetup.jsx';

describe('ProfileSetup Page', () => {
  it('renders without crashing', () => {
    renderWithProviders(<ProfileSetup />);

    // Check that the page renders basic elements
    expect(document.body).toBeInTheDocument();
  });
});
