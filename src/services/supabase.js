import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

/**
 * Centralized Supabase client instance
 * This is the single source of truth for all Supabase operations
 * Should only be imported by service layer files, never directly by components
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Configure auth settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'lynqee-web-app',
    },
  },
});

/**
 * Helper function to check if Supabase client is properly configured
 * @returns {boolean} True if client is configured correctly
 */
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseKey);
};

/**
 * Get the current Supabase configuration (for debugging)
 * @returns {Object} Configuration object (without sensitive data)
 */
export const getSupabaseConfig = () => ({
  url: supabaseUrl,
  hasKey: Boolean(supabaseKey),
  isConfigured: isSupabaseConfigured(),
});

// Export types for TypeScript-like documentation
export const SUPABASE_TABLES = {
  PROFILES: 'profiles',
  LINKS: 'links',
};

export const SUPABASE_AUTH_PROVIDERS = {
  GOOGLE: 'google',
  EMAIL: 'email',
};
