"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClientsAndAgents() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const [clients, agents] = await Promise.all([
        prisma.user.findMany({
            where: { role: "CLIENT" as any },
            include: { agent: true }
        }),
        prisma.user.findMany({
            where: { role: "AGENT" as any }
        })
    ]);

    return { clients, agents };
}

export async function assignAgentToClientAction(clientId: string, agentId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "ADMIN") {
        return { error: "Unauthorized access." };
    }

    try {
        const client = await prisma.user.findUnique({
            where: { id: clientId },
            include: { applications: true }
        });

        if (!client) return { error: "Client not found." };
        if (client.isSuspended) return { error: "Cannot assign an agent to a suspended client." };

        // Transaction to update client and all their applications
        await prisma.$transaction(async (tx) => {
            // Update client
            await tx.user.update({
                where: { id: clientId },
                data: { agentId }
            });

            // Update all client's current applications to the new agent
            await tx.application.updateMany({
                where: { clientId },
                data: { agentId }
            });

            // Insert AuditLog
            await tx.auditLog.create({
                data: {
                    action: "ASSIGN_AGENT",
                    details: `Agent ${agentId} assigned to Client ${client.name} (${client.email}).`,
                    userId: session.user.id,
                }
            });

            // Create system message for the agent (Notification)
            // Note: Since messages require a procedure, and a client might have multiple, 
            // we'll log it in AuditLog as the primary "notification" for now, 
            // or create a procedure if one exists.

            // Re-fetch client with agent name
            const agent = await tx.user.findUnique({ where: { id: agentId } });
            console.log(`[Notification] ${agent?.name || agentId} assigned to ${client.name}`);
        });

        revalidatePath("/admin/dashboard/clients");
        return { success: true };
    } catch (e: any) {
        console.error("Assignment Error:", e);
        return { error: "An error occurred while assigning the agent." };
    }
}

export async function toggleSuspendClientAction(clientId: string, currentlySuspended: boolean) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "ADMIN") {
        return { error: "Unauthorized access." };
    }

    try {
        await prisma.user.update({
            where: { id: clientId },
            data: { isSuspended: !currentlySuspended }
        });

        await prisma.auditLog.create({
            data: {
                action: currentlySuspended ? "UNSUSPEND_CLIENT" : "SUSPEND_CLIENT",
                details: `Client ${clientId} ${currentlySuspended ? "unsuspended" : "suspended"} by Admin.`,
                userId: session.user.id,
            }
        });

        revalidatePath("/admin/dashboard/clients");
        return { success: true };
    } catch (e: any) {
        return { error: "Failed to update suspension status." };
    }
}
