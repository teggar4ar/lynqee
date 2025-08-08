/**
 * Hooks Barrel Export
 * 
 * Central export point for all custom hooks
 */

// Authentication hooks
export { useAuth } from './useAuth.js';

// Profile hooks  
export { useProfile, useCurrentUserProfile } from './useProfile.js';

// Links hooks
export { useLinks, useUserLinks } from './useLinks.js';
export { useRealtimeLinks } from './useRealtimeLinks.js';

// Form and validation hooks
export { useFormValidation } from './useFormValidation.js';

// Utility hooks
export { useAsync } from './useAsync.js';
export { useRetry } from './useRetry.js';

// Real-time data hooks
export { useRealtimeDashboard } from './useRealtimeDashboard.js';

// Optimistic update hooks
export { useOptimisticUpdates, useDashboardCache } from './useOptimisticUpdates.js';
