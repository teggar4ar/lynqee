/**
 * useAuth Hook Test Suite
 * 
 * Tests for the useAuth custom hook covering authentication state management
 */

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth.js';
import AuthContext from '../../contexts/AuthContext.jsx';
import { mockAuthContextAuthenticated, mockAuthContextUnauthenticated } from '../mocks/testUtils.jsx';

// Create wrapper component for context
const createWrapper = (authValue) => {
  return ({ children }) => (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns authenticated user data when user is signed in', () => {
    const wrapper = createWrapper(mockAuthContextAuthenticated);
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBe(mockAuthContextAuthenticated.user);
    expect(result.current.session).toBe(mockAuthContextAuthenticated.session);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns unauthenticated state when no user', () => {
    const wrapper = createWrapper(mockAuthContextUnauthenticated);
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('provides authentication methods', () => {
    const wrapper = createWrapper(mockAuthContextAuthenticated);
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(typeof result.current.signInWithGoogle).toBe('function');
    expect(typeof result.current.signInWithEmail).toBe('function');
    expect(typeof result.current.signUpWithEmail).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
    expect(typeof result.current.resetPassword).toBe('function');
  });

  it('provides helper computed properties', () => {
    const wrapper = createWrapper(mockAuthContextAuthenticated);
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.hasProfile).toBeDefined();
    expect(result.current.userEmail).toBe(mockAuthContextAuthenticated.user.email);
    expect(result.current.userId).toBe(mockAuthContextAuthenticated.user.id);
  });

  it('handles loading state correctly', () => {
    const loadingAuthContext = {
      ...mockAuthContextUnauthenticated,
      isLoading: true,
    };
    
    const wrapper = createWrapper(loadingAuthContext);
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
  });
});
