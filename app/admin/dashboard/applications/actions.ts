"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteApplicationAction(applicationId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "ADMIN") {
        return { error: "Unauthorized access." };
    }

    try {
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            select: { id: true }
        });

        if (!application) return { error: "Application not found." };

        await prisma.$transaction(async (tx) => {
            // Delete related documents first
            const procedures = await tx.procedure.findMany({
                where: { applicationId },
                select: { id: true }
            });
            const procedureIds = procedures.map(p => p.id);

            await tx.document.deleteMany({
                where: { procedureId: { in: procedureIds } }
            });

            // Delete messages
            await tx.message.deleteMany({
                where: { procedureId: { in: procedureIds } }
            });

            // Delete procedures
            await tx.procedure.deleteMany({
                where: { applicationId }
            });

            // Delete application
            await tx.application.delete({
                where: { id: applicationId }
            });

            // Audit Log
            await tx.auditLog.create({
                data: {
                    action: "DELETE_APPLICATION",
                    details: `Application ${applicationId} permanently deleted by Admin.`,
                    userId: session.user.id
                }
            });
        });

        revalidatePath("/admin/dashboard/applications");
        return { success: true };
    } catch (e: any) {
        console.error("Delete Error:", e);
        return { error: e.message || "Failed to delete application." };
    }
}

export async function updateApplicationAction(
    applicationId: string,
    data: {
        status?: string;
        agentId?: string | null;
        destination?: string;
    }
) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "ADMIN") {
        return { error: "Unauthorized access." };
    }

    try {
        const oldApp = await prisma.application.findUnique({
            where: { id: applicationId }
        });

        if (!oldApp) return { error: "Application not found." };

        await prisma.application.update({
            where: { id: applicationId },
            data: {
                status: data.status as any,
                agentId: data.agentId,
                country: data.destination
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: "UPDATE_APPLICATION",
                details: `Application ${applicationId} updated by Admin. Changes: ${JSON.stringify(data)}`,
                userId: session.user.id
            }
        });

        revalidatePath("/admin/dashboard/applications");
        return { success: true };
    } catch (e: any) {
        console.error("Update Error:", e);
        return { error: e.message || "Failed to update application." };
    }
}
