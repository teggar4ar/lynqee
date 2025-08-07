/**
 * useFormValidation - Custom hook for form validation logic
 * 
 * Provides validation state management and error handling for forms.
 * Separates validation logic from UI components for better testability.
 */

import { useCallback, useState } from 'react';

/**
 * Custom hook for form validation
 * @param {Object} validationRules - Object containing validation functions
 * @returns {Object} Validation state and methods
 */
export const useFormValidation = (validationRules = {}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Validate a single field
   * @param {string} fieldName - Name of the field to validate
   * @param {any} value - Value to validate
   * @returns {string|null} Error message or null if valid
   */
  const validateField = useCallback((fieldName, value) => {
    const validator = validationRules[fieldName];
    if (validator && typeof validator === 'function') {
      return validator(value);
    }
    return null;
  }, [validationRules]);

  /**
   * Validate all fields
   * @param {Object} formData - Form data to validate
   * @returns {Object} Object containing all validation errors
   */
  const validateForm = useCallback((formData) => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });
    
    return newErrors;
  }, [validateField, validationRules]);

  /**
   * Handle field blur event
   * @param {string} fieldName - Name of the field that was blurred
   * @param {any} value - Current value of the field
   */
  const handleBlur = useCallback((fieldName, value) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, [validateField]);

  /**
   * Handle field change event
   * @param {string} fieldName - Name of the field that changed
   * @param {any} value - New value of the field
   */
  const handleChange = useCallback((fieldName, value) => {
    // Clear error when user starts typing
    if (touched[fieldName] && errors[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  }, [validateField, touched, errors]);

  /**
   * Submit form with validation
   * @param {Object} formData - Form data to validate and submit
   * @param {Function} onSubmit - Function to call if validation passes
   * @returns {boolean} True if validation passed, false otherwise
   */
  const submitForm = useCallback(async (formData, onSubmit) => {
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationRules).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // If no errors, submit the form
    if (Object.keys(validationErrors).length === 0) {
      if (onSubmit && typeof onSubmit === 'function') {
        await onSubmit(formData);
      }
      return true;
    }
    
    return false;
  }, [validateForm, validationRules]);

  /**
   * Clear all errors and touched state
   */
  const clearValidation = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Check if form is valid
   * @param {Object} formData - Current form data
   * @returns {boolean} True if form is valid
   */
  const isFormValid = useCallback((formData) => {
    const validationErrors = validateForm(formData);
    return Object.keys(validationErrors).length === 0;
  }, [validateForm]);

  return {
    errors,
    touched,
    handleBlur,
    handleChange,
    submitForm,
    clearValidation,
    isFormValid,
    validateField,
    validateForm,
  };
};

export default useFormValidation;
