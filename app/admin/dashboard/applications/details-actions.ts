"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getApplicationDetails(applicationId: string) {
    try {
        const app = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        dateOfBirth: true,
                        nationality: true,
                        maritalStatus: true,
                        phoneNumber: true,
                        address: true
                    }
                },
                agent: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                steps: {
                    include: {
                        Document: {
                            orderBy: {
                                uploadedAt: "desc"
                            }
                        }
                    },
                    orderBy: {
                        updatedAt: "asc"
                    }
                }
            }
        }) as any;

        if (!app) return { error: "Application not found." };

        const mappedApp = {
            ...app,
            destination: app.country,
            type: app.steps[0]?.type || "GENERAL"
        };

        return { success: true, application: mappedApp };
    } catch (e: any) {
        return { error: e.message || "Failed to fetch details" };
    }
}

export async function unlockApplication(applicationId: string) {
    try {
        await prisma.application.update({
            where: { id: applicationId },
            data: { status: "IN_PROGRESS" }
        });

        await prisma.applicationStep.updateMany({
            where: { applicationId },
            data: { isLocked: false }
        });

        revalidatePath("/admin/dashboard/applications");
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to unlock application." };
    }
}

export async function validateApplication(applicationId: string) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        const app = await prisma.application.update({
            where: { id: applicationId },
            data: { status: "VALIDATED" },
            include: { client: true }
        });

        await prisma.applicationStep.updateMany({
            where: { applicationId },
            data: { isLocked: true }
        });

        if (app.client && session?.user?.id) {
            await prisma.officialMessage.create({
                data: {
                    subject: "Application Validated",
                    content: "Your application has been successfully validated.",
                    receiverId: app.client.id,
                    senderId: session.user.id,
                }
            });
            await prisma.auditLog.create({
                data: {
                    action: "APPLICATION_VALIDATED",
                    details: `Application ${applicationId} validated. Notification sent to ${app.client.email}.`,
                    userId: session.user.id
                }
            });
        }

        revalidatePath("/admin/dashboard/applications");
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Failed to validate application." };
    }
}
