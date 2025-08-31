/**
 * PublicProfile Page Smoke Test
 *
 * Tests that the PublicProfile page renders without crashing
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithUnauthenticatedUser } from '../mocks/testUtils.jsx';
import PublicProfile from '../../pages/PublicProfile.jsx';

describe('PublicProfile Page', () => {
  it('renders without crashing', () => {
    renderWithUnauthenticatedUser(<PublicProfile />);

    // Check that the page renders basic elements
    expect(document.body).toBeInTheDocument();
  });
});
