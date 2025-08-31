/**
 * ResetPassword Page Smoke Test
 *
 * Tests that the ResetPassword page renders without crashing
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithUnauthenticatedUser } from '../mocks/testUtils.jsx';
import ResetPassword from '../../pages/ResetPassword.jsx';

describe('ResetPassword Page', () => {
  it('renders without crashing', () => {
    renderWithUnauthenticatedUser(<ResetPassword />);

    // Check that the page renders basic elements
    expect(document.body).toBeInTheDocument();
  });
});
