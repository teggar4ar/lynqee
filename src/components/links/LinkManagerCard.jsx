/**
 * LinkManagerCard Component
 * 
 * Enhanced link card for management interface with edit/delete actions
 * Includes drag handles, selection checkboxes, and management actions
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Edit, GripVertical, Link, MoreVertical, Trash2 } from 'lucide-react';

const LinkManagerCard = ({ 
  link, 
  position,
  showEditButton = true,
  showDeleteButton = true,
  showDragHandle = true,
  showSelection = false,
  isSelected = false,
  onEdit,
  onDelete,
  onSelect,
  dragHandleProps = null,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Calculate dropdown position when showing
  useEffect(() => {
    if (showActions && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + window.scrollY + 4, // 4px spacing
        left: buttonRect.right - 128 + window.scrollX, // 128px is dropdown width, align right
      });
    }
  }, [showActions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    const handleScroll = () => {
      if (showActions) {
        setShowActions(false);
      }
    };

    const handleResize = () => {
      if (showActions) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true); // Use capture to catch all scroll events
      window.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [showActions]);

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActions(false); // Close dropdown when edit is triggered
    if (onEdit) onEdit(link);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActions(false); // Close dropdown when delete is triggered
    if (onDelete) onDelete(link);
  };

  const handleSelect = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) onSelect(link.id);
  };

  const handleToggleActions = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActions(!showActions);
  };

  return (
    <div className={`
      relative group
      bg-white hover:bg-gray-50 
      transition-colors duration-200
      p-4
      ${className}
    `}>
      <div className="flex items-center space-x-3">
        {/* Selection Checkbox */}
        {showSelection && (
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelect}
              className="w-4 h-4 text-golden-yellow border-gray-300 rounded focus:ring-golden-yellow"
            />
          </div>
        )}

        {/* Drag Handle */}
        {showDragHandle && !showSelection && (
          <div 
            className="flex-shrink-0 cursor-move text-gray-400 hover:text-gray-600 touch-manipulation p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            {...dragHandleProps}
            style={{ 
              touchAction: 'none', // Prevent scrolling when touching drag handle
              WebkitTouchCallout: 'none', // Disable iOS callout menu
              WebkitUserSelect: 'none', // Disable text selection
              userSelect: 'none'
            }}
          >
            <GripVertical className="w-6 h-6" />
          </div>
        )}

        {/* Link Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-golden-yellow/20 rounded-lg flex items-center justify-center">
            <Link className="w-5 h-5 text-golden-yellow" />
          </div>
        </div>

        {/* Link Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {link.title}
              </h3>
              <p className="text-xs text-gray-600 truncate mt-1">
                {link.url}
              </p>
              {position && (
                <p className="text-xs text-gray-400 mt-1">
                  Position {position}
                </p>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {showEditButton && (
                <button
                  onClick={handleEdit}
                  className="p-1 text-gray-400 hover:text-golden-yellow rounded"
                  title="Edit link"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {showDeleteButton && (
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  title="Delete link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Actions Menu */}
            <div className="md:hidden">
              <button
                ref={buttonRef}
                onClick={handleToggleActions}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                aria-label="More actions"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Link Stats (if available) */}
      {link.click_count !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{link.click_count} clicks</span>
            {link.created_at && (
              <span>Added {new Date(link.created_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      )}

      {/* Portal-rendered Mobile Actions Dropdown to prevent layout shifts */}
      {showActions && typeof window !== 'undefined' && 
        createPortal(
          <div 
            ref={dropdownRef}
            className="fixed w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            {showEditButton && (
              <button
                onClick={handleEdit}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center rounded-t-lg"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
            )}
            {showDeleteButton && (
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center rounded-b-lg"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}
          </div>,
          document.body
        )
      }
    </div>
  );
};

LinkManagerCard.propTypes = {
  link: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    url: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    click_count: PropTypes.number,
    created_at: PropTypes.string,
  }).isRequired,
  position: PropTypes.number,
  showEditButton: PropTypes.bool,
  showDeleteButton: PropTypes.bool,
  showDragHandle: PropTypes.bool,
  showSelection: PropTypes.bool,
  isSelected: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
  dragHandleProps: PropTypes.object,
  className: PropTypes.string,
};

export default LinkManagerCard;
