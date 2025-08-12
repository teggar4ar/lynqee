/**
 * Hooks Barrel Export
 * 
 * Central export point for all custom hooks
 */

// Authentication hooks
export { useAuth } from './useAuth.js';

// Profile hooks (consolidated - useProgressiveProfile replaces useCurrentUserProfile)  
export { usePublicProfile } from './usePublicProfile.js';
export { default as useAvatar } from './useAvatar.js';

// Links hooks (consolidated - useProgressiveLinks replaces useRealtimeDashboard)
export { usePublicLinks, useLinks } from './useLinks.js';
export { usePublicRealtimeLinks } from './usePublicRealtimeLinks.js';

// Form and validation hooks
export { useFormValidation } from './useFormValidation.js';

// Utility hooks
export { useAsync } from './useAsync.js';
export { useRetry } from './useRetry.js';
export { useInactivityTimeout } from './useInactivityTimeout.js';

// Optimistic update hooks
export { useOptimisticUpdates, useDashboardCache } from './useOptimisticUpdates.js';
