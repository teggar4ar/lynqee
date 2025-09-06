/**
 * EditLinkModal - Modal component for editing existing links
 * 
 * Features:
 * - Mobile-optimized modal design with touch-friendly interactions
 * - Form validation and error handling
 * - Optimistic UI updates with rollback capability
 * - Loading states and user feedback
 * - Integration with LinksService for data persistence
 * - Conflict detection and handling
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Edit } from 'lucide-react';
import { ErrorDisplay, Modal } from '../common';
import LinkForm from './LinkForm';
import { LinksService } from '../../services';
import { useAlerts, useAuth } from '../../hooks';
import { getContextualErrorMessage } from '../../utils/errorUtils';

const EditLinkModal = ({
  isOpen,
  onClose,
  onLinkUpdated,
  link,
  existingLinks = [], // Array of existing links for duplicate checking
  className = ''
}) => {
  const { user } = useAuth();
  const { showSuccess, showInfo } = useAlerts();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Add local error state for service-level errors

  // Handle form submission
  const handleSubmit = async (formData) => {
    // Clear any previous errors
    setError(null);
    
    if (!user) {
      setError('You must be logged in to edit links');
      return;
    }

    if (!link) {
      setError('No link selected for editing');
      return;
    }

    setLoading(true);

    try {
      // Prepare update data - only include changed fields
      const updateData = {};
      const changedFields = [];
      
      if (formData.title !== link.title) {
        updateData.title = formData.title;
        changedFields.push('title');
      }
      
      if (formData.url !== link.url) {
        updateData.url = formData.url;
        changedFields.push('URL');
      }

      // If no changes were made, show info message and close
      if (Object.keys(updateData).length === 0) {
        showInfo({
          title: 'No Changes',
          message: 'No changes were made to this link.',
          duration: 2000,
          position: 'bottom-center'
        });
        onClose();
        return;
      }

      // Update the link via service
      const result = await LinksService.updateLink(link.id, updateData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to update link');
      }

      // Show success notification with what was changed
      showSuccess({
        title: 'Link Updated',
        message: `Successfully updated ${changedFields.join(' and ')} for "${formData.title}"`,
        duration: 3000,
        position: 'bottom-center'
      });

      // Notify parent component of successful update
      if (onLinkUpdated) {
        onLinkUpdated(result.data);
      }

      // Close modal on success
      onClose();
      
    } catch (err) {
      console.error('[EditLinkModal] Failed to update link:', err);
      
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

  // Prepare initial form data from the link
  const initialFormData = link ? {
    title: link.title || '',
    url: link.url || ''
  } : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Link"
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
            <Edit className="w-5 h-5 text-golden-yellow flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1 text-forest-green">Editing Link</p>
              <p>Make your changes below. The position of this link will remain the same.</p>
            </div>
          </div>
        </div>

        {/* Link Form */}
        {link && (
          <LinkForm
            initialData={initialFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            submitLabel="Update Link"
            cancelLabel="Cancel"
            existingLinks={existingLinks}
            currentLinkId={link.id}
          />
        )}

        {/* No Link Selected State */}
        {!link && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">
              No link selected for editing
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

EditLinkModal.propTypes = {
  /** Whether the modal is open */
  isOpen: PropTypes.bool.isRequired,
  /** Function called when modal should close */
  onClose: PropTypes.func.isRequired,
  /** Function called when link is successfully updated */
  onLinkUpdated: PropTypes.func,
  /** Link object to edit */
  link: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    position: PropTypes.number,
    user_id: PropTypes.string,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
  }),
  /** Array of existing links for duplicate checking */
  existingLinks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    url: PropTypes.string,
  })),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default EditLinkModal;
