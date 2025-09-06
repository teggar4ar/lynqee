/**
 * Form validation alert utilities
 * 
 * This module provides standardized alert display functions for form validation.
 * It integrates with the useAlerts hook for consistent error reporting.
 */

/**
 * Show validation errors using the alert system
 * @param {Object} params - Parameters
 * @param {Object} params.errors - Error object with field names as keys and error messages as values
 * @param {Function} params.showError - The showError function from useAlerts hook
 * @param {string} params.title - Optional title for the error alert
 * @param {string} params.position - Optional position for the alert
 */
export const showValidationErrors = ({ 
  errors, 
  showError, 
  title = 'Validation Error', 
  position = 'bottom-center' 
}) => {
  if (!errors || Object.keys(errors).length === 0) return;

  // Get the first error message
  const firstErrorField = Object.keys(errors)[0];
  const firstErrorMessage = errors[firstErrorField];

  if (!firstErrorMessage) return;

  showError({
    title,
    message: firstErrorMessage,
    position,
    duration: 5000,
  });
};

/**
 * Show a form submission success alert
 * @param {Object} params - Parameters
 * @param {Function} params.showSuccess - The showSuccess function from useAlerts hook
 * @param {string} params.title - Title for the success alert
 * @param {string} params.message - Success message
 * @param {string} params.position - Optional position for the alert
 */
export const showFormSuccess = ({
  showSuccess,
  title,
  message,
  position = 'bottom-center'
}) => {
  showSuccess({
    title,
    message,
    position,
    duration: 5000,
  });
};

/**
 * Show a field-specific validation error
 * @param {Object} params - Parameters
 * @param {string} params.field - Field name that has the error
 * @param {string} params.message - Error message
 * @param {Function} params.showError - The showError function from useAlerts hook
 * @param {string} params.position - Optional position for the alert
 */
export const showFieldError = ({
  field,
  message,
  showError,
  position = 'bottom-center'
}) => {
  if (!message) return;
  
  showError({
    title: `Invalid ${field.charAt(0).toUpperCase() + field.slice(1)}`,
    message,
    position,
    duration: 4000,
  });
};

/**
 * Format field name for display
 * @param {string} fieldName - The technical field name
 * @returns {string} Formatted field name for display
 */
export const formatFieldName = (fieldName) => {
  return fieldName
    // Split by camel case
    .replace(/([A-Z])/g, ' $1')
    // Handle snake_case
    .replace(/_/g, ' ')
    // Capitalize first letter
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export default {
  showValidationErrors,
  showFormSuccess,
  showFieldError,
  formatFieldName
};
