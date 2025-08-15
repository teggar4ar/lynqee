import React from 'react';
import { AuthContainer } from '../components/auth';
import { Link } from 'react-router-dom';

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-mint-cream">
      <header className="bg-mint-cream border-b border-deep-forest/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-forest-green hover:text-deep-forest transition-colors duration-200">
                Lynqee
              </h1>
            </Link>
          </div>
        </div>
      </header>
      <main>
        <AuthContainer />
      </main>
    </div>
  );
};

export default AuthPage;
