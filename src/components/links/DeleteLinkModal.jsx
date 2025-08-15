/**
 * DeleteLinkModal Component
 * 
 * Confirmation dialog for deleting links with safety measures.
 * Follows existing modal patterns with mobile-first design and accessibility.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from '../common';
import LinksService from '../../services/LinksService.js';

const DeleteLinkModal = ({ 
  isOpen, 
  onClose, 
  onLinkDeleted,
  link 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle link deletion
  const handleDelete = async () => {
    if (!link) {
      setError('No link selected for deletion');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Delete the link via service
      await LinksService.deleteLink(link.id);

      // Notify parent component of successful deletion
      if (onLinkDeleted) {
        onLinkDeleted(link);
      }

      // Close modal on success
      onClose();
      
    } catch (err) {
      console.error('[DeleteLinkModal] Failed to delete link:', err);
      
      // Set user-friendly error message
      if (err.message.includes('not found') || err.message.includes('does not exist')) {
        setError('This link no longer exists. It may have already been deleted.');
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else if (err.message.includes('permission') || err.message.includes('unauthorized')) {
        setError('You do not have permission to delete this link.');
      } else {
        // Show actual error in development for debugging
        const isDevelopment = import.meta.env.DEV;
        setError(isDevelopment ? `Debug: ${err.message}` : 'Failed to delete link. Please try again.');
      }
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
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
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
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
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
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse space-y-reverse space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 pt-2">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={loading}
            disabled={loading || !link}
            className="w-full sm:w-auto min-h-[44px]"
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
