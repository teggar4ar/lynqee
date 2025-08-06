/**
 * Button - Reusable button component with mobile-first design
 * 
 * Features:
 * - Mobile-optimized touch targets (min 44x44px)
 * - Multiple variants (primary, secondary, outline, etc.)
 * - Loading states with spinner
 * - Responsive design starting from mobile
 * - Accessibility support
 */

import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  fullWidth = false,
  ...props
}) => {
  // Base button classes (mobile-first)
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    touch-manipulation
  `;

  // Size variants (mobile-optimized)
  const sizeClasses = {
    small: 'px-3 py-2 text-sm min-h-[40px]',
    medium: 'px-4 py-3 text-base min-h-[44px]',
    large: 'px-6 py-4 text-lg min-h-[48px] md:min-h-[52px]',
  };

  // Color variants
  const variantClasses = {
    primary: `
      bg-blue-500 text-white 
      hover:bg-blue-600 
      focus:ring-blue-500
      active:bg-blue-700
    `,
    secondary: `
      bg-gray-500 text-white 
      hover:bg-gray-600 
      focus:ring-gray-500
      active:bg-gray-700
    `,
    outline: `
      border-2 border-blue-500 text-blue-500 bg-transparent
      hover:bg-blue-50 
      focus:ring-blue-500
      active:bg-blue-100
    `,
    ghost: `
      text-blue-500 bg-transparent
      hover:bg-blue-50 
      focus:ring-blue-500
      active:bg-blue-100
    `,
    danger: `
      bg-red-500 text-white 
      hover:bg-red-600 
      focus:ring-red-500
      active:bg-red-700
    `,
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${widthClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClasses}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
};

export default Button;
