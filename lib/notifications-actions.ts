"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireStaff() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !["AGENT", "ADMIN"].includes((session.user as any).role)) return null;
    return session;
}

export async function getMyNotificationsAction() {
    const session = await requireStaff();
    if (!session) return { error: "Unauthorized access." };

    try {
        const [notifications, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: "desc" },
                take: 20,
            }),
            prisma.notification.count({
                where: { userId: session.user.id, isRead: false },
            }),
        ]);

        return { success: true, notifications, unreadCount };
    } catch (e: any) {
        console.error("Get notifications error:", e);
        return { error: "Failed to load notifications." };
    }
}

export async function markNotificationReadAction(id: string) {
    const session = await requireStaff();
    if (!session) return { error: "Unauthorized access." };

    try {
        await prisma.notification.updateMany({
            where: { id, userId: session.user.id },
            data: { isRead: true },
        });
        return { success: true };
    } catch (e: any) {
        console.error("Mark notification read error:", e);
        return { error: "Failed to update the notification." };
    }
}

export async function markAllNotificationsReadAction() {
    const session = await requireStaff();
    if (!session) return { error: "Unauthorized access." };

    try {
        await prisma.notification.updateMany({
            where: { userId: session.user.id, isRead: false },
            data: { isRead: true },
        });
        return { success: true };
    } catch (e: any) {
        console.error("Mark all notifications read error:", e);
        return { error: "Failed to update notifications." };
    }
}

/**
 * Called from submitIntakeFormAction — notifies the client's assigned
 * agent (if any) and every admin at the agency, so nothing falls through
 * the cracks even when no agent has been assigned yet.
 */
export async function notifyIntakeFormSubmitted(clientId: string, clientName: string) {
    try {
        const client = await prisma.user.findUnique({
            where: { id: clientId },
            select: { agentId: true, agencyId: true },
        });
        if (!client?.agencyId) return;

        const admins = await prisma.user.findMany({
            where: { agencyId: client.agencyId, role: "ADMIN" },
            select: { id: true },
        });

        const recipientIds = new Set<string>(admins.map((a) => a.id));
        if (client.agentId) recipientIds.add(client.agentId);

        const message = `${clientName} a soumis son formulaire de renseignement.`;

        await prisma.notification.createMany({
            data: Array.from(recipientIds).map((userId) => ({
                userId,
                type: "INTAKE_FORM_SUBMITTED",
                message,
                clientId,
            })),
        });
    } catch (e: any) {
        // Notification failures shouldn't block the client's submission.
        console.error("Notify intake form submitted error:", e);
    }
}