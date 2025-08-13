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
 * 
 * SECURITY NOTES:
 * - The anon key is SAFE to be exposed in client-side code
 * - Real security comes from Row Level Security (RLS) policies  
 * - Never expose service_role key in client-side environment variables
 * - WebSocket connections will show API key in browser - this is normal
 * 
 * This is the single source of truth for all Supabase operations
 * Should only be imported by service layer files, never directly by components
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Configure auth settings for smoother transitions
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Security: Enforce strong password requirements
    flowType: 'pkce', // Use PKCE flow for better security
    // Reduce flashing by handling session changes more smoothly
    storageKey: 'lynqee-auth-token',
    storage: window?.localStorage,
    // Prevent rapid auth state changes
    debug: import.meta.env.DEV ? false : false, // Disable debug logs that might affect timing
  },
  realtime: {
    // Configure real-time WebSocket settings
    heartbeatIntervalMs: 15000, // Send heartbeat every 15 seconds (well under 30s limit)
    reconnectAfterMs: (tries) => {
      // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
      return Math.min(1000 * Math.pow(2, tries), 30000);
    },
    timeout: 10000, // 10 second timeout for WebSocket operations
    logger: (level, message, data) => {
      // Log real-time events in development for debugging
      if (import.meta.env.DEV && (level === 'error' || level === 'warn')) {
        console.warn(`[Realtime ${level}]`, message, data);
      }
    },
  },
  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'lynqee-web-app',
      'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
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
