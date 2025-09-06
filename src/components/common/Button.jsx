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
import { Loader2 } from 'lucide-react';

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
  as,
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
      bg-forest-green text-white
      hover:bg-deep-forest
      focus:ring-forest-green
      active:bg-deep-forest
    `,
    secondary: `
      bg-sage-gray text-white
      hover:bg-sage-gray/80
      focus:ring-sage-gray
      active:bg-sage-gray/90
    `,
    outline: `
      border-2 border-forest-green text-forest-green bg-transparent
      hover:bg-forest-green/10
      focus:ring-forest-green
      active:bg-forest-green/20
    `,
    ghost: `
      text-forest-green bg-transparent
      hover:bg-mint-cream
      focus:ring-transparent
      active:bg-mint-cream/80
    `,
    danger: `
      bg-coral-red text-white
      hover:bg-coral-red/80
      focus:ring-coral-red
      active:bg-coral-red/90
    `,
    accent: `
      bg-yellow text-deep-forest
      hover:bg-yellow/80
      focus:ring-yellow
      active:bg-yellow/90
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
    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
  );

  // Determine which component to render
  const Component = as || 'button';
  
  // Prepare props based on component type
  const componentProps = as ? {
    to: props.to,
    href: props.href,
    className: buttonClasses,
    ...props
  } : {
    type,
    disabled: disabled || loading,
    onClick,
    className: buttonClasses,
    ...props
  };

  return (
    <Component {...componentProps}>
      {loading && <LoadingSpinner />}
      {children}
    </Component>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger', 'accent']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  as: PropTypes.elementType,
};

export default Button;
