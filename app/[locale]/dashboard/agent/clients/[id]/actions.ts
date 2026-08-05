"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function completeClientProfileAction(clientId: string, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) {
        return { error: "Unauthorized access." };
    }

    const agencyId = (session.user as any).agencyId;

    const dateOfBirth = formData.get("dateOfBirth") as string;
    const nationality = formData.get("nationality") as string;
    const maritalStatus = formData.get("maritalStatus") as string;
    const numberOfChildren = parseInt(formData.get("numberOfChildren") as string || "0");
    const address = formData.get("address") as string;
    const phoneNumber = formData.get("phoneNumber") as string;

    if (!dateOfBirth || !nationality || !maritalStatus || !address) {
        return { error: "All fields are required." };
    }

    try {
        const client = await prisma.user.findUnique({ where: { id: clientId } });
        if (!client) return { error: "Client not found." };
        if (client.agencyId !== agencyId) return { error: "This client does not belong to your agency." };

        await prisma.user.update({
            where: { id: clientId },
            data: {
                dateOfBirth: new Date(dateOfBirth),
                nationality,
                maritalStatus: maritalStatus as any,
                numberOfChildren,
                address,
                phoneNumber: phoneNumber || null,
                profileCompleted: true
            }
        });

        await prisma.auditLog.create({
            data: {
                action: "PROFILE_UPDATE",
                details: `Profile for client ${client.name} completed by ${session.user.name}.`,
                userId: session.user.id,
                agencyId,
                targetId: clientId
            }
        });

        revalidatePath(`/dashboard/agent/clients/${clientId}`);
        return { success: true };
    } catch (e: any) {
        console.error("Profile completion error:", e);
        return { error: e.message || "An error occurred while updating the profile." };
    }
}