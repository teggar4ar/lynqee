/**
 * Modal - Reusable modal component with mobile-first design
 * 
 * Features:
 * - Mobile-optimized overlay and positioning
 * - Touch-friendly close interactions
 * - Responsive sizing and spacing
 * - Accessibility support with proper focus management
 * - Animation and backdrop interactions
 */

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  headerActions = null
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Size configurations for responsive modal
  const sizeConfig = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
    full: 'max-w-full mx-4'
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement;
      
      // Focus the modal when it opens
      const focusModal = () => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      };
      
      // Delay focus to ensure modal is rendered
      const timeoutId = setTimeout(focusModal, 100);
      
      // Prevent body scroll on mobile
      document.body.style.overflow = 'hidden';
      
      return () => {
        clearTimeout(timeoutId);
        document.body.style.overflow = 'unset';
      };
    } else {
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 animate-backdrop-in" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative w-full bg-white shadow-xl modal-content
          ${sizeConfig[size]}
          
          /* Mobile-first design */
          max-h-[90vh] overflow-hidden
          rounded-t-lg
          
          /* Desktop enhancements */
          sm:rounded-lg sm:max-h-[80vh]
          
          /* Focus styling */
          focus:outline-none focus:ring-2 focus:ring-forest-green
          
          /* Animation classes */
          animate-modal-in
          
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton || headerActions) && (
          <div className="flex items-center justify-between p-4 border-b border-sage-gray/30 bg-white sticky top-0 z-10">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 
                  id="modal-title"
                  className="text-lg font-semibold text-forest-green truncate sm:text-xl"
                >
                  {title}
                </h2>
              )}
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {headerActions}
              
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    p-2 text-sage-gray hover:text-forest-green
                    rounded-lg hover:bg-mint-cream
                    transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-forest-green
                    min-w-[44px] min-h-[44px]
                  "
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="
          p-4 overflow-y-auto
          max-h-[calc(90vh-120px)] sm:max-h-[calc(80vh-120px)]
          sm:p-6
        ">
          {children}
        </div>
      </div>
    </div>
  );

  // Render modal using portal
  return createPortal(modalContent, document.body);
};

Modal.propTypes = {
  /** Whether the modal is open */
  isOpen: PropTypes.bool.isRequired,
  /** Function to call when modal should be closed */
  onClose: PropTypes.func.isRequired,
  /** Modal title (optional) */
  title: PropTypes.string,
  /** Modal content */
  children: PropTypes.node.isRequired,
  /** Size of the modal */
  size: PropTypes.oneOf(['small', 'medium', 'large', 'full']),
  /** Whether to show the close button */
  showCloseButton: PropTypes.bool,
  /** Whether clicking the backdrop closes the modal */
  closeOnBackdrop: PropTypes.bool,
  /** Whether pressing Escape closes the modal */
  closeOnEscape: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Additional header actions (buttons, etc.) */
  headerActions: PropTypes.node,
};

export default Modal;
