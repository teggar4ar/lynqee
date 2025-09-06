/**
 * useLinkReordering Hook
 * 
 * Custom hook for managing drag-and-drop link reordering
 * Handles optimistic updates, error recovery, and real-time sync
 */

import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { LinksService } from '../services';
import { useAlerts } from './useAlerts';

export const useLinkReordering = (links, onLinksUpdate) => {
  const [isDragging, setIsDragging] = useState(false);
  const [reorderingLinks, setReorderingLinks] = useState([]);
  const { showSuccess, showError } = useAlerts();

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setIsDragging(false);

    if (!over || active.id === over.id) {
      return;
    }

    try {
      // Find the original and new positions
      const oldIndex = links.findIndex(link => link.id === active.id);
      const newIndex = links.findIndex(link => link.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        console.warn('[useLinkReordering] Could not find link positions');
        return;
      }

      // Get the moved link for feedback
      const movedLink = links[oldIndex];

      // Create optimistic update
      const reorderedLinks = arrayMove(links, oldIndex, newIndex);
      
      // Update positions based on new order (1-indexed)
      const linkUpdates = reorderedLinks.map((link, index) => ({
        id: link.id,
        position: index + 1
      }));

      // Apply optimistic update immediately
      setReorderingLinks(reorderedLinks);
      if (onLinksUpdate) {
        onLinksUpdate(reorderedLinks);
      }

      // Save to backend
      const result = await LinksService.updateLinkPositions(linkUpdates);

      if (!result.success) {
        throw new Error(result.error || 'Failed to update link positions');
      }

      // Show success feedback
      showSuccess({
        title: 'Order Updated',
        message: `"${movedLink.title}" moved to position ${newIndex + 1}`,
        duration: 2000,
        position: 'bottom-center'
      });
      
      // Don't clear the reordering state immediately
      // Let the real-time updates handle the final state
      // The optimistic update will be cleared by the parent component
      // when real-time data arrives and overwrites localLinks
      
    } catch (error) {
      console.error('[useLinkReordering] Error reordering links:', error);
      
      // Revert optimistic update on error
      setReorderingLinks([]);
      if (onLinksUpdate) {
        onLinksUpdate(links); // Revert to original order
      }

      // Show error feedback
      showError({
        title: 'Reorder Failed',
        message: 'Failed to reorder links. Please try again.',
        duration: 3000,
        position: 'bottom-center'
      });
      
      console.error('Failed to reorder links. Please try again.');
    }
  };

  const handleDragCancel = () => {
    setIsDragging(false);
    setReorderingLinks([]);
  };

  return {
    isDragging,
    reorderingLinks,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};

export default useLinkReordering;
