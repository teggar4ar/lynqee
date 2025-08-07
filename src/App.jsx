import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { Dashboard, LandingPage, NotFound, ProfileSetup, PublicProfile, ResetPassword } from './pages';

// 1. Impor ProtectedRoute
import ProtectedRoute from './components/common/ProtectedRoute'; // Pastikan path ini benar

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Rute Publik: bisa diakses siapa saja */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LandingPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/:username" element={<PublicProfile />} />
            
            {/* Rute yang Dilindungi: hanya untuk pengguna yang sudah login */}
            <Route 
              path="/dashboard" 
              element={
                // 2. Bungkus komponen dengan ProtectedRoute
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/setup" 
              element={
                // 3. Lakukan hal yang sama untuk rute terlindungi lainnya
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              } 
            />
            
            {/* Rute Catch-all untuk 404 - harus selalu paling akhir */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;