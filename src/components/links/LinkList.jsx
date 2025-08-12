import React from 'react';
import PropTypes from 'prop-types';
import LinkCard from './LinkCard';
import { ErrorState, LinksSkeleton } from '../common';
import { RESPONSIVE_PATTERNS, TOUCH_SPACING } from '../../utils/mobileUtils';
import { getErrorType } from '../../utils/errorUtils';

/**
 * LinkList Component
 * 
 * Container component for displaying a list of links with mobile-first responsive design.
 * Handles loading, error, and empty states with enhanced touch-optimized spacing.
 * Features enhanced accessibility and responsive layout patterns.
 */
const LinkList = ({ 
  links = [],
  loading = false,
  error = null,
  emptyMessage = 'No links added yet',
  emptySubtext = '',
  onLinkClick,
  className = '',
  variant = 'default', // 'default', 'compact', 'minimal'
  spacing = 'comfortable', // 'tight', 'comfortable', 'large'
  showAnimation = true
}) => {
  // Enhanced responsive spacing with mobile-first approach
  const spacingClasses = {
    tight: 'space-y-2 sm:space-y-3',
    comfortable: 'space-y-3 sm:space-y-4 md:space-y-5',
    large: 'space-y-4 sm:space-y-5 md:space-y-6'
  };

  // Enhanced loading state with skeleton
  if (loading) {
    return (
      <LinksSkeleton 
        count={3} 
        className={className}
      />
    );
  }

  // Enhanced error state
  if (error) {
    const errorType = getErrorType(error);
    
    return (
      <ErrorState
        type={errorType === 'general' ? 'linksError' : errorType}
        error={error}
        title="Failed to Load Links"
        onRetry={() => window.location.reload()}
        className={className}
        context={{
          operation: 'Load Links',
          component: 'LinkList'
        }}
      />
    );
  }

  // Enhanced empty state
  if (links.length === 0) {
    return (
      <div className={`${RESPONSIVE_PATTERNS.CARD} text-center space-y-4 sm:space-y-6`}>
        <div className="text-4xl sm:text-5xl md:text-6xl">🔗</div>
        <div className="space-y-2">
          <h3 className={RESPONSIVE_PATTERNS.SUBHEADING}>
            {emptyMessage}
          </h3>
          {emptySubtext && (
            <p className={RESPONSIVE_PATTERNS.BODY}>
              {emptySubtext}
            </p>
          )}
        </div>
        
        {/* Optional call-to-action for authenticated users */}
        <div className="pt-2">
          <p className="text-xs text-gray-400 sm:text-sm">
            Share links to let people discover your content
          </p>
        </div>
      </div>
    );
  }

  // Enhanced links display with responsive animations
  return (
    <div 
      className={`${spacingClasses[spacing]} ${className}`}
      role="list"
      aria-label={`${links.length} link${links.length === 1 ? '' : 's'}`}
    >
      {links.map((link, index) => (
        <div 
          key={link.id} 
          role="listitem"
          className={showAnimation ? `
            animate-fadeIn
            ${index < 3 ? 'animation-delay-' + (index * 100) : ''}
          ` : ''}
          style={showAnimation ? {
            animationDelay: `${index * 100}ms`,
            animationFillMode: 'both'
          } : {}}
        >
          <LinkCard
            link={link}
            onClick={onLinkClick}
            variant={variant}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          />
        </div>
      ))}

      {/* Performance optimization note for large lists */}
      {links.length > 20 && (
        <div className="pt-4 text-center">
          <p className="text-xs text-gray-400">
            Showing {links.length} links
          </p>
        </div>
      )}
    </div>
  );
};

LinkList.propTypes = {
  /** Array of link objects to display */
  links: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      url: PropTypes.string.isRequired,
      title: PropTypes.string,
      description: PropTypes.string,
    })
  ),
  /** Loading state indicator */
  loading: PropTypes.bool,
  /** Error message to display */
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  /** Message to show when no links are available */
  emptyMessage: PropTypes.string,
  /** Subtext for empty state */
  emptySubtext: PropTypes.string,
  /** Function called when a link is clicked */
  onLinkClick: PropTypes.func,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Visual variant for link cards */
  variant: PropTypes.oneOf(['default', 'compact', 'minimal']),
  /** Responsive spacing between link cards */
  spacing: PropTypes.oneOf(['tight', 'comfortable', 'large']),
  /** Whether to show entrance animations */
  showAnimation: PropTypes.bool,
};

export default LinkList;
