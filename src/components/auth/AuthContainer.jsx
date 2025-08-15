import React, { useState } from 'react';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import EmailVerificationUI from './EmailVerificationUI';

const AuthContainer = () => {
  const [currentView, setCurrentView] = useState('signin'); // 'signin', 'signup', or 'verify-email'
  const [userEmail, setUserEmail] = useState('');

  const switchToSignUp = () => setCurrentView('signup');
  const switchToSignIn = () => setCurrentView('signin');
  const switchToEmailVerification = (email) => {
    setUserEmail(email);
    setCurrentView('verify-email');
  };

  const handleResendEmail = async () => {
    // Implement resend email logic here
    console.log('Resending verification email to:', userEmail);
  };

  return (
    <>
      {currentView === 'signin' && (
        <SignInForm onSwitchToSignUp={switchToSignUp} />
      )}
      {currentView === 'signup' && (
        <SignUpForm
          onSwitchToSignIn={switchToSignIn}
          onSignUpSuccess={switchToEmailVerification}
        />
      )}
      {currentView === 'verify-email' && (
        <EmailVerificationUI
          email={userEmail}
          onBackToSignIn={switchToSignIn}
          onResendEmail={handleResendEmail}
        />
      )}
    </>
  );
};

export default AuthContainer;
