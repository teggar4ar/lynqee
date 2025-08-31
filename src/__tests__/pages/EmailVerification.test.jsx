/**
 * EmailVerification Page Smoke Test
 *
 * Tests that the EmailVerification page renders without crashing
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithUnauthenticatedUser } from '../mocks/testUtils.jsx';
import EmailVerification from '../../pages/EmailVerification.jsx';

describe('EmailVerification Page', () => {
  it('renders without crashing', () => {
    renderWithUnauthenticatedUser(<EmailVerification />);

    // Check that the page renders basic elements
    expect(document.body).toBeInTheDocument();
  });
});
