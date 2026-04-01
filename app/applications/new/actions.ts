"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFullApplicationAction(data: {
    country: string;
    procedures: { type: string; description: string }[];
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user as any).role !== "CLIENT") {
        return { error: "Unauthorized" };
    }

    if (!data.country || data.procedures.length === 0) {
        return { error: "Country and at least one procedure are required." };
    }

    try {
        const application = await prisma.application.create({
            data: {
                country: data.country,
                clientId: session.user.id,
                status: "IN_PROGRESS",
                procedures: {
                    create: data.procedures.map(p => ({
                        type: p.type as any,
                        description: p.description,
                        status: "IN_PROGRESS",
                        isLocked: false
                    }))
                }
            },
            include: {
                procedures: true
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: "APPLICATION_CREATION",
                details: `Client ${session.user.name} created an application for ${data.country}.`,
                userId: session.user.id
            }
        });

        revalidatePath("/dashboard/client");
        return { success: true, applicationId: application.id };
    } catch (e: any) {
        console.error("Application creation error:", e);
        return { error: e.message || "Failed to create application." };
    }
}
