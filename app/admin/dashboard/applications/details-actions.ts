"use server";

import prisma from "@/lib/prisma";

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
                procedures: {
                    include: {
                        documents: {
                            orderBy: {
                                uploadedAt: "desc"
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        }) as any;

        if (!app) return { error: "Application not found." };

        const mappedApp = {
            ...app,
            destination: app.country,
            type: app.procedures[0]?.type || "GENERAL"
        };

        return { success: true, application: mappedApp };
    } catch (e: any) {
        return { error: e.message || "Failed to fetch details" };
    }
}
