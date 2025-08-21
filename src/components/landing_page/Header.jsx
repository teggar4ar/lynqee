import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-mint-cream border-b border-deep-forest/10" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-forest-green hover:text-deep-forest transition-colors duration-200">
              Lynqee
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 pt-4" role="navigation" aria-label="Main navigation">
            <a href="#home" className="text-sage-gray hover:text-forest-green transition-colors duration-200 font-medium">
              Home
            </a>
            <a href="#features" className="text-sage-gray hover:text-forest-green transition-colors duration-200 font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-sage-gray hover:text-forest-green transition-colors duration-200 font-medium">
              How It Works
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="bg-golden-yellow text-forest-green font-medium px-6 py-2 rounded-lg hover:bg-golden-yellow/80 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg" aria-label="Register for new account">
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-forest-green hover:text-deep-forest transition-colors duration-200"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4" role="navigation" aria-label="Mobile navigation">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-sage-gray hover:text-forest-green transition-colors duration-200 font-medium py-2">
                Home
              </a>
              <a href="#features" className="text-sage-gray hover:text-forest-green transition-colors duration-200 font-medium py-2">
                Features
              </a>
              <a href="#how-it-works" className="text-sage-gray hover:text-forest-green transition-colors duration-200 font-medium py-2">
                How It Works
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-deep-forest/10">
                <Link to="/login" className="text-forest-green hover:text-deep-forest transition-colors duration-200 font-medium py-2 text-left">
                  Login
                </Link>
                <Link to="/login" className="bg-golden-yellow text-forest-green font-medium px-6 py-2 rounded-lg hover:bg-golden-yellow/80 transition-colors duration-200 w-full text-center">
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
