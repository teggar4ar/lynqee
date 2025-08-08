/**
 * Mobile Touch Utilities
 * 
 * Utilities for optimizing touch interactions on mobile devices.
 * Follows mobile-first design principles with proper touch targets.
 */
import React from 'react';
/**
 * Standard touch target sizes following accessibility guidelines
 */
export const TOUCH_TARGETS = {
  // Minimum touch target size (44x44px - iOS/Android guidelines)
  MIN: 'min-h-11 min-w-11',
  
  // Comfortable touch target size (52x52px - recommended)
  COMFORTABLE: 'min-h-13 min-w-13',
  
  // Large touch target for primary actions (56x56px)
  LARGE: 'min-h-14 min-w-14',
};

/**
 * Touch-optimized spacing for mobile layouts
 */
export const TOUCH_SPACING = {
  // Minimum spacing between touch targets (8px)
  MIN: 'space-y-2',
  
  // Comfortable spacing (12px)
  COMFORTABLE: 'space-y-3',
  
  // Large spacing for better touch accuracy (16px)
  LARGE: 'space-y-4',
};

/**
 * Mobile-first responsive classes for common patterns
 */
export const RESPONSIVE_PATTERNS = {
  // Container with mobile-first approach
  CONTAINER: 'w-full max-w-sm mx-auto px-4 sm:max-w-md md:max-w-lg lg:max-w-xl',
  
  // Cards that work well on mobile
  CARD: 'bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6',
  
  // Mobile-optimized button
  BUTTON: 'px-4 py-3 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
  
  // Touch-friendly input
  INPUT: 'w-full px-3 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:border-transparent',
  
  // Mobile navigation
  NAV: 'flex items-center justify-between p-4 bg-white border-b border-gray-200',
  
  // Mobile-first grid
  GRID: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
  
  // Mobile-optimized typography
  HEADING: 'text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl',
  SUBHEADING: 'text-lg font-semibold text-gray-800 sm:text-xl',
  BODY: 'text-base text-gray-600 leading-relaxed',
  
  // Mobile-first flex layouts
  FLEX_COL: 'flex flex-col space-y-4 sm:space-y-6',
  FLEX_ROW: 'flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4',
};

/**
 * Breakpoint utilities for responsive design
 */
export const BREAKPOINTS = {
  xs: 375,   // Small mobile
  sm: 640,   // Large mobile / small tablet
  md: 768,   // Tablet
  lg: 1024,  // Small desktop
  xl: 1280,  // Desktop
  '2xl': 1536, // Large desktop
};

/**
 * Check if current screen size matches a breakpoint
 * @param {string} breakpoint - Breakpoint name (xs, sm, md, lg, xl, 2xl)
 * @returns {boolean} Whether the current screen matches the breakpoint
 */
export const isBreakpoint = (breakpoint) => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS[breakpoint];
};

/**
 * Get current breakpoint name
 * @returns {string} Current breakpoint (xs, sm, md, lg, xl, 2xl)
 */
export const getCurrentBreakpoint = () => {
  if (typeof window === 'undefined') return 'xs';
  
  const width = window.innerWidth;
  
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

/**
 * Check if device supports touch
 * @returns {boolean} Whether the device supports touch
 */
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Check if device is likely mobile based on screen size and touch support
 * @returns {boolean} Whether the device is likely mobile
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md && isTouchDevice();
};

/**
 * Generate responsive classes based on mobile-first approach
 * @param {Object} config - Configuration object with base and responsive overrides
 * @returns {string} Combined Tailwind classes
 * 
 * @example
 * const classes = generateResponsiveClasses({
 *   base: 'text-sm p-2',
 *   sm: 'text-base p-3',
 *   md: 'text-lg p-4'
 * });
 * // Returns: 'text-sm p-2 sm:text-base sm:p-3 md:text-lg md:p-4'
 */
export const generateResponsiveClasses = (config) => {
  const { base, ...responsive } = config;
  const classes = [base];
  
  Object.entries(responsive).forEach(([breakpoint, classNames]) => {
    if (classNames) {
      const prefixedClasses = classNames
        .split(' ')
        .map(className => `${breakpoint}:${className}`)
        .join(' ');
      classes.push(prefixedClasses);
    }
  });
  
  return classes.filter(Boolean).join(' ');
};

/**
 * Validate touch target size meets accessibility guidelines
 * @param {HTMLElement} element - DOM element to check
 * @returns {Object} Validation result with isValid and recommendations
 */
export const validateTouchTarget = (element) => {
  if (!element) return { isValid: false, error: 'Element not found' };
  
  const rect = element.getBoundingClientRect();
  const minSize = 44; // 44px minimum per iOS/Android guidelines
  
  const isValidWidth = rect.width >= minSize;
  const isValidHeight = rect.height >= minSize;
  const isValid = isValidWidth && isValidHeight;
  
  const recommendations = [];
  if (!isValidWidth) {
    recommendations.push(`Width ${rect.width}px is below 44px minimum`);
  }
  if (!isValidHeight) {
    recommendations.push(`Height ${rect.height}px is below 44px minimum`);
  }
  
  return {
    isValid,
    width: rect.width,
    height: rect.height,
    recommendations,
  };
};

/**
 * Hook for responsive design state
 * @returns {Object} Current responsive state
 */
export const useResponsiveState = () => {
  const [state, setState] = React.useState(() => ({
    breakpoint: getCurrentBreakpoint(),
    isMobile: isMobileDevice(),
    isTouch: isTouchDevice(),
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));
  
  React.useEffect(() => {
    const updateState = () => {
      setState({
        breakpoint: getCurrentBreakpoint(),
        isMobile: isMobileDevice(),
        isTouch: isTouchDevice(),
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', updateState);
    return () => window.removeEventListener('resize', updateState);
  }, []);
  
  return state;
};
