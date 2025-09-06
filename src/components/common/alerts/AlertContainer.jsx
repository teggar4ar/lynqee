/**
 * AlertContainer - Renders alerts in the UI
 * 
 * Portal-based container that manages alert positioning,
 * stacking, and animations.
 * 
 * Mobile-first approach: All non-banner alerts are positioned at top-center
 * on mobile devices for better UX, while maintaining original positions on desktop.
 */

import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Toast } from './Toast';
import { Banner } from './Banner';

/**
 * Hook to detect mobile viewport
 * @returns {boolean} True if viewport is mobile size
 */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Check for mobile viewport (< 768px, which is md breakpoint in Tailwind)
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIsMobile();

    // Listen for window resize
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

/**
 * Creates a container element for the alerts if it doesn't exist
 * @returns {HTMLElement} The container element
 */
const createAlertContainer = () => {
  let container = document.getElementById('alert-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'alert-container';
    container.className = 'fixed inset-0 z-50 pointer-events-none';
    container.style.paddingTop = 'env(safe-area-inset-top)';
    container.style.paddingBottom = 'env(safe-area-inset-bottom)';
    container.style.paddingLeft = 'env(safe-area-inset-left)';
    container.style.paddingRight = 'env(safe-area-inset-right)';
    document.body.appendChild(container);
  }
  
  return container;
};

/**
 * AlertContainer Component
 * 
 * Renders alerts in a portal with proper positioning and stacking.
 * On mobile devices, non-banner alerts are forced to top-center position
 * for better UX and readability.
 */
export const AlertContainer = ({ alerts = [], onDismiss }) => {
  const isMobile = useIsMobile();
  
  // Group alerts by position to handle stacking correctly
  // On mobile, override positions for better UX
  const alertsByPosition = useMemo(() => {
    const grouped = {};
    
    alerts.forEach(alert => {
      let position = alert.position || 'top-right';
      
      // On mobile, force non-banner alerts to top-center for better UX
      if (isMobile && !position.includes('banner')) {
        position = 'top-center';
      }
      
      if (!grouped[position]) {
        grouped[position] = [];
      }
      grouped[position].push(alert);
    });
    
    return grouped;
  }, [alerts, isMobile]);
  
  // Clean up the container when the component unmounts
  useEffect(() => {
    return () => {
      const container = document.getElementById('alert-container');
      if (container && container.childElementCount === 0) {
        document.body.removeChild(container);
      }
    };
  }, []);
  
  // If no alerts, don't render anything
  if (alerts.length === 0) {
    return null;
  }
  
  // Render alerts in a portal
  return ReactDOM.createPortal(
    <>
      {/* Top-left alerts */}
      {alertsByPosition['top-left'] && (
        <div className="absolute left-4 flex flex-col items-start gap-2 md:items-start"
             style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
          {alertsByPosition['top-left'].map(alert => renderAlert(alert, onDismiss))}
        </div>
      )}
      
      {/* Top-center alerts - Primary position for mobile */}
      {alertsByPosition['top-center'] && (
        <div className="absolute left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 flex flex-col items-center gap-2"
             style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
          {alertsByPosition['top-center'].map(alert => renderAlert(alert, onDismiss))}
        </div>
      )}
      
      {/* Top-right alerts */}
      {alertsByPosition['top-right'] && (
        <div className="absolute right-4 flex flex-col items-end gap-2 md:items-end"
             style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
          {alertsByPosition['top-right'].map(alert => renderAlert(alert, onDismiss))}
        </div>
      )}
      
      {/* Bottom-left alerts */}
      {alertsByPosition['bottom-left'] && (
        <div className="absolute left-4 flex flex-col items-start gap-2 md:items-start"
             style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {alertsByPosition['bottom-left'].map(alert => renderAlert(alert, onDismiss))}
        </div>
      )}
      
      {/* Bottom-center alerts */}
      {alertsByPosition['bottom-center'] && (
        <div className="absolute left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 flex flex-col items-center gap-2"
             style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {alertsByPosition['bottom-center'].map(alert => renderAlert(alert, onDismiss))}
        </div>
      )}
      
      {/* Bottom-right alerts */}
      {alertsByPosition['bottom-right'] && (
        <div className="absolute right-4 flex flex-col items-end gap-2 md:items-end"
             style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {alertsByPosition['bottom-right'].map(alert => renderAlert(alert, onDismiss))}
        </div>
      )}
      
      {/* Full-width banner alerts at the top */}
      {alertsByPosition['banner-top'] && (
        <div className="absolute top-0 left-0 right-0 flex flex-col items-stretch">
          {alertsByPosition['banner-top'].map(alert => renderAlert(alert, onDismiss))}
        </div>
      )}
      
      {/* Full-width banner alerts at the bottom */}
      {alertsByPosition['banner-bottom'] && (
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-stretch">
          {alertsByPosition['banner-bottom'].map(alert => renderAlert(alert, onDismiss))}
        </div>
      )}
    </>,
    createAlertContainer()
  );
};

/**
 * Render a specific alert based on its variant
 * @param {Object} alert Alert configuration
 * @param {Function} onDismiss Function to dismiss the alert
 * @returns {JSX.Element} Rendered alert component
 */
const renderAlert = (alert, onDismiss) => {
  const { variant = 'toast' } = alert;
  
  // Render different alert variants
  switch (variant) {
    case 'banner':
      return <Banner key={alert.id} alert={alert} onDismiss={onDismiss} />;
    case 'toast':
    default:
      return <Toast key={alert.id} alert={alert} onDismiss={onDismiss} />;
  }
};

AlertContainer.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
      message: PropTypes.string.isRequired,
      title: PropTypes.string,
      duration: PropTypes.number,
      variant: PropTypes.oneOf(['toast', 'banner', 'inline']),
      position: PropTypes.oneOf([
        'top-left', 'top-center', 'top-right',
        'bottom-left', 'bottom-center', 'bottom-right',
        'banner-top', 'banner-bottom'
      ]),
      dismissible: PropTypes.bool,
      icon: PropTypes.node,
      action: PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
      }),
    })
  ),
  onDismiss: PropTypes.func.isRequired,
};
