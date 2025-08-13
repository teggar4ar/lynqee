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

// Links hooks - standardized naming convention  
export { useUserLinks } from './useUserLinks.js';                    // For authenticated user's links
export { usePublicRealtimeLinks } from './usePublicRealtimeLinks.js'; // For public links with real-time updates

// Form and validation hooks
export { useFormValidation } from './useFormValidation.js';

// Utility hooks
export { useAsync } from './useAsync.js';
export { useRetry } from './useRetry.js';
export { useInactivityTimeout } from './useInactivityTimeout.js';

// Optimistic update hooks
export { useOptimisticUpdates, useDashboardCache } from './useOptimisticUpdates.js';
