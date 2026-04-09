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
            include: { client: true }
        });

        if (!application) return { error: "Application not found." };

        await prisma.$transaction(async (tx) => {
            // Delete related documents first
            const steps = await tx.applicationStep.findMany({
                where: { applicationId },
                select: { id: true }
            });
            const stepIds = steps.map((p: any) => p.id);

            await tx.document.deleteMany({
                where: { procedureId: { in: stepIds } }
            });

            // Delete messages
            await tx.message.deleteMany({
                where: { procedureId: { in: stepIds } }
            });

            // Delete steps
            await tx.applicationStep.deleteMany({
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
                    details: `Application for ${application.client.name} (${application.country}) permanently deleted by Admin.`,
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
            where: { id: applicationId },
            include: { client: true }
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
                details: `Application for ${oldApp.client.name} updated by Admin. Changes: ${JSON.stringify(data)}`,
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

