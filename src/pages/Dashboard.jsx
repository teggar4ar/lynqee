/**
 * Dashboard - Protected dashboard page for authenticated users
 * 
 * Features:
 * - Protected route (requires authentication)
 * - Mobile-first layout
 * - User profile display
 * - Navigation to other sections
 * - Sign out functionality
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { ProtectedRoute, Button } from '../components/common';

const Dashboard = () => {
  const { user, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('[Dashboard] Sign out failed:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <Button
              variant="outline"
              size="small"
              onClick={handleSignOut}
              disabled={isLoading}
            >
              Sign Out
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Welcome back!
            </h2>
            
            {user && (
              <div className="space-y-3">
                <p className="text-gray-600">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-gray-600">
                  <strong>User ID:</strong> {user.id}
                </p>
                <p className="text-gray-600">
                  <strong>Account created:</strong> {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Coming Soon</h3>
              <p className="text-blue-800 text-sm">
                Link management, profile customization, and analytics will be available here.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
