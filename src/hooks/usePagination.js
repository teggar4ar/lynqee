/**
 * usePagination - Custom hook for pagination functionality
 * 
 * Features:
 * - Pagination state management
 * - Page calculation and navigation
 * - Mobile-first approach
 * - Responsive items per page
 */

import { useState, useMemo, useCallback } from 'react';

const usePagination = (data = [], initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Calculate pagination data
  const paginationData = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = data.slice(startIndex, endIndex);

    return {
      currentItems,
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages
    };
  }, [data, currentPage, itemsPerPage]);

  // Navigation functions
  const goToPage = useCallback((page) => {
    const validPage = Math.max(1, Math.min(page, paginationData.totalPages));
    setCurrentPage(validPage);
  }, [paginationData.totalPages]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);
  
  const goToLastPage = useCallback(() => {
    goToPage(paginationData.totalPages);
  }, [goToPage, paginationData.totalPages]);
  
  const goToNextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [goToPage, currentPage]);
  
  const goToPreviousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [goToPage, currentPage]);

  // Reset pagination when data changes significantly
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Change items per page and reset to first page
  const changeItemsPerPage = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  return {
    ...paginationData,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
    changeItemsPerPage
  };
};

export default usePagination;
