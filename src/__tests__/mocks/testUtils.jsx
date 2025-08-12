/**
 * Test utilities and mocks for component testing
 * 
 * This file contains helper functions and mocks that are commonly used
 * across test files. It follows clean architecture principles by
 * providing reusable testing patterns.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AuthContext from '../../contexts/AuthContext.jsx';
import AppStateContext from '../../contexts/AppStateContext.jsx';

/**
 * Mock user object for testing
 */
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00.000Z',
  user_metadata: {
    name: 'Test User',
  },
};

/**
 * Mock profile object for testing
 */
export const mockProfile = {
  id: 'test-profile-id',
  user_id: 'test-user-id',
  username: 'testuser',
  name: 'Test User',
  bio: 'Test bio',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

/**
 * Mock links array for testing
 */
export const mockLinks = [
  {
    id: 'link-1',
    user_id: 'test-user-id',
    title: 'Test Link 1',
    url: 'https://example.com/1',
    position: 1,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'link-2',
    user_id: 'test-user-id',
    title: 'Test Link 2',
    url: 'https://example.com/2',
    position: 2,
    created_at: '2024-01-01T00:00:00.000Z',
  },
];

/**
 * Mock AuthContext value for authenticated user
 */
export const mockAuthContextAuthenticated = {
  user: mockUser,
  session: { access_token: 'mock-token' },
  isLoading: false,
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  isAuthenticated: true,
};

/**
 * Mock AuthContext value for unauthenticated user
 */
export const mockAuthContextUnauthenticated = {
  user: null,
  session: null,
  isLoading: false,
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  isAuthenticated: false,
};

/**
 * Mock AppStateContext value
 */
export const mockAppStateContext = {
  profileData: mockProfile,
  linksData: mockLinks,
  dashboardStats: {
    totalLinks: 2,
    totalClicks: 42,
    thisMonth: 15,
  },
  isLoading: false,
  error: null,
  refreshProfile: vi.fn(),
  refreshLinks: vi.fn(),
  updateProfile: vi.fn(),
  addLink: vi.fn(),
  updateLink: vi.fn(),
  deleteLink: vi.fn(),
  reorderLinks: vi.fn(),
};

/**
 * Mock Supabase client for testing
 */
export const mockSupabaseClient = {
  auth: {
    signInWithOAuth: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
    then: vi.fn(),
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      createSignedUrl: vi.fn(),
      getPublicUrl: vi.fn(),
    })),
  },
};

/**
 * Wrapper component that provides common context providers
 */
export const TestProviders = ({ 
  children, 
  authValue = mockAuthContextAuthenticated, 
  appStateValue = mockAppStateContext 
}) => {
  return (
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        <AppStateContext.Provider value={appStateValue}>
          {children}
        </AppStateContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

/**
 * Custom render function that wraps components with providers
 */
export const renderWithProviders = (
  ui,
  {
    authValue = mockAuthContextAuthenticated,
    appStateValue = mockAppStateContext,
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <TestProviders authValue={authValue} appStateValue={appStateValue}>
      {children}
    </TestProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Helper to render with unauthenticated state
 */
export const renderWithUnauthenticatedUser = (ui, options = {}) => {
  return renderWithProviders(ui, {
    authValue: mockAuthContextUnauthenticated,
    ...options,
  });
};

/**
 * Helper to render with loading state
 */
export const renderWithLoadingState = (ui, options = {}) => {
  return renderWithProviders(ui, {
    appStateValue: {
      ...mockAppStateContext,
      isLoading: true,
    },
    ...options,
  });
};

/**
 * Helper to render with error state
 */
export const renderWithErrorState = (ui, error = 'Test error', options = {}) => {
  return renderWithProviders(ui, {
    appStateValue: {
      ...mockAppStateContext,
      error,
      isLoading: false,
    },
    ...options,
  });
};

/**
 * Helper to create mock functions for services
 */
export const createMockService = (methods = []) => {
  const service = {};
  methods.forEach(method => {
    service[method] = vi.fn();
  });
  return service;
};

/**
 * Helper to wait for async operations in tests
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));
