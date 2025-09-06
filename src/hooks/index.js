/**
 * Hooks Barrel Export
 * 
 * Central export point for all custom hooks
 */

// Authentication hooks
export { useAuth } from './useAuth.js';

// Profile hooks - standardized naming convention
export { useUserProfile } from './useUserProfile.js';        // For authenticated user's profile
export { usePublicProfile } from './usePublicProfile.js';    // For public profile by username
export { default as useAvatar } from './useAvatar.js';

// UI hooks
export { default as useAlerts } from './useAlerts.js';       // Alert system

// Links hooks - standardized naming convention  
export { useUserLinks } from './useUserLinks.js';                    // For authenticated user's links
export { usePublicRealtimeLinks } from './usePublicRealtimeLinks.js'; // For public links with real-time updates
export { useLinkReordering } from './useLinkReordering.js';           // For drag-and-drop link reordering

// Form and validation hooks
export { useFormValidation } from './useFormValidation.js';

// Utility hooks
export { useAsync } from './useAsync.js';
export { default as usePagination } from './usePagination.js';
export { useRetry, useAsyncRetry } from './useRetry.js';
export { useErrorReporting } from './useErrorReporting.js';
export { useInactivityTimeout } from './useInactivityTimeout.js';

// Optimistic update hooks
export { useOptimisticUpdates, useDashboardCache } from './useOptimisticUpdates.js';
