import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ClientList from "./client-list";

export const dynamic = "force-dynamic";

export default async function ManageClientsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const agencyId = (session?.user as any)?.agencyId;

    // 1. Fetch data on the server, scoped to this admin's own agency
    const [clients, agents] = await Promise.all([
        prisma.user.findMany({
            where: { role: "CLIENT", agencyId },
            include: { agent: { select: { name: true } } },
            orderBy: { createdAt: "desc" }
        }),
        prisma.user.findMany({
            where: { role: "AGENT", agencyId },
            select: { id: true, name: true }
        })
    ]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6" style={{ color: "#1E3A8A" }}>Manage Clients</h1>
            <ClientList initialClients={clients} agents={agents} />
        </div>
    );
}