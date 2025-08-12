/**
 * useFormValidation Hook Tests
 * 
 * Tests for the useFormValidation custom hook covering:
 * - Field validation
 * - Form validation
 * - Error state management
 * - Touch state management
 */

import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useFormValidation } from '../../hooks/useFormValidation.js';

describe('useFormValidation Hook', () => {
  const mockValidationRules = {
    email: (value) => {
      if (!value) return 'Email is required';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
      return null;
    },
    password: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      return null;
    },
    username: (value) => {
      if (!value) return 'Username is required';
      if (value.length < 3) return 'Username must be at least 3 characters';
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
      return null;
    },
  };

  it('initializes with empty errors and touched state', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationRules));

    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('validates a single field correctly', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationRules));

    // Valid email
    let error = result.current.validateField('email', 'test@example.com');
    expect(error).toBeNull();

    // Invalid email
    error = result.current.validateField('email', 'invalid-email');
    expect(error).toBe('Email is invalid');

    // Empty email
    error = result.current.validateField('email', '');
    expect(error).toBe('Email is required');
  });

  it('validates entire form correctly', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationRules));

    // Valid form data
    let errors = result.current.validateForm({
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    });
    expect(errors).toEqual({});

    // Invalid form data
    errors = result.current.validateForm({
      email: 'invalid-email',
      password: '123',
      username: 'ab',
    });
    expect(errors).toEqual({
      email: 'Email is invalid',
      password: 'Password must be at least 8 characters',
      username: 'Username must be at least 3 characters',
    });
  });

  it('handles blur events correctly', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationRules));

    // Blur with invalid value
    act(() => {
      result.current.handleBlur('email', 'invalid-email');
    });

    expect(result.current.errors.email).toBe('Email is invalid');
    expect(result.current.touched.email).toBe(true);
  });

  it('handles change events correctly', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationRules));

    // First, blur with invalid value to set error and touched
    act(() => {
      result.current.handleBlur('email', 'invalid-email');
    });

    expect(result.current.errors.email).toBe('Email is invalid');
    expect(result.current.touched.email).toBe(true);

    // Then change to valid value - should clear error
    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.errors.email).toBeNull();
    expect(result.current.touched.email).toBe(true);
  });

  it('handles form submission correctly', async () => {
    const { result } = renderHook(() => useFormValidation(mockValidationRules));
    const mockSubmitHandler = vi.fn();

    const formData = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    };

    let submitResult;
    // Submit valid form
    await act(async () => {
      submitResult = await result.current.submitForm(formData, mockSubmitHandler);
    });

    expect(submitResult).toBe(true);
    expect(mockSubmitHandler).toHaveBeenCalledWith(formData);
    expect(result.current.errors).toEqual({});
  });

  it('prevents submission with invalid form data', async () => {
    const { result } = renderHook(() => useFormValidation(mockValidationRules));
    const mockSubmitHandler = vi.fn();

    const invalidFormData = {
      email: 'invalid-email',
      password: '123',
      username: 'ab',
    };

    let submitResult;
    // Submit invalid form
    await act(async () => {
      submitResult = await result.current.submitForm(invalidFormData, mockSubmitHandler);
    });

    expect(submitResult).toBe(false);
    expect(mockSubmitHandler).not.toHaveBeenCalled();
    expect(result.current.errors).toEqual({
      email: 'Email is invalid',
      password: 'Password must be at least 8 characters',
      username: 'Username must be at least 3 characters',
    });
  });

  it('clears validation state correctly', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationRules));

    // First, set some errors and touched state
    act(() => {
      result.current.handleBlur('email', 'invalid-email');
      result.current.handleBlur('password', '123');
    });

    expect(Object.keys(result.current.errors)).toHaveLength(2);
    expect(Object.keys(result.current.touched)).toHaveLength(2);

    // Clear validation state
    act(() => {
      result.current.clearValidation();
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('checks form validity correctly', () => {
    const { result } = renderHook(() => useFormValidation(mockValidationRules));

    // Valid form data
    const validFormData = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
    };

    expect(result.current.isFormValid(validFormData)).toBe(true);

    // Invalid form data
    const invalidFormData = {
      email: 'invalid-email',
      password: '123',
      username: 'ab',
    };

    expect(result.current.isFormValid(invalidFormData)).toBe(false);
  });
});
