/**
 * Toast Component - Individual toast notification
 * 
 * Renders a single toast notification with proper styling,
 * animations, accessibility, and touch interactions.
 */

import React, { useEffect, useRef, useState } from 'react';
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
const toastStyles = {
  success: {
    background: 'bg-mint-cream',
    border: 'border-forest-green/20',
    text: 'text-forest-green',
    progress: 'bg-forest-green',
    icon: <CheckCircle className="w-5 h-5 text-forest-green" />,
  },
  error: {
    background: 'bg-coral-pink/20',
    border: 'border-coral-red/30',
    text: 'text-coral-red',
    progress: 'bg-coral-red',
    icon: <XCircle className="w-5 h-5 text-coral-red" />,
  },
  warning: {
    background: 'bg-yellow/10',
    border: 'border-golden-yellow/30',
    text: 'text-golden-yellow',
    progress: 'bg-golden-yellow',
    icon: <AlertTriangle className="w-5 h-5 text-golden-yellow" />,
  },
  info: {
    background: 'bg-gray-50',
    border: 'border-sage-gray/30',
    text: 'text-sage-gray',
    progress: 'bg-sage-gray',
    icon: <Info className="w-5 h-5 text-sage-gray" />,
  },
};

/**
 * Toast Component
 * 
 * Displays a notification with various visual states and interactions
 */
