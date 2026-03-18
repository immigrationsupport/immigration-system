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

    if (modificationMessage && modificationMessage.length > 255) {
        return { error: "Message too long. Maximum 255 characters." };
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
            // 1. Update Application status
            await tx.application.update({
                where: { id: applicationId },
                data: { status: newStatus as any }
            });

            // 2. Unlock procedures IF status is REJECTED or MODIFICATION_REQUESTED
            if (newStatus === "REJECTED" || newStatus === "MODIFICATION_REQUESTED") {
                await tx.procedure.updateMany({
                    where: { applicationId },
                    data: { 
                        isLocked: false,
                        status: newStatus === "REJECTED" ? "REJECTED" : "ACTION_REQUIRED" 
                    }
                });
            }

            // 3. Audit Log
            await tx.auditLog.create({
                data: {
                    action: "STATUS_UPDATE",
                    details: `Application ${applicationId} (${application.country}) status updated to ${newStatus} for ${application.client.name} by Agent ${session.user.name}.`,
                    userId: session.user.id,
                    targetId: applicationId
                }
            });

            // 4. System Message (Notification)
            // Ensure we have at least one procedure to attach the message to
            let procedure = await tx.procedure.findFirst({
                where: { applicationId },
                orderBy: { createdAt: "desc" }
            });

            // If no procedures exist yet, create a default one to hold the message channel
            if (!procedure) {
                procedure = await tx.procedure.create({
                    data: {
                        applicationId,
                        type: "PR", // Primary / General
                        description: "General communication about this application.",
                        status: "PENDING",
                        isLocked: false
                    }
                });
            }

            await tx.message.create({
                data: {
                    content: `SYSTEM UPDATE: Status changed to ${newStatus.replace("_", " ")}.${modificationMessage ? `\n\nMESSAGE FROM AGENT:\n${modificationMessage}` : ""}`,
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
