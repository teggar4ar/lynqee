import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { AppStateProvider } from './contexts/AppStateProvider.jsx';
import { Dashboard, LandingPage, LinksPage, NotFound, ProfileSetup, PublicProfile, ResetPassword } from './pages';
import ProtectedRoute from './components/common/ProtectedRoute';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <AppStateProvider>
        <Router>
          <div className="app-container">
            <Routes>
            {/* Public routes: accessible to everyone */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LandingPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/:username" element={<PublicProfile />} />
            
            {/* Protected routes: only for logged-in users */}
            <Route 
              path="/dashboard" 
              element={
                // Wrap the component with ProtectedRoute
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/links" 
              element={
                <ProtectedRoute>
                  <LinksPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/setup" 
              element={
                // Do the same for other protected routes
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route for 404 - must always be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
      </AppStateProvider>
    </AuthProvider>
  );
}

export default App;