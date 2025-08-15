import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import EmailVerification from './EmailVerification';

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
        <SignIn onSwitchToSignUp={switchToSignUp} />
      )}
      {currentView === 'signup' && (
        <SignUp 
          onSwitchToSignIn={switchToSignIn} 
          onSignUpSuccess={switchToEmailVerification}
        />
      )}
      {currentView === 'verify-email' && (
        <EmailVerification 
          email={userEmail}
          onBackToSignIn={switchToSignIn}
          onResendEmail={handleResendEmail}
        />
      )}
    </>
  );
};

export default AuthContainer;