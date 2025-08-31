// src/App.jsx

// 1. TAMBAHKAN import 'lazy' dan 'Suspense'
import React, { Suspense, lazy } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { AppStateProvider } from './contexts/AppStateContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute';
import { InitialLoading } from './components/common/ModernLoading.jsx';
import './App.css';

// 2. UBAH SEMUA IMPORT HALAMAN MENJADI DYNAMIC menggunakan React.lazy
const Auth = lazy(() => import('./pages/Auth.jsx'));
const CheckEmailPage = lazy(() => import('./pages/CheckEmailPage.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const EmailVerification = lazy(() => import('./pages/EmailVerification.jsx'));
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const LinksPage = lazy(() => import('./pages/LinksPage.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup.jsx'));
const PublicProfile = lazy(() => import('./pages/PublicProfile.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));

function App() {
  return (
    <AuthProvider>
      <AppStateProvider>
        <Router>
          <div className="app-container">
            {/* 4. BUNGKUS <Routes> DENGAN <Suspense> */}
            <Suspense fallback={<InitialLoading />}>
              <Routes>
                {/* Rute Publik: bisa diakses siapa saja */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/check-email" element={<CheckEmailPage />} />
                <Route path="/:username" element={<PublicProfile />} />
                
                {/* Rute yang Dilindungi: hanya untuk pengguna yang sudah login */}
                <Route 
                  path="/dashboard" 
                  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
                />
                <Route 
                  path="/links" 
                  element={<ProtectedRoute><LinksPage /></ProtectedRoute>} 
                />
                <Route 
                  path="/setup" 
                  element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} 
                />
                
                {/* Rute Catch-all untuk 404 - harus selalu paling akhir */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AppStateProvider>
    </AuthProvider>
  );
}

export default App;