import React from "react";

interface TableSkeletonProps {
    /** Number of fake rows to show */
    rows?: number;
    /** Number of columns (widths cycle through a preset pattern) */
    cols?: number;
    /** Show a header row skeleton */
    showHeader?: boolean;
    /** Show the toolbar (search + button) placeholder */
    showToolbar?: boolean;
}

const COL_WIDTHS = [
    "w-2/5",
    "w-1/6",
    "w-1/6",
    "w-1/6",
    "w-1/6",
    "w-1/12",
];

/**
 * Drop-in shimmer skeleton while async table data is loading.
 *
 * Usage:
 *   {isLoading ? <TableSkeleton rows={8} cols={5} /> : <MyTable ... />}
 */
export function TableSkeleton({
    rows = 7,
    cols = 5,
    showHeader = true,
    showToolbar = true,
}: TableSkeletonProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
            {/* Toolbar placeholder */}
            {showToolbar && (
                <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
                    <div className="h-9 w-44 bg-gray-200 rounded-xl" />
                    <div className="h-9 w-28 bg-gray-200 rounded-xl" />
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    {showHeader && (
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                {Array.from({ length: cols }).map((_, ci) => (
                                    <th key={ci} className="px-6 py-4 text-left">
                                        <div
                                            className={`h-2.5 bg-gray-300 rounded-full ${
                                                COL_WIDTHS[ci % COL_WIDTHS.length]
                                            }`}
                                        />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    <tbody>
                        {Array.from({ length: rows }).map((_, ri) => (
                            <tr
                                key={ri}
                                className="border-b border-gray-50 last:border-0"
                                style={{ opacity: 1 - ri * (0.7 / rows) }}
                            >
                                {Array.from({ length: cols }).map((_, ci) => (
                                    <td key={ci} className="px-6 py-4">
                                        {ci === 0 ? (
                                            /* First col: avatar + two lines */
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-gray-200 shrink-0" />
                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    <div className="h-3 w-3/4 bg-gray-200 rounded-full" />
                                                    <div className="h-2 w-1/2 bg-gray-100 rounded-full" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className={`h-3 bg-gray-200 rounded-full ${
                                                    COL_WIDTHS[ci % COL_WIDTHS.length]
                                                }`}
                                            />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination placeholder */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <div className="h-3 w-32 bg-gray-200 rounded-full" />
                <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-8 w-8 bg-gray-200 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Lightweight stat-card skeleton for the overview grid.
 */
export function StatsSkeleton({ cards = 4 }: { cards?: number }) {
    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 animate-pulse">
            {Array.from({ length: cards }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-xl" />
                    <div className="h-7 w-1/2 bg-gray-200 rounded-lg" />
                    <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
                </div>
            ))}
        </div>
    );
}
