/**
 * AddLinkModal - Modal component for adding new links
 * 
 * Features:
 * - Mobile-optimized modal design with touch-friendly interactions
 * - Form validation and error handling
 * - Optimistic UI updates with rollback capability
 * - Loading states and user feedback
 * - Integration with LinksService for data persistence
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../common';
import LinkForm from './LinkForm';
import { LinksService } from '../../services';
import { useAuth } from '../../hooks/useAuth';

const AddLinkModal = ({
  isOpen,
  onClose,
  onLinkAdded,
  existingLinksCount = 0,
  className = ''
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate next position for the new link
  const getNextPosition = () => {
    return existingLinksCount + 1;
  };

  // Handle form submission
  const handleSubmit = async (formData) => {
    if (!user) {
      setError('You must be logged in to add links');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare link data
      const linkData = {
        user_id: user.id,
        title: formData.title,
        url: formData.url,
        position: getNextPosition()
      };

      // Create the link via service
      const newLink = await LinksService.createLink(linkData);

      // Notify parent component of successful creation
      if (onLinkAdded) {
        onLinkAdded(newLink);
      }

      // Close modal on success
      onClose();
      
    } catch (err) {
      console.error('[AddLinkModal] Failed to create link:', err);
      
      // Set user-friendly error message
      if (err.message.includes('duplicate') || err.message.includes('unique')) {
        setError('A link with this URL already exists');
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        // Show actual error in development for debugging
        const isDevelopment = import.meta.env.DEV;
        setError(isDevelopment ? `Debug: ${err.message}` : 'Failed to add link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (loading) return; // Prevent closing while saving
    
    setError('');
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    if (loading) return; // Prevent cancel while saving
    
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Link"
      size="medium"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      className={className}
    >
      <div className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="
            p-3 bg-red-50 border border-red-200 rounded-lg
            text-sm text-red-700
          ">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="
          p-3 bg-blue-50 border border-blue-200 rounded-lg
          text-sm text-blue-700
        ">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium mb-1">Adding Link #{existingLinksCount + 1}</p>
              <p>This link will appear at the bottom of your profile. You can reorder links later.</p>
            </div>
          </div>
        </div>

        {/* Link Form */}
        <LinkForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          submitLabel="Add Link"
          cancelLabel="Cancel"
        />
      </div>
    </Modal>
  );
};

AddLinkModal.propTypes = {
  /** Whether the modal is open */
  isOpen: PropTypes.bool.isRequired,
  /** Function to call when modal should be closed */
  onClose: PropTypes.func.isRequired,
  /** Function called when a link is successfully added */
  onLinkAdded: PropTypes.func,
  /** Number of existing links (for position calculation) */
  existingLinksCount: PropTypes.number,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default AddLinkModal;
