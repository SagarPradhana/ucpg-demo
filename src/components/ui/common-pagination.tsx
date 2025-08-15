import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface CommonPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
  disabled?: boolean;
}

const CommonPagination: React.FC<CommonPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
  showInfo = true,
  disabled = false,
}) => {
  // Calculate if buttons should be enabled
  const isPrevEnabled = currentPage > 1 && !disabled;
  const isNextEnabled = currentPage < totalPages && !disabled;

  // Handle previous page
  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPrevEnabled) {
      onPageChange(currentPage - 1);
    }
  };

  // Handle next page
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNextEnabled) {
      onPageChange(currentPage + 1);
    }
  };

  // Calculate item range for display
  const getItemRange = () => {
    if (!totalItems || !pageSize) return null;
    
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    
    return { startItem, endItem };
  };

  const itemRange = getItemRange();

  // Don't render if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("mt-4", className)}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={handlePrevious}
              className={cn(
                !isPrevEnabled && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
              aria-disabled={!isPrevEnabled}
            />
          </PaginationItem>
          
          {showInfo && (
            <PaginationItem>
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {itemRange ? (
                  <>
                    {itemRange.startItem}-{itemRange.endItem} of {totalItems} items
                    {" • "}
                  </>
                ) : null}
                Page {currentPage} of {totalPages}
              </div>
            </PaginationItem>
          )}
          
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={handleNext}
              className={cn(
                !isNextEnabled && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
              aria-disabled={!isNextEnabled}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default CommonPagination;
