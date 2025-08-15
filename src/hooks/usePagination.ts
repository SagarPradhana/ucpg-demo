import { useState, useMemo, useCallback } from "react";

interface UsePaginationProps {
  initialPage?: number;
  pageSize?: number;
  totalItems?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  getItemRange: () => { startItem: number; endItem: number } | null;
  reset: () => void;
}

export const usePagination = ({
  initialPage = 1,
  pageSize: initialPageSize = 10,
  totalItems: initialTotalItems = 0,
}: UsePaginationProps = {}): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(initialTotalItems);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);

  // Calculate if navigation is possible
  const canGoNext = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  const canGoPrevious = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  // Safe page navigation
  const goToPage = useCallback((page: number) => {
    const safePage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(safePage);
  }, [totalPages]);

  // Navigation functions
  const goToNextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [canGoNext]);

  const goToPreviousPage = useCallback(() => {
    if (canGoPrevious) {
      setCurrentPage(prev => prev - 1);
    }
  }, [canGoPrevious]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  // Get current item range
  const getItemRange = useCallback(() => {
    if (totalItems === 0) return null;
    
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    
    return { startItem, endItem };
  }, [currentPage, pageSize, totalItems]);

  // Reset pagination to initial state
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
    setTotalItems(initialTotalItems);
  }, [initialPage, initialPageSize, initialTotalItems]);

  // Update page size and reset to first page
  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  }, []);

  // Update total items and adjust current page if necessary
  const handleSetTotalItems = useCallback((total: number) => {
    setTotalItems(total);
    const newTotalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [currentPage, pageSize]);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    setCurrentPage: goToPage,
    setPageSize: handleSetPageSize,
    setTotalItems: handleSetTotalItems,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    canGoNext,
    canGoPrevious,
    getItemRange,
    reset,
  };
};
