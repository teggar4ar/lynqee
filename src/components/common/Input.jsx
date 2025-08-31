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

// Generate a unique ID for cases where name is not provided
let inputCounter = 0;

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
  icon,
  rightElement,
  ...props
}) => {
  // Generate unique ID using name or fallback to counter
  const inputId = React.useMemo(() => {
    if (name) {
      return `input-${name}`;
    }
    inputCounter += 1;
    return `input-generated-${inputCounter}`;
  }, [name]);
  
  // Combine base classes with custom classes
  const baseInputClasses = `
    w-full px-4 py-3 border rounded-lg
    text-base font-medium
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-forest-green
    disabled:bg-sage-gray/20 disabled:cursor-not-allowed
    placeholder:text-sage-gray
  `;
  
  // Dynamic classes based on state
  const stateClasses = error && touched
    ? 'border-coral-red bg-coral-red/5 text-coral-red'
    : 'border-sage-gray/30 bg-white text-forest-green hover:border-sage-gray/50';
    
  const inputClasses = `${baseInputClasses} ${stateClasses} ${className}`.trim();

  // Adjust padding if icon or right element is present
  const hasIcon = icon !== undefined;
  const hasRightElement = rightElement !== undefined;
  
  let paddingClasses = 'px-4';
  if (hasIcon && hasRightElement) {
    paddingClasses = 'pl-10 pr-12';
  } else if (hasIcon) {
    paddingClasses = 'pl-10';
  } else if (hasRightElement) {
    paddingClasses = 'pr-12';
  }
  
  const adjustedInputClasses = inputClasses.replace('px-4', paddingClasses);

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-forest-green mb-2"
        >
          {label}
          {required && <span className="text-coral-red ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
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
          className={adjustedInputClasses}
          // Ensure minimum touch target size on mobile
          style={{ minHeight: '44px' }}
          {...props}
        />
        
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      
      {error && touched && (
        <p className="mt-2 text-sm text-coral-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
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
  icon: PropTypes.node,
  rightElement: PropTypes.node,
};

export default Input;
