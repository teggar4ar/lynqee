/**
 * PageSizeSelector - Component for selecting pagination page size
 * 
 * Features:
 * - Mobile-optimized custom dropdown for page size selection
 * - Common page size options (5, 10, 20, 50)
 * - Consistent styling with app theme (matches action dropdown design)
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';

const PageSizeSelector = ({
  currentPageSize,
  onPageSizeChange,
  options = [5, 10, 20, 50],
  totalItems,
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isPositionCalculated, setIsPositionCalculated] = useState(false);

  // Don't show if there are no items
  if (totalItems === 0) {
    return null;
  }

  // Calculate dropdown position when showing
  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 112; // Updated dropdown width (w-28 = 7rem = 112px)
      
      // Calculate position relative to viewport
      let top = buttonRect.bottom + 4; // 4px spacing
      let left = buttonRect.left; // Align left
      
      // Ensure dropdown doesn't go off-screen on the right
      const maxLeft = window.innerWidth - dropdownWidth - 8;
      if (left > maxLeft) {
        left = maxLeft;
      }
      
      // Ensure dropdown doesn't go off-screen on the left
      if (left < 8) {
        left = 8;
      }
      
      // Ensure dropdown doesn't go off-screen on the bottom
      const dropdownHeight = options.length * 44 + 8; // More accurate height calculation
      if (top + dropdownHeight > window.innerHeight) {
        top = buttonRect.top - dropdownHeight - 4; // Show above instead
      }
      
      setDropdownPosition({ top, left });
      setIsPositionCalculated(true);
    } else {
      setIsPositionCalculated(false);
    }
  }, [showDropdown, options.length]);

  // Close dropdown when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    const handleScroll = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    const handleResize = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
      document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
      document.addEventListener('touchmove', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('touchmove', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [showDropdown]);

  const handleOptionSelect = (size) => {
    onPageSizeChange(size);
    setShowDropdown(false);
  };

  return (
    <div className={`flex items-center space-x-3 text-sm ${className}`}>
      <span className="text-gray-600 whitespace-nowrap hidden sm:inline font-medium">
        Show:
      </span>
      
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setShowDropdown(!showDropdown)}
          className="
            flex items-center justify-between bg-white border border-gray-200 rounded-lg
            px-3 py-2 text-sm font-medium text-gray-700
            focus:outline-none focus:ring-2 focus:ring-forest-green/20 focus:border-forest-green
            transition-all duration-200
            cursor-pointer hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm
            min-h-[36px] min-w-[70px] sm:min-w-[80px]
            shadow-sm
          "
          aria-label="Select number of items per page"
          aria-expanded={showDropdown}
        >
          <span className="font-medium">{currentPageSize}</span>
          <ChevronDown className={`w-4 h-4 text-gray-500 ml-2 transition-transform duration-200 ${
            showDropdown ? 'rotate-180' : ''
          }`} />
        </button>
      </div>
      
      <span className="text-gray-600 whitespace-nowrap font-medium">
        <span className="hidden sm:inline">per page</span>
        <span className="sm:hidden">/page</span>
      </span>

      {/* Portal-rendered dropdown to match action dropdown design */}
      {showDropdown && isPositionCalculated && typeof window !== 'undefined' && 
        createPortal(
          <div 
            ref={dropdownRef}
            className="fixed w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] py-1 
                       transform transition-all duration-150 ease-out opacity-100 scale-100"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            {options.map((size, index) => (
              <button
                key={size}
                onClick={() => handleOptionSelect(size)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm transition-all duration-150
                  flex items-center justify-between group
                  ${size === currentPageSize 
                    ? 'bg-forest-green/8 text-forest-green font-medium border-l-2 border-forest-green' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${index === 0 ? 'rounded-t-lg' : ''}
                  ${index === options.length - 1 ? 'rounded-b-lg' : ''}
                `}
              >
                <span className="font-medium">{size}</span>
                {size === currentPageSize && (
                  <div className="w-1.5 h-1.5 bg-forest-green rounded-full opacity-80" />
                )}
              </button>
            ))}
          </div>,
          document.body
        )
      }
    </div>
  );
};

PageSizeSelector.propTypes = {
  currentPageSize: PropTypes.number.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.number),
  totalItems: PropTypes.number.isRequired,
  className: PropTypes.string
};

export default PageSizeSelector;
