/**
 * LinkManagerCard Component
 * 
 * Enhanced link card for management interface with edit/delete actions
 * Includes drag handles, selection checkboxes, and management actions
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

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
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);

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
          <div className="flex-shrink-0 cursor-move text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </div>
        )}

        {/* Link Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-golden-yellow/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-golden-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {showDeleteButton && (
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  title="Delete link"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            {/* Mobile Actions Menu */}
            <div className="md:hidden relative">
              <button
                onClick={handleToggleActions}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {/* Mobile Actions Dropdown */}
              {showActions && (
                <div className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {showEditButton && (
                    <button
                      onClick={handleEdit}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  )}
                  {showDeleteButton && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              )}
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

      {/* Close mobile actions when clicking outside */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
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
  className: PropTypes.string,
};

export default LinkManagerCard;
