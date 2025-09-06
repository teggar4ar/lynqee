/**
 * Alert Components - Barrel Exports
 * 
 * This file provides clean exports for all alert components
 * with support for code splitting and tree shaking.
 * 
 * Tree shaking friendly: Each component can be imported individually
 * Code splitting ready: Components can be lazy-loaded when needed
 */

import React from 'react';
import { Toast } from './Toast';
import { Banner } from './Banner';
import { AlertContainer } from './AlertContainer';

// Direct exports for tree shaking
export { Toast } from './Toast';
export { Banner } from './Banner';
export { AlertContainer } from './AlertContainer';

// Lazy loading exports for code splitting
export const LazyToast = React.lazy(() => import('./Toast').then(module => ({ default: module.Toast })));
export const LazyBanner = React.lazy(() => import('./Banner').then(module => ({ default: module.Banner })));
export const LazyAlertContainer = React.lazy(() => import('./AlertContainer').then(module => ({ default: module.AlertContainer })));

// Default export object for convenience (but less tree-shake friendly)
const AlertComponents = {
  Toast,
  Banner,
  AlertContainer,
  LazyToast,
  LazyBanner,
  LazyAlertContainer,
};

export default AlertComponents;
