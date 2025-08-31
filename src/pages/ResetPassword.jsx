/**
 * ResetPassword Page - Handles password reset from email links
 * 
 * This page is accessed when users click the reset password link in their email.
 * It extracts the access token from URL parameters and allows users to set a new password.
 * 
 * Features:
 * - Mobile-first responsive design
 * - Token validation and error handling
 * - New password form with confirmation
 * - Automatic redirect after successful reset
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase.js';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import { useFormValidation } from '../hooks/useFormValidation.js';
import { VALIDATION_MESSAGES } from '../constants/validationMessages.js';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuth(); // Kita hanya butuh status dari context
  
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [status, setStatus] = useState('verifying'); // 'verifying', 'ready', 'error', 'success'
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect ini sekarang menjadi satu-satunya sumber kebenaran, berdasarkan state global
  useEffect(() => {
    // Jangan lakukan apa-apa jika AuthContext masih memuat sesi awal
    if (isLoading) {
      return;
    }

    // Jika loading selesai dan kita terotentikasi, berarti link reset valid
    if (isAuthenticated) {
      setStatus('ready');
    } else {
      // Jika loading selesai dan kita TIDAK terotentikasi, link tidak valid
      setError('Link reset password tidak valid atau telah kedaluwarsa.');
      setStatus('error');
    }
  }, [isLoading, isAuthenticated]); // Bergantung pada state global

  // Aturan validasi (tidak berubah)
  const validationRules = {
    password: (value) => {
      if (!value) return VALIDATION_MESSAGES.REQUIRED;
      if (value.length < 8) return VALIDATION_MESSAGES.PASSWORD_TOO_SHORT;
      return null;
    },
    confirmPassword: (value) => {
      if (!value) return VALIDATION_MESSAGES.REQUIRED;
      if (value !== formData.password) return VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH;
      return null;
    },
  };

  const { errors, touched, handleBlur, handleChange, submitForm } = useFormValidation(validationRules);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      await submitForm(formData, async (validatedData) => {
        const { error: updateError } = await supabase.auth.updateUser({
          password: validatedData.password,
        });

        if (updateError) {
          throw updateError;
        }

        setStatus('success');
        
        setTimeout(async () => {
          await supabase.auth.signOut();
          navigate('/?passwordReset=success');
        }, 3000);
      });
    } catch (err) {
      console.error('[ResetPassword] Password reset failed:', err);
      setError(err.message || 'Gagal mengubah password. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    handleChange(name, value);
    if (error) setError('');
  };

  // ----- Tampilan UI Berdasarkan Status -----
  
  // Tampilkan spinner selama AuthContext masih bekerja atau kita masih 'verifying'
  if (isLoading || status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golden-yellow mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold">Memverifikasi link...</h2>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <h2 className="text-xl font-semibold text-red-600">Link Tidak Valid</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => navigate('/')} variant="primary">Kembali ke Halaman Login</Button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <h2 className="text-xl font-semibold text-green-600">Password Berhasil Diubah!</h2>
          <p className="text-gray-600">Anda akan diarahkan ke halaman login.</p>
        </div>
      </div>
    );
  }

  // Jika status === 'ready', tampilkan form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Reset Password Anda</h2>
          <p className="mt-2 text-sm text-gray-600">Masukkan password baru Anda di bawah</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="password" name="password" value={formData.password} onChange={handleInputChange} onBlur={handleBlur} label="Password Baru" placeholder="Minimal 8 karakter" error={errors.password} touched={touched.password} required disabled={isSubmitting} />
          <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} onBlur={handleBlur} label="Konfirmasi Password Baru" placeholder="Ketik ulang password baru Anda" error={errors.confirmPassword} touched={touched.confirmPassword} required disabled={isSubmitting} />
          {error && 
            <ErrorDisplay 
              error={error} 
              className="mb-3 md:mb-4"
            />
          }
          <div className="pt-2">
            <Button type="submit" variant="primary" loading={isSubmitting} fullWidth>Ubah Password</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;