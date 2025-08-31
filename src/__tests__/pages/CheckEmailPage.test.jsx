/**
 * CheckEmailPage Smoke Test
 *
 * Tests that the CheckEmailPage renders without crashing
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithUnauthenticatedUser } from '../mocks/testUtils.jsx';
import CheckEmailPage from '../../pages/CheckEmailPage.jsx';

describe('CheckEmailPage', () => {
  it('renders without crashing', () => {
    renderWithUnauthenticatedUser(<CheckEmailPage />);

    // Check that the page renders basic elements
    expect(document.body).toBeInTheDocument();
  });
});
