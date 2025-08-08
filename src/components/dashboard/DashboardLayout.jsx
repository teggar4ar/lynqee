/**
 * DashboardLayout - Mobile-first layout component for dashboard pages
 * 
 * Features:
 * - Mobile-first design approach
 * - Bottom navigation integration
 * - Responsive header
 * - Content area with proper spacing for bottom navigation
 * - Optimized for touch interactions
 */

import React from 'react';
import PropTypes from 'prop-types';
import BottomNavigation from '../common/BottomNavigation.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../common';

const DashboardLayout = ({ 
  children, 
  title = 'Dashboard',
  headerActions = null,
  className = '' 
}) => {
  const { signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // The AuthContext will handle the redirect after successful sign out
    } catch (error) {
      console.error('[DashboardLayout] Sign out failed:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header - Mobile optimized, sticky for easy access */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3 flex justify-between items-center md:max-w-7xl md:mx-auto md:px-6 md:py-4">
          <h1 className="text-lg font-bold text-gray-900 md:text-xl truncate">
            {title}
          </h1>
          
          <div className="flex items-center space-x-2">
            {/* Custom header actions */}
            {headerActions}
            
            {/* Sign out button - always visible on desktop, hidden on mobile (available via bottom nav) */}
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isLoading}
              className="
                hidden md:flex
                px-3 py-2 text-sm md:px-4 md:py-2
              "
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Enhanced mobile spacing */}
      <main className="
        px-4 py-4 md:max-w-7xl md:mx-auto md:px-6 md:py-8
        pb-24 md:pb-8 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)]
      ">
        <div className="space-y-4 md:space-y-6">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <BottomNavigation />
    </div>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  headerActions: PropTypes.node,
  className: PropTypes.string,
};

export default DashboardLayout;
