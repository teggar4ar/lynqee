/**
 * DraggableLink Component
 * 
 * Sortable link component using @dnd-kit for drag and drop functionality.
 * Integrates with LinkManagerCard to provide touch-optimized reordering.
 * Follows mobile-first design principles with proper touch targets.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LinkManagerCard from './LinkManagerCard.jsx';

const DraggableLink = ({
  link,
  position,
  showEditButton = true,
  showDeleteButton = true,
  showSelection = false,
  isSelected = false,
  isDragging = false,
  onEdit,
  onDelete,
  onSelect,
  onToggleVisibility,
  className = ''
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: link.id,
    // Add mobile-specific optimizations
    data: {
      type: 'link',
      link: link
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Ensure proper z-index when dragging
    zIndex: isSortableDragging ? 999 : 'auto',
    // Slightly scale when dragging for visual feedback
    scale: isSortableDragging ? 1.02 : 1,
    // Disable touch actions when dragging to prevent scrolling conflicts
    touchAction: isSortableDragging ? 'none' : 'auto',
  };

  // Combine sorting styles with visual feedback for overall drag state
  const combinedClassName = `
    ${className}
    ${isSortableDragging ? 'shadow-lg ring-2 ring-golden-yellow ring-opacity-50' : ''}
    ${isDragging && !isSortableDragging ? 'opacity-90' : ''}
    transition-all duration-200 ease-out
  `;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={combinedClassName}
      // Prevent default touch behaviors that might interfere with drag
      onTouchStart={(e) => {
        // Allow drag handle to manage touch events
        if (isSortableDragging) {
          e.preventDefault();
        }
      }}
    >
      <LinkManagerCard
        link={link}
        position={position}
        showEditButton={showEditButton}
        showDeleteButton={showDeleteButton}
        showDragHandle={true}
        showSelection={showSelection}
        isSelected={isSelected}
        onEdit={onEdit}
        onDelete={onDelete}
        onSelect={onSelect}
        onToggleVisibility={onToggleVisibility}
        dragHandleProps={{
          ...attributes,
          ...listeners,
          // Add mobile-specific touch optimizations
          style: {
            touchAction: 'none', // Prevent scrolling when touching drag handle
          }
        }}
        className="cursor-default" // Override cursor since drag handle manages it
      />
    </div>
  );
};

DraggableLink.propTypes = {
  link: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    position: PropTypes.number,
  }).isRequired,
  position: PropTypes.number.isRequired,
  showEditButton: PropTypes.bool,
  showDeleteButton: PropTypes.bool,
  showSelection: PropTypes.bool,
  isSelected: PropTypes.bool,
  isDragging: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
  onToggleVisibility: PropTypes.func,
  className: PropTypes.string,
};

export default DraggableLink;
