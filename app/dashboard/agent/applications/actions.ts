"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateApplicationStatusAction(
    applicationId: string,
    newStatus: string,
    modificationMessage?: string
) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "AGENT") {
        return { error: "Unauthorized access." };
    }

    try {
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { client: true }
        });

        if (!application) return { error: "Application not found." };
        if (application.agentId !== session.user.id && application.client.agentId !== session.user.id) {
            return { error: "You are not assigned to this application." };
        }

        // Transaction for status update, log, and notification
        await prisma.$transaction(async (tx) => {
            // 1. Update status
            await tx.application.update({
                where: { id: applicationId },
                data: { status: newStatus as any }
            });

            // 1.5 Unlock procedures if rejection or modification requested
            if (newStatus === "REJECTED" || newStatus === "MODIFICATION_REQUESTED") {
                await tx.procedure.updateMany({
                    where: { applicationId },
                    data: { isLocked: false }
                });
            }

            // 2. Audit Log
            await tx.auditLog.create({
                data: {
                    action: "STATUS_UPDATE",
                    details: `Application ${applicationId} updated to ${newStatus} by Agent.`,
                    userId: session.user.id,
                }
            });

            // 3. System Message (Notification)
            let procedure = await tx.procedure.findFirst({
                where: { applicationId }
            });

            if (!procedure) {
                procedure = await tx.procedure.create({
                    data: {
                        applicationId,
                        type: "PR" as any, // Default fallback
                        description: "General communication about this application."
                    }
                });
            }

            await tx.message.create({
                data: {
                    content: `System Update: Status changed to ${newStatus}.${modificationMessage ? `\nNote: ${modificationMessage}` : ""}`,
                    procedureId: procedure.id,
                    senderId: session.user.id
                }
            });
        });

        revalidatePath("/dashboard/agent/applications");
        return { success: true };
    } catch (e: any) {
        console.error("Status Update Error:", e);
        return { error: e.message || "Failed to update status." };
    }
}
