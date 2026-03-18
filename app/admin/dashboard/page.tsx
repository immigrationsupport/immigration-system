import React, { Suspense } from "react";
import { Users, Briefcase, FileText, Activity, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import AdminStats from "@/components/dashboard/AdminStats";
import { ActivityItem } from "@/components/dashboard/ActivityItem";


export const dynamic = "force-dynamic";

export default async function AdminDashboardOverview() {
    // 1. Fetch statistics
    const [totalClients, totalAgents, totalApplications, statusGroups] = await Promise.all([
        prisma.user.count({ where: { role: "CLIENT" } }),
        prisma.user.count({ where: { role: "AGENT" } }),
        prisma.application.count(),
        prisma.application.groupBy({
            by: ["status"],
            _count: {
                _all: true,
            },
        }),
    ]);

    // 2. Fetch recent activities (Resilient Fetch to bypass stale cache issues)
    const logs = await prisma.auditLog.findMany({
        take: 10,
        orderBy: {
            createdAt: "desc",
        }
    });

    // Manually fetch authors for these logs to bypass 'include' validation bugs
    const userIds = Array.from(new Set(logs.map(l => l.userId).filter(Boolean))) as string[];
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, role: true }
    });

    const userMap = Object.fromEntries(users.map(u => [u.id, u]));
    const recentLogs = logs.map(log => ({
        ...log,
        author: log.userId ? userMap[log.userId] : null
    }));

    // 3. Format status counts
    const countsByStatus = {
        PENDING: 0,
        IN_REVIEW: 0,
        APPROVED: 0,
        REJECTED: 0,
        COMPLETED: 0,
    };

    statusGroups.forEach((group) => {
        if (group.status in countsByStatus) {
            (countsByStatus as any)[group.status] = group._count._all;
        }
    });


    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6 pt-0">
            <Suspense fallback={<div className="h-32 w-full bg-gray-50 animate-pulse rounded-xl mb-8"></div>}>
                <AdminStats />
            </Suspense>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                {/* Applications by Status */}
                <div className="bg-white shadow-sm border border-gray-100 p-6" style={{ borderRadius: "12px" }}>
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                        <Activity className="h-5 w-5 text-[#1E3A8A]" />
                        <h2 className="text-lg font-bold text-gray-900">Application Pipeline</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 transition-colors hover:bg-white">
                            <div className="flex items-center gap-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-slate-400"></div>
                                <span className="text-sm font-semibold text-gray-600">Pending Review</span>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-900 text-xs font-black">{countsByStatus.PENDING}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-blue-50 bg-opacity-40 rounded-lg border border-blue-100 transition-colors hover:bg-white">
                            <div className="flex items-center gap-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                                <span className="text-sm font-semibold text-blue-800">In Review</span>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-white border border-blue-200 text-blue-900 text-xs font-black">{countsByStatus.IN_REVIEW}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-emerald-50 bg-opacity-40 rounded-lg border border-emerald-100 transition-colors hover:bg-white">
                            <div className="flex items-center gap-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                                <span className="text-sm font-semibold text-emerald-800">Approved</span>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-white border border-emerald-200 text-emerald-900 text-xs font-black">{countsByStatus.APPROVED}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-red-50 bg-opacity-40 rounded-lg border border-red-100 transition-colors hover:bg-white">
                            <div className="flex items-center gap-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                                <span className="text-sm font-semibold text-red-800">Rejected</span>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-white border border-red-200 text-red-900 text-xs font-black">{countsByStatus.REJECTED}</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white shadow-sm border border-gray-100 p-6" style={{ borderRadius: "12px" }}>
                    <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-[#1E3A8A]" />
                            <h2 className="text-lg font-bold text-gray-800">Live Activity Feed</h2>
                        </div>
                    </div>

                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {recentLogs.length > 0 ? (
                            recentLogs.map((log) => (
                                <ActivityItem 
                                    key={log.id} 
                                    log={log as any} 
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-100">
                                <Activity className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-sm text-gray-400 font-medium">No recent activity pulse detected.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
