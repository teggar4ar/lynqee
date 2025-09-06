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
import { Eye, LayoutDashboard, Link, LogOut } from 'lucide-react';
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
        <LayoutDashboard className={`w-6 h-6 ${isActive ? 'text-golden-yellow' : 'text-sage-gray'}`} />
      ),
      path: '/dashboard'
    },
    {
      id: 'links',
      label: 'Links',
      icon: (isActive) => (
        <Link className={`w-6 h-6 ${isActive ? 'text-golden-yellow' : 'text-sage-gray'}`} />
      ),
      path: '/links'
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: (isActive) => (
        <Eye className={`w-6 h-6 ${isActive ? 'text-golden-yellow' : 'text-sage-gray'}`} />
      ),
      action: handleProfilePreview,
      disabled: !profile?.username
    },
    {
      id: 'signout',
      label: 'Sign Out',
      icon: (isActive) => (
        <LogOut className={`w-6 h-6 ${isActive ? 'text-coral-red' : 'text-sage-gray'}`} />
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
