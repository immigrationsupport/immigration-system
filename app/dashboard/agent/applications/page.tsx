import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ApplicationList from "./application-list";

export const dynamic = "force-dynamic";

export default async function AssignedApplicationsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "AGENT") {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500 font-medium">Please sign in as an agent to view your applications.</p>
            </div>
        );
    }

    // 1. Fetch applications for this agent
    const applications = await prisma.application.findMany({
        where: {
            OR: [
                { agentId: session.user.id },
                { client: { agentId: session.user.id } }
            ]
        },
        include: {
            client: {
                select: {
                    name: true,
                    email: true
                }
            },
            steps: {
                include: {
                    Document: true
                }
            }
        },
        orderBy: {
            updatedAt: "desc"
        }
    });

    return (
        <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b pb-4 border-gray-100">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#1E3A8A" }}>Agent Workspace</h1>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Manage & Update Assigned Applications</p>
                </div>
                <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100 flex items-center gap-2">
                    <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    {applications.length} Active Applications
                </div>
            </div>

            <ApplicationList initialApplications={applications} />
        </div>
    );
}
