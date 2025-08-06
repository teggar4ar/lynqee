/**
 * AuthButton - Generic authentication button component
 * 
 * Features:
 * - Mobile-optimized touch targets
 * - Different auth action types (login, register, logout)
 * - Loading states and error handling
 * - Consistent styling across auth flows
 */

import React from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button.jsx';

const AuthButton = ({
  action = 'login',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  children,
  variant,
  ...props
}) => {
  // Default text based on action type
  const defaultText = {
    login: 'Sign In',
    register: 'Create Account',
    logout: 'Sign Out',
    submit: 'Submit',
  };

  // Default variant based on action type
  const defaultVariant = {
    login: 'primary',
    register: 'primary',
    logout: 'secondary',
    submit: 'primary',
  };

  const buttonText = children || defaultText[action] || 'Submit';
  const buttonVariant = variant || defaultVariant[action] || 'primary';

  return (
    <Button
      type="button"
      variant={buttonVariant}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      fullWidth
      className={className}
      {...props}
    >
      {buttonText}
    </Button>
  );
};

AuthButton.propTypes = {
  action: PropTypes.oneOf(['login', 'register', 'logout', 'submit']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
};

export default AuthButton;
