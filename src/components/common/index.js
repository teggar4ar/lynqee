// Common component exports
export { default as Avatar } from './Avatar';
export { default as AvatarUpload } from './AvatarUpload';
export { default as BottomNavigation } from './BottomNavigation';
export { default as Button } from './Button';
export { ErrorBoundary, ErrorDisplay, ErrorState } from './error';
export { default as Input } from './Input';
export { default as Modal } from './Modal';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as ProfileSetupGuard } from './ProfileSetupGuard';
export { default as SidebarNavigation } from './SidebarNavigation';
export { default as SuccessDisplay } from './SuccessDisplay';

// Consolidated modern loading components (replaces LoadingSpinner and SkeletonLoader)
export { 
  CompactSpinner, 
  RefreshIndicator, 
  ProfileSkeleton, 
  StatsSkeleton, 
  LinksSkeleton, 
  InitialLoading 
} from './ModernLoading';
