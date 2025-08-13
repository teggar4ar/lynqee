/**
 * @fileoverview Standardized Hooks Documentation
 * 
 * This file provides comprehensive documentation for the new standardized 
 * hook naming convention and API patterns implemented across the application.
 * 
 * All hooks follow a consistent pattern for:
 * - Naming convention (useUserX vs usePublicX)
 * - Return value standardization (data, loading, error, refetch)
 * - Parameter naming consistency
 * - JSDoc documentation format
 */

/**
 * Hook Naming Convention
 * =====================
 * 
 * useUserX(userId) - For authenticated user's own data
 * - useUserProfile(userId) - User's own profile data
 * - useUserLinks(userId) - User's own links data
 * 
 * usePublicX(username) - For public data access by username
 * - usePublicProfile(username) - Public profile by username
 * - usePublicLinks(username) - Public links by username
 * - usePublicRealtimeLinks(username) - Public links with real-time updates
 */

/**
 * Standardized Return Value Pattern
 * ================================
 * 
 * All hooks return an object with these consistent properties:
 * 
 * @typedef {Object} StandardHookReturn
 * @property {*} data - The primary data (profile, links, etc.)
 * @property {boolean} loading - Loading state for initial fetch
 * @property {string|Error|null} error - Error state
 * @property {Function} refetch - Manual refresh function
 * 
 * Additional hook-specific properties may include:
 * @property {boolean} refreshing - Background refresh indicator (progressive hooks)
 * @property {boolean} hasData - Whether cached data exists (progressive hooks)
 * @property {boolean} isRealTimeConnected - Real-time connection status (realtime hooks)
 * @property {Object} stats - Dashboard statistics (user links hook)
 * @property {Function} addOptimistic - Optimistic update function (user links hook)
 * @property {Function} removeOptimistic - Optimistic removal function (user links hook)
 */

/**
 * Migration Guide
 * ==============
 * 
 * OLD HOOKS (DEPRECATED) → NEW HOOKS (STANDARDIZED)
 * 
 * useProgressiveProfile(userId) → useUserProfile(userId)
 * - Same functionality, standardized return values
 * - profile → data
 * - All other return values remain the same
 * 
 * useProfile(username) → usePublicProfile(username)  
 * - Same functionality, standardized return values
 * - profile → data
 * - All other return values remain the same
 * 
 * useProgressiveLinks(userId) → useUserLinks(userId)
 * - Same functionality, standardized return values  
 * - links → data
 * - hasLinks → hasData
 * - All other return values remain the same
 * 
 * useRealtimeLinks(username) → usePublicRealtimeLinks(username)
 * - Same functionality, standardized return values
 * - links → data
 * - All other return values remain the same
 * 
 * useLinks(username) → usePublicLinks(username)
 * - Same functionality, standardized return values
 * - links → data
 * - All other return values remain the same
 */

/**
 * Error Handling Standards
 * =======================
 * 
 * All hooks follow consistent error handling:
 * - Errors are caught and set to the error state
 * - Error messages are user-friendly strings
 * - Console logging includes hook name prefix for debugging
 * - Data is reset to appropriate default on error (null for profiles, [] for links)
 * - Loading state is properly managed during error scenarios
 */

/**
 * Progressive Loading Pattern
 * ==========================
 * 
 * Hooks that support progressive loading (useUserProfile, useUserLinks) implement:
 * - Immediate return of cached data from AppStateContext
 * - Background refresh with separate refreshing indicator
 * - Initial loading only when no cached data exists
 * - Optimistic updates for enhanced user experience
 */

/**
 * Real-time Updates Pattern
 * ========================
 * 
 * Hooks that support real-time updates (usePublicRealtimeLinks, useUserLinks) implement:
 * - Supabase real-time subscriptions
 * - Automatic subscription cleanup on unmount
 * - Connection status indicator
 * - Graceful handling of subscription failures
 */

export {}; // Make this a module
