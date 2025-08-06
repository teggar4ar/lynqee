// Service layer exports
export { default as AuthService } from './AuthService.js';
export { default as ProfileService } from './ProfileService.js';
export { supabase, isSupabaseConfigured, getSupabaseConfig, SUPABASE_TABLES, SUPABASE_AUTH_PROVIDERS } from './supabase.js';
