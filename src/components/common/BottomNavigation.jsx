/**
 * BottomNavigation - Primary mobile navigation component
 * 
 * Features:
 * - Mobile-first design with bottom positioning
 * - Touch-optimized controls (44px+ touch targets)
 * - Thumb accessibility focused
 * - Simple and focused navigation (3-5 main sections)
 * - Responsive design for larger screens
 */

import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useUserProfile } from '../../hooks/useUserProfile.js';

const BottomNavigation = ({ className = '' }) => {
  const { user, signOut } = useAuth();
  const { data: profile } = useUserProfile(user?.id);

  const handleProfilePreview = () => {
    if (profile?.username) {
      // Open public profile in new tab
      window.open(`/${profile.username}`, '_blank');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Navigation items configuration
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (isActive) => (
        <svg 
          className={`w-6 h-6 ${isActive ? 'text-golden-yellow' : 'text-sage-gray'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" 
          />
        </svg>
      ),
      path: '/dashboard'
    },
    {
      id: 'links',
      label: 'Links',
      icon: (isActive) => (
        <svg 
          className={`w-6 h-6 ${isActive ? 'text-golden-yellow' : 'text-sage-gray'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
          />
        </svg>
      ),
      path: '/links'
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: (isActive) => (
        <svg 
          className={`w-6 h-6 ${isActive ? 'text-golden-yellow' : 'text-sage-gray'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
          />
        </svg>
      ),
      action: handleProfilePreview,
      disabled: !profile?.username
    },
    {
      id: 'signout',
      label: 'Sign Out',
      icon: (isActive) => (
        <svg 
          className={`w-6 h-6 ${isActive ? 'text-coral-red' : 'text-sage-gray'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
          />
        </svg>
      ),
      action: handleSignOut,
      disabled: false
    }
  ];

  return (
    <nav 
      className={`
        fixed bottom-0 left-0 right-0 z-50 
        bg-white border-t border-gray-200 shadow-lg
        md:hidden
        ${className}
      `}
      aria-label="Bottom navigation"
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          if (item.action) {
            // Handle action items (like preview)
            return (
              <button
                key={item.id}
                onClick={item.action}
                disabled={item.disabled}
                className={`
                  flex flex-col items-center justify-center
                  min-w-[44px] min-h-[44px] px-2 py-1
                  rounded-lg transition-colors duration-200
                  ${item.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-100 active:bg-gray-200'
                  }
                `}
                aria-label={item.label}
              >
                {item.icon(false)}
                <span className="text-xs mt-1 text-sage-gray truncate max-w-[60px]">
                  {item.label}
                </span>
              </button>
            );
          }

          // Handle navigation items
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive: _isActive }) => `
                flex flex-col items-center justify-center
                min-w-[44px] min-h-[44px] px-2 py-1
                rounded-lg transition-colors duration-200
                ${item.disabled 
                  ? 'opacity-50 cursor-not-allowed pointer-events-none' 
                  : 'hover:bg-gray-100 active:bg-gray-200'
                }
              `}
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  {item.icon(isActive)}
                  <span className={`
                    text-xs mt-1 truncate max-w-[60px]
                    ${isActive ? 'text-golden-yellow font-medium' : 'text-sage-gray'}
                  `}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

BottomNavigation.propTypes = {
  className: PropTypes.string,
};

export default BottomNavigation;
