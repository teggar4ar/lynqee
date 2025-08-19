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
          onError={onError}
        />
      )}
    </>
  );
};

export default AuthContainer;
