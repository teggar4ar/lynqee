import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

const AuthContainer = ({ onSuccess, onError }) => {
  const [currentView, setCurrentView] = useState('signin'); // 'signin' or 'signup'
  const navigate = useNavigate();

  const switchToSignUp = () => setCurrentView('signup');
  const switchToSignIn = () => setCurrentView('signin');

  const handleSignUpSuccess = (email) => {
    if (onSuccess) onSuccess();
    navigate('/check-email', { state: { email } });
  };

  const handleSignUpError = (error) => {
    // If user already exists, automatically switch to sign-in with helpful message
    if (error.type === 'user_exists') {
      setCurrentView('signin');
      if (onError) onError({
        message: `${error.message} We've switched you to the sign-in form.`,
        email: error.email
      });
    } else {
      if (onError) onError(error);
    }
  };

  return (
    <>
      {currentView === 'signin' && (
        <SignInForm
          onSwitchToSignUp={switchToSignUp}
          onSuccess={onSuccess}
          onError={onError}
        />
      )}
      {currentView === 'signup' && (
        <SignUpForm
          onSwitchToSignIn={switchToSignIn}
          onSignUpSuccess={handleSignUpSuccess}
          onError={handleSignUpError}
        />
      )}
    </>
  );
};

export default AuthContainer;
