/**
 * SidebarNavigation - Modern icon-based sidebar for desktop screens
 * 
 * Features:
 * - Icon-only design for minimal space usage
 * - Hover tooltips for accessibility
 * - Modern glassmorphism effect
 * - Active state indicators
 * - Smooth transitions and animations
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useNavigate } from 'react-router-dom';
import { Eye, LayoutDashboard, Link, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useUserProfile } from '../../hooks/useUserProfile.js';
import { useAlerts } from '../../hooks';

const SidebarNavigation = ({ className = '' }) => {
  const { user, signOut } = useAuth();
  const { data: profile } = useUserProfile(user?.id);
  const { showError } = useAlerts();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleProfilePreview = () => {
    if (profile?.username) {
      window.open(`/${profile.username}`, '_blank');
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('[SidebarNavigation] Sign out failed:', error);
      showError({
        title: 'Sign out failed',
        message: 'Unable to sign you out. Please try again.',
        action: {
          label: 'Try Again',
          onClick: handleSignOut
        }
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  // Navigation items configuration
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (isActive) => (
        <LayoutDashboard 
          className={`w-6 h-6 transition-colors duration-200 ${
            isActive ? 'text-golden-yellow' : 'text-sage-gray group-hover:text-golden-yellow'
          }`}
        />
      ),
      path: '/dashboard'
    },
    {
      id: 'links',
      label: 'Manage Links',
      icon: (isActive) => (
        <Link 
          className={`w-6 h-6 transition-colors duration-200 ${
            isActive ? 'text-golden-yellow' : 'text-sage-gray group-hover:text-golden-yellow'
          }`}
        />
      ),
      path: '/links'
    },
    {
      id: 'preview',
      label: 'Preview Profile',
      icon: (isActive) => (
        <Eye 
          className={`w-6 h-6 transition-colors duration-200 ${
            isActive ? 'text-golden-yellow' : 'text-sage-gray group-hover:text-golden-yellow'
          }`}
        />
      ),
      action: handleProfilePreview,
      disabled: !profile?.username
    }
  ];

  const actionItems = [
    {
      id: 'signout',
      label: 'Sign Out',
      disabled: isSigningOut,
      icon: () => (
        <LogOut className="w-6 h-6 text-sage-gray group-hover:text-coral-red transition-colors duration-200" />
      ),
      action: handleSignOut
    }
  ];

  const Tooltip = ({ text, children, show }) => (
    <div className="relative group">
      {children}
      {show && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap z-50 transform transition-all duration-200 opacity-100 scale-100">
          {text}
          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );

  return (
    <aside
      className={`
        hidden md:flex md:flex-col
        fixed left-0 top-0 h-full w-20
        bg-white/80 backdrop-blur-lg border-r border-gray-200/50
        shadow-xl z-40
        ${className}
      `}
      aria-label="Sidebar navigation"
    >
      {/* Logo/Brand */}
      <div className="flex items-center justify-center h-20 border-b border-gray-200/50">
        <div className="w-10 h-10 bg-gradient-to-br from-forest-green to-golden-yellow rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">L</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6">
        <ul className="space-y-4">
          {navItems.map((item) => {
            if (item.action) {
              // Handle action items (like preview)
              return (
                <li key={item.id}>
                  <Tooltip text={item.label} show={hoveredItem === item.id}>
                    <button
                      onClick={item.action}
                      disabled={item.disabled}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`
                        group w-14 h-14 rounded-xl flex items-center justify-center
                        transition-all duration-200 ease-in-out
                        ${item.disabled 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-mint-cream hover:scale-105 hover:shadow-lg active:scale-95'
                        }
                      `}
                      aria-label={item.label}
                    >
                      {item.icon(false)}
                    </button>
                  </Tooltip>
                </li>
              );
            }

            // Handle navigation links
            return (
              <li key={item.id}>
                <Tooltip text={item.label} show={hoveredItem === item.id}>
                  <NavLink
                    to={item.path}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={({ isActive }) => `
                      group w-14 h-14 rounded-xl flex items-center justify-center
                      transition-all duration-200 ease-in-out
                      hover:scale-105 hover:shadow-lg active:scale-95
                      ${isActive
                        ? 'bg-mint-cream border-2 border-golden-yellow shadow-md'
                        : 'hover:bg-mint-cream'
                      }
                    `}
                    aria-label={item.label}
                  >
                    {({ isActive }) => item.icon(isActive)}
                  </NavLink>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Action Items (Sign Out) */}
      <div className="px-3 pb-6">
        <ul className="space-y-4">
          {actionItems.map((item) => (
            <li key={item.id}>
              <Tooltip text={item.label} show={hoveredItem === item.id}>
                <button
                  onClick={item.action}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="
                    group w-14 h-14 rounded-xl flex items-center justify-center
                    transition-all duration-200 ease-in-out
                    hover:bg-coral-red/10 hover:scale-105 hover:shadow-lg active:scale-95
                  "
                  aria-label={item.label}
                >
                  {item.icon()}
                </button>
              </Tooltip>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

SidebarNavigation.propTypes = {
  className: PropTypes.string,
};

export default SidebarNavigation;
