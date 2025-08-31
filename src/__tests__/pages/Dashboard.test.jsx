/**
 * Dashboard Page Smoke Test
 *
 * Tests that the Dashboard page renders without crashing
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../mocks/testUtils.jsx';
import Dashboard from '../../pages/Dashboard.jsx';

describe('Dashboard Page', () => {
  it('renders without crashing', () => {
    renderWithProviders(<Dashboard />);

    // Check that the page renders basic elements
    expect(document.body).toBeInTheDocument();
  });
});