export const Toast = ({ 
  alert: { 
    id, 
    type = 'info', 
    message, 
    title, 
    duration = 5000, 
    dismissible = true, 
    icon: customIcon, 
    action,
    position
  }, 
  onDismiss 
}) => {
  
  // State for controlling animation
  const [isExiting, setIsExiting] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStart = useRef(null);
  const touchStartTime = useRef(null);
  const styles = toastStyles[type];
  
  // Focus management
  const toastRef = useRef(null);
  const shouldFocus = useRef(true);
  
  // Handle auto-dismiss progress bar
  const [progress, setProgress] = useState(100);
  const animationRef = useRef(null);
  const startTime = useRef(Date.now());
  
  /**
   * Focus management - focus the alert when it appears for screen readers
   * Only focus error alerts automatically, others can be focused manually
   */
  useEffect(() => {
    if (type === 'error' && shouldFocus.current && toastRef.current) {
      // Small delay to ensure the toast is rendered and positioned
      const focusTimer = setTimeout(() => {
        toastRef.current?.focus();
        shouldFocus.current = false;
      }, 100);
      
      return () => clearTimeout(focusTimer);
    }
  }, [type]);

  /**
   * Animate the progress bar if duration > 0
   */
  useEffect(() => {
    if (duration > 0) {
      startTime.current = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime.current;
        const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(newProgress);
        
        if (newProgress > 0) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [duration]);
  
  /**
   * Handle dismissal with exit animation
   */
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 300); // Match transition duration
  };
  
  /**
   * Trigger haptic feedback if available (iOS Safari, Android Chrome)
   * @param {string} type Type of haptic feedback
   */
  const triggerHapticFeedback = (type = 'light') => {
    if (navigator.vibrate) {
      // Android haptic feedback via vibration
      const patterns = {
        light: [10],
        medium: [15],
        heavy: [25]
      };
      navigator.vibrate(patterns[type] || patterns.light);
    } else if (window.navigator && window.navigator.vibrate) {
      // Alternative vibration API
      window.navigator.vibrate(50);
    }
    
    // iOS haptic feedback (requires user gesture)
    if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
      // This is iOS 13+ with proper haptic support
      // Note: This requires user gesture and permission
      try {
        if (window.Taptic && window.Taptic.vibrate) {
          window.Taptic.vibrate();
        }
      } catch {
        // Haptic feedback not available
      }
    }
  };

  /**
   * Handle action button click
   */
  const handleActionClick = (e) => {
    e.stopPropagation();
    action.onClick();
  };

  /**
   * Handle touch/swipe interactions
   */
  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    
    // Light haptic feedback on touch start
    triggerHapticFeedback('light');
  };
  
  const handleTouchMove = (e) => {
    if (touchStart.current !== null) {
      const touchX = e.touches[0].clientX;
      const diff = touchX - touchStart.current;
      
      // Allow swiping in one direction (right-to-left on right side, left-to-right on left side)
      // This is based on the position of the toast
      
      if (position.includes('right') && diff < 0) {
        setSwipeOffset(diff);
      } else if (position.includes('left') && diff > 0) {
        setSwipeOffset(diff);
      }
    }
  };
  
  const handleTouchEnd = () => {
    const threshold = 100; // px to trigger dismiss
    
    if (Math.abs(swipeOffset) > threshold) {
      // Medium haptic feedback on successful dismiss
      triggerHapticFeedback('medium');
      handleDismiss();
    } else {
      setSwipeOffset(0);
    }
    
    touchStart.current = null;
  };
  
  // Determine if the toast should show a title
  const showTitle = Boolean(title);
  
  // Determine icon to display
  const iconToShow = customIcon || styles.icon;
  
  return (
    <div
      ref={toastRef}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-labelledby={title ? `toast-title-${id}` : undefined}
      aria-describedby={`toast-message-${id}`}
      tabIndex={type === 'error' ? 0 : -1}
      className={`
        ${styles.background} ${styles.border} ${styles.text}
        shadow-md rounded-lg border 
        w-full md:w-80 max-w-sm
        pointer-events-auto
        transform transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-2 
        ${type === 'success' ? 'focus:ring-forest-green' : ''}
        ${type === 'error' ? 'focus:ring-coral-red' : ''}
        ${type === 'warning' ? 'focus:ring-golden-yellow' : ''}
        ${type === 'info' ? 'focus:ring-sage-gray' : ''}
        ${isExiting ? 
          (position?.includes('right') ? 'translate-x-full opacity-0' : 
           position?.includes('left') ? '-translate-x-full opacity-0' : 
           'translate-y-2 opacity-0') : 
          'translate-y-0 translate-x-0 opacity-100'
        }
      `}
      style={swipeOffset ? { transform: `translateX(${swipeOffset}px)` } : {}}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 h-1 w-full bg-gray-200 rounded-t-lg overflow-hidden">
          <div 
            className={`h-full ${styles.progress}`} 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <div className="p-4 flex gap-3 items-start">
        {/* Icon */}
        {iconToShow && (
          <div className="flex-shrink-0 mt-0.5">
            {iconToShow}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 pt-0.5">
          {/* Title */}
          {showTitle && (
            <h3 id={`toast-title-${id}`} className="font-medium mb-1">
              {title}
            </h3>
          )}
          
          {/* Message */}
          <p id={`toast-message-${id}`} className="text-sm">
            {message}
          </p>
          
          {/* Action button if provided */}
          {action && (
            <div className="mt-2">
              <button 
                onClick={handleActionClick}
                className={`
                  text-sm font-medium hover:underline focus:outline-none focus:ring-2
                  focus:ring-offset-2 rounded
                  ${type === 'success' ? 'text-forest-green focus:ring-forest-green' : ''}
                  ${type === 'error' ? 'text-coral-red focus:ring-coral-red' : ''}
                  ${type === 'warning' ? 'text-golden-yellow focus:ring-golden-yellow' : ''}
                  ${type === 'info' ? 'text-sage-gray focus:ring-sage-gray' : ''}
                `}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
        
        {/* Dismiss button */}
        {dismissible && (
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              // Light haptic feedback on button press
              triggerHapticFeedback('light');
              handleDismiss();
            }}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center 
                      rounded-full hover:bg-black/5 focus:outline-none 
                      focus:ring-2 focus:ring-offset-2 focus:ring-sage-gray"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

Toast.propTypes = {
  alert: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
    message: PropTypes.string.isRequired,
    title: PropTypes.string,
    duration: PropTypes.number,
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
