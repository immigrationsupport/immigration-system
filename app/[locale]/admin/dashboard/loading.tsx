import { StatsSkeleton, TableSkeleton } from "@/components/ui/table-skeleton";

export default function Loading() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
            {/* Page title */}
            <div className="h-8 w-64 bg-gray-200 rounded-xl" />
            {/* Stat cards */}
            <StatsSkeleton cards={4} />
            {/* Recent activity table */}
            <TableSkeleton rows={6} cols={4} showToolbar={false} />
        </div>
    );
}