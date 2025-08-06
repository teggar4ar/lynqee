/**
 * Input - Reusable input component with mobile-first design
 * 
 * Features:
 * - Mobile-optimized touch targets (min 44x44px)
 * - Clear visual feedback for validation states
 * - Responsive design starting from mobile
 * - Accessibility support
 */

import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  error,
  touched,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  ...props
}) => {
  const inputId = `input-${name}`;
  
  // Combine base classes with custom classes
  const baseInputClasses = `
    w-full px-4 py-3 border rounded-lg
    text-base font-medium
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    placeholder:text-gray-500
  `;
  
  // Dynamic classes based on state
  const stateClasses = error && touched
    ? 'border-red-500 bg-red-50 text-red-900'
    : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400';
    
  const inputClasses = `${baseInputClasses} ${stateClasses} ${className}`.trim();

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={inputClasses}
        // Ensure minimum touch target size on mobile
        style={{ minHeight: '44px' }}
        {...props}
      />
      
      {error && touched && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  touched: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.string,
  className: PropTypes.string,
};

export default Input;
