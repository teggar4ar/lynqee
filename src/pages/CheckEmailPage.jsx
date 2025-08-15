import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { EmailVerificationUI } from '../components/auth';

const CheckEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleBackToSignIn = () => {
    navigate('/login');
  };

  if (!email) {
    // Handle case where user lands here directly without an email
    return (
      <div className="min-h-screen bg-mint-cream flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-forest-green mb-4">
            No email address provided.
          </h1>
          <p className="text-sage-gray mb-8">
            Please sign up first to receive a verification email.
          </p>
          <Link to="/login" className="bg-golden-yellow text-forest-green font-medium px-6 py-2 rounded-lg hover:bg-golden-yellow/80">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <EmailVerificationUI email={email} onBackToSignIn={handleBackToSignIn} />
  );
};

export default CheckEmailPage;
