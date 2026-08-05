"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { APP_STEP_SEQUENCE } from "@/lib/steps";
import { ApplicationType } from "@prisma/client";

export async function createFullApplicationAction(data: {
    country: string;
    type: string;
    description: string;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "CLIENT") {
        return { error: "Unauthorized" };
    }

    const agencyId = (session.user as any).agencyId;
    if (!agencyId) {
        return { error: "Your account is not linked to an agency." };
    }

    if (!data.country || !data.type) {
        return { error: "Country and application type are required." };
    }

    try {
        const application = await prisma.application.create({
            data: {
                country: data.country,
                type: data.type as ApplicationType,
                clientId: session.user.id,
                agencyId,
                status: "IN_PROGRESS",
                steps: {
                    create: APP_STEP_SEQUENCE.map((stepType, index) => {
                        const isFirstThree = index < 3;
                        const isStep4 = index === 3;
                        return {
                            type: stepType,
                            status: isFirstThree ? "APPROVED" : (isStep4 ? "IN_PROGRESS" : "PENDING"),
                            isLocked: isFirstThree ? false : (isStep4 ? false : true),
                            description: isFirstThree ? "Automatically verified." : null
                        };
                    })
                }
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: "APPLICATION_CREATION",
                details: `Client ${session.user.name} created a ${data.type} application for ${data.country}.`,
                userId: session.user.id,
                agencyId
            }
        });

        revalidatePath("/dashboard/client");
        return { success: true, applicationId: application.id };
    } catch (e: any) {
        console.error("Application creation error:", e);
        return { error: e.message || "Failed to create application." };
    }
}