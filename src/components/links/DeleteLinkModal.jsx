/**
 * DeleteLinkModal Component
 * 
 * Confirmation dialog for deleting links with safety measures.
 * Follows existing modal patterns with mobile-first design and accessibility.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, Link } from 'lucide-react';
import { Button, ErrorDisplay, Modal } from '../common';
import LinksService from '../../services/LinksService.js';
import { useAlerts } from '../../hooks';
import { getContextualErrorMessage } from '../../utils/errorUtils';

const DeleteLinkModal = ({ 
  isOpen, 
  onClose, 
  onLinkDeleted,
  link 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useAlerts();

  // Handle link deletion
  const handleDelete = async () => {
    if (!link) {
      setError('No link selected for deletion');
      showError({
        title: 'Cannot Delete Link',
        message: 'No link selected for deletion',
        duration: 3000,
        position: 'bottom-center'
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Delete the link via service
      const result = await LinksService.deleteLink(link.id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete link');
      }

      // Show success notification
      showSuccess({
        title: 'Link Deleted',
        message: `"${link.title}" has been removed from your profile`,
        duration: 3000,
        position: 'bottom-center'
      });

      // Notify parent component of successful deletion
      if (onLinkDeleted) {
        onLinkDeleted(link);
      }

      // Close modal on success
      onClose();
      
    } catch (err) {
      console.error('[DeleteLinkModal] Failed to delete link:', err);
      
      // Use centralized error handling with context
      const errorMessage = getContextualErrorMessage(err, 'link');
      setError(errorMessage);
      
      // Show error alert
      showError({
        title: 'Failed to Delete Link',
        message: errorMessage,
        duration: 5000,
        position: 'bottom-center'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (loading) return; // Prevent closing while deleting
    
    setError('');
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    if (loading) return; // Prevent cancel while deleting
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Link"
      size="medium"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
    >
      <div className="space-y-4">
        
        {/* Warning Content */}
        <div className="
          p-4 bg-red-50 border border-red-200 rounded-lg
          text-sm
        ">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 mb-1">Permanent Deletion</p>
              <p className="text-red-700">This action cannot be undone. The link will be permanently removed from your profile.</p>
            </div>
          </div>
        </div>

        {/* Link Preview */}
        {link && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-golden-yellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Link className="w-5 h-5 text-golden-yellow" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {link.title || 'Untitled Link'}
                </h3>
                <p className="text-xs text-gray-600 truncate mt-1">
                  {link.url}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <ErrorDisplay 
            error={error} 
            showIcon={true}
          />
        )}

        {/* Action Buttons */}
        <div className="flex flex-row space-x-3 pt-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="
              flex-1
              py-3
              text-base
              min-h-[44px]
            "
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={loading}
            disabled={loading || !link}
            className="
              flex-1
              py-3
              text-base
              min-h-[44px]
            "
          >
            {loading ? 'Deleting...' : 'Delete Link'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

DeleteLinkModal.propTypes = {
  /** Whether the modal is open */
  isOpen: PropTypes.bool.isRequired,
  /** Function to call when modal should be closed */
  onClose: PropTypes.func.isRequired,
  /** Function to call when a link is successfully deleted */
  onLinkDeleted: PropTypes.func,
  /** Link object to delete */
  link: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    url: PropTypes.string.isRequired,
  }),
};

export default DeleteLinkModal;
