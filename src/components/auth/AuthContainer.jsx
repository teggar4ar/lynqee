import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

const AuthContainer = () => {
  const [currentView, setCurrentView] = useState('signin'); // 'signin' or 'signup'
  const navigate = useNavigate();

  const switchToSignUp = () => setCurrentView('signup');
  const switchToSignIn = () => setCurrentView('signin');

  const handleSignUpSuccess = (email) => {
    navigate('/check-email', { state: { email } });
  };

  return (
    <>
      {currentView === 'signin' && (
        <SignInForm onSwitchToSignUp={switchToSignUp} />
      )}
      {currentView === 'signup' && (
        <SignUpForm
          onSwitchToSignIn={switchToSignIn}
          onSignUpSuccess={handleSignUpSuccess}
        />
      )}
    </>
  );
};

export default AuthContainer;
