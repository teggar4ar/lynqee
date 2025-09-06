/**
 * Pagination - Mobile-first pagination component
 * 
 * Features:
 * - Mobile-optimized design with touch-friendly buttons
 * - Responsive page number display            <button
              onClick={onNextPage}
              disabled={!hasNextPage}
              className={`
                p-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px]
                flex items-center justify-center
                ${!hasNextPage
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-forest-green hover:bg-forest-green/10 active:bg-forest-green/20'
                }
              `}stent theming with the app's color scheme
 * - Accessible navigation controls
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import PageSizeSelector from './PageSizeSelector';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  hasNextPage,
  hasPreviousPage,
  isFirstPage,
  isLastPage,
  onPageChange,
  onFirstPage,
  onLastPage,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  className = ''
}) => {
  // Don't show pagination if there's no data at all
  if (totalItems === 0) {
    return null;
  }

  // Show navigation controls only when there are multiple pages
  const showNavigation = totalPages > 1;

  // Calculate visible page range for desktop
  const getVisiblePages = () => {
    const delta = 1; // Show 1 page before and after current page
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    range.push(1);

    // Add pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Always show last page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Remove duplicates and sort
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    // Add dots between non-consecutive pages
    for (let i = 0; i < uniqueRange.length; i++) {
      if (i === 0) {
        rangeWithDots.push(uniqueRange[i]);
      } else if (uniqueRange[i] - uniqueRange[i - 1] === 1) {
        rangeWithDots.push(uniqueRange[i]);
      } else {
        rangeWithDots.push('...');
        rangeWithDots.push(uniqueRange[i]);
      }
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  // Calculate current item range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`bg-white border-t border-gray-100 ${className}`}>
      {/* Mobile-first layout */}
      <div className="px-4 py-3">
        {/* Top row: Page size selector and items info */}
        <div className="flex items-center justify-between mb-3">
          <PageSizeSelector
            currentPageSize={itemsPerPage}
            onPageSizeChange={onPageSizeChange}
            totalItems={totalItems}
            className="flex-shrink-0"
          />
          
          <div className="text-sm text-gray-600 text-right">
            {startItem}-{endItem} of {totalItems}
          </div>
        </div>

        {/* Navigation controls - only show when there are multiple pages */}
        {showNavigation && (
          <div className="flex items-center justify-between">
            {/* Previous controls */}
            <div className="flex items-center space-x-1">
            <button
              onClick={onFirstPage}
              disabled={isFirstPage}
              className={`
                p-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px]
                flex items-center justify-center
                ${isFirstPage
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-forest-green hover:bg-forest-green/10 active:bg-forest-green/20'
                }
              `}
              aria-label="Go to first page"
              title="First page"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={onPreviousPage}
              disabled={!hasPreviousPage}
              className={`
                p-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px]
                flex items-center justify-center
                ${!hasPreviousPage
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-forest-green hover:bg-forest-green/10 active:bg-forest-green/20'
                }
              `}
              aria-label="Go to previous page"
              title="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Page numbers - responsive display */}
          <div className="flex items-center space-x-1">
            {/* Mobile: Show only current page */}
            <div className="block sm:hidden">
              <span className="px-3 py-2 text-sm font-medium text-forest-green bg-forest-green/10 rounded-lg">
                {currentPage} of {totalPages}
              </span>
            </div>

            {/* Desktop: Show page numbers */}
            <div className="hidden sm:flex items-center space-x-1">
              {visiblePages.map((page, index) => (
                page === '...' ? (
                  <span
                    key={`dots-${index}`}
                    className="px-2 py-2 text-gray-400 text-sm"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      min-h-[36px] min-w-[36px] flex items-center justify-center
                      ${page === currentPage
                        ? 'bg-forest-green text-white shadow-sm'
                        : 'text-gray-600 hover:text-forest-green hover:bg-forest-green/10 active:bg-forest-green/20'
                      }
                    `}
                    aria-label={`Go to page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Next controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onNextPage}
              disabled={hasNextPage === false}
              className={`
                p-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px]
                flex items-center justify-center
                ${!hasNextPage
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-forest-green hover:bg-forest-green/10 active:bg-forest-green/20'
                }
              `}
              aria-label="Go to next page"
              title="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={onLastPage}
              disabled={isLastPage}
              className={`
                p-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px]
                flex items-center justify-center
                ${isLastPage
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-forest-green hover:bg-forest-green/10 active:bg-forest-green/20'
                }
              `}
              aria-label="Go to last page"
              title="Last page"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
  hasPreviousPage: PropTypes.bool.isRequired,
  isFirstPage: PropTypes.bool.isRequired,
  isLastPage: PropTypes.bool.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onFirstPage: PropTypes.func.isRequired,
  onLastPage: PropTypes.func.isRequired,
  onNextPage: PropTypes.func.isRequired,
  onPreviousPage: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default Pagination;
