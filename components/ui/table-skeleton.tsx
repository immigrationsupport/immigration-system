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

/**
 * Skeleton for Card Grid layout (Procedure cards, Clients cards grid)
 */
export function CardsGridSkeleton({ cards = 3 }: { cards?: number }) {
    return (
        <div className="space-y-8 animate-pulse max-w-6xl mx-auto px-4 py-6">
            {/* Header placeholder */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b pb-4 border-gray-100 gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-gray-200 rounded-xl" />
                    <div className="h-4 w-40 bg-gray-100 rounded-lg" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-32 bg-gray-200 rounded-xl" />
                    <div className="h-10 w-36 bg-gray-200 rounded-xl" />
                </div>
            </div>

            {/* Search & Filter Bar placeholder */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4">
                <div className="h-12 w-full bg-gray-100 rounded-2xl" />
                <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-2">
                        <div className="h-8 w-24 bg-gray-200 rounded-xl" />
                        <div className="h-8 w-36 bg-gray-100 rounded-xl" />
                        <div className="h-8 w-40 bg-gray-100 rounded-xl" />
                    </div>
                    <div className="h-8 w-28 bg-gray-100 rounded-xl" />
                </div>
            </div>

            {/* Procedure Cards placeholder */}
            <div className="space-y-6">
                {Array.from({ length: cards }).map((_, i) => (
                    <div key={i} className="bg-white rounded-[32px] border border-gray-100 p-8 space-y-6 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-gray-200 shrink-0" />
                                <div className="space-y-2">
                                    <div className="h-3 w-28 bg-gray-100 rounded-full" />
                                    <div className="h-6 w-48 bg-gray-200 rounded-lg" />
                                </div>
                            </div>
                            <div className="h-8 w-28 bg-gray-200 rounded-full" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-28 bg-gray-50 rounded-2xl p-4 space-y-3">
                                <div className="h-3 w-20 bg-gray-200 rounded-full" />
                                <div className="h-8 w-16 bg-gray-200 rounded-lg" />
                                <div className="h-2 w-full bg-gray-200 rounded-full" />
                            </div>
                            <div className="h-28 bg-gray-50 rounded-2xl p-4 space-y-2">
                                <div className="h-3 w-24 bg-gray-200 rounded-full" />
                                <div className="h-5 w-36 bg-gray-200 rounded-lg" />
                                <div className="h-3 w-48 bg-gray-100 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Skeleton for Settings & Profile Form panels
 */
export function SettingsSkeleton() {
    return (
        <div className="space-y-8 animate-pulse max-w-6xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="pb-6 border-b border-gray-100 space-y-2">
                <div className="h-3 w-28 bg-gray-200 rounded-full" />
                <div className="h-10 w-72 bg-gray-200 rounded-2xl" />
                <div className="h-4 w-96 bg-gray-100 rounded-lg" />
            </div>

            {/* Form & Sidebar Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <div className="space-y-2">
                            <div className="h-6 w-48 bg-gray-200 rounded-lg" />
                            <div className="h-3 w-64 bg-gray-100 rounded-full" />
                        </div>
                        <div className="h-10 w-28 bg-gray-200 rounded-xl" />
                    </div>
                    <div className="space-y-4">
                        <div className="h-4 w-32 bg-gray-200 rounded-full" />
                        <div className="h-12 w-full bg-gray-100 rounded-2xl" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="h-4 w-28 bg-gray-200 rounded-full" />
                            <div className="h-12 w-full bg-gray-100 rounded-2xl" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-28 bg-gray-200 rounded-full" />
                            <div className="h-12 w-full bg-gray-100 rounded-2xl" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-36 bg-gray-200 rounded-full" />
                        <div className="h-24 w-full bg-gray-100 rounded-2xl" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 space-y-3">
                        <div className="h-8 w-8 bg-amber-200 rounded-xl" />
                        <div className="h-5 w-36 bg-amber-200 rounded-lg" />
                        <div className="h-12 w-full bg-amber-100/60 rounded-xl" />
                    </div>
                    <div className="bg-[#1E3A8A]/10 rounded-3xl p-6 space-y-3 border border-blue-100">
                        <div className="h-6 w-32 bg-blue-200 rounded-lg" />
                        <div className="h-4 w-24 bg-blue-100 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton for Billing & Subscription page
 */
export function BillingSkeleton() {
    return (
        <div className="space-y-8 animate-pulse max-w-6xl mx-auto px-4 py-6">
            <div className="space-y-2 border-b pb-6 border-gray-100">
                <div className="h-10 w-64 bg-gray-200 rounded-2xl" />
                <div className="h-4 w-80 bg-gray-100 rounded-lg" />
            </div>

            {/* Subscription Banner */}
            <div className="bg-[#1E3A8A] rounded-3xl p-8 space-y-4">
                <div className="h-6 w-40 bg-blue-400/40 rounded-lg" />
                <div className="h-10 w-60 bg-blue-300/40 rounded-xl" />
                <div className="h-4 w-72 bg-blue-400/30 rounded-full" />
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-sm">
                        <div className="h-6 w-32 bg-gray-200 rounded-lg" />
                        <div className="h-8 w-24 bg-gray-300 rounded-xl" />
                        <div className="space-y-2 pt-4">
                            <div className="h-3 w-full bg-gray-100 rounded-full" />
                            <div className="h-3 w-5/6 bg-gray-100 rounded-full" />
                            <div className="h-3 w-4/6 bg-gray-100 rounded-full" />
                        </div>
                        <div className="h-10 w-full bg-gray-200 rounded-xl mt-6" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Skeleton for Dashboard Overview (Metrics, charts, recent feed)
 */
export function DashboardOverviewSkeleton() {
    return (
        <div className="space-y-8 animate-pulse max-w-6xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center border-b pb-6 border-gray-100">
                <div className="space-y-2">
                    <div className="h-8 w-56 bg-gray-200 rounded-xl" />
                    <div className="h-4 w-40 bg-gray-100 rounded-lg" />
                </div>
                <div className="h-10 w-36 bg-gray-200 rounded-xl" />
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-xl" />
                        <div className="h-7 w-16 bg-gray-300 rounded-lg" />
                        <div className="h-3 w-28 bg-gray-100 rounded-full" />
                    </div>
                ))}
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 space-y-4">
                    <div className="h-6 w-44 bg-gray-200 rounded-lg" />
                    <div className="h-64 bg-gray-50 rounded-2xl" />
                </div>
                <div className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4">
                    <div className="h-6 w-36 bg-gray-200 rounded-lg" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />
                                <div className="space-y-1 flex-1">
                                    <div className="h-3 w-full bg-gray-200 rounded-full" />
                                    <div className="h-2 w-2/3 bg-gray-100 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
