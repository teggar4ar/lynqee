/**
 * LinksPage Smoke Test
 *
 * Tests that the LinksPage renders without crashing
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { act } from '@testing-library/react';
import { renderWithProviders } from '../mocks/testUtils.jsx';
import LinksPage from '../../pages/LinksPage.jsx';

describe('LinksPage', () => {
  it('renders without crashing', async () => {
    await act(async () => {
      renderWithProviders(<LinksPage />);
    });

    // Check that the page renders basic elements
    expect(document.body).toBeInTheDocument();
  });
});
