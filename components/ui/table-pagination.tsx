"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
    page: number;
    totalItems: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
}

export function TablePagination({
    page,
    totalItems,
    pageSize = 10,
    onPageChange,
}: TablePaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    if (totalItems <= pageSize) {
        return null;
    }

    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalItems);

    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }

            return pages;
        }

        pages.push(1);

        if (page > 4) {
            pages.push("ellipsis");
        }

        const start = Math.max(2, page - 1);
        const end = Math.min(totalPages - 1, page + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (page < totalPages - 3) {
            pages.push("ellipsis");
        }

        pages.push(totalPages);

        return pages;
    };

    return (
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {startItem}–{endItem} of {totalItems}
            </p>

            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className="h-9"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((item, index) =>
                        item === "ellipsis" ? (
                            <span
                                key={`ellipsis-${index}`}
                                className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
                            >
                                …
                            </span>
                        ) : (
                            <Button
                                key={item}
                                type="button"
                                onClick={() => onPageChange(item)}
                                aria-label={`Go to page ${item}`}
                                aria-current={
                                    page === item ? "page" : undefined
                                }
                                className={`h-9 w-9 p-0 ${
                                    page === item
                                        ? "bg-primary text-primary-foreground"
                                        : ""
                                }`}
                            >
                                {item}
                            </Button>
                        )
                    )}
                </div>

                <Button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Next page"
                    className="h-9"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}