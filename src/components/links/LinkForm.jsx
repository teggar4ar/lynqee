/**
 * LinkForm - Reusable form component for creating and editing links
 * 
 * Features:
 * - Mobile-first form design with touch-optimized inputs
 * - Real-time validation with user-friendly error messages
 * - Responsive layout and spacing
 * - Accessibility support
 * - Supports both create and edit modes
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from '../common';
import { validateLinkData } from '../../utils/validators';

const LinkForm = ({
  initialData = null, // Changed to null to detect when no data is passed
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Add Link',
  cancelLabel = 'Cancel',
  className = ''
}) => {
  // Memoize the default initial data to prevent re-creation on every render
  const defaultInitialData = useMemo(() => ({ title: '', url: '' }), []);
  
  // Use provided initialData or default
  const actualInitialData = initialData || defaultInitialData;
  
  const [formData, setFormData] = useState(actualInitialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Use ref to track the last processed initialData to avoid infinite loops
  const lastInitialDataRef = useRef(actualInitialData);

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    const currentDataString = JSON.stringify(actualInitialData);
    const lastDataString = JSON.stringify(lastInitialDataRef.current);
    
    // Only update if the initial data has actually changed
    if (currentDataString !== lastDataString) {
      setFormData(actualInitialData);
      setErrors({});
      setTouched({});
      lastInitialDataRef.current = actualInitialData;
    }
  }, [actualInitialData]);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name] && touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle input blur for validation
  const handleBlur = (event) => {
    const { name } = event.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate individual field on blur
    validateField(name, formData[name]);
  };

  // Validate individual field
  const validateField = (fieldName, value) => {
    const tempData = { ...formData, [fieldName]: value };
    const validation = validateLinkData(tempData);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: validation.errors[fieldName] || ''
    }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Mark all fields as touched for validation display
    setTouched({
      title: true,
      url: true
    });

    // Validate all data
    const validation = validateLinkData(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Trim whitespace from form data
    const cleanedData = {
      title: formData.title.trim(),
      url: formData.url.trim()
    };

    try {
      await onSubmit(cleanedData);
    } catch (error) {
      // Error handling is done by parent component
      console.error('[LinkForm] Submit error:', error);
    }
  };

  // Format URL helper (add protocol if missing)
  const formatUrl = (url) => {
    const trimmed = url.trim();
    if (trimmed && !trimmed.match(/^https?:\/\//i)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  // Handle URL field special formatting
  const handleUrlBlur = (event) => {
    const { value } = event.target;
    const formatted = formatUrl(value);
    
    if (formatted !== value) {
      setFormData(prev => ({
        ...prev,
        url: formatted
      }));
    }
    
    handleBlur(event);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Title Field */}
      <div>
        <Input
          type="text"
          name="title"
          label="Link Title"
          placeholder="e.g., My Portfolio, Instagram, etc."
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.title ? errors.title : ''}
          required
          disabled={loading}
          autoComplete="off"
          className="
            text-base sm:text-sm
            min-h-[44px]
          "
        />
        <p className="mt-1 text-xs text-gray-600 sm:text-sm">
          Choose a descriptive title for your link
        </p>
      </div>

      {/* URL Field */}
      <div>
        <Input
          type="url"
          name="url"
          label="URL"
          placeholder="https://example.com"
          value={formData.url}
          onChange={handleChange}
          onBlur={handleUrlBlur}
          error={touched.url ? errors.url : ''}
          required
          disabled={loading}
          autoComplete="url"
          className="
            text-base sm:text-sm
            min-h-[44px]
          "
        />
        <p className="mt-1 text-xs text-gray-600 sm:text-sm">
          Include the full URL starting with https://
        </p>
      </div>

      {/* Form Actions */}
      <div className="
        flex flex-col-reverse space-y-3 space-y-reverse
        pt-4 border-t border-gray-200
        sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-end
      ">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="
              w-full sm:w-auto
              py-3 sm:py-2
              text-base sm:text-sm
              min-h-[44px]
            "
          >
            {cancelLabel}
          </Button>
        )}
        
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="
            w-full sm:w-auto
            py-3 sm:py-2
            text-base sm:text-sm
            min-h-[44px]
          "
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
};

LinkForm.propTypes = {
  /** Initial form data for edit mode */
  initialData: PropTypes.shape({
    title: PropTypes.string,
    url: PropTypes.string,
  }),
  /** Function called when form is submitted with valid data */
  onSubmit: PropTypes.func.isRequired,
  /** Function called when cancel button is clicked (optional) */
  onCancel: PropTypes.func,
  /** Whether the form is in loading state */
  loading: PropTypes.bool,
  /** Text for the submit button */
  submitLabel: PropTypes.string,
  /** Text for the cancel button */
  cancelLabel: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default LinkForm;
