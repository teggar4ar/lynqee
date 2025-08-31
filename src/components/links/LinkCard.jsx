import React from 'react';
import PropTypes from 'prop-types';
import { RESPONSIVE_PATTERNS, TOUCH_TARGETS } from '../../utils/mobileUtils';

/**
 * LinkCard Component
 * 
 * A touch-optimized link display component with mobile-first responsive design.
 * Features click tracking, accessibility compliance, and enhanced visual feedback.
 * Follows iOS/Android touch target guidelines with minimum 44x44px touch areas.
 */
const LinkCard = ({ 
  link, 
  onClick,
  trackClick = true,
  className = '',
  variant = 'default', // 'default', 'compact', 'minimal'
  showIcon = true,
  showUrl = true
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const handleClick = (e) => {
    // Call custom onClick handler if provided
    if (onClick) {
      onClick(link, e);
    }

    // Track click event (future analytics implementation)
    if (trackClick) {
      // Future: implement click tracking with proper analytics service
      // Example: AnalyticsService.trackLinkClick(link.id, link.url);
    }
  };

  const handleTouchStart = () => {
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  // Variant-specific styles with enhanced mobile-first approach
  const variantStyles = {
    default: {
      container: `
        p-4 
        sm:p-5 
        ${TOUCH_TARGETS.COMFORTABLE}
        bg-white 
        border-2 
        border-gray-200 
        rounded-xl 
        shadow-sm
      `,
      title: 'text-base font-semibold text-gray-900 sm:text-lg',
      url: 'text-sm text-gray-500 mt-2 sm:text-base'
    },
    compact: {
      container: `
        p-3 
        sm:p-4 
        ${TOUCH_TARGETS.MIN}
        bg-gray-50 
        border 
        border-gray-200 
        rounded-lg
      `,
      title: 'text-sm font-medium text-gray-900 sm:text-base',
      url: 'text-xs text-gray-500 mt-1 sm:text-sm'
    },
    minimal: {
      container: `
        p-2 
        sm:p-3 
        ${TOUCH_TARGETS.MIN}
        bg-transparent 
        border-b 
        border-gray-100 
        rounded-none
      `,
      title: 'text-sm font-medium text-gray-900',
      url: 'text-xs text-gray-500 mt-1'
    }
  };

  const currentStyle = variantStyles[variant];

  // Enhanced visual feedback states
  const interactionClasses = `
    group
    transition-all
    duration-200
    ease-out
    hover:border-gray-300
    hover:shadow-md
    hover:scale-[1.02]
    active:scale-[0.98]
    focus:outline-none
    focus:ring-2
    focus:ring-golden-yellow
    focus:ring-offset-2
    focus:border-golden-yellow
    ${isPressed ? 'scale-[0.98] shadow-sm' : ''}
    ${variant === 'default' ? 'hover:bg-gray-50' : ''}
    ${variant === 'compact' ? 'hover:bg-gray-100' : ''}
    ${variant === 'minimal' ? 'hover:bg-gray-50' : ''}
  `;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={`
        block 
        w-full 
        ${currentStyle.container}
        ${interactionClasses}
        ${className}
      `}
      aria-label={`Visit ${link.title || link.url}`}
      role="button"
    >
      <div className="flex items-start justify-between min-h-0">
        <div className="flex-1 min-w-0 space-y-1">
          {/* Link Title */}
          <div className={`
            ${currentStyle.title}
            group-hover:text-gray-800
            leading-snug
            ${variant === 'minimal' ? 'truncate' : ''}
          `}>
            {link.title || link.url}
          </div>
          
          {/* Link URL (conditional display) */}
          {showUrl && link.title && link.title !== link.url && (
            <div className={`
              ${currentStyle.url}
              truncate
              group-hover:text-gray-600
              transition-colors
            `}>
              {link.url}
            </div>
          )}
          
          {/* Optional link description */}
          {link.description && variant === 'default' && (
            <div className="text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
              {link.description}
            </div>
          )}
        </div>
        
        {/* External link icon */}
        {showIcon && (
          <div className="ml-3 flex-shrink-0">
            <svg 
              className={`
                w-4 
                h-4 
                sm:w-5 
                sm:h-5
                text-gray-400 
                group-hover:text-gray-600 
                group-hover:translate-x-1
                transition-all
                duration-200
              `}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
          </div>
        )}
      </div>

      {/* Optional preview or metadata */}
      {link.click_count && variant === 'default' && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-400">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            {link.click_count} {link.click_count === 1 ? 'click' : 'clicks'}
          </div>
        </div>
      )}
    </a>
  );
};

LinkCard.propTypes = {
  /** Link object containing id, url, title, and optional metadata */
  link: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    url: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    click_count: PropTypes.number,
  }).isRequired,
  /** Custom click handler function */
  onClick: PropTypes.func,
  /** Whether to track click events for analytics */
  trackClick: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Visual variant of the link card */
  variant: PropTypes.oneOf(['default', 'compact', 'minimal']),
  /** Whether to show the external link icon */
  showIcon: PropTypes.bool,
  /** Whether to show the URL when title is different */
  showUrl: PropTypes.bool,
};

export default LinkCard;
