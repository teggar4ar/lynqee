// src/App.jsx

// 1. TAMBAHKAN import 'lazy' dan 'Suspense'
import React, { Suspense, lazy } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { AppStateProvider } from './contexts/AppStateContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute';
import { InitialLoading } from './components/common/ModernLoading.jsx';
import { ErrorBoundary, ErrorState, GlobalErrorBoundary } from './components/common/error';
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
    <GlobalErrorBoundary onError={(error, errorInfo) => {
      // Log errors for debugging and potential error reporting service
      console.error('🚨 Global Error:', error);
      console.error('🚨 Error Info:', errorInfo);
      
      // In production, you might want to send this to an error reporting service
      // like Sentry, Bugsnag, or LogRocket
    }}>
      <AuthProvider>
        <AppStateProvider>
          <Router>
            <div className="app-container">
              {/* 4. BUNGKUS <Routes> DENGAN <Suspense> */}
              <Suspense fallback={<InitialLoading />}>
              <Routes>
                {/* Rute Publik: bisa diakses siapa saja */}
                <Route 
                  path="/" 
                  element={
                    <ErrorBoundary fallback={<ErrorState type="general" />}>
                      <LandingPage />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/login" 
                  element={
                    <ErrorBoundary fallback={<ErrorState type="general" />}>
                      <Auth />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/reset-password" 
                  element={
                    <ErrorBoundary fallback={<ErrorState type="general" />}>
                      <ResetPassword />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/verify-email" 
                  element={
                    <ErrorBoundary fallback={<ErrorState type="general" />}>
                      <EmailVerification />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/check-email" 
                  element={
                    <ErrorBoundary fallback={<ErrorState type="general" />}>
                      <CheckEmailPage />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/:username" 
                  element={
                    <ErrorBoundary fallback={<ErrorState type="profileNotFound" />}>
                      <PublicProfile />
                    </ErrorBoundary>
                  } 
                />
                
                {/* Rute yang Dilindungi: hanya untuk pengguna yang sudah login */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ErrorBoundary fallback={<ErrorState type="general" />}>
                      <ProtectedRoute><Dashboard /></ProtectedRoute>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/links" 
                  element={
                    <ErrorBoundary fallback={<ErrorState type="general" />}>
                      <ProtectedRoute><LinksPage /></ProtectedRoute>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/setup" 
                  element={
                    <ErrorBoundary fallback={<ErrorState type="general" />}>
                      <ProtectedRoute><ProfileSetup /></ProtectedRoute>
                    </ErrorBoundary>
                  } 
                />
                
                {/* Rute Catch-all untuk 404 - harus selalu paling akhir */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AppStateProvider>
    </AuthProvider>
    </GlobalErrorBoundary>
  );
}

export default App;