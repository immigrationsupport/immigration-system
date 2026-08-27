import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import LogsTable from "./logs-table";

export const dynamic = "force-dynamic";

export default async function SystemLogsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const agencyId = (session?.user as any)?.agencyId;

    // 1. Fetch system logs for this agency only
    const logs = await prisma.auditLog.findMany({
        where: { agencyId },
        include: {
        author: true, // This populates the 'author' field in your interface
  },
        orderBy: {
            createdAt: "desc"
        }
    });

    // 2. Fetch users associated with the logs (Resilient fetch bypasses cache issues)
    const userIds = Array.from(new Set(logs.map(l => l.userId).filter(Boolean))) as string[];
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, role: true, email: true }
    });

    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    // 3. Map to UI format
    const formattedLogs = logs.map(log => ({
        id: log.id,
        logNumber: log.logNumber,
        action: log.action,
        details: log.details || "No details provided.",
        createdAt: log.createdAt,
        author: log.userId && userMap[log.userId] ? userMap[log.userId] : null
    }));

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#1E3A8A" }}>System Logs & Activity</h1>
                    <p className="text-gray-500 text-sm mt-1">Audit platform actions, agent productivity, and security events.</p>
                </div>
                <div className="bg-slate-100 flex items-center gap-3 px-4 py-2 rounded-lg border border-slate-200">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-slate-700 text-sm font-bold tracking-widest uppercase">{formattedLogs.length} Total Logs Recored</span>
                </div>
            </div>

            <LogsTable initialLogs={formattedLogs as any} />
        </div>
    );
}