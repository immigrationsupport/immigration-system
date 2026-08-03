// Forced rebuild to resolve import path cache
import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ApplicationTable from "./application-table";

export const dynamic = "force-dynamic";

export default async function AllApplicationsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const agencyId = (session?.user as any)?.agencyId;

    // Fetch all applications with client and agent info, scoped to this agency
    const rawApplications = await prisma.application.findMany({
        where: { agencyId },
        include: {
            client: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            agent: {
                select: {
                    id: true,
                    name: true
                }
            },
            steps: {
                select: {
                    type: true
                },
                take: 1
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    // Map database fields to the UI interface
    const applications = rawApplications.map(app => ({
        ...app,
        destination: app.country,
        type: (app as any).steps[0]?.type || "GENERAL"
    }));

    // Fetch agents for the assignment dropdown, scoped to this agency
    const agents = await prisma.user.findMany({
        where: {
            role: "AGENT",
            agencyId
        },
        select: {
            id: true,
            name: true
        },
        orderBy: {
            name: "asc"
        }
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#1E3A8A" }}>Application Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Supervise and manage all client immigration processes.</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <span className="text-blue-700 text-sm font-semibold">{applications.length} Total Applications</span>
                </div>
            </div>

            <ApplicationTable initialApplications={applications} agents={agents} />
        </div>
    );
}