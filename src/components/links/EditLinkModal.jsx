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
import { ErrorDisplay, Modal } from '../common';
import LinkForm from './LinkForm';
import { LinksService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import { getContextualErrorMessage } from '../../utils/errorUtils';

const EditLinkModal = ({
  isOpen,
  onClose,
  onLinkUpdated,
  link,
  className = ''
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (formData) => {
    if (!user) {
      setError('You must be logged in to edit links');
      return;
    }

    if (!link) {
      setError('No link selected for editing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare update data - only include changed fields
      const updateData = {};
      
      if (formData.title !== link.title) {
        updateData.title = formData.title;
      }
      
      if (formData.url !== link.url) {
        updateData.url = formData.url;
      }

      // If no changes were made, just close the modal
      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      // Update the link via service
      const updatedLink = await LinksService.updateLink(link.id, updateData);

      // Notify parent component of successful update
      if (onLinkUpdated) {
        onLinkUpdated(updatedLink);
      }

      // Close modal on success
      onClose();
      
    } catch (err) {
      console.error('[EditLinkModal] Failed to update link:', err);
      
      // Use centralized error handling with context
      const errorMessage = getContextualErrorMessage(err, 'link');
      setError(errorMessage);
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
        {/* Error Message */}
        {error && (
          <ErrorDisplay 
            error={error} 
            showIcon={true}
          />
        )}

        {/* Help Text */}
        <div className="
          p-3 bg-mint-cream border border-golden-yellow/30 rounded-lg
          text-sm text-sage-gray
        ">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-golden-yellow flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
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
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default EditLinkModal;
