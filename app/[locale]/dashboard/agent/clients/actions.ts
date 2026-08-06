"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { APP_STEP_SEQUENCE } from "@/lib/steps";
import { ApplicationType } from "@prisma/client";

export async function createApplicationForClientAction(
    clientId: string,
    data: { country: string; type: string; description?: string }
) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) {
        return { error: "Unauthorized access." };
    }

    if (!data.country || !data.type) {
        return { error: "Country and application type are required." };
    }

    try {
        const isAdmin = (session.user as any).role === "ADMIN";
        const agencyId = (session.user as any).agencyId;

        // Confirm this agent/admin actually has access to this client
        const client = await prisma.user.findUnique({
            where: isAdmin ? { id: clientId, agencyId } : { id: clientId, agentId: session.user.id },
            select: { id: true, name: true, agentId: true, agencyId: true }
        });

        if (!client) {
            return { error: "Client not found or not assigned to you." };
        }

        const application = await prisma.application.create({
            data: {
                country: data.country,
                type: data.type as ApplicationType,
                clientId: client.id,
                agentId: client.agentId || session.user.id,
                agencyId: client.agencyId,
                status: "IN_PROGRESS",
                steps: {
                    create: APP_STEP_SEQUENCE.map((stepType, index) => {
                        const isFirstThree = index < 3;
                        const isStep4 = index === 3;
                        return {
                            type: stepType,
                            status: isFirstThree ? "APPROVED" : (isStep4 ? "IN_PROGRESS" : "PENDING"),
                            isLocked: isFirstThree ? false : (isStep4 ? false : true),
                            description: isFirstThree ? "Automatically verified." : (data.description || null)
                        };
                    })
                }
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                action: "APPLICATION_CREATION",
                details: `${(session.user as any).role === "ADMIN" ? "Admin" : "Agent"} ${session.user.name} created a ${data.type} application for ${data.country} on behalf of ${client.name}.`,
                userId: session.user.id,
                targetId: client.id
            }
        });

        revalidatePath(`/dashboard/agent/clients/${clientId}`);
        return { success: true, applicationId: application.id };
    } catch (e: any) {
        console.error("Agent application creation error:", e);
        return { error: e.message || "Failed to create application." };
    }
}

export async function sendOfficialMessageAction(clientId: string, subject: string, content: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) {
        return { error: "Unauthorized access." };
    }

    if (!subject || !content) {
        return { error: "Subject and content are required." };
    }

    try {
        const client = await prisma.user.findUnique({
            where: { id: clientId },
            select: { name: true }
        });

        await prisma.$transaction(async (tx) => {
            // 1. Create OfficialMessage
            await tx.officialMessage.create({
                data: {
                    subject,
                    content,
                    senderId: session.user.id,
                    receiverId: clientId,
                }
            });

            // 2. Log Action
            await tx.auditLog.create({
                data: {
                    action: "SEND_MESSAGE",
                    details: `Official message sent to ${client?.name || "client"}: "${subject}"`,
                    userId: session.user.id,
                    targetId: clientId,
                }
            });
        });

        revalidatePath(`/dashboard/agent/clients/${clientId}`);
        return { success: true };
    } catch (e: any) {
        console.error("Messaging Error:", e);
        return { error: "Failed to send official message." };
    }
}