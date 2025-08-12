/**
 * Hooks Barrel Export
 * 
 * Central export point for all custom hooks
 */

// Authentication hooks
export { useAuth } from './useAuth.js';

// Profile hooks (consolidated - useProgressiveProfile replaces useCurrentUserProfile)  
export { useProfile } from './useProfile.js';
export { useProgressiveProfile } from './useProgressiveProfile.js';
export { default as useAvatar } from './useAvatar.js';

// Links hooks (consolidated - useProgressiveLinks replaces useRealtimeDashboard)
export { useLinks, useUserLinks } from './useLinks.js';
export { useRealtimeLinks } from './useRealtimeLinks.js';
export { useProgressiveLinks } from './useProgressiveLinks.js';

// Form and validation hooks
export { useFormValidation } from './useFormValidation.js';

// Utility hooks
export { useAsync } from './useAsync.js';
export { useRetry } from './useRetry.js';
export { useInactivityTimeout } from './useInactivityTimeout.js';

// Optimistic update hooks
export { useOptimisticUpdates, useDashboardCache } from './useOptimisticUpdates.js';
