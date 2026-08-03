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

    const agencyId = (session.user as any).agencyId;

    const [clients, agents] = await Promise.all([
        prisma.user.findMany({
            where: { role: "CLIENT" as any, agencyId },
            include: { agent: true }
        }),
        prisma.user.findMany({
            where: { role: "AGENT" as any, agencyId }
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

    const adminAgencyId = (session.user as any).agencyId;

    try {
        const client = await prisma.user.findUnique({
            where: { id: clientId },
            include: { applications: true }
        });

        if (!client) return { error: "Client not found." };
        if (client.agencyId !== adminAgencyId) return { error: "This client does not belong to your agency." };
        if (client.isSuspended) return { error: "Cannot assign an agent to a suspended client." };

        // Transaction to update client and all their applications
        await prisma.$transaction(async (tx) => {
            // Re-fetch agent with name
            const agent = await tx.user.findUnique({ where: { id: agentId } });
            if (!agent || agent.agencyId !== adminAgencyId) {
                throw new Error("This agent does not belong to your agency.");
            }
            const agentName = agent?.name || agentId;

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
                    details: `Agent ${agentName} assigned to Client ${client.name} (${client.email}).`,
                    userId: session.user.id,
                    agencyId: adminAgencyId,
                    targetId: clientId
                }
            });
        });

        revalidatePath("/admin/dashboard/clients");
        return { success: true };
    } catch (e: any) {
        console.error("Assignment Error:", e);
        return { error: e?.message || "An error occurred while assigning the agent." };
    }
}

export async function toggleSuspendClientAction(clientId: string, currentlySuspended: boolean) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "ADMIN") {
        return { error: "Unauthorized access." };
    }

    const adminAgencyId = (session.user as any).agencyId;

    try {
        const client = await prisma.user.findUnique({ where: { id: clientId } });
        if (!client) return { error: "Client not found." };
        if (client.agencyId !== adminAgencyId) return { error: "This client does not belong to your agency." };

        await prisma.user.update({
            where: { id: clientId },
            data: { isSuspended: !currentlySuspended }
        });

        await prisma.auditLog.create({
            data: {
                action: currentlySuspended ? "UNSUSPEND_CLIENT" : "SUSPEND_CLIENT",
                details: `Client ${client.name} (${client.email}) ${currentlySuspended ? "unsuspended" : "suspended"} by Admin.`,
                userId: session.user.id,
                agencyId: adminAgencyId,
                targetId: clientId
            }
        });

        revalidatePath("/admin/dashboard/clients");
        return { success: true };
    } catch (e: any) {
        return { error: "Failed to update suspension status." };
    }
}

export async function validateClientAction(clientId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "ADMIN") {
        return { error: "Unauthorized access." };
    }

    const adminAgencyId = (session.user as any).agencyId;

    try {
        const client = await prisma.user.findUnique({ where: { id: clientId } });
        if (!client) return { error: "Client not found." };
        if (client.agencyId !== adminAgencyId) return { error: "This client does not belong to your agency." };
        if (client.status !== "PENDING") return { error: "Client is already validated." };

        await prisma.user.update({
            where: { id: clientId },
            data: { status: "ACTIVE" }
        });

        // 5. ADMIN VALIDATION RULE
        // Automatically mark Step 1, 2, 3 -> Completed, Unlock Step 4 -> In Progress
        const applications = await prisma.application.findMany({
            where: { clientId: clientId }
        });

        for (const app of applications) {
            await prisma.applicationStep.updateMany({
               where: { applicationId: app.id, type: { in: ["REGISTRATION", "CONTRACT_SIGNING", "FEE_PAYMENT"] } },
               data: { status: "APPROVED", isLocked: false }
            });
            await prisma.applicationStep.updateMany({
               where: { applicationId: app.id, type: "DOCUMENT_COLLECTION" },
               data: { status: "IN_PROGRESS", isLocked: false }
            });
        }

        await prisma.auditLog.create({
            data: {
                action: "VALIDATE_CLIENT",
                details: `Client ${client.name} (${client.email}) was validated by Admin, fast-tracking initial steps.`,
                userId: session.user.id,
                agencyId: adminAgencyId,
                targetId: clientId
            }
        });

        revalidatePath("/admin/dashboard/clients");
        return { success: true };
    } catch (e: any) {
        return { error: "Failed to validate client." };
    }
}

export async function deleteClientAction(clientId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "ADMIN") {
        return { error: "Unauthorized access." };
    }

    const adminAgencyId = (session.user as any).agencyId;

    try {
        const client = await prisma.user.findUnique({ where: { id: clientId } });
        if (!client) return { error: "Client not found." };
        if (client.agencyId !== adminAgencyId) return { error: "This client does not belong to your agency." };

        await prisma.$transaction(async (tx) => {
            // 1. Get all application data for this client
            const applications = await tx.application.findMany({ 
                where: { clientId },
                include: { steps: { select: { id: true } } }
            });

            const applicationIds = applications.map(a => a.id);
            const stepIds = applications.flatMap(a => a.steps.map(s => s.id));

            // 2. Batch Delete associated data (Faster than loops)
            if (stepIds.length > 0) {
                await tx.message.deleteMany({ where: { procedureId: { in: stepIds } } });
                await tx.document.deleteMany({ where: { procedureId: { in: stepIds } } });
                await tx.applicationStep.deleteMany({ where: { id: { in: stepIds } } });
            }

            // 3. Clear any agent references where this user is assigned
            await tx.application.updateMany({ where: { agentId: clientId }, data: { agentId: null } });
            await tx.user.updateMany({ where: { agentId: clientId }, data: { agentId: null } });

            // 4. Delete applications
            await tx.application.deleteMany({ where: { clientId } });

            // 5. Delete user documents & messages (global)
            await tx.document.deleteMany({ where: { uploaderId: clientId } });
            await tx.message.deleteMany({ where: { senderId: clientId } });

            // 6. Delete official messages
            await tx.officialMessage.deleteMany({
                where: {
                    OR: [
                        { senderId: clientId },
                        { receiverId: clientId }
                    ]
                }
            });

            // 7. Delete Auth (Sessions/Accounts)
            await tx.session.deleteMany({ where: { userId: clientId } });
            await tx.account.deleteMany({ where: { userId: clientId } });

            // 8. Delete audit logs authored by client
            await tx.auditLog.deleteMany({ where: { userId: clientId } });

            // 9. Create Final Deletion Log
            await tx.auditLog.create({
                data: {
                    action: "DELETE_CLIENT",
                    details: `Client ${client.name} (${client.email}) was permanently deleted by Admin.`,
                    userId: session.user.id,
                    agencyId: adminAgencyId,
                    targetId: clientId
                }
            });

            // 10. Final User Deletion
            await tx.user.delete({ where: { id: clientId } });
        }, {
            timeout: 20000 // Increase timeout to 20 seconds
        });

        revalidatePath("/admin/dashboard/clients");
        return { success: true };
    } catch (e: any) {
        console.error("Delete Client Full Error:", e);
        if (e.code === 'P2003') return { error: "Foreign key constraint failed. Related data elsewhere prevents deletion." };
        if (e.code === 'P2028') return { error: "Transaction timeout: The deletion took too long. Please try again." };
        return { error: `Failed to delete client: ${e.message || "Unknown Error"}` };
    }
}