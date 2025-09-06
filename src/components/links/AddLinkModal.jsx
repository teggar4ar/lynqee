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
import { Info } from 'lucide-react';
import { ErrorDisplay, Modal } from '../common';
import LinkForm from './LinkForm';
import { LinksService } from '../../services';
import { useAlerts, useAuth } from '../../hooks';
import { getContextualErrorMessage } from '../../utils/errorUtils';

const AddLinkModal = ({
  isOpen,
  onClose,
  onLinkAdded,
  existingLinksCount = 0,
  existingLinks = [], // Array of existing links for duplicate checking
  className = ''
}) => {
  const { user } = useAuth();
  const { showSuccess } = useAlerts();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Add local error state for service-level errors

  // Calculate next position for the new link
  const getNextPosition = () => {
    return existingLinksCount + 1;
  };

  // Handle form submission
  const handleSubmit = async (formData) => {
    // Clear any previous errors
    setError(null);
    
    if (!user) {
      setError('You must be logged in to add links');
      return;
    }

    setLoading(true);

    try {
      // Prepare link data
      const linkData = {
        user_id: user.id,
        title: formData.title,
        url: formData.url,
        position: getNextPosition()
      };

      // Create the link via service
      const result = await LinksService.createLink(linkData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create link');
      }

      // Show success notification
      showSuccess({
        title: 'Link Added',
        message: `"${formData.title}" has been added to your profile!`,
        duration: 3000,
        position: 'bottom-center'
      });

      // Notify parent component of successful creation
      if (onLinkAdded) {
        onLinkAdded(result.data);
      }

      // Close modal on success
      onClose();
      
    } catch (err) {
      console.error('[AddLinkModal] Failed to create link:', err);
      
      // Use centralized error handling with context
      const errorMessage = getContextualErrorMessage(err, 'link');
      
      // Set local error state for inline display
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (loading) return; // Prevent closing while saving
    setError(null); // Clear errors when closing
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    if (loading) return; // Prevent cancel while saving
    setError(null); // Clear errors when canceling
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
        {/* Service-level error display */}
        {error && (
          <ErrorDisplay 
            error={error} 
            className="mb-4"
            showDetails={false}
          />
        )}

        {/* Help Text */}
        <div className="
          p-3 bg-mint-cream border border-golden-yellow/30 rounded-lg
          text-sm text-sage-gray
        ">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-golden-yellow flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1 text-forest-green">
                Adding Link #{existingLinksCount + 1}
              </p>
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
          existingLinks={existingLinks}
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
  /** Array of existing links for duplicate checking */
  existingLinks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    url: PropTypes.string,
  })),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default AddLinkModal;
