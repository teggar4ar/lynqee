/**
 * Banner Component - Full-width page alerts
 * 
 * Renders a banner notification that spans the full width
 * of the page with proper styling and accessibility.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  AlertTriangle,
  CheckCircle, 
  Info, 
  X, 
  XCircle 
} from 'lucide-react';

/**
 * Type-based style configurations
 */
const bannerStyles = {
  success: {
    background: 'bg-mint-cream',
    border: 'border-forest-green/20',
    text: 'text-forest-green',
    icon: <CheckCircle className="w-5 h-5 text-forest-green" />,
  },
  error: {
    background: 'bg-coral-pink/20',
    border: 'border-coral-red/30',
    text: 'text-coral-red',
    icon: <XCircle className="w-5 h-5 text-coral-red" />,
  },
  warning: {
    background: 'bg-yellow/10',
    border: 'border-golden-yellow/30',
    text: 'text-golden-yellow',
    icon: <AlertTriangle className="w-5 h-5 text-golden-yellow" />,
  },
  info: {
    background: 'bg-gray-50',
    border: 'border-sage-gray/30',
    text: 'text-sage-gray',
    icon: <Info className="w-5 h-5 text-sage-gray" />,
  },
};

/**
 * Banner Component
 * 
 * Displays a full-width notification banner
 */
export const Banner = ({ alert, onDismiss }) => {
  const {
    id,
    type = 'info',
    title,
    message,
    dismissible = true,
    icon: customIcon,
    action,
    position,
  } = alert;
  
  // State for controlling animation
  const [isExiting, setIsExiting] = useState(false);
  const styles = bannerStyles[type];
  
  /**
   * Handle dismissal with exit animation
   */
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 300); // Match transition duration
  };
  
  // Determine if the banner should show a title
  const showTitle = Boolean(title);
  
  // Determine which icon to show
  const iconToShow = customIcon || styles.icon;
  
  // Determine if the banner is at the top or bottom
  const isTop = position === 'banner-top';
  
  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`
        ${styles.background} ${styles.border} ${styles.text}
        border-l-0 border-r-0 
        ${isTop ? 'border-t-0' : 'border-b-0'}
        w-full
        pointer-events-auto
        transform transition-all duration-300
        ${isExiting ? 
          (isTop ? '-translate-y-full' : 'translate-y-full') + ' opacity-0' : 
          'translate-y-0 opacity-100'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center flex-1 min-w-0">
            {/* Icon */}
            {iconToShow && (
              <div className="flex-shrink-0 mr-3">
                {iconToShow}
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              {showTitle && (
                <h3 className="font-medium">
                  {title}
                </h3>
              )}
              
              {/* Message */}
              <p className={`text-sm ${showTitle ? 'mt-1' : ''}`}>
                {message}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-4 ml-4">
            {/* Action button if provided */}
            {action && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className={`
                  text-sm font-medium px-4 py-1.5 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${type === 'success' ? 'bg-forest-green/10 text-forest-green hover:bg-forest-green/20 focus:ring-forest-green' : ''}
                  ${type === 'error' ? 'bg-coral-red/10 text-coral-red hover:bg-coral-red/20 focus:ring-coral-red' : ''}
                  ${type === 'warning' ? 'bg-golden-yellow/10 text-golden-yellow hover:bg-golden-yellow/20 focus:ring-golden-yellow' : ''}
                  ${type === 'info' ? 'bg-sage-gray/10 text-sage-gray hover:bg-sage-gray/20 focus:ring-sage-gray' : ''}
                `}
              >
                {action.label}
              </button>
            )}
            
            {/* Dismiss button */}
            {dismissible && (
              <button
                type="button"
                aria-label="Dismiss"
                onClick={handleDismiss}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center 
                          rounded-full hover:bg-black/5 focus:outline-none 
                          focus:ring-2 focus:ring-offset-2 focus:ring-sage-gray"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Banner.propTypes = {
  alert: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
    message: PropTypes.string.isRequired,
    title: PropTypes.string,
    dismissible: PropTypes.bool,
    icon: PropTypes.node,
    action: PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    }),
    position: PropTypes.string,
  }).isRequired,
  onDismiss: PropTypes.func.isRequired,
};
